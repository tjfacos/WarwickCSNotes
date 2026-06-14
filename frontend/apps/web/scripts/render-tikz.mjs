// TikZ pre-render pipeline. Drives a real LaTeX engine
// (MiKTeX/TeX Live `latex` → `dvisvgm`) so we get full math/Unicode support
// (`\in`, `\Sigma`, UTF-8 in source) and clean glyph rendering.
//
// `scripts/render-tikz-tikzjax.mjs` is preserved as a backup that uses
// `node-tikzjax`'s WASM-ported kernel — it doesn't require LaTeX on PATH
// but has known DVI→SVG glyph-mapping bugs (e.g. `\in` renders as `2`,
// `\Sigma` as `§`) and crashes the tokenizer on UTF-8 bytes. Use the
// backup if a build host doesn't have a real LaTeX install (`npm run
// tikz:tikzjax`).
//
// Both pipelines use the same hash scheme and `themeSvg` post-processor,
// so cached SVGs from either engine are interchangeable URL-wise — but
// the SVG bytes themselves differ (different font handling, different
// glyph quality). To migrate between engines, `npm run tikz:clean` first.
//
// Requires `latex` and `dvisvgm` on PATH. On Windows, MiKTeX bundles both.

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..", "..");
const PREAMBLE_PATH = join(__dirname, "..", "src", "tikz-preamble.tex");
const RESOURCES_DIR = join(REPO_ROOT, "Data", "Resources");
const OUT_DIR = join(RESOURCES_DIR, "Images", "tikz");

const PREAMBLE = readFileSync(PREAMBLE_PATH, "utf8").replace(/\r/g, "");

if (process.env.SKIP_TIKZ_PRERENDER === "1") {
  console.log("SKIP_TIKZ_PRERENDER=1 — skipping tikz pre-render.");
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });

function walkMarkdown(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walkMarkdown(p));
    else if (name.endsWith(".md")) out.push(p);
  }
  return out;
}

// Same tidy as the tikzjax pipeline — strip CR / &nbsp; / blockquote `> `,
// trim every line, drop empties. Identical bytes both sides so hashes match
// across pipelines, which lets us swap engines without churning every SVG.
function tidyTikzSource(source) {
  return source
    .replace(/\r/g, "")
    .replace(/&nbsp;/g, "")
    .split("\n")
    .map((l) => l.replace(/^>\s?/, "").trim())
    .filter((l) => l.length > 0)
    .join("\n");
}

function hashOf(s) {
  return createHash("sha256").update(s).digest("hex").slice(0, 16);
}

// Same post-processing as the tikzjax pipeline — black strokes/text become
// `currentColor` so they pick up the theme's foreground, gray!10 fills get
// routed through `var(--tikz-fill)`. dvisvgm emits attributes with single
// quotes (vs node-tikzjax's double quotes) and rounds `gray!10` to #f2f2f2
// (vs #f3f3f3), so the regexes accept both flavours.
function themeSvg(svg) {
  svg = svg.replaceAll(
    /stroke=(["'])(?:#000|#000000|black)\1/g,
    'class="tikz-arrow" stroke="currentColor"',
  );
  svg = svg.replaceAll(
    /fill=(["'])(?:#000|#000000|black)\1/g,
    'class="tikz-arrow" fill="currentColor"',
  );
  svg = svg.replaceAll(
    /fill=(["'])#f[23]f[23]f[23]\1/g,
    'class="tikz-fill" fill="var(--tikz-fill, #f3f3f3)"',
  );
  svg = svg.replaceAll(
    /stroke=(["'])#f[23]f[23]f[23]\1/g,
    'class="tikz-fill" stroke="var(--tikz-fill, #f3f3f3)"',
  );
  svg = svg.replaceAll(
    /<text(?![^>]*\sfill=)([^>]*)>/g,
    '<text class="tikz-arrow" fill="currentColor"$1>',
  );
  // dvisvgm emits glyphs as `<use xlink:href="#...">` references into
  // `<defs>` paths, and arrowheads as un-attributed `<path>`s. Neither has
  // an explicit fill; both inherit from the SVG default of `black`.
  // Inheritance through `<use>` into a `<defs>` shadow tree is handled
  // inconsistently across browsers, so rather than relying on
  // `<svg fill="currentColor">` cascading all the way down, we set
  // `fill="currentColor"` directly on every `<use>` (the label glyphs) and
  // every otherwise-unattributed `<path>` (the arrowheads).
  svg = svg.replace(/<svg(\s)/, '<svg fill="currentColor"$1');
  svg = svg.replaceAll(
    /<use\b(?![^>]*\sfill=)/g,
    '<use class="tikz-arrow" fill="currentColor"',
  );
  // Arrowhead paths are emitted as `<path d='...'/>` with no other
  // attributes (they appear right before the styled stroke duplicate).
  // Match exactly that pattern so we don't accidentally clobber paths that
  // already have a fill or stroke set.
  svg = svg.replaceAll(
    /<path d='([^']+)'\/>/g,
    '<path class="tikz-arrow" fill="currentColor" d=\'$1\'/>',
  );
  return svg;
}

// Wrap a `\begin{tikzpicture}...\end{tikzpicture}` block in a `standalone`
// document and shell out to latex → dvisvgm. The `standalone` documentclass
// is the canonical way to typeset a single tikzpicture: it crops the page
// to the picture's bounding box and emits a tight DVI for dvisvgm to chew.
function renderWithLatex(tidied) {
  const tempDir = mkdtempSync(join(tmpdir(), "tikz-latex-"));
  try {
    const docPath = join(tempDir, "doc.tex");
    const docSource =
      `\\documentclass[tikz, border=2pt]{standalone}\n` +
      `\\usepackage[utf8]{inputenc}\n` +
      `\\usepackage{amsmath, amssymb}\n` +
      `${PREAMBLE}\n` +
      `\\begin{document}\n${tidied}\n\\end{document}\n`;
    writeFileSync(docPath, docSource);

    const latexRun = spawnSync(
      "latex",
      [
        "-interaction=nonstopmode",
        "-halt-on-error",
        `-output-directory=${tempDir}`,
        docPath,
      ],
      { encoding: "utf8" },
    );
    if (latexRun.status !== 0) {
      const log = (latexRun.stdout || "") + (latexRun.stderr || "");
      // Strip MiKTeX's verbose preamble noise from the error report.
      const tail = log.split(/\r?\n/).slice(-40).join("\n");
      throw new Error(`latex exit ${latexRun.status}:\n${tail}`);
    }

    const dviPath = join(tempDir, "doc.dvi");
    const svgPath = join(tempDir, "doc.svg");
    const dviRun = spawnSync(
      "dvisvgm",
      ["--no-fonts", "--exact", "-o", svgPath, dviPath],
      { encoding: "utf8" },
    );
    if (dviRun.status !== 0) {
      const log = (dviRun.stdout || "") + (dviRun.stderr || "");
      throw new Error(`dvisvgm exit ${dviRun.status}:\n${log}`);
    }

    return readFileSync(svgPath, "utf8");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

const TIKZ_RE = /```tikz\r?\n([\s\S]*?)\r?\n(?:>\s?)?```/g;

const files = walkMarkdown(RESOURCES_DIR);
let rendered = 0;
let skipped = 0;
let failed = 0;

for (const file of files) {
  const rel = relative(REPO_ROOT, file);
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(TIKZ_RE)) {
    const tidied = tidyTikzSource(match[1]);
    const hash = hashOf(PREAMBLE + "\n" + tidied);
    const out = join(OUT_DIR, `${hash}.svg`);
    if (existsSync(out)) {
      skipped++;
      continue;
    }
    process.stdout.write(`rendering ${hash} (${rel})… `);
    try {
      const rawSvg = renderWithLatex(tidied);
      writeFileSync(out, themeSvg(rawSvg));
      process.stdout.write("ok\n");
      rendered++;
    } catch (err) {
      process.stdout.write("FAILED\n");
      console.error(`  ${err?.message ?? err}`);
      failed++;
    }
  }
}

console.log(
  `\ndone. rendered=${rendered} skipped=${skipped} failed=${failed} → ${relative(REPO_ROOT, OUT_DIR)}`,
);
if (failed > 0) process.exit(1);

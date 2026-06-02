# Documentation

Docs.

## What are we allowed to host?

My understanding is that we are allowed to host:
- notes for the material (as this is essentially a textbook) 
- solutions (but not the papers themselves) for past papers, seminar exercises etc. 

We are generally **NOT** allowed to host:
- coursework guides (this may lead to academic misconduct)

If it's something not in the above, then contact the relevant member of DCS to **ask for permission**.

We have a **"fold instantly"** policy: if DCS tells us to take something down, then we take it down. 

The admins of the repository **must ensure** that everything hosted is approved because DCS contacting us to take something down may lead to stricter consequences. 

## Data Storage

How data is stored and why it is stored in this way.

### NoteData

These files are stored without hierarchy (just markdown files dumped in a directory) because they are not year or module specific. Two different modules may refer to the same file. For example, both CS130 (Sets and Proofs) and CS342 (Machine Learning) will use `Probability.md` since both require an introduction to probability.

## TikZ rendering

TikZ diagrams written as ` ```tikz ` fenced blocks inside any markdown under `Data/Resources/**` are pre-rendered to SVG at build time and served as static images. The browser never has to run a LaTeX engine on the happy path.

### Pipeline

1. `scripts/render-tikz.mjs` (under `frontend/apps/web/`) walks every `.md` file in `Data/Resources/`, extracts each ` ```tikz ` block via regex, and "tidies" the source: strips `\r`, `&nbsp;`, leading blockquote `> ` markers (so blocks nested in `>[!check]-` callouts work), trims every line and drops empty ones. The browser-side `tidyTikzSource` in `markdown-content.tsx` applies the *same* transform, so the bytes both sides hash are identical.
2. Each tidied block is hashed: `sha256(preamble + "\n" + tidied)`, truncated to 16 hex chars. The shared preamble lives at `frontend/apps/web/src/tikz-preamble.tex` - the script reads it from disk, the React bundle imports it via Vite's `?raw`. Changing the preamble invalidates every hash and forces a full re-render.
3. If `Data/Resources/Images/tikz/<hash>.svg` doesn't exist, the script wraps the block in a `standalone` LaTeX document (with the shared preamble + `inputenc` + `amsmath` + `amssymb`), shells out to `latex` to produce a DVI, then to `dvisvgm --no-fonts` to convert the DVI into a self-contained SVG. The result is post-processed by `themeSvg()` (see [What the SVGs ship with](#what-the-svgs-ship-with)) and written to disk. Existing files are skipped, so re-runs are cheap.
4. Vite's `publicDir: "../../../Data"` copies the SVGs into `dist/Resources/Images/tikz/` at build, where they're served by Flask alongside any other static asset.
5. In the browser, the `TikzBlock` React component computes the same hash with `crypto.subtle.digest("SHA-256", ...)`, fetches the SVG, and inlines it via `dangerouslySetInnerHTML` so the `tikz-arrow` / `tikz-fill` classes inside cascade against the page's CSS. On a 404 it falls back to client-side `node-tikzjax` (see [Fallback path](#fallback-path)).

### Why a real LaTeX pipeline (and not just `node-tikzjax`)

The render script *used* to drive `node-tikzjax`, a WASM port of tikzjax that bundles a stripped-down pdfTeX kernel and a hand-curated subset of TeX Live (~6 MB total). That avoided needing a LaTeX install on the build host, but came with two real bugs:

- **Glyph mapping is broken for some math symbols.** `\in` rendered as the digit `2` and `\Sigma` rendered as `§`, because tikzjax's DVI→SVG converter has wrong entries in its `<font-slot> → <character>` lookup table. The DVI it produces is correct, the SVG conversion is what mangles it.
- **No `inputenc.sty` in the bundle.** Multi-byte UTF-8 sequences in the source crash the tokenizer immediately; `Σ`, `∈`, `α` etc. can't appear literally in tikz input.

A real LaTeX install (MiKTeX, TeX Live, tectonic) has the full font tables and ships `inputenc` by default, so both bugs disappear. The trade-off:

- **You need `latex` and `dvisvgm` on PATH** to render new diagrams locally. On Windows that's MiKTeX; on macOS, MacTeX or `brew install texlive`; on Linux, your distro's `texlive` packages. Production builds skip the render entirely (`SKIP_TIKZ_PRERENDER=1` in the Dockerfile), so the Docker image stays clean.
- **SVGs are ~4× larger.** With `dvisvgm --no-fonts`, every label glyph is emitted as a `<path>` instead of `<text>` + font reference. That bumps the average SVG from ~3 KB (tikzjax) to ~12 KB (LaTeX). Still trivial for static, immutably-cached assets.

The old `node-tikzjax` pipeline is preserved at `scripts/render-tikz-tikzjax.mjs` and exposed as `npm run tikz:tikzjax`; useful as a backup if a build host can't get a LaTeX install, accepting that anything with `\in` or `\Sigma` in math mode will look wrong on those builds.

### Why the preamble re-implements `automata`

tikzjax (both the CDN bundle and the `node-tikzjax` port) ships a broken `automata` library: it loads `tikzlibraryautomata.code.tex` but the `/tikz/state` key never gets registered, so any `\node[state]` errors with *"I do not know the key '/tikz/state'"*. The preamble in `tikz-preamble.tex` works around this by defining `state`, `accepting`, `initial`, `every state`, plus the `initial text` and `initial distance` keys directly with `\tikzset`, using only `arrows` + `positioning` primitives. The user-facing visual matches what the standard `automata` library would have produced (shaded states, `>=stealth'` arrows, double accepting border, leading arrow into the initial state).

A real LaTeX (the primary pipeline) has a working `automata` library and doesn't need any of this. The re-implementation is kept because:

- The **browser-side fallback** uses the tikzjax CDN, which has the same broken `automata`. Without the re-implementation, the fallback path would fail.
- The **`npm run tikz:tikzjax` backup pipeline** uses `node-tikzjax`, same problem.

If we ever drop both tikzjax pathways (CDN fallback + backup script), the preamble could be simplified to just `\usetikzlibrary{automata,positioning,arrows}` + the user-formatting `\tikzset{...}` block + the `\let` aliases.

### Scripts

- `npm run tikz`: primary pipeline, `latex` + `dvisvgm`. Renders any missing SVGs.
- `npm run tikz:tikzjax`: backup pipeline, `node-tikzjax` WASM kernel. Renders any missing SVGs without needing a LaTeX install on PATH, but produces wrong glyphs for `\in` / `\Sigma` and similar math symbols.
- `npm run tikz:clean`: wipe the SVG cache (forces a full re-render next time). Useful when switching pipelines or after bumping the preamble version.
- `npm run prebuild` runs the primary render automatically, so `npm run build` always ships up-to-date diagrams. Author a new tikz block, run `build` (or `tikz`), commit the markdown *and* the generated SVG.
- `SKIP_TIKZ_PRERENDER=1`: set this environment variable to short-circuit the render script (it `exit 0`'s immediately). Used by the `Dockerfile` because the build container has neither LaTeX nor node-tikzjax's preferred memory budget, and the rendered SVGs are already committed in `Data/Resources/Images/tikz/` so Docker can just copy them through.

### Authoring a new TikZ diagram

The pipeline is opt-in by file extension: any ` ```tikz ` fenced block in a `.md` file under `Data/Resources/**` gets picked up automatically. To add a new diagram:

1. **Write the TikZ in markdown.** Inside any `Data/Resources/Notes/**` or `Data/Resources/Solutions/**` markdown file, add a fenced block:

   ````markdown
   ```tikz
   \begin{tikzpicture}
   \node[state, initial] (q1) {$q_1$};
   \draw (q1) edge[loop above] node {\sym{a}} (q1);
   \end{tikzpicture}
   ```
   ````

   Blocks inside callouts work too - drop a ` ```tikz ` fence inside any `>[!check]-` / `>[!hint]-` body and the render script strips the `> ` blockquote prefix before passing the source to LaTeX.

2. **Render it.** From `frontend/apps/web/`, run `npm run tikz` (or just `npm run build`, which calls `tikz` via the `prebuild` hook). The script hashes `preamble + source`, drives `latex` then `dvisvgm`, applies `themeSvg()`, and writes the SVG to `Data/Resources/Images/tikz/<hash>.svg`. Blocks whose hash already exists are skipped. Expect ~1–2 s per new diagram on the first render; subsequent runs are near-instant. You need `latex` and `dvisvgm` on `PATH`; install MiKTeX (Windows), MacTeX (macOS), or `texlive` (Linux). If you don't have LaTeX and just want to test, fall back to `npm run tikz:tikzjax`.

3. **Commit both files.** The markdown change AND the new `Data/Resources/Images/tikz/<hash>.svg`. The Dockerfile sets `SKIP_TIKZ_PRERENDER=1` so production builds copy the committed SVG straight through; if it isn't in git, the deployed site falls back to client-side tikzjax (a ~6 MB CDN load) for that block.

4. **(Optional) Clean orphans.** Editing an existing block changes the hash, leaving the old SVG behind as an orphan. To prune, run `npm run tikz:clean && npm run tikz`. That dumps the whole cache and regenerates only what's still referenced by the current markdown.

### What the SVGs ship with

The render script post-processes each SVG so it themes correctly when inlined in the page:

- Strokes / text labels get `class="tikz-arrow"` and use `currentColor`. Setting `color` on `.tikz-svg-host` in CSS recolours every arrow.
- Node interior fills (and the gap-stroke of `accepting` double-circles) get `class="tikz-fill"` and reference `var(--tikz-fill, #f3f3f3)`. Overriding `--tikz-fill` per theme recolours every interior without touching the SVG.

Both hooks are applied in `themeSvg(svg)` in `scripts/render-tikz.mjs`. The version comment at the top of `frontend/apps/web/src/tikz-preamble.tex` is part of the bytes fed into the hash, so bumping it forces every diagram to re-render; useful when you change `themeSvg` (e.g. introducing a new class) and want every cached file refreshed in one go.

### Fallback path

For blocks that haven't been pre-rendered yet (typically: a freshly-authored block during `npm run dev`), `TikzBlock` falls back to client-side rendering via the tikzjax CDN. The CDN is **lazy-loaded** - `loadTikzjaxCdn()` injects `<link rel="stylesheet" href="…/fonts.css">` and `<script src="…/tikzjax.js">` only the first time a fallback is triggered, and the promise is memoised so concurrent TikzBlocks share one load. tikzjax's bundle is ~6 MB, so this keeps that cost off every page that contains diagrams.

A second wrinkle: tikzjax scans for `<script type="text/tikz">` exactly once via `window.onload`. It has no MutationObserver and no exposed re-process API. To handle SPA navigation and post-mount script injection, `runTikzjax()` polls for tikzjax's handler to appear on `window.onload` and invokes it manually after each fallback injection, re-running its scanner with the freshly added script in the DOM.

## Performance

Three changes keep the bundle and the network paths cheap:

### Pre-rendered TikZ + lazy CDN

Also covered above. Most users never load tikzjax at all; those who do (dev iteration on a new block) trigger it on demand.

### Immutable cache on hashed SVGs

`app.py` has a dedicated route ahead of the catch-all:

```python
@app.route("/Resources/Images/tikz/<filename>")
def tikz_image(filename):
    ...
    response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return response
```

Because the filenames are SHA-256 content addresses, the bytes for any given URL never change. `immutable` tells the browser to skip revalidation forever; a returning visitor's TikZ diagrams come straight out of the disk cache with no network round-trip. Path traversal is rejected up front (`/`, `\`, or leading `.` in the filename → 404).

### Route code-splitting via `React.lazy`

`App.tsx` keeps `Welcome` eager (avoids a Suspense flicker on first paint of `/`) and wraps every other route in `React.lazy(() => import(...))` inside a single `<Suspense>` boundary. The previous behavior, every page bundled into one ~778 kB chunk, meant landing on `/year/1` paid the full markdown + KaTeX cost even though those pages render no notes. The new chunk layout:

| Chunk | Size (kB) | Loaded on |
|---|---|---|
| `index` (entry) | ~115 | every page |
| `index-CSsdtdX5` (react-markdown + remark-* + rehype-katex) | ~278 | `/resources/*` only |
| `katex.min` | ~268 | `/resources/*` only |
| `resource` | ~55 | `/resources/*` |
| `module` | ~12 | `/module/*` |
| `welcome`, `careers`, `quizzes`, `reviews`, … | 2-3 each | their own routes |

Entry bundle dropped from ~778 kB → ~115 kB. The tradeoff is a one-time ~50 ms Suspense placeholder (`Loading…`) the first time a user navigates into a section; the lazy chunk is then cached for the rest of the session.

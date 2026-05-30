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
3. If `Data/Resources/Images/tikz/<hash>.svg` doesn't exist, the script calls `node-tikzjax`'s `tex2svg(...)` (a Node + WASM port of tikzjax) and writes the SVG. Existing files are skipped, so re-runs are cheap.
4. Vite's `publicDir: "../../../Data"` copies the SVGs into `dist/Resources/Images/tikz/` at build, where they're served by Flask alongside any other static asset.
5. In the browser, the `TikzBlock` React component computes the same hash with `crypto.subtle.digest("SHA-256", ...)` and renders `<img src="/Resources/Images/tikz/<hash>.svg" loading="lazy">`. On a 404 it falls back to client-side tikzjax (see below).

### Why the preamble re-implements `automata`

tikzjax (both the CDN bundle and the `node-tikzjax` port) ships a broken `automata` library: it loads `tikzlibraryautomata.code.tex` but the `/tikz/state` key never gets registered, so any `\node[state]` errors with *"I do not know the key '/tikz/state'"*. The preamble in `tikz-preamble.tex` works around this by defining `state`, `accepting`, `initial`, `every state`, plus the `initial text` and `initial distance` keys directly with `\tikzset`, using only `arrows` + `positioning` primitives. The user-facing visual matches what the standard `automata` library would have produced (shaded states, `>=stealth'` arrows, double accepting border, leading arrow into the initial state).

### Scripts

- `npm run tikz`: render any missing SVGs.
- `npm run tikz:clean`: wipe the SVG cache (forces a full re-render next time).
- `npm run prebuild` runs the render automatically, so `npm run build` always ships up-to-date diagrams. Author a new tikz block, run `build` (or `tikz`), commit the markdown *and* the generated SVG.
- `SKIP_TIKZ_PRERENDER=1`: set this environment variable to short-circuit the render script (it `exit 0`'s immediately). Used by the `Dockerfile` because node-tikzjax's WASM LaTeX kernel can OOM small containers (WSL2 defaults to ~4 GB), and the rendered SVGs are already committed in `Data/Resources/Images/tikz/` so Docker can just copy them through.

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

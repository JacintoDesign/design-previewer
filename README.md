# DESIGN.md Previewer

A tiny, static, **no-build** website: drop in a [Google `DESIGN.md`](https://github.com/google-labs-code/design.md)
file and instantly see sample UI styled from its design tokens — colors, typography, spacing,
radius, shadows, motion, and components — plus a live token inspector. Everything runs in the
browser; nothing is uploaded.

**▶ Live demo: https://jacintodesign.github.io/design-previewer/**

## What it does

- **Drag & drop** or **browse** for a `DESIGN.md` file (or pick a bundled **example**).
- Parses the YAML frontmatter (via [`js-yaml`](https://github.com/nodeca/js-yaml), loaded from a CDN).
- **Vocabulary-agnostic theming.** Your colors can be named anything — Material 3 (`surface`,
  `on-surface`, `primary`), a bespoke set (`accent`, `navy`, `glass-1`, `text-primary`), or a mix.
  Each is mapped onto the semantic roles the preview needs (bg, surface, text, muted, border,
  accent) via alias lists first, then color heuristics (e.g. the most saturated hue becomes the
  accent) — so the preview is themed by your real tokens, not defaults.
- **Loads your fonts.** Family names are extracted from the typography tokens — even from a
  descriptive string like `"JetBrains Mono (next/font/google…) → ui-monospace, …"` — requested from
  Google Fonts, and applied with category-correct fallbacks.
- **Layout presets.** View the tokens as a **Marketing** page, an analytics **Dashboard**, or a
  three-pane **App shell** — each reflows to the pane width via container queries.
- **Backdrop** selector — swap the preview stage between the design's own background and generated
  gradient/pattern options (Aurora, Spotlight, Mesh, Dot grid, Grid, Solid), built from your theme +
  accent. Glass surfaces use `backdrop-filter` (with an opaque `@supports` fallback) so
  glassmorphic designs show off over an interesting backdrop.
- **Light / Dark** toggle. The design's native theme is detected from its palette and selected by
  default; flipping synthesizes a clean opposite theme while keeping your accent (nudging its
  lightness only if it would fail contrast against the new background).
- **Token inspector** — color swatches, the type scale, radius/spacing samples, **shadows** (with
  the shadow applied) and **motion** (hover to preview the easing), and each defined component. A
  **Notes** tab renders the markdown prose from the file.
- **Export** the tokens as **CSS custom properties**, a **Tailwind config**, or **JSON** (copied to
  your clipboard).

## Run locally

ES-module imports need HTTP (not `file://`). Use the bundled no-cache dev server:

```bash
npm start            # → http://localhost:5173  (node server.mjs)
```

Any static server works too (`python3 -m http.server 8000`, `npx serve`, …), but the bundled one
sends `Cache-Control: no-store` so edits show up on reload without a hard refresh. There are no
dependencies to install.

## Test

The pure logic (role mapping, theme detection, contrast clamp, font extraction, backdrops, exports)
is covered by zero-dependency unit tests:

```bash
npm test             # node --test
```

## Deploy

It's just static files — push to **GitHub Pages**, **Netlify**, **Vercel**, or any static host. No
build step. (This repo serves from `main` via GitHub Pages; `.nojekyll` keeps files verbatim.)

## Project structure

```
index.html          uploader + split preview / token panel
about.html          "What is DESIGN.md?" summary page
styles.css          app chrome (the preview itself is styled from tokens)
app.js              orchestration: input, parse, render, dropdowns, export, tabs
parse.js            frontmatter split + YAML parse + normalization
theme.js            color parsing + vocabulary-agnostic role mapping + theme detection + contrast clamp
fonts.js            font-family extraction + Google Fonts loading
backdrops.js        generated gradient / pattern preview backdrops
exports.js          CSS-vars / Tailwind / JSON token exporters
resolve.js          "{group.token}" reference resolution + component / CSS-var helpers
render-preview.js   the three layout presets (marketing / dashboard / app shell)
render-tokens.js    the token inspector + prose renderer
server.mjs          no-cache static dev server
theme.test.mjs      unit tests (node --test)
examples/           bundled sample DESIGN.md files
```

## The DESIGN.md format

`DESIGN.md` is Google Labs' open format for describing a visual identity to coding agents: YAML
frontmatter of design tokens plus human-readable `##` prose. See the
[spec](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md). This tool is an
independent viewer and is not affiliated with Google.

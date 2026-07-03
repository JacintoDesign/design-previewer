# DESIGN.md Previewer

A tiny, static, **no-build** website: drop in a [Google `DESIGN.md`](https://github.com/google-labs-code/design.md)
file and instantly see a sample website styled from its design tokens — colors, typography, spacing,
radius, and components — plus a live token inspector. Everything runs in the browser; nothing is uploaded.

## What it does

- **Drag & drop** or **browse** for a `DESIGN.md` file (or click **Load example**).
- Parses the YAML frontmatter (via [`js-yaml`](https://github.com/nodeca/js-yaml), loaded from a CDN).
- Renders a mock landing page — nav, hero, buttons, cards, a sign-up form, footer — driven entirely
  by your tokens. Component definitions (e.g. `button-primary`) are used when present; token
  references like `{colors.primary}` / `{rounded.lg}` are resolved.
- Shows a **token inspector**: color swatches, the type scale, radius and spacing samples, and each
  defined component. A **Notes** tab renders the markdown prose from the file.
- **Native / Inverse** toggle flips the preview between the file's palette and its Material
  `inverse-*` roles.

## Run locally

ES-module CDN imports don't work over `file://`, so serve the folder over HTTP:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Any static server works — `npx serve`, etc.)

## Deploy

It's just static files — push to **GitHub Pages**, **Netlify**, **Vercel**, or any static host. No build step.

## Project structure

```
index.html          single page (uploader + split preview / token panel)
styles.css          app chrome (the preview itself is styled from tokens)
app.js              orchestration: input, parse, render, theme toggle, tabs
parse.js            frontmatter split + YAML parse + normalization
resolve.js          "{group.token}" reference resolution + CSS-var helpers
render-preview.js   the sample landing page
render-tokens.js    the token inspector + prose renderer
examples/           bundled sample DESIGN.md files
```

## The DESIGN.md format

`DESIGN.md` is Google Labs' open format for describing a visual identity to coding agents: YAML
frontmatter of design tokens plus human-readable `##` prose. See the
[spec](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md). This tool is an
independent viewer and is not affiliated with Google.

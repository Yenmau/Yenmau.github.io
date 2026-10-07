# yenmau.github.io

Personal portfolio (Vincent Tiono) — a single static page, served by GitHub Pages
from `main`. No framework, no runtime dependencies.

## Styling — Tailwind CSS v4

All styling is Tailwind. The markup in `index.html` carries the utility classes;
`src/input.css` holds only the design tokens (`@theme`: colours, fonts, spacing,
keyframes) plus the handful of effects utilities cannot express — the pixel-notch
`clip-path`, the glitch / sheen / scan pseudo-element layers, the boot splash,
`prefers-reduced-motion` and print rules.

`assets/site.css` is the **build output** (minified) and is committed, so GitHub
Pages can serve it directly. Never edit it by hand — edit `src/input.css` or the
utility classes in `index.html`, then:

```bash
npm install       # once
npm run build:css # writes assets/site.css
npm run watch:css # rebuild on save while styling
```

## Files

| path | what |
|---|---|
| `index.html` | the page — markup + Tailwind utilities |
| `src/input.css` | Tailwind source: tokens + custom effect layer |
| `assets/site.css` | compiled output (committed, do not edit) |
| `app.js` | progressive enhancements — nav highlight, scroll progress, reveal, terminal typing, boot splash, motion switch. Content is always visible without JS. |
| `assets/portrait.jpg` | hero portrait |
| `assets/favicon.svg` | favicon |

## The razor-wire rule

Section boundaries (above each section head, and above the footer) are drawn with
the site's one decorative motif: a schematic razor wire — a straight strand,
chevron twists and square-set barbs — tiled from `assets/wire.svg` (240×16, the
crimson variant is `assets/wire-crimson.svg`). It replaces the plain 1px rule, so
a section starts with a cut instead of a hairline. `.wire-band` in
`src/input.css` controls size, spacing and opacity; swap the class for
`.wire-band-crimson` on any band that should carry the severity temperature. The
crimson version is used once, above `#projects`, where the red finding chips are.
On narrow screens the tile widens and the opacity drops so the wire reads as a
cut rather than as texture.

## Deploy

Push to `main`. GitHub Pages serves the repo root as-is.

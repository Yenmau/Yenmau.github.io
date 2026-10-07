# yenmau.github.io

Personal portfolio (Vincent Tiono) — a single static page, served by GitHub Pages
from `main`. No framework, no runtime dependencies.

## Styling — Tailwind CSS v4

All styling is Tailwind. The markup in `index.html` carries the utility classes;
`src/input.css` holds only the design tokens (`@theme`: colours, fonts, spacing,
keyframes) plus the handful of effects utilities cannot express — the pixel-notch
`clip-path`, the light-saber rule, the glitch / sheen / spotlight / scan layers,
the boot splash, `prefers-reduced-motion` and print rules.

`assets/site.css` is the **build output** (minified) and is committed, so GitHub
Pages can serve it directly. Never edit it by hand — edit `src/input.css` or the
utility classes in `index.html`, then:

```bash
npm install       # once
npm run build:css # writes assets/site.css
npm run watch:css # rebuild on save while styling
```

## Design notes

- **Section rules are a light-saber blade** (`.saber`): a white-hot core fading
  out at both ends over a teal bloom, one blade per section boundary plus the
  footer. The bloom is a masked gradient rather than a `box-shadow`, because a
  shadow gets cut off dead at the element's box (hard vertical edges at both
  ends). It hums gently (`--animate-saber-hum`).
- **Surface**: `assets/grain.svg` (tiled fractal noise, `soft-light` at 0.32)
  plus a vignette layer. Without it the page is one perfectly flat dark field,
  which is most of what made it read as machine-made.
- **Pointer spotlight** (`.spot`): cards and toolkit panels light up under the
  cursor, driven by `--mx`/`--my` set in `app.js`. Only wired for
  `(hover: hover) and (pointer: fine)`, so touch devices get nothing.
- No third-party artwork is bundled. An earlier pass pasted a reference image;
  it was removed — a reference for the design language is not a file to ship.

## Files

| path | what |
|---|---|
| `index.html` | the page — markup + Tailwind utilities |
| `src/input.css` | Tailwind source: tokens + custom effect layer |
| `assets/site.css` | compiled output (committed, do not edit) |
| `assets/grain.svg` | tiled noise texture for the page surface |
| `app.js` | progressive enhancements — nav highlight, scroll progress, reveal, pointer spotlight, terminal typing, boot splash, motion switch. Content is always visible without JS. |
| `assets/portrait.jpg` | hero portrait |
| `assets/favicon.svg` | favicon |

## Deploy

Push to `main`. GitHub Pages serves the repo root as-is. Pages caches the HTML
for 10 minutes (`Cache-Control: max-age=600`), so a reload right after a deploy
can still show the previous build.

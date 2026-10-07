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

## The artwork slot

The projects section opens with an empty framed strip (`figure.reveal` in
`index.html`) reserved for a wide cover image. No third-party art is bundled —
drop your own file at `assets/artwork.jpg` and follow the comment above the
`<figure>`; keep the `.banner-tint` span so the image dark-grades into the page.
Delete the `<figure>` if you don't want the strip.

## Deploy

Push to `main`. GitHub Pages serves the repo root as-is.

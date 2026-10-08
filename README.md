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
- **Evidence strips on the cards** (`.evidence`): two captures cropped out of the
  real assessment reports — the analytics replay log and the OTP replay run —
  with every hostname and response payload blacked out before they were
  committed. They are the one thing on the page that is not a description of
  work; the caption labels them and stops there. Targets stay anonymized: no
  domain, package name, token or account id survives the redaction pass.
- **Live GitHub strip** (`.gh-live`): newest push, languages by repo count, public
  repo count, and the fetch date, pulled from one unauthenticated
  `api.github.com` call. It ships `hidden` and is revealed only once real numbers
  have arrived, so a no-JS, offline or rate-limited visitor sees no strip instead
  of a placeholder that lies. The footer takes its `deployed <date>` and the short
  commit sha from the same payload.
- **Life pass** — the "alive" layer, all of it additive (markup that ships hidden
  is only revealed by `app.js`; every figure the script touches is already the
  real value in the HTML):
  - **Metric strip** (`.metrics`) under the hero: 11 findings / 2 critical / 8.2
    highest CVSS / 4 documented cases. Every number is stated in the copy below —
    the strip restates, it never introduces a figure. `data-count` drives a
    one-shot count-up on first view, skipped under `prefers-reduced-motion`.
  - **Interactive terminal prompt** (`.term-prompt`): the panel is a shell now,
    not a picture of one. `help`, a section name, `contact`, `github`, `whoami`,
    `clear`; output is capped at four lines and the form ships `hidden`.
  - **Cursor aurora** (`.aurora`) and the **portrait viewfinder** (`.hud-corner` /
    `.hud-cross`): `--cx`/`--cy` and `--hx`/`--hy` are written from one
    `pointermove` listener on a rAF tick. User-driven, so they stay under reduced
    motion; gated on `(hover: hover) and (pointer: fine)`.
  - **Live clock**: the header pill prints *Jakarta* time computed from UTC (not
    the visitor's zone), and the portrait bar counts seconds on the page — a
    still frame that is nonetheless running.
  - **Nav marker** (`.nav-ind`) slides under the active link; **section numerals**
    (`.sec-num.lit`) light while their section is in view.
  - Under reduced motion the glow still **breathes** (`glow-breathe`, opacity
    only) — the page reads as running without moving any large area.
- **Pinned nav** (`.nav`): the header is `position: sticky`, so it follows the page
  instead of scrolling away. The bar spans the full viewport width and `.nav-inner`
  holds the 1180px container, so it does not read as a strip that stops at the
  content edge. It carries its own surface — translucent tint + `backdrop-filter`
  — so the drifting grid shows through as glass; once the page has moved, `.scrolled`
  (added by `app.js`) makes it opaque and lights the bottom edge in teal. Anchor
  jumps clear it through `html { scroll-padding-top: var(--nav-h) }`, where `--nav-h`
  is the bar's measured height (+12px) written by `app.js`; 96px is the no-JS
  fallback. The row never wraps — below 1020px it scrolls sideways instead, with an
  edge fade that only appears while it actually overflows.
- **404 page**: `404.html`, served by GitHub Pages for any unknown path — laid out
  as a request/response pair (`HTTP/2 404 { "error": "no route here" }`) with the
  requested path echoed from `location.pathname` via `textContent`.
- No third-party artwork is bundled. An earlier pass pasted a reference image;
  it was removed — a reference for the design language is not a file to ship.

## Files

| path | what |
|---|---|
| `index.html` | the page — markup + Tailwind utilities |
| `404.html` | GitHub Pages' error page; same sheet, styled as a 404 request/response |
| `src/input.css` | Tailwind source: tokens + custom effect layer (`@source` lists both HTML files) |
| `assets/site.css` | compiled output (committed, do not edit) |
| `assets/grain.svg` | tiled noise texture for the page surface |
| `assets/evidence/*.png` | redacted evidence strips shown on the two Android project cards |
| `assets/og.png` | generated 1200x630 link-preview card |
| `app.js` | progressive enhancements — nav highlight + sliding marker, scroll progress, reveal, pointer spotlight, cursor aurora, viewfinder cross, live clocks, metric count-up, interactive terminal prompt, terminal typing, boot splash, motion switch, favicon blink, live GitHub strip. Content is always visible without JS. |
| `assets/portrait.jpg` | hero portrait |
| `assets/favicon.svg` | favicon (the blink frame is `assets/favicon-blink.svg`) |

## Deploy

Push to `main`. GitHub Pages serves the repo root as-is. Pages caches the HTML
for 10 minutes (`Cache-Control: max-age=600`), so a reload right after a deploy
can still show the previous build.

Both HTML files link the sheet as `assets/site.css?v=<token>` and the `404.html`
one carries the same token — **bump the token in both files whenever `site.css`
changes**. Without it, `site.css` can stay cached for its own 10 minutes and a
visitor reads the old design against the new markup (the pinned nav silently
reverting to a scrolling bar is exactly that failure).

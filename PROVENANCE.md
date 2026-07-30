# Provenance

## What this is

An offline, self-contained capture of a public website, made as a local
reference for study and side-by-side comparison.

| | |
|---|---|
| Source | <https://experiment.obys.agency/> |
| Pages captured | `/` and `/about` — the entire site |
| Captured | 2026-07-30 |
| Platform of origin | Webflow static publish (no server logic, no runtime CMS calls) |
| Files | 159 recorded in `manifest.json` |
| Runs offline | Yes — nothing is fetched from the network at runtime |

`manifest.json` records, for every file: its original source URL, byte count,
content type, and SHA-256.

## How it was made

A capture script downloaded both pages, the stylesheet, every referenced asset
and each third-party library, then applied a closed set of transformations:

1. Every absolute asset URL rewritten to a local relative path.
2. Subresource Integrity attributes stripped — localizing the `url()` references
   inside `main.css` changes its bytes, so the published `sha384` hash no longer
   matches and browsers silently refuse to apply the stylesheet.
3. The bare `https://esm.sh/three@0.170.0` ES-module specifier repointed at a
   vendored self-contained Three.js r170 build (the esm.sh build re-imports from
   esm.sh at runtime and cannot work offline).
4. Internal navigation repointed at the local files; the canonical link removed.

Verified: re-applying exactly that set to the pristine originals reproduces
`index.html`, `about.html` and `main.css` **byte-for-byte**, so nothing else was
altered. All 27 inline `<script>` blocks and 12 inline `<style>` blocks survive
in place, unmodified. All 171 local references resolve. See `../docs/fidelity-report.md`.

## Deliberate divergences from the live site

**1. The original typeface was removed and substituted.**
It is not present in this package. The family name `OTF Obys NG` now resolves
to **Helvetica Neue LT Std**, installed locally on the capturing machine, via
`src: local()` — so no font file is stored here or served over HTTP.
`ascent-override: 101%` / `descent-override: 20%` /
`line-gap-override: 0%` reproduce the replaced face's vertical metrics; without
them the substitute's baseline sits ~18px higher at 94px and the display capitals
are clipped by the reveal wrappers. Measured divergence: advance widths within
1–2%, cap height 70.0 vs 71.4 and x-height 50.6 vs 51.7 per 100px em.

**On another machine** without Helvetica Neue LT Std installed, type falls back
to Arial and the display setting will look wrong. That is expected — see
`../docs/fidelity-report.md` §3.2 for the numbers and how to re-point it.

**2. A broken upstream dependency is reproduced on purpose.**
`about.html` loads Lenis from a cdnjs path that returns **HTTP 404** — cdnjs has
no `lenis` package, because 1.0.x shipped as `@studio-freight/lenis`. On the live
site `new Lenis(...)` therefore throws and smooth scrolling never initialises.
`assets/js/vendor/lenis.min.js` is intentionally absent so it 404s identically.
Vendoring a working copy would make this copy scroll *differently* from the
original. A working build sits unwired at `assets/js/vendor/_optional/`; move it
up one directory to opt in.

## Running it

Any static HTTP server works. Opening `index.html` from `file://` will **not** —
the page uses ES modules, which need an origin.

```bash
python3 -m http.server 8801 --directory .
```

Then open <http://localhost:8801>. Requires a viewport wider than 1199px: below
that the site shows a blocking notice and locks scroll, which is the source's own
behaviour, not a limitation of this copy.

## Layout

```
index.html, about.html      the two pages, inline scripts intact
manifest.json               per-file source URL, bytes, sha256, divergences
assets/css/main.css         the site's stylesheet (font block substituted)
assets/fonts/               empty by design — see divergence 1
assets/img/         (53)    Webflow CDN assets, including the logo
assets/img-b44/     (97)    WebGL gallery textures
assets/js/vendor/   (6)     jQuery, Webflow, GSAP, ScrollTrigger, SplitType, Three
_extracted/                 the 27 inline scripts and 12 inline styles, split out
                            for reading; the originals remain inline in the HTML
```

## Further reading

Analysis written from this capture:

- `../docs/design-system.md` — palette, type scale, spacing, z-index stack, curves
- `../docs/motion-and-interactions.md` — load timeline, the WebGL model, defects
- `../docs/fidelity-report.md` — verification method and every known divergence

# Obys® Experiment Space — offline reference mirror

A complete, self-contained copy of <https://experiment.obys.agency/> that runs
with no network access. Captured 2026-07-30 as a study and comparison reference.

Both pages of the site are here (`/` and `/about` — that's the whole site),
along with every image, script and stylesheet it loads.

---

## Quickstart

```bash
python3 -m http.server 8801 --directory .
```

Then open <http://localhost:8801>.

Two things that will otherwise look like bugs:

- **You need a viewport wider than 1199px.** Below that you get a black notice
  asking you to open it on a larger screen. That's the original site's own
  behaviour, not a limitation of this copy.
- **`file://` will not work.** The gallery loads Three.js as an ES module, which
  browsers refuse to import without an origin. It needs an HTTP server.

The homepage runs a ~5.7s intro (a counter, then split panels opening onto the
oversized headline) before the gallery is interactive. Scroll to unravel the
formation into a flat filmstrip and pan along it; hover a plane for its caption;
once flattened, click one to open it. The row of words at the bottom centre
switches between four arrangements.

---

## Read this before relying on it

**1. It is not yours to publish.** The code, imagery and brand belong to Obys
Agency. This is a local reference — keep it local. It's excluded from the
project's git history for that reason, archives included. Full detail in
[PROVENANCE.md](PROVENANCE.md).

**2. The type is machine-dependent.** The original's commissioned typeface is not
in this package. Text resolves to **Helvetica Neue LT Std** from the local font
install, via `src: local()` — so no font file is stored or served here. On a
machine without that family, display type falls back to Arial and the 94px
setting will look wrong. Not a defect; it's what keeps a licensed font out of the
package.

**3. One upstream bug is reproduced on purpose.** `assets/js/vendor/lenis.min.js`
is deliberately absent so it returns 404, exactly as it does on the live site —
which is why the real about page has no smooth scrolling either. A working copy
sits unwired in `assets/js/vendor/_optional/`; move it up one directory to opt in
and diverge from the original.

---

## What's inside

```
index.html, about.html      the two pages, all 27 inline scripts intact
README.md                   this file
PROVENANCE.md               source, rights, capture method, divergences
manifest.json               per-file source URL, bytes, sha256

assets/css/main.css         the site's stylesheet (font block substituted)
assets/fonts/               empty by design — see point 2 above
assets/img/         (53)    Webflow CDN assets, including the logo
assets/img-b44/     (97)    WebGL gallery textures
assets/js/vendor/   (6)     jQuery, Webflow, GSAP, ScrollTrigger, SplitType, Three r170

_extracted/                 the inline scripts and styles split into separate
                            files for reading. Reference only — the originals
                            remain inline in the HTML, which is what executes.
```

159 files are recorded in `manifest.json` with their original source URLs and
SHA-256 hashes.

`_extracted/` is the fastest way into the code: all the site's bespoke behaviour
lives in inline `<script>` blocks rather than a bundle, so `index-02.js` (~32 KB)
is the entire WebGL gallery, and the small numbered files are the preloader,
hero reveal, clock, clipboard and page transitions.

---

## How faithful is it

Re-applying the capture's transformations to the pristine originals reproduces
`index.html`, `about.html` and `main.css` **byte-for-byte** — so the only
differences from the live site are URL localization and the removal of
Subresource Integrity attributes. All 171 local references resolve. It loads
with zero console errors and no failed requests.

Method, measurements and every known divergence are in `docs/fidelity-report.md`
in the capture package — see the note below on where that lives.

---

## Where to go next

**These live one level up, in the `obys-experiment-capture/` package that this
mirror is part of — not inside the mirror itself.** If you're reading this from
an extracted archive, the mirror travelled on its own and these are back in the
source repo:

| For | Read |
|---|---|
| Palette, type scale, spacing, z-index stack, easing curves | `docs/design-system.md` |
| Load timeline, the WebGL model, confirmed production defects | `docs/motion-and-interactions.md` |
| Verification method and every known divergence | `docs/fidelity-report.md` |
| What can and cannot be reused, and how to substitute the type | `docs/reuse-and-licensing.md` |
| Something you can actually ship | `template/` — original code, same experience, driven by one config file |

Those four documents are original analysis written from this capture, and unlike
the mirror itself they're safe to share.

repo: bornslipppy/yair-works
branch: main

## Last sync

date: 2026-07-30T09:56:49Z

### Updated in this project
- Imported the full offline mirror: `index.html`, `about.html`, `assets/css/main.css`, 6 vendor scripts, 53 `assets/img/` + 96 `assets/img-b44/` assets (all 27 inline scripts intact).
- Added `Obys Experiment Space.dc.html` — a runner that hosts the untouched mirror in a 1600×900 virtual viewport, scaled to fit, so the site clears its own >1199px desktop gate inside a preview pane.
- Runner chrome: Index / About switch, Replay (re-runs the ~5.7s intro), tweakable virtual viewport size.
- `assets/js/vendor/lenis.min.js` and `assets/fonts/` deliberately not imported — both are absent upstream on purpose (see PROVENANCE.md).

## Screen map

| Screen | Repo files |
|---|---|
| Obys Experiment Space.dc.html (runner shell) | — (project-local) |
| Home / WebGL gallery | index.html, _extracted/inline-scripts/index-0*.js, assets/css/main.css, assets/img-b44/* |
| About | about.html, _extracted/inline-scripts/about-*.js, assets/css/main.css, assets/img/* |

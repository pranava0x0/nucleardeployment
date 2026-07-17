# UAT Baseline

Last run: 2026-07-17
Environment: local vinext development server at `http://localhost:3000`

## Core routes

| Flow | Expected result | Status |
| --- | --- | --- |
| Overview | Evidence-led homepage renders without a runtime dialog | Pass |
| Deployment pipeline | Eight named stages show meanings, counts, and linked company names | Pass |
| Companies | Six company cards render and TerraPower opens a linked project profile | Pass |
| Deployments | Six records render with search and stage controls | Pass |
| Project detail | Natrium and Ward 250 records show evidence, next gate, and source | Pass |
| Map | Six markers and six matching list records render | Pass |
| Federal action | Tracker renders with seven external source links | Pass |
| Capital + supply | Ledger renders with three external source links | Pass |
| Methodology | Definitions and stage method render | Pass |

## Interaction checks

| Interaction | Expected result | Status |
| --- | --- | --- |
| Primary navigation | Deployments and Map open without full reload errors | Pass |
| Pipeline scan | All eight stages expose stage number, name, meaning, and project count | Pass |
| Company links | Pipeline exposes six linked company names across active stages | Pass |
| Text search | `Natrium` narrows six records to one | Pass |
| Stage filter | Stage 6 plus the active query keeps the one matching physical record | Pass |
| Directory row | Clicking Natrium opens `/deployments/natrium-kemmerer` | Pass |

## Responsive checks

| Viewport | Checks | Status |
| --- | --- | --- |
| 768 × 1024 | Pipeline uses a compact 4 × 2 grid; field-note section label renders at 12px with no tracking; no body overflow | Pass |
| 375 × 812 | Pipeline becomes a labeled horizontal stage sequence; no body overflow | Pass |
| 1280 × 800 | All eight pipeline stages fit in one compact row; no body overflow | Pass |

Fresh browser-console errors after the clean restart: **0**.

## Screenshots

- `uat-screenshots/2026-07-17-home-desktop-viewport.png`
- `uat-screenshots/2026-07-17-home-mobile-viewport.png`
- `uat-screenshots/2026-07-17-map-tablet-viewport.png`
- `uat-screenshots/2026-07-17-pipeline-tablet.png`
- `uat-screenshots/2026-07-17-pipeline-mobile.png`
- `uat-screenshots/2026-07-17-home-desktop.png`
- `uat-screenshots/2026-07-17-home-tablet.png`
- `uat-screenshots/2026-07-17-home-mobile.png`

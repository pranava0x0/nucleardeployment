# UAT Baseline

Last run: 2026-07-17
Environment: local vinext development server at `http://localhost:3000`

## Core routes

| Flow | Expected result | Status |
| --- | --- | --- |
| Overview | Evidence-led homepage renders without a runtime dialog | Pass |
| Deployment pipeline | Eight named stages show meanings, counts, and linked company names | Pass |
| Companies | 15 company cards render with 36px names and linked project profiles | Pass |
| Deployments | 17 records render with search and stage controls | Pass |
| Project detail | Aalo and Unity records show program, evidence label, next gate, and source | Pass |
| Map | 16 mapped markers and 17 list records render; the undisclosed site is explained | Pass |
| Federal action | Tracker renders four orders and four DOE program records | Pass |
| Capital + supply | Ledger renders with three external source links | Pass |
| Methodology | Definitions and stage method render | Pass |

## Interaction checks

| Interaction | Expected result | Status |
| --- | --- | --- |
| Primary navigation | Deployments and Map open without full reload errors | Pass |
| Pipeline scan | All eight stages expose stage number, name, meaning, project count, and readable company names | Pass |
| Company links | Pipeline exposes 15 linked companies across active stages without duplicate Oklo links | Pass |
| Text search | `Aalo` narrows 17 records to one | Pass |
| Stage filter | Stage 7 plus the active query keeps the one matching operational record | Pass |
| Directory row | Clicking Aalo opens its project record with a company-reported LinkedIn source | Pass |

## Responsive checks

| Viewport | Checks | Status |
| --- | --- | --- |
| 768 × 1024 | Pipeline uses a readable 2-column grid; company names are 12px; no body overflow | Pass |
| 375 × 812 | Pipeline becomes a labeled horizontal stage sequence; company names remain 12px; no body overflow | Pass |
| 1280 × 800 | Pipeline uses a readable 4 × 2 grid; no body overflow | Pass |

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
- `uat-screenshots/2026-07-17-home-desktop-expanded.png`
- `uat-screenshots/2026-07-17-pipeline-desktop-expanded.png`
- `uat-screenshots/2026-07-17-home-tablet-expanded.png`
- `uat-screenshots/2026-07-17-home-mobile-expanded.png`
- `uat-screenshots/2026-07-17-pipeline-mobile-expanded.png`
- `uat-screenshots/2026-07-17-capital-desktop-expanded.png`
- `uat-screenshots/2026-07-17-companies-desktop-expanded.png`

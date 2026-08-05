# UAT Baseline

Last run: 2026-08-05
Environment: local vinext development server at `http://localhost:3000`

## Learned pathways

- **Verify accessibility by reading the tree, never from a screenshot.** The race
  board's whole a11y contract is the per-band megawatt figure in each figure's
  `aria-label`; a screenshot cannot show whether it is there or correct.
- **`:focus-visible` does not fire for programmatic `.focus()`.** A sweep that
  calls `el.focus()` and reads `outlineStyle` reports every element as having no
  focus indicator, which is a false negative. Dispatch a `keydown` first, or
  focus with `{ focusVisible: true }`, or read the `:focus-visible` rule itself.
- **The browser pane can be hidden on the operator's side**, which throttles the
  renderer: `scrollTo` silently no-ops and `computer` clicks time out after 30s.
  Computed styles, `getBoundingClientRect`, and the a11y tree stay reliable, so
  drive checks through `javascript_tool` rather than pixel interaction.
- **Count element overflow inside a scope, not across the page.** A whole-page
  overflow sweep at 375 px reports 74 elements, all inside the nav and stage
  pipeline, which are deliberate horizontal scrollers. Scope the query to the
  section under test and check `scrollWidth > clientWidth` for the page itself.
- **The dev server runs on port 3000, not the Vite default.** `.claude/launch.json`
  is set accordingly.

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

## Race board checks (2026-08-05)

| Check | Expected result | Status |
| --- | --- | --- |
| Board rows | 18 rows render, one per entrant, including entrants with no capacity at all | Pass |
| Honest zero | Homepage states "0 MWe operational across all 18 entrants" as text, not as an empty bar | Pass |
| Accessibility tree | Every bar is a named figure carrying exact per-band megawatts; rows are list items with headings and links | Pass |
| Undisclosed capacity | Aalo and BWXT announce "capacity not disclosed" rather than "0 MWe announced" | Pass (fixed this run, A11Y-003) |
| Gigawatt line | Lands at 83.2% of every track, identical across all 18 rows and all three viewports | Pass |
| Segment containment | No band segment extends past its own track at any viewport | Pass |
| Band encoding | Solid fill, 2px outline, and hatch are distinguishable without colour; legend matches the bars | Pass (fixed this run, UI-004) |
| Focus indicator | 2px solid outline via `:focus-visible` on every focusable control | Pass |
| Touch targets | Every board and dossier control is at least 44px tall under a coarse pointer | Pass (fixed this run, A11Y-002) |
| Dossier lanes | All seven lanes render on every entrant page, each with an explicit empty state | Pass |
| Placeholder leaks | No "undefined", "NaN", "Infinity", or "[object Object]" in visible text across all 30 pages | Pass |

## Responsive checks

| Viewport | Checks | Status |
| --- | --- | --- |
| 768 × 1024 | Pipeline uses a readable 2-column grid; company names are 12px; no body overflow; race board rows collapse to two columns with the state line beneath | Pass |
| 375 × 812 | Pipeline becomes a labeled horizontal stage sequence; company names remain 12px; no body overflow; race rows stack to one column; identity strip stacks; longest name (Holtec International) does not overflow | Pass |
| 1280 × 800 | Pipeline uses a readable 4 × 2 grid; no body overflow; race rows use the three-column layout | Pass |

Page weight, measured against `main` at commit e1c63f0:

| Page | Before (raw / gzip) | After (raw / gzip) |
| --- | --- | --- |
| `/` | 397.8 KB / 114.9 KB | 456.3 KB / 122.0 KB |
| `/methodology` | 384.4 KB / 113.4 KB | 404.2 KB / 116.8 KB |
| `/companies/oklo` | 377.2 KB / 112.1 KB | 407.8 KB / 116.8 KB |

The race board adds no client JavaScript. The whole delta is server-rendered
HTML and CSS. Transfer size stays within the 250 KB budget; the raw figure is
tracked in `issues.md`.

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

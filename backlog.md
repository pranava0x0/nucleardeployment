# Backlog

## Shipped beyond the first release

- [x] Add the financing layer (2026-08-11, `jam/nuclear-financing-analysis-a02636`): `/financing` with cost benchmarks by reactor class (FOAK/NOAK/actual/target), a sourced learning ladder, per-entrant contract readiness (model, government vehicle, commercial position, stated cost, labeled next-gate judgment), a contracting-mechanism catalog (in-use entries each with an executed example; pending awards and proposals laned apart), Price-Anderson and NEIL pool records, 7 underwriters, overrun history, and siting-by-class; six reports captured to `data/sources/reports/` with page-stamped quote tests; context tables (`capital`, `federalActions`, `programs`) brought under source validation. Record in `docs/financing-analysis-record.md`.

- [x] Add the expert information layer (2026-08-08, `jam/nuclear-info-platform-1891e1`): `/updates` evidence ledger merging proof and capital events with a month-grouped chronology and an every-project next-gate register; homepage stat strip, latest-developments strip, and next-gates preview, all derived from existing records; RSS feed, sitemap.xml, and robots.txt generated from the data with `--check` in `data:check`; per-page descriptions and production canonicals; JSON-LD (WebSite + Dataset on the homepage, breadcrumbs on slug pages); nav entries for Updates and Companies; footer site map with credit and correction CTA. Plan and persona analysis in `docs/plan-expert-info-platform.md`.
- [x] Show company names inside the deployment pipeline.
- [x] Add a sourced company directory and company detail pages linked to project records.
- [x] Add repository-path-safe static export and GitHub Pages deployment on every push to `main`.
- [x] Replace tiny all-caps section eyebrows and oversized gaps with a tighter reactor construction-log hierarchy.
- [x] Split reactor generation, scale, family, and operating role into separate project fields and filters.
- [x] Add a machine-readable source registry plus append-only web-search and agent-run history.
- [x] Replace the misleading schematic map with a regional location ledger until verified coordinates exist.

## BD layer follow-ups

- Derive `audit-prose.mjs`'s path list from the SEO route list instead of a
  second hardcoded array, so a new page cannot ship unlinted (TEST-005's
  durable fix). Medium.
- Browser-read the two bot-walled BD sources (Standard Nuclear 8-K on sec.gov,
  Radiant's factory blog) and record the reads (DATA-027). Medium.
- Texas fund award caps ($12.5M development / $120M construction) and the
  unfunded completion bonus are reported by law-firm summaries but absent from
  the cited ANS piece; source them from TANEO's own program documents and add
  the caps back to the record. Medium.
- The IEEE Spectrum remote-economics figures (village diesel ¢/kWh, eVinci
  first-unit estimate, the Bruce Power mine study) need a fetchable source
  before the remote sector plan can carry numbers again; candidates: the NEI
  report underlying the band, an Alaska Energy Authority rate report, or the
  CEEPR paper's own tables. Medium.
- Utah's state nuclear program (Operation Gigawatt) has no row; add it with
  primary sourcing beside NYPA and Texas. Low.
- Anthropic's grid-cost pledge needs a dated primary source before a frontier-
  lab row ships for it. Low.
- The oil-sands study's reported conclusion (SMRs not viable for SAGD under
  current market conditions) is only carried by a partisan blog; add the
  conclusion if Cenovus's own report or trade press publishes it. Low.
- Cross-link each BD buyer position to the company dossier of the vendor it
  names (Oklo, X-energy, Kairos, and the rest), mirroring the financing
  layer's dossier links. Low.
- Browser-read the Guam source (postguam.com, blocked at HTTP 429) and record
  the read (DATA-030). Medium.
- Revisit Guam if DOD gives the territory's government an official
  notification; the current position is a lawmaker/CDLO exchange, not a
  program. Revisit Diego Garcia and Kwajalein Atoll only if a live
  program, contract, or solicitation names either site; both were checked
  this pass and found to rest on a killed 2012 DARPA concept and a 2018
  Army report, not a current opportunity. Low.
- Puerto Rico's C.P. 1092 passed the House 2026-06-15 and moved to the
  Senate; add the Senate outcome (passed, amended, or died in committee)
  once known. Low.
- Verify CNMI Senate Joint Resolution 24-05 (advanced nuclear tech on
  Saipan/Tinian/Rota, tied to Project Janus) against a directly-read primary
  or press source, not a search-engine summary — every candidate source
  (nminewsservice.com, cnmileg.net) 403'd on two separate direct-fetch
  attempts. Ship as a Guam-style "Stated interest" position once read.
  Medium.
- Lithuania's Altra-SGE-GE Vernova Hitachi BWRX-300 MOU shipped with
  `date: null` because no directly-fetched source stated the signing date
  (only the neimagazine.com publish date, 2026-03-04, is confirmed); nucnet.org
  and altra.lt both 403'd. Pin the exact date once one of those sources is
  reachable. Low.
- Browser-read the two bot-walled sources behind SK Innovation's TerraPower
  term sheet (UPI, mbiz.heraldcorp.com both 403'd) to corroborate the
  WNN-sourced record already shipped. Low.

## UI follow-ups

- The BD and financing pages now use nested `.acc-sub` accordions and a
  jump-to sub-nav (see UI-007 in issues.md); the deployments, federal-action,
  capital, and updates pages were not audited this pass for the same
  scroll-length problem. Check their rendered length and apply the same
  pattern if any has grown long enough to warrant it. Medium.

## Financing layer follow-ups

- Surface each company's financing row on its own dossier page (a "How it gets paid" lane linking back to `/financing`), so a reader landing on a company page sees the model without switching pages. Medium.
- Re-add Holtec's advanced-to-date loan figure once the S-1 is browser-read and recorded (`DATA-026` in issues.md). Medium.
- ARC Act is tracked as a proposal; when the bill moves (committee, floor, enactment) the mechanisms row and any new program it creates need updating. A freshness canary on congress.gov bill status would make that loud. Low.
- The cost ladder ages fast: Lazard publishes annually, INL revises estimates, and the first Darlington/Kemmerer actuals will outrank every estimate on the page. Refresh the benchmarks when any of those land; `REFRESH.md` names the collections. Medium.
- Microreactor lane could carry the INL literature-review's cross-design ranges (captured but uncited beyond context) if a reader asks for design-level granularity. Low.

## Race board follow-ups

### From the 2026-08-06 UAT (measured, not guessed)

The board is the product, and on both breakpoints a reader has to scroll past
the masthead to reach it. Measurements below are from the built pages.

- [x] **High. Get the first board rows above the fold.** Done 2026-08-08 on `jam/nuclear-info-platform-1891e1`: compact masthead, headline stat strip beside the zero statement, slim board head. Measured in the dev build: first row at 531px on desktop (3 full rows inside a 1280×800 viewport, from 853px/1 row) and 893px on mobile (from 1,222px), with the filter at 763px, inside the first 812px screen. The zero statement stayed.
- [x] **High. Let a reader find one company without reading all 18 rows.** Done 2026-08-08: a type-to-narrow filter above the board matching company, design, lane, and technology. Server-rendered rows carry a precomputed `data-filter` haystack; the client component toggles `hidden`, so the dataset never ships to the client. Verified: typing "oklo" leaves exactly the Oklo row; clearing restores all 18.
- [x] **High. Move "How to read the bars" above the board.** Done 2026-08-08: a one-line swatch key sits above the first row with a "Full key" jump link; the full band table stays below the board.
- [x] **Medium. Keep the gigawatt line and band key in view while scrolling the board.** Done 2026-08-08: the key line and filter sit in a sticky bar (offset per breakpoint for the sticky header).
- [x] **Medium. Make the whole board row clickable** (UX-002 in issues.md). Done 2026-08-08 with a stretched company link over each row. The companion dossier back link (UX-001) followed on 2026-08-09.
- [x] **Medium. Cut the mobile page from 11.8 screens.** Done 2026-08-08, partially: the stage pipeline, federal orders, and capital panels collapse into `<details>`; the three-card milestones section was replaced by a shorter dated-events strip. Measured 11.1 screens at 375×812 with two new sections (latest developments, next gates) added; pre-board cost fell from 1,222px to 893px. Further cuts would trade away content that now has no other home above the fold.
- [ ] **Low. Give the board a sort control.** It ranks by strongest evidence, which is right as a default, but a reader comparing announcements or capital cannot reorder. A two-option toggle (evidence, announced capacity) would answer a common question without a new page.
- [x] **Low. Point the company dossier back link at the board** (UX-001). Done 2026-08-09: the dossier hero links "← Race board" to `/#race` beside "All companies", with a test on every entrant page.


- [x] Fix the 14 findings from the post-merge review of PR #6. Done 2026-08-06 on `chore/session-learnings`: link-checker classification and argument validation, `data:check` in CI, all deploy actions SHA-pinned, race-bar overflow marker, capped gigawatt progress, llms.txt URL derivation and pluralisation, plus four cleanup items. Each carries a regression test. Details in `issues.md` under REVIEW-002.

- [ ] Bring the stage pipeline's company chips up to the 44px touch floor. Measured 2026-08-05 at 375px: 31 links inside `.pipe-companies` render at 20 to 39px. Pre-existing and untouched by the race work, and the fix is not free, since 44px on every chip makes the pipeline cards much taller. Decide whether to raise the chips, make each card a single target, or document an inline exception in DESIGN.md. Priority: medium.
- [ ] Upgrade the remaining 52 trade-press citations to primary sources. Run `npm run data:press` for the queue. Eleven were upgraded on 2026-08-05; the rest need a company newsroom, regulator, or national-lab original located and read. Ten cite low-quality aggregators (tipranks, stocktitan, gurufocus, premieralts, techfundingnews, theaiworld, interestingengineering, manilatimes) and should go first. Priority: medium.
- [ ] Watch uncompressed page weight. The homepage is 456 KB raw against a 250 KB target, though only 122 KB gzipped. The 185 KB React framework chunk dominates and predates this work; revisit if the raw figure gates anything. Priority: low.
- [ ] Add the `permitted` band back when an entrant first holds an authorization with no physical work started. It was dropped because no entrant occupied it and an empty legend slot is worse than an absent one. Priority: low.
- [ ] Bootstrap a `REFRESH.md` for the race dataset via the data-refresh skill, so capacity claims, funding rounds, and proof events can be re-verified on a cadence rather than by hand. Priority: medium.
- [ ] Re-check Radiant's unit rating. The spec's synthesis table says 1.2 MWe and the microreactor fact pack says about 1 MWe; the site ships 1 because the pack is the research base. Priority: low.
- [ ] Revisit whether the board needs its own `/race` route once the roster passes about 25 entrants. It sits on `/` today, per the spec's one-surface preference. Priority: low.

## Data foundation

- [ ] Move the canonical dataset from `app/data.ts` into validated normalized records with entities for projects, designs, programs, milestones, commitments, licenses, funding, facilities, and sources.
- [ ] Add `captured_at`, `last_verified_at`, supersession, conflicting-date, and independent-verification fields.
- [ ] Build an idempotent source-to-public-data generator and run it twice in tests.
- [ ] Add historical snapshots so stage changes can be audited over time.

## Research expansion

- [x] Verify and add all 11 initial Reactor Pilot Program projects; distinguish project count from company count.
- [ ] Build the complete U.S. project census with NRC, DOE, utility, DoD, and national-lab sources.
- [ ] Build the global comparison from regulator/IAEA/country primary sources before publishing global counts.
- [ ] Add the full DOE program inventory, EO deliverable deadlines, congressional authorities, awards, and appropriation status.
- [ ] Add fuel-cycle and manufacturing facilities with project dependency links.
- [ ] Add company financing records, binding status, close dates, conditions, and valuation provenance.

## Product

- [x] Decide the LWR/SMR refocus. Resolved 2026-08-05 as a company-centric gigawatt race; the three blocking scope questions are answered in [docs/plan-gigawatt-race.md](docs/plan-gigawatt-race.md), and [docs/redesign-lwr-smr.md](docs/redesign-lwr-smr.md) keeps the measured scope analysis.
- [x] Implement the gigawatt race per [docs/plan-gigawatt-race.md](docs/plan-gigawatt-race.md). All five phases shipped 2026-08-05: race data layer, homepage race board, company race dossiers, methodology, and UAT. Decisions, deviations, and the defects found in review are recorded in [docs/gigawatt-race-implementation-record.md](docs/gigawatt-race-implementation-record.md). Remaining follow-ups are in "Race board follow-ups" above.
- [ ] Add a true geographic layer only after complete coordinates and accessible list parity exist.
- [ ] Add shareable URL filters and project comparison.
- [ ] Add CSV downloads and a public API after the normalized schema stabilizes.
- [ ] Add change log, source-monitoring queue, and editorial review screen.
- [ ] Add a 90-day / 18-month change view backed by historical snapshots.

## Quality

- [x] Upgrade Next.js off the range covered by the 2026-07-20 advisory (nine CVEs, four high, including the CVE-2026-64642 middleware bypass). Moved 16.2.6 to 16.2.12.
- [ ] **Medium.** Triage the 11 high `npm audit` findings in the build chain (`postcss`, `sharp`, `undici`, `miniflare`, `wrangler`, `js-yaml`, `brace-expansion`, `fast-uri`, `react-server-dom-webpack`). All are pre-existing and none reach the static export, but the count grew from 0 on 2026-07-17 without any dependency change. The `--force` path wants `@cloudflare/vite-plugin@1.50.0`, outside the stated range. See `security.md`.
- [ ] Pin the five `deploy-pages.yml` actions to full commit SHAs. They still use moving `@v4` / `@v5` tags in a workflow holding `pages: write` and `id-token: write`.
- [ ] Upgrade the `deploy-pages.yml` actions off the deprecated Node 20 runtime. Every run currently emits a forced-to-Node-24 warning.
- [x] Run the build and test gate on every pull request, not only on push to `main`, so a broken change cannot silently freeze the deployed site.
- [x] Add automated contrast checks for the text and semantic token pairs used in the UI.
- [ ] Add browser UAT at 375×812, 768×1024, and 1280×800 when browser testing is requested or available.
- [ ] Add link-liveness checks that classify dead versus blocked sources without treating HTTP 200 as fact verification.

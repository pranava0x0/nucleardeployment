# Financing layer: implementation record

What was built on 2026-08-10/11 against the owner's brief (costs by class,
contract readiness per company, mechanisms, pooled insurance, underwriters,
overruns, siting), and the decisions that shaped it. Research basis:
[docs/research/financing-landscape.md](research/financing-landscape.md), with
the per-company pipeline facts already in the three 2026-08-05 company packs.

## What shipped

- `app/financing-data.ts`: eight sourced collections — cost benchmarks by
  reactor class (FOAK / NOAK / actual / company target), the learning ladder
  (what 1→3, 5–10, 10+, ~30–50 units buy), per-company contract readiness for
  all 18 race entrants (model, government vehicle, commercial position, stated
  cost, next gate), 18 in-use contracting mechanisms each with an executed
  example plus 2 labeled proposals, the two live liability pools, 7
  underwriting institutions, 5 overrun records, and 6 siting facts.
- `app/financing/page.tsx`: renders all of it in the site's existing ledger and
  definition-grid idioms, microreactors first. No new CSS, no client JS.
- Six reports captured to `data/sources/reports/` as page-marked text with
  capture metadata (DOE Liftoff 2024, two INL cost reports, Lazard June 2025,
  NIA on the DOE financing office, Eash-Gates 2020). PDFs live in
  `work/reports/`, which is gitignored; the committed text is the evidence.
- Wiring: nav, sitemap, llms.txt section, and `scripts/lib/records.mjs`
  walkers, so financing sources go through the same validate / cache / claims /
  link-check gates as race records.
- Six new tests (58 total): rendered coverage of every section and company row,
  roster-to-matrix set equality, source hygiene, report-quote verification
  against the captured page, timeline key uniqueness, plus the sabotage pass on
  each (every guard watched failing and passing, with the mutation itself
  asserted to have landed).

## Decisions, and why

- **Estimates are a labeled lane, not Verification-tier facts.** Cost records
  carry `series` (FOAK / NOAK / Actual / Company target) and a `basis` naming
  who published the figure, instead of borrowing the race records' reporting
  enum. Lazard is not a regulator and a shareholder-deck target is not a
  government estimate; the lane label does the honest work. Nothing on the page
  is the site's own estimate, and the page says so.
- **The learning ladder is sourced rungs, not a curve.** The brief asked about
  n = 5, 10, 20, 50, 100. The literature supports specific rungs — 45–60% cost
  reduction by unit 3 (DOE), ~30% Vogtle unit 3→4 (Lazard), 5–10 committed
  units as the SMR liftoff threshold, ~30–50 for microreactor factories, and
  the Eash-Gates caution that U.S. nth-of-a-kind has historically cost more —
  so the page renders those with page-stamped citations rather than
  interpolating a curve nobody published.
- **`nextGate` is a judgment and is labeled as one** on every row ("Site
  judgment, derived from the records above"), per the facts / estimates /
  judgments rule. A test counts the label in both directions.
- **`dataAsOf` stays 2026-08-06.** The suite enforces that the dataset date
  reflects the newest record, and the financing layer adds nothing dated later.
  The report-capture date (2026-08-10) is stated where the captured copies are
  listed instead of moving the whole dataset's date.
- **Quote-lock uses PDF pages of the captured copy.** Report-backed records
  carry `{ reportSlug, page, quote? }`; a test recomputes every quote against
  the `--- PAGE N ---` block it claims. Quote spans deliberately avoid
  ligatures and soft hyphens in the extracted text ("ﬁrst" carries U+FB01; the
  45–60% figure carries a soft hyphen), which is why some quotes end
  mid-sentence.
- **New hosts got deliberate tiers; think tanks stayed press.** congress.gov,
  senate.gov, exim.gov, tn.gov, and cib-bic.ca are Government-reported;
  dspace.mit.edu is Institution-reported; counterparties (Duke, Wolverine,
  Bechtel, OSGE, Sizewell C, Dow's newswire) are Company-reported. Lazard, NIA,
  CATF, WNA, and NRECA default to press, which is the tier map's documented
  default for anything without a stronger claim.

## Defects found while building, all fixed here

- **Duplicate React key on the homepage** (`UI-008`): the latest-developments
  list keyed on source-plus-date, and Valar's equity raise and debt facility
  share one URL and month. The same collision was already solved for the RSS
  guid in PR #10; the list key missed it. Fixed with the label-suffixed key the
  updates page uses, guarded by a data-level uniqueness test plus a source-level
  check that both pages key on the triple (React keys never reach the HTML, so
  the seam is the source).
- **Three rotted source URLs**, found because the financing layer's first full
  cache-and-link pass swept everything: the WNA 14-banks press statement (404,
  replaced pre-commit with the association's live account), Deep Fission's own
  Endeavour announcement (connection error, replaced with the verified WNN
  account), and Holtec's Palisades loan release (404, replaced with DOE's loan
  page).
- **A latent mis-citation exposed by the rot**: the Holtec record carried
  "$784.8M advanced as of 2026-03-31" against a 2024-09-30 release that could
  never have stated it. The figure is dropped until a source that carries it
  (the S-1 needs a browser read) is cited. Same class as the one-URL-two-facts
  rule in CLAUDE.md.
- **Three context tables were never validated**: `capital`, `federalActions`,
  and `programs` cite sources but sat outside `sourcedRecords()`, which is how
  a rotted capital-table URL stayed invisible until a funding record cited the
  same page and the cache guard tripped. All three are walked now; 328 sourced
  rows total.

## Verified numbers

    58 tests pass (rendered + data + export), lint clean, data:check clean
    across 26 pages. Link check 2026-08-11: 164 sources, 138 live, 25 blocked
    (bot walls, recorded), 1 dead (the Holtec URL above, replaced same day).
    Six sabotage mutations: every one failed while planted and passed restored.

Regenerated from the gates on 2026-08-11. If these figures drift from the
suite, trust the suite and regenerate this block.

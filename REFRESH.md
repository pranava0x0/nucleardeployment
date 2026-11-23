# REFRESH.md

How to bring this dataset current. The generic procedure lives in the
`data-refresh` skill; everything specific to Deployment Core lives here.

Run every command from the repository root.

## The dataset in one paragraph

Everything ships from `app/data.ts`, `app/financing-data.ts`, and
`app/bd-data.ts`, plus `app/fission-data.ts` over curated fleet/family research JSON. There is no database and no fetch at runtime. `data.ts` holds
two layers: the older project records (`projects`, `companies`,
`federalActions`, `programs`, `capital`) and the race layer (`raceEntrants`,
`capacityClaims`, `fundingEvents`, `cashPositions`, `proofEvents`,
`statedTargets`). `financing-data.ts` holds the financing layer
(`costBenchmarks`, `learningRungs`, `companyFinance`, `mechanisms`,
`liabilityPools`, `underwriters`, `overrunRecords`, `sitingFacts`,
`capturedReports`). `bd-data.ts` holds the BD layer (`bdBuyers` with per-class
positions on a six-rung tier ladder, `bdSectorPlans`, `bdSignals`,
`bdMicroPath`), every export prefixed `bd` so the merged namespace stays
disjoint, with its own `bdAsOf` stamp that the sitemap and page carry.
`scripts/lib/records.mjs` merges all four modules, so every validate / cache /
claims / link command covers them; a BD buyer position's `verification` label
is checked against its source host the same way race records are. BD sector
plans keep theses, plays, and watch items as labeled site judgment; only
evidence lines carry sources, and a label must say only what its cached source
supports (the 2026-08-17 snapshot audit in `docs/research/bd-landscape.md`
lists eight claims that failed that check and how they were trimmed).
`raceBoard()` and `raceTotals()` derive everything the race pages show. No
component computes its own totals.

Report-backed financing figures cite a captured copy in
`data/sources/reports/<slug>.txt` (page-marked text plus capture metadata; the
PDFs live in gitignored `work/reports/`). A test verifies every cited page and
verbatim quote, so refreshing a report means re-extracting the text with
`--- PAGE N ---` markers and letting the quote test tell you what moved. When a
cost benchmark's publisher revises (Lazard is annual; INL revises; the first
Darlington or Kemmerer actuals will outrank every estimate), update the record
and recapture rather than editing figures in place.

## Before you touch anything

```bash
npm run build
npm test
npm run test:pages
npm run data:validate
```

Both `npm test` and `npm run test:pages` matter, not just one: `test` builds
with `vinext build`, `test:pages` builds with `next build` (the path CI's
GitHub Pages job actually uses) and runs a real `tsc` type check that
`vinext build` does not. A change to `app/data.ts` that types clean under
`vinext build` can still fail CI on a type error `vinext build` never
surfaces locally (2026-08-23: a `scale` field used the race-entrant lane
vocabulary instead of `ScaleClass`'s own, narrower enum).

Reuse installed dependencies when the lockfile is unchanged. If dependencies
are missing, refresh `security.md` and the advisory index before `npm ci`.

If `data:validate` reports errors before you start, fix those first. You cannot
tell your own breakage from inherited breakage otherwise.

## The commands

| Command | What it does |
| --- | --- |
| `npm run data:validate` | Every source is https, every reporting label matches its source host, every host is on a tier list. Exits non-zero on error. |
| `npm run data:press` | Lists records citing trade press, grouped by company. These are the upgrade queue. |
| `npm run data:links` | Fetches every source once, 2s per host, and appends the result to `data/research/link-check-history.jsonl`. Slow on purpose. |
| `npm run data:llms` | Regenerates `public/llms.txt` from the data. |
| `npm run data:seo` | Regenerates `public/sitemap.xml`, `public/robots.txt`, and `public/feed.xml` from the data. Run after any record change; `data:check` fails if they drift. |
| `npm run data:prose` | Reads the built HTML and fails on model-register words or em-dashes. Add `--stats` for sentence length. |
| `npm run data:check` | audit + source validation + llms/SEO sync + prose, in one pass. Run before every commit that touches data. |
| `npm run data:cache` | Fetch every cited source once and store a readable snapshot under `data/sources/`. Add `-- --url <URL>` for a single new record, `-- --stale 90` to re-fetch anything older than 90 days. |
| `npm run data:claims` | Check each record's figures, dates and names against its own cached source. Local store first, web only with `-- --web`. |
| `npm run data:news` | Freshness canary for "Latest developments": re-fetches every newsroom this dataset already cites and reports which ones changed since the last run. Detection only, see below. Add `-- --list` to print the derived watch list without fetching anything. |

## Adding or updating a record

1. **Find the primary source first, then write the record.** Order of
   preference: the regulator's own document (`nrc.gov`, `federalregister.gov`,
   `sec.gov`), then the agency or national lab (`energy.gov`, `inl.gov`), then
   the institution, then the company's newsroom, then trade press. Trade press
   is a real source. It is just never the best one available when the company or
   the regulator published the same fact.
2. **Copy the URL from the page you actually opened.** Never reconstruct one
   from memory. A plausible slug that resolves to a real but unrelated document
   is the failure mode that got furthest here: a source cited for Oklo's
   groundbreaking turned out to document a different event entirely, and it
   survived three review rounds.
3. **Cache the source, then read it.** `npm run data:cache -- --url <URL>` stores
   a snapshot under `data/sources/`, which is committed on purpose: it is the
   evidence, and it survives the page being rewritten. Then run
   `npm run data:claims -- --company <slug>` and read anything it cannot confirm.
   A 200 and a real file are not proof. Record the read in
   `data/research/link-check-history.jsonl` with a `content_check` field of
   `supports`, `partial`, or `does-not-support`.

   `data:claims` reports *unconfirmed*, not *wrong*. Sources paraphrase, spell
   numbers out, and put figures in images. Treat the list as a queue to read,
   never as a verdict.
4. **One fact per source.** If a record's label makes two claims, cite the
   source that carries both, or split the record. Five roster bases here cited a
   source that established only half of what they said.
5. **Set the reporting label from the host, not by eye.** `data:validate` will
   tell you if you got it wrong. Thirty-four records were wrong before it existed.
6. Run `npm run data:check`, then `npm test`.

## Rules the data has to obey

These are enforced by tests. Breaking one fails the build, which is the point.

- A megawatt sits in exactly one band, the strongest its evidence supports.
- Test and research reactors contribute 0 MWe. They are proof events, never
  capacity. A criticality is not electricity.
- A company-stated target never moves a megawatt between bands.
- Binding and non-binding capacity are never summed into one figure.
- `binding` is true if and only if the band is not `framework`.
- Equity, federal awards, federal loans, private debt, and unpriced filings each
  sit in their own frame and are never added together.
- A roster basis states what a company has, never what it lacks.
- Undated is a fact about the sourcing. Write `null`, never a guess.
- A band total may only drop with a supersession note in the count-floor test
  saying why.

## When a number changes

Band totals and ratios appear in prose in `README.md` and
`docs/gigawatt-race-implementation-record.md`. A test compares both against
`raceTotals()`, so a stale figure fails the build. Regenerate rather than
hand-edit: that number went stale four separate times before the test existed.

`public/llms.txt` regenerates with `npm run data:llms`. Do not edit it.

## Fleet, family and claim-audit maintenance

`app/fission-data.ts` reads the curated `fleet-2026-11-22.json` and `families-2026-11-22.json` packets under `data/research/`. Fleet observation dates differ from publication dates. EIA CSV row checks bind series, year, units, geography, frame and converted value; a real quote elsewhere in the file cannot approve a changed figure.

`npm run data:audit` validates the original 139-record worklist against its dispositions and current canonical objects. The original worklist and IDs stay immutable. When a legitimate correction expires an approval, read that claim's actual source and any other visible text relying on it, update the disposition rationale/final identity and canonical fingerprint, and retain source-specific exact excerpts. Do not regenerate approvals just to silence a failing check. The validator separately checks primary fleet/family quotations and EIA conversions. An unchanged snapshot keeps its original capture date.

## Known quirks

- `federalregister.gov` answers scripted fetches with a 200 and a "Request
  Access" page, which is worse than a refusal because it caches clean and proves
  nothing. `data:cache` now fetches its documented JSON API instead
  (`/api/v1/documents/<number>.json`) and a wall detector refuses to store any
  interstitial as a snapshot. If another host starts doing this, add its marker
  to `WALL_MARKERS` in `scripts/lib/source-cache.mjs`.
- Oklo migrated many releases from `/newsroom/news-details/.../default.aspx`
  to static `/newsroom/<slug>` pages. The November 2026 capture follows those
  redirects successfully. Copy the final URL from the actual page for new reads.
- The November 2026 inventory has 44 blocked sources, 11 PDF/binary sources,
  four timeouts, and one unavailable historical Lazard URL. See the dated
  refresh manifest rather than assuming these are empty results. Captured
  report quotations have their own deterministic checks.
- `gain.inl.gov` returns 403 to scripted fetches.
- The default dev port is 3000. If another project is listening on IPv4 there,
  use `npm run dev -- --port 4317` and the exact printed localhost URL. Assert
  18 `.race-row` elements before screenshots; an HTTP 200 may be another app.
- Tests import `dist/server/index.js`, so `npm run build` must run first.
- React splits interpolated text with `<!-- -->` markers and mirrors the whole
  document inside an RSC payload in a `<script>`. Strip comments before matching
  copy and strip scripts before counting occurrences.

## Checking for news (`npm run data:news`)

Run this whenever you want to know whether anything worth a new "Latest
developments" record has happened. It derives a watch list by truncating URLs
this dataset already cites down to their newsroom index (a `newsroom.`
subdomain, or a `/newsroom//press//news/` path segment), skipping wire
services and multi-company aggregators (`AGGREGATOR_HOSTS` in
`scripts/check-news.mjs`, seeded from the low-quality-aggregator list in
`backlog.md`) since their front pages churn regardless of what any tracked
company did. It never invents a URL: every watch root comes from a page a
person already opened and cited.

Each run hashes the fetched text and compares it against the hash from the
last run, committed in `data/research/news-watch.json`. A "changed" line means
go read that newsroom; it does not mean add a record. `--list` prints the
derived roots without fetching, worth a periodic skim since the derivation is
a heuristic and can pick up a page that is not actually the right company's
own newsroom (it has, at least once: a general SPAC-news site that happened to
carry Oklo's listing announcement; `AGGREGATOR_HOSTS` grew to cover that class
of miss, not just wire services, after a 2026-08-23 review).

A page whose extracted text is short or carries no plausible dated headline
reports `thin` instead of `unchanged`: hashing a client-rendered shell or a
menu-only stub would report silence as fact when the run never actually saw
the content. `thin` roots are still persisted (so the state is visible in the
committed file) but excluded from "changed"/"unchanged" semantics; the run's
output names them and suggests finding the site's own RSS/JSON feed instead.
A root that 403s or 404s is persisted too, with `first_seen_failing_at`, so a
newsroom that has been blocked for a month reads as exactly that in the
committed file rather than a fresh `checked_at` beside a stale hash. Roots no
longer derived (a citation was edited or removed) are pruned on every run, so
the committed file never drifts from what the script currently watches.

## What this refresh does not do

There is no scheduled job and no scraper that writes to the dataset. Sources
are read by a person or an agent, one at a time, because the whole product is
the claim that a human checked each number against its document.
`npm run data:news` finds where to look; it is a detector, not an ingester,
and it never touches `app/data.ts`, `financing-data.ts`, or `bd-data.ts`.
Automating the fetch would be easy; automating the judgement is what the site
exists to avoid.


## Learned patterns

- 2026-11-21: Restore `permitted` when a construction permit is issued but
  physical nuclear work is not documented. Migrate the existing claim, retain
  the historical source, keep permitted MWe out of `buildingMWe`, and include
  them in `executedMWe`. The independent frame test guards both definitions.
- 2026-11-21: Reconcile project records, roster descriptions, race claims,
  buyer positions, and finance gates together. Groves had a criticality event
  while its project record still described a pre-authorization reactor; Long
  Mott and Clinch River carried superseded permit-review language in several
  layers. A source-cache fetch alone cannot find these contradictions.
- 2026-11-21: Preserve prior cash observations and sort balances newest first.
  A milestone contract ceiling is not cash received or equity raised. Oklo's
  listing closes at approximately $306M gross, not its proposed $645M maximum.
- 2026-11-21: Lazard's current edition is July 2026, version 19.0, with the
  nuclear range on PDF page 7. Fetch with a browser user agent if needed,
  visually verify the chart, and recapture page-marked text plus accurate
  metadata. The 2025 edition remains historical; its original URL now 404s.
- 2026-11-21: The nested `.claude/worktrees` output polluted lint and local
  `_dump_*.mts` files polluted Pages type checks. Exclude those scratch paths
  from the relevant gates without deleting the user's files or worktrees.
- 2026-11-21: The native browser was unavailable on a locked Mac. The explicit
  headless fallback in AGENTS.md worked with an already-installed Playwright
  package and cached browser; no installation was needed. Wait for hydration
  before interaction, test tablet first, and verify DOM counts before capture.

- 2026-11-22: A sourcing correction must cover notes, examples, sector advice and methodology as well as labels. Grep the removed terms and every reference to the cited URL. A replacement source can also change the report date; do not carry a date from the previous article into the new record.
- 2026-11-22: Default-open family details and a flat company board remove discovery clicks. Test visibility, not just DOM counts. Section hash links must reveal a target that is itself a closed disclosure, and must work again after the reader closes it.

- 2026-11-22: An official company post on a general social platform needs verified authorship. Use an exact-URL exception for the archived official Antares post; do not upgrade an entire social host. Other posts retain the conservative default.

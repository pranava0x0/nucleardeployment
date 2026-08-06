# REFRESH.md

How to bring this dataset current. The generic procedure lives in the
`data-refresh` skill; everything specific to Deployment Core lives here.

Run every command from the repository root.

## The dataset in one paragraph

Everything ships from `app/data.ts`. There is no database and no fetch at
runtime. The file holds two layers: the older project records (`projects`,
`companies`, `federalActions`, `programs`, `capital`) and the race layer
(`raceEntrants`, `capacityClaims`, `fundingEvents`, `cashPositions`,
`proofEvents`, `statedTargets`). `raceBoard()` and `raceTotals()` derive
everything the pages show. No component computes its own totals.

## Before you touch anything

```bash
npm ci
npm run build
npm test
npm run data:validate
```

If `data:validate` reports errors before you start, fix those first. You cannot
tell your own breakage from inherited breakage otherwise.

## The commands

| Command | What it does |
| --- | --- |
| `npm run data:validate` | Every source is https, every reporting label matches its source host, every host is on a tier list. Exits non-zero on error. |
| `npm run data:press` | Lists records citing trade press, grouped by company. These are the upgrade queue. |
| `npm run data:links` | Fetches every source once, 2s per host, and appends the result to `data/research/link-check-history.jsonl`. Slow on purpose. |
| `npm run data:llms` | Regenerates `public/llms.txt` from the data. |
| `npm run data:prose` | Reads the built HTML and fails on model-register words or em-dashes. Add `--stats` for sentence length. |
| `npm run data:check` | validate + llms sync + prose, in one pass. Run before every commit that touches data. |
| `npm run data:cache` | Fetch every cited source once and store a readable snapshot under `data/sources/`. Add `-- --url <URL>` for a single new record, `-- --stale 90` to re-fetch anything older than 90 days. |
| `npm run data:claims` | Check each record's figures, dates and names against its own cached source. Local store first, web only with `-- --web`. |

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

## Known quirks

- `federalregister.gov` answers scripted fetches with a 200 and a "Request
  Access" page, which is worse than a refusal because it caches clean and proves
  nothing. `data:cache` now fetches its documented JSON API instead
  (`/api/v1/documents/<number>.json`) and a wall detector refuses to store any
  interstitial as a snapshot. If another host starts doing this, add its marker
  to `WALL_MARKERS` in `scripts/lib/source-cache.mjs`.
- About sixteen sources sit behind bot walls with no API. Those need a browser
  read, recorded in `link-check-history.jsonl`. `data:claims` lists them.
- `gain.inl.gov` returns 403 to scripted fetches.
- The dev server runs on port 3000, not the Vite default. `.claude/launch.json`
  is set for it.
- Tests import `dist/server/index.js`, so `npm run build` must run first.
- React splits interpolated text with `<!-- -->` markers and mirrors the whole
  document inside an RSC payload in a `<script>`. Strip comments before matching
  copy and strip scripts before counting occurrences.

## What this refresh does not do

There is no scheduled job and no scraper. Sources are read by a person or an
agent, one at a time, because the whole product is the claim that a human
checked each number against its document. Automating the fetch would be easy;
automating the judgement is what the site exists to avoid.

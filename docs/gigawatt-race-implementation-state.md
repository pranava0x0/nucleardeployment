# Gigawatt race — implementation state

Working notes for the session implementing [plan-gigawatt-race.md](plan-gigawatt-race.md).
Written 2026-08-05 so the work can be resumed cold by a different session or
model. Delete this file once all five phases have shipped and merged.

Branch: `jam/pr5-gigawatt-race-impl-b7799f`, based on PR #5's branch
(`jam/smr-deployment-tracker-231f6b`, fast-forward merged in, so merging this
branch closes #5 and #4 too).

Working directory is a git worktree:
`/Users/pranava/Projects/Nuclear Deployment/.claude/worktrees/merge-commits-to-main-129b00`

## Status

| Phase | State | Commit |
| --- | --- | --- |
| 1. Data layer | Shipped | `9af1547` |
| 2. Race board + homepage lead | Shipped | `6895ea3` |
| 3. Company race dossiers | Not started | — |
| 4. Methodology + copy pass | Not started | — |
| 5. UAT + design QA | Not started | — |

`npm run build && node --test tests/rendered-html.test.mjs` is green at 17/17.
`npm run lint` is clean. Nothing is pushed yet.

## Decisions taken this session, and why

These are deviations from the written spec. They are deliberate. Do not
"fix" them back without reading the reasoning.

### 1. The spec's six bands became a different six

The spec listed: operational, construction, permitted, review, contracted,
framework. Shipped instead:

    operational → construction → doe-authorized → review → contracted → framework

Two changes, both forced by the Codex review on PR #5:

- **`permitted` dropped.** No entrant occupies it. A band that exists only in
  the legend is the empty-legend-slot the project's own rules forbid. Add it
  back the day a permit-in-hand-no-work case appears.
- **`doe-authorized` added.** Codex's P2 was right that Oklo's Aurora-INL
  cannot sit in the same band as NRC-permitted Kemmerer: it has documented
  groundbreaking (government source) but its NRC combined licence is still in
  review. Ranking it beside Kemmerer overstated it; demoting it to `review`
  understated it, because a reactor is physically being built. A distinct band
  makes the DOE-versus-NRC distinction structural instead of a footnote, and
  it ranks correctly: NRC-permitted construction outranks a DOE-pathway build,
  which outranks a paper application.

`binding` is true if and only if the band is not `framework`. It means
"rests on an executed action", not "is a commercial contract". A test
enforces the iff.

### 2. Aalo-X's 10 MWe is in no physical band

Also from the Codex P2. The fact pack documents only a company-stated
*target* to begin construction in April 2026, and the spec's own rule says a
target never moves a megawatt. So Aalo Atomics is an all-zero-executed
entrant whose only claim is an unquantified framework. This is why the
construction total is **440 MWe, not the spec's ~450**.

### 3. Two tracks per row, not one bar

The spec asked for one stacked bar with a gigawatt line. That cannot work at
this data's scale: Oklo's 13,755 MWe of frameworks against TerraPower's
345 MWe of construction means any single linear scale renders every executed
megawatt invisible, and the gigawatt line lands at 7% of the width.

Shipped instead: the track runs to `raceScaleMWe` (1,200 MWe) so the
gigawatt rule sits at 83.3% and reads as a target with visible runway past
it. Executed bands fill the top track. Framework megawatts get their own
fainter track below, clipped at the track end, with the true figure always in
text beside it. This also enforces the project's "incompatible frames are
never summed" rule structurally rather than by discipline.

### 4. The freshness stamp is derived

`dataAsOf = "2026-08-05"` in `app/data.ts` is the single source. The site
header's `DATA / 2026.07` used to be hand-written and had already drifted a
month behind the data; it now derives from `dataAsOf`.

### 5. Research pack correction

`docs/research/company-packs-gen4.md` said three companies reached
criticality before the July 4 2026 goal, in two places. It is four —
Aalo's CTR went critical 2026-07-04 at ~12:20am. The ANS article naming
three published before that. Both lines now say four and cite DOE's own
fourth-criticality release alongside the ANS piece.

## What the data says (verified by running it, not by reading the spec)

    operational        0 MWe   across  0 entrants
    construction     365 MWe   across  2 entrants   (TerraPower 345, Kairos 20)
    doe-authorized    75 MWe   across  1 entrant    (Oklo Aurora-INL)
    review         1,235 MWe   across  4 entrants   (Holtec 600, X-energy 320, GVH 300, Nano 15)
    contracted         1 MWe   across  1 entrant    (Radiant, DIU/Air Force)
    framework     40,395 MWe   across 11 entrants

Announced-to-executed ratio is about **92:1** (the spec estimated 100:1).
The homepage derives this figure rather than hardcoding it.

Board order: TerraPower, Kairos, Oklo, Holtec, X-energy, GE Vernova Hitachi,
NANO, Radiant, then the ten all-zero-executed entrants alphabetically —
Aalo, Antares, BWXT, Deep Fission, Deployable, Last Energy, NuScale,
Terrestrial, Valar, Westinghouse.

Entrants with no capacity claim at all: Westinghouse, Deployable Energy,
Antares Nuclear. They must still render a row. A test asserts it.

## What shipped, file by file

- **`app/data.ts`** (+757 lines, appended after `stageCounts()`)
  - Types: `CapacityBand`, `RaceEntrant`, `CapacityClaim`, `FundingEvent`,
    `ProofEvent`, `CashPosition`, `StatedTarget`, `RaceRow`, `RaceBandCell`.
  - Data: `capacityBands` (6), `raceEntrants` (18), `capacityClaims` (27),
    `fundingEvents` (32), `cashPositions` (5), `proofEvents` (31),
    `statedTargets` (16).
  - Derived: `raceBoard(claims?)`, `raceTotals(claims?)`, `entrantFor(slug)`,
    `byDateDescending(records)`. Both aggregations take an optional claims
    argument purely so tests can pass a mutated set.
  - Constants: `gigawattMWe = 1000`, `raceScaleMWe = 1200`, `dataAsOf`.
  - Added `nuscale` and `gev-hitachi` to `companies[]` (now 26). Both have
    empty `projectSlugs` — **`/companies/[slug]` currently computes
    `Math.max(...[])` and will render `-Infinity` for them. Phase 3 must fix
    this.** They are not yet linked from any nav.
  - `date` is `string | null` on funding and proof events. Null means no
    source states one; it is never guessed. `byDateDescending` sorts nulls
    last.

- **`app/components/RaceBoard.tsx`** (new) — `RaceBoard` and a reusable
  `RaceBar` (takes `compact`, for the dossier in Phase 3). Exports
  `gigawattLinePercent` so every track on the site puts the line in the same
  place.

- **`app/page.tsx`** — orbit hero retired, `.masthead` + Vogtle context
  sentence + `<RaceBoard />` lead. Vogtle capacity and date are read from the
  project record, not typed in. Stage pipeline, recent milestones, federal
  orders and capital sections are unchanged below.

- **`app/globals.css`** — deleted `.hero`, `.hero-copy`, `.hero-core`,
  `.orbit*`, `.core-readout*`, `.hero-actions` and their two responsive
  blocks. Added `.masthead*` and the race board block (before the first
  `@media`), plus responsive rules at 1023px and 639px.

- **`app/components/SiteHeader.tsx`** — imports `dataAsOf`, derives the stamp.

- **`tests/rendered-html.test.mjs`** — 6 new tests, and the homepage test
  updated for the new lead. `companies.length` assertion 24 → 26.

## Traps already hit, so you do not hit them again

1. **React splits interpolated text with `<!-- -->`.** `0 MWe operational
   across all {n} entrants` renders as `...across all <!-- -->18<!-- -->
   entrants`. Any rendered-HTML test asserting on interpolated copy must
   strip comments first: `raw.replace(/<!--.*?-->/g, "")`. The race board
   test does this; copy the pattern.
2. **Two CSS tests constrain every rule you add.** No hex outside the `:root`
   block (use `var()` / `color-mix`), and no `font`/`font-size` under 12px.
   Check both before building:
   `python3 -c` over `app/globals.css` — the snippet is in the session log,
   but the tests catch it anyway.
3. `npx tsc --noEmit` reports 3 pre-existing errors in `db/index.ts` and
   `worker/index.ts` (missing Cloudflare ambient types). They are not yours.
4. The build is required before the tests: they import `dist/server/index.js`.

## Guards were proven, not assumed

Every new test was sabotage-checked: mutate the data, confirm the suite goes
red, restore. Six mutations run, six went red — wrong `binding` flag,
framework megawatts allowed into the sort, a criticality given capacity, a
criticality downgraded, an `http://` source, and a shrunk review band. The
mutation script also asserted the file actually changed, so none of the six
was a silent no-op. Re-run this after adding assertions in later phases.

## Next steps, in order

### Phase 3 — company race dossiers (`app/companies/[slug]/page.tsx`)

1. **Fix the empty-project crash first.** `Math.max(...companyProjects.map(...))`
   returns `-Infinity` when `projectSlugs` is empty, and `stageLabels[-Infinity - 1]`
   is `undefined`. NuScale and GE Vernova Hitachi hit this today. Render an
   explicit "no tracked project records" state instead.
2. Identity strip: design, unit MWe (+ `unitMWeNote`), lane, `rosterBasis`,
   `ticker` where present.
3. The company's race bar — reuse `RaceBar` with `compact`.
4. Gigawatt math, one line, derived: `row.unitsToGigawatt` is already computed
   as `Math.ceil(1000 / unitMWe)`. Never hand-write it.
5. Five dated lanes with sources, each with an explicit empty state:
   Funding (`fundingEvents` + `cashPositions`, kept in separate frames —
   raised vs awarded vs loaned vs cash on hand, never summed) · Licensing ·
   Physical progress · Pipeline (binding first, frameworks labelled) ·
   Company-stated targets (`statedTargets`, rendering `conflict` beside the
   target where present).
6. Proof events (`proofEvents`), including the non-U.S. design proofs, each
   carrying its `powerNote` so a criticality never reads as electricity.
7. Existing linked project records stay below, unchanged.
8. Gate: every entrant page renders every lane with an explicit empty state;
   lane dates descend; sources resolve.

### Phase 4 — methodology + copy

Add to `/methodology` under an `#race` anchor (the board's legend already
links to `/methodology#race`, so this anchor must exist): roster rule, the six
band definitions with authorities, binding vs non-binding, U.S.-only capacity
accounting, proof-versus-capacity, and the DOE-versus-NRC explanation
including why `doe-authorized` is its own band. Update README. Grep rendered
HTML for numbers without frame labels.

### Phase 5 — UAT + design QA

375 / 768 / 1280. Keyboard pass. Read the accessibility **tree**, not a
screenshot — the project's own rules say screenshots cannot verify a11y.
Page weight against the 250 KB budget. Update `uat.md`, `issues.md`,
`backlog.md`.

### Then

Push, open the PR against `main` noting it closes #4 and #5, let the Codex
bot review it, and expect a round or two of real findings — the project's own
notes say a self-review is the weakest review, and the last PR's bot found
two genuine P2s in a docs-only change.

## Still open / not decided

- The spec floated a separate `/race` route versus keeping the board on `/`.
  Shipped on `/` only, per the spec's "prefer one surface until the roster
  passes ~25 entrants". 18 entrants today.
- Radiant's unit rating: the spec's synthesis table says 1.2 MWe, the
  microreactor fact pack says ~1 MWe. Shipped 1, since the pack is the
  research base. Worth a second look if a better source appears.
- `uat.md` has not been touched yet; its pathways still describe the old hero.

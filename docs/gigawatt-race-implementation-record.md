# Gigawatt race: implementation record

What was built against [plan-gigawatt-race.md](plan-gigawatt-race.md), and where
the implementation deliberately departs from it. All five phases shipped
2026-08-05. Keep this file: the deviations below are decisions, not notes.

## Deviations from the spec, and why

### The six bands are not the spec's six

Spec: operational, construction, permitted, review, contracted, framework.
Shipped: operational, construction, **doe-authorized**, review, contracted,
framework.

- **`permitted` dropped.** No entrant occupies it. A band that exists only in
  the legend is the empty legend slot the project's rules forbid. Tracked in
  `backlog.md` to return when a real case appears.
- **`doe-authorized` added**, from the Codex review of PR #5. Oklo's Aurora-INL
  has documented groundbreaking but no NRC license, so it cannot rank beside
  NRC-permitted Kemmerer; calling it an application would ignore a reactor
  physically being built. A separate band ranks it honestly between the two and
  makes the DOE-versus-NRC distinction structural instead of a footnote. The
  methodology page explains it under "A DOE authorization is not an NRC license".

### Aalo-X's 10 MWe is in no physical band

Also from the Codex review. The fact pack documents only a company-stated target
to begin construction, and the project's own rule is that a target never moves a
megawatt. Construction plus DOE-authorized is therefore **440 MWe, not the
spec's ~450**.

### Two tracks per row, not one stacked bar

One linear scale cannot hold both 13,755 MWe of Oklo frameworks and 345 MWe of
TerraPower construction: every executed megawatt becomes invisible and the
gigawatt line lands at 7% of the width. Each row now has an executed track and a
fainter announced track, on the same scale but never summed. The track runs to
`raceScaleMWe` (1,200 MWe) so the gigawatt rule sits at 83.3% and reads as a
target with visible runway, rather than as the end of the bar.

### Research pack correction

`company-packs-gen4.md` said three companies reached criticality before the
July 4 2026 goal, in two places. It is four. The ANS article naming three
published before Aalo's July 4 criticality; both lines now cite DOE's own
fourth-criticality release alongside it.

## The numbers, verified by running the data

    operational        0 MWe   across  0 entrants
    construction     365 MWe   across  2 entrants   TerraPower 345, Kairos 20
    doe-authorized    75 MWe   across  1 entrant    Oklo Aurora-INL
    review         1,220 MWe   across  3 entrants   Holtec 600, X-energy 320, GVH 300
    contracted         1 MWe   across  1 entrant    Radiant, DIU and Air Force
    framework     40,395 MWe   across 13 entrants

Regenerated from `raceTotals()` on 2026-08-05, twice. The first version said 11
framework entrants, true of the buggy count and stale the moment the count was
repaired. The second still carried NANO's 15 MWe in the review band before that
claim was withdrawn. A number written beside the data it describes goes stale
silently; regenerate it rather than edit it.

Announced capacity runs about **24 to one** against everything resting on an
executed action, and about **92 to one** against what is actually being built.
Both are rendered, both labeled, and both derived rather than typed in. Three
entrants have no capacity claim at all (Westinghouse, Deployable Energy,
Antares) and still render a row.

## Defects found and fixed during this work

Logged in full in `issues.md`. Summarized because each one is a class, not an
incident:

- **A11Y-002.** The 44 px touch floor had never been applied anywhere in the
  stylesheet; every board and dossier control was 24 px at 375 px. Found by
  measuring in a browser, not by looking at one.
- **UI-004.** The legend swatch out-ranked the band rules on equal specificity,
  so the legend taught an encoding the bars did not use.
- **A11Y-003.** An unquantified framework announced itself to screen readers as
  "0 MWe announced" beside a visible caption reading "capacity not disclosed",
  telling a screen-reader user the opposite of the page.
- **The `-Infinity` stage.** A roster entrant with no tracked project computed
  `Math.max()` over an empty array. NuScale and GE Vernova Hitachi hit it.
- **Four unverified copy claims**, including a "forty times larger" that was
  really 27. Every figure in the methodology prose is now derived from the
  dataset.

## What the PR review caught that this session did not

Three P2 findings on #6, all reproduced before fixing and all real. They are
listed because the pattern matters more than the individual bugs:

- **A false claim inherited from the spec.** The homepage said Vogtle was "the
  only new U.S. nuclear this century." Watts Bar Unit 2 added 1,150 MW in 2016.
  The spec asserted it, and it was copied without checking, which is exactly the
  failure the project's "a spec's data assumptions are guesses" rule names. The
  spec now carries a dated correction so the next reader does not inherit it.
- **A row whose evidence contradicted its own headline.** Westinghouse was rated
  300 MWe on the AP300 while its roster basis read "AP300 has no named U.S.
  site." Now the 5 MWe eVinci, which is the company's only documented U.S.
  reactor program.
- **A fix applied to one of two render paths.** `/companies/[slug]` handled a
  projectless entrant; `/companies` still rendered an empty `<b></b>`. The
  session's own tests only covered the path it had edited, which is the
  "review scoped to the files I expect matter" blind spot.

A second round found a fourth, and the worst of them: **the source cited for
Oklo's 75 MWe did not support the claim.** The linked GAIN page reports an NRC
combined-license acceptance, not the 2025 groundbreaking the band rests on, and
that claim drives the board's third-place ranking. Content-verifying the rest of
the ranking-driving sources then found a fifth: the Kairos release cited for a
20 MWe figure states "up to 50 megawatts".

Both are the same defect, and it is the one the project's rules warn about most
directly: a real, reachable, plausible URL that does not say what the page says
it says. A link check cannot catch it. Only reading the source can. The
verification pass is recorded in `data/research/link-check-history.jsonl` with a
`content_check` field, so the next reader can see which sources were read rather
than merely fetched.

A third round found two more, and both were wider than reported. The review
named NuScale's roster basis as citing a source that did not establish it;
auditing that pattern across all 18 entrants found **five** bases making a
compound claim on a single-fact source. The review named the legend's entrant
count as excluding undisclosed-capacity frameworks; that was the same
zero-versus-unknown conflation already fixed in the aria-labels, missed because
the earlier fix was applied where the defect was reported rather than everywhere
the pattern occurred.

A fourth round found the widest one yet. The `Verification` enum had no value
for trade press, so press articles were labelled as government or company
reporting; the review named a single NucNet record, and deriving the tier from
the source host found **34 of 60 race records wrong**. The enum now has a
`Press-reported` tier, the host-to-tier mapping ships as data, and a test
recomputes every label rather than trusting the eye.

That is the lesson worth keeping. Five of the nine findings were reported as one
row and were really a class: one bad source became five, one miscounted band
became a conflation fixed elsewhere but missed here, one mislabelled article
became thirty-four. Treat a review finding as a sample, and grep for the pattern
before calling it fixed.

One review finding was wrong, and checking rather than complying was the right
call. It reported X-energy's review-band 320 MWe and the 320 MWe Cascade phase
inside its framework claim as the same megawatts counted twice. They are
different projects on different sides of the country that happen to share a
4 x 80 MWe rating: Long Mott is Dow's Texas site under NRC review, Cascade is
Energy Northwest's Washington site inside the Amazon framework, and the research
pack lists them as separate pipeline lines. The numbers stood. The labels did
not: two 320 MWe figures for one company, one named inside the other's label,
invited the misreading, so both now name their state.

A related caution: the first attempt at the relabel rewrote nine curated
`projects[]` records as collateral, because the script matched on indentation
rather than on section. It was reverted and rescoped. A mechanical fix needs a
boundary as much as a rule.

None of these seven were visible to a green test suite. Budget a review round
rather than treating a passing suite as the gate.

## Three tests were vacuous before they were fixed

Every new assertion was sabotage-checked: mutate the source, confirm red,
restore, with the mutation itself asserted to have landed. Three passed while
the thing they guarded was broken:

1. An empty-state check matched any "No … on record" anywhere on the page, so a
   deleted lane's empty state was covered by a different lane's copy. Replaced
   with a per-lane occurrence count, asserted in both directions.
2. A declaration-order check used `indexOf(a) < indexOf(b)`, which passes when
   `a` is deleted because `indexOf` returns -1. Both rules are now asserted to
   exist first.
3. An aria-label check compared the rendered output against the same function
   that generated it, so it could not fail. Replaced with assertions on literal
   text.

The pattern is the same each time: an assertion that describes the code rather
than the behavior. Worth re-running the mutation pass on any new guard here.

## Testing notes for whoever works on this next

- `npm run build` before `node --test`; the suite imports `dist/server/index.js`.
- React splits interpolated text with `<!-- -->` markers and mirrors the whole
  document inside an RSC payload in a `<script>`. Strip comments before matching
  copy, and strip scripts before counting occurrences, or you double-count.
- React escapes `&` and `'` in text. Compare against escaped strings.
- Two CSS tests constrain every rule: no hex outside `:root`, no font under
  12 px. A third now checks every `var()` resolves to a declared token, because
  an undefined custom property fails silently at paint.
- `:focus-visible` does not fire for programmatic `.focus()`. See `uat.md`.

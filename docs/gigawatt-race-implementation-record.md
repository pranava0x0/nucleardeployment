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
    review         1,235 MWe   across  4 entrants   Holtec 600, X-energy 320, GVH 300, Nano 15
    contracted         1 MWe   across  1 entrant    Radiant, DIU and Air Force
    framework     40,395 MWe   across 11 entrants

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

Two of the three were invisible to a green 24-test suite. The third was a fact
no test could check. Budget a review round rather than treating a passing suite
as the gate.

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

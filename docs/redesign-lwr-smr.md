# Redesign plan: focusing Deployment Core on LWRs and SMRs

Status: proposal, not implemented. Written 2026-08-05.

## The ask

Refocus the tracker on light-water reactors and small modular reactors.

## Read this first: LWR and SMR are different axes

`LWR` is a value of `family`. `SMR` is a value of `scale`. They are two of the
four taxonomy axes in `app/data.ts`, and the suite has a test named
"reactor generation, scale, family, and role stay separate" that exists
specifically to stop them being collapsed.

So "LWR and SMR" is not one filter. It is a union across two axes, and the
union has to be defined before anything can be built. Four of the eight LWR
projects are also SMRs; four are not.

Any redesign that folds these into a single "LWR/SMR" category breaks the
taxonomy rule the project already enforces in code.

## What the data says

Measured against the committed dataset on 2026-08-05: 28 projects, 24
companies. Every column is a count of what *survives* that scope.

| Scope definition | Projects | Companies | Criticality achieved | DOE pilot | Stage ≥ 6 |
|---|---|---|---|---|---|
| LWR family only | 8 / 28 | 7 / 24 | **0 / 4** | 2 / 11 | 1 / 9 |
| SMR scale only | 6 / 28 | 6 / 24 | **0 / 4** | 0 / 11 | 0 / 9 |
| LWR family **or** SMR scale (literal reading) | 10 / 28 | 9 / 24 | **0 / 4** | 2 / 11 | 1 / 9 |
| Grid-scale (Large reactor or SMR) | 9 / 28 | 8 / 24 | **0 / 4** | 0 / 11 | 2 / 9 |
| Grid-scale **or** LWR family | 11 / 28 | 10 / 24 | **0 / 4** | 2 / 11 | 2 / 9 |
| Commercial + demonstration role | 7 / 28 | 7 / 24 | **0 / 4** | 0 / 11 | 3 / 9 |

Three findings, in order of how much they should change the design.

**1. Every definition drops every criticality achievement.** All four projects
that have achieved initial criticality — Ward 250, Aalo Critical Test Reactor,
Antares R1 Mark-0, Unity — are non-LWR, non-SMR. The column is `0 / 4` on
every row. There is no definition of "LWR and SMR" that keeps any of them.

**2. Of the 9 projects that are physically real, 8 are not LWR or SMR.**
Stage ≥ 6 means construction, criticality, or operation. The full list:

| Stage | Project | Family | Scale | In scope? |
|---|---|---|---|---|
| 8 | Vogtle Units 3 & 4 | LWR · PWR | Large reactor | **yes** |
| 7 | Ward 250 critical experiment | Design TBD | Critical experiment | no |
| 7 | Aalo Critical Test Reactor | SFR | Critical experiment | no |
| 7 | Antares R1 Mark-0 | Heat-pipe | Critical experiment | no |
| 7 | Unity critical experiment | Design TBD | Critical experiment | no |
| 6 | Natrium · Kemmerer Unit 1 | SFR | Large reactor | no |
| 6 | Hermes 2 | FHR | Test reactor | no |
| 6 | Project Pele | HTGR | Microreactor | no |
| 6 | Molten Chloride Reactor Experiment | MSR | Test reactor | no |

**3. The literal reading drops 18 of 28 projects and 9 of 11 DOE Reactor
Pilot Program projects.** Verifying and adding all 11 pilot projects is a
shipped milestone in `backlog.md`. A hard filter deletes 9 of them.

## The tension this creates

`CLAUDE.md` states the project intent: *"Deployment Core explains how U.S.
nuclear projects move from announcement to operation."*

Filter to LWRs and SMRs and the site retains almost nothing that reached
operation. Nine of the ten surviving projects sit at stage ≤ 5 — permits,
siting awards, financial close. One has ever produced power.

The result would be a tracker about *announcements*, which is the exact thing
the project intent says it is not ("not an announcement counter").

This is not an argument against refocusing. It is an argument that the
refocus has to be **structural, not subtractive**. The advanced reactors are
where the physical evidence currently lives, and a site built on evidence
cannot delete its evidence base and still be the same product.

Two further constraints from the existing rules:

- **Count floor.** `CLAUDE.md` requires that total counts never drop against
  the previous commit for append-only datasets. Deleting 18 records violates
  that directly.
- **Stated inclusion criteria.** Every public count must state what it counts.
  Whatever scope is chosen has to be written into `/methodology` and into the
  label beside every number.

## Three options

### Option 1 — Hard filter

Delete the 18 out-of-scope records. Reduce the taxonomy to LWR and SMR.

- Smallest surface. One data edit, no new concepts.
- Costs the entire physical-progress evidence base and 9 of 11 DOE pilot
  records; leaves one operating project.
- Violates the count-floor rule and forces a rewrite of the DOE program test,
  which currently pins `projects.length === 28` and `pilotProjects.length === 11`.
- Not recommended. Recorded here because it is the literal reading of the ask.

### Option 2 — Two tracks, one spine *(recommended)*

Add a fifth **derived** axis, `track`, with two values:

- `Commercial deployment` — LWR family at any scale, or SMR/large scale at
  any family. 11 projects.
- `Technology proving` — everything else: test reactors, critical
  experiments, microreactor demonstrations. 17 projects.

Derived, not authored: one exported predicate in `app/data.ts`, no new
per-record curation, and testable in one assertion. It sits alongside
`generation` / `scale` / `family` / `reactorRole` rather than replacing any
of them, so the separation test keeps passing.

The site then leads with the commercial track and keeps the proving track as
a clearly labelled second lane, framed as what de-risks the first. That
framing is stronger than the current flat list: the four criticality
achievements become evidence *for* the commercial pipeline rather than
unrelated entries beside it.

- Keeps every record and the count floor.
- Delivers the requested focus at the level that matters — what the site
  leads with, defaults to, and counts by default.
- Costs one new derived field and a real editorial pass on page copy.

### Option 3 — Split into two products

Separate routes: an LWR/SMR commercial tracker and an advanced-reactor
proving tracker, sharing a dataset but not a homepage.

- Cleanest conceptual separation; each surface gets its own honest headline.
- Roughly doubles the page inventory and the maintenance surface, for a
  28-record dataset. Premature at this size.
- Revisit if the commercial track passes ~40 records.

## Recommended implementation, Option 2

Phased so each phase ships end-to-end and is independently reviewable.

**Phase 1 — Data layer.** Add `track` as a derived predicate and export in
`app/data.ts`. No record edits. Tests: assert the two tracks partition the
corpus exactly (11 + 17 = 28, no overlap, no record unassigned); assert the
four taxonomy axes still vary independently of `track`.

**Phase 2 — Counts and methodology.** Update `/methodology` to state the
inclusion rule in words, and change every headline count to name its track.
No number ships without its scope label. Test: grep the rendered HTML for a
bare project count with no adjacent scope word.

**Phase 3 — Home and directory.** `app/page.tsx` leads with the commercial
track through `StageCore`; the proving track moves to a labelled section
below with its own heading and its own count.
`app/components/DeploymentDirectory.tsx` gains `track` as its primary filter,
defaulting to commercial, with the toggle visible rather than buried — an
empty-looking directory that is silently filtered is worse than an honest
one.

**Phase 4 — Copy pass.** The homepage currently frames the corpus as one
pipeline. It needs to explain the two tracks in a sentence each, without
implying the proving track is lesser work. `DESIGN.md` rules apply: plain
journalistic headings, no eyebrow kickers, no badge pills.

Files touched: `app/data.ts`, `app/page.tsx`, `app/methodology/page.tsx`,
`app/components/DeploymentDirectory.tsx`, `app/components/StageCore.tsx`,
`app/deployments/page.tsx`, `tests/rendered-html.test.mjs`, `DESIGN.md`,
`README.md`.

Known test impact: the DOE program test pins `projects.length === 28`,
`companies.length === 24`, and `pilotProjects.length === 11`. Option 2 leaves
all three intact. Options 1 and 3 do not.

## Open questions

1. **Which scope?** The recommendation uses "LWR family or SMR/large scale"
   (11 projects). The stricter literal reading is 10. The difference is
   Natrium · Kemmerer — a large-scale SFR, the single most advanced non-LWR
   commercial project in the set. It belongs on a commercial track by
   maturity and not by technology.
2. **Do microreactors count as SMRs?** Eight projects are `Microreactor`
   scale, treated here as proving-track. Some industry usage folds
   microreactors under SMR, which would move up to 8 records across the line.
   This changes the headline count materially and should be decided
   explicitly, then written into `/methodology`.
3. **Should the proving track stay on the homepage at all**, or move to its
   own route with a link from the commercial view? Phase 3 assumes it stays.

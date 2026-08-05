# The gigawatt race: refocusing Deployment Core on SMR companies

Status: approved direction, specified 2026-08-05, implementation deferred to a
future session. Research basis in `docs/research/company-packs-*.md`.
Supersedes the open questions in [redesign-lwr-smr.md](redesign-lwr-smr.md);
that document's measured scope analysis still holds and is built on here.

## The decision

The owner's direction, 2026-08-05: focus the site on SMR companies and the
race to a gigawatt deployed/operational, showing each company's progress on
funding, criticality, deployments, and licensing.

This resolves the three questions that blocked the LWR/SMR plan:

1. **Which union defines the commercial track?** Neither taxonomy filter. The
   focus is a **company roster**, not a record filter: companies developing
   new-design commercial power reactors for U.S. deployment. The four
   taxonomy axes stay untouched and keep their separation test.
2. **Do microreactors count as SMRs?** In the race, yes — entrants race by
   **capacity**, so a 1.2 MWe Kaleidos and a 345 MWe Natrium compete on the
   same honest axis. Nobody's scale has to be argued into a category; the
   megawatts speak.
3. **Does the proving track stay on the homepage?** It becomes per-company
   evidence. Criticality achievements, test reactors, and DOME experiments
   render as dated proof events on the company that earned them,
   contributing 0 MWe to the race but visible exactly where a reader asks
   "is this company real?"

No record is deleted. The count floor holds. The stage pipeline remains the
project-level spine below the new lead.

## The product frame

**Question the site answers first:** which company will be first to put a
gigawatt of new-design nuclear on the U.S. grid, and how far along is each
one actually — not in announcements, in megawatts at each evidence level.

**The editorial anchor:** the last new gigawatt took Vogtle Units 3 & 4
eleven-plus years from license application to commercial operation
(2,234 MWe, the only new U.S. nuclear this century). The race board asks who
builds the next one, smaller and faster. Vogtle is context above the board,
not an entrant.

**The honest zero:** as of 2026-08, every race entrant has 0 MWe of
operational SMR capacity. The board must show that plainly. The race is
currently run entirely in leading indicators — construction, permits,
reviews, contracts — and the instrument's honesty about that *is* the
product's credibility. No band may borrow brightness from a weaker band.

### Capacity bands

Each entrant's race bar is a stack of disjoint capacity bands, strongest
evidence first. A megawatt appears in exactly one band — its strongest
supported state — and every band value carries a source.

| Band | Rule | Render |
| --- | --- | --- |
| Operational | Grid-connected commercial power | Solid, brightest |
| Nuclear construction | Construction permit + physical nuclear-island work | Solid |
| Permitted | Construction permit or equivalent authorization in hand, work not started | Solid, quieter |
| Under review | CP/COLA docketed and in active regulator review | Outlined |
| Contracted | Binding offtake, order, or equity-committed project not yet in review | Hatched |
| Framework | MOU / LOI / master agreement / announced target, non-binding | Hatched, faintest — labeled "announced, non-binding" |

Rules inherited from the project's data discipline:

- Binding and non-binding never merge. A 12 GW master agreement is a
  framework band, never a headline number beside operational capacity.
- Test reactors and critical experiments contribute 0 MWe to every band.
  They render as proof events, never capacity.
- DOE pilot-program authorization is a DOE pathway, not an NRC license.
  Bands record which authority granted what; methodology explains the
  difference.
- A company-reported target date never moves a megawatt between bands. Only
  a documented action does.

### Roster rule (goes in /methodology verbatim, in plainer words)

An entrant is a company with (a) a named new-design commercial power
reactor ≤ ~350 MWe per unit, and (b) a documented U.S. deployment program —
an NRC docket, a DOE authorization, a sited project, or a binding U.S.
customer. Test-reactor-only and fuel-only companies appear as proof-event
context on entrant pages, not as entrants. AP1000-class large reactors are
tracked context (the stage pipeline keeps them), not race entrants.

U.S. megawatts only. A U.S. vendor's foreign unit (BWRX-300 at Darlington,
Ontario) renders as a dated design-proof chip on the company dossier,
contributing 0 MWe to the U.S. race bar, because the site's claim is about
U.S. deployment.

Initial roster (subject to the fact packs): NuScale, GE Vernova Hitachi,
Holtec, Westinghouse (AP300 + eVinci), Terrestrial Energy, TerraPower,
X-energy, Kairos Power, Oklo, Aalo Atomics, Radiant, Valar Atomics, Antares
Nuclear, Deep Fission, Last Energy, Deployable Energy, Nano Nuclear, BWXT.
Natura Resources (MSR-100 program, stated 2029) and NuCube enter when a
sited U.S. commercial project or an executed order is documented; until
then they are proof-event context rows.

## Data model (future session, `app/data.ts`)

Keep the static TypeScript dataset as canonical; no database. Add four
record types and one derived aggregation. Do not modify existing `Project`
or taxonomy fields.

```ts
export type RaceEntrant = {
  companySlug: string;          // joins companies[]
  design: string;               // "Xe-100", "Aurora", ...
  unitMWe: number;              // nameplate per unit; the number sources state
  unitMWeNote?: string;         // "up to 500 MWe with storage boost", bounds kept as metadata
  lane: "Grid-scale SMR" | "Microreactor";
  rosterBasis: string;          // one sentence: why this company qualifies
  rosterSource: string;
};

export type CapacityClaim = {
  companySlug: string;
  band: "operational" | "construction" | "permitted" | "review" | "contracted" | "framework";
  mwe: number;                  // 0 is valid and renders as 0
  label: string;                // "Long Mott · 4 × 80 MWe", "Meta framework · Ohio"
  binding: boolean;             // must be false for framework, true for contracted+
  date: string;                 // YYYY-MM of the action that supports the band
  source: string;
  verification: Verification;   // reuse existing enum
};

export type FundingEvent = {
  companySlug: string;
  date: string;
  kind: "Venture equity" | "Public offering" | "IPO / listing" | "Strategic investment"
      | "Federal award" | "Federal loan" | "Cost share";
  amount: string;               // keep the frame in the string: "$1.02B IPO proceeds"
  counterparty: string;
  source: string;
};

export type ProofEvent = {
  companySlug: string;
  date: string;
  kind: "Criticality" | "Construction start" | "Fuel milestone" | "Permit / authorization"
      | "Design proof (non-U.S.)" | "Test program";
  label: string;                // "CTR zero-power criticality, INL"
  powerNote?: string;           // "zero-power" — never let a criticality imply electricity
  source: string;
  verification: Verification;
};
```

Derived, exported, tested: `raceBoard()` returns per-entrant band sums,
sorted by strongest-band progress (operational MWe, then construction, then
permitted, then review, then contracted; framework never affects sort). No
component computes its own aggregation.

Capital rules carry over from the existing capital taxonomy: funding events
are lanes, never summed across kinds. A company page shows "raised" (equity
lanes) apart from "awarded" (federal) apart from "loaned."

### Tests the data layer must ship with (extend `tests/rendered-html.test.mjs`)

- Band partition: for each entrant, bands are disjoint by construction —
  every `CapacityClaim` carries exactly one band; `binding` is `false` iff
  band is `framework` (and `true` for `contracted`); `mwe >= 0`.
- Source per claim: every `CapacityClaim`, `FundingEvent`, `ProofEvent`, and
  `RaceEntrant` has a non-empty https source; loader raises on off-origin
  junk the same way the existing source test does.
- The honest zero: `raceBoard()` currently returns operational 0 for every
  entrant; the rendered homepage must contain an explicit
  "0 MWe operational" statement, not an empty element. When the first
  operational megawatt lands, this test flips to asserting the number — the
  assertion is on explicitness, not on zero forever.
- Count floor: entrant count and per-band totals never drop against the
  committed dataset without a supersession record (reuse the pattern the
  project count test uses).
- Sort stability: framework megawatts must not change board order
  (regression: build two boards, one with frameworks zeroed, assert same
  order).
- Taxonomy separation: the existing "generation, scale, family, role stay
  separate" test keeps passing untouched.
- Every entrant renders: one race-bar row per entrant in built HTML, each
  carrying its MW text (aria rule below), including entrants whose only
  band is framework and entrants with all-zero bands.

## Pages (future session)

**Homepage.** The race board replaces the hero as the first screen — the
instrument leads, per DESIGN.md ("lead with the tool"). Order: masthead
line, Vogtle context sentence, the board, then the existing stage pipeline
(unchanged, it explains the machinery), recent milestones, federal orders,
capital. The orbit-core hero graphic retires; the board is the identity.

**/race** (or the board anchored on `/`): the full board plus band
definitions inline. Decide during implementation whether the homepage board
links to an expanded route or is the full board; prefer one surface until
the roster passes ~25 entrants.

**Company pages** (`/companies/[slug]`) become race dossiers, keeping the
existing directory URL scheme:

1. Identity strip: design, unit MWe, lane, roster basis, listing/ticker
   where public.
2. The company's race bar, same component as the board row.
3. Gigawatt math, one line: "1 GW ≈ 13 × 77 MWe modules" (derived
   `Math.ceil(1000 / unitMWe)`, never hand-written).
4. Five lanes, each a dated ledger with sources: Funding · Licensing ·
   Physical progress · Pipeline (binding first, frameworks labeled) ·
   Company-stated targets. Targets always render beside the latest
   regulator-documented state so a claim never floats free.
5. Proof events, including non-U.S. design proofs and test reactors.
6. Existing linked project records below, unchanged.

**/methodology** gains: roster rule, band definitions, binding vs
non-binding, U.S.-only capacity accounting, proof-vs-capacity distinction,
DOE-vs-NRC authorization explanation, and the "tracked sample" language the
project already requires on counts.

## Design direction

Surveyed 2026-08-05: Oklo (cinematic night renders, thin tracked wordmark,
sharp outlined CTAs — architecture-magazine register), Radiant (pure black,
single cyan accent, heavy grotesque — aerospace register), Aalo (warm
startup-modern), incumbents (corporate blue/white). Existing trackers in
this niche: a pilot-program "Race to Criticality" dashboard (11 reactors,
three DOE milestones, auto-updated) and smrintel.com's aggregator tables.

Positioning: every vendor site is a marketing surface and every existing
tracker is a scoreboard of one program. Deployment Core is the instrument —
the neutral evidence layer with the whole race on one axis. The design must
read as a newsroom-grade control room, not as a vendor site and not as a
hobby dashboard.

Rules, extending the reactor-control-dossier identity in DESIGN.md:

- **The gigawatt line is the one memorable move.** A fixed vertical rule at
  1,000 MWe on every board row and every dossier bar. Everything is read
  against it. No other decorative device competes with it.
- Band encoding: solid fill = physical/authorized; outline = under review;
  hatch = contracted/framework. Brightness ranks evidence. Never encode by
  hue alone; band name + MW figure travel with every segment (a11y rule
  below).
- Electric blue = motion and active review; safety orange = the current
  gate only (e.g., a hearing date this month). Framework bands stay in
  muted ink, never in accent colors — a 12 GW LOI must look quieter than a
  300 MW permit.
- Mono for megawatts, dates, and tickers; grotesque display for company
  names; humanist sans for explanation. System stacks only.
- Square corners, hairline rules, ceramic-paper light ground with midnight
  panels, per the existing identity. No gradients, no glass, no shadows, no
  hover-lift, no emoji, no badge pills, no eyebrow kickers.
- Each board row carries: company, design + unit MWe, the bar, rightmost a
  plain-text strongest-state line ("CP issued 2026-03 · 345 MWe under
  construction"). A reader with no color sees the same ranking.
- The zero state is written, not implied: the operational column header
  carries "0 MWe operational across all entrants, as of <build date>" until
  it doesn't.
- Accessibility: every bar is a labeled figure; `aria-label` carries the
  exact per-band MW ("Oklo: 0 operational, 0 construction, 75 under
  review, 1,200 framework non-binding"). Band segments are not the data —
  the text is. 44px touch targets under coarse pointers; visible focus.
- Mobile (375px first): rows keep the full-width bar with the gigawatt line
  compressed; the strongest-state line wraps under the bar; no horizontal
  scroll of the board; test with the longest company name and the largest
  framework number in the dataset.
- Performance: the board is server-rendered static HTML/CSS — no chart
  library, no client JS beyond the existing directory filter. Hatch
  patterns via CSS `repeating-linear-gradient`, not SVG libs. Page budget
  stays under the 250 KB target.

## Copy rules for the race surfaces

- Plain journalistic titles: "The race to a gigawatt", "Capacity by
  evidence level", "What each company has actually done." No cutesy
  section names, no "receipts."
- Every number states its frame inline: "announced, non-binding",
  "under NRC review", "DOE-authorized test reactor, 0 MWe."
- Targets attributed: "company-stated 2030" beside "NRC review ongoing";
  the site never averages a target into a prediction.
- The banned-word linter applies to quoted vendor copy too — paraphrase
  marketing language into measured English before it ships.

## Implementation phases (future session, in order, each shippable)

1. **Data layer.** Add the four types + records for the roster from the
   fact packs (`docs/research/company-packs-*.md`), each claim carrying its
   pack-verified source. Ship the data tests above. No UI change. Gate:
   `npm test` green including new assertions; count floor intact.
2. **Race board + homepage lead.** Board component (server-rendered),
   homepage reorder, hero retirement. Gate: rendered-HTML tests for the
   honest zero, per-row MW text, aria labels, no bare counts; 375px check.
3. **Company dossiers.** Extend `/companies/[slug]` with the five lanes,
   gigawatt math, proof events. Gate: every entrant page renders every lane
   with an explicit empty state; lane dates descend; sources resolve.
4. **Methodology + copy pass.** Roster rule, bands, accounting rules,
   updated homepage/README copy. Gate: grep rendered HTML for numbers
   without frame labels; banned-word linter.
5. **UAT + design QA.** Three breakpoints, keyboard pass, a11y tree read of
   the board, page-weight check against the 250 KB budget. Update
   `uat.md` pathways, `issues.md`, `backlog.md`.

Out of scope for that session: map layer, historical snapshots, CSV/API,
non-U.S. race boards, auto-refresh pipelines (a `REFRESH.md` bootstrap via
the data-refresh skill is the right follow-up once the race data layer
exists).

## Research basis

Per-company dated fact packs with verbatim sources, researched 2026-08-05:

- `docs/research/company-packs-grid-scale.md` — NuScale, GE Vernova
  Hitachi, Holtec, Westinghouse, Terrestrial Energy
- `docs/research/company-packs-gen4.md` — TerraPower, X-energy, Kairos
  Power, Oklo, Natura Resources
- `docs/research/company-packs-microreactor.md` — Aalo, Radiant, Valar,
  Antares, Deep Fission, Last Energy, Deployable Energy, NuCube, Nano
  Nuclear, BWXT

Landscape events verified inline 2026-08-05 (full trail in
`data/research/search-history.jsonl`):

- Four DOE-authorized criticalities by the July 4, 2026 EO 14301 goal:
  Antares Mark-0 (June 3–4), Valar Ward 250 (June 18), Deployable Energy
  Unity (June 30/July 1), Aalo CTR (July 4). All zero-power.
- NRC issued TerraPower's Natrium construction permit CPAR-1 March 9, 2026;
  DOE reported nuclear-island groundbreaking in April 2026.
- NRC staff recommended TVA's Clinch River BWRX-300 construction permit
  (SER June 2026); mandatory hearing scheduled August 13, 2026 — the
  nearest board-moving event after this writing.
- Holtec's Palisades SMR-300 (PIONEER 1&2) phased CP application with LWA
  docketed February 2026; Holtec holds a $400M DOE Gen III+ Tier 1 award
  (December 3, 2025, alongside TVA's $400M). Its IPO moved from
  confidential DRS filings to a public S-1 on July 10, 2026, targeting
  Nasdaq HNUC (pack finding). The existing 800 MW Palisades plant had not
  restarted as of July 8, 2026.
- X-energy completed a Nasdaq IPO April 24, 2026 (~$1.02B); Long Mott's
  environmental review closed with a FONSI May 2026.
- Meta announced framework deals January 9, 2026 with TerraPower, Oklo, and
  Vistra totaling up to 6.6 GW (Oklo share up to 1.2 GW, Ohio, first unit
  stated as early as 2030). Oklo × Switch master agreement (December 2024)
  frames up to 12 GW. All non-binding until executed project documents say
  otherwise.
- DOE expanded the Reactor Pilot Program into a longer-term program in
  March 2026, adding at least Deployable Energy and NuCube Energy.

### What the fact packs change about the board

Numbers below sum only within one evidence class; classes are never added
together. Per-company sources and conflicts live in the packs.

- **The honest zero holds everywhere.** 0 MWe of operational new-design
  capacity across all entrants as of 2026-08-05.
- **The construction band is ~450 MWe total**: TerraPower Kemmerer
  345 (NRC permit + construction since 2026-04-23), Kairos Hermes 2 demo
  ~20 (sources conflict 20 vs "up to 50"), Oklo Aurora-INL 75 (DOE pathway
  since 2025-09-22, NRC combined license still in review), Aalo-X 10 (DOE
  pathway). Everything else physical is a 0 MWe test article.
- **The review band is ~1,235 MWe**: Holtec PIONEER 600, X-energy Long
  Mott 320 (decision targeted 2026-11), TVA Clinch River 300 (hearing
  2026-08-13), Nano Nuclear KRONOS ~15.
- **Announced frameworks exceed 40 GW** across entrants (Oklo ~14 GW
  incl. Switch 12 GW; Amazon–X-energy 5 GW US; NuScale–TVA/ENTRA1 6 GW;
  Terrestrial–Riot 4 GW; TerraPower–Meta ≤2.8 GW + PacifiCorp IRP;
  GVH ~3.3 GW; Holtec 2.64 GW; Deep Fission–Endeavour 2 GW; Last Energy
  Haskell 600 MW; Kairos–Google 480 MW remainder; Valar–NVIDIA ~30 MW) —
  all explicitly non-binding. Roughly a 100:1 ratio of announced to
  under-construction megawatts is the single most important thing the
  board makes visible.
- **The contracted band is nearly empty.** Strict reading finds almost no
  executed, priced U.S. offtake below the review band: Radiant's DIU/Air
  Force ANPI unit (~1 MW, signed 2025-08-14, base contested) and little
  else. Differentiation today lives in construction, review, and proof —
  exactly where an evidence-first tracker is strongest.
- **All four criticalities are zero-power test articles** (0 MWe on every
  board bar): Antares Mark-0 (2026-06-04, at INL), Valar Ward 250
  (2026-06-18, the only one outside a national laboratory — the EO 14301
  "outside the labs" nuance belongs in methodology), Deployable Unity
  (2026-07-01, INL), Aalo CTR (2026-07-04, INL). Radiant's Kaleidos and
  Last Energy's PWR-5 had not confirmed criticality as of 2026-08-05.
- **Capital is bimodal and does not rank like physical progress.** War
  chests: Oklo ~$2.5B cash (Q1 2026), X-energy ~$1.02B IPO (2026-04-24,
  Nasdaq XE), Valar ~$1.78B disclosed after a $1B Sequoia-led round
  (2026-08-04, $6B valuation), Antares ~$604M after a $470M Series C
  (2026-07-28), Nano Nuclear $568.7M cash, NuScale ~$1.0B cash, Radiant
  ~$525M+. Floor: Deployable Energy reached criticality on ~$1.7M of
  founder funding. Funding lanes and race bars must stay visually
  independent — the correlation is weak and the board must not imply it.
- **The race is going public-markets-legible.** Listed or filing: Oklo,
  NuScale, X-energy (XE), Terrestrial (IMSR), Deep Fission (FISN,
  2026-06-18, after the 2025 SPAC route never traded), Nano (NNE), BWXT,
  GEV — plus Holtec's public S-1 (2026-07-10, targeting Nasdaq HNUC) and
  Westinghouse's confidential IPO filing (2026-07-31). Ticker belongs on
  the dossier identity strip.

### Entrant synthesis (details and sources in the packs)

| Company | Lane | Unit MWe | Strongest documented state | Capital headline (frame labeled) | U.S. MW: binding · framework |
| --- | --- | ---: | --- | --- | --- |
| TerraPower | Grid-scale | 345 | Nuclear construction, Kemmerer WY (start 2026-04-23; permit 2026-03) | $650M round 2025-06; DOE ARDP cost-share ≤$2B | 345 building · ~3,450 |
| Oklo | Microreactor→SMR | 75 | Aurora-INL construction under DOE pathway (2025-09-22); NRC COL in review | ~$2.5B cash Q1 2026 (public, OKLO) | 75 building (DOE path) · ~14,000 |
| Kairos Power | Grid-scale | 140 | Hermes 2 construction, Oak Ridge (2026-04-17); Hermes 1 deadline moved to 2029-04-30 | DOE ARDP $303M of $629M project; private total undisclosed | ~20 demo building · ~480 |
| X-energy | Grid-scale | 80 | Long Mott CP safety review; FONSI 2026-05-18; decision target 2026-11 | IPO ~$1.02B 2026-04-24 (Nasdaq XE) | 0 · ~5,000 US (11 GW US+UK stated) |
| GE Vernova Hitachi | Grid-scale | 300 | Clinch River SER complete 2026-06; hearing 2026-08-13; Darlington U1 (Canada) is design proof | Parent GEV (public) | 0 · ~3,300 |
| Holtec | Grid-scale | 300 | PIONEER CP application docketed 2026-02 (with LWA) | $400M DOE Tier 1; S-1 filed 2026-07-10 (Nasdaq HNUC) | 0 · ~2,640 |
| NuScale | Grid-scale | 77 | Only NRC-approved SMR design (77 MWe, 2025-05); RoPower FID 2026-02 is non-U.S. | ~$1.0B cash Q1 2026 (public, SMR); Fluor exited 2026-04 | 0 · ~6,000 |
| Westinghouse | Grid + micro | 300 / 5 | AP300 has no named U.S. site; eVinci first customer is Canadian (SRC, 2029); IPO filed 2026-07-31 | Brookfield/Cameco; $17.5B EXIM commitment is AP1000-only | 0 · 0 found |
| Terrestrial Energy | Grid-scale | 195 | RELLIS OTAs + ~77 acres secured 2026-06; missed 7/4 criticality goal | Public (IMSR), ~$571M cap | 0 · ~4,000 |
| Aalo Atomics | Microreactor | 10 | CTR criticality 2026-07-04 (INL); Aalo-X under construction | ~$133M total | 10 building (DOE path) · unquantified |
| Radiant | Microreactor | 1.2 | TRISO fuel at DOME 2026-07-01; criticality pending | ~$525M+ (Series D $300M+ 2025-12) | ~1 · 0 found |
| Valar Atomics | Microreactor | 5 | Ward 250 criticality 2026-06-18 (outside a national lab); company reports later electricity generation in an NVIDIA chip demo | ~$1.78B disclosed after $1B round 2026-08-04 | 0 · ~30 |
| Antares Nuclear | Microreactor | 0.2–0.3 | Mark-0 criticality 2026-06-04 (INL) | ~$604M after $470M Series C 2026-07-28 | 0 · 0 found |
| Deep Fission | Microreactor | 15 | Listed Nasdaq FISN 2026-06-18; test-well drilling; full-power target H1 2027 | $40M IPO proceeds | 0 · 2,000 |
| Last Energy | Microreactor | 20 | PWR-5 built at Texas A&M RELLIS; criticality pending DOE authorization | See pack | 0 · 600 (680 MW more is non-U.S.) |
| Deployable Energy | Microreactor | 1 | Unity criticality 2026-07-01 (INL) | ~$1.7M founder-funded | 0 · 0 found |
| Nano Nuclear | Microreactor | 15 | KRONOS CP application accepted 2026-05-20 (UIUC) | $568.7M cash 2026-03-31 (public, NNE) | 0 · 0 found |
| BWXT | Microreactor | 1.5 demo | Pele demo unit at INL; BANR 75 MWt | Public (BWXT) | 0 · Tata LOI unquantified |
| Natura Resources *(context)* | — | 100 planned | MSR-1 (1 MWt research) DOE NSDA 2026-07-21; MSR-100 stated 2029 | >$120M private + $120M Texas commitment | 0 · "multiple GW" unquantified |
| NuCube Energy *(context)* | — | 1.3 / 15 | Named DOE Launch Pad developer 2026-04-27 | ~$13M 2026-02 | 0 · 0 found |

Company-stated first-power targets worth rendering beside regulator state:
TerraPower 2030 (press coverage frames the NRC-told schedule as early
2031 — show the conflict), Oklo late 2027–early 2028 (stated 2025-03),
Kairos Hermes 2 operating by end 2027, Deep Fission full power H1 2027,
Natura MSR-100 2029, Meta–Oklo first Ohio phase "as early as 2030."

## Follow-ups routed elsewhere

- `backlog.md`: race-view items replace the blocked LWR/SMR decision item;
  historical snapshots and refresh automation stay backlog.
- `issues.md`: none opened by this plan; data corrections found during
  research land with the fact packs.

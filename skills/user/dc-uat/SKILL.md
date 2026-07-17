---
name: dc-uat
description: >
  Self-improving UAT for the DC Elections Tracker. Loads the learned pathways log from
  uat.md, runs all critical baseline flows plus randomized exploration, logs bugs to
  issues.md and ideas to backlog.md. Use when the user asks to run UAT, QA, test the UI,
  or find bugs on the DC Elections Tracker.
---

# DC Elections Tracker — Self-Improving UAT Skill

## What this skill does

Runs a focused UAT session on the DC Elections Tracker at `/Users/pranava/Documents/Projects/dc-elections-tracker/`. Each run:
1. Loads the learned pathways log from `uat.md`
2. Executes all critical baseline flows (never skip these)
3. Adds a randomized exploration layer on top
4. Logs new bugs to `issues.md`, ideas to `backlog.md`
5. Appends newly-discovered paths to `uat.md` so future runs are smarter

---

## Step 0: Load context

Always read these three files before doing anything else:

```
Read: /Users/pranava/Documents/Projects/dc-elections-tracker/uat.md
Read: /Users/pranava/Documents/Projects/dc-elections-tracker/issues.md
Read: /Users/pranava/Documents/Projects/dc-elections-tracker/backlog.md
```

Summarize what you know: open issue count, last run date, which areas are marked flaky, any sections not recently tested.

---

## Step 1: Start the dev server

Two launch configs exist in the worktree-root `.claude/launch.json`:
- **`dc-elections-tracker-dev`** — `npm run dev`, port 3000 (autoPort). Use for fast iteration.
- **`dc-elections-tracker-static`** — `npx serve -l 3000 dc-elections-tracker/out`. Use after `npm run build` to test the exact static export that GitHub Pages will ship. Preferred when you're verifying a UI change before committing.

Prefer `dc-elections-tracker-static` for any pass that exercises dynamic routes (`/elections/[race]/`, `/elections/[race]/[candidate]/`, `/issues/[slug]/`) — they're statically generated and faster to load than dev's on-demand compilation. Run `npm run build` first so the output is current.

⚠️ **Known constraint (interactive components)**: Client components in `next dev` may take 1–3 seconds to hydrate. Tools like `preview_click` that fire before hydration produce **silent no-ops** — the click event lands on a DOM node with no React handler attached. Confirm hydration before interacting:

```js
preview_eval: (() => { const el = document.querySelector('YOUR_SELECTOR'); return !!Object.keys(el || {}).find(k => k.startsWith('__reactProps')); })()
```

If it returns `false`, wait ~2s and retry. Two client components are interactive: the RCV simulator at `/issues/ranked-choice/` and the `AddressLookup` form on `/elections/`. The static server doesn't suffer this — hydration happens on the first render.

After starting: check `preview_logs` for errors, then take an initial screenshot.

### Three-viewport rhythm: always run all three

Every baseline run **must cover all three viewports**:

1. **Desktop pass (1280 × 800)** — `preview_resize width: 1280 height: 800`. Tests the canonical FiveThirtyEight-style layout: inline navigation, full tables, always-visible editorial sections, no `JumpStrip`.
2. **Tablet pass (768 × 1024)** — `preview_resize preset: "tablet"`. The most fragile of the three. Sits between the sibling-pair `sm:` and `lg:` thresholds. Wide-table regressions (UAT-011, UAT-012 history) show up here first because they technically pass at `sm:` but the table still doesn't fit the content area. Hamburger nav is active at tablet too — both NavBar (`<lg`) and the chip strip's `sm:hidden` produce different effects.
3. **Mobile pass (375 × 812)** — `preview_resize preset: "mobile"`. Tests the mobile patterns documented in `design.md`'s "Mobile patterns for dense data" section: chip-grid voting matrix, `<details>`-per-row candidate comparison, RCV results row-strip, `CollapsibleSection`-wrapped tertiary sections, `JumpStrip` chip strip, hamburger nav.

Run desktop first to establish the canonical layout, then tablet (catches the most regressions), then mobile to verify the responsive split. If a layout regression appears on one viewport only, it usually points to a Tailwind class missing the `sm:` / `lg:` qualifier — or a new always-visible block competing with a mobile-only block.

**Threshold rule for sibling-pair tables** (UAT-011 / UAT-012):
- Measure the table's natural width at the smallest viewport where you want it to display.
- If natural width ≤ 640px (rare — only narrow numeric tables qualify), threshold is `sm:` — mobile stack at `<sm`, table at `sm+`. Used by `RcvSimulator` results.
- If natural width > 640px (any table with multi-word column headers, full-sentence cells, or > 8 columns), threshold is `lg:` — mobile stack at `<lg` (covers phone + tablet), table at `lg+` only. Used by `VotingRecordMatrix` and `/elections/[race]/` comparison.
- When in doubt, prefer `lg:`. Sibling-pair render duplication is cheap; tablet horizontal scroll is the worst experience.

A combined desktop + tablet + mobile pass on the critical pages (home, /elections/, /officials/, one /issues/[slug]/, /elections/[profiled-race]/, one candidate profile) takes about 5–6 minutes of preview interaction.

---

## Step 2: Run all baseline flows (mandatory every run)

These must pass on every run. If any fail, that's a regression — log it in `issues.md`.

### BF-01 · Homepage loads cleanly
- Navigate to `/`
- Verify: hero headline, alert ticker animating, two countdown cards with >0 days, 3 latest cards, 6 issue cards, footer
- Check console for JS errors (`preview_console_logs level: error`)

### BF-02 · Officials page renders completely
- Navigate to `/officials/`
- Verify: 5 section groups, 28 total cards, party badges present on all cards
- Check for "Nonpartisan" badge overflow (known UAT-003)
- Verify the **Council voting record matrix** (BL-12) renders at the bottom of the page: 3 bill rows × 13 council-member columns, each cell shows a colored Y/N/P/·/A/E pill with `aria-label` and tooltip. Legend below the table lists all 6 vote types.
- On each Council member card, verify the `Voting record on N tracked bills` `<details>` mini-record (BL-01) — clicking expands to show one row per tracked bill with the vote pill, bill name, and date.
- Spot-check expected v1 votes: Secure DC (B25-0345) → Trayon White = `P` (Present), Crawford and Felder = `·` (Not in office). RENTAL Act (B26-0164) → Nadeau, Lewis George, Trayon White = `N`; everyone else who was in office = `Y`.

### BF-03 · Elections page renders completely
- Navigate to `/elections/`
- Verify: two countdowns, key dates list (should show future dates only), 12 race cards, "Side-by-side candidate positions" comparison section, registration links section
- Check that no past dates appear (filter bug would show stale dates)
- Each race card should either show a `<details>` with `N declared candidates` summary, or a "No declared candidates listed yet" footer (BL-03 ships v1 with all 12 races populated except Shadow Representative)
- Click open one `<details>` → verify candidates render alphabetically with party badge (e.g. blue D), name, optional `incumbent` label, and a right-aligned source link
- Spot-check: Mayor race should have ≥6 candidates including Janeese Lewis George and Kenyan McDuffie; Council At-Large (special) should show party "I" pills (Independent seat)
- Verify the per-candidate source link has `target="_blank" rel="noopener noreferrer"`

### BF-13 · Address lookup (BL-02)
- On `/elections/`, near the top, verify the "What's on your ballot" section with input + "Look up" button + privacy note mentioning corsproxy.io.
- Submit `1600 Pennsylvania Ave NW` — verify the result block renders Ward 2, ANC 2A, SMD 2A01, the address normalized to uppercase, an `aria-live="polite"` region with: "Races you'll vote on in 2026" listing 8 citywide races (no Ward 2 council seat — confirms 1/3/5/6-only logic), "How Brooke Pinto voted on tracked bills" with 3 Y/Y/Y rows, and a "Find your polling place at DCBOE" link.
- Submit a bogus address (e.g., `zzzzzz nowhere XYZ 99999`) — verify the "Address not found" card renders with the kicker label and body text spelling out "DC Board of Elections (DCBOE)" on first reference + the `dcboe.org/voters/where-to-vote` link.
- Disconnect the network and submit a valid address — should render the "Lookup service didn't respond" error card with the same DCBOE fallback link.
- Verify the lookup makes ONE outbound fetch on submit (to `corsproxy.io`), and ZERO outbound fetches on page load (check `preview_network`).
- ⚠️ corsproxy.io dependency — if requests start failing in bulk, check the network panel; corsproxy.io may have rate-limited or gone down. Track as BL-02-followup if it does.

### BF-12 · Per-seat race + candidate profile pages (BL-32, BL-42, BL-58)
- Navigate to `/elections/mayor/`. Verify hero (h1 "Mayor", race oneLiner, status), the 8-candidate grid (each card links to a profile), the 8-row positions table (one row per candidate × 6 issue columns), and the "External voter guides" section with ≥4 links (DCBOE, OCF, plus race-specific Ballotpedia / Wikipedia).
- Click any candidate card → verify the profile page (BL-58 slim layout). The page IA is:
  1. Breadcrumb + name h1 + **SocialIconRow** (circular inline-SVG icons for any populated `websiteUrl` / `governmentSiteUrl` / `twitterUrl` / `linkedinUrl` / `instagramUrl` / `facebookUrl` — wraps below the name on mobile, aligns right of the name at sm+) + party pill + filing status + (optional) `notes`
  2. **"What's happening" themes block** (always inline if `newsThemes` populated) — kicker `WHAT'S HAPPENING`, h2 `What we're tracking right now`, 1–2 themes each with a headline, optional detail, and chip links to the receipts
  3. **`Where they stand`** disclosure — kicker `POSITIONS`, meta `N of 6 stated`. Default **open** when N≥1, default **closed** when N=0. Body lists only the stated issues + a small italic footer naming the unstated ones. No more 6-rows-of-"No-position-stated" wall.
  4. **`Recent press & social`** disclosure — kicker `COVERAGE`, meta `N items · last 60 days`. Default **open** when news exists; the whole section is omitted if `candidate.news` is empty.
  5. **`About this candidate`** disclosure — kicker `REFERENCE`, meta `Bio · N links` (or just `N links` if no bio). Combines the former `Background` + `Links & filings` blocks. **Always default closed.**
  6. Footer strip: small muted "Other candidates for {race}" header (no h2), chip row of the other candidates, "← Back to {race} overview" link.
- **Spot-check Rini Sampath** (rich themes case): "What we're tracking right now" block shows the *Excluded from the Fox 5 / Georgetown debate* theme with the Austermuhle X link carrying a `SOCIAL` chip. Positions disclosure says `0 OF 6 STATED` and is collapsed. Coverage shows 5 items and is open.
- **Spot-check Gary Goodweather** (sparse case): no themes block, Positions disclosure collapsed (0 stated), no Coverage disclosure (no news), About disclosure collapsed. Total page height under ~1200px at desktop.
- **Spot-check Kenyan McDuffie** (rich+positions): themes block shows 2 themes, Positions disclosure default-open with 2 stated stances (Housing + Statehood), Coverage shows 7 items open, About collapsed.
- Click any disclosure summary → it toggles, chevron rotates, focus moves into the panel content (keyboard test).
- Click "← Back to {race} overview" → returns to the race page.
- Verify the other 3 profiled races also load and their candidate pages follow the same IA: `/elections/council-at-large-bonds/oye-owolewa/`, `/elections/council-ward-1/<any>/`, `/elections/us-house-delegate/<any>/`.
- Verify a non-profiled race's URL 404s cleanly (e.g., `/elections/council-chair/`) — only the 4 PROFILED_RACE_SLUGS render.
- On `/elections/` main page, race cards for Mayor / At-Large Bonds / Ward 1 / Delegate now show their candidates as profile links in the `<details>` panel, with a "See the full <race> page →" link at the bottom. Other races still show the plain-text candidate list.

### BF-11 · Candidate comparison matrix (BL-19)
- On `/elections/`, scroll to "Side-by-side candidate positions"
- Verify 3 race blocks render: `Mayor`, `Council At-Large (Bonds seat)`, `Council Ward 1`
- Each race block has 6 collapsed `<details>` issue accordions (Statehood, Public Safety, Housing, Budget, Transportation, Schools) — matches the site's 6 substantive issue pages, no `Ranked-choice` accordion
- Each summary line shows: issue title + one-line tag-line + `N/M stated` counter + ↓ chevron
- Expand any accordion → verify the expanded panel shows one candidate card per declared candidate in that race; sourced cells display the stance with an inline `[src]` superscript link, unsourced cells show `No position stated` in muted italic text
- The expanded panel ends with a `Read the <issue> brief →` mono link that navigates to `/issues/<slug>/`
- Spot-check v1 data: under `Mayor → Housing`, Janeese Lewis George and Kenyan McDuffie should have stated positions (2/8 stated); under `Mayor → Statehood`, Kenyan McDuffie and Vincent Orange should have positions (2/8 stated); under `Mayor → Transportation`, all 8 should show "No position stated" (0/8)
- The counter is data-derived — if a position cell shows a stance but the counter still reads `0/N`, the helper is broken

### BF-04 · Sources page renders completely
- Navigate to `/sources/`
- Verify: `74` unique sources shown, 6 topic sections

### BF-05 · Desktop nav intact
- At desktop viewport (1280px)
- Verify: 9 nav items visible, logo present, "ARE YOU REGISTERED?" CTA
- Click one nav item and verify it routes correctly

### BF-06 · Mobile hamburger nav works (UAT-002 fixed)
- Resize to `mobile` preset (375px)
- Verify the hamburger button is present in the header, and the inline desktop nav is hidden
- Click the hamburger and verify all 9 nav items render in the disclosure panel
- Tap one nav link, verify routing works
- If the hamburger disappears or the panel fails to open, regression — log in `issues.md`

### BF-07 · No JS errors on homepage
- Use `preview_console_logs level: error`
- Zero errors expected; log any new ones as issues

### BF-08 · No failed network requests
- Use `preview_network filter: failed`
- Zero failures expected; investigate any 4xx/5xx

### BF-09 · Ranked-choice voting page renders completely (BL-16)
- Navigate to `/issues/ranked-choice/`
- Verify these sections in order: hero h1 "Ranked-choice voting", 4 stat tiles (`1st`/`74%`/`5`/`8–4`, with `1st` in primary-orange as the alarm tile), "What changed" 3-card grid, "How tabulation works" 3-step numbered list, "Your ballot" paragraph, simulator section, "Common questions" FAQ (6 items), "Who decides" list (3 items), "Recent moves" timeline, "Live sources" grid (4 items)
- All external source links should have `target="_blank"` and `rel="noopener noreferrer"`
- ⚠️ **This page is a static route, NOT generated from `src/data/issues.ts`** — its content is inline in `src/app/issues/ranked-choice/page.tsx`. It will NOT appear in `allIssueSlugs()`.

### BF-14 · Mobile sibling-pair tables (Phase A)

Resize to mobile (375). Three tables should render as stacked cards instead of horizontal-scroll:

- `/officials/` — voting record matrix renders as **one card per bill** with a `grid-cols-4 gap-2` chip wrap of vote pills underneath. Each chip is `h-11` (44px) with the member's last name in a small caption. Hover/`title` carries the full vote description. The desktop table (`<table>` inside `div.hidden.sm:block`) is `display: none`.
- `/elections/[profiled-race]/` (e.g. `/elections/mayor/`) — "Issue-by-issue comparison" renders as **one `<details>` per candidate**, summary shows party pill + name + `N/6 stated` count. Expanding reveals all 6 positions stacked. The desktop comparison `<table>` is hidden.
- `/issues/ranked-choice/` after `Tabulate` — results render as **one row strip per candidate** with the `Winner` or `Eliminated R<n>` tag in the header and round counts as inline `R<n>: <count>` mono pills. An "Exhausted ballots" strip follows.

Failure mode: if you see horizontal scroll on any of these three pages at 375px, a Tailwind responsive class went missing.

Resize back to desktop (1280) and verify the same three pages now show the original `<table>` layouts and the mobile-only `<ul>` is `display: none`.

### BF-15 · Mobile collapsed-on-mobile sections (Phase B)

Resize to mobile. The following sections must render as **closed `<details>`** (kicker + h2 in the summary, content hidden until tap):

- `/issues/<slug>/` — "Who decides" (kicker `Power`), "Questions to put to candidates" (kicker `Ask`), "Live sources" (kicker `Reference`). The other three sections — stats hero, "What's at stake" (kicker `The fight`), "Recent moves" (kicker `Timeline`) — must be **always-inline** at every viewport.
- `/officials/` — each official card carries a `Background ↓` (or `Source ↓` if no notes) toggle holding the notes + source link. Voting record mini-record on Council cards stays as its own always-collapsible `<details>` (no `.sm:hidden` qualifier).
- `/elections/` — "DCBOE administration" stats and "Key dates" list collapse. Countdowns, "What's on your ballot" (address lookup), races, comparison, and registration links stay always-inline.

Resize to desktop. Same content renders **always-inline** (no `<details>` wrapping). The mobile `<details>` element is still in the DOM at `display: none` (sibling-pair pattern).

Failure mode: if a section is missing on one viewport but present on the other, the desktop block forgot `.hidden.sm:block` or the mobile `<details>` forgot `.sm:hidden`.

### BF-16 · Mobile JumpStrip + smooth anchor scroll (Phase D)

Resize to mobile. Under the hero on `/elections/` and `/issues/<slug>/`:

- `/elections/` chips: **Lookup · Races · Compare · Take action**
- `/issues/<slug>/` chips: **Stats · Stakes · Timeline**

Verify:
- Each chip is `h-10` (40px), mono uppercase, has `border-rule`.
- The strip is a horizontal-scroll `<nav>` (it overflows the visible width if you have ≥4 wide chips); chevrons/scrollbars are hidden.
- Tapping a chip jumps to the matching `id` further down the page (`#lookup`, `#races`, `#compare`, `#action`, `#stats`, `#stakes`, `#timeline`). Anchored sections carry `scroll-mt-16` so the sticky NavBar doesn't cover their headers.
- `html { scroll-behavior: smooth }` animates the jump. Under `prefers-reduced-motion: reduce`, the smooth scroll is disabled and the jump is instant.

Resize to desktop. The `JumpStrip` is `display: none` (sm:hidden).

Chips only link to **always-inline** sections — never to a `CollapsibleSection` (tapping a chip to land on a closed `<details>` summary is a worse UX). If a new always-inline section is added below the fold, add a chip; if it's collapsible, don't.

### BF-17 · Clickable race cards on /elections/ (P1 patch)

On `/elections/`, the 12 race cards split into two behaviors:

- **4 profiled races** (`mayor`, `us-house-delegate`, `council-at-large-bonds`, `council-ward-1`): the card header (title + status pill + tagline) is wrapped in `<Link href="/elections/<slug>/">` with a `SEE RACE PAGE →` CTA below. Hover applies `bg-bg` to the link area. Clicking anywhere in that area navigates to the race profile.
- **8 non-profiled races**: header stays static. No "See race page" CTA. The `<details>` disclosure is the only interactive region.

For both: the `<details>` disclosure ("N declared candidates ↓") is now a **sibling of the link/header**, not nested inside it. This keeps tap targets distinct.

Failure mode: if a card header navigates somewhere unexpected, check `profiledRaces.has(r.slug)` logic in `src/app/elections/page.tsx`.

### BF-18 · Candidate profile enrichment (BL-32 follow-on)

Navigate to a profiled candidate, e.g. `/elections/mayor/janeese-lewis-george/`:

- **Links & filings** section renders all populated optional URLs in order: `Campaign site → Government site → X / Twitter → LinkedIn → Instagram → Facebook → DC OCF — campaign finance → DCBOE filing → announcement source`. Each absent URL omits its entry without leaving a gap.
- **Recent coverage** section appears only when `candidate.news?` is populated with at least one item. When present: each row is `date · headline link · outlet ↗`, sorted newest-first. When absent, the section is omitted entirely (no empty-state placeholder).

Spot-check: JLG, Pinto, Robert White, Mendelson, Schwalb all have `governmentSiteUrl` seeded (dccouncil.gov / oag.dc.gov). Other candidates' "Government site" entry is absent until populated by the data-refresh skill.

### BF-19 · Voter walkthrough — first-time / casual voter (Persona 1)

Mock the path of a DC voter who has never been to the site before, one month out from the primary. Measure **clicks-to-answer** for each question and confirm the answer is correct.

For every question below, navigate from `/` (a fresh load) and record: (a) was the question answered? (b) how many clicks from home? (c) where did the answer land — was it discoverable without scrolling thousands of pixels?

**Q1.1 — "Am I registered?"**
- Expected: an "Are you registered?" CTA in the sticky header, linking to `https://www.dcboe.org/voters/register-to-vote` with `target="_blank"`. 1 click. Above the fold at every viewport.
- Failure: CTA missing or buried, OR link doesn't open in a new tab (would lose context for the voter on a phone).

**Q1.2 — "When is the primary? When's the registration deadline?"**
- Expected: two countdown cards (`UNTIL DC PRIMARY` / `UNTIL DC GENERAL`) above the fold with day counters; a small `Key dates` strip listing drop-box open / registration deadline / early-voting window. 0 clicks. Both dates rendered in mono.
- Failure: countdown showing past dates or 0 (date forgot to bump after the event), OR Key dates section absent on home.

**Q1.3 — "Where do I vote?" (highest-friction P1 question)**
- Expected (current state): voter clicks `Elections` → `What's on your ballot →` → enters address → submits → result includes a `Find your polling place at DCBOE ↗` link. 4–5 actions, no direct polling-place answer.
- **Aspirational state (BL-UAT-13 + BL-UAT-14):** a `Where do I vote?` CTA on the homepage hero next to `Are you registered?`. AND the address-lookup result resolves a concrete polling-place address inline. 1–2 clicks.
- Failure modes to watch for: CTA points to DCBOE root (not the polling-place page); polling-place link sends user to DCBOE without the address pre-filled, requiring re-entry; result block shows the link but the link's `aria-label` doesn't mention "polling place."

**Q1.4 — "What's on my ballot?"**
- Expected: voter clicks `Elections` (or the homepage CTA when BL-UAT-12 lands) → uses the `AddressLookup` component → submits a DC address → sees `Races you'll vote on in 2026`, `Your council member`, and the member's voting record. 2–3 clicks.
- Verify: the result lists exactly the 8 citywide races for any ward, plus the 1/3/5/6 ward-only race when applicable, and sets `sboeOnGeneralBallot` correctly. (See BF-13 for the strict assertions.)
- Failure: lookup not findable (no `JumpStrip` chip to `#lookup`); result missing the council-member section; lookup fires a fetch on page load instead of on submit.

**Q1.5 — "Can I vote right now, and where?" (phase-aware, added 2026-06-11)**
- Expected: during the voting window (mail ballots out → primary day), a `VoteNowBanner` (aria-label `How to vote right now`) renders on `/`, `/elections/`, and each `/elections/[race]/` page (compact variant on race pages). 0 clicks from home. Copy is phase-aware from `src/lib/election-phase.ts` + `BUILD_DATE`: mail-open → early-voting ("Early voting is open now", hours 8:30am–7pm, end date) → election-eve → primary-day ("Today is Primary Election Day", 7am–8pm). Includes a `Find a Vote Center ↗` link to the DCGIS nearby app.
- Self-clearing: before mail ballots and after primary day the banner must render **nothing** — verify no empty card/stripe remains.
- Failure: banner copy contradicts the build date's actual phase (e.g. "early voting is open" after June 14); banner missing during the window; hours not matching the DCBOE-sourced `importantDates` entries.

Mock the path of a voter who wants to learn about who currently represents them — accountability flow, NOT a campaign-comparison flow.

**Q3.1 — "Who is my Council member?"**
- Expected best path (current): voter clicks `Elections` → enters address in lookup → result names their council member. 3 clicks.
- Expected fallback path (current): voter clicks `Who currently holds office →` on homepage → lands on `/officials/` → must scroll through Executive, Council Chair + At-Large (5 cards), then Ward 1 through Ward 8 to find their ward. Page height: ~20,000px. No jump-nav, no anchor IDs, no per-ward TOC. **High friction.**
- **Aspirational state (BL-UAT-11):** `/officials/` has a chip-strip TOC under the h1 (`Executive · Council · Wards · Federal · SBOE`) + per-card anchors so lookup-result deep-links can target the exact member card.
- Verify: `document.querySelectorAll('h1, h2').length` ≥ 8 on `/officials/` (h1 + 5 group h2 + 2 trailing h2). If ≤ 4, UAT-018 is open and the page lacks semantic structure.

**Q3.2 — "When does their term end?"**
- Expected: on each official's card, a `TERM ENDS JAN <YYYY>` line in mono. Visible without expanding any disclosure.
- Verify SBOE rows specifically: the 2-year election cycle assigns Wards 1/3/5/6 a Jan 2027 term-end and Wards 2/4/7/8 + At-Large a Jan 2029 term-end. If any row inverts that pattern, the data has drifted from `sboe.dc.gov/page/board-biographies` (history: 6 of 9 SBOE rows were wrong in the data file before the 2026-05-17 officials refresh).

**Q3.3 — "How did they vote on a recent bill?"**
- Expected: each council card carries a `Voting record on N tracked bills ↓` disclosure (BL-01). Clicking expands to one row per tracked bill with the vote pill (Y / N / P / · / A / E), bill name, date. The page-bottom `Council voting record on tracked bills` matrix (BL-12) gives a 3-bill × 13-member overview.
- Verify v1 spot-checks: Secure DC (B25-0345) → Trayon White = `P` (Present), Crawford/Felder = `·` (Not in office). RENTAL Act (B26-0164) → Nadeau, Lewis George, Trayon White = `N`.
- Failure: matrix renders an orphan slug (any `memberSlug` not in `officials.ts`); a current council member missing from any row; a vote-pill rendering as raw text (`yes`) instead of the colored pill.

**Q3.4 — "Are they running for re-election?"**
- Expected: officials who are running for any 2026 office carry a `notes` string in the card body. Pattern after the 2026-05-17 officials refresh:
  - Running for same seat: `"Running for re-election in 2026."` (Mendelson, Schwalb, Frumin, Parker, Allen)
  - Running for a different seat: `"Running for <office> in 2026; ..."` (Pinto → Delegate; Robert White → Delegate; Lewis George → Mayor; Owolewa → At-Large)
  - Not running / retiring: `"Not seeking re-election; ..."` or `"Retiring; seat is open in 2026."` (Bonds, Nadeau, Norton)
- Failure mode: an official with a populated `candidateSlug` but no `notes` field (was UAT-NN before the 2026-05-17 refresh for Mendelson and Pinto). If you see a card with a candidateSlug FK and an empty notes line, the data-refresh skill missed an update.

### BF-10 · RCV simulator end-to-end interaction
- On `/issues/ranked-choice/`, wait ~2s for hydration (see Step 1 hydration check)
- Verify 5 candidate buttons render (Candidate A–E) with `aria-label="Rank Candidate X"` and a `—` rank badge each
- Click 3 candidates in any order; verify each gets a numbered rank badge (1st, 2nd, 3rd) and the orange "ballot preview" mono-text updates: `Your ballot: B › C › A`
- Click a ranked candidate again to clear; verify subsequent ranks shift down (3rd → 2nd, 2nd → 1st)
- Click `Tabulate`; verify a results section appears with `aria-live="polite"`, a heading `"Candidate X wins after N rounds of counting."`, a 5-row table (one row per candidate + Exhausted ballots), and a "Your ballot" panel below the table
- Verify the winning candidate's final-round cell is in primary-orange with bold weight
- Verify eliminated candidates' cells are struck-through in subsequent rounds
- Click `Try a different ballot`; verify all rankings clear and the results section disappears
- ⚠️ Known: `preview_click` can fail silently if hydration isn't complete — use the hydration check from Step 1 or fire via `preview_eval` with an `await new Promise(r => setTimeout(r, 150))` between clicks

---

## Step 3: Randomized exploration (pick 3–5 each run)

Each run, randomly select from the pool below AND from the "learned pathways" section of `uat.md`. Mix:
- **High-frequency paths**: things most users would do
- **Edge cases**: unusual inputs, timing-sensitive states, small viewports
- **Recently-changed areas**: check `git log --oneline -10` to see what changed since the last UAT run

### Exploration pool

**Navigation & routing**
- [ ] Click every nav item from the desktop nav, verify the page loads
- [ ] Click the logo from an inner page, verify it returns home
- [ ] Click "WHO CURRENTLY HOLDS OFFICE →" CTA on homepage
- [ ] Click all registration links on `/elections/` (verify they have `target="_blank"`)
- [ ] Try navigating to a nonexistent route (e.g., `/foo/`) — verify 404 or graceful handling
- [ ] Click "All recent moves →" and "All sources →" links on homepage sections

**Issue pages**
- [ ] Run `npm run build` via Bash — verify all 6 [slug] pages + the static `/issues/ranked-choice/` route generate, zero TS errors
- [ ] Load each of the 6 data-driven issue pages in dev (UAT-001 fixed) and confirm all sections render
- [ ] On an issue page: scroll through all sections (stats, what's at stake, who decides, recent moves, voter questions, live sources)
- [ ] Click a stat tile source link — verify external link opens correctly
- [ ] Click a "recent moves" source link — verify external link

**Ranked-choice page deep-checks** (BL-16)
- [ ] Edge case: rank only 1 candidate, hit Tabulate — verify the table renders and "Your ballot" panel shows correct round-by-round (likely vote stays with one candidate or becomes exhausted)
- [ ] Edge case: rank all 5 candidates, hit Tabulate — verify all 5 columns populated with no "—" cells in early rounds
- [ ] Edge case: try to click `Tabulate` before ranking anything — verify the button is disabled (cursor + opacity styling)
- [ ] Try ranking, then clicking a candidate twice to clear them, then click `Tabulate` — verify the renumber logic works
- [ ] Documented IRV scenarios — verify these expected results:
  - Empty ballot (just base electorate) → `Candidate B` wins
  - User ballot `[A, C, B]` → `Candidate A` wins (5 rounds, flips on tiebreak)
  - User ballot `[B, C, A]` → `Candidate B` wins (4 rounds)
- [ ] Check that the alarm-tile (`1st`) renders in primary color, while the other 3 stat tiles render in ink color
- [ ] Tab through the simulator using keyboard — verify each candidate button is focusable and Enter/Space triggers the rank
- [ ] Run `npm test` via Bash — confirm the full vitest suite still passes. RCV-related coverage spans three files: `src/lib/rcv.test.ts` (IRV algorithm, 9 tests), `src/lib/rcv-rankings.test.ts` (simulator state helpers — `nextRank` / `withoutRank` / `userVoteJourney` / `userBallotFromRankings`, ~14 tests), and `src/data/elections.test.ts` (candidate helpers + dataset integrity, ~15 tests). A test failure here is a red flag the algorithm or data refactor broke an invariant.

**Officials page deep-checks**
- [ ] Scroll to SBOE section — check "Nonpartisan" badge overflow (UAT-003)
- [ ] Verify the ANC footnote card at the bottom of the page renders
- [ ] Click "dccouncil.gov" source link on a council member card
- [ ] Check all party badge colors: D = blue, I = black/dark, R = orange-red, Nonpartisan = gray

**Elections page deep-checks**
- [ ] Verify only future dates show in Key Dates (no past dates leaking through)
- [ ] Check "special" race card has blue stripe (card-stripe-blue)
- [ ] Check "open" race card has red stripe (card-stripe-red)
- [ ] Verify `dcboe.org/candidates` link in the races section
- [ ] Expand every race's `<details>` once; check none crash, none show duplicate candidates, all candidate counts in the summary line match the rendered `<ul>` length
- [ ] Verify candidate sort is alphabetical by full name (case-insensitive; names with apostrophes/accents render correctly — e.g. "Leniqua'dominique Jenkins")
- [ ] Confirm grid layout doesn't break when a card with 8 candidates (Mayor) is expanded — neighbors in the row keep their height; only the expanded card grows
- [ ] Race cards use `self-start` so heights don't equalize; if you see neighbors stretching to match the tallest expanded card, that's a regression

**Candidate comparison deep-checks** (BL-19)
- [ ] Expand all 18 accordions in the comparison section once (3 races × 6 issues); none should crash or render duplicate cards
- [ ] Each issue accordion's expanded grid should show exactly `candidatesForRace(raceSlug).length` cards — one per declared candidate, alphabetical
- [ ] Sourced position cells must have a clickable `[src]` superscript opening in a new tab; check `target="_blank" rel="noopener noreferrer"`
- [ ] "No position stated" cells render in muted italic — should NOT have a source link
- [ ] The `N/M stated` counter on each summary must match the count of cells that actually have a `position[slug]` populated (test: `src/data/elections.test.ts` covers this invariant; if browser shows mismatch, the data file has drifted from the renderer)
- [ ] Clicking the `Read the <issue> brief →` link inside an expanded accordion must navigate to `/issues/<slug>/` and load that issue page successfully
- [ ] Editorial check: open every populated stance, verify ≤ 30 words and that the cited URL contains the candidate's own words (not a reporter's characterization) — this is the data-refresh skill's responsibility but UAT should sample-check 2–3 cells per pass

**Homepage scroll & data checks**
- [ ] Scroll to "Three things that just changed" — verify 3 latest cards, all have dates + headlines
- [ ] Scroll to "Six issues on the 2026 ballot" — verify 6 issue cards with correct stat in top-right
- [ ] Scroll to "Where this site stands" — verify GitHub issue tracker link present
- [ ] Check "UPDATED YYYY-MM-DD" matches today or build date
- [ ] Verify all upcoming dates in the small date list are genuinely future

**Responsive / a11y**
- [ ] Tablet viewport (768px) — check layout doesn't break
- [ ] 320px viewport (old iPhone SE) — check hero headline doesn't overflow
- [ ] Check tab order from keyboard: logo → nav items → CTA → alert ticker
- [ ] Verify `reduced-motion` preference stops marquee + pulseDot animations
- [ ] Check `aria-label` on countdown regions
- [ ] Check skip-to-content link (UAT-007 — expected absent until fixed)

**Performance / data integrity**
- [ ] Check `document.body.scrollHeight` on Officials page — if > 8000px, flag as a performance concern
- [ ] Count `<a target="_blank">` links — sudden large change could indicate data duplication
- [ ] Run `preview_network` for all pages — confirm no external runtime fetches (static site)
- [ ] Check for duplicate IDs: `[...document.querySelectorAll('[id]')].filter((e,_,a) => a.filter(x=>x.id===e.id).length > 1)`
- [ ] Check for missing alt text on any `<img>` elements

---

## Step 4: Write up results

### issues.md
- **New bugs**: Add using the UAT-NNN format (increment from current max ID)
- **Fixed bugs**: If an open issue now works, mark `status: resolved`, add `Resolved: YYYY-MM-DD`, and note what changed
- **Existing open bugs**: Update `Notes` column only if behavior has changed

Severity guide:
- `critical` — page crashes, data loss, auth failure
- `high` — major feature broken, entire page unreachable
- `low` — cosmetic, edge case, minor inconsistency

### backlog.md
- Add new ideas in the "UAT-sourced improvements" table using `BL-UAT-NN` IDs
- Assign priority (P1 = before June 16 primary, P2 = before Nov 3 general, P3 = post-election)
- Do NOT duplicate items already in the backlog

---

## Step 5: Update uat.md (self-improvement)

After every run, update `uat.md`:

1. **Set `_Last run:` to today's date**

2. **Update `last_tested` for every section you visited**

3. **Add newly-discovered paths to the exploration pool** — if you found something worth testing again (a tricky edge case, a newly-added component, an area where a bug was fixed), append it under "Paths to try next run"

4. **Promote stable newly-tested flows to Critical Flows** — if you ran something 2+ times without incident and it represents a key user journey, move it from exploration into the BF-NN baseline list

5. **Append to "Patterns noticed"** — any recurring behavior, surprising rendering, or data quirk worth knowing

6. **Remove stale exploration items** — if you've run a path 3+ times with no issues, and it's low-risk, you can drop it from the exploration pool (it's already baked into baselines or not worth repeated testing)

---

## Step 6: Report to user

Concise summary:
- Pages tested (list)
- New bugs found (ID + one-line summary)
- Bugs fixed since last run (if any)
- `uat.md` updates made
- One recommendation for what to fix first

---

## Key project facts (stable reference)

```
Project path:     active worktree under /Users/pranava/Documents/Projects/DC Elections Tracker/.claude/worktrees/<name>/dc-elections-tracker/
                  (main checkout is also at this hierarchy; `git status` to confirm which branch)
Stack:            Next.js 14.2.13 App Router, output: "export" (prod only), Tailwind 3, TypeScript strict
Dev port:         3000 (autoPort enabled in launch.json — falls through if taken)
Launch configs:   dc-elections-tracker-dev (npm run dev) · dc-elections-tracker-static (npx serve out/)
                  Both defined in .claude/launch.json at the WORKTREE ROOT (not the project subdir).
Routes:           / · /issues/[slug]/ (6 slugs) · /issues/ranked-choice/ (static, BL-16) · /officials/
                  /elections/ · /elections/[race]/ (4 profiled races, BL-32) ·
                  /elections/[race]/[candidate]/ (24 candidate profiles, BL-32) · /sources/
Data files:       src/data/issues.ts · officials.ts · alerts.ts
                  elections.ts — races2026[] (Race {slug, office, status, oneLine}) + candidates2026[]
                  (Candidate {name, raceSlug FK, party, filingStatus, source, optional ocfUrl/dcboeUrl/
                  websiteUrl/governmentSiteUrl/twitterUrl/linkedinUrl/instagramUrl/facebookUrl/notes/
                  incumbent/bio/positions/news}). NewsItem {date ISO, outlet, headline, url}.
                  Helpers: candidatesForRace(slug), getRaceBySlug(slug), getCandidateBySlug(slug).
                  src/lib/rcv.ts — BASE_ELECTORATE + IRV algorithm (unit-tested in rcv.test.ts)
RCV page note:    /issues/ranked-choice/ content (stats, FAQ, recent moves, sources) is INLINE in
                  src/app/issues/ranked-choice/page.tsx — NOT in src/data/issues.ts
Key components:   NavBar · AlertTicker · Countdown · IssueCard · IssueDetail · LatestCard · Footer
                  RcvSimulator (BL-16, "use client", IRV simulator on /issues/ranked-choice/)
                  AddressLookup (BL-02, "use client", inline on /elections/ — only client component
                  that makes a network request; user-triggered fetch via corsproxy.io to MAR API)
                  CandidateComparison (BL-19, server component, renders 3 race blocks × 6 issue
                  accordions inline on /elections/)
                  VotingRecordMatrix + MemberVotingMiniRecord (BL-12 + BL-01, server components,
                  3-bill × 13-member matrix inline on /officials/, plus inline <details> per
                  council card showing that member's record)
                  CollapsibleSection (BL-48 Phase B, server component, sibling-pair <details> at
                  <sm and always-visible block at sm+ — used in IssueDetail and /elections/)
                  JumpStrip (BL-50 Phase D, server component, sm:hidden horizontal-scroll anchor
                  chips — used in /elections/ and IssueDetail)
Mobile patterns:  see design.md "Mobile patterns for dense data" — chip wrap-grid (voting matrix),
                  <details> per row (race comparison), row strip with inline pills (RCV results),
                  collapsed-at-mobile section (CollapsibleSection), JumpStrip chip strip.
                  Section spacing site-wide: mt-8 sm:mt-12 lg:mt-14. Source attribution links use
                  text-xs (12px) with py-1 padding. Hero h1 on page-level /officials/ + /elections/
                  is text-3xl at mobile, text-5xl at sm, text-6xl at lg.
Known issues:     UAT-017 stale Mayor oneLine count · UAT-018 /officials/ group titles not semantic <h2>
Resolved (recent): UAT-001 issue pages dev crash · UAT-002 no mobile nav · BL-27 broken register CTA
Primary date:     2026-06-16
General date:     2026-11-03
```

---

## Learned pathways log

_This section is updated automatically each run. Do not delete — it is the skill's memory._

### Run 2026-05-10 (first run)

**What was tested:**
- Homepage (desktop + mobile 375px)
- Officials page (desktop)
- Elections page (desktop)
- Sources page (desktop)
- Issue pages (dev mode — all crashed)
- Mobile viewport for all static pages

**What was discovered:**
- Issue pages crash in `next dev` with `output: export` (Next.js 14.2.x bug) — affects all 6 dynamic routes
- No hamburger/mobile nav at any viewport <1024px — users cannot reach /issues/*, /sources/ on mobile
- "Nonpartisan" overflows the small party badge chip — SBOE section of Officials page
- "Five weeks until the primary" headline is hardcoded static string
- Dead code in `path()` helper (unreachable https guard)
- Raw slug in IssueCard/IssueDetail kicker ("public-safety" not "Public Safety")
- No skip-to-content link for keyboard nav
- Screenshot tool doesn't capture scrolled viewport — use `preview_snapshot` + `preview_eval` DOM queries instead
- `preview_eval window.location.href = '/path'` leaves stale error overlay — use `window.location.replace()` instead

**Paths that worked reliably:**
- `window.location.replace('/page/')` for navigation (better than `.href =`)
- `preview_eval` DOM queries for below-fold content audit
- `preview_snapshot` for full page structure audit
- `preview_network filter: failed` for catching broken requests (none found)

**Paths NOT yet tested:**
- Issue pages in build mode (npm run build)
- Any issue page content (stats, recent moves, voter questions)
- Tablet viewport (768px)
- Keyboard tab navigation
- Reduced-motion behavior
- Build TypeScript errors (`npm run typecheck`)
- Footer GitHub link validity
- Click interactions on card hover states
- ANC footnote card on Officials page
- All 12 race card stripe colors on Elections page

### Run 2026-05-11 (mobile-overhaul verification)

**Context:** This was the first run after the Mobile UX overhaul shipped (Phase A merged to main; Phases B, C, D committed locally). The pass exercised all the new sibling-pair patterns at both viewports.

**What was tested (5 min total — ~2:30 desktop + ~2:30 mobile):**
- Desktop (1280): `/`, `/elections/`, `/elections/mayor/`, `/elections/mayor/janeese-lewis-george/`, `/officials/`, `/issues/housing/`
- Mobile (375): same 6 pages plus `/issues/ranked-choice/` (RCV simulator presence check)

**What passed:**
- All seven baseline flows from BF-01 to BF-13 continue to pass at both viewports
- BF-14 (table sibling-pair) — voting matrix renders as 3 bill cards at mobile; comparison renders as 8 candidate `<details>` on /elections/mayor/; both flip to original tables at desktop
- BF-15 (collapsed-at-mobile) — IssueDetail's Who decides / Questions / Live sources are closed-by-default at mobile and inline at desktop; officials cards carry `Background ↓` / `Source ↓`; /elections/ DCBOE admin + Key dates collapse
- BF-16 (JumpStrip) — chips render on /elections/ (Lookup · Races · Compare · Take action) and /issues/<slug>/ (Stats · Stakes · Timeline); strip is `display: none` at desktop
- BF-17 (clickable race cards) — 4 profiled races have `<Link>` header + "SEE RACE PAGE →" CTA; 8 non-profiled don't
- BF-18 (candidate enrichment) — JLG profile renders Campaign site + Government site + announcement source in correct order; Recent coverage section omitted when news empty
- Hero compression confirmed: `/elections/` h1 = 30px (text-3xl) at mobile, 60px (text-6xl) at lg; home stays text-4xl (36px) at mobile per spec
- Section spacing: `mt-8 sm:mt-12 lg:mt-14` applied site-wide
- Zero console errors on any page

**What was discovered:**
- The static-server config (`dc-elections-tracker-static`) is much faster than dev mode for UAT — full mobile/desktop flip + screenshot loop in under 5 minutes
- Both mobile-only `<details>` and the always-visible sibling block exist in the DOM at all viewports; only one displays per media query. Don't be confused by duplicate H2 text in `document.querySelectorAll('h2')` queries — that's expected.
- `preview_click` fires the click but native anchor-jump scroll behavior doesn't always animate via the tool. Verify the URL hash changes (`window.location.hash`) and that `scrollIntoView()` works; the smooth-scroll is intact in a real browser.

**Paths NOT yet tested this run (carry over to next pass):**
- Tablet viewport (768px) — between mobile and desktop, edge case for the sibling-pair pattern
- Keyboard tab order on the new race-card Link + disclosure (do they share focus order cleanly?)
- `prefers-reduced-motion` actually disabling the JumpStrip's smooth scroll
- A candidate profile with `news[]` populated (none exist yet; check next time the data-refresh skill runs)

### Run 2026-05-17 (voter-persona walkthrough)

**Context:** First run that exercised the new BF-19 (first-time voter) and BF-20 (officials-curious voter) flows end-to-end. Goal was to surface friction in clicks-to-answer rather than feature regressions.

**What was tested (~25 minutes, dev mode at desktop 1280):**
- `/` (home) → measure clicks for each of 14 voter questions across 4 personas
- `/elections/` + address-lookup submit (`900 7th St SE` → returned Ward 2 + Brooke Pinto card with voting record)
- `/elections/mayor/` + candidate count check vs `oneLine` text
- `/officials/` + heading-count check + total scroll-height measurement
- `/issues/ranked-choice/` + `/issues/housing/` for issue-page semantic structure

**What was discovered:**
- `/officials/` is 20,218px tall and has only 3 semantic headings (h1 + 2 unrelated h2). The five group blurbs render as kicker spans, not `<h2>`. → filed UAT-018 + BL-UAT-11 (jump nav) + BL-UAT-12 (anchor IDs).
- `/elections/mayor/` `oneLine` says "10 declared Democrats" while the data file has 8 active candidates. → filed UAT-017 + BL-UAT-15 (auto-derive counts).
- The address lookup is the highest-value flow on the site — answers ward, races, council member, and voting record in one block. But it is 2 clicks deep from the homepage. → filed BL-UAT-12 (surface lookup on home).
- The lookup's `Find your polling place at DCBOE ↗` link is generic, not pre-filled with the user's address. → filed BL-UAT-13 (resolve polling place inside lookup).
- Homepage has only one external action CTA (`Are you registered?`). Two other high-volume P1 actions (where to vote, request a mail ballot) are buried at the bottom of `/elections/`. → filed BL-UAT-14 (CTA pair on home).

**What was confirmed working well (regression watch — don't break):**
- Above-the-fold countdown + `Are you registered?` CTA: 0–1 clicks for P1 Q1.1 + Q1.2.
- Address-lookup result block: surfaces `Your council member` + voting record after a single submit.
- Issue pages: strong semantic structure, JumpStrip chips, quick-take bullets, source links on every claim.
- Per-candidate profile pages (BL-32 / BL-58) load cleanly for all 24 profiled candidates.

**Eval patterns that worked well:**
- `document.querySelectorAll('h1, h2, h3').length` is a fast structural-quality probe; ratio of headings to officials/candidates surfaces semantic-debt problems quickly.
- `document.body.scrollHeight` on `/officials/` and home is the simplest "is this page too long?" signal — over 15K px without TOC/anchors is a strong flag.
- Form submission via `form.requestSubmit()` after setting input value through the React-aware property setter (`Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set`) reliably triggers the AddressLookup's state without race conditions.

**Paths NOT yet tested this run (carry over to next pass):**
- BF-19 / BF-20 at mobile (375) and tablet (768) — the 20K-px officials page is even more painful on phone.
- BF-19 Q1.3 with BL-UAT-13 / BL-UAT-14 in place (currently aspirational state).
- A11y: tab order through the address-lookup → result block → "← Back" link.
- Screen-reader walkthrough on `/officials/` (UAT-018 specifically — does NVDA / VoiceOver list 28 official cards under no group landmarks?).

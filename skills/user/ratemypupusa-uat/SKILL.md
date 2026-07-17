---
name: ratemypupusa-uat
description: >
  Project-specific UAT skill for RateMyPupusa. Use whenever the user asks to run UAT,
  QA the app, find bugs, test the UI, or validate user flows on RateMyPupusa. Covers
  the full create/join/rate/leaderboard lifecycle with phone OTP auth. Every run must
  execute the "Start New Crawl" smoke test first — that flow breaking is the most
  impactful regression this app has had. Learns the project's unique flows over time.
compatibility: "Requires bash, Preview MCP (preview_start, preview_screenshot, preview_eval, preview_snapshot, preview_click, preview_console_logs), str_replace, and Read/Write tools."
---

# RateMyPupusa — Self-Improving UAT Skill

## What this skill does

Runs a focused UAT session on RateMyPupusa at `/Users/pranava/Documents/Projects/RateMyPupusa/`.
Each run:
1. Loads `uat.md` + `issues.md` context
2. Executes the mandatory Start-New-Crawl smoke test (SF-01) — always first, always
3. Runs all other critical baseline flows
4. Explores edge cases and recently-changed areas
5. Logs new bugs to `issues.md`, updates `uat.md`

---

## Step 0: Load context

Always read these before doing anything else:

```
Read: uat.md       → baseline flows, known stable/flaky areas, last run date
Read: issues.md    → open bugs, resolved bugs, next UAT ID to use
```

Summarize: number of open issues, date of last run, which areas were recently flaky.

---

## Step 1: Dev server setup

The project uses Next.js 16 (Turbopack) + Tailwind v4. The worktree and main checkout share the same `node_modules` pattern.

### Starting the server

```
preview_start: name "dev"   (reads .claude/launch.json → npm run dev → port 3000)
```

### Known worktree gotcha — lightningcss native binary

After a fresh server start (or `.next` cache clear), the server may 500 with:
```
Cannot find module '../lightningcss.darwin-arm64.node'
```

**Fix**: Run `npm install lightningcss --no-save` from the project root, then clear `.next/` and restart:
```bash
kill $(lsof -ti :3000) 2>/dev/null
rm -rf .next/
npm install lightningcss --no-save
```
Then call `preview_start: name "dev"` again.

This happens because the worktree's `node_modules` is missing platform-specific optionalDependencies. It does not affect production (Vercel builds correctly). Track if it becomes consistently worse.

### Known Preview MCP limitation — Supabase network isolation

The Preview MCP sandbox cannot reach `supabase.co` (external API). This means:
- Auth flows (phone OTP, `getUser`) will not complete in the preview browser
- Session page stays on "Loading crawl..." indefinitely
- Console will show repeated `TypeError: Failed to fetch` from Supabase auth-js

**This is a tooling constraint, not an app bug.** To validate auth-dependent flows, use the real browser at `http://localhost:3000` or the production URL.

For preview-based UAT, you can verify:
- Landing page renders correctly
- Auth guard shows the spinner (pupusa 🫓 animation) instead of the create form during auth loading
- Error states (invalid session code) once auth resolves

---

## Step 2: MANDATORY smoke test — SF-01 · Start New Crawl

**Run this every single time, before anything else.** This is the highest-priority regression check.

### What to check (in preview):
1. Navigate to `http://localhost:3000/`
2. Screenshot — verify: pupusa image, "RateMyPupusa" heading, "Start New Crawl" and "Join a Crawl" buttons
3. Click "Start New Crawl"
4. **Critical**: verify the **loading state** appears (spinning pupusa 🫓 + "Back" button), NOT the create form or phone auth, until auth resolves
   - This was UAT-011 — the form was showing immediately before auth resolved, causing "Failed to create crawl" errors for real users
   - If the create form or phone input appears instantly (before ~300ms delay), that's a regression
5. Check console for new errors (`preview_console_logs level: error`) — ignore Supabase "Failed to fetch" (expected in preview)

### What to check (real browser — do at least once per session):
Use `http://localhost:3000` in a real browser (not Preview MCP):
1. Click "Start New Crawl"
2. Authenticate with phone OTP:
   - **Fast test (bypass Twilio)**: phone `5555550101`, OTP `123456`
   - **Full real-SMS test**: phone `7037327984` (receives actual SMS, OTP from the message)
3. After OTP: if no display name set, should prompt "What should we call you?" (UAT-007 flow)
4. Enter a crawl name (e.g., "UAT Test Crawl") → click "Create Crawl"
5. **Expected**: redirect to `/session/[5-char code]` with:
   - Session header showing crawl name + share code
   - "Rate Spots" and "Leaderboard" tabs
   - List of 12 default pupusa spots
   - 1 taster shown
6. Note the share code for use in SF-03

**If SF-01 fails, stop and log the bug. Do not continue other flows.**

---

## Step 3: Baseline flows (run all every time, use real browser)

### SF-02 · Join a Crawl

1. Open a new private/incognito window at `http://localhost:3000/`
2. Click "Join a Crawl"
3. Auth with second test phone: `5555550102`, OTP `123456`
4. Enter the share code from SF-01
5. **Expected**: redirect to session page, "Welcome, [name]!" toast, participant count increases to 2
6. Spot card should reflect both tasters in the count
7. Test `?tab=leaderboard` URL param — navigating to `/session/[code]?tab=leaderboard` should land directly on the Leaderboard tab (UAT-002 fix)

### SF-03 · Rate a Spot

From an authenticated session page:
1. Click any spot card (e.g., "El Tamarindo")
2. **Expected**: navigates to `/session/[code]/rate/[spotId]`
3. Verify 4 factor rows render: **Taste, Value, Curtido, Other** (exactly 4, not 6 — this was a stale-schema bug)
4. For each factor: tap a star rating
   - **Expected after each tap**: toast appears ("Taste rated!", "Value rated!", etc.) + Avg score updates in the row
   - Hint text should be **below** the stars, not beside them (UAT-008 fix)
   - At 375px viewport, text should not wrap/overflow
5. After rating all 4 factors, click "Done"
6. **Expected**: return to session page, spot card shows the score

### SF-04 · Leaderboard

From an authenticated session page with at least 1 rated spot:
1. Click "Leaderboard" tab
2. **Expected**:
   - Rated spots appear at top with rank badges (1, 2, 3 = gold/silver/bronze, 4+ = numbered)
   - "Not Yet Rated" divider separates rated from unrated spots
   - Unrated spots show "—" badge (not a number or medal)
   - Click a rated spot card → expands to show per-factor scores + per-person breakdown
3. Verify tab state persists on browser back/forward (`?tab=leaderboard` in URL)

### SF-05 · Add a Custom Spot

From session page → Spots tab:
1. Scroll to bottom, click "+ Add a Spot"
2. **Expected**: bottom sheet modal appears (mobile) or centered modal (desktop)
3. Enter spot name + optional address → "Add Spot"
4. **Expected**: modal closes, toast "SpotName added!", spot appears at bottom of list
5. Verify no duplicate appears, new spot has no rating yet

### SF-06 · Invalid Session Code

Navigate to `/session/ZZZZZ` (non-existent):
1. **Expected**: loading spinner briefly, then error state:
   - 😕 emoji
   - "Crawl not found" heading
   - "Check the code and try again" subtext
   - "Go Home" button → returns to `/`
2. Check this error state matches the spot-not-found error style (UAT-003 fix)

### SF-07 · Invalid Spot Route

Navigate to `/session/[real-code]/rate/invalid-spot-id`:
1. **Expected**: similar styled error state (not a blank page or Next.js error boundary)
2. "Go Back" or "Go Home" button present and functional

### SF-08 · Copy/Share buttons

From an authenticated session page:
1. Click the copy/share code button in the session header
2. **Expected**: no unhandled promise rejection in console (UAT-009 fix)
3. In environments where clipboard is restricted: error should be silently caught, not visible to user

---

## Step 4: Auth guard regression check (SF-09)

This is the UAT-011 regression that caused "can't start a new crawl." Test it explicitly after any change to `app/page.tsx` or `lib/hooks/useAuth.ts`:

```js
// In preview_eval: verify the auth loading guard renders first
// Navigate to /, click "Start New Crawl", then immediately check:
const formVisible = !!document.querySelector('form input[id="crawl-name"]')
const spinnerVisible = !!document.querySelector('.animate-pulse')
const backVisible = !!Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Back')
// Expected: formVisible=false, spinnerVisible=true OR backVisible=true
// If formVisible=true immediately, regression — log as critical
```

---

## Step 5: Mobile viewport checks (pick at least one per run)

The app is mobile-first, max-width 480px, designed for iPhones:
- **iPhone SE**: 375px (smallest supported)
- **iPhone 16**: 393px
- **iPhone Pro Max**: 430px

Resize via `preview_eval`: `document.querySelector('meta[name=viewport]')` then use browser resize.

At 375px, verify:
- Landing page: "Start New Crawl" / "Join a Crawl" buttons don't overflow
- Rate spot page: factor rows (stars + label + score) don't overflow horizontally
- Session page: spot card text truncates, doesn't overflow
- Leaderboard: rank badge + spot name + score fit on one line

Check `__tests__/components/MobileResponsive.test.tsx` for the automated mobile overflow tests.

---

## Step 6: Console and network hygiene

After any page load:
```
preview_console_logs level: error
```

Expected errors (ignore these — they're the Supabase network isolation issue in Preview MCP):
- `TypeError: Failed to fetch` from `@supabase/auth-js`
- `SupabaseAuthClient._recoverAndRefresh` errors

**Unexpected errors that should be logged**:
- Any React rendering error / unhandled rejection
- 404s for static assets
- Hydration mismatches (`Warning: Expected server HTML to contain...`)
- Any error from the app's own code (not supabase auth)

---

## Step 7: Run the test suite

After any code change:
```bash
npx jest --passWithNoTests
```

Expected: **56 tests passing** across 8 test suites.

Key test files:
- `__tests__/components/Leaderboard.test.tsx` — 7 tests; uses 4-factor schema (taste/value/curtido/other) and `participants: Participant[]` + `ratings: Rating[]` props (NOT `totalParticipants: number` — that was UAT-012)
- `__tests__/components/MobileResponsive.test.tsx` — mobile overflow regression tests
- `__tests__/components/PhoneAuth.test.tsx` — OTP form behavior

If any Leaderboard test fails, check that the props match:
```typescript
<Leaderboard aggregates={SpotAggregate[]} participants={Participant[]} ratings={Rating[]} />
```

---

## Step 8: Issues log format

Append to `issues.md` using the next sequential UAT-NNN ID (currently at UAT-012).

```markdown
### [UAT-013] Brief title
- **Severity**: critical | high | low
- **Page/Section**: e.g. `/` > Create Crawl flow
- **Discovered**: YYYY-MM-DD
- **Status**: open
- **Description**: What happened. What was expected.
- **Steps to Reproduce**: numbered steps
- **Fix**: _(pending)_
```

Severity guide:
- `critical` — Create or join crawl broken, auth fails, data loss
- `high` — Major feature broken, significant UX problem, visible error
- `low` — Cosmetic issue, minor inconsistency, edge case

---

## Step 9: Update uat.md

After every run:
1. Set `_Last run:` to today's date
2. Update `last_tested` for each section visited
3. Add newly-discovered flows to "Exploration Notes"
4. Move newly-stable flows into "Known Stable Areas"

---

## Step 10: Report to user

Concise summary:
- SF flows tested (pass/fail)
- New bugs found (ID + one-line summary)
- Bugs confirmed fixed (if any open issues now pass)
- Test suite status (N/56 passing)
- One recommendation for what to fix first

---

## Key project facts

```
Project path:     /Users/pranava/Documents/Projects/RateMyPupusa/
Stack:            Next.js 16 (App Router, Turbopack), Tailwind v4, TypeScript strict, Supabase
Dev server:       npm run dev → http://localhost:3000
Launch config:    .claude/launch.json → name "dev"
Prod URL:         https://ratemypupusa.vercel.app

Routes:
  /                          Landing — create or join crawl
  /session/[code]            Session dashboard — spots list + leaderboard tab
  /session/[code]/rate/[id]  Rate a specific spot

Key components:
  PhoneAuth.tsx              OTP phone login (Supabase auth)
  SessionHeader.tsx          Crawl name + share code + copy/share buttons
  SpotCard.tsx               Spot list item — name, avg score, "Rate it" CTA
  StarRating.tsx             Star input for a single factor (1–5)
  Leaderboard.tsx            Ranked list: rated spots (ranked) + "Not Yet Rated" divider + unrated
  AddSpotModal.tsx           Bottom sheet for adding custom spots
  Toast.tsx                  Success/error/info toast notifications

Rating factors (exactly 4):
  taste · value · curtido · other
  Defined in: lib/constants.ts (RATING_FACTORS)
  Type: RatingFactor = 'taste' | 'value' | 'curtido' | 'other' (lib/types.ts)

Auth:
  Provider:        Supabase phone OTP (Twilio SMS in prod)
  Test phones (bypass Twilio, valid until April 2027):
    5555550101   OTP: 123456   → Session creator (User A)
    5555550102   OTP: 123456   → Session joiner (User B)
  Real phone (receives actual SMS):
    7037327984   → use for full end-to-end SMS flow verification

Hooks:
  useAuth()        → { user, profile, loading: authLoading, signIn, verifyOtp, updateProfile }
  useSession(code) → { session, participants, currentParticipant, loading, error, joinSession }
  useSpots()       → { spots, loading, addSpot }
  useRatings(id)   → { ratings, loading, submitRating }
  useLeaderboard() → SpotAggregate[] sorted by overallAverage desc, nulls last

Database (Supabase Postgres):
  sessions         id, name, share_code (5-char uppercase), created_at
  participants     id, session_id, name, user_id (nullable), created_at
  spots            id, name, address, is_default, created_at (global — UAT-006)
  ratings          id, session_id, participant_id, spot_id, factor, score, notes, created_at
  profiles         id (= auth.uid), phone, display_name, created_at

Known open issues:
  UAT-010  low     Next.js Image aspect ratio console warning (pupusa.png)
  UAT-006  low     Custom spots are global, not session-scoped

Resolved issues (recent, high-impact):
  UAT-011  high    Create/join form rendered before auth resolved (race condition in app/page.tsx)
  UAT-012  high    Leaderboard tests used stale 6-factor schema + wrong prop types
  UAT-007  medium  New users never prompted for display name (useAuth + needsName gate)
  UAT-008  medium  Rate page factor row text wrapped at narrow viewports
  UAT-009  medium  Clipboard/share errors were unhandled rejections
```

---

## Learned pathways log

_This section is updated automatically each run. Do not delete — it is the skill's memory._

### Run 2026-05-11 (inaugural run for this skill)

**Context:** First run of this project-specific skill. Two bugs were found and fixed in this session.

**What was tested:**
- Landing page (preview — confirmed loads correctly, correct button labels)
- Auth guard: "Start New Crawl" click → loading spinner (UAT-011 fix verified visually)
- Leaderboard tests: all 7 rewritten to match current component interface (UAT-012 fixed)
- Test suite: 56/56 passing after fixes

**What was discovered:**
- Auth loading race (UAT-011): `needsAuth` and `needsName` both `false` during `authLoading=true`, so create/join form rendered prematurely before `getUser()` resolved
- Leaderboard test file used `totalParticipants: number` (old prop), 6 old factors, and wrong empty-state text "No ratings yet" (actual: "No spots yet")
- `lightningcss-darwin-arm64.node` binary missing from worktree on fresh starts — must reinstall with `npm install lightningcss --no-save` each time
- Preview MCP cannot reach Supabase — all session-dashboard tests must be done in real browser

**Navigation patterns that work in Preview MCP:**
- `window.location.replace('http://localhost:3000/path')` — better than `.href =` (avoids stale error overlay)
- `preview_eval` DOM queries for below-fold content
- `preview_snapshot` for full page structure audit

**Paths NOT yet tested in preview (carry to next run):**
- Rate spot page at 375px / 393px / 430px viewports
- Leaderboard expand/collapse interaction
- Add Spot modal bottom-sheet positioning
- Join crawl full flow (needs real browser + Supabase)
- Toast notifications (appear/dismiss)
- Tab URL persistence (`?tab=leaderboard`)

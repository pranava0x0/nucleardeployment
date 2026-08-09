# Plan: the expert information layer

2026-08-08. Branch `jam/nuclear-info-platform-1891e1`.

The brief: sit in the chairs of the people who actually run this industry, ask
what they would want the public to know, and rebuild the site's surfaces around
those questions with minimal clicking and scrolling, a clear sitemap, full
robots/llms.txt/SEO integration, a visible lane for new news, and clear CTAs.

## What each chair asks

Five chairs, five standing questions. Each maps to a surface; none requires a
new fact, because the dataset already carries the answers.

| Chair | Standing question | Surface |
| --- | --- | --- |
| Reactor physicist / policy adviser | What did the evidence actually change this month, and what document says so? | New `/updates` ledger from `proofEvents` + `fundingEvents` |
| SMR / microreactor CEO | Where does each company really stand, and how fast can I find one company? | Race board, now filterable, rows clickable, key above the rows |
| NRC chair | Which decisions are pending, who owns each one, and does the public conflate a permit with a license? | New "next gate" register from `projects[].next` / `nextOwner`; band authority labels already do the rest |
| Nuclear financier | Which megawatts rest on executed documents versus announcements, and what capital is closed versus conditional? | Headline stat strip from `raceTotals()`; capital page and funding frames already separate the frames |
| Scaling initiative | Is anything replicating, and what stands between the leaders and repeat units? | Stage pipeline (stage 8 empty, honestly), post-criticality strip, blockers on each project record |

The common demand across all five: **answers above the fold, dated evidence,
and a place to watch what happens next.** The 2026-08-06 UAT measured the same
failures from the reader's side: first board row at 853px on desktop and
1,222px on mobile, no homepage filter, the legend after all 18 rows, an
11.8-screen mobile page.

## What ships

### 1. Homepage: answers in the first screen

- Masthead cut to headline + one-sentence zero + meta line. The Vogtle scale
  context moves below the board; it is context, not the answer.
- A four-tile stat strip derived from one new `headlineTotals()` helper in
  `app/data.ts` (also consumed by `build-llms-txt.mjs`, so the two can never
  drift): 0 MWe operational, MWe building, MWe on executed actions, MWe
  announced non-binding.
- A slim sticky key above the board: band swatches, the gigawatt line note,
  and a type-to-filter input that narrows rows by company, design, or lane.
  The filter is progressive enhancement: rows carry a server-rendered
  `data-filter` string, a small client component toggles `hidden`, and with no
  JS every row still renders.
- Whole board rows clickable via a stretched link on the company name.
- "Latest developments": the four newest dated evidence events, linking to
  `/updates`.
- "Every project's next gate" preview: the five projects closest to operation
  with their next milestone and owner, linking to the full register.
- The stage pipeline, federal orders, and capital panels collapse into native
  `<details>` blocks with counts in their summaries. Each already has a
  dedicated page. Ships with the `details:not([open])` display guard.
- The three-card "recent project milestones" section retires; the updates
  strip replaces it with dated, sourced events.
- A CTA row: subscribe (RSS), report a correction (GitHub issues), read the
  methodology, `llms.txt` for agents.

### 2. `/updates`: the news lane

- The evidence ledger: `proofEvents` + `fundingEvents` merged by a new
  `timeline()` helper, grouped by month, newest first, each entry carrying its
  kind, company, source link, and reporting tier. Undated events group at the
  end; dates are never guessed.
- The full next-gate register: every tracked project, sorted by how close its
  stage is to operation, with next milestone and responsible owner.
- The RSS feed link and correction CTA.

### 3. Machine and search layer

- `scripts/build-seo.mjs` generates three files at prebuild, with `--check`
  wired into `data:check` like the llms builder: `public/sitemap.xml` (all
  routes plus company and project slugs, lastmod from `dataAsOf`),
  `public/robots.txt` (allow all, sitemap pointer, llms.txt pointer), and
  `public/feed.xml` (RSS 2.0 over the evidence ledger; month-precision dates
  serialize as the first of the month for the protocol field while titles keep
  the true precision; undated events stay out of the feed).
- Framework metadata routes are avoided on purpose: the vinext build and the
  `next build` Pages export must both ship these files, and `public/` is the
  one path both copy through unchanged.
- Per-page `description` and canonical URLs (basePath-aware) on every route,
  via a shared `app/site.ts` URL helper used by layout, pages, and scripts.
- JSON-LD: `WebSite` + `Dataset` on the homepage, `BreadcrumbList` on company
  and project pages. Nothing the schema cannot back.
- RSS discovery link and SVG favicon in the layout head.

### 4. Sitemap for humans

- Nav gains Updates and Companies (both routes existed with no nav entry).
- The footer becomes a one-line site map: methodology, updates, RSS, GitHub
  repository, and the builder credit, per the footer rule in CLAUDE.md.

## Rules this plan obeys

- **No new facts.** Every new surface derives from records already in
  `app/data.ts`. No record is added, reworded, or re-sourced here.
- **Frames never merge.** The stat strip shows executed and announced
  megawatts as separate tiles and never sums them.
- **Dates are never fabricated.** Undated events render in an explicit
  undated group and are excluded from the feed.
- **Copy passes the prose gate**: no em-dashes, no model-register words.
- **New pages join the a11y and prose path lists** in
  `tests/rendered-html.test.mjs` and `scripts/audit-prose.mjs`.
- **Every new behavior gets a test**: filter attributes present, hidden rule
  shipped, sitemap/robots/feed exist and parse, canonical and JSON-LD present,
  details guard present, llms.txt still in sync, headline helper matches the
  band math.

## Done means

- `npm run lint`, `npm test`, `npm run data:check`, `npm run test:pages` all
  pass.
- Measured in the browser: first board row inside the first viewport on
  desktop (three rows visible) and inside 1.5 viewports on mobile with the
  filter in reach; the UAT items this covers get checked off in `backlog.md`.

## Status at the 2026-08-08 checkpoint

Everything above is implemented and committed on
`jam/nuclear-info-platform-1891e1`. All gates pass: lint (one pre-existing
warning), the 53 rendered-html tests, `data:check` (three pre-existing
long-sentence warnings from dataset labels), and the 3 Pages-export tests.

Measured in the dev build:

- Desktop 1280px: first board row at 531px, three full rows inside an
  800px-tall viewport (UAT baseline was 853px and one row).
- Mobile 375×812: filter at 763px (inside screen one), first row at 893px
  (baseline 1,222px), page 11.1 screens (baseline 11.8 with fewer sections),
  no horizontal scroll.
- Filter verified live: "oklo" narrows 18 rows to 1; clearing restores 18.
- The three collapsed `<details>` sections render closed with the
  `:not([open])` guard, and `[hidden]` carries `!important`.

Open follow-ups, tracked in `backlog.md`: board sort control (low), dossier
back link still points at `/companies` rather than the board (low), and the
pipeline company chips remain under the 44px touch floor (pre-existing).

Not yet done: pushing the branch and opening a PR. That is deliberate; the
ship ritual runs when the user asks for it.

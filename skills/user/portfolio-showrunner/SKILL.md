---
name: portfolio-showrunner
description: >-
  Rebuild the published artifacts of Pranava's personal website (pranavaraparla.com) when
  its repos or case studies change: recapture case-study screenshots (desktop + mobile),
  resync the homepage "Last Updated" dates and reorder the projects table from GitHub, and
  refresh SEO metadata + sitemap. Use this whenever the user wants to "recapture/refresh the
  screenshots", "resync/recompute the dates", "reorder projects by last updated", "regenerate
  the sitemap or SEO/meta tags", or has just added or edited a case study and needs the site
  rebuilt — even if they don't name a script. This is the EXECUTION/rebuild counterpart to
  the project-scout skill (which DISCOVERS what new projects to add): use project-scout to
  decide what belongs on the site, and portfolio-showrunner to regenerate everything once
  something changed. Runs the tools/ scripts in the right order with the gotchas baked in.
compatibility: Run from the personal-website repo root. Needs `gh` (authenticated), and `playwright` + `pillow` with chromium installed.
---

# Portfolio showrunner

Rebuild pranavaraparla.com's generated pieces after its content changes. The homepage lists
one row per public GitHub repo, and several case studies embed live screenshots of the
projects. Three small, **idempotent** scripts in `tools/` keep it in sync; this skill is the
order to run them and the things that bite. Per-script detail lives in `tools/README.md` —
read it if a step is unclear.

(If the question is *what* new project to add rather than *how* to rebuild, that's the
`project-scout` skill — it diffs GitHub/LinkedIn/email against the site and proposes rows.
Come back here once the row exists to regenerate dates, screenshots, and SEO.)

Run only the steps the change calls for — the scripts are independent.

| What changed | Run |
|---|---|
| A repo got new commits / a project's activity moved | step 1 (dates + order) |
| A case study's live site changed, or shots look stale | step 2 (screenshots) |
| Added/removed a project row, or added a new case study | step 1, then 2 + 3 |
| A row-only project needs a full case-study page | step 4 (then 2 + 3) |
| Touched any page `<head>`, a title, or added a page | step 3 (SEO) |

## 1. Resync project dates + ordering from GitHub

```
python3 tools/refresh_last_updated.py --dry-run   # preview the new dates/order
python3 tools/refresh_last_updated.py             # apply
```

It reads the repos listed in `index.html` (from their Code links), pulls each one's
latest **meaningful** commit date live from GitHub, updates the "Last Updated" column,
and re-sorts the table most-recent-first. Why it's built this way:

- **Dynamic, never hardcoded** — the order is derived from commit timestamps each run, so
  it catches brand-new pushes a hand-edited list would miss.
- **Skips no-op commits** — a pure "UAT pass — no new bugs" QA run shouldn't bump a date,
  so those are filtered (regex on "no new bug/issue/finding").
- **Never regresses** — a date only moves forward (`max(listed, latest-meaningful)`), so a
  stale automated run can't pull a project backwards.
- **Counts live-data refreshes** — for trackers that rebuild nightly (e.g. dcelectionstracker,
  vibe-coding-security), the refresh legitimately counts as an update. That's intended.

To **add or remove a project**, edit the `<tr class="project-item">` rows in `index.html`
first, then run this to fix the dates and order.

- **New public repos won't add themselves.** The script only touches repos already listed in
  `index.html`; a brand-new public repo is invisible to it. Diff the site against GitHub
  (`gh repo list <user> --source --visibility public`) to catch rows that don't exist yet —
  that's `project-scout`'s job, but the gap surfaces here.
- **A grown project can have a stale blurb, not just a stale date.** When a repo's *scope*
  expanded (not only its commit date), fix its homepage `proj-desc` (and case study) too —
  e.g. FirstPassRx outgrew "Massachusetts inhalers" into four region×therapy guides, so the
  one-line description was wrong even after the date bumped.

## 2. Recapture case-study screenshots (desktop + mobile)

```
python3 tools/screenshots.py                 # capture + embed, all case studies
python3 tools/screenshots.py --only <slug>   # just one (e.g. usgs-mineral-commodity-summaries)
python3 tools/screenshots.py --capture        # only re-shoot images
python3 tools/screenshots.py --embed          # only regenerate the gallery HTML
```

It shoots each case study's key views at a **desktop** (1440×900@2x) and a **mobile**
(390×844@3x) viewport with Playwright, converts to optimized WebP under
`assets/screenshots/<slug>/`, and regenerates the collapsible "A Look Inside" gallery in
each `<slug>-case-study.html` (placed after "How It Works", mobile shot before desktop in
each pair).

- To add a new case study or change which views/captions show, edit the `CONFIG` dict at
  the top of `screenshots.py`. Each view = a key, a URL suffix (also the figure's link), a
  caption, and an optional list of `[op, arg]` click/scroll **actions** for views that need
  interaction (expanding a panel, switching a tab, opening a detail).
- The live sites are JS dashboards: capture waits for network-idle plus a few seconds, and
  mobile UIs differ (bottom sheets, stacked cards). **Always look at the new images** —
  especially the mobile and interaction-dependent ones — before trusting the run. If an
  interaction shot is framed wrong, adjust that view's `actions` (e.g. scroll to a more
  specific element) and re-run with `--only <slug>`.
- **A timed-out click captures the *default* state, silently.** Watch the capture output for a
  `~ [device] <slug>/<view> action ... skipped: ... Timeout` line — it means a `click_text` (or
  other action) didn't fire, so the shot shows the landing tab, not the intended one. The usual
  cause is that the **live UI renamed or moved the target** (e.g. datacenterwaterusage renamed
  its tab "CWA Cases" → "Water Cases", so `click_text "CWA Cases"` timed out). Fix the action's
  text **and** the view's `caption`/alt text to the new label, then re-run `--only <slug>`.
  Prefer a short, stable substring for `click_text` (`get_by_text(..., exact=False)`).
- **`CONFIG` keys are mixed-case.** Most slugs are lowercase, but some match CapitalizedCamel
  repo names — `FantasyGM`, `PPAhelper`, `FERCforms`, `VisionZeroDC`. When working out which
  *updated* projects have galleries to re-shoot, a case-sensitive/lowercase-only scan will miss
  these. Grep the `CONFIG` keys directly.

## 3. Refresh SEO + sitemap

```
python3 tools/seo.py
```

Injects canonical / Open Graph / Twitter Card tags (title + description read from each
page) and Person + WebSite JSON-LD on the homepage, then regenerates `robots.txt` and
`sitemap.xml`. Idempotent — pages that already have a canonical tag are skipped, so run it
after adding a new case study to cover the new page. Canonical domain is
`https://www.pranavaraparla.com` (the apex 307-redirects there); `generate-llms-txt.py`
uses the same base.

## 4. Promote a row-only project to a full case study

Many homepage rows are just Website + Code links. To give one the full treatment, the tools
do almost everything — you hand-write only a minimal page and let the pipeline fill the rest:

1. **Write `<slug>-case-study.html`** with a *minimal* `<head>` (charset, viewport,
   `<title>Case Study: X</title>`, `<meta name="description">`, the two Google-font `<link>`s,
   and `style.css` + `clean.css`) plus a body copied from any sibling case study: the marquee,
   the centered header (back link, `<h1>`, `LIVE` + bold tagline, `cs-meta` Source/Website
   links), a `Background` and a `How It Works` `projects-section`, a **placeholder** section
   that literally contains `<h2>A Look Inside</h2>` (embed keys off that string and replaces the
   whole block), the footer `<hr>` + back link, and the theme-toggle `<script>`. Do **not**
   hand-write canonical/OG/Twitter/JSON-LD/favicons/analytics — the tools inject all of it.
2. **`<slug>` must equal the repo name.** `base(slug)` builds the live link as
   `github.io/<slug>/`, so the file is `<repo>-case-study.html` — e.g. repo
   `FERC-Orders-June-2026` → `FERC-Orders-June-2026-case-study.html`, even when the homepage
   display name is shorter ("FERC Large Load Orders").
3. **Add a `CONFIG` entry** in `screenshots.py` (2 views is the house style; see step 2 for
   `click_text` gotchas), then `python3 tools/screenshots.py --only <slug>` — capture + embed
   replaces the placeholder with the real gallery and builds the og card. Look at the shots.
4. **Add the `Dive in` link** to the homepage row — prepend, before the Website link:
   `<a href="<slug>-case-study.html" aria-label="Name: case study">Dive in</a> | `.
5. **Run `seo.py`, then `analytics.py`, then `a11y.py`** (all idempotent). `seo.py` injects
   canonical/OG/Twitter, the `TechArticle` + `BreadcrumbList` JSON-LD, favicons, and the sitemap
   entry (found via glob).
   - **`datePublished` gotcha:** `seo.py` reads it from the page's **git first-commit date**, so
     on a brand-new, *uncommitted* page it's omitted entirely. Either commit the page first and
     re-run, or set `datePublished` = `dateModified` by hand — identical to what `seo.py` would
     compute, since a new page's commit date is ≥ the project's "Last Updated" date.

## After any change — verify, then ship

- **Both themes.** The gallery is styled in `clean.css` (clean theme) **and** `style.css`
  (retro theme), and the site uses responsive CSS with no separate mobile DOM. If you touch
  gallery markup or CSS, check both theme toggles and a narrow width.
- **Look at it.** Serve locally (`python3 -m http.server 8900`), open a case study, expand
  the "A Look Inside" accordion, and confirm the desktop + mobile images load in both
  themes. A quick Playwright assertion that every `.cs-shots img` has `naturalWidth > 0`
  catches broken paths fast.
- **llms.txt** regenerates itself from `index.html` via the pre-commit hook — don't run
  `generate-llms-txt.py` by hand.
- **Deploy gotcha:** every push to `main` auto-deploys on Vercel, but a commit whose author
  email isn't tied to the GitHub account is **blocked**. Commit with a GitHub-recognized
  email (see the repo's deployment notes in CLAUDE.md).

# SKILLSLOG.md — session-history analysis & skill inventory

> Generated 2026-07-07 from 30 days of Claude Code history: 1,224 transcripts (~815 MB)
> across ~147 project dirs, distilled to **1,199 human-typed messages** over 29 active days.
> Companion file: [PROMPTING.md](PROMPTING.md) (prompting inefficiencies).

---

## 1. Top repeated patterns (with counts)

Counts are messages matching the pattern out of 1,199 typed messages in 30 days.

| # | Pattern | Count | What it looks like | Disposition |
|---|---------|------:|--------------------|-------------|
| 1 | **Continuation nudges** | ~95 | "keep going" (50 exact!), "continue", "yes" (16), "do it" (13), "you do it" | Prompting fix, not a skill — see PROMPTING.md §1 |
| 2 | **The ship ritual** | ~130 | "test commit push merge" (5 exact), "commit push merge", "push merge", "merge to main", "open a PR", usually as a trailing fragment. Keywords: commit 183, push 156, merge 175 | **→ new `ship` skill** |
| 3 | **Backlog rituals** | 157 | "add to backlog", "save these to top of backlog", "work on backlog items", "what's left in the backlog", "plan it and add to backlog but don't execute" | **→ new `backlog` skill** |
| 4 | **Branch cleanup** | 63 | "clean up all branches" — almost always appended to the ship ritual | Folded into `ship` |
| 5 | **Token-efficiency instructions** | 59 | "be token efficient", "cap of 100k tokens", "that agent was overkill, a keyword search would've done it" | Standing rule — now in base CLAUDE.md + memory; `learnings` skill captures the retrospective he asks for |
| 6 | **"Update docs with learnings"** | 42 | "update claude/agents/design/issues/backlog with learnings from this session", "evaluate agent runs for efficiency learnings" | **→ new `learnings` skill** |
| 7 | **Data refresh** | ~38 (interactive) + scheduled runs | "refresh data", "refresh the data, focusing on…" — across DC Elections, Robotics, FantasyGM, FirstPassRx, data-center projects | Already skill-ified for 2 projects; **gap: FantasyGM, FirstPassRx, data-center-community-benefits** — replicate the pattern |
| 8 | **Address PR feedback / Codex comments** | 33 | "work on the comments in the PR from codex, address them, then test commit push merge" | Folded into `ship` step 6 |
| 9 | **Launch / preview the app** | ~20 | "launch" (19 exact), "launch a preview for me to see" | Built-in `/run` + per-project `.claude/launch.json` covers this — see PROMPTING.md §6 |
| 10 | **Deploy to GitHub Pages** | 22 | "plan is to deploy to github pages" | Per-project concern; `ship` verifies the Pages gate went green post-merge |
| 11 | **Premature-merge corrections** | 3 | "don't merge, I want to review the PR first" (verbatim, 3 different projects) | Fixed structurally: `ship` defaults to PR-and-stop; merges only on explicit "merge" |

Correction rate overall is low (~25 genuine corrections / 1,199 ≈ 2%) — the dominant waste
is **continuation overhead** (#1) and **re-typing standing rituals** (#2, #3, #6), not
misunderstood asks.

---

## 2. Skills created from this analysis (2026-07-07)

| Skill | Location | Replaces | Trigger examples |
|-------|----------|----------|------------------|
| **ship** | `~/.claude/skills/ship/SKILL.md` | ~130 msgs/mo of "test commit push merge…" + branch cleanup + PR-feedback loops | "ship", "test commit push merge", "open a PR", "wrap up" |
| **backlog** | `~/.claude/skills/backlog/SKILL.md` | 157 msgs/mo of backlog add/show/work rituals | "add to backlog", "what's next", "work on backlog items" |
| **learnings** | `~/.claude/skills/learnings/SKILL.md` | 42 msgs/mo of "update docs with learnings" + agent/token retrospectives | "update docs with learnings", "save the agent learnings" |

Key defaults baked in: `ship` **never merges without an explicit "merge"** (fixes the 3
premature-merge corrections); `backlog` treats "add but don't execute" as zero code changes;
`learnings` always includes the agent/token retrospective and routes universal lessons to
this base repo per the canonical-base-files convention.

---

## 3. Full skill inventory

### Personal skills (`~/.claude/skills/`)

> Mirrored into this repo at [skills/user/](skills/user/) (live source of truth stays
> `~/.claude/skills/`; the `skillslog-refresh` skill re-syncs the mirror on every run —
> see [skills/README.md](skills/README.md)).

> **Migration note (2026-07-07):** all six pre-existing skills were flat `.md` files, which
> **never registered** with Claude Code (skills require `<name>/SKILL.md` directory format;
> none appeared in any session's skill list — explaining why zero custom skills were invoked
> in 30 days of history). All were migrated to directory format and now register.
> `dc-data-refresh` and `dc-uat` had no frontmatter; minimal name/description frontmatter
> was added (content otherwise untouched).

| Skill | Purpose | Status |
|-------|---------|--------|
| ship | Test → commit → push → PR → review → (gated) merge → branch cleanup | **new** 2026-07-07 |
| backlog | Add / show / work backlog.md items | **new** 2026-07-07 |
| learnings | Session scar tissue → project docs + base-file promotion | **new** 2026-07-07 |
| **data-refresh** | Generic refresh driver for ALL data projects: reads the project's `REFRESH.md` playbook (bootstraps one if missing), runs it, updates it with learned patterns | **new** 2026-07-07 |
| **skillslog-refresh** | This analysis as a repeatable skill: mine transcripts (bundled scripts), diff patterns vs. last run, create/update skills, refresh SKILLSLOG.md + PROMPTING.md, re-mirror skills into this repo | **new** 2026-07-07 |
| dc-uat | DC Elections Tracker: self-improving UAT (uat.md pathways log) | migrated, frontmatter added |
| portfolio-showrunner | pranavaraparla.com rebuild: screenshots, dates, SEO, sitemap | migrated |
| project-scout | Discover new projects for the personal site (GitHub/LinkedIn/email) | migrated |
| ratemypupusa-uat | RateMyPupusa UAT with mandatory Start-New-Crawl smoke test | migrated |

### Per-project refresh playbooks (`<project>/REFRESH.md`)

> Convention adopted 2026-07-07 (now in base CLAUDE.md): **one generic `data-refresh`
> skill; zero per-project refresh skills.** All project-specific refresh flows live in
> `REFRESH.md` at the project root, versioned with the code, appended-to on every run.
> The former per-project refresh skills were converted (stale `~/Documents/Projects/`
> paths fixed to `~/Projects/` during the move) and deleted:

| Playbook | Converted from |
|----------|----------------|
| `DC Elections Tracker/REFRESH.md` | user skill `dc-data-refresh` |
| `Robotics Leadership/REFRESH.md` | user skill `robotics-data-refresh` |
| `FantasyGM/REFRESH.md` | project skill `refresh-fantasy-gm` |
| `data center community benefits/REFRESH.md` | project skill `dcb-data-refresh` |
| `FirstPassRx/REFRESH.md` | project skill `rx-data-check` (validation half; gathering stays in the `formulary-data` skill) |

### Project skills (`<project>/.claude/skills/`)

> Found on a deeper scan 2026-07-07 (the first inventory pass missed these — one directory
> level too shallow). These are directory-format and register when working in their repo.

| Project | Skill | Purpose |
|---------|-------|---------|
| FirstPassRx | formulary-data | Gather/update sourced formulary cells (payer × state × class), checkpointed to disk (pre-existing) |
| FirstPassRx | cr-deploy | Project-local ship ritual with multi-persona review (pre-existing; predates the global `ship` skill) |
| Plant Tracker | analyze-plants | Referenced by the plant-tracker-analyze scheduled task (pre-existing) |

(Former per-project *refresh* skills — `refresh-fantasy-gm`, `dcb-data-refresh`,
`rx-data-check` — were converted to `REFRESH.md` playbooks the same day; see the table
above.)

### Scheduled tasks (`~/.claude/scheduled-tasks/`)

brownfields-data-updates · daily-bugfix-and-backlog · daily-dcelection-refresh ·
daily-project-idea-generation · plant-tracker-analyze · run-down-taco-bell-backlog

---

## 4. Follow-up on the "recommended next skills" (resolved 2026-07-07)

The three data-refresh gaps flagged in the first pass were first filled individually
(FantasyGM already had `refresh-fantasy-gm`; `rx-data-check` and `dcb-data-refresh` were
created), then **consolidated the same day** into the one-generic-skill convention:

- **`data-refresh`** (user skill) is the only refresh skill. It reads the project's
  `REFRESH.md`, bootstraps one if missing, and appends learned patterns after every run.
- Five projects now carry playbooks: DC Elections Tracker, Robotics Leadership, FantasyGM,
  data center community benefits, FirstPassRx (whose gathering half remains the
  `formulary-data` skill — it's broader than refresh: new payers/states/classes).
- The convention is codified in the base [CLAUDE.md](CLAUDE.md) (Architecture principles →
  "One generic `data-refresh` skill; per-project refresh playbooks").
- Stale `~/Documents/Projects/` paths in the old DC/Robotics skills were corrected to
  `~/Projects/` during conversion.

Overlap note: FirstPassRx's `cr-deploy` and the global `ship` skill cover the same ritual;
in that repo `cr-deploy` (more specific, multi-persona review) should win. If they drift,
fold `cr-deploy`'s extras into `ship` and retire it.

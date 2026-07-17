---
name: data-refresh
description: >
  Refresh any project's dataset by following that project's own refresh playbook
  (REFRESH.md at the project root). Use whenever the user asks to "refresh the data",
  "refresh", "update the dataset", "run the scrapers", "run the pipeline", "pull the latest
  data", "check for new <records>", or "bring the data current" in ANY project. If the
  project has no REFRESH.md yet, this skill bootstraps one by exploring the project, then
  runs it. After every run it updates the playbook with what it learned.
---

# Data refresh — one skill, per-project playbooks

The generic driver for every data project. **All project-specific knowledge lives in the
project**, in `REFRESH.md` at the repo root — entry points, gates, quirks, learned
patterns — versioned with the code it describes. This skill supplies the procedure and the
universal rules; the playbook supplies the project.

## 1. Locate the playbook

Read `REFRESH.md` at the project root (in a worktree, check the worktree root first, then
the main checkout). Also skim `CLAUDE.md`/`AGENTS.md` scar tissue and `issues.md` — the
playbook may lag them.

**If no REFRESH.md exists, bootstrap one before refreshing:** explore the project
(pipeline/scripts/connectors dirs, package.json / Makefile targets, validators, data
layout, scheduled tasks), then write `REFRESH.md` using the template below, marking
anything unverified as such. Then proceed — the first run is how the playbook gets real.

## 2. Run the playbook

The usual shape (the playbook's specifics always win):

1. **Load state** — current data files, issues.md, backlog.md, the playbook's own learned
   patterns. Note per-source counts before.
2. **Fetch/scrape/ingest** per the playbook's entry points.
3. **Validate — the gate.** A failed validator means the refresh is NOT done; fix at the
   source (the scraper/connector), then backfill the written record.
4. **Curate** — flag ambiguous or borderline records for the human; never silently ship
   noise, never auto-fill editorial fields (stance, verdicts, quotes stay human where the
   playbook says so).
5. **Emit + verify the surface** — regenerate derived outputs and spot-check the actual
   UI/product surface changed where expected, not just that files were written.

## 3. Universal rules (apply on every project, playbook or not)

- **Distinguish "source was down" from "source had nothing"** — log the two paths
  differently; report per-source fetched/parsed counts.
- **Append-only; dedupe by key; never re-stamp `captured_at`** on a re-parse of unchanged
  bytes. Counts never drop vs. the previous commit without an explanation.
- **Checkpoint to disk** every N units / phase boundary; a killed session must resume, not
  restart. Re-run nondeterministic stages on failed records only.
- **Rate limits:** ≥1.5–2s/host, cache to disk, backoff on 429, fail fast on 401/403/TLS.
- **Structural dead-ends** (data upstream will never give) get marked as known gaps in
  issues.md, not retried forever.

## 4. Close the loop (mandatory, every run)

- **Update `REFRESH.md`** — append a dated entry to its "Learned patterns" section for
  every new quirk, schema change, source drift, or corrected invocation from this run. If
  the run revealed the playbook itself was wrong or stale (paths moved, a script renamed),
  fix the playbook body, not just the log. This is how the playbook stays current as the
  project develops.
- Log bugs → `issues.md`, leads/deferred work → `backlog.md`.
- **Report:** `✓ N added/updated · ✗ M failed (reason) · gaps: … · → resume/next at X`.
- Ship via the `ship` skill rules (PR by default; merge only on explicit "merge").

## REFRESH.md template (for bootstrapping)

```markdown
# REFRESH.md — <project> data refresh playbook

> Read by the generic `data-refresh` skill. Keep current: every refresh run appends
> learned patterns; structural changes to the pipeline get edited into the body.

## What a refresh is here
<one paragraph: sources → pipeline → outputs → surface>

## Entry points
<exact commands, in order, with flags — copy-pasteable>

## Gates (a refresh is not done until these pass)
<validators, tests, link checks — exact commands>

## Data layout
<source-of-truth files, derived outputs, what the UI reads>

## Quirks / scar tissue
<source oddities, auth, rate limits, known structural gaps>

## Learned patterns (append-only, dated)
- YYYY-MM-DD: <entry>
```

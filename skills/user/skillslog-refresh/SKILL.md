---
name: skillslog-refresh
description: >
  Mine the Claude Code session history (~/.claude/projects transcripts) for repeated
  request patterns, wasted correction turns, and manual workflows worth skill-ifying; then
  create/update skills, refresh SKILLSLOG.md + PROMPTING.md in coding-best-practices, and
  re-mirror all skills into that repo. Use when the user asks to "analyze my session
  history", "refresh the skills log", "update SKILLSLOG", "what do I keep asking for",
  "find workflows to turn into skills", or wants a periodic (e.g. monthly) prompting/skills
  retrospective.
---

# Skillslog refresh — mine history, grow skills

First run: 2026-07-07 over 30 days (1,224 transcripts / 815 MB → 1,199 typed messages).
Deliverables live in `/Users/pranava/Projects/coding-best-practices`: `SKILLSLOG.md`
(patterns + full skill inventory) and `PROMPTING.md` (inefficiencies). Read both before
re-running — the next run should *diff against* the last one (did "keep going" drop after
the fixes? did `/ship` get used?), not restart from scratch.

## 1. Extract (deterministic — scripts, not agents)

Run the two scripts shipped in this skill's directory (~2 min over ~1 GB, zero tokens):

```bash
cd <scratchpad>
python3 ~/.claude/skills/skillslog-refresh/extract_msgs.py user_msgs.jsonl
python3 ~/.claude/skills/skillslog-refresh/stats.py        # expects ./user_msgs.jsonl
```

- `extract_msgs.py` — walks `~/.claude/projects/**/*.jsonl` (30-day mtime cutoff), keeps
  `type=user`, non-sidechain, non-meta typed text; strips command/system/tool noise.
- `stats.py` — per-project/day counts, correction-signal regexes, task-keyword counts.
  Extend its keyword lists as new hypotheses come up; keep additions in the skill copy.
- Slash-command usage is counted separately: grep raw transcripts for `<command-name>`
  (those records are filtered out of the message extract as noise).

## 2. Analyze

- **Exact repeats:** normalize short messages (lowercase, strip punctuation) and count —
  this is where rituals surface ("keep going" ×50, "test commit push merge").
- **Corrections:** read every hit in full (they're few); each one is either a missing
  default, a missing gate, or a buried ask. Classify before proposing fixes.
- **Clusters:** for each big keyword count, print full samples and read them — counts
  suggest, samples confirm. Distinguish interactive asks from scheduled-task noise
  (`<scheduled-task` messages inflate refresh counts).
- **3+ occurrences of a manual workflow → skill candidate.** But check coverage first
  (step 3) before creating anything.

## 3. Inventory before creating (the big first-run lesson)

- Scan **everything** that can hold a skill: `~/.claude/skills/` (dirs *and* stray flat
  `.md` files), every project's `.claude/skills/` (`find ~/Projects -maxdepth 5 -path
  "*/.claude/skills/*"` — depth 5, not 4 — *plus* `-name "*.md" -maxdepth 4` for flat
  files), and `~/.claude/scheduled-tasks/`.
- **Flat `.md` files in a skills dir never register** — Claude Code requires
  `<name>/SKILL.md` with name/description frontmatter. Migrate any found (this exact miss
  hid 6 working-looking skills and 2 project skills on the first run).
- **Update an existing skill rather than create a near-duplicate.** Two of three "gaps"
  found on the first run were already covered by project skills the shallow scan missed.
- Conventions that constrain what gets created: one generic `data-refresh` skill +
  per-project `REFRESH.md` playbooks (base CLAUDE.md, Architecture principles); project
  rituals fold into the global `ship`/`backlog`/`learnings` skills, not new one-offs.

## 4. Deliver

1. Create/update skills (user-level for cross-project rituals; `REFRESH.md` playbooks for
   project data flows; project skills only for genuinely project-shaped non-refresh work).
2. Rewrite `SKILLSLOG.md`: pattern table with counts (compare to previous run's counts),
   skills created/updated, full inventory (user + project + playbooks + scheduled tasks).
3. Rewrite `PROMPTING.md`: inefficiencies ranked by turns wasted, with concrete fixes and
   a "what's working" section. Note whether last run's fixes moved the numbers.
4. **Re-mirror skills into the repo:** the live source of truth is `~/.claude/skills/`
   (not version-controlled), the versioned mirror is
   `coding-best-practices/skills/` — refresh it every run:
   ```bash
   rsync -a --delete ~/.claude/skills/ "/Users/pranava/Projects/coding-best-practices/skills/user/"
   ```
   (Project skills stay versioned in their own repos; list them in SKILLSLOG instead.)
5. Commit locally if the repo is a git repo. **Do not push or touch other repos' remotes
   without explicit instruction in the current session** — local commit is the autonomous
   ceiling (learned 2026-07-07).

## Learned patterns (append-only, dated)

- 2026-07-07: first run. Baseline numbers to beat next time: continuation nudges ~95
  (8% of messages), ship ritual ~130, backlog rituals 157, learnings asks 42; correction
  rate ~2%. Fixes shipped: `ship`/`backlog`/`learnings`/`data-refresh` skills, flat-skill
  migration, REFRESH.md convention.

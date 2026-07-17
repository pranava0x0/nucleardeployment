---
name: backlog
description: >
  Work with the project's backlog.md — add ideas without losing them, show and reprioritize
  what's open, or pick the next items and execute them. Use whenever the user says "add to
  backlog", "note for backlog", "save this to the backlog", "what's in the backlog",
  "what's left", "what's next", "work on backlog items", or "go implement backlog items".
---

# Backlog — add / show / work

`backlog.md` lives in the project root (create it if missing). Three modes; infer from the
ask.

## Add (default when given content)

- Append each idea as one entry: description + priority (low / medium / high). Never lose
  detail he gave — if he specified an ordering ("fix pedagogical flow first, then
  reorganization, then content"), encode that ordering explicitly.
- Dedupe against existing entries; merge rather than double-log.
- **"Plan it out and add to backlog but don't execute" means zero code changes** — write
  the plan into the entry and stop.

## Show

- Summarize open items grouped by priority, with counts. Call out stale "high" items
  (untouched for weeks) as candidates to demote, and any items already done but not
  checked off.
- If asked "what's next", recommend one concrete next item with a one-line reason, not a
  survey.

## Work

- Read `backlog.md` **first** — before any exploration or agent spawning. Pick the top
  priority item(s), or the ones he named.
- Execute end-to-end (explore → plan → code → verify per CLAUDE.md). Keep going through
  items until done or genuinely blocked — don't stop after one item to ask "continue?".
- Mark completed items done in `backlog.md` (with date), log any bugs found to
  `issues.md`, and finish with the `ship` skill's rules (test/commit/push; PR-gate applies).
- Report status per item at the end: `✓ done · → in progress · ✗ blocked (why)`.

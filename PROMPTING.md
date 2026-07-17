# PROMPTING.md — where your prompting loses turns

> From 30 days of Claude Code history (1,199 typed messages, 29 active days).
> Companion: [SKILLSLOG.md](SKILLSLOG.md) for the pattern counts and skill inventory.
> Ranked by turns wasted, biggest first.

---

## 1. Continuation overhead is your #1 cost: ~95 messages (8% of everything you type)

"keep going" alone appears **50 times verbatim**, plus "continue"-family nudges, 16 bare
"yes", 13 "do it", 3 "you do it". Each one is a full round-trip where Claude stopped —
usually to ask permission or report an increment — and you paid a turn to say "proceed."

**Fixes:**
- Put the stop condition in the *first* message: "don't stop until all 50 states are done,"
  "keep going till the validator passes," "don't wait for me." You already do this
  occasionally ("don't wait for me, just keep going till done") — it works; make it the default.
- For long autonomous grinds, use `/loop` or the ralph-loop plugin instead of manually
  re-nudging every stall.
- When Claude asks a mid-task question you'd always answer the same way ("yes, proceed"),
  say so once: "default to proceeding; only stop for destructive actions." That sentence in
  a project CLAUDE.md kills the whole category for that repo.

## 2. You re-typed the same ship ritual ~130 times

"test commit push merge" and variants, plus "clean up all branches" (63×), plus "address
the codex comments" (33×). That's a paragraph of ritual per session that's now one word:
**`/ship`** (created 2026-07-07). It also fixes #3 below structurally.

## 3. The review gate gets stated *after* the mistake

Three separate projects have the identical correction: "don't merge, I want to review the
PR first" — each after a merge (or near-merge) you didn't want. The gate was in your head,
not the prompt. `ship` now defaults to **PR-and-stop**; it merges only when your message
explicitly says "merge". Corollary: when you *do* want the full chain, say "merge" — an
ambiguous "wrap it up" will stop at the PR.

## 4. Standing preferences are re-typed instead of written down once

- "be token efficient" / "cap of 100k" / "that agent was overkill" — **59 messages**.
- "update docs with learnings from this session" — **42 messages**.
- "write tests and update documentation as you go" — recurring rider on task messages.

Anything you say three times across sessions belongs in CLAUDE.md (project or this base),
a memory, or a skill — not in your fingers. The agent-restraint rules are now in base
CLAUDE.md + memory; the learnings ritual is now the **`learnings`** skill. When a new
standing rule emerges, the cheapest fix is one line here in the base file.

## 5. Buried asks in mega-messages get dropped

Your p90 message is ~800+ characters, often 4–6 unrelated asks in one paragraph (a data fix,
a UI tweak, a backlog note, then "test commit push merge"). Batching is good — the failure
mode is *burying*: "you forgot pa letter stuff" and "you didn't fix crasmap" both trace to
items embedded mid-paragraph among bigger asks.

**Fix:** number the asks. A numbered list survives; prose riders get eaten by the dominant
task. (You did this once — "0) make mobile friendly…" — keep that format.) For anything
that must not be skipped, make it item 1 or its own message.

## 6. Zero custom-skill invocations in 30 days — because your skills never loaded

Only `/model` (7×) and `/loop` (1×) appear in 30 days of command history. Your six
hand-written skills (data refreshes, UATs, portfolio tools) were flat `.md` files in
`~/.claude/skills/`, which Claude Code **does not register** — skills need
`<name>/SKILL.md` directory format. Sessions that "ran the refresh skill" only worked when
Claude happened to read the file as a document. All six are migrated and now trigger
(details in SKILLSLOG.md §3). The 19 bare "launch" messages are also covered by the
built-in `/run` plus a `.claude/launch.json` per project.

## 7. Deictic references cost clarification round-trips

"fix that", "spacing off here:", "404 not found" (as the entire message) work when the
context is fresh, but several turned into an extra "which one?" or a wrong-target fix.
One anchor word is enough: "spacing off on the roster table," "the /data tab 404s."

## What's already working — keep doing it

- **Correction rate is only ~2%** (≈25 real corrections in 1,199 messages). Your asks are
  understood; the waste is ritual and stalls, not ambiguity.
- **Typos don't matter.** 67 messages have heavy typos ("test commit push mereg") and
  essentially none caused a misfire. Don't slow down to fix them.
- **Inline resource caps work.** "one agent run with a cap of 100k tokens" reliably
  prevented runaway fan-outs every time you used it.
- **Trailing ritual fragments** ("…then test commit push merge to main") are a good
  pattern — and now they auto-trigger the `ship` skill.

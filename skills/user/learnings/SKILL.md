---
name: learnings
description: >
  Capture this session's learnings into the project's doc set (CLAUDE.md, AGENTS.md,
  DESIGN.md, issues.md, backlog.md) and propose promoting universal lessons to the
  coding-best-practices base file. Use whenever the user says "update docs with learnings",
  "update claude/agents with learnings from this session", "save the agent learnings",
  "update documentation with learnings", or asks to evaluate agent/token use from a session.
---

# Learnings — session scar tissue into docs

Pranava asks for this at the end of most substantive sessions (~40×/month). The point is
scar tissue: what surprised us, what failed, what the correct invocation turned out to be —
so the next session doesn't repeat the mistake.

## What to harvest from the session

- **Failed patterns and their fixes** — a scraper quirk, a tool that needed different
  flags, a background shell that hung, an assumption that was wrong.
- **Correct invocations** discovered the hard way (exact CLI commands, endpoints, limits).
- **Agent/token retrospective** (whenever agents or workflows ran): delivery of results,
  comprehensiveness, token use, and the cheaper route that would have been as accurate
  (e.g. "keyword grep would have replaced this agent"). He asks for this explicitly and
  repeatedly — include it by default.
- **Bugs found** (with root cause: code bug vs. test bug) and **ideas deferred**.

## Where each item goes

| Item | Destination |
|---|---|
| Project-specific quirk, invocation, workflow fix | project `CLAUDE.md` or `AGENTS.md` (whichever the project uses for that topic) |
| Agent-behavior rule (how agents should run here) | `AGENTS.md` |
| Bug + root cause + status | `issues.md` |
| Idea / deferred work + priority | `backlog.md` |
| UI/design decision | `DESIGN.md` |
| **Universal** lesson (applies beyond this project) | propose promotion to `/Users/pranava/Projects/coding-best-practices/CLAUDE.md` — the canonical base file. State the proposed line and add it there too (project files extend the base and win on conflict). |

## Rules

- **Append, don't rewrite.** Concise dated entries in the file's existing voice. One line
  that prevents a repeated mistake beats a paragraph.
- Check for an existing entry covering the same lesson; sharpen it instead of duplicating.
- If the session used a project skill (data refresh, UAT), also update **that skill file's**
  learned-patterns section — several of his skills are self-improving by design.
- Don't log what git history or the code already records; log what was *non-obvious*.

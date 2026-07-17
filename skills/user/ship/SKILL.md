---
name: ship
description: >
  End-of-work ship ritual: update project docs with session learnings, run tests, commit,
  push, open a PR, code-review it, address feedback (including Codex bot comments), then
  stop for the user's review — merge to main only when explicitly told. Use whenever the
  user says "ship", "test commit push merge", "commit push merge", "push merge", "merge to
  main", "open a PR", "wrap up", "CR/deploy", or any variant of the commit→push→PR→merge
  ritual, even as a trailing fragment at the end of a longer message.
---

# Ship — test, commit, push, PR, review, merge

The ritual Pranava types constantly ("test commit push merge", ~130 times/month). Run the
whole chain without stopping to ask, except at the one gate that matters (step 7).

## The merge gate (read first)

- If the triggering message contains **"merge"** (e.g. "test commit push merge",
  "merge to main") → run the full chain including merge and branch cleanup.
- If it does **not** (e.g. "open a PR", "commit and push") → stop after the PR + code
  review and post the PR link for his review. He has corrected premature merges more than
  once ("don't merge, I want to review the PR first"). Never merge on an ambiguous ask.

## Steps

1. **Preflight.**
   - `git status` + `git fetch`. If on `main`/`master`, branch first.
   - `git rev-list --left-right --count origin/main...HEAD` — if diverged, integrate onto
     latest remote before anything else (parallel sessions advance main mid-task).
   - Set commit identity locally if unset (works in any sandbox):
     `git config user.name "pranava0x0"` and
     `git config user.email "<id>+pranava0x0@users.noreply.github.com"` (look up the id
     from an existing commit if needed). No `Co-Authored-By:` trailers, no AI footers —
     ever, including in the PR body and merge commit.

2. **Docs with learnings.** Update whichever of these exist before committing:
   `issues.md` (bugs found this session, root cause, status), `backlog.md` (ideas, deferred
   work, next steps per area), `CLAUDE.md`/`AGENTS.md` (scar tissue: quirks, failed
   patterns, correct invocations, agent/token-efficiency learnings), `DESIGN.md` (UI
   decisions). Append concisely; don't rewrite. (The standalone version of this is the
   `learnings` skill — same rules.)

3. **Test.** Run the full suite. Fix failures before proceeding — never commit red. Run
   tests and commit as **separate steps**; never gate a commit on a piped grep of test
   output.

4. **Commit** in small focused chunks with plain-voice messages (what + why:
   "fix off-by-one in pagination when filter is empty", not "fix bug").

5. **Push + PR.** Push the branch; `gh pr create` with a short plain-prose body (no
   template filler, no generated-with footers).

6. **Code review + feedback.** Run an adversarial review of the PR diff, scaled to the
   diff's actual size (one careful read for a small diff; don't fan out agents for a
   70-line change). Fix real findings. Then check for bot/human comments on the PR
   (`gh pr view --comments`, `gh api .../pulls/<n>/comments`) — Codex reviews often land a
   minute or two after opening, so poll briefly. Address them, comment inline on the PR to
   close them out, re-test, commit, push.

7. **Gate.** Apply the merge-gate rule above. If stopping: report the PR link + one-line
   test status and end the turn.

8. **Merge + cleanup** (only when authorized): merge to main, verify any deploy gate
   (GitHub Pages build) actually went green, then delete the feature branch local + remote
   and prune (`git fetch --prune`). Verify local vs. remote state before deleting anything.

9. **Report** one line: `✓ tests · PR #N · merged (or: awaiting your review) · branches cleaned`.

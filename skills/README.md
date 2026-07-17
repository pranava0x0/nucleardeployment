# skills/ — versioned mirror of the user-level Claude Code skills

**Live source of truth: `~/.claude/skills/`** (that's what Claude Code loads). It isn't
version-controlled, so this directory is its versioned mirror — edit there, re-sync here.
Don't edit the mirror directly; a change made only here never runs.

Re-sync (done automatically by the `skillslog-refresh` skill on every retrospective run):

```bash
rsync -a --delete ~/.claude/skills/ "/Users/pranava/Projects/coding-best-practices/skills/user/"
```

Project-level skills (`<project>/.claude/skills/`) and `REFRESH.md` playbooks are already
versioned in their own repos and are deliberately **not** mirrored here — see
[SKILLSLOG.md](../SKILLSLOG.md) for the full inventory of both, plus scheduled tasks.

Skill format reminder: `<name>/SKILL.md` with `name:`/`description:` frontmatter. Flat
`.md` files in a skills directory are silently ignored by Claude Code (the 2026-07-07
audit found six that had never registered).

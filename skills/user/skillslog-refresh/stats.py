#!/usr/bin/env python3
import json, re, time
from collections import Counter
from pathlib import Path

msgs = [json.loads(l) for l in open("user_msgs.jsonl")]

# per project
proj = Counter(m["project"] for m in msgs)
print("== messages per project (top 20) ==")
for p, c in proj.most_common(20):
    print(f"{c:5d}  {p}")

# per day
days = Counter((m["ts"] or "")[:10] for m in msgs)
print("\n== messages per day ==")
for d in sorted(days):
    print(f"{d}  {days[d]}")

# length dist
lens = sorted(m["len"] for m in msgs)
print(f"\nlen: min {lens[0]} p50 {lens[len(lens)//2]} p90 {lens[int(len(lens)*.9)]} max {lens[-1]}")

# correction signals
CORR = {
    "no/not what I asked": r"^no[,.\s]|not what i (asked|meant|want)",
    "you didn't / you missed": r"you (didn'?t|did not|missed|forgot|ignored|broke)",
    "I already / I said": r"i (already|just) (said|told|asked)|as i said",
    "still broken/wrong": r"\bstill (broken|wrong|not work|doesn'?t|fails|failing|shows)",
    "don't do X": r"^don'?t |please don'?t|stop (doing|using|adding)",
    "why did you": r"why (did|are|would) you",
    "revert/undo": r"\b(revert|undo|roll ?back)\b",
    "again (re-ask)": r"\bagain\b",
    "wrong": r"\bwrong\b",
    "actually": r"^actually\b",
}
print("\n== correction signals ==")
for name, pat in CORR.items():
    rx = re.compile(pat, re.I)
    hits = [m for m in msgs if rx.search(m["text"])]
    print(f"{len(hits):4d}  {name}")

# common task keywords
KW = {
    "commit": r"\bcommit\b", "push": r"\bpush\b", "deploy": r"\bdeploy",
    "README": r"\breadme\b", "test": r"\btests?\b", "mobile": r"\bmobile\b",
    "screenshot": r"\bscreenshot", "refresh/update data": r"\b(refresh|update).{0,20}data\b",
    "fix bug": r"\bfix\b", "review": r"\breview\b", "verify": r"\bverify\b",
    "backlog": r"\bbacklog\b", "issues.md": r"issues\.md", "CLAUDE.md": r"claude\.md",
    "skill": r"\bskill\b", "footer": r"\bfooter\b", "favicon": r"\bfavicon\b",
    "gh pages / pages": r"github pages|gh-pages|gh pages",
    "co-author": r"co-?author", "simplify": r"simplif", "design": r"\bdesign\b",
    "dashboard": r"\bdashboard\b", "scrape": r"\bscrap(e|ing)\b",
    "pdf": r"\bpdf\b", "csv": r"\bcsv\b", "audit": r"\baudit\b",
    "merge PR": r"\bmerge\b", "worktree": r"worktree", "parallel": r"parallel",
    "cheaper/tokens": r"\btokens?\b|\bcost\b", "plan first": r"\bplan\b",
}
print("\n== task keywords ==")
for name, pat in KW.items():
    rx = re.compile(pat, re.I)
    print(f"{sum(1 for m in msgs if rx.search(m['text'])):4d}  {name}")

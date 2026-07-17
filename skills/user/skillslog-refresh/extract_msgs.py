#!/usr/bin/env python3
"""Extract human-typed user messages from Claude Code transcripts (last 30 days)."""
import json
import os
import re
import sys
import time
from pathlib import Path

ROOT = Path.home() / ".claude" / "projects"
CUTOFF = time.time() - 30 * 86400
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("user_msgs.jsonl")

def text_of(msg):
    """Return typed text from a user message, or None if it's tool-result/system noise."""
    content = msg.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
        return "\n".join(parts) if parts else None
    return None

NOISE_PATTERNS = [
    re.compile(r"^<(command-name|command-message|local-command)", re.S),
    re.compile(r"^<system-reminder", re.S),
    re.compile(r"^Caveat: The messages below"),
    re.compile(r"^\[Request interrupted"),
    re.compile(r"^<task-notification"),
    re.compile(r"^<local-command-stdout"),
]

n_files = 0
n_msgs = 0
with OUT.open("w") as out:
    for path in ROOT.rglob("*.jsonl"):
        try:
            if path.stat().st_mtime < CUTOFF:
                continue
        except OSError:
            continue
        n_files += 1
        project = path.parent.name
        try:
            with path.open() as f:
                for line in f:
                    try:
                        rec = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    if rec.get("type") != "user":
                        continue
                    if rec.get("isMeta"):
                        continue
                    # skip sidechain (subagent) conversations
                    if rec.get("isSidechain"):
                        continue
                    msg = rec.get("message", {})
                    if msg.get("role") != "user":
                        continue
                    txt = text_of(msg)
                    if not txt:
                        continue
                    txt = txt.strip()
                    if not txt or len(txt) < 2:
                        continue
                    if any(p.match(txt) for p in NOISE_PATTERNS):
                        continue
                    # strip embedded system-reminder blocks
                    txt = re.sub(r"<system-reminder>.*?</system-reminder>", "", txt, flags=re.S).strip()
                    if not txt:
                        continue
                    out.write(json.dumps({
                        "ts": rec.get("timestamp"),
                        "project": project,
                        "session": rec.get("sessionId"),
                        "len": len(txt),
                        "text": txt[:2000],
                    }) + "\n")
                    n_msgs += 1
        except OSError:
            continue

print(f"files scanned: {n_files}, user messages: {n_msgs}, out: {OUT}")

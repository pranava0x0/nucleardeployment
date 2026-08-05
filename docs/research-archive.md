# Research archive

`data/research/source-registry.json` stores every source retained from research. It records publisher, publication date, officials, companies, reactor types, deployment stages, industry domain, geography, intended use, and a narrow evidence note.

`data/research/search-history.jsonl` is append-only. One line records one search seam: queries, surfaces searched, result, archived source IDs, and gaps.

`data/research/link-check-history.jsonl` is append-only. It distinguishes live, blocked, and dead URLs. A 403 is blocked, not dead.

Rules:

1. Social, commentary, Reddit, and trade press discover leads. They do not set a deployment stage when a regulator, agency, filing, or executed company record exists.
2. `lead-only` means useful but not sufficient for a public tracker claim.
3. `supports-discovery` means an inventory or dashboard that still needs record-level verification.
4. Preserve negative results. A missing vendor award or inaccessible social seam prevents future duplicate searching.
5. Add a new registry record before using a researched URL in the tracker.

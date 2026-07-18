# Agent runs

| Date | Run | Agent/workflow | Worked | Quality | Approx. tokens | Best lower-cost alternative |
| --- | --- | --- | --- | --- | ---: | --- |
| 2026-07-17 | Company census, reactor taxonomy, Penney/Bahran/Waksman scan | Solo Codex; no subagents | Yes | 11 sourced projects and nine companies added; social leads separated from stage evidence | Not measured | Direct targeted searches were correct; no agent fan-out needed |
| 2026-07-17 | Local UI UAT after taxonomy/filter changes | In-app browser | No | Localhost reload succeeded, then DOM access was blocked by browser URL policy; no visual claim made | Not measured | Keep render tests as the verified signal; retry visual UAT only when localhost policy permits |

Future subagent or workflow runs append one row. Web searches belong in `data/research/search-history.jsonl`.

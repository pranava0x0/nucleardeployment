"use client";

import { useEffect, useRef, useState } from "react";

type Sort = "evidence" | "announced";

/** Filter and reorder server-rendered rows without shipping the dataset. */
function updateRows(query: string, lane: string, sort: Sort, saved: WeakMap<HTMLDetailsElement, boolean>, startingNewSession: boolean) {
  const board = document.querySelector<HTMLOListElement>("[data-race-board]");
  if (!board) return 0;
  const tail = board.querySelector<HTMLOListElement>(".race-board-rest");
  const wrapper = board.querySelector<HTMLElement>(".race-board-more");
  const details = tail?.closest("details");
  const active = !!query.trim() || lane !== "all" || sort !== "evidence";
  if (details && (startingNewSession || !saved.has(details))) saved.set(details, details.open);
  const rows = [...board.querySelectorAll<HTMLElement>("[data-filter]")];
  const needle = query.trim().toLowerCase();
  let visible = 0;
  rows.sort((a, b) => (sort === "announced"
    ? Number(b.dataset.announced) - Number(a.dataset.announced) : 0)
    || Number(a.dataset.order) - Number(b.dataset.order));
  for (const [index, row] of rows.entries()) {
    const hit = (!needle || (row.dataset.filter ?? "").includes(needle))
      && (lane === "all" || row.dataset.lane === lane);
    row.hidden = !hit;
    const rank = row.querySelector<HTMLElement>(".race-rank");
    if (rank) rank.textContent = String(index + 1).padStart(2, "0");
    if (hit) visible += 1;
    // Keep six rows outside the native disclosure in either ordering.
    (tail && index >= 6 ? tail : board).appendChild(row);
  }
  if (wrapper) { board.appendChild(wrapper); wrapper.hidden = active && visible === 0; }
  if (details) details.open = active ? visible > 0 : (saved.get(details) ?? false);
  const empty = document.querySelector<HTMLElement>("[data-race-empty]");
  if (empty) empty.hidden = visible > 0;
  return visible;
}

export function RaceFilter({ total }: { total: number }) {
  const [query, setQuery] = useState("");
  const [lane, setLane] = useState("all");
  const [sort, setSort] = useState<Sort>("evidence");
  const [matches, setMatches] = useState(total);
  const openBeforeFilter = useRef(new WeakMap<HTMLDetailsElement, boolean>());
  // Cached server DOM may retain a previous search or ordering on navigation.
  useEffect(() => { updateRows("", "all", "evidence", openBeforeFilter.current, false); }, []);

  function apply(nextQuery: string, nextLane: string, nextSort: Sort) {
    const wasActive = !!query.trim() || lane !== "all" || sort !== "evidence";
    const isActive = !!nextQuery.trim() || nextLane !== "all" || nextSort !== "evidence";
    const startingNewSession = !wasActive && isActive;
    setQuery(nextQuery); setLane(nextLane); setSort(nextSort);
    setMatches(updateRows(nextQuery, nextLane, nextSort, openBeforeFilter.current, startingNewSession));
  }

  return <div className="race-filter">
    <label className="race-search"><span>Find a company</span><input type="search" value={query}
      onChange={(event) => apply(event.target.value, lane, sort)}
      placeholder="Company, design, or lane" aria-label="Filter the race board by company, design, or lane" /></label>
    <label><span>Reactor class</span><select aria-label="Reactor class" value={lane} onChange={(event) => apply(query, event.target.value, sort)}>
      <option value="all">All reactor classes</option><option>Grid-scale SMR</option><option>Microreactor</option>
    </select></label>
    <label><span>Sort by</span><select aria-label="Sort by" value={sort} onChange={(event) => apply(query, lane, event.target.value as Sort)}>
      <option value="evidence">Strongest evidence</option><option value="announced">Announced capacity</option>
    </select></label>
    <output aria-live="polite">{matches} of {total}</output>
    {(query || lane !== "all") && <button type="button" onClick={() => apply("", "all", sort)}>Clear filters</button>}
  </div>;
}

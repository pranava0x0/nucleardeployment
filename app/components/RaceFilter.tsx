"use client";

import { useRef, useState } from "react";

/**
 * Narrows the server-rendered board without shipping the dataset to the
 * client. Each row carries a lowercase `data-filter` haystack precomputed in
 * `raceBoard()`; typing toggles the `hidden` attribute in place and keeps a
 * live count. The rows are server-component output that never re-renders, so
 * direct DOM writes cannot fight React. With JavaScript off, every row simply
 * stays visible.
 *
 * The bottom rows sit inside a closed `<details>` (see RaceBoard's "show
 * all"). Setting `hidden = false` on a match there is not enough: a closed
 * `<details>` hides its content natively regardless of the `hidden`
 * attribute on a descendant, so a match past the fold would toggle visible
 * and still render nothing. A matching row opens its `<details>` ancestor.
 */
export function RaceFilter({ total }: { total: number }) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState(total);
  // Save/restore, never an unconditional reset: force-opening on a match and
  // leaving it open once the query clears would silently defeat the board's
  // 6-row default for the rest of the session. Remember each <details>'s
  // state from before the filter first touched it, and restore that state
  // (not just "closed") once the query empties, so a reader who opened it by
  // hand before typing doesn't get it snapped shut on them either.
  const openBeforeFilter = useRef(new WeakMap<HTMLDetailsElement, boolean>());

  const apply = (value: string) => {
    setQuery(value);
    const rows = document.querySelectorAll<HTMLElement>("[data-filter]");
    const empty = document.querySelector<HTMLElement>("[data-race-empty]");
    const needle = value.trim().toLowerCase();
    let visible = 0;
    rows.forEach((row) => {
      const hit = !needle || (row.dataset.filter ?? "").includes(needle);
      row.hidden = !hit;
      if (hit) visible += 1;
      const details = row.closest("details");
      if (!details) return;
      if (!openBeforeFilter.current.has(details)) openBeforeFilter.current.set(details, details.open);
      if (hit && needle) details.open = true;
      else if (!needle) details.open = openBeforeFilter.current.get(details) ?? false;
    });
    if (empty) empty.hidden = visible > 0;
    setMatches(visible);
  };

  return (
    <div className="race-filter">
      <label>
        <span>Filter</span>
        <input
          type="search"
          value={query}
          onChange={(event) => apply(event.target.value)}
          placeholder="Company, design, or lane"
          aria-label="Filter the race board by company, design, or lane"
        />
      </label>
      <output aria-live="polite">{matches} of {total}</output>
    </div>
  );
}

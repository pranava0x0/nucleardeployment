import Link from "next/link";
import { capacityBands, dataAsOf, gigawattMWe, raceBoard, raceScaleMWe, raceTotals, type RaceRow } from "../data";
import { RaceFilter } from "./RaceFilter";

const mwe = (value: number) => value.toLocaleString("en-US");
const trackPercent = (value: number) => Math.min(100, (value / raceScaleMWe) * 100);

/** The gigawatt line sits at the same place on every track on the site. */
export const gigawattLinePercent = (gigawattMWe / raceScaleMWe) * 100;

export function RaceBar({ row, compact = false }: { row: RaceRow; compact?: boolean }) {
  const executed = row.cells.filter((cell) => cell.band !== "framework" && cell.mwe > 0);
  const framework = row.cells.find((cell) => cell.band === "framework");
  const frameworkMWe = framework?.mwe ?? 0;
  // Segments are clamped individually, so a row whose bands sum past the track
  // would render as a full bar with nothing to say so. Say so.
  const executedOverflows = row.executedMWe > raceScaleMWe;

  return (
    <figure className={`race-figure${compact ? " compact" : ""}`} aria-label={row.ariaLabel}>
      <div className="race-track" data-empty={executed.length ? undefined : "true"} data-overflow={executedOverflows ? "true" : undefined}>
        {executed.map((cell) => (
          <span
            className={`race-seg band-${cell.band}`}
            key={cell.band}
            style={{ width: `${trackPercent(cell.mwe)}%` }}
          />
        ))}
        <span className="gw-line" style={{ left: `${gigawattLinePercent}%` }} aria-hidden="true" />
      </div>
      <div className="race-track ghost" data-empty={frameworkMWe ? undefined : "true"}>
        {frameworkMWe > 0 && <span className="race-seg band-framework" style={{ width: `${trackPercent(frameworkMWe)}%` }} />}
        <span className="gw-line" style={{ left: `${gigawattLinePercent}%` }} aria-hidden="true" />
      </div>
      <figcaption className="race-caption">
        {executedOverflows && <span className="race-overflow">{mwe(row.executedMWe)} MWe executed, past the end of the track. </span>}
        {frameworkMWe > 0
          ? <span>{mwe(frameworkMWe)} MWe announced, non-binding{frameworkMWe > gigawattMWe ? ", runs past the line" : ""}</span>
          : framework?.claims.length
            ? <span>Announced framework on record, capacity not disclosed</span>
            : <span>No announced pipeline on record</span>}
      </figcaption>
    </figure>
  );
}

/** Rows shown before the "show all" toggle. Past this, a reader wants a specific company, which the filter already answers. */
const VISIBLE_ROWS = 6;

function RaceRowItem({ row, index }: { row: RaceRow; index: number }) {
  return (
    <li className="race-row" key={row.company.slug} data-filter={row.filterText}>
      <div className="race-id">
        <span className="race-rank" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <h3><Link className="row-link" href={`/companies/${row.company.slug}`}>{row.company.name}</Link></h3>
        <p>{row.entrant.design} · {row.entrant.unitMWe.toLocaleString("en-US")} MWe per unit · {row.entrant.lane}</p>
      </div>
      <RaceBar row={row} />
      <p className="race-state">{row.strongestLine}</p>
    </li>
  );
}

export function RaceBoard() {
  const board = raceBoard();
  const totals = raceTotals();
  const visible = board.slice(0, VISIBLE_ROWS);
  const rest = board.slice(VISIBLE_ROWS);

  return (
    <section className="section race-section" id="race">
      <div className="board-head">
        <h2>The race board</h2>
        <p>
          {board.length} companies building new-design reactors for U.S. deployment, ranked by the strongest state
          their megawatts have actually reached. Tracked sample, as of {dataAsOf}.
        </p>
      </div>

      <div className="race-key">
        <RaceFilter total={board.length} />
        <ul className="key-line" aria-label="Band key, strongest evidence first">
          {capacityBands.map((band) => (
            <li key={band.band}><span className={`legend-swatch band-${band.band}`} aria-hidden="true" />{band.label}</li>
          ))}
        </ul>
        <a className="key-more" href="#race-legend">Full key ↓</a>
      </div>

      <ol className="race-board">
        {visible.map((row, index) => <RaceRowItem row={row} index={index} key={row.company.slug} />)}
        {rest.length > 0 && (
          <li className="race-board-more">
            <details>
              <summary>Show all {board.length} companies ↓</summary>
              <ol className="race-board-rest">
                {rest.map((row, index) => <RaceRowItem row={row} index={VISIBLE_ROWS + index} key={row.company.slug} />)}
              </ol>
            </details>
          </li>
        )}
      </ol>
      <p className="race-no-match lane-empty" data-race-empty hidden>
        No entrant matches that filter. Clear it to see all {board.length} companies.
      </p>

      <div className="race-legend" id="race-legend">
        <h3>How to read the bars</h3>
        <p>
          The track runs to {mwe(raceScaleMWe)} MWe. The vertical rule is one gigawatt. Each company gets two tracks:
          megawatts backed by an executed action on top, announced and non-binding megawatts on the fainter track below.
          The two are never added together, and announced megawatts never change the ranking.
        </p>
        <dl>
          {capacityBands.map((band) => {
            const total = totals.find((entry) => entry.band === band.band);
            return (
              <div key={band.band}>
                <dt><span className={`legend-swatch band-${band.band}`} aria-hidden="true" />{band.label}</dt>
                <dd>
                  <b>{mwe(total?.mwe ?? 0)} MWe</b> across {total?.entrants ?? 0} {total?.entrants === 1 ? "entrant" : "entrants"}.
                  {" "}{band.rule} Authority: {band.authority}.
                </dd>
              </div>
            );
          })}
        </dl>
        <Link className="button secondary" href="/methodology#race">Read the roster and band rules</Link>
      </div>
    </section>
  );
}

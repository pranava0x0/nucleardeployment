import Link from "next/link";
import { capacityBands, dataAsOf, gigawattMWe, raceBoard, raceScaleMWe, raceTotals, type RaceRow } from "../data";

const mwe = (value: number) => value.toLocaleString("en-US");
const trackPercent = (value: number) => Math.min(100, (value / raceScaleMWe) * 100);

/** The gigawatt line sits at the same place on every track on the site. */
export const gigawattLinePercent = (gigawattMWe / raceScaleMWe) * 100;

export function RaceBar({ row, compact = false }: { row: RaceRow; compact?: boolean }) {
  const executed = row.cells.filter((cell) => cell.band !== "framework" && cell.mwe > 0);
  const framework = row.cells.find((cell) => cell.band === "framework");
  const frameworkMWe = framework?.mwe ?? 0;

  return (
    <figure className={`race-figure${compact ? " compact" : ""}`} aria-label={row.ariaLabel}>
      <div className="race-track" data-empty={executed.length ? undefined : "true"}>
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
        {frameworkMWe > 0
          ? <span>{mwe(frameworkMWe)} MWe announced, non-binding{frameworkMWe > gigawattMWe ? " — runs past the line" : ""}</span>
          : framework?.claims.length
            ? <span>Announced framework on record, capacity not disclosed</span>
            : <span>No announced pipeline on record</span>}
      </figcaption>
    </figure>
  );
}

export function RaceBoard() {
  const board = raceBoard();
  const totals = raceTotals();
  const executedTotal = totals.filter((total) => total.band !== "framework").reduce((sum, total) => sum + total.mwe, 0);
  const frameworkTotal = totals.find((total) => total.band === "framework")?.mwe ?? 0;
  const announcedRatio = Math.round(frameworkTotal / executedTotal);

  return (
    <section className="section race-section" id="race">
      <div className="section-head">
        <h2>The race to a gigawatt</h2>
        <p>
          <b>{board.length} companies</b> building new-design reactors for U.S. deployment, ranked by the strongest
          state their megawatts have actually reached. Tracked sample, as of {dataAsOf}.
        </p>
      </div>

      <p className="race-zero">
        <b>0 MWe operational across all {board.length} entrants.</b> Every megawatt below sits in a leading
        indicator — under construction, under review, under contract, or merely announced. {mwe(executedTotal)} MWe
        rest on an executed action; {mwe(frameworkTotal)} MWe are announced and non-binding, about{" "}
        {announcedRatio} times more.
      </p>

      <ol className="race-board">
        {board.map((row, index) => (
          <li className="race-row" key={row.company.slug}>
            <div className="race-id">
              <span className="race-rank" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <h3><Link href={`/companies/${row.company.slug}`}>{row.company.name}</Link></h3>
              <p>{row.entrant.design} · {mwe(row.entrant.unitMWe)} MWe per unit · {row.entrant.lane}</p>
            </div>
            <RaceBar row={row} />
            <p className="race-state">{row.strongestLine}</p>
          </li>
        ))}
      </ol>

      <div className="race-legend">
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

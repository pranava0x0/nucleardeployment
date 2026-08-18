import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../components/SiteHeader";
import {
  bdAsOf, bdBuyers, bdClasses, bdClassShort, bdMicroPath, bdMicroPathJudgment,
  bdSectorPlans, bdSectors, bdSignals, bdTiers, type BdBuyer, type BdClass, type BdSector,
} from "../bd-data";
import { canonicalUrl } from "../site";

export const metadata: Metadata = {
  title: "BD",
  description: "Who buys new U.S. nuclear, by reactor class and sector: executed deals, equity stakes, prepayments, frameworks, and programs, each with its source, plus a business-development read on every sector.",
  alternates: { canonical: canonicalUrl("/bd") },
};

const tierIndex = (tier: string) => bdTiers.findIndex((entry) => entry.tier === tier);

/** The strongest position a buyer holds in a class, by ladder order. */
function strongestIn(buyer: BdBuyer, cls: BdClass) {
  const held = buyer.positions.filter((position) => position.class === cls);
  if (!held.length) return null;
  return held.reduce((best, position) => (tierIndex(position.tier) < tierIndex(best.tier) ? position : best));
}

const buyersIn = (sector: BdSector) => bdBuyers.filter((buyer) => buyer.sector === sector);

export default function BdPage() {
  return <PageShell><main id="main" className="inner-page bd-page">
    <header className="page-lead grid-bg">
      <h1>Business development</h1>
      <p>Who buys new nuclear, by reactor class: the executed deals, equity stakes, prepayments, frameworks, and government programs on the record, and what it takes to sell into each sector. Buyer positions are sourced facts; sector plans are this site&rsquo;s judgment, labeled as such. As of {bdAsOf}.</p>
    </header>

    <section className="section" id="matrix">
      <div className="section-head"><h2>The demand matrix</h2><p>Each cell shows the strongest position a buyer holds in a reactor class, on a ladder that keeps contracts, stakes, moved money, frameworks, programs, and statements apart. Details and sources sit in the ledger below; the matrix answers only who touches what.</p></div>
      <div className="bd-matrix-scroll">
        <table className="bd-matrix">
          <thead>
            <tr>
              <th scope="col">Buyer</th>
              {bdClasses.map((cls) => <th key={cls} scope="col">{cls}</th>)}
            </tr>
          </thead>
          {bdSectors.map((sector) => {
            const rows = buyersIn(sector);
            if (!rows.length) return null;
            return <tbody key={sector}>
              <tr className="bd-sector-row"><th colSpan={bdClasses.length + 1} scope="colgroup">{sector}</th></tr>
              {rows.map((buyer) => <tr key={buyer.slug}>
                <th scope="row"><a href={`#buyer-${buyer.slug}`}>{buyer.name}</a></th>
                {bdClasses.map((cls) => {
                  const strongest = strongestIn(buyer, cls);
                  return <td key={cls}>
                    {strongest
                      ? <a href={`#buyer-${buyer.slug}`} className={`bd-chip tier-${tierIndex(strongest.tier)}`} title={strongest.label} aria-label={`${buyer.name}, ${cls}: ${strongest.tier}`}>{bdTiers[tierIndex(strongest.tier)].short}</a>
                      : null}
                  </td>;
                })}
              </tr>)}
            </tbody>;
          })}
        </table>
      </div>
      <div className="definition-grid bd-legend">
        {bdTiers.map((entry) => <div key={entry.tier}>
          <b>{entry.short} · {entry.tier}</b>
          <p>{entry.meaning}</p>
        </div>)}
      </div>
      <p className="data-note">Ladder rungs are never collapsed: a letter of intent is not a contract, a program is not an order, and a statement is not a commitment. &ldquo;Any class&rdquo; holds positions that create demand without picking a reactor size.</p>
    </section>

    <section className="section" id="positions">
      <div className="section-head"><h2>Positions on the record</h2><p>Every position behind the matrix, with its date and source. Figures stay inside their own claims and are never summed across rows.</p></div>
      {bdSectors.map((sector) => {
        const rows = buyersIn(sector);
        if (!rows.length) return null;
        return <div key={sector}>
          <h3 className="lane-sub">{sector}</h3>
          <div className="frame-grid">
            {rows.map((buyer) => <article key={buyer.slug} id={`buyer-${buyer.slug}`}>
              <h3>{buyer.name}</h3>
              <p className="frame-note">{buyer.note}</p>
              <ul className="ledger wide">
                {buyer.positions.map((position) => <li key={position.source + position.label.slice(0, 32)}>
                  <span className="ledger-date">{bdClassShort[position.class]} · {bdTiers[tierIndex(position.tier)].short}{position.date ? ` · ${position.date}` : ""}</span>
                  <b>{position.label}</b>
                  <a href={position.source} target="_blank" rel="noreferrer">Source ↗</a>
                </li>)}
              </ul>
            </article>)}
          </div>
        </div>;
      })}
      <p className="data-note">Costs by reactor class, contracting mechanisms, and underwriters live on the <Link href="/financing">financing page</Link>; per-company deal histories live on each <Link href="/companies">company dossier</Link>.</p>
    </section>

    <section className="section" id="sector-plans">
      <div className="section-head"><h2>Sector plans</h2><p>The site&rsquo;s business-development read of each sector. Evidence lines carry their own sources; the thesis, plays, and watch item in each plan are judgment derived from the records on this page, not sourced claims.</p></div>
      {bdSectorPlans.map((plan) => <article className="bd-plan" key={plan.sector}>
        <h3 className="lane-sub">{plan.sector}</h3>
        <p className="bd-thesis"><span className="bd-label">Thesis · site judgment</span>{plan.thesis}</p>
        <ul className="ledger wide">
          {plan.evidence.map((line) => <li key={line.source + line.text.slice(0, 24)}>
            <span className="ledger-date">Evidence</span>
            <b>{line.text}</b>
            <a href={line.source} target="_blank" rel="noreferrer">Source ↗</a>
          </li>)}
        </ul>
        <div className="definition-grid">
          {plan.plays.map((play) => <div key={play.move}>
            <b>{play.move}</b>
            <p>{play.why}</p>
          </div>)}
        </div>
        <p className="bd-watch"><span className="bd-label">Watch · site judgment</span>{plan.watch}</p>
      </article>)}
    </section>

    <section className="section" id="micro-path">
      <div className="section-head"><h2>The microreactor cadence question</h2><p>Could microreactors ship at 10 to 20 units a year from 2028 onward? The documented rungs, in sequence, from proven physics to a factory rate.</p></div>
      <ul className="ledger wide">
        {bdMicroPath.map((rung, index) => <li key={rung.step}>
          <span className="ledger-date">{index + 1}. {rung.date ?? "Date not stated"}</span>
          <b>{rung.step}</b>
          <span className="ledger-detail">{rung.evidence}</span>
          <a href={rung.source} target="_blank" rel="noreferrer">Source ↗</a>
        </li>)}
      </ul>
      <p className="bd-watch"><span className="bd-label">Sequencing · site judgment</span>{bdMicroPathJudgment}</p>
    </section>

    <section className="section" id="signals">
      <div className="section-head"><h2>On the record</h2><p>What the officials, executives, and manufacturers behind these positions have said, paraphrased, with the report that carries each statement.</p></div>
      <ul className="ledger wide">
        {bdSignals.map((signal) => <li key={signal.who + signal.source}>
          <span className="ledger-date">{signal.date ?? "Date not stated"}</span>
          <b>{signal.who} · {signal.role}</b>
          <span className="ledger-detail">{signal.said}</span>
          <a href={signal.source} target="_blank" rel="noreferrer">Source ↗</a>
        </li>)}
      </ul>
    </section>

    <section className="section limitations" id="bd-limits">
      <h2>What this page does not claim</h2>
      <p>This is a tracked sample of buyer positions, not a census of every nuclear conversation. Frameworks and letters of intent are counted as what they are, never as orders; government programs create conditions for demand, not demand itself. No figure on this page is added to any other, and the race board&rsquo;s binding and non-binding lanes remain the authority on megawatts. Research basis and killed assumptions: docs/research/bd-landscape.md in the repository.</p>
    </section>
  </main></PageShell>;
}

import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { PageShell } from "../components/SiteHeader";
import { companies, raceEntrants } from "../data";
import {
  capturedReports, companyFinance, costBenchmarks, financingAsOf, learningRungs,
  liabilityPools, mechanisms, overrunRecords, sitingFacts, underwriters,
  type FinanceLane, type SourcedLine,
} from "../financing-data";
import { canonicalUrl } from "../site";

export const metadata: Metadata = {
  title: "Financing",
  description: "What new U.S. nuclear costs by reactor class, what each tracked company needs for a government or commercial contract, the contracting mechanisms in use, and who underwrites the projects. Every figure sourced.",
  alternates: { canonical: canonicalUrl("/financing") },
};

/** Microreactors first: their contracts close first, so the page reads in deal order. */
const laneOrder: FinanceLane[] = ["Microreactor", "Grid-scale SMR", "Large LWR", "Cross-class"];

const laneNotes: Record<FinanceLane, string> = {
  "Microreactor": "First markets are remote and defense loads priced against diesel, not the grid.",
  "Grid-scale SMR": "Approved budgets and target prices exist; no U.S. unit has finished to test them.",
  "Large LWR": "The only class with completed U.S. actuals, and they set the cautionary baseline.",
  "Cross-class": "Estimates spanning the classes.",
};

const companyName = (slug: string) => companies.find((company) => company.slug === slug)?.name ?? slug;

/** "Captured copy, p. N" renders only for report-backed records. */
const pageRef = (report?: { page: number }) => (report ? ` · captured copy, p. ${report.page}` : "");

export default function FinancingPage() {
  const entrantFor = (slug: string) => raceEntrants.find((entrant) => entrant.companySlug === slug);
  const financeByLane = (lane: string) =>
    companyFinance.filter((row) => entrantFor(row.companySlug)?.lane === lane);
  const mechanismGroups: { status: (typeof mechanisms)[number]["status"]; heading: string }[] = [
    { status: "In use", heading: "In use" },
    { status: "Pending award", heading: "Pending award, no executed contract" },
    { status: "Proposed", heading: "Proposed, not yet law or practice" },
  ];
  /** Each claim renders with its own source link, stacked inside the row. */
  const sourcedLines = (lines: SourcedLine[]) => lines.map((line) => <Fragment key={line.source + line.text.slice(0, 24)}>
    <b>{line.text}</b>
    <a href={line.source} target="_blank" rel="noreferrer">Source ↗</a>
  </Fragment>);

  return <PageShell><main id="main" className="inner-page financing-page">
    <header className="page-lead grid-bg">
      <h1>Financing</h1>
      <p>What new nuclear costs by reactor class, what each tracked company still needs before a government or commercial contract can close, which contracting mechanisms are actually in use, and who underwrites the projects. As of {financingAsOf}.</p>
    </header>

    <section className="section" id="cost-ladder">
      <div className="section-head"><h2>The cost ladder</h2><p>Estimates, targets, and the few actuals, grouped by reactor class. Figures sit in different frames and years; they are shown, never averaged, summed, or converted across frames.</p></div>
      {laneOrder.map((lane) => {
        const rows = costBenchmarks.filter((benchmark) => benchmark.lane === lane);
        if (!rows.length) return null;
        return <div key={lane}>
          <h3 className="lane-sub">{lane} · {laneNotes[lane]}</h3>
          <ul className="ledger wide">
            {rows.map((benchmark) => <li key={`${benchmark.figure}-${benchmark.basis}`}>
              <span className="ledger-date">{benchmark.series}{benchmark.date ? ` · ${benchmark.date}` : ""}</span>
              <b>{benchmark.figure}</b>
              <span className="ledger-detail">{benchmark.scope} {benchmark.basis}{pageRef(benchmark.report)}.</span>
              <a href={benchmark.source} target="_blank" rel="noreferrer">Source ↗</a>
            </li>)}
          </ul>
        </div>;
      })}
      <p className="data-note">FOAK is a first-of-a-kind unit; NOAK is the nth of a kind after learning. A company target is the company&rsquo;s own number, printed as such. No figure here is the site&rsquo;s estimate.</p>
    </section>

    <section className="section" id="learning">
      <div className="section-head"><h2>What n units buy</h2><p>The sourced learning ladder: how costs are expected to move from unit 1 to a fleet, and the historical caution that they have not always moved down.</p></div>
      <ul className="ledger wide">
        {learningRungs.map((rung) => <li key={rung.units}>
          <span className="ledger-date">{rung.units}</span>
          <b>{rung.effect}</b>
          <span className="ledger-detail">{rung.basis}{pageRef(rung.report)}.</span>
          <a href={rung.source} target="_blank" rel="noreferrer">Source ↗</a>
        </li>)}
      </ul>
    </section>

    <section className="section" id="companies">
      <div className="section-head"><h2>Company by company</h2><p>How each entrant gets paid, its strongest government vehicle, its strongest commercial position, and any stated price. Model, government, and commercial rows are sourced facts; the next gate is this site&rsquo;s judgment of the event that would move the row.</p></div>
      {["Microreactor", "Grid-scale SMR"].map((lane) => <div key={lane}>
        <h3 className="lane-sub">{lane} lane</h3>
        <div className="frame-grid">
          {financeByLane(lane).map((row) => {
            const entrant = entrantFor(row.companySlug);
            return <article key={row.companySlug}>
              <h3><Link href={`/companies/${row.companySlug}`}>{companyName(row.companySlug)}</Link></h3>
              <p className="frame-note">{entrant?.design} · {entrant?.unitMWe.toLocaleString("en-US")} MWe per unit · {entrant?.ticker ?? "Private"}</p>
              <ul className="ledger wide">
                <li><span className="ledger-date">Model</span><b>{row.model}</b><a href={row.modelSource} target="_blank" rel="noreferrer">Source ↗</a></li>
                <li><span className="ledger-date">Government</span>{sourcedLines(row.government)}</li>
                <li><span className="ledger-date">Commercial</span>{sourcedLines(row.commercial)}</li>
                <li><span className="ledger-date">Stated cost</span>{row.costClaim
                  ? <><b>{row.costClaim}</b>{row.costClaimSource && <a href={row.costClaimSource} target="_blank" rel="noreferrer">Source ↗</a>}</>
                  : <b>No price or cost target on record</b>}</li>
                <li><span className="ledger-date">Next gate</span><b>{row.nextGate}</b><span className="ledger-detail">Site judgment, derived from the records above.</span></li>
              </ul>
            </article>;
          })}
        </div>
      </div>)}
      <p className="data-note">Deal details, dates, and megawatts for every agreement named here live on each company&rsquo;s <Link href="/companies">dossier page</Link>, with the race board&rsquo;s binding and non-binding lanes kept apart.</p>
    </section>

    <section className="section" id="mechanisms">
      <div className="section-head"><h2>Contracting mechanisms</h2><p>Every mechanism listed as in use has at least one executed example. A pending award is a solicited or intended award with no executed contract; proposals are labeled as proposals.</p></div>
      {mechanismGroups.map((group) => {
        const rows = mechanisms.filter((mechanism) => mechanism.status === group.status);
        // An empty lane renders nothing: a heading over an empty grid would be
        // the empty legend slot the project's rules forbid.
        if (!rows.length) return null;
        return <div key={group.status}>
          <h3 className="lane-sub">{group.heading}</h3>
          <div className="definition-grid">
            {rows.map((mechanism) => <div key={mechanism.mechanism}>
              <b>{mechanism.mechanism}</b>
              <p>{mechanism.how}</p>
              <p>{mechanism.example}{mechanism.date ? ` (${mechanism.date}.)` : ""} <a href={mechanism.source} target="_blank" rel="noreferrer">Source ↗</a></p>
            </div>)}
          </div>
        </div>;
      })}
    </section>

    <section className="section" id="insurance">
      <div className="section-head"><h2>Pooled insurance and liability</h2><p>Nuclear liability and property risk are already mutualized across the U.S. fleet. New reactors join these pools; overrun insurance is the layer that does not exist yet.</p></div>
      <ul className="ledger wide">
        {liabilityPools.map((pool) => <li key={pool.name}>
          <span className="ledger-date">{pool.date ?? "Date not stated"}</span>
          <b>{pool.name} · {pool.capacity}</b>
          <span className="ledger-detail">{pool.structure}</span>
          <a href={pool.source} target="_blank" rel="noreferrer">Source ↗</a>
        </li>)}
      </ul>
    </section>

    <section className="section" id="underwriters">
      <div className="section-head"><h2>Who underwrites</h2><p>The institutions with money on or near the table, and the size of what each has committed or signaled.</p></div>
      <ul className="ledger wide">
        {underwriters.map((underwriter) => <li key={underwriter.name}>
          <span className="ledger-date">{underwriter.date ?? "Date not stated"}</span>
          <b>{underwriter.name} · {underwriter.role}</b>
          <span className="ledger-detail">{underwriter.commitment}{pageRef(underwriter.report)}</span>
          <a href={underwriter.source} target="_blank" rel="noreferrer">Source ↗</a>
        </li>)}
      </ul>
    </section>

    <section className="section" id="overruns">
      <div className="section-head"><h2>Cost overruns on the record</h2><p>The history a lender prices against. Each row states its own frame; the figures are not comparable to each other.</p></div>
      <ul className="ledger wide">
        {overrunRecords.map((record) => <li key={record.subject}>
          <span className="ledger-date">{record.subject}</span>
          <b>{record.figure}</b>
          <span className="ledger-detail">{record.note}{pageRef(record.report)}</span>
          <a href={record.source} target="_blank" rel="noreferrer">Source ↗</a>
        </li>)}
      </ul>
    </section>

    <section className="section" id="siting">
      <div className="section-head"><h2>Siting, by class</h2><p>Why the three classes make different deals: the ground they need and the rules that size it. A DOE authorization on a federal site is site-specific and does not transfer to a commercial sale, which still requires an NRC license; the race board's bands keep the two apart.</p></div>
      <ul className="ledger wide">
        {sitingFacts.map((fact) => <li key={fact.fact.slice(0, 40)}>
          <span className="ledger-date">{fact.lane}</span>
          <b>{fact.fact}</b>
          <a href={fact.source} target="_blank" rel="noreferrer">Source ↗</a>
        </li>)}
      </ul>
    </section>

    <section className="section limitations" id="captured-reports">
      <h2>Captured reports</h2>
      <p>Figures citing a &ldquo;captured copy&rdquo; are backed by report text archived in the repository on 2026-08-10, page-stamped so each quote is checkable against the page that carries it. The links below are the original documents.</p>
      <ul className="ledger">
        {capturedReports.map((report) => <li key={report.slug}>
          <b>{report.title}</b>
          <a href={report.url} target="_blank" rel="noreferrer">Original ↗</a>
        </li>)}
      </ul>
    </section>
  </main></PageShell>;
}

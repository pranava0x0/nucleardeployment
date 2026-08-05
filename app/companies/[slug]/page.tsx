import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../components/SiteHeader";
import { RaceBar } from "../../components/RaceBoard";
import { StageCore } from "../../components/StageCore";
import { capacityBands, companies, dataAsOf, dossierFor, gigawattMWe, projects, stageLabels } from "../../data";

export function generateStaticParams() { return companies.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: companies.find((company) => company.slug === slug)?.name ?? "Company" };
}

const mwe = (value: number) => value.toLocaleString("en-US");
const bandLabel = (band: string) => capacityBands.find((entry) => entry.band === band)?.label ?? band;
/** Undated is a fact about the sourcing, so it renders as one rather than as a blank. */
const when = (date: string | null) => date ?? "Date not stated";

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = companies.find((item) => item.slug === slug);
  if (!company) notFound();
  const companyProjects = projects.filter((project) => company.projectSlugs.includes(project.slug));
  // Roster entrants can have no tracked project record yet, so there may be no stage at all.
  const highestStage = companyProjects.length ? Math.max(...companyProjects.map((project) => project.stage)) : null;
  const reactorClasses = [...new Set(companyProjects.map((project) => `${project.generation} · ${project.scale}`))].join(" / ");
  const dossier = dossierFor(slug);

  return <PageShell><main id="main" className="inner-page company-page">
    <header className="project-hero grid-bg">
      <div>
        <Link className="back-link" href="/companies">← All companies</Link>
        <h1>{company.name}</h1>
        <p>{company.summary}</p>
        <p className="hero-meta">{company.role}</p>
      </div>
      {highestStage !== null && <StageCore stage={highestStage} label={stageLabels[highestStage - 1]} />}
    </header>

    {dossier?.row && <section className="section dossier-race">
      <div className="section-head">
        <h2>Race position</h2>
        <p>Megawatts at their strongest documented state, as of {dataAsOf}.</p>
      </div>
      <div className="identity-strip">
        <div><span>Design</span><b>{dossier.entrant.design}</b></div>
        <div><span>Per unit</span><b>{mwe(dossier.entrant.unitMWe)} MWe</b></div>
        <div><span>Lane</span><b>{dossier.entrant.lane}</b></div>
        <div><span>Listing</span><b>{dossier.entrant.ticker ?? "Private"}</b></div>
      </div>
      {dossier.entrant.unitMWeNote && <p className="strip-note">{dossier.entrant.unitMWeNote}</p>}
      <RaceBar row={dossier.row} compact />
      <p className="race-state">{dossier.row.strongestLine}</p>
      <p className="gw-math">
        One gigawatt is <b>{dossier.row.unitsToGigawatt} × {mwe(dossier.entrant.unitMWe)} MWe</b> units.
        {" "}{dossier.row.executedMWe > 0
          ? <>{mwe(dossier.row.executedMWe)} MWe rest on an executed action, {Math.round((dossier.row.executedMWe / gigawattMWe) * 100)}% of the way there.</>
          : <>No megawatts rest on an executed action yet.</>}
      </p>
      <p className="roster-basis"><b>Why this company is on the board:</b> {dossier.entrant.rosterBasis}{" "}
        <a href={dossier.entrant.rosterSource} target="_blank" rel="noreferrer">Source ↗</a></p>
    </section>}

    {dossier && <>
      <section className="section dossier-lane">
        <div className="section-head"><h2>Funding</h2><p>Three frames, never added together.</p></div>
        <div className="frame-grid">
          {dossier.funding.map((frame) => <article key={frame.frame}>
            <h3>{frame.frame}</h3>
            <p className="frame-note">{frame.note}</p>
            {frame.events.length ? <ul className="ledger">
              {frame.events.map((event) => <li key={`${event.date}-${event.amount}`}>
                <span className="ledger-date">{when(event.date)}</span>
                <b>{event.amount}</b>
                <span className="ledger-detail">{event.kind} · {event.counterparty}</span>
                <a href={event.source} target="_blank" rel="noreferrer">Source ↗</a>
              </li>)}
            </ul> : <p className="lane-empty">No {frame.frame.toLowerCase()} money on record.</p>}
          </article>)}
          <article>
            <h3>Cash on hand</h3>
            <p className="frame-note">A balance, not a raise. Reported by the company at a stated date.</p>
            {dossier.cash.length ? <ul className="ledger">
              {dossier.cash.map((position) => <li key={position.asOf}>
                <span className="ledger-date">{position.asOf}</span>
                <b>{position.amount}</b>
                <a href={position.source} target="_blank" rel="noreferrer">Source ↗</a>
              </li>)}
            </ul> : <p className="lane-empty">No reported cash position on record.</p>}
          </article>
        </div>
      </section>

      {dossier.proof.map((lane) => <section className="section dossier-lane" key={lane.lane}>
        <div className="section-head"><h2>{lane.lane}</h2><p>{lane.note}</p></div>
        {lane.events.length ? <ul className="ledger wide">
          {lane.events.map((event) => <li key={`${event.date}-${event.label}`}>
            <span className="ledger-date">{when(event.date)}</span>
            <b>{event.label}</b>
            <span className="ledger-detail">{event.kind} · {event.verification}{event.powerNote ? ` · ${event.powerNote}` : ""}</span>
            <a href={event.source} target="_blank" rel="noreferrer">Source ↗</a>
          </li>)}
        </ul> : <p className="lane-empty">Nothing on record in this lane as of {dataAsOf}.</p>}
      </section>)}

      <section className="section dossier-lane">
        <div className="section-head"><h2>Pipeline</h2><p>Executed first. Announcements are labeled as announcements and never added to them.</p></div>
        <h3 className="lane-sub">Backed by an executed action</h3>
        {dossier.pipeline.executed.length ? <ul className="ledger wide">
          {dossier.pipeline.executed.map((claim) => <li key={claim.label}>
            <span className="ledger-date">{when(claim.date)}</span>
            <b>{mwe(claim.mwe)} MWe · {bandLabel(claim.band)}</b>
            <span className="ledger-detail">{claim.label} · {claim.verification}</span>
            <a href={claim.source} target="_blank" rel="noreferrer">Source ↗</a>
          </li>)}
        </ul> : <p className="lane-empty">No executed megawatts on record as of {dataAsOf}.</p>}
        <h3 className="lane-sub">Announced, non-binding</h3>
        {dossier.pipeline.announced.length ? <ul className="ledger wide">
          {dossier.pipeline.announced.map((claim) => <li key={claim.label}>
            <span className="ledger-date">{when(claim.date)}</span>
            <b>{claim.mwe > 0 ? `${mwe(claim.mwe)} MWe` : "Capacity not disclosed"}</b>
            <span className="ledger-detail">{claim.label} · {claim.verification}</span>
            <a href={claim.source} target="_blank" rel="noreferrer">Source ↗</a>
          </li>)}
        </ul> : <p className="lane-empty">No announced pipeline on record as of {dataAsOf}.</p>}
      </section>

      <section className="section dossier-lane">
        <div className="section-head"><h2>Company-stated targets</h2><p>What the company says, printed beside what a regulator has documented. The site never averages a target into a prediction.</p></div>
        {dossier.targets.length ? <ul className="ledger wide targets">
          {dossier.targets.map((target) => <li key={target.target}>
            <span className="ledger-date">{target.statedDate ? `Stated ${target.statedDate}` : "Date not stated"}</span>
            <b>{target.target}</b>
            <span className="ledger-detail">Regulator-documented state today: {dossier.row?.strongestLine ?? "no capacity on record"}</span>
            {target.conflict && <span className="ledger-conflict">Conflicting account: {target.conflict}</span>}
            <a href={target.source} target="_blank" rel="noreferrer">Source ↗</a>
          </li>)}
        </ul> : <p className="lane-empty">No company-stated target on record as of {dataAsOf}.</p>}
      </section>
    </>}

    <section className="section">
      <div className="company-profile-block">
        <div className="company-summary">
          <div><span>Technology</span><b>{company.technology}</b></div>
          <div><span>Reactor classes</span><b>{reactorClasses || "No tracked project records"}</b></div>
          <div><span>Tracked projects</span><b>{companyProjects.length}</b></div>
          <div><span>Highest deployment stage</span><b>{highestStage !== null ? `${highestStage} · ${stageLabels[highestStage - 1]}` : "No tracked project records"}</b></div>
          <div><span>Primary source</span><a href={company.source} target="_blank" rel="noreferrer">{company.sourceLabel} ↗</a></div>
        </div>
        <div className="company-project-title"><h2>Projects and next steps</h2><span>{companyProjects.length} tracked</span></div>
        {companyProjects.length ? <div className="company-projects">
          {companyProjects.map((project) => <Link href={`/deployments/${project.slug}`} key={project.slug}>
            <span>{project.location}</span><h3>{project.name}</h3><p><b>Current</b>{project.latest}</p><small><b>Next step</b>{project.next}</small>
          </Link>)}
        </div> : <p className="lane-empty">No project record is tracked for this company yet. It appears on the race board through the roster rule rather than through a sited project.</p>}
      </div>
    </section>
  </main></PageShell>;
}

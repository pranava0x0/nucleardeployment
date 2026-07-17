import Link from "next/link";
import { PageShell } from "./components/SiteHeader";
import { StageCore } from "./components/StageCore";
import { capital, federalActions, projects, stageCounts } from "./data";

export default function Home() {
  const counts = stageCounts();
  const recent = [...projects].sort((a, b) => b.latestDate.localeCompare(a.latestDate)).slice(0, 3);
  return <PageShell>
    <main id="main">
      <section className="hero grid-bg">
        <div className="hero-copy">
          <p className="eyebrow"><span className="live-dot" /> U.S. deployment picture · Verified through July 2026</p>
          <h1>America is rebuilding the machinery to deploy nuclear energy.</h1>
          <p className="dek">A source-led view of which projects have moved from announcement to license, construction, criticality, and operation—and what must happen next.</p>
          <div className="hero-actions"><Link className="button primary" href="/deployments">Explore deployments</Link><Link className="button secondary" href="/map">View map</Link></div>
        </div>
        <div className="hero-core">
          <div className="orbit one" /><div className="orbit two" /><div className="orbit three" />
          <div className="core-readout"><span>NATIONAL STATUS</span><b>BUILD</b><small>Institutions → projects → repeat delivery</small></div>
        </div>
        <div className="metric-rail" aria-label="Tracked sample summary">
          <div><b>{projects.length}</b><span>sourced U.S. projects currently tracked</span></div>
          <div><b>{projects.filter((p) => p.stage >= 6).length}</b><span>at physical deployment or beyond</span></div>
          <div><b>{projects.filter((p) => p.status.includes("criticality")).length}</b><span>tracked critical experiments</span></div>
          <div><b>4</b><span>nuclear executive orders tracked</span></div>
        </div>
      </section>

      <section className="section pipeline-section">
        <div className="section-head"><div><p className="eyebrow">Deployment pipeline</p><h2>From interest to repeat deployment.</h2></div><p>Each stage marks stronger evidence. Counts cover the <b>{projects.length} sourced projects in this release</b>, not every announced U.S. reactor.</p></div>
        <div className="pipeline" aria-label="Eight deployment stages and tracked project counts">
          {counts.map((item) => <article className={`pipe-step ${item.count ? "has-data" : ""}`} key={item.stage}>
            <span className="pipe-number">STAGE {item.stage}</span>
            <span className="pipe-count">{item.count === 1 ? "1 project" : `${item.count} projects`}</span>
            <h3>{item.label}</h3>
            <p>{item.summary}</p>
            <div className="pipe-companies" aria-label={`Companies at stage ${item.stage}`}>
              {item.companies.length ? item.companies.map((company) => <Link href={`/companies/${company.slug}`} key={company.slug}>{company.name}</Link>) : <span>No tracked companies</span>}
            </div>
          </article>)}
        </div>
      </section>

      <section className="section recent-section">
        <div className="section-head"><div><p className="eyebrow">What changed</p><h2>Recent consequential evidence</h2></div><Link href="/deployments">All deployments →</Link></div>
        <div className="recent-grid">
          {recent.map((project, index) => <article className="milestone-card" key={project.slug}>
            <div className="card-index">0{index + 1}</div><StageCore stage={project.commitment} compact />
            <p className="eyebrow">{project.latestDate} · {project.verification}</p><h3>{project.name}</h3><p>{project.latest}</p>
            <div className="next-line"><span>NEXT GATE</span><b>{project.next}</b></div>
            <Link href={`/deployments/${project.slug}`}>Open project record →</Link>
          </article>)}
        </div>
      </section>

      <section className="section split-section">
        <div className="split-panel"><div className="section-head"><div><p className="eyebrow">Federal action</p><h2>Orders now need deliverables.</h2></div><Link href="/federal-action">Open tracker →</Link></div>
          {federalActions.slice(0, 3).map((action) => <a className="compact-row" href={action.source} key={action.eo}><span>{action.eo}</span><b>{action.title}</b><i>{action.status}</i></a>)}
        </div>
        <div className="split-panel dark-panel"><div className="section-head"><div><p className="eyebrow">Capital signal</p><h2>Terms matter more than totals.</h2></div><Link href="/capital">See capital stack →</Link></div>
          {capital.map((item) => <a className="capital-row" href={item.source} key={item.name}><b>{item.amount}</b><span>{item.name}<small>{item.status}</small></span></a>)}
        </div>
      </section>

      <section className="section next-section grid-bg">
        <p className="eyebrow">What happens next?</p><h2>Criticality proves a chain reaction.<br />Deployment still has gates.</h2>
        <div className="next-gates"><span>LOW-POWER TESTING</span><i /><span>POWER ASCENSION</span><i /><span>FIRST ELECTRICITY</span><i /><span>FULL POWER</span><i /><span>REPLICATION</span></div>
        <p>After initial criticality: verify physics and controls, clear regulatory hold points, raise power, connect the balance of plant, demonstrate reliability, then finance and contract repeat units.</p>
        <Link className="button primary" href="/methodology#stages">Read stage definitions</Link>
      </section>
    </main>
  </PageShell>;
}

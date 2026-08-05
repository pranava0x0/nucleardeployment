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
          <h1>America is rebuilding the machinery to deploy nuclear energy.</h1>
          <p className="dek">U.S. reactor projects from licensing and construction through criticality, operation, and repeat delivery.</p>
          <p className="hero-meta"><span className="live-dot" /> Updated through July 2026 · {projects.length} sourced projects</p>
          <div className="hero-actions"><Link className="button primary" href="/deployments">Explore deployments</Link><Link className="button secondary" href="/map">Browse locations</Link></div>
        </div>
        <div className="hero-core">
          <div className="orbit one" /><div className="orbit two" /><div className="orbit three" />
          <div className="core-readout" aria-label="National status: build projects toward repeat delivery"><b>BUILD</b><small>PROJECTS → REPEAT</small></div>
        </div>
      </section>

      <section className="section pipeline-section">
        <div className="section-head"><h2>Projects by stage</h2><p><b>{projects.length} sourced U.S. projects</b>, grouped by strongest documented milestone.</p></div>
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
        <div className="section-head"><h2>Recent project milestones</h2><Link href="/deployments">All deployments →</Link></div>
        <div className="recent-grid">
          {recent.map((project, index) => <article className="milestone-card" key={project.slug}>
            <div className="card-index">0{index + 1}</div><StageCore stage={project.stage} compact />
            <p className="card-meta">{project.latestDate} · {project.verification}</p><h3>{project.name}</h3><p>{project.latest}</p>
            <div className="next-line"><span>NEXT GATE</span><b>{project.next}</b></div>
            <Link href={`/deployments/${project.slug}`}>Open project record →</Link>
          </article>)}
        </div>
      </section>

      <section className="section split-section">
        <div className="split-panel"><div className="section-head"><h2>Federal orders and programs</h2><Link href="/federal-action">Open tracker →</Link></div>
          {federalActions.slice(0, 3).map((action) => <a className="compact-row" href={action.source} key={action.eo}><span>{action.eo}</span><b>{action.title}</b><i>{action.status}</i></a>)}
        </div>
        <div className="split-panel dark-panel"><div className="section-head"><h2>Loans and cost shares</h2><Link href="/capital">See capital stack →</Link></div>
          {capital.map((item) => <a className="capital-row" href={item.source} key={item.name}><b>{item.amount}</b><span>{item.name}<small>{item.status}</small></span></a>)}
        </div>
      </section>

      <section className="section next-section grid-bg">
        <h2>Milestones after criticality</h2>
        <div className="next-gates"><span>LOW-POWER TESTING</span><i /><span>POWER ASCENSION</span><i /><span>FIRST ELECTRICITY</span><i /><span>FULL POWER</span><i /><span>REPLICATION</span></div>
        <p>After initial criticality: verify physics and controls, clear regulatory hold points, raise power, connect the balance of plant, demonstrate reliability, then finance and contract repeat units.</p>
        <Link className="button primary" href="/methodology#stages">Read stage definitions</Link>
      </section>
    </main>
  </PageShell>;
}

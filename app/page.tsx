import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "./components/SiteHeader";
import { RaceBoard } from "./components/RaceBoard";
import { JsonLd } from "./components/JsonLd";
import { capital, dataAsOf, federalActions, headlineTotals, projects, raceEntrants, stageCounts, timeline } from "./data";
import { absoluteFileUrl, absoluteUrl, authorUrl, canonicalUrl, repoUrl, sitePath } from "./site";

export const metadata: Metadata = {
  description:
    "Which U.S. nuclear companies have generated a megawatt, which are building, and which have only announced. Every figure links to the document behind it.",
  alternates: {
    canonical: canonicalUrl("/"),
    types: { "application/rss+xml": sitePath("/feed.xml") },
  },
};

const mwe = (value: number) => value.toLocaleString("en-US");

export default function Home() {
  const counts = stageCounts();
  const totals = headlineTotals();
  const latest = timeline().filter((entry) => entry.date).slice(0, 3);
  const gates = [...projects]
    .filter((project) => project.stage < 7)
    .sort((a, b) => b.stage - a.stage || b.latestDate.localeCompare(a.latestDate))
    .slice(0, 4);
  const vogtle = projects.find((project) => project.slug === "vogtle-3-4");

  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Deployment Core",
        url: absoluteUrl("/"),
        description: "A public evidence layer for U.S. nuclear deployment.",
      },
      {
        "@type": "Dataset",
        name: "Deployment Core: U.S. nuclear deployment evidence",
        description:
          "Sourced records of U.S. new-design reactor companies and projects: capacity by evidence band, licensing, physical progress, funding, and federal actions. A tracked sample, not a census.",
        url: absoluteUrl("/"),
        dateModified: dataAsOf,
        isAccessibleForFree: true,
        creator: { "@type": "Person", name: "Pranava Raparla", url: authorUrl },
        distribution: [
          { "@type": "DataDownload", encodingFormat: "text/plain", contentUrl: absoluteFileUrl("/llms.txt") },
          { "@type": "DataDownload", encodingFormat: "application/rss+xml", contentUrl: absoluteFileUrl("/feed.xml") },
        ],
      },
    ],
  };

  return <PageShell>
    <JsonLd data={structured} />
    <main id="main">
      <section className="masthead grid-bg">
        <h1>{raceEntrants.length} companies are racing to put a gigawatt of new nuclear on the American grid.</h1>
        <p className="dek">None of them has generated a commercial megawatt yet. This is where each one stands, measured in evidence rather than announcements.</p>
        <p className="hero-meta"><span className="live-dot" /> Data as of {dataAsOf} · {raceEntrants.length} race entrants · {projects.length} sourced projects</p>
      </section>

      <section className="stat-strip" aria-label="Headline megawatt totals">
        <p className="strip-zero"><b>{mwe(totals.operationalMWe)} MWe operational across all {raceEntrants.length} entrants.</b> Each figure below is a separate frame. They are never added together.</p>
        <div className="strip-tiles">
          <div><b>{mwe(totals.operationalMWe)}</b><span>MWe operational</span><small>Grid-connected commercial power</small></div>
          <div><b>{mwe(totals.buildingMWe)}</b><span>MWe being built</span><small>NRC-permitted or DOE-authorized, work documented</small></div>
          <div><b>{mwe(totals.executedMWe)}</b><span>MWe on executed actions</span><small>Everything documented, applications included</small></div>
          <div><b>{mwe(totals.announcedMWe)}</b><span>MWe announced, non-binding</span><small>MOU, LOI, or target. No binding documents</small></div>
        </div>
      </section>

      <RaceBoard />

      <section className="section scale-note">
        <p className="masthead-context">
          For scale: the most recent new American nuclear capacity was {vogtle?.capacity} at Vogtle Units 3 and 4, the
          first two U.S. AP1000 units, finished in {vogtle?.latestDate}. Every company on the board is trying to do it
          smaller and faster. <a href={vogtle?.source} target="_blank" rel="noreferrer">{vogtle?.sourceLabel} ↗</a>
        </p>
      </section>

      <section className="section updates-strip">
        <div className="section-head"><h2>Latest developments</h2><Link href="/updates">All updates →</Link></div>
        <ol className="update-list">
          {latest.map((entry) => <li key={`${entry.source}-${entry.date}`}>
            <span className="update-date">{entry.date}</span>
            <div className="update-body">
              <b><Link href={`/companies/${entry.companySlug}`}>{entry.company}</Link> · {entry.kind}</b>
              <p>{entry.label}{entry.detail ? ` · ${entry.detail}` : ""}</p>
              <a href={entry.source} target="_blank" rel="noreferrer">{entry.verification} source ↗</a>
            </div>
          </li>)}
        </ol>
      </section>

      <section className="section gates-section">
        <div className="section-head"><h2>Next gates</h2><Link href="/updates#gates">Every project&rsquo;s next gate →</Link></div>
        <ol className="gate-list">
          {gates.map((project) => <li key={project.slug}>
            <Link href={`/deployments/${project.slug}`}><b>{project.name}</b><small>Stage {project.stage} · {project.stageLabel}</small></Link>
            <p>{project.next}</p>
            <span className="gate-owner">Owner · {project.nextOwner}</span>
          </li>)}
        </ol>
      </section>

      <details className="section acc pipeline-section" id="pipeline">
        <summary>
          <h2>Projects by stage</h2>
          <span className="acc-note"><b>{projects.length} sourced U.S. projects</b>, grouped by strongest documented milestone</span>
          <span className="acc-marker" aria-hidden="true">+</span>
        </summary>
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
      </details>

      <section className="split-section">
        <details className="split-panel acc">
          <summary>
            <h2>Federal orders and programs</h2>
            <span className="acc-note">{federalActions.length} executive orders tracked</span>
            <span className="acc-marker" aria-hidden="true">+</span>
          </summary>
          {federalActions.slice(0, 3).map((action) => <a className="compact-row" href={action.source} key={action.eo}><span>{action.eo}</span><b>{action.title}</b><i>{action.status}</i></a>)}
          <Link className="acc-open-link" href="/federal-action">Open the federal tracker →</Link>
        </details>
        <details className="split-panel dark-panel acc">
          <summary>
            <h2>Loans and cost shares</h2>
            <span className="acc-note">{capital.length} instruments, never summed</span>
            <span className="acc-marker" aria-hidden="true">+</span>
          </summary>
          {capital.map((item) => <a className="capital-row" href={item.source} key={item.name}><b>{item.amount}</b><span>{item.name}<small>{item.status}</small></span></a>)}
          <Link className="acc-open-link" href="/capital">See the capital stack →</Link>
        </details>
      </section>

      <section className="section next-section grid-bg">
        <h2>Milestones after criticality</h2>
        <div className="next-gates"><span>LOW-POWER TESTING</span><i /><span>POWER ASCENSION</span><i /><span>FIRST ELECTRICITY</span><i /><span>FULL POWER</span><i /><span>REPLICATION</span></div>
        <p>After initial criticality: verify physics and controls, clear regulatory hold points, raise power, connect the balance of plant, demonstrate reliability, then finance and contract repeat units.</p>
        <Link className="button primary" href="/methodology#stages">Read stage definitions</Link>
      </section>

      <section className="section cta-band" aria-label="Follow this tracker">
        <div>
          <h2>Follow the evidence</h2>
          <p>New documents land on the updates page first. Corrections with a source are welcome.</p>
        </div>
        <div className="cta-links">
          <a className="button primary" href={sitePath("/feed.xml")}>Subscribe by RSS</a>
          <Link className="button secondary" href="/updates">Browse updates</Link>
          <a className="button secondary" href={`${repoUrl}/issues`} target="_blank" rel="noreferrer">Report a correction</a>
          <a className="button secondary" href={sitePath("/llms.txt")}>llms.txt for agents</a>
        </div>
      </section>
    </main>
  </PageShell>;
}

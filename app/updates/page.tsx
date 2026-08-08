import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../components/SiteHeader";
import { JsonLd } from "../components/JsonLd";
import { projects, stageLabels, timeline } from "../data";
import { absoluteUrl, canonicalUrl, repoUrl, sitePath } from "../site";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "Every dated evidence event on record for U.S. new-design nuclear, newest first: criticalities, construction starts, permits, raises, awards, and loans, each with its source and reporting tier.",
  alternates: {
    canonical: canonicalUrl("/updates"),
    types: { "application/rss+xml": sitePath("/feed.xml") },
  },
};

export default function UpdatesPage() {
  const entries = timeline();
  const dated = entries.filter((entry) => entry.date);
  const undated = entries.filter((entry) => !entry.date);
  // `dated` is already newest-first, so the month list arrives in order.
  const months = [...new Set(dated.map((entry) => (entry.date as string).slice(0, 7)))];
  const gates = [...projects].sort((a, b) => b.stage - a.stage || b.latestDate.localeCompare(a.latestDate));

  const structured = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Deployment Core", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Updates", item: absoluteUrl("/updates") },
    ],
  };

  return <PageShell>
    <JsonLd data={structured} />
    <main id="main" className="inner-page updates-page">
      <header className="page-lead grid-bg">
        <h1>Updates</h1>
        <p>Every dated evidence event on record, newest first. Proof events and capital events stay in separate lanes, and each entry links the document behind it.</p>
      </header>

      <section className="section" id="ledger">
        <div className="section-head">
          <h2>Evidence ledger</h2>
          <p>{dated.length} dated events. A capacity claim is a state, not an event; the race board carries those.</p>
        </div>
        {months.map((month) => <section className="ledger-month" key={month}>
          <h3>{month}</h3>
          <ol className="update-list">
            {dated.filter((entry) => (entry.date as string).slice(0, 7) === month).map((entry) => <li key={`${entry.source}-${entry.date}-${entry.label.slice(0, 24)}`}>
              <span className="update-date">{entry.date}</span>
              <div className="update-body">
                <b><Link href={`/companies/${entry.companySlug}`}>{entry.company}</Link> · {entry.kind}</b>
                <p>{entry.label}{entry.detail ? ` · ${entry.detail}` : ""}</p>
                <a href={entry.source} target="_blank" rel="noreferrer">{entry.verification} source ↗</a>
              </div>
            </li>)}
          </ol>
        </section>)}
        {undated.length > 0 && <section className="ledger-month" key="undated">
          <h3>No date on record</h3>
          <p className="ledger-note">The source behind each of these states no date. A date is never guessed here.</p>
          <ol className="update-list">
            {undated.map((entry) => <li key={`${entry.source}-${entry.label.slice(0, 24)}`}>
              <span className="update-date">Undated</span>
              <div className="update-body">
                <b><Link href={`/companies/${entry.companySlug}`}>{entry.company}</Link> · {entry.kind}</b>
                <p>{entry.label}{entry.detail ? ` · ${entry.detail}` : ""}</p>
                <a href={entry.source} target="_blank" rel="noreferrer">{entry.verification} source ↗</a>
              </div>
            </li>)}
          </ol>
        </section>}
      </section>

      <section className="section" id="gates">
        <div className="section-head">
          <h2>Every project&rsquo;s next gate</h2>
          <p>All {projects.length} tracked projects, closest to operation first, each with its next required milestone and the entity that owns it.</p>
        </div>
        <ol className="gate-list full">
          {gates.map((project) => <li key={project.slug}>
            <Link href={`/deployments/${project.slug}`}><b>{project.name}</b><small>Stage {project.stage} · {stageLabels[project.stage - 1]}</small></Link>
            <p>{project.next}</p>
            <span className="gate-owner">Owner · {project.nextOwner}</span>
          </li>)}
        </ol>
      </section>

      <section className="section cta-band" aria-label="Follow this tracker">
        <div>
          <h2>Follow the evidence</h2>
          <p>The feed carries the ledger above. Corrections with a source are welcome.</p>
        </div>
        <div className="cta-links">
          <a className="button primary" href={sitePath("/feed.xml")}>Subscribe by RSS</a>
          <a className="button secondary" href={`${repoUrl}/issues`} target="_blank" rel="noreferrer">Report a correction</a>
          <Link className="button secondary" href="/methodology">Read the methodology</Link>
        </div>
      </section>
    </main>
  </PageShell>;
}

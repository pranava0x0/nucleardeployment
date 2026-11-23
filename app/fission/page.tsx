import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../components/SiteHeader";
import { fissionCrosswalk, fissionFamilies, fissionReviewedAt, fissionSources, fleetMilestones, fleetObservation, fleetYears, nationalBaseline } from "../fission-data";
import { canonicalUrl } from "../site";

export const metadata: Metadata = {
  title: "Fission types and fleet statistics",
  description: "U.S. nuclear fleet observations, international fission reactor families, research configurations, and dated primary-source milestones.",
  alternates: { canonical: canonicalUrl("/fission") },
};

const number = (value: number, digits = 0) => value.toLocaleString("en-US", { maximumFractionDigits: digits });
const fleetMeasures = [
  { metric: "operable_reactor_units", label: "Operable units", digits: 0, suffix: "" },
  { metric: "operable_net_summer_capacity", label: "Net summer MWe", digits: 0, suffix: "" },
  { metric: "nuclear_net_generation", label: "Net generation, TWh", digits: 3, suffix: "" },
  { metric: "nuclear_generation_share", label: "U.S. electricity share", digits: 1, suffix: "%" },
  { metric: "nuclear_capacity_factor", label: "Published capacity factor", digits: 1, suffix: "%" },
];
const sourceName = (url: string) => fissionSources.find((source) => source.url === url)?.title ?? "Primary source";
function SourceLinks({ urls }: { urls: string[] }) {
  return <p className="family-sources">{[...new Set(urls)].map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer">{sourceName(url)}{urls.length > 1 ? ` · ${index + 1}` : ""} ↗</a>)}</p>;
}

export default function FissionPage() {
  return <PageShell><main id="main" className="inner-page fission-page">
    <header className="page-lead grid-bg"><h1>Fission types and fleet statistics</h1><p>U.S. commercial fleet observations, worldwide reactor families, and research configurations. Reviewed {fissionReviewedAt}.</p></header>
    <nav className="page-subnav" aria-label="Fission coverage sections"><a href="#fleet">U.S. fleet</a><a href="#families">Reactor families</a><a href="#research">Research and other roles</a><Link href="/methodology#audit">Claim audit</Link></nav>

    <section className="section" id="fleet">
      <div className="section-head"><h2>Five years of the U.S. fleet</h2><p>EIA Monthly Energy Review · October 2026 publication · observations through 2025</p></div>
      <div className="table-scroll fleet-desktop"><table className="fleet-table"><caption>Year-end reactor counts and capacity; full-year generation and electricity share.</caption><thead><tr><th scope="col">Year</th>{fleetMeasures.map((measure) => <th scope="col" key={measure.metric}>{measure.label}</th>)}</tr></thead><tbody>
        {fleetYears.map((year) => <tr key={year}><th scope="row">{year}</th>{fleetMeasures.map((measure) => <td key={measure.metric}>{number(fleetObservation(measure.metric, year).value, measure.digits)}{measure.suffix}</td>)}</tr>)}
      </tbody></table></div>
      <ol className="fleet-mobile" aria-label="Annual U.S. nuclear fleet observations">{[...fleetYears].reverse().map((year) => <li key={year}><h3>{year}</h3><dl>{fleetMeasures.map((measure) => <div key={measure.metric}><dt>{measure.label}</dt><dd>{number(fleetObservation(measure.metric, year).value, measure.digits)}{measure.suffix}</dd></div>)}</dl></li>)}</ol>
      <p className="data-note">Reactor counts and capacity are measured at year-end. Generation and share cover a calendar year. Capacity factor is EIA&rsquo;s published series with its own time-adjusted denominator; it is not recalculated from year-end capacity.</p>
      <p className="data-note">&ldquo;Operable&rdquo; describes licensing status and can include prolonged outages. EIA&rsquo;s separate March 2026 inventory reports 94 operating commercial reactors at 54 plants, including out-of-service reporting. That inventory and its 98,441 MW capacity use a different frame from this table&rsquo;s licensed-unit capacity. Neither count proves a restart is generating.</p>
      <SourceLinks urls={[nationalBaseline.generation.source_url, "https://www.eia.gov/energyexplained/nuclear/us-nuclear-industry.php"]} />
      <div className="coverage-timeline"><h3>Recent commercial-reactor milestones</h3><ul className="coverage-events">{fleetMilestones.map((event) => <li key={event.id}><b>{event.date} · {event.geography}</b><p>{event.achievement}</p><p className="frame-note">{event.remaining_gate}</p><a href={event.source_url} target="_blank" rel="noreferrer">Government source ↗</a></li>)}</ul></div>
    </section>

    <section className="section" id="families"><div className="section-head"><h2>Reactor families</h2><p>Cooling, moderation, neutron spectrum, and fuel form define the family. Size and application are separate axes.</p></div>
      <p className="data-note">International operating classifications below use IAEA&rsquo;s December 2024 snapshot, published in 2025. Dated milestones span 2021–2026. Family coverage is not a census of every vendor or prototype; U.S. deployment megawatts stay in the <Link href="/#race">selected-company board</Link>.</p>
      <nav className="family-index" aria-label="Reactor family index">{fissionFamilies.map((family) => <a href={`#family-${family.id}`} key={family.id} title={family.name}>{family.id === "heat-pipe" ? "Heat-pipe" : family.id.toUpperCase()}</a>)}</nav>
      <div className="family-directory">{fissionFamilies.map((family) => <details open className="family-entry" id={`family-${family.id}`} key={family.id}>
        <summary><h3>{family.name}</h3><span>{family.status}</span></summary>
        <div className="family-body"><p>{family.definition}</p><dl className="family-axes"><div><dt>Coolant</dt><dd>{family.axes.coolant}</dd></div><div><dt>Moderator</dt><dd>{family.axes.moderator}</dd></div><div><dt>Spectrum</dt><dd>{family.axes.spectrum}</dd></div><div><dt>Fuel</dt><dd>{family.axes.fuel_form}</dd></div></dl><p>{family.us_position}</p>
          {family.examples.map((event) => <article className="family-event" key={`${event.name}-${event.date}`}><b>{event.date ?? "Undated overview"} · {event.country} · {event.name}</b><p>{event.achievement}</p><p className="frame-note">{event.remaining_gate}</p><a href={event.source_url} target="_blank" rel="noreferrer">Milestone source ↗</a></article>)}
          {!family.examples.length && <p className="frame-note">The reviewed sources do not document a recent deployment milestone.</p>}
          {family.gaps.length > 0 && <p className="frame-note">Coverage limits: {family.gaps.join(" ")}</p>}<SourceLinks urls={family.source_urls} />
        </div></details>)}</div>
      <h3 className="coverage-subhead">Historical hybrid classifications</h3><div className="coverage-grid">{fissionCrosswalk.historical_labels.map((row) => <article key={row.id}><h4>{row.name}</h4><p>{row.definition}</p><p className="frame-note">{row.status}</p><SourceLinks urls={row.source_urls} /></article>)}</div>
    </section>

    <section className="section" id="research"><div className="section-head"><h2>Research configurations and other roles</h2><p>Research reactors, critical assemblies, and propulsion systems contribute different evidence from commercial electrical generation.</p></div>
      <div className="coverage-grid">{fissionCrosswalk.research_configurations.map((row) => <article key={row.id}><h3>{row.name}</h3><p>{row.definition}</p><p className="frame-note">{row.status}</p><SourceLinks urls={row.source_urls} /></article>)}</div>
      <h3 className="coverage-subhead">Labels that cross reactor families</h3><div className="coverage-grid">{fissionCrosswalk.cross_cutting_axes.map((row) => <article key={row.id}><h4>{row.name}</h4><p>{row.definition}</p><p className="frame-note">{row.status}</p><SourceLinks urls={row.source_urls} /></article>)}</div>
      <p className="data-note">These references define research-reactor types. Their historical facility counts are not current statistics. Naval fleet counts, classified designs, every historical prototype, and fusion are outside this inventory.</p>
    </section>
  </main></PageShell>;
}

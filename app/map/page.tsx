import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../components/SiteHeader";
import { projects } from "../data";

export const metadata: Metadata = { title: "Map" };

export default function MapPage() {
  return <PageShell><main id="main" className="inner-page"><header className="page-lead grid-bg"><p className="eyebrow">Geographic view · Tracked set</p><h1>Where evidence becomes physical.</h1><p>Locations show the current sourced project set. Co-located records are offset for legibility.</p></header>
    <section className="section map-layout"><div className="map-panel"><div className="map-toolbar"><span><i className="map-dot physical" /> Physical / operational</span><span><i className="map-dot development" /> Development</span></div><div className="us-map" aria-label="Schematic map of tracked U.S. projects">{projects.map((project, index) => <Link className={`map-marker stage-${project.stage}`} href={`/deployments/${project.slug}`} style={{ left: `${project.x + (index === 4 ? 3 : 0)}%`, top: `${project.y + (index === 4 ? 3 : 0)}%` }} key={project.slug}><span>{project.stage}</span><b>{project.name}</b></Link>)}</div><p className="map-note">Schematic placement—not a navigational map. Stage number follows the eight-level commitment ladder.</p></div>
      <div className="map-list"><p className="eyebrow">Synchronized list</p>{projects.map((project) => <Link href={`/deployments/${project.slug}`} key={project.slug}><span>0{project.stage}</span><div><b>{project.name}</b><small>{project.location} · {project.status}</small></div></Link>)}</div>
    </section>
    <section className="section global-context"><p className="eyebrow">Global context · Next data expansion</p><h2>U.S. progress needs a comparable world frame.</h2><div className="context-grid"><div><b>BUILD</b><span>Reactors under construction by country, technology origin, and first-power date</span></div><div><b>PROVE</b><span>Advanced demonstrations that reached criticality, first electricity, or full power</span></div><div><b>EXPORT</b><span>U.S. technology agreements tied to a site, license, finance, or signed order</span></div></div><p>Global counts stay unpublished until country-level primary sources support a comparable dataset.</p></section>
  </main></PageShell>;
}

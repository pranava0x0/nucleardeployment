import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../components/SiteHeader";
import { projects } from "../data";

export const metadata: Metadata = { title: "Locations" };

export default function MapPage() {
  const regions = ["West", "Midwest", "South", "Northeast", "Undisclosed"];
  return <PageShell><main id="main" className="inner-page"><header className="page-lead grid-bg"><h1>Project locations</h1><p>Named U.S. reactor sites organized by region, developer, and deployment stage.</p></header>
    <section className="section location-index" aria-label="Tracked projects by U.S. region">
      {regions.map((region, regionIndex) => {
        const regionProjects = projects.filter((project) => project.region === region);
        if (!regionProjects.length) return null;
        return <section className="region-group" key={region}>
          <header><span>0{regionIndex + 1}</span><h2>{region}</h2><b>{regionProjects.length} {regionProjects.length === 1 ? "project" : "projects"}</b></header>
          <div>{regionProjects.map((project) => <Link href={`/deployments/${project.slug}`} key={project.slug}>
            <span className="location-stage">Stage {project.stage}</span>
            <div><h3>{project.name}</h3><p>{project.developer}</p></div>
            <div><b>{project.location}</b><p>{project.status}</p></div>
            <small><b>Next step</b>{project.next.split(".")[0]}</small>
          </Link>)}</div>
        </section>;
      })}
    </section>
    <section className="section global-context"><h2>Global comparison planned</h2><div className="context-grid"><div><b>Build</b><span>Reactors under construction by country, technology origin, and first-power date</span></div><div><b>Prove</b><span>Advanced demonstrations that reached criticality, first electricity, or full power</span></div><div><b>Export</b><span>U.S. technology agreements tied to a site, license, finance, or signed order</span></div></div><p>Publication requires comparable country-level primary sources.</p></section>
  </main></PageShell>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../components/SiteHeader";
import { companies, projects, stageLabels } from "../data";

export const metadata: Metadata = { title: "Companies" };

export default function CompaniesPage() {
  return <PageShell><main id="main" className="inner-page">
    <header className="page-lead grid-bg"><h1>Companies</h1><p>Reactor developers, site sponsors, operators, and delivery partners linked to tracked U.S. projects.</p></header>
    <section className="section">
      <div className="company-grid">
        {companies.map((company) => {
          const companyProjects = projects.filter((project) => company.projectSlugs.includes(project.slug));
          const highestStage = Math.max(...companyProjects.map((project) => project.stage));
          return <Link className="company-card" href={`/companies/${company.slug}`} key={company.slug}>
            <div><span>{company.role}</span><b>{stageLabels[highestStage - 1]}</b></div>
            <h2>{company.name}</h2>
            <p>{company.summary}</p>
            <small>{companyProjects.length} tracked {companyProjects.length === 1 ? "project" : "projects"} · {company.technology}</small>
          </Link>;
        })}
      </div>
    </section>
  </main></PageShell>;
}

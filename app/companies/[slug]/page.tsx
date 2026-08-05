import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../components/SiteHeader";
import { StageCore } from "../../components/StageCore";
import { companies, projects, stageLabels } from "../../data";

export function generateStaticParams() { return companies.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: companies.find((company) => company.slug === slug)?.name ?? "Company" };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = companies.find((item) => item.slug === slug);
  if (!company) notFound();
  const companyProjects = projects.filter((project) => company.projectSlugs.includes(project.slug));
  const highestStage = Math.max(...companyProjects.map((project) => project.stage));
  const reactorClasses = [...new Set(companyProjects.map((project) => `${project.generation} · ${project.scale}`))].join(" / ");

  return <PageShell><main id="main" className="inner-page company-page">
    <header className="project-hero grid-bg"><div><Link className="back-link" href="/companies">← All companies</Link><h1>{company.name}</h1><p>{company.summary}</p><p className="hero-meta">{company.role}</p></div><StageCore stage={highestStage} label={stageLabels[highestStage - 1]} /></header>
    <section className="section">
      <div className="company-profile-block">
        <div className="company-summary"><div><span>Technology</span><b>{company.technology}</b></div><div><span>Reactor classes</span><b>{reactorClasses}</b></div><div><span>Tracked projects</span><b>{companyProjects.length}</b></div><div><span>Highest deployment stage</span><b>{highestStage} · {stageLabels[highestStage - 1]}</b></div><div><span>Primary source</span><a href={company.source} target="_blank" rel="noreferrer">{company.sourceLabel} ↗</a></div></div>
        <div className="company-project-title"><h2>Projects and next steps</h2><span>{companyProjects.length} tracked</span></div>
        <div className="company-projects">
          {companyProjects.map((project) => <Link href={`/deployments/${project.slug}`} key={project.slug}>
            <span>{project.location}</span><h3>{project.name}</h3><p><b>Current</b>{project.latest}</p><small><b>Next step</b>{project.next}</small>
          </Link>)}
        </div>
      </div>
    </section>
  </main></PageShell>;
}

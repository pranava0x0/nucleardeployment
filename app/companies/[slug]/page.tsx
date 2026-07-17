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
  const highestCommitment = Math.max(...companyProjects.map((project) => project.commitment));
  const highestStage = Math.max(...companyProjects.map((project) => project.stage));

  return <PageShell><main id="main" className="inner-page company-page">
    <header className="project-hero grid-bg"><div><Link className="back-link" href="/companies">← All companies</Link><p className="eyebrow">{company.role}</p><h1>{company.name}</h1><p>{company.summary}</p><div className="status-line"><span>{stageLabels[highestStage - 1]}</span><span className="confidence high">Evidence-linked profile</span></div></div><StageCore stage={highestCommitment} /></header>
    <section className="section">
      <div className="company-summary"><div><span>Technology</span><b>{company.technology}</b></div><div><span>Tracked projects</span><b>{companyProjects.length}</b></div><div><span>Highest deployment stage</span><b>{highestStage} · {stageLabels[highestStage - 1]}</b></div><div><span>Evidence</span><a href={company.source} target="_blank" rel="noreferrer">{company.sourceLabel} ↗</a></div></div>
      <div className="section-head company-project-head"><div><p className="eyebrow">Active projects</p><h2>Evidence and next gates</h2></div></div>
      <div className="company-projects">
        {companyProjects.map((project) => <Link href={`/deployments/${project.slug}`} key={project.slug}>
          <span>{project.location}</span><h3>{project.name}</h3><p>{project.latest}</p><small>NEXT · {project.next}</small>
        </Link>)}
      </div>
    </section>
  </main></PageShell>;
}

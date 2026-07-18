import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../components/SiteHeader";
import { StageCore } from "../../components/StageCore";
import { companies, projects, stageLabels } from "../../data";

export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return { title: project?.name ?? "Project" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const company = companies.find((item) => item.slug === project.companySlug);
  return <PageShell><main id="main" className="inner-page project-page">
    <header className="project-hero grid-bg"><div><Link className="back-link" href="/deployments">← All deployments</Link><p className="eyebrow">{project.location} · {project.verification}</p><h1>{project.name}</h1><p>{project.summary}</p>{company && <p className="company-line">Lead company · <Link href={`/companies/${company.slug}`}>{company.name} →</Link></p>}<p className="program-line">Program · {project.programs.join(" · ")}</p><div className="status-line"><span>{project.status}</span><span className={`confidence ${project.confidence.toLowerCase()}`}>{project.confidence} confidence</span></div></div><StageCore stage={project.commitment} /></header>
    <section className="section project-summary">
      <div className="stage-gate"><p className="eyebrow">Deployment trajectory</p><div className="gate-track">{stageLabels.map((label, index) => <div className={index + 1 < project.commitment ? "done" : index + 1 === project.commitment ? "current" : ""} key={label}><i /><span>{index + 1}</span><small>{label}</small></div>)}</div></div>
      <div className="project-grid">
        <article className="evidence-card latest"><p className="eyebrow">Latest verified milestone</p><h2>{project.latest}</h2><p>{project.latestDate} · {project.sourceLabel}</p><a href={project.source} target="_blank" rel="noreferrer">Open primary source ↗</a></article>
        <article className="evidence-card next"><p className="eyebrow">Next required milestone</p><h2>{project.next}</h2><dl><dt>Responsible</dt><dd>{project.nextOwner}</dd><dt>Key blocker</dt><dd>{project.blocker}</dd></dl></article>
      </div>
      <div className="fact-grid"><div><span>Generation</span><b>{project.generation}</b></div><div><span>Scale</span><b>{project.scale}</b></div><div><span>Reactor family</span><b>{project.family}</b></div><div><span>Role</span><b>{project.reactorRole}</b></div><div><span>Capacity</span><b>{project.capacity}</b></div><div><span>Evidence</span><b>{project.verification}</b></div></div>
    </section>
  </main></PageShell>;
}

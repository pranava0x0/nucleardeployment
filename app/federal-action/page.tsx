import type { Metadata } from "next";
import { PageShell } from "../components/SiteHeader";
import { federalActions, programs } from "../data";

export const metadata: Metadata = { title: "Federal Action" };

export default function FederalActionPage() {
  return <PageShell><main id="main" className="inner-page"><header className="page-lead grid-bg"><p className="eyebrow">Directive → program → measurable result</p><h1>Federal action</h1><p>Orders and programs are tracked by deliverable, owner, deadline, evidence, and next action—not announcement volume.</p></header>
    <section className="section"><div className="section-head"><div><p className="eyebrow">Executive-order crosswalk</p><h2>Four orders. Distinct implementation tests.</h2></div></div><div className="action-grid">{federalActions.map((action) => <article key={action.eo}><div className="action-top"><b>{action.eo}</b><span>{action.status}</span></div><h3>{action.title}</h3><p>{action.directive}</p><dl><dt>Owner</dt><dd>{action.owner}</dd><dt>Next evidence</dt><dd>{action.next}</dd></dl><a href={action.source} target="_blank" rel="noreferrer">Read executive order ↗</a></article>)}</div></section>
    <section className="section program-section"><div className="section-head"><div><p className="eyebrow">DOE program inventory</p><h2>Programs should unlock a deployment stage.</h2></div></div>{programs.map((program, index) => <article className="program-row" key={program.name}><span>0{index + 1}</span><div><h3>{program.name}</h3><p>{program.purpose}</p></div><div><small>MEASURE</small><b>{program.measure}</b></div><div><small>STATUS</small><b>{program.status}</b></div><a href={program.source} target="_blank" rel="noreferrer">SOURCE ↗</a></article>)}</section>
  </main></PageShell>;
}

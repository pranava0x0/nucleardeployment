import type { Metadata } from "next";
import { PageShell } from "../components/SiteHeader";
import { federalActions, programs } from "../data";

export const metadata: Metadata = { title: "Federal Action" };

export default function FederalActionPage() {
  return <PageShell><main id="main" className="inner-page"><header className="page-lead grid-bg"><h1>Federal action</h1><p>Four executive orders and DOE programs, with owners, deadlines, current status, and next actions.</p></header>
    <section className="section"><div className="section-head"><h2>Executive orders</h2></div><div className="action-grid">{federalActions.map((action) => <article key={action.eo}><div className="action-top"><b>{action.eo}</b><span>{action.status}</span></div><h3>{action.title}</h3><p>{action.directive}</p><dl><dt>Owner</dt><dd>{action.owner}</dd><dt>Next step</dt><dd>{action.next}</dd></dl><a href={action.source} target="_blank" rel="noreferrer">Read executive order ↗</a></article>)}</div></section>
    <section className="section program-section"><div className="section-head"><h2>DOE deployment programs</h2></div>{programs.map((program, index) => <article className="program-row" key={program.name}><span>0{index + 1}</span><div><h3>{program.name}</h3><p>{program.purpose}</p></div><div><small>MEASURE</small><b>{program.measure}</b></div><div><small>STATUS</small><b>{program.status}</b></div><a href={program.source} target="_blank" rel="noreferrer">SOURCE ↗</a></article>)}</section>
  </main></PageShell>;
}

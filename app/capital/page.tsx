import type { Metadata } from "next";
import { PageShell } from "../components/SiteHeader";
import { capital, projects } from "../data";

export const metadata: Metadata = { title: "Capital + Supply Chain" };

export default function CapitalPage() {
  const dependencies = [
    ["HALEU fuel", projects.filter((p) => p.technology.includes("Sodium")).length, "Enrichment → deconversion → fuel fabrication"],
    ["TRISO fuel", projects.filter((p) => p.technology.includes("gas") || p.technology.includes("Fluoride")).length, "Qualification → licensed fabrication → delivery"],
    ["Licensing capacity", projects.filter((p) => p.nextOwner.includes("NRC")).length, "Application quality → review → permit / license"],
  ];
  return <PageShell><main id="main" className="inner-page"><header className="page-lead grid-bg"><h1>Capital + supply chain</h1><p>Federal loans, cost shares, financing status, and fuel and licensing dependencies for tracked U.S. projects.</p></header>
    <section className="section"><div className="capital-ledger"><div className="ledger-head"><span>Amount</span><span>Transaction</span><span>Status</span><span>Purpose</span></div>{capital.map((item) => <a href={item.source} target="_blank" rel="noreferrer" key={item.name}><b>{item.amount}</b><span><strong>{item.name}</strong><small>{item.type} · {item.date}</small></span><i>{item.status}</i><p>{item.purpose}</p></a>)}</div><p className="data-note">Amounts are displayed individually and are not summed because they represent different instruments, dates, and conditions.</p></section>
    <section className="section supply-section"><div className="section-head"><h2>Fuel and licensing dependencies</h2></div><div className="dependency-grid">{dependencies.map(([name, count, chain]) => <article key={String(name)}><div className="dependency-core"><b>{count}</b><span>tracked projects</span></div><h3>{name}</h3><p>{chain}</p></article>)}</div><p className="data-note">Counts cover the current {projects.length}-project set.</p></section>
  </main></PageShell>;
}

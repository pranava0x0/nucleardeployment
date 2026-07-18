import type { Metadata } from "next";
import { PageShell } from "../components/SiteHeader";
import { stages, technologies } from "../data";

export const metadata: Metadata = { title: "Methodology" };

const definitions = [
  ["Announced", "A public statement. No site, binding contract, license, or finance implied."],
  ["Contracted", "A signed binding agreement, with conditions and expiration disclosed when known."],
  ["Licensed", "The specified regulator issued the named approval. A design approval is not a site operating license."],
  ["Under construction", "Physical work on the nuclear project is underway; enabling or non-nuclear work is labeled separately."],
  ["Critical", "A sustained nuclear chain reaction occurred. This does not mean electricity generation or commercial operation."],
  ["Operating", "The unit is authorized and performing its intended operation. Commercial status is separately identified."],
];

export default function MethodologyPage() {
  return <PageShell><main id="main" className="inner-page methodology-page"><header className="page-lead grid-bg"><h1>Methodology</h1><p>Version 0.2 definitions, inclusion rules, source hierarchy, deployment stages, and technology taxonomy.</p></header>
    <section className="section method-grid"><article><h2>Inclusion rule</h2><p>A project needs a named developer, identifiable site or program, current milestone, next gate, and direct source. Early projects may enter with government or company reporting, but the label must say so.</p></article><article><h2>Source hierarchy</h2><ol><li>Regulator decisions and dockets</li><li>Statutes, executive orders, agency awards</li><li>Executed company or utility disclosures</li><li>High-quality third-party reporting</li></ol></article><article><h2>Schedule confidence</h2><p>High means completed evidence or a regulator-controlled step. Medium means an announced target with active work. Low means dependencies, finance, licensing, or site remain unresolved.</p></article></section>
    <section className="section" id="stages"><div className="section-head"><h2>Eight deployment stages</h2></div><div className="method-stages">{stages.map((stage, index) => <div key={stage.label}><span>0{index + 1}</span><b>{stage.label}</b><p>{stage.definition}</p></div>)}</div></section>
    <section className="section"><div className="section-head"><h2>Definitions</h2></div><div className="definition-grid">{definitions.map(([term, definition]) => <div key={term}><b>{term}</b><p>{definition}</p></div>)}</div></section>
    <section className="section"><div className="section-head"><h2>Reactor taxonomy</h2><p>Each project carries generation, scale, reactor family, and operating role. “SMR” describes scale; “PWR” and “BWR” describe light-water families.</p></div><div className="tech-table">{technologies.map((tech) => <div key={tech.name}><b>{tech.name}</b><span>{tech.size}</span><span>{tech.fuel}</span><p>{tech.proof}</p></div>)}</div></section>
    <section className="section limitations"><h2>Current limits</h2><p>This release tracks a larger sourced sample, not a comprehensive census. The full NRC pre-application roster, global projects, complete financing histories, supply-chain facilities, and historical stage changes remain incomplete. No headline count is a national total unless it explicitly says so.</p></section>
  </main></PageShell>;
}

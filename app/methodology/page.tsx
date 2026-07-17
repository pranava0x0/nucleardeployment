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
  return <PageShell><main id="main" className="inner-page methodology-page"><header className="page-lead grid-bg"><p className="eyebrow">Method · Version 0.1 · 2026-07-17</p><h1>Evidence before labels.</h1><p>Every record separates what happened, who reported it, which stage it applies to, and what evidence would move the project forward.</p></header>
    <section className="section method-grid"><article><p className="eyebrow">Inclusion rule</p><h2>What enters the tracker</h2><p>A project needs a named developer, identifiable site or program, current milestone, next gate, and direct source. Early projects may enter with government or company reporting, but the label must say so.</p></article><article><p className="eyebrow">Source order</p><h2>What counts as evidence</h2><ol><li>Regulator decisions and dockets</li><li>Statutes, executive orders, agency awards</li><li>Executed company or utility disclosures</li><li>High-quality third-party reporting</li></ol></article><article><p className="eyebrow">Schedule confidence</p><h2>How uncertainty shows</h2><p>High means completed evidence or a regulator-controlled step. Medium means an announced target with active work. Low means dependencies, finance, licensing, or site remain unresolved.</p></article></section>
    <section className="section" id="stages"><div className="section-head"><div><p className="eyebrow">Commitment classification</p><h2>Eight levels from interest to scale</h2></div></div><div className="method-stages">{stages.map((stage, index) => <div key={stage.label}><span>0{index + 1}</span><b>{stage.label}</b><p>{stage.definition}</p></div>)}</div></section>
    <section className="section"><div className="section-head"><div><p className="eyebrow">Key definitions</p><h2>Words that cannot blur together</h2></div></div><div className="definition-grid">{definitions.map(([term, definition]) => <div key={term}><b>{term}</b><p>{definition}</p></div>)}</div></section>
    <section className="section"><div className="section-head"><div><p className="eyebrow">Technology taxonomy · Current set</p><h2>Proof points differ by reactor class.</h2></div></div><div className="tech-table">{technologies.map((tech) => <div key={tech.name}><b>{tech.name}</b><span>{tech.size}</span><span>{tech.fuel}</span><p>{tech.proof}</p></div>)}</div></section>
    <section className="section limitations"><h2>Current limits</h2><p>This first release is a deliberately small evidence sample, not a comprehensive census. Global projects, full company financing histories, all 11 pilot projects, licensing dockets, and supply-chain facilities require a structured source-by-source expansion. No headline count should be used as a national total unless it explicitly says so.</p></section>
  </main></PageShell>;
}

import type { Metadata } from "next";
import { PageShell } from "../components/SiteHeader";
import { capacityBands, capacityClaims, dataAsOf, raceEntrants, raceTotals, stages, technologies } from "../data";

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
  const totals = raceTotals();
  const executedTotal = totals.filter((entry) => entry.band !== "framework").reduce((sum, entry) => sum + entry.mwe, 0);
  const frameworkTotal = totals.find((entry) => entry.band === "framework")?.mwe ?? 0;
  const announcedRatio = Math.round(frameworkTotal / executedTotal);
  // Two honest denominators. Everything filed, versus only what is being built.
  const buildingTotal = totals.filter((entry) => entry.band === "construction" || entry.band === "doe-authorized").reduce((sum, entry) => sum + entry.mwe, 0);
  const buildingRatio = Math.round(frameworkTotal / buildingTotal);
  // Derived, so the sentence cannot drift from the dataset it describes.
  const biggestFramework = [...capacityClaims].filter((claim) => claim.band === "framework").sort((a, b) => b.mwe - a.mwe)[0];
  return <PageShell><main id="main" className="inner-page methodology-page"><header className="page-lead grid-bg"><h1>Methodology</h1><p>Version 0.2 definitions, inclusion rules, source hierarchy, deployment stages, and technology taxonomy.</p></header>
    <section className="section method-grid"><article><h2>Inclusion rule</h2><p>A project needs a named developer, identifiable site or program, current milestone, next gate, and direct source. Early projects may enter with government or company reporting, but the label must say so.</p></article><article><h2>Source hierarchy</h2><ol><li>Regulator decisions and dockets</li><li>Statutes, executive orders, agency awards</li><li>Executed company or utility disclosures</li><li>High-quality third-party reporting</li></ol></article><article><h2>Schedule confidence</h2><p>High means completed evidence or a regulator-controlled step. Medium means an announced target with active work. Low means dependencies, finance, licensing, or site remain unresolved.</p></article></section>
    <section className="section race-method" id="race">
      <div className="section-head"><h2>The race to a gigawatt</h2><p>How the board decides who is ahead, and what each bar is allowed to claim.</p></div>

      <article className="method-note">
        <h3>Who is on the board</h3>
        <p>An entrant is a company with a named new-design commercial power reactor of roughly 350 MWe or less per unit, and documented U.S. regulatory or physical progress toward deploying it: an NRC docket, an NRC-approved design, a DOE authorization, a sited project, or a binding U.S. customer. {raceEntrants.length} companies qualify as of {dataAsOf}. This is a tracked sample, not a census of everyone building a reactor.</p>
        <p>Each entrant page states one specific qualifying fact and cites the single source that establishes it. Where a company has more than one claim to a place on the board, the others appear in its ledgers with their own sources rather than being bundled into the roster basis.</p>
        <p>Companies that only run test reactors or make fuel appear as context on entrant pages, not as entrants. Large AP1000-class reactors stay in the stage pipeline as tracked context; they are not racing to a first gigawatt.</p>

      </article>

      <article className="method-note">
        <h3>What counts as a megawatt</h3>
        <p>Only U.S. megawatts. A U.S. vendor building the same design abroad, at Darlington in Ontario or Doicești in Romania, has that progress shown on its page as design proof contributing zero megawatts to the U.S. race, because the site&rsquo;s claim is about U.S. deployment.</p>
        <p>Test reactors and critical experiments contribute zero megawatts to every band. A criticality proves the physics works. It is not electricity, and it is not a license to sell any. All four reactors that reached criticality before the July 4, 2026 federal goal were zero-power units, and all four contribute zero megawatts here.</p>
        <p>A company-stated target never moves a megawatt between bands. Only a documented action does. Targets are printed beside the regulator-documented state so a claim never floats free, and where a target conflicts with another account, both are shown.</p>
      </article>

      <article className="method-note">
        <h3>The six bands</h3>
        <p>Each megawatt sits in exactly one band, the strongest state its evidence supports, so the bands never double-count. Bands are never added across frames, and announced megawatts never affect the ranking.</p>
        <div className="band-table">
          {capacityBands.map((band) => {
            const total = totals.find((entry) => entry.band === band.band);
            return <div key={band.band}>
              <span className={`legend-swatch band-${band.band}`} aria-hidden="true" />
              <b>{band.label}</b>
              <span className="band-total">{(total?.mwe ?? 0).toLocaleString("en-US")} MWe</span>
              <p>{band.rule} Granting authority: {band.authority}.</p>
            </div>;
          })}
        </div>
      </article>

      <article className="method-note">
        <h3>A DOE authorization is not an NRC license</h3>
        <p>These are two different pathways and the board keeps them apart. The NRC licenses commercial power reactors; a construction permit authorizes building one, and a separate operating license is still required before it may run. DOE authorizes reactors on its own sites under its own safety process, which is how the pilot-program reactors were built and started so quickly.</p>
        <p>A reactor being built under a DOE authorization is real physical progress, so it gets its own band rather than being folded into either NRC-permitted construction or a paper application. Oklo&rsquo;s Aurora at Idaho National Laboratory is the case that forces the distinction: ground was broken in September 2025 under the DOE pathway while its NRC combined license is still under review. Ranking it beside an NRC-permitted build would overstate it; calling it an application would ignore a reactor being built.</p>
      </article>

      <article className="method-note">
        <h3>Binding and non-binding never merge</h3>
        <p>A memorandum of understanding, a letter of intent, a master agreement, and a press-released target are announcements. They are recorded, dated, sourced, and kept on their own track, and the words &ldquo;announced, non-binding&rdquo; travel with the figure everywhere it appears.</p>
        <p>This is the largest single fact on the board, and it is worth stating in both frames because they answer different questions. Against every megawatt resting on an executed action of any kind, including applications merely filed, announced capacity runs about {announcedRatio} to one. Against the megawatts actually being built today, it runs about {buildingRatio} to one.</p>
        <p>The largest single announcement on record, {biggestFramework.label.split(" · ")[0]} at {biggestFramework.mwe.toLocaleString("en-US")} MWe, is on its own roughly {Math.round(biggestFramework.mwe / buildingTotal)} times all the new-design capacity under construction in the United States. That is why the two are never summed into one number.</p>
      </article>
    </section>

    <section className="section" id="stages"><div className="section-head"><h2>Eight deployment stages</h2></div><div className="method-stages">{stages.map((stage, index) => <div key={stage.label}><span>0{index + 1}</span><b>{stage.label}</b><p>{stage.definition}</p></div>)}</div></section>
    <section className="section"><div className="section-head"><h2>Definitions</h2></div><div className="definition-grid">{definitions.map(([term, definition]) => <div key={term}><b>{term}</b><p>{definition}</p></div>)}</div></section>
    <section className="section"><div className="section-head"><h2>Reactor taxonomy</h2><p>Each project carries generation, scale, reactor family, and operating role. “SMR” describes scale; “PWR” and “BWR” describe light-water families.</p></div><div className="tech-table">{technologies.map((tech) => <div key={tech.name}><b>{tech.name}</b><span>{tech.size}</span><span>{tech.fuel}</span><p>{tech.proof}</p></div>)}</div></section>
    <section className="section limitations"><h2>Current limits</h2><p>This release tracks a larger sourced sample, not a complete census. The full NRC pre-application roster, global projects, complete financing histories, supply-chain facilities, and historical stage changes remain incomplete. No headline count is a national total unless it explicitly says so.</p></section>
  </main></PageShell>;
}

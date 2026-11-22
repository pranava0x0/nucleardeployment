import type { SourceLink } from "./data";

/**
 * The financing layer: what new nuclear costs, who pays for it, and what each
 * tracked company still needs before a government or commercial contract can
 * close. Facts, estimates, and judgments stay in separate labeled lanes; every
 * record carries the source that supports exactly its visible claim.
 *
 * Report-backed records cite a captured copy in `data/sources/reports/` by
 * slug and PDF page, and may carry a short verbatim `quote`; a test recomputes
 * every quote against the captured page so an edit here fails loudly there.
 * Research basis: docs/research/financing-landscape.md (2026-08-10).
 */

export type FinanceLane = "Microreactor" | "Grid-scale SMR" | "Large LWR" | "Cross-class";

/**
 * The financing layer's own freshness stamp: the date its records last
 * materially changed. Deliberately separate from data.ts's dataAsOf, which the
 * suite derives from the newest race record; this layer was assembled and
 * verified later, and its page and sitemap entry carry this date instead.
 */
export const financingAsOf = "2026-11-22";

/** One claim, one source that supports exactly that claim. */
export type SourcedLine = {
  additionalSources?: SourceLink[];
  text: string;
  source: string;
};

/** A captured report in data/sources/reports/<slug>.txt, cited by PDF page. */
export type ReportRef = {
  reportSlug: string;
  /** PDF page of the captured copy, matching its `--- PAGE N ---` markers. */
  page: number;
  /** Short verbatim span from that page; tested against the captured text. */
  quote?: string;
};

/** An estimate or actual, labeled with who published it and in what frame. */
export type CostBenchmark = {
  additionalSources?: SourceLink[];
  lane: FinanceLane;
  series: "Modeled" | "FOAK" | "Early units" | "NOAK" | "Actual" | "Contract value" | "Company target";
  figure: string;
  scope: string;
  basis: string;
  date: string | null;
  source: string;
  report?: ReportRef;
};

/** What a given number of units buys, per the sourced learning literature. */
export type LearningRung = {
  units: string;
  effect: string;
  basis: string;
  source: string;
  report?: ReportRef;
};

export type CompanyFinance = {
  additionalSources?: SourceLink[];
  companySlug: string;
  /** How the company gets paid: what it sells and who carries the plant. */
  model: string;
  modelSource: string;
  /** Government vehicles, one sourced line per claim. */
  government: SourcedLine[];
  /** Commercial positions, one sourced line per deal. */
  commercial: SourcedLine[];
  /** A stated price or cost, never derived. Null means none found. */
  costClaim: string | null;
  costClaimSource: string | null;
  /** Site judgment: the next event that would change this company's row. */
  nextGate: string;
};

export type FinancingMechanism = {
  /** "Pending" covers signed or stated intent with no executed contract. */
  status: "In use" | "Pending" | "Proposed";
  mechanism: string;
  how: string;
  example: string;
  date: string | null;
  source: string;
};

export type LiabilityPool = {
  name: string;
  structure: string;
  capacity: string;
  date: string | null;
  source: string;
};

export type Underwriter = {
  name: string;
  role: string;
  commitment: string;
  date: string | null;
  source: string;
  report?: ReportRef;
};

export type OverrunRecord = {
  subject: string;
  figure: string;
  note: string;
  date: string | null;
  source: string;
  report?: ReportRef;
};

export type SitingFact = {
  lane: FinanceLane;
  fact: string;
  source: string;
};

export const costBenchmarks: CostBenchmark[] = [
  // Large LWR: the only class with completed U.S. actuals.
  {
    lane: "Large LWR",
    series: "Modeled",
    figure: "$169/MWh",
    scope: "Vogtle 3&4 as built: ~2.2 GW, ~$32.3B total capital cost, ~97% capacity factor, 70-year life, with ~30% cost learning between unit 3 and unit 4.",
    basis: "Lazard model using completed Vogtle project capital-cost inputs; not a measured electricity tariff",
    date: "2025-06",
    source: "https://www.lazard.com/media/eijnqja3/lazards-lcoeplus-june-2025.pdf",
    report: { reportSlug: "lazard-lcoe-june-2025", page: 8 },
  },
  {
    lane: "Large LWR",
    series: "Modeled",
    figure: "$175–255/MWh",
    scope: "Unsubsidized U.S. nuclear LCOE modeled from publicly available Vogtle 3&4 capital costs, including 0–30% learning between units, in Lazard's July 2026 analysis. An estimate, not an observed electricity tariff.",
    basis: "Lazard LCOE+ version 19.0 estimate",
    date: "2026-07",
    source: "https://www.lazard.com/media/kcfconhf/lazards-lcoeplus_vf.pdf",
    report: { reportSlug: "lazard-lcoe-july-2026", page: 7 },
  },
  {
    lane: "Cross-class",
    series: "Early units",
    figure: "$61–122/MWh",
    scope: "New nuclear with the 30% 48E investment tax credit, on overnight capital of $7,000–20,000/kW and six-year construction. DOE labels the range early-of-a-kind, between FOAK and NOAK.",
    basis: "DOE Pathways to Commercial Liftoff: Advanced Nuclear",
    date: "2024-09",
    source: "https://gain.inl.gov/content/uploads/4/2024/11/DOE-Advanced-Nuclear-Liftoff-Report.pdf",
    report: { reportSlug: "doe-liftoff-advanced-nuclear-2024", page: 14 },
  },
  // Grid-scale SMR: approved budgets and target prices, no completed unit yet.
  {
    lane: "Grid-scale SMR",
    series: "FOAK",
    figure: "C$7.7B first unit",
    scope: "Historical May 2025 budget: C$6.1B for Unit 1 plus C$1.6B in shared systems; C$20.9B for four units, including interest, cost escalation, and contingency. OPG’s November 2026 update says Unit 1 will not meet the prior budget or October 2030 target; reassessment is expected substantially complete by mid 2027.",
    basis: "OPG May 2025 release-quality project budget; includes financing, escalation and contingency",
    date: "2025-05",
    source: "https://www.opg.com/news-resources/newsroom/release/opg-reports-2025-first-quarter-financial-results/",

    additionalSources: [{"url":"https://www.opg.com/projects-services/projects/nuclear/smr/darlington-smr/","label":"OPG November 2026 budget and schedule reassessment"}],
  },

  {
    lane: "Grid-scale SMR",
    series: "Company target",
    figure: "~$4B all-in",
    scope: "Historical company estimate reported for the 2021 site announcement, retrospectively covered in 2026. A projected all-in cost, not a completed cost or a newly reaffirmed 2026 budget.",
    basis: "Company statement, reported by POWER",
    date: "2021-11",
    source: "https://www.powermag.com/terrapowers-kemmerer-1-enters-construction-timeline-of-the-natrium-projects-road-to-first-power/",
  },
  {
    lane: "Grid-scale SMR",
    series: "Company target",
    figure: "$89/MWh",
    scope: "The CFPP's updated target power price, January 2023, with Inflation Reduction Act support; the project terminated later that year.",
    basis: "NuScale 8-K",
    date: "2023-01",
    source: "https://www.sec.gov/Archives/edgar/data/1822966/000182296623000008/pressreleasenuscalereach.htm",
  },
  // Microreactor: study economics plus the first company price targets.
  {
    lane: "Microreactor",
    series: "FOAK",
    figure: "$325/MWh",
    scope: "INL bottom-up estimate for a first-of-a-kind 20 MWt heat-pipe microreactor: ~$14,500/kWe overnight excluding fuel, ~$19,800/kWe with fuel, over $22,000/kWe total capital with interest.",
    basis: "INL/RPT-24-80433",
    date: "2024",
    source: "https://gain.inl.gov/content/uploads/4/2025/03/2024-Document-INL-RPT-24-80433.pdf",
    report: { reportSlug: "inl-microreactor-bottom-up-2024", page: 61, quote: "approximately $14,500 per kilowatt electrical (kWe)" },
  },
  {
    lane: "Microreactor",
    series: "NOAK",
    figure: "~$120/MWh",
    scope: "The same INL model at factory production: ~$6,000/kWe overnight.",
    basis: "INL/RPT-24-80433",
    date: "2024",
    source: "https://gain.inl.gov/content/uploads/4/2025/03/2024-Document-INL-RPT-24-80433.pdf",
    report: { reportSlug: "inl-microreactor-bottom-up-2024", page: 5, quote: "an NOAK microreactor could reach overnight costs of around ~$6,000/kWe" },
  },
  {
    lane: "Microreactor",
    series: "FOAK",
    figure: "$0.14–0.41/kWh",
    scope: "Historical NEI estimate for first microreactor electricity generation, attributed by INL; a model range for remote-market comparison, not an observed tariff.",
    basis: "NEI estimate, reported by Idaho National Laboratory",
    date: null,
    source: "https://inl.gov/trending-topics/microreactors/",
  },
  {
    lane: "Microreactor",
    series: "Contract value",
    figure: "up to $300M",
    scope: "The Project Pele prototype award: an option-dependent DOD cost-type contract under a 1–5 MWe programme target. A contract ceiling, not an outturn cost.",
    basis: "DOD Strategic Capabilities Office award, reported by POWER",
    date: "2022-06",
    source: "https://www.powermag.com/dod-picks-bwxt-to-manufacture-project-pele-prototype-nuclear-microreactor/",
  },
  {
    lane: "Microreactor",
    series: "Company target",
    figure: "$40–90/MWh",
    scope: "Oklo's expected levelized cost range for its plants, per its shareholder presentation.",
    basis: "Company presentation, reported by Utility Dive",
    date: "2024-08",
    source: "https://www.utilitydive.com/news/oklo-advanced-nuclear-microreactor-project-pipeline-nrc/724343/",
  },
  {
    lane: "Microreactor",
    series: "Company target",
    figure: "5–7¢/kWh",
    scope: "Deep Fission and Endeavour's target for the 2 GW data-center framework.",
    basis: "Partnership announcement, reported by World Nuclear News",
    date: "2025-01",
    source: "https://www.world-nuclear-news.org/articles/deep-fission-and-endeavour-announce-strategic-partnership",
  },
];

export const learningRungs: LearningRung[] = [
  {
    units: "Unit 1 → 3",
    effect: "Most learning lands early: DOE cites estimated capital-cost reductions of ~45–60% between the first and third plant of a reactor concept.",
    basis: "DOE Liftoff, p. 35",
    source: "https://gain.inl.gov/content/uploads/4/2024/11/DOE-Advanced-Nuclear-Liftoff-Report.pdf",
    report: { reportSlug: "doe-liftoff-advanced-nuclear-2024", page: 35, quote: "between the first and third plant deployed of a given reactor concept" },
  },
  {
    units: "Unit 3 → 4",
    effect: "Vogtle's two units showed ~30% cost learning from unit 3 to unit 4, the only U.S. actual on record.",
    basis: "Lazard LCOE+, p. 8",
    source: "https://www.lazard.com/media/eijnqja3/lazards-lcoeplus-june-2025.pdf",
    report: { reportSlug: "lazard-lcoe-june-2025", page: 8 },
  },
  {
    units: "5–10 committed units",
    effect: "DOE's threshold for liftoff in SMRs and large reactors: a committed orderbook of 5–10 deployments of one design is the first essential step.",
    basis: "DOE Liftoff, p. 6",
    source: "https://gain.inl.gov/content/uploads/4/2024/11/DOE-Advanced-Nuclear-Liftoff-Report.pdf",
    report: { reportSlug: "doe-liftoff-advanced-nuclear-2024", page: 6, quote: "orderbook of 5–10 deployments of at least one reactor design" },
  },
  {
    units: "10+ units, one consortium",
    effect: "A consortium committing to 10+ units can cut ~15% from the first unit and absorb early overruns across the book.",
    basis: "DOE Liftoff, p. 37",
    source: "https://gain.inl.gov/content/uploads/4/2024/11/DOE-Advanced-Nuclear-Liftoff-Report.pdf",
    report: { reportSlug: "doe-liftoff-advanced-nuclear-2024", page: 37, quote: "even helping to negate the effect of cost overruns from the first few plants" },
  },
  {
    units: "~30–50 units",
    effect: "Microreactors need a far deeper orderbook, roughly 30–50 reactors, before factory production pencils.",
    basis: "DOE Liftoff, p. 31",
    source: "https://gain.inl.gov/content/uploads/4/2024/11/DOE-Advanced-Nuclear-Liftoff-Report.pdf",
    report: { reportSlug: "doe-liftoff-advanced-nuclear-2024", page: 31, quote: "orderbook of ~30-50 reactors" },
  },
  {
    units: "Unit 1 → n, U.S. history",
    effect: "The caution: across the U.S. fleet, nth-of-a-kind plants have been more, not less expensive than first-of-a-kind. Learning is a design goal, not a law.",
    basis: "Eash-Gates et al., Joule (2020), p. 1",
    source: "https://dspace.mit.edu/bitstream/handle/1721.1/133049/Jacopo's%20and%20Jessika's%20paper%20on%20nuclear%20cost%20Sep%202020.pdf",
    report: { reportSlug: "eash-gates-2020-joule", page: 1, quote: "nth-of-a-kind plants have been more, not less expensive than" },
  },
];

export const overrunRecords: OverrunRecord[] = [
  {
    subject: "U.S. plants begun after 1970",
    figure: "241% average overnight-cost overrun",
    note: "Soft factors external to the reactor hardware contributed over half the 1976–1987 cost rise.",
    date: "2020-11",
    source: "https://dspace.mit.edu/bitstream/handle/1721.1/133049/Jacopo's%20and%20Jessika's%20paper%20on%20nuclear%20cost%20Sep%202020.pdf",
    report: { reportSlug: "eash-gates-2020-joule", page: 1, quote: "cost overrun of 241%" },
  },
  {
    subject: "Vogtle 3&4, mid-build",
    figure: "$14B initial estimate → $25B by 2020",
    note: "Nearly double the initial estimate with construction still underway, at $11,000/kW.",
    date: "2020-11",
    source: "https://dspace.mit.edu/bitstream/handle/1721.1/133049/Jacopo's%20and%20Jessika's%20paper%20on%20nuclear%20cost%20Sep%202020.pdf",
    report: { reportSlug: "eash-gates-2020-joule", page: 1, quote: "almost twice as high as the initial estimate of $14B" },
  },
  {
    subject: "Vogtle 3&4, as built",
    figure: "~$32.3B total capital",
    note: "Lazard's assumption for the completed 2.2 GW, the basis of its $169/MWh actual.",
    date: "2025-06",
    source: "https://www.lazard.com/media/eijnqja3/lazards-lcoeplus-june-2025.pdf",
    report: { reportSlug: "lazard-lcoe-june-2025", page: 8 },
  },
  {
    subject: "The 48E buffer",
    figure: "ITC pays 30-50% of capital regardless of budget",
    note: "DOE's framing: because the investment tax credit applies to capital cost whatever the final bill, it functions as overrun insurance for the equity behind a project.",
    date: "2024-09",
    source: "https://gain.inl.gov/content/uploads/4/2024/11/DOE-Advanced-Nuclear-Liftoff-Report.pdf",
    report: { reportSlug: "doe-liftoff-advanced-nuclear-2024", page: 35, quote: "the ITC applies 30-50% to capital cost regardless of initial budget" },
  },
  {
    subject: "V.C. Summer 2&3",
    figure: "$9B sunk, abandoned",
    note: "The other post-1990 U.S. large-reactor start, cancelled in 2017 before completion.",
    date: "2020-11",
    source: "https://dspace.mit.edu/bitstream/handle/1721.1/133049/Jacopo's%20and%20Jessika's%20paper%20on%20nuclear%20cost%20Sep%202020.pdf",
    report: { reportSlug: "eash-gates-2020-joule", page: 1, quote: "sunk costs of $9B" },
  },
  {
    subject: "CFPP (NuScale/UAMPS)",
    figure: "Target price $55 → $89/MWh before construction",
    note: "A 75% construction-cost estimate jump ($5.3B → $9.3B) drove the price up 53% while the project was still on paper; subscription fell short and the project terminated November 2023. Escalation starts before concrete.",
    date: "2023-12",
    source: "https://www.cooperative.com/programs-services/bts/documents/advisories/advisory-nuscale-and-uamps-end-smr-project-cfpp-dec-2023.pdf",
  },
  {
    subject: "Class-size asymmetry",
    figure: "50% overrun: $4B SMR → $6B; $10B large reactor → $15B",
    note: "DOE's argument for smaller units: the same relative overrun caps a smaller absolute loss, leaving capital to apply the learning on the next unit.",
    date: "2024-09",
    source: "https://gain.inl.gov/content/uploads/4/2024/11/DOE-Advanced-Nuclear-Liftoff-Report.pdf",
    report: { reportSlug: "doe-liftoff-advanced-nuclear-2024", page: 30, quote: "with a 50% cost overrun would result in completed FOAK cost of $6B" },
  },
];

/**
 * Per-company financing dossiers. Model, government, and commercial columns
 * are sourced facts; `nextGate` is the site's judgment of the next event that
 * would move the row, rendered under that label. Order matches the race
 * roster's lanes: microreactors first, then grid-scale.
 */
export const companyFinance: CompanyFinance[] = [
  {
    companySlug: "radiant-industries",
    model: "Factory product company: initial commercial reactors are planned for assembly in El Segundo and delivery from 2028; the Oak Ridge campus provides fueling and high-volume manufacturing.",
    modelSource: "https://radiantnuclear.com/news/radiant-expands-manufacturing",
    government: [
      {"text": "Up to $750M binding Janus agreement for 15 Kaleidos units; a milestone contract ceiling, not equity or cash received.", "source": "https://www.radiantnuclear.com/news/radiant-wins-750m-janus-army-contract"},
      { text: "In August 2025, Radiant announced an ANPI agreement with the Defense Innovation Unit and Department of the Air Force to deliver a mass-manufactured microreactor to a U.S. military base.", source: "https://www.ans.org/news/2025-08-14/article-7277/radiant-signs-contract-on-microreactors-for-the-military/" },
      { text: "Army selected Radiant for Fort Benning under Janus; its separate Air Force and Navy selections are also now named.", source: "https://radiantnuclear.com/news/radiant-expands-manufacturing" },
    ],
    commercial: [
      { text: "Equinix signed a preorder with deposits for 20 Kaleidos units in August 2025, the first commercial microreactor preorder on record.", source: "https://www.accessnewswire.com/newsroom/en/clean-technology/radiant-announces-equinix-preorder-and-deposits-for-20-kaleidos-microreactors-1061067" },
    ],
    costClaim: null,
    costClaimSource: null,
    nextGate: "Kaleidos criticality at the DOME test bed, then first factory deliveries against the ANPI deadline and the Equinix book.",
  },
  {
    companySlug: "westinghouse",
    model: "Established vendor whose October 2025 U.S. government partnership, an ~$80B deployment frame, gives the government a claim on 20% of cash distributions above a $17.5B return threshold.",
    modelSource: "https://natlawreview.com/article/us-government-announces-historic-80-billion-nuclear-partnership-westinghouse",
    government: [
      {"text": "Army selected Westinghouse Government Services for Janus at Fort Drum; selection does not establish reactor operation.", "source": "https://www.army.mil/article/294891/army_reaches_agreement_with_private_industry_for_nuclear_micro_reactors"},
      { text: "DOE selected eVinci for the first fueled microreactor experiments at the DOME test bed, with about $5M of support.", source: "https://www.energy.gov/ne/articles/energy-department-announces-first-microreactor-experiments-dome-test-bed" },
      { text: "The $17.5B conditional supply-chain commitment is scoped to AP1000 long-lead items, not to eVinci or AP300.", source: "https://info.westinghousenuclear.com/news/westinghouse-announces-department-of-energy-partnership-to-jumpstart-large-scale-nuclear-supply-chain" },
    ],
    commercial: [
      { text: "The Saskatchewan Research Council is the first commercial eVinci customer, planning a pilot by 2029.", source: "https://www.powermag.com/westinghouse-secures-first-customer-for-evinci-nuclear-microreactor/" },
    ],
    costClaim: null,
    costClaimSource: null,
    nextGate: "A named U.S. customer for eVinci or AP300; the DOME test feeding an NRC licensing case.",
  },
  {
    companySlug: "bwxt",
    model: "Government prime and manufacturer: cost-type defense contracts like the roughly $300M Project Pele prototype.",
    modelSource: "https://www.powermag.com/dod-picks-bwxt-to-manufacture-project-pele-prototype-nuclear-microreactor/",
    government: [
      {"text": "Army selected BWXT for the Janus project at Fort Campbell; site authorization and milestone delivery remain.", "source": "https://www.army.mil/article/294891/army_reaches_agreement_with_private_industry_for_nuclear_micro_reactors"},
      { text: "BWXT received the Project Pele prototype manufacturing and delivery contract, with an option-dependent ceiling up to $300M.", source: "https://www.powermag.com/dod-picks-bwxt-to-manufacture-project-pele-prototype-nuclear-microreactor/" },
    ],
    commercial: [
      { text: "Tata Chemicals letter of intent to explore up to eight BANR units at a Green River, Wyoming soda-ash site, early-2030s target, commercial terms still to be established.", source: "https://www.tatachemicals.com/upload/content_pdf/BWXT-Tata-LOI-12-December-2024.pdf" },
    ],
    costClaim: "Up to $300M Project Pele prototype contract value; a demonstration contract ceiling rather than an electricity price or completed plant cost.",
    costClaimSource: "https://www.powermag.com/dod-picks-bwxt-to-manufacture-project-pele-prototype-nuclear-microreactor/",
    nextGate: "Pele criticality at INL; commercial terms on the Tata letter of intent.",
  },
  {
    companySlug: "last-energy",
    model: "Developer-owner: builds, owns, and operates PWR-20 units and sells the power. Its 34 executed PPAs in Poland and the UK (680 MW, ~$18.9B in power sales) are the model working outside the U.S.",
    modelSource: "https://www.powermag.com/last-energy-secures-ppas-for-34-smr-nuclear-power-plants-in-poland-and-the-uk/",
    government: [
      { text: "DOE approved Last Energy’s pilot-reactor documented safety analysis on October 7, 2026; readiness review and startup authorization remain.", source: "https://www.lastenergy.com/news-press/last-energy-receives-doe-approval-of-pilot-reactor-documented-safety-analysis" },
    ],
    commercial: [
      { text: "Company plans up to 30 units (600 MW) at Haskell, Texas for ERCOT data-center customers, with an interconnection request filed.", source: "https://www.utilitydive.com/news/last-energy-microreactors-texas-ercot-data-centers/741268/" },
    ],
    costClaim: null,
    costClaimSource: null,
    nextGate: "DOE authorization to run PWR-5, and a first U.S. power buyer to anchor Haskell County.",
  },
  {
    companySlug: "deep-fission",
    model: "Borehole developer: emplaces PWR microreactors a mile underground in ~30-inch boreholes, with the water column and surrounding rock providing the passive safety case.",
    modelSource: "https://www.deepfission.com/technology",
    government: [
      { text: "DOE Reactor Pilot Program selection, with the pilot sited at Parsons, Kansas and data-acquisition drilling underway.", source: "https://www.world-nuclear-news.org/articles/deep-fission-begins-drilling-first-data-acquisition-well" },
    ],
    commercial: [
      { text: "Endeavour framework to co-develop 2 GW for its data-center portfolio, targeting first reactors in 2029. Non-binding.", source: "https://www.world-nuclear-news.org/articles/deep-fission-and-endeavour-announce-strategic-partnership" },
    ],
    costClaim: "5\u20137\u00a2/kWh target for the Endeavour framework",
    costClaimSource: "https://www.world-nuclear-news.org/articles/deep-fission-and-endeavour-announce-strategic-partnership",
    nextGate: "A licensed pathway for Parsons: the framework prices at 5\u20137\u00a2 only if boreholes license as cheaply as they drill.",
  },
  {
    companySlug: "aalo-atomics",
    model: "Vertically integrated supplier of the proposed 50 MWe Aalo Pod plant for AI data centers.",
    modelSource: "https://www.aalo.com/aalo-x",
    government: [
      { text: "DOE reported Aalo-X’s zero-power fueled criticality demonstration at INL as the fourth milestone before the July 4, 2026 goal.", source: "https://www.energy.gov/articles/department-energy-celebrates-fourth-criticality-ahead-july-4th-goal" },
    ],
    commercial: [
      { text: "Crusoe strategic partnership: power one Crusoe Spark modular data center at INL in 2027 as proof of concept, with aspirational Pod deployments by 2029. No megawatts contracted.", source: "https://www.globenewswire.com/news-release/2026/07/30/3336005/0/en/crusoe-and-aalo-atomics-form-strategic-partnership-with-goal-of-deploying-first-nuclear-powered-ai-factory.html" },
    ],
    costClaim: null,
    costClaimSource: null,
    nextGate: "Aalo-X operating at INL and the Crusoe proof-of-concept carrying real load.",
  },
  {
    companySlug: "valar-atomics",
    model: "Gigasite model: hundreds of reactors clustered on single industrial campuses selling grid-independent power, hydrogen, and clean hydrocarbon fuels.",
    modelSource: "https://www.valaratomics.com",
    government: [
      { text: "DOE Reactor Pilot Program: Ward 250 reached criticality in Utah in June 2026, the first DOE-authorized reactor built outside a national laboratory.", source: "https://www.energy.gov/articles/department-energy-celebrates-second-advanced-reactor-achieving-criticality" },
    ],
    commercial: [
      { text: "Valar announced a collaboration with NVIDIA on a waterless30 MW AI factory. No reactor electrical-capacity order is established by this announcement.", source: "https://www.valaratomics.com/docs/Announcing-our-1B-Series-B-Led-By-Sequoia" },
    ],
    costClaim: null,
    costClaimSource: null,
    nextGate: "An NRC commercial case: the Utah test ran under DOE authority that does not transfer to sales.",
  },
  {
    companySlug: "antares-nuclear",
    model: "Defense-first microreactor maker: the R1 targets military installations, with Mark-1 aimed at producing electricity in 2027 and installation deployment by 2028.",
    modelSource: "https://www.washingtontechnology.com/companies/2026/07/antares-fetches-470m-move-military-base-reactor-push/415052/",
    government: [
      { text: "First Reactor Pilot Program criticality: Mark-0 at INL, June 2026, run with the U.S. Army.", source: "https://www.army.mil/article/293057/antares_nuclears_successful_zero_power_criticality_test_marks_major_step_for_military_applications_of_advanced_microreactors" },
      { text: "Army selected Antares for a Janus vendor/site pairing at Fort Bragg on August 26, 2026.", source: "https://www.army.mil/article/294891/army_reaches_agreement_with_private_industry_for_nuclear_micro_reactors" },
      { text: "Antares reported testing an electrically heated demonstration unit with NASA Marshall in Huntsville. This is non-nuclear hardware testing.", source: "https://www.linkedin.com/posts/antares-industries_after-6-months-in-huntsville-ourelectrically-heated-activity-7396980168080154624-i2CV" },
    ],
    commercial: [],
    costClaim: null,
    costClaimSource: null,
    nextGate: "Janus site authorization and milestone delivery at Fort Bragg, then a power-producing demonstration.",
  },
  {
    companySlug: "nano-nuclear",
    model: "University-partnered demonstration first: the KRONOS construction permit at the University of Illinois is under full NRC review.",
    modelSource: "https://www.globenewswire.com/news-release/2026/05/20/3298411/0/en/NANO-Nuclear-s-KRONOS-MMR-and-the-University-of-Illinois-Urbana-Champaign-Advance-to-Next-Regulatory-Milestone-as-U-S-NRC-Formally-Accepts-Construction-Permit-Application-for-Revie.html",
    government: [
      { text: "AFWERX Direct-to-Phase-II contract (~$1.25M) to study a KRONOS system at Joint Base Anacostia-Bolling. A feasibility study, not a unit order.", source: "https://www.globenewswire.com/news-release/2025/09/09/3147107/0/en/FOR-IMMEDIATE-RELEASE-UPDATE-NANO-Nuclear-Awarded-AFWERX-Direct-to-Phase-II-Contract-for-KRONOS-MMR-RDT-E-at-Joint-Base-Anacostia-Bolling.html" },
    ],
    commercial: [],
    costClaim: null,
    costClaimSource: null,
    nextGate: "The KRONOS construction permit (~12-month NRC clock from May 2026) and a first paying customer beyond the feasibility study.",
  },
  {
    companySlug: "deployable-energy",
    model: "Unity Nuclear Battery developer: a compact1 MWe water-moderated, gas-cooled product for locations underserved by conventional energy infrastructure.",
    modelSource: "https://www.deployable.energy/post/deployable-energy-announces-unity-demonstration-reactor-achieves-criticality-at-idaho-national-labor",
    government: [
      { text: "Reactor Pilot Program criticality at INL on July 1, 2026, about 150 days from kickoff.", source: "https://www.energy.gov/articles/us-department-energy-meets-president-trumps-goal-delivers-third-advanced-reactor" },
      { text: "One of the first four developers named to DOE's Nuclear Energy Launch Pad.", source: "https://inl.gov/news-release/national-reactor-innovation-center-announces-first-selections-for-nuclear-energy-launch-pad/" },
    ],
    commercial: [],
    costClaim: null,
    costClaimSource: null,
    nextGate: "A first disclosed customer or program contract beyond the DOE pilot cohort.",
  },
  // Grid-scale SMR lane.
  {
    companySlug: "terrapower",
    model: "Project sponsor: builds Kemmerer with a roughly 50/50 DOE cost share under ARDP, up to a $2B federal ceiling.",
    modelSource: "https://www.terrapower.com/fundraise",
    government: [
      { text: "ARDP demonstration cost share requires a 50% project-cost match, up to a$2B federal ceiling.", source: "https://www.terrapower.com/fundraise" },
    ],
    commercial: [
      { text: "PacifiCorp's resource plan selected two additional Natrium units in Utah by 2033, alongside the Kemmerer unit already in its territory.", source: "https://www.neimagazine.com/news/pacificorp-considers-adding-two-more-natrium-units-to-its-generation-mix-by-2033-10759748/" },
      { text: "The Meta framework covers up to eight plants, up to 2.8 GW baseload or 4 GW with the storage boost, with no site named yet.", source: "https://www.terrapower.com/terrapower-announces-deal-with-meta" },
    ],
    costClaim: "~$4B all-in for Kemmerer Unit 1, a figure held since 2021",
    costClaimSource: "https://www.powermag.com/terrapowers-kemmerer-1-enters-construction-timeline-of-the-natrium-projects-road-to-first-power/",
    nextGate: "An operating-license application for Kemmerer, and the first sited order under the Meta framework.",
  },
  {
    companySlug: "oklo",
    model: "Oklo is pursuing an Air Force microreactor pilot at Eielson Air Force Base under a notice of intent to award.",
    modelSource: "https://www.ans.org/news/2025-06-16/article-7114/air-force-issues-notice-to-partner-with-oklo-on-microreactor-deployment-in-alaska/",
    government: [
      { text: "The Air Force announced a notice of intent to award Oklo an Eielson microreactor pilot.", source: "https://www.ans.org/news/2025-06-16/article-7114/air-force-issues-notice-to-partner-with-oklo-on-microreactor-deployment-in-alaska/" },
      { text: "Aurora-INL groundbreaking is proceeding through the DOE Reactor Pilot Program; NRC licensing remains a separate process.", source: "https://oklo.com/newsroom/news-details/2025/Oklo-Breaks-Ground-on-First-Aurora-Powerhouse/default.aspx" },
    ],
    commercial: [
      { text: "Switch master power agreement frames 12 GW of Aurora deployment by 2044; non-binding, with per-project PPAs to follow.", source: "https://www.switch.com/oklo-and-switch-form-landmark-strategic-relationship/" },
      { text: "Meta agreement supports up to 1.2 GW in southern Ohio, with Meta able to prepay for power and fund development.", source: "https://oklo.com/newsroom/news-details/2026/Oklo-Meta-Announce-Agreement-in-Support-of-1-2-GW-Nuclear-Energy-Development-in-Southern-Ohio/default.aspx" },
      { text: "Equinix prepaid $25M against up to 500 MWe with a 36-month right of first refusal.", source: "https://www.nucnet.org/news/oklo-signs-nuclear-pre-agreement-with-data-company-equinix-4-2-2024" },
      { text: "Diamondback Energy letter of intent: 50 MW over 20 years for Permian Basin operations.", source: "https://www.power-eng.com/nuclear/oklo-secures-up-to-750-mw-worth-of-new-data-center-partnerships/" },
    ],
    costClaim: "$40\u201390/MWh expected levelized cost, per its shareholder presentation",
    costClaimSource: "https://www.utilitydive.com/news/oklo-advanced-nuclear-microreactor-project-pipeline-nrc/724343/",
    nextGate: "An issued NRC combined license: every framework in the pipeline prices only after licensed capacity exists.",
  },
  {
    companySlug: "kairos-power",
    model: "Fleet developer-operator: builds and operates KP-FHR plants and sells the power, with the Google master agreement as the anchor order book.",
    modelSource: "https://www.kairospower.com/updates/google-and-kairos-power-partner-to-deploy-500-mw-of-clean-electricity-generation",
    government: [
      { text: "ARDP Risk Reduction award implemented as a Technology Investment Agreement: $629M Hermes 1 project with DOE paying up to $303M against fixed milestones.", source: "https://www.powermag.com/doe-kairos-unveil-milestone-based-funding-agreement-for-advanced-nuclear-demonstration-project/" },
    ],
    commercial: [
      { text: "Google Master Plant Development Agreement for up to 500 MW by 2035, sold plant-by-plant under PPAs.", source: "https://www.kairospower.com/updates/google-and-kairos-power-partner-to-deploy-500-mw-of-clean-electricity-generation" },
      { text: "Hermes 2, under construction at Oak Ridge, is the first deployment under the Google framework.", source: "https://www.kairospower.com/updates/kairos-power-breaks-ground-on-hermes-2-demonstration-plant" },
    ],
    costClaim: null,
    costClaimSource: null,
    nextGate: "Hermes 2 operating, then delivery of the company-stated 75 MWe commercial reactor fleet in paired configurations.",
  },
  {
    companySlug: "x-energy",
    model: "Reactor and fuel vendor: sells Xe-100 plants and TRISO-X fuel, with the ARDP demonstration delivering the first commercial four-unit plant and fuel facility.",
    modelSource: "https://x-energy.com/news/x-energy-signs-department-of-energys-advanced-reactor-demonstration-program-ardp-cooperative-agreement/",
    government: [
      { text: "ARDP cost share of up to $1.2B at 50/50 to develop, license, build, and demonstrate the first Xe-100 plant and fuel facility.", source: "https://x-energy.com/news/x-energy-signs-department-of-energys-advanced-reactor-demonstration-program-ardp-cooperative-agreement/" },
    ],
    commercial: [
      { text: "Amazon framework targets bringing more than 5 GW of Xe-100 projects online by 2039.", source: "https://www.ans.org/news/article-6480/amazon-investing-in-smrs-to-deploy-5gw-by-2039/" },
      { text: "Energy Northwest's Cascade facility carries a funded 320 MWe first phase under Amazon's development-and-funding agreement.", source: "https://www.utilitydive.com/news/washington-nuclear-facility-smrs-cascade-amazon-modular/802967/" },
      { text: "NRC issued the construction permit for Dow's four-reactor Long Mott plant on November 9, 2026; a separate operating license remains necessary.", source: "https://content.govdelivery.com/accounts/USNRC/bulletins/4323d99" },
    ],
    costClaim: null,
    costClaimSource: null,
    nextGate: "Long Mott construction execution, fuel supply, and a separate operating license; final investment decisions remain project-specific.",
  },
  {
    companySlug: "holtec",
    model: "SMR-300 developer working with Hyundai E&C toward a stated10 GW North American fleet ambition.",
    modelSource: "https://world-nuclear-news.org/articles/holtec-and-hyundai-ec-target-10gw-fleet-of-smrs-in-us",
    government: [
      { text: "DOE selected Holtec for up to$400M in federal cost-shared funding for a two-unit SMR-300 project at Palisades.", source: "https://www.energy.gov/articles/energy-department-selects-tva-and-holtec-advance-deployment-us-small-modular-reactors" },
      { text: "$1.52B DOE loan to Holtec Palisades LLC covers the existing 800 MW reactor's restart, not the new units.", source: "https://www.energy.gov/edf/palisades" },
    ],
    commercial: [
      { text: "The Wolverine/Hoosier PPA on restarted Palisades carries a contract expansion provision covering up to two SMR-300 units at the site.", source: "https://www.utilitydive.com/news/palisades-nuclear-holtec-wolverine-hoosier-power-purchase-ppa/693480/" },
      { text: "Holtec's own program timeline targets executing a PIONEER power contract in 2026; none is executed yet.", source: "https://energy-communities-alliance.squarespace.com/s/Holtec-Slides.pdf" },
    ],
    costClaim: null,
    costClaimSource: null,
    nextGate: "Palisades back on the grid, and an executed PIONEER power contract.",
  },
  {
    companySlug: "gev-hitachi",
    model: "Reactor vendor to utility self-builders: the utility owns and builds while GVH supplies the BWRX-300 design inside the integrated project team.",
    modelSource: "https://www.bechtel.com/press-releases/tva-bechtel-sargent-lundy-and-ge-hitachi-plan-initial-construction-and-design-for-potential-clinch-river-smr/",
    government: [
      {"text": "NRC issued the Clinch River Unit 1 construction permit on September 28, 2026; operating licensing is separate.", "source": "https://www.govinfo.gov/content/pkg/FR-2026-10-05/html/2026-20345.htm"},
      { text: "DOE selected TVA for up to$400M in cost-shared funding to advance Clinch River and follow-on BWRX-300 deployment.", source: "https://www.energy.gov/articles/energy-department-selects-tva-and-holtec-advance-deployment-us-small-modular-reactors" },
      { text: "The U.S.-Japan framework earmarks up to $40B for BWRX-300 builds at unidentified Tennessee and Alabama sites.", source: "https://www.ans.org/news/2026-03-25/article-7878/new-us-bwrx300-projects-get-japanese-investment/" },
    ],
    commercial: [
      { text: "TVA's Clinch River Unit 1 proceeds as a utility self-build with Bechtel, Sargent & Lundy, and GE Hitachi on the project team.", source: "https://www.bechtel.com/press-releases/tva-bechtel-sargent-lundy-and-ge-hitachi-plan-initial-construction-and-design-for-potential-clinch-river-smr/" },
      { text: "OPG's four-unit Darlington program in Canada is the design's first-of-a-kind proof, on an approved C$20.9B budget.", source: "https://www.powermag.com/ontario-authorizes-opg-to-start-construction-of-first-commercial-nuclear-smr/" },
    ],
    costClaim: "Historical 2025 Darlington budget: C$7.7B for the first unit and shared systems; C$20.9B for four units. OPG began a cost and schedule reassessment in 2026.",
    costClaimSource: "https://www.opg.com/news-resources/newsroom/release/opg-reports-2025-first-quarter-financial-results/",
    nextGate: "Clinch River construction and separate operating licensing after the September 2026 construction permit; Darlington completion tests the cost estimates.",

    additionalSources: [{"url":"https://www.opg.com/projects-services/projects/nuclear/smr/darlington-smr/","label":"OPG November 2026 budget and schedule reassessment"}],
  },
  {
    companySlug: "nuscale",
    model: "Technology licensor: ENTRA1 Energy exclusively develops, finances, owns, and operates NuScale-powered plants; NuScale sells the licensed module.",
    modelSource: "https://www.nuscalepower.com/about/strategic-partners",
    government: [
      { text: "The DOE-backed CFPP, the company's federal build program, terminated in November 2023 when subscription fell short.", source: "https://www.sec.gov/Archives/edgar/data/1822966/000182296623000256/uampsnuscalejointpressre.htm" },
    ],
    commercial: [
      { text: "ENTRA1 and TVA signed a collaborative agreement to deploy up to 6 GW across TVA's service region; non-binding.", source: "https://www.world-nuclear-news.org/articles/tva-entra1-energy-team-up-for-smr-deployment" },
      { text: "Management targets converting the TVA collaboration into a signed power contract by the end of 2026.", source: "https://www.nuscalepower.com/press-releases/2026/nuscale-power-reports-first-quarter-2026-results" },
      { text: "RoPower's 462 MWe six-module plant in Romania took its final investment decision in February 2026.", source: "https://www.world-nuclear-news.org/articles/final-investment-decision-taken-for-romanias-smrs" },
    ],
    costClaim: "$89/MWh, the CFPP target price at termination",
    costClaimSource: "https://www.sec.gov/Archives/edgar/data/1822966/000182296623000008/pressreleasenuscalereach.htm",
    nextGate: "Converting the TVA collaboration into a signed power contract, the company's own end-of-2026 target.",
  },
  {
    companySlug: "terrestrial-energy",
    model: "IMSR vendor with separate DOE pilot agreements for the TETRA reactor and TEFLA fuel-salt facility; the commercial plant is company-rated 390 MWe.",
    modelSource: "https://ir.terrestrialenergy.com/news-releases/news-release-details/terrestrial-energy-executes-doe-agreement-project-tefla-under",
    government: [
      {"text": "Selected as Ameresco's nuclear technology supplier at Aberdeen Proving Ground, reported November 10, 2026.", "source": "https://ir.terrestrialenergy.com/news-releases/news-release-details/terrestrial-energy-reports-third-quarter-2026-results"},
      { text: "Separate DOE Other Transaction Authority agreements cover Project TETRA, the test reactor, and Project TEFLA, a fuel-salt pilot under the Fuel Line Pilot Program.", source: "https://ir.terrestrialenergy.com/news-releases/news-release-details/terrestrial-energy-executes-doe-agreement-project-tefla-under" },
    ],
    commercial: [
      { text: "Riot Platforms collaboration scoped up to 4 GW across data-center sites in Texas and Kentucky; an MOU-level collaboration, not an order.", source: "https://www.riotplatforms.com/terrestrial-energy-and-riot-platforms-launch-collaboration-to-develop-nuclear-powered-large-scale-data-center-projects/" },
      { text: "An Ameresco collaboration on customized IMSR energy-supply projects carries no quantified megawatts.", source: "https://www.globenewswire.com/news-release/2025/06/24/3104171/0/en/Terrestrial-Energy-and-Ameresco-Announce-Collaboration-to-Develop-IMSR-Plant-Projects-for-Customized-Energy-Supply.html" },
    ],
    costClaim: null,
    costClaimSource: null,
    nextGate: "TETRA criticality, then an NRC construction-permit filing built on the RELLIS site data.",
  },
];

export const mechanisms: FinancingMechanism[] = [
  {
    status: "In use",
    mechanism: "Milestone-based cost share",
    how: "The government pays fixed amounts only when named milestones complete, so overruns between milestones stay with the developer.",
    example: "The DOE/Kairos Technology Investment Agreement: a $629M Hermes 1 project with DOE paying up to $303M against fixed milestones.",
    date: "2024-02",
    source: "https://www.powermag.com/doe-kairos-unveil-milestone-based-funding-agreement-for-advanced-nuclear-demonstration-project/",
  },
  {
    status: "In use",
    mechanism: "50/50 demonstration cost share",
    how: "DOE matches project spend up to a ceiling, halving the private capital a first unit needs.",
    example: "ARDP: X-energy's award of up to $1.2B at 50/50 to develop, license, build, and demonstrate the first Xe-100 plant and fuel facility.",
    date: "2020-10",
    source: "https://x-energy.com/news/x-energy-signs-department-of-energys-advanced-reactor-demonstration-program-ardp-cooperative-agreement/",
  },
  {
    status: "In use",
    mechanism: "Defense delivery agreement",
    how: "A government delivery agreement creates a hardware milestone; it does not establish permission to operate.",
    example: "Radiant’s announced ANPI delivery agreement with DIU and the Department of the Air Force for a mass-manufactured microreactor.",
    date: "2025-08",
    source: "https://www.ans.org/news/2025-08-14/article-7277/radiant-signs-contract-on-microreactors-for-the-military/",
  },
  {
    status: "In use",
    mechanism: "Order book with per-plant PPAs",
    how: "One master agreement commits a fleet; each plant closes its own PPA as it matures. The buyer gets optionality, the developer gets a book that supply chains can invest against.",
    example: "Google-Kairos Master Plant Development Agreement: up to 500 MW by 2035.",
    date: "2024-10",
    source: "https://www.kairospower.com/updates/google-and-kairos-power-partner-to-deploy-500-mw-of-clean-electricity-generation",
  },
  {
    status: "In use",
    mechanism: "Customer-funded development",
    how: "The offtaker pays development costs directly instead of waiting to buy power, converting a future PPA into present-day project capital.",
    example: "Amazon and Energy Northwest's Carbon Free Development and Funding Agreement for Cascade's initial 320 MWe phase.",
    date: "2024-10",
    source: "https://www.utilitydive.com/news/washington-nuclear-facility-smrs-cascade-amazon-modular/802967/",
  },
  {
    status: "In use",
    mechanism: "Power prepayment",
    how: "The buyer prepays for future electricity, financing construction from the demand side without taking equity.",
    example: "The Meta-Oklo agreement for up to 1.2 GW in Ohio lets Meta prepay for power and fund project development.",
    date: "2026-01",
    source: "https://oklo.com/newsroom/news-details/2026/Oklo-Meta-Announce-Agreement-in-Support-of-1-2-GW-Nuclear-Energy-Development-in-Southern-Ohio/default.aspx",
  },
  {
    status: "In use",
    mechanism: "Prepayment for optionality",
    how: "A deposit today buys first claim on capacity tomorrow: real money moves while the offtake itself stays unsigned.",
    example: "Equinix prepaid Oklo $25M under a pre-agreement carrying a 36-month right of first refusal on up to 500 MWe; the offtake beyond the prepayment is non-binding.",
    date: "2024-04",
    source: "https://www.nucnet.org/news/oklo-signs-nuclear-pre-agreement-with-data-company-equinix-4-2-2024",
  },
  {
    status: "In use",
    mechanism: "Factory preorder with deposits",
    how: "Deposits against factory units, the aircraft-order model applied to reactors. Deposits fund the line; the book justifies the factory.",
    example: "Equinix preorder and deposits for 20 Radiant Kaleidos microreactors.",
    date: "2025-08",
    source: "https://www.accessnewswire.com/newsroom/en/clean-technology/radiant-announces-equinix-preorder-and-deposits-for-20-kaleidos-microreactors-1061067",
  },
  {
    status: "In use",
    mechanism: "Developer-owned build with PPAs",
    how: "The developer finances, owns, and operates its own units and sells power under PPAs it originates, keeping control of price and pace.",
    example: "Last Energy's 34 executed PPAs across Poland and the UK: 680 MW, roughly $18.9B in power sales.",
    date: "2024-03",
    source: "https://www.powermag.com/last-energy-secures-ppas-for-34-smr-nuclear-power-plants-in-poland-and-the-uk/",
  },
  {
    status: "In use",
    mechanism: "Exclusive commercialization partner",
    how: "A partner develops, finances, owns, and operates every plant; the reactor company stays a technology licensor.",
    example: "ENTRA1 Energy, NuScale's exclusive global commercial partner.",
    date: "2025-09",
    source: "https://www.nuscalepower.com/about/strategic-partners",
  },
  {
    status: "In use",
    mechanism: "Utility self-build in rate base",
    how: "A utility builds and owns the plant, recovering cost through regulated rates or public-power revenue, the model that financed the existing U.S. fleet.",
    example: "Vogtle 3&4: Georgia Power's completed ~2.2 GW expansion, the model's latest executed instance, delivered at ~$32.3B of capital.",
    date: "2025-06",
    source: "https://www.lazard.com/media/eijnqja3/lazards-lcoeplus-june-2025.pdf",
  },
  {
    status: "In use",
    mechanism: "PPA with fleet-expansion option",
    how: "A power contract on an existing asset embeds an option on future units, giving the next reactor a buyer before it exists.",
    example: "The Palisades PPA carries a contract expansion provision covering up to two SMR-300 units Holtec intends to build at the site.",
    date: "2023-09",
    source: "https://www.utilitydive.com/news/palisades-nuclear-holtec-wolverine-hoosier-power-purchase-ppa/693480/",
  },
  {
    status: "In use",
    mechanism: "Government profit participation",
    how: "Federal financing support is exchanged for a share of upside above a return threshold, an equity-like claim without equity.",
    example: "The U.S. government-Westinghouse partnership announced October 2025: an ~$80B deployment frame carrying a federal claim on 20% of cash distributions above a $17.5B return threshold.",
    date: "2025-10",
    source: "https://natlawreview.com/article/us-government-announces-historic-80-billion-nuclear-partnership-westinghouse",
  },
  {
    status: "Pending",
    mechanism: "Sovereign framework investment",
    how: "A trade framework routes allied capital into named reactor programs, adding a state balance sheet beside private ones.",
    example: "The U.S.-Japan framework's up to $40B for BWRX-300 builds at unidentified Tennessee and Alabama sites, announced at head-of-government level and described as a strategic-investment framework rather than a definitive construction contract.",
    date: "2026-03",
    source: "https://www.ans.org/news/2026-03-25/article-7878/new-us-bwrx300-projects-get-japanese-investment/",
  },
  {
    status: "Pending",
    mechanism: "Anchor-customer utility tariff",
    how: "Large customers commit through a special rate to fund clean-firm generation inside a regulated utility, absorbing project risk the general rate base would otherwise carry.",
    example: "Duke Energy's Accelerating Clean Energy MOUs with Amazon, Google, Microsoft, and Nucor are signed agreements to explore the structure; the tariffs themselves remain proposed and subject to regulatory approval.",
    date: "2024-05",
    source: "https://news.duke-energy.com/releases/responding-to-growing-demand-duke-energy-amazon-google-microsoft-and-nucor-execute-agreements-to-accelerate-clean-energy-options",
  },
  {
    status: "In use",
    mechanism: "Regulated asset base (UK)",
    how: "Consumers pay a regulated charge during construction, cutting financing costs by years of carry; the state co-invests and shares overrun risk.",
    example: "Sizewell C: the first nuclear RAB, around \u00a338B, final investment decision July 2025 with the UK government as largest shareholder.",
    date: "2025-07",
    source: "https://www.sizewellc.com/news-views/final-investment-decision-reached-for-sizewell-c-the-biggest-british-clean-energy-project-in-a-generation/",
  },
  {
    status: "Pending",
    mechanism: "Tax-credit monetization",
    how: "Tech-neutral 45Y/48E credits, transferable for cash, cover a large share of capital for reactors beginning construction by 2034, with a 10% adder in nuclear energy communities.",
    example: "Enacted, and nuclear survived the 2025 OBBBA phase-outs that hit wind and solar; a first claim awaits the first new reactor placed in service.",
    date: "2025-07",
    source: "https://www.congress.gov/crs-product/IN12719",
  },
  {
    status: "Pending",
    mechanism: "Fixed-price power at a defense site",
    how: "The developer finances, builds, owns, and operates; the government commits to buy power at a fixed price for decades, making the plant bankable without an equipment sale.",
    example: "The Air Force/DLA Notice of Intent to Award to Oklo: a 5 MW microreactor at Eielson AFB under a prospective 30-year arrangement, with contract negotiations pending NRC licensing. No contract is executed.",
    date: "2025-06",
    source: "https://www.ans.org/news/2025-06-16/article-7114/air-force-issues-notice-to-partner-with-oklo-on-microreactor-deployment-in-alaska/",
  },
  {
    status: "Pending",
    mechanism: "Milestone-contracted installation power (Army)",
    how: "The Army's Janus Program solicits commercially owned and operated microreactors on installations, paid against milestones.",
    example: "Program announced October 2025 with site selection following; no vendor award named.",
    date: "2025-10",
    source: "https://www.army.mil/article/288903/army_announces_janus_program_for_next_generation_nuclear_energy",
  },
  {
    status: "Pending",
    mechanism: "Oil & gas offtake",
    how: "Producers with remote, always-on load contract for behind-the-meter nuclear the way they contract field power today.",
    example: "The Oklo-Diamondback letter of intent, 50 MW over 20 years for Permian Basin operations, is non-binding; no executed oil-and-gas offtake is on record.",
    date: "2025-04",
    source: "https://www.power-eng.com/nuclear/oklo-secures-up-to-750-mw-worth-of-new-data-center-partnerships/",
  },
  {
    status: "Proposed",
    mechanism: "Federal overrun risk sharing (ARC Act)",
    how: "A risk reduction program creating safeguards against unforeseen costs through enhanced financing terms and a limited federal cost share, for three or more advanced reactor projects.",
    example: "Introduced by Senators Risch and Gallego, February 10, 2026; endorsed by NEI and public-power groups.",
    date: "2026-02",
    source: "https://www.risch.senate.gov/news/press-releases/risch-gallego-introduce-bill-to-accelerate-new-nuclear-investment/",
  },
  {
    status: "Proposed",
    mechanism: "Tiered overrun insurance facility",
    how: "A federal facility insuring construction overruns with risk tiered among sponsor, state, and federal layers, gated on competitive selection, proven integrated project delivery, a paid premium, and state support.",
    example: "Clean Air Task Force policy proposal.",
    date: "2025-05",
    source: "https://www.catf.us/2025/05/can-they-make-atoms-great-again/",
  },
];

export const liabilityPools: LiabilityPool[] = [
  {
    name: "Price-Anderson retrospective pool",
    structure: "Two layers: each reactor carries primary insurance, and above it every covered U.S. power reactor owes retrospective premiums into a shared pool after any incident, paid at up to ~$24.7M per reactor per year. Extended to cover new reactors licensed through 2065.",
    capacity: "Up to $165.9M per reactor per incident including the 5% surcharge",
    date: "2024-03",
    source: "https://www.congress.gov/crs-product/IF10821",
  },
  {
    name: "NEIL mutual property pool",
    structure: "The industry's mutual insurer for property damage, decontamination, and business interruption; owners are the members, so premiums and distributions stay inside the fleet.",
    capacity: "Up to $3.2B per incident in property coverage, per PG&E's 2025 annual report",
    date: "2026-02",
    source: "https://www.sec.gov/Archives/edgar/data/1004980/000100498026000024/a2025annualreportmaster.htm",
  },
];

export const underwriters: Underwriter[] = [
  {
    name: "DOE Office of Energy Dominance Financing (ex-LPO)",
    role: "Federal lender bridging first-mover projects to private capital",
    commitment: "The Energy Infrastructure Reinvestment program keeps ~$250B lending authority after OBBBA cut its credit-subsidy appropriation from $5B to $1B; recent nuclear actions include the Palisades and Crane restart loans and a $26.5B Southern Company loan.",
    date: "2026-03",
    source: "https://nuclearinnovationalliance.org/sites/default/files/2026-04/The%20Role%20of%20DOE%E2%80%99s%20Office%20of%20Energy%20Dominance%20Financing%20in%20U.S.%20Nuclear%20Energy%20Leadership%20-%20March%202026%20Update.pdf",
    report: { reportSlug: "nia-edf-nuclear-2026", page: 3, quote: "reduced appropriations to $1 billion while maintaining around $250 billion in lending authority" },
  },
  {
    name: "Export-Import Bank of the United States",
    role: "Export credit for U.S. reactor sales abroad",
    commitment: "A $98M approved loan for Romania's SMR pre-project engineering under the Engineering Multiplier Program, on top of earlier letters of interest of up to $3B (EXIM) and $1B (DFC) for the project's deployment.",
    date: "2024-10",
    source: "https://www.world-nuclear-news.org/articles/us-exim-bank-approves-loan-for-romanian-smr-project",
  },
  {
    name: "U.S. International Development Finance Corporation",
    role: "Development finance for allied deployments",
    commitment: "Up to $1B letter of interest for Poland's first two BWRX-300 units.",
    date: "2023-09",
    source: "https://osge.com/en/us-government-financial-institutions-indicate-willingness-to-support-osge/",
  },
  {
    name: "World Bank",
    role: "Multilateral finance, newly reopened to nuclear",
    commitment: "Lifted its decades-long ban on financing nuclear energy projects on June 11, 2025.",
    date: "2025-06",
    source: "https://www.world-nuclear-news.org/articles/world-bank-agrees-to-end-ban-on-funding-nuclear-energy",
  },
  {
    name: "Canada Infrastructure Bank",
    role: "Crown lender for Canadian clean power",
    commitment: "C$970M in debt for Darlington SMR phase-1 works, its largest clean-power investment at signing.",
    date: "2022-10",
    source: "https://cib-bic.ca/en/medias/articles/cib-commits-970-million-towards-canadas-first-small-modular-reactor/",
  },
  {
    name: "Fourteen global banks and financial institutions",
    role: "Commercial and investment banks signaling lending appetite",
    commitment: "Publicly backed the goal of tripling nuclear capacity by 2050 at New York Climate Week: Bank of America, Barclays, BNP Paribas, Brookfield, Citi, Crédit Agricole CIB, Goldman Sachs, Guggenheim, Morgan Stanley, Rothschild & Co, Société Générale, Ares, Segra, and Abu Dhabi Commercial Bank.",
    date: "2024-09",
    source: "https://world-nuclear.org/net-zero-nuclear/news/international-banks-express-support-for-nuclear-expansion",
  },
  {
    name: "Venture debt lenders",
    role: "Credit for pre-revenue reactor developers, a first for the sector",
    commitment: "Valar's $200M credit facility, led by Erebor Bank as administrative agent with J.P. Morgan, Crescent Cove, and Hercules Capital, closed beside its Series B.",
    date: "2026-08",
    source: "https://www.valaratomics.com/docs/Announcing-our-1B-Series-B-Led-By-Sequoia",
  },
];

export const sitingFacts: SitingFact[] = [
  {
    lane: "Cross-class",
    fact: "NRC's 2023 emergency-preparedness rule sizes the planning zone by consequence, the area where projected dose exceeds 10 mSv over 96 hours, so a small source term can put the zone at the site boundary instead of the 10-mile default.",
    source: "https://www.federalregister.gov/documents/2023/11/16/2023-25163/emergency-preparedness-for-small-modular-reactors-and-other-new-technologies",
  },
  {
    lane: "Cross-class",
    fact: "FY2026 NRC fee rule: $154 per hour for qualifying advanced-reactor work, compared with the $337 professional hourly rate.",
    source: "https://www.nrc.gov/sites/default/files/cdn/doc-collection-news/2026/26-066.pdf",
  },
  {
    lane: "Cross-class",
    fact: "Part 53, the optional risk-informed, technology-inclusive licensing framework, was finalized in March 2026 as an alternative to the Part 50 and Part 52 pathways.",
    source: "https://www.bdlaw.com/publications/nrc-finalizes-new-optional-licensing-framework-for-advanced-reactors/",
  },
  {
    lane: "Microreactor",
    fact: "eVinci is designed to site on as little as two acres.",
    source: "https://www.powermag.com/westinghouse-secures-first-customer-for-evinci-nuclear-microreactor/",
  },
  {
    lane: "Microreactor",
    fact: "A KRONOS MMR unit fits a footprint under five acres.",
    source: "https://nanonuclearenergy.com/kronos-mmr/",
  },
  {
    lane: "Microreactor",
    fact: "Deep Fission removes the surface plant almost entirely, emplacing the reactor roughly a mile down a ~30-inch borehole.",
    source: "https://www.deepfission.com/technology",
  },
  {
    lane: "Microreactor",
    fact: "Project Pele demonstrates a federal-site pathway: the prototype is being assembled at Idaho National Laboratory under DOE authority.",
    source: "https://www.energy.gov/ne/articles/department-defense-breaks-ground-project-pele-microreactor",
  },
  {
    lane: "Grid-scale SMR",
    fact: "An IMSR plant needs about 17 acres inside a roughly 130m by 145m security perimeter.",
    source: "https://www.nrc.gov/docs/ML2009/ML20097B839.pdf",
  },
  {
    lane: "Grid-scale SMR",
    fact: "Last Energy plans up to 30 PWR-20 units on a 200-acre Texas site, industrial-park scale rather than a traditional plant envelope.",
    source: "https://www.utilitydive.com/news/last-energy-microreactors-texas-ercot-data-centers/741268/",
  },
  {
    lane: "Large LWR",
    fact: "Large reactors keep utility-scale siting: Vogtle's two new AP1000 units represent ~2.2 GW of capacity and ~$32.3B of capital on one site, with the transmission, water, and workforce that scale implies.",
    source: "https://www.lazard.com/media/eijnqja3/lazards-lcoeplus-june-2025.pdf",
  },
];

/** Captured reports backing the page's figures, listed for the reader. */
export const capturedReports: { slug: string; title: string; url: string }[] = [
  { slug: "lazard-lcoe-july-2026", title: "Lazard, Levelized Cost of Energy+ (July 2026)", url: "https://www.lazard.com/media/kcfconhf/lazards-lcoeplus_vf.pdf" },
  { slug: "doe-liftoff-advanced-nuclear-2024", title: "DOE Pathways to Commercial Liftoff: Advanced Nuclear (Sept 2024)", url: "https://gain.inl.gov/content/uploads/4/2024/11/DOE-Advanced-Nuclear-Liftoff-Report.pdf" },
  { slug: "inl-microreactor-bottom-up-2024", title: "INL, Technoeconomic Evaluation of Microreactor Using Detailed Bottom-up Estimate", url: "https://gain.inl.gov/content/uploads/4/2025/03/2024-Document-INL-RPT-24-80433.pdf" },
  { slug: "inl-adv-reactor-cost-lit-review-2023", title: "INL, Literature Review of Advanced Reactor Cost Estimates", url: "https://gain.inl.gov/content/uploads/4/2024/11/INL-RPT-23-72972-Literature-Review-of-Adv-Reactor-Cost-Estimates.pdf" },
  { slug: "lazard-lcoe-june-2025", title: "Lazard, Levelized Cost of Energy+ (June 2025)", url: "https://www.lazard.com/media/eijnqja3/lazards-lcoeplus-june-2025.pdf" },
  { slug: "nia-edf-nuclear-2026", title: "Nuclear Innovation Alliance, The Role of DOE's Office of Energy Dominance Financing (March 2026)", url: "https://nuclearinnovationalliance.org/sites/default/files/2026-04/The%20Role%20of%20DOE%E2%80%99s%20Office%20of%20Energy%20Dominance%20Financing%20in%20U.S.%20Nuclear%20Energy%20Leadership%20-%20March%202026%20Update.pdf" },
  { slug: "eash-gates-2020-joule", title: "Eash-Gates et al., Sources of Cost Overrun in Nuclear Power Plant Construction (Joule, 2020)", url: "https://dspace.mit.edu/bitstream/handle/1721.1/133049/Jacopo's%20and%20Jessika's%20paper%20on%20nuclear%20cost%20Sep%202020.pdf" },
];

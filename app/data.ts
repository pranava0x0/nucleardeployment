export type Verification = "Verified" | "Government-reported" | "Company-reported";

export type Project = {
  slug: string;
  name: string;
  developer: string;
  companySlug: string;
  location: string;
  region: string;
  technology: string;
  capacity: string;
  stage: number;
  stageLabel: string;
  commitment: number;
  status: string;
  summary: string;
  latest: string;
  latestDate: string;
  next: string;
  nextOwner: string;
  blocker: string;
  confidence: "High" | "Medium" | "Low";
  verification: Verification;
  source: string;
  sourceLabel: string;
  x: number;
  y: number;
};

export const stages = [
  { label: "Interest", summary: "Exploring the idea", definition: "Public interest or exploratory statement." },
  { label: "Preliminary", summary: "Early study or nonbinding agreement", definition: "MOU, LOI, reservation, or early study." },
  { label: "Development", summary: "Site, engineering, or licensing work", definition: "Site control, engineering, formal licensing, or executed development work." },
  { label: "Contractual", summary: "Binding deal or committed capital", definition: "Binding offtake, equipment order, award, investment, or committed equity." },
  { label: "Ready", summary: "Final permit, finance, or go-ahead", definition: "Major permit, final investment decision, financial close, or notice to proceed." },
  { label: "Physical", summary: "Work or fuel at the site", definition: "Site preparation, first concrete, installation, fuel delivery, or fuel loading." },
  { label: "Operational", summary: "Criticality through commercial operation", definition: "Criticality, first power, grid connection, full power, or commercial operation." },
  { label: "Replication", summary: "Repeat units or fleet delivery", definition: "Repeat unit, fleet order, manufacturing cadence, or demonstrated learning." },
];

export const stageLabels = stages.map((stage) => stage.label);

export const projects: Project[] = [
  {
    slug: "natrium-kemmerer",
    name: "Natrium · Kemmerer Unit 1",
    developer: "TerraPower / US SFR Owner",
    companySlug: "terrapower",
    location: "Kemmerer, Wyoming",
    region: "West",
    technology: "Sodium-cooled fast reactor",
    capacity: "345 MWe + storage",
    stage: 6,
    stageLabel: "Physical deployment",
    commitment: 5,
    status: "Construction permitted",
    summary: "A commercial-scale advanced reactor demonstration replacing capacity near a retiring coal plant.",
    latest: "NRC issued construction permit CPAR-1; DOE later reported groundbreaking for the nuclear island.",
    latestDate: "2026-04",
    next: "Submit and secure the separate NRC operating license before fuel loading or operation.",
    nextOwner: "TerraPower and NRC",
    blocker: "Operating license, HALEU fuel availability, first-of-a-kind delivery",
    confidence: "High",
    verification: "Verified",
    source: "https://www.nrc.gov/reactors/new-reactors/advanced/who-were-working-with/past-license-activities/terrapower",
    sourceLabel: "NRC application record",
    x: 22,
    y: 36,
  },
  {
    slug: "hermes-2",
    name: "Hermes 2",
    developer: "Kairos Power",
    companySlug: "kairos-power",
    location: "Oak Ridge, Tennessee",
    region: "South",
    technology: "Fluoride salt-cooled high-temperature reactor",
    capacity: "Two low-power test reactors",
    stage: 6,
    stageLabel: "Physical deployment",
    commitment: 5,
    status: "Construction underway",
    summary: "Two non-power test reactors intended to support commercial validation of Kairos Power's KP-FHR technology.",
    latest: "DOE reported Hermes 2 groundbreaking after the NRC issued two construction permits.",
    latestDate: "2026-04",
    next: "Complete nuclear construction, request operating licenses, then load fuel and test.",
    nextOwner: "Kairos Power and NRC",
    blocker: "Construction execution and later operating authorization",
    confidence: "High",
    verification: "Verified",
    source: "https://www.nrc.gov/reactors/non-power/new-facility-licensing/hermes2-kairos",
    sourceLabel: "NRC Hermes 2 record",
    x: 68,
    y: 62,
  },
  {
    slug: "long-mott-xe-100",
    name: "Long Mott · Xe-100",
    developer: "Long Mott Energy / X-energy / Dow",
    companySlug: "x-energy",
    location: "Calhoun County, Texas",
    region: "South",
    technology: "High-temperature gas-cooled reactor",
    capacity: "4 × 80 MWe + process heat",
    stage: 3,
    stageLabel: "Development commitment",
    commitment: 3,
    status: "License review",
    summary: "A four-module industrial energy project designed to supply electricity and process heat at Dow's Seadrift site.",
    latest: "NRC environmental review concluded with an environmental assessment and finding of no significant impact.",
    latestDate: "2026-05",
    next: "Complete the safety review and obtain a construction permit; operation requires a later license.",
    nextOwner: "NRC and Long Mott Energy",
    blocker: "Construction-permit decision and TRISO fuel scale-up",
    confidence: "Medium",
    verification: "Verified",
    source: "https://www.nrc.gov/reactors/new-reactors/advanced/who-were-working-with/applicant-projects/long-mott",
    sourceLabel: "NRC Long Mott dashboard",
    x: 51,
    y: 78,
  },
  {
    slug: "project-pele",
    name: "Project Pele",
    developer: "U.S. Department of Defense / BWXT",
    companySlug: "bwxt",
    location: "Idaho National Laboratory",
    region: "West",
    technology: "Transportable high-temperature gas reactor",
    capacity: "1–5 MWe",
    stage: 6,
    stageLabel: "Physical deployment",
    commitment: 4,
    status: "Prototype construction",
    summary: "A transportable microreactor demonstration for resilient military power, under DOE safety oversight.",
    latest: "DoD broke ground at INL for the prototype demonstration site.",
    latestDate: "2024-09",
    next: "Deliver the reactor module, complete safety review, assemble, fuel, and begin testing.",
    nextOwner: "DoD, BWXT, and DOE Idaho Operations",
    blocker: "Module delivery, authorization, and demonstration testing",
    confidence: "Medium",
    verification: "Government-reported",
    source: "https://www.energy.gov/ne/articles/department-defense-breaks-ground-project-pele-microreactor",
    sourceLabel: "DOE Project Pele update",
    x: 20,
    y: 28,
  },
  {
    slug: "kaleidos-dome",
    name: "Kaleidos · DOME test",
    developer: "Radiant Industries / NRIC",
    companySlug: "radiant-industries",
    location: "Idaho National Laboratory",
    region: "West",
    technology: "Gas-cooled microreactor",
    capacity: "Experiment",
    stage: 3,
    stageLabel: "Development commitment",
    commitment: 3,
    status: "Conditional test slot",
    summary: "A planned fueled experiment in DOE's DOME microreactor test bed, subject to readiness milestones.",
    latest: "DOE conditionally selected Kaleidos for an initial DOME test slot.",
    latestDate: "2025-07",
    next: "Satisfy readiness gates, complete authorization, install the experiment, and conduct testing.",
    nextOwner: "Radiant, NRIC, and DOE",
    blocker: "Test readiness and DOE authorization",
    confidence: "Medium",
    verification: "Government-reported",
    source: "https://www.energy.gov/ne/demonstration-microreactor-experiments-dome",
    sourceLabel: "DOE DOME program",
    x: 24,
    y: 29,
  },
  {
    slug: "valar-ward-250",
    name: "Ward 250 critical experiment",
    developer: "Valar Atomics",
    companySlug: "valar-atomics",
    location: "Emery County, Utah",
    region: "West",
    technology: "Zero-power critical experiment",
    capacity: "No electricity generation",
    stage: 7,
    stageLabel: "Operational progress",
    commitment: 6,
    status: "Initial criticality achieved",
    summary: "A DOE-authorized zero-power criticality demonstration; it is evidence of reactor physics, not commercial operation.",
    latest: "The Ward 250 experiment achieved zero-power criticality outside a national laboratory.",
    latestDate: "2026-06",
    next: "Translate test results into a powered design, licensing basis, customer project, and repeatable delivery plan.",
    nextOwner: "Valar Atomics",
    blocker: "Powered demonstration, licensing, finance, and commercialization",
    confidence: "High",
    verification: "Government-reported",
    source: "https://www.energy.gov/articles/department-energy-celebrates-second-advanced-reactor-achieving-criticality",
    sourceLabel: "DOE criticality announcement",
    x: 27,
    y: 48,
  },
];

export type Company = {
  slug: string;
  name: string;
  role: string;
  summary: string;
  technology: string;
  projectSlugs: string[];
  source: string;
  sourceLabel: string;
};

export const companies: Company[] = [
  {
    slug: "terrapower",
    name: "TerraPower",
    role: "Reactor developer and project sponsor",
    summary: "Lead developer of the Natrium demonstration project at Kemmerer, Wyoming.",
    technology: "Sodium-cooled fast reactor",
    projectSlugs: ["natrium-kemmerer"],
    source: "https://www.nrc.gov/reactors/new-reactors/advanced/who-were-working-with/past-license-activities/terrapower",
    sourceLabel: "NRC TerraPower record",
  },
  {
    slug: "kairos-power",
    name: "Kairos Power",
    role: "Reactor developer and test-reactor licensee",
    summary: "Developer of the Hermes 2 low-power test reactors in Oak Ridge, Tennessee.",
    technology: "Fluoride salt-cooled high-temperature reactor",
    projectSlugs: ["hermes-2"],
    source: "https://www.nrc.gov/reactors/non-power/new-facility-licensing/hermes2-kairos",
    sourceLabel: "NRC Hermes 2 record",
  },
  {
    slug: "x-energy",
    name: "X-energy",
    role: "Reactor technology provider",
    summary: "Technology developer for the Xe-100 project under review at Dow's Seadrift site in Texas.",
    technology: "High-temperature gas-cooled reactor",
    projectSlugs: ["long-mott-xe-100"],
    source: "https://www.nrc.gov/reactors/new-reactors/advanced/who-were-working-with/applicant-projects/long-mott",
    sourceLabel: "NRC Long Mott dashboard",
  },
  {
    slug: "bwxt",
    name: "BWXT",
    role: "Reactor manufacturer and delivery contractor",
    summary: "Prime industrial partner delivering the Project Pele transportable microreactor for the Department of Defense.",
    technology: "Transportable high-temperature gas reactor",
    projectSlugs: ["project-pele"],
    source: "https://www.energy.gov/ne/articles/department-defense-breaks-ground-project-pele-microreactor",
    sourceLabel: "DOE Project Pele update",
  },
  {
    slug: "radiant-industries",
    name: "Radiant Industries",
    role: "Microreactor developer",
    summary: "Developer of the Kaleidos experiment conditionally selected for testing in the DOME facility.",
    technology: "Gas-cooled microreactor",
    projectSlugs: ["kaleidos-dome"],
    source: "https://www.energy.gov/ne/demonstration-microreactor-experiments-dome",
    sourceLabel: "DOE DOME program",
  },
  {
    slug: "valar-atomics",
    name: "Valar Atomics",
    role: "Reactor developer",
    summary: "Developer of the Ward 250 zero-power critical experiment in Utah.",
    technology: "Zero-power critical experiment",
    projectSlugs: ["valar-ward-250"],
    source: "https://www.energy.gov/articles/department-energy-celebrates-second-advanced-reactor-achieving-criticality",
    sourceLabel: "DOE criticality announcement",
  },
];

export const federalActions = [
  {
    eo: "EO 14299",
    title: "National security deployment",
    directive: "Operate an Army-regulated reactor at a domestic military installation by September 30, 2028.",
    owner: "Department of Defense / Army",
    status: "In progress",
    next: "Select site and delivery pathway",
    source: "https://www.whitehouse.gov/presidential-actions/2025/05/deploying-advanced-nuclear-reactor-technologies-for-national-security/",
  },
  {
    eo: "EO 14300",
    title: "NRC reform",
    directive: "Revise NRC rules and establish fixed licensing deadlines, including an 18-month ceiling for new-reactor decisions.",
    owner: "Nuclear Regulatory Commission",
    status: "Implementation underway",
    next: "Rules and guidance",
    source: "https://www.whitehouse.gov/presidential-actions/2025/05/ordering-the-reform-of-the-nuclear-regulatory-commission/",
  },
  {
    eo: "EO 14301",
    title: "DOE reactor testing",
    directive: "Create a pilot pathway for reactors outside national laboratories, targeting at least three criticalities by July 4, 2026.",
    owner: "Department of Energy",
    status: "Two criticalities reported",
    next: "Operational validation and commercialization",
    source: "https://www.whitehouse.gov/presidential-actions/2025/05/reforming-nuclear-reactor-testing-at-the-department-of-energy/",
  },
  {
    eo: "EO 14302",
    title: "Industrial base",
    directive: "Expand fuel availability, domestic supply chains, workforce, financing, and large-reactor deployment capacity.",
    owner: "DOE and partner agencies",
    status: "In progress",
    next: "Convert conditional support into closed, delivered projects",
    source: "https://www.whitehouse.gov/presidential-actions/2025/05/reinvigorating-the-nuclear-industrial-base/",
  },
];

export const programs = [
  {
    name: "Reactor Pilot Program",
    lead: "DOE Office of Nuclear Energy",
    purpose: "DOE authorization for privately funded test reactors outside national laboratories.",
    measure: "11 initial projects; at least 3 targeted criticalities by July 4, 2026",
    status: "Two zero-power criticalities reported by June 18, 2026",
    source: "https://www.energy.gov/ne/us-department-energy-reactor-pilot-program",
  },
  {
    name: "Advanced Reactor Demonstration Program",
    lead: "DOE Office of Clean Energy Demonstrations",
    purpose: "Cost-shared commercial demonstrations of Natrium and Xe-100 technologies.",
    measure: "$3.2B planned federal investment over seven years, subject to appropriations, with matching industry funds",
    status: "Natrium permitted and under construction; Long Mott license review active",
    source: "https://www.energy.gov/ne/advanced-reactor-demonstration-projects",
  },
  {
    name: "DOME",
    lead: "NRIC / Idaho National Laboratory",
    purpose: "A test bed for fueled microreactor experiments.",
    measure: "Two initial conditional test selections",
    status: "Facility opened in April 2026",
    source: "https://www.energy.gov/ne/demonstration-microreactor-experiments-dome",
  },
];

export const capital = [
  {
    amount: "$17.5B",
    name: "American Nuclear Supply Chain Loans",
    type: "Conditional federal loan commitment",
    status: "Conditional · not closed",
    date: "2026-06-23",
    purpose: "Long-lead items for five eligible projects tied to ten large reactors",
    source: "https://www.energy.gov/articles/department-energy-announces-american-nuclear-supply-chain-loans",
  },
  {
    amount: "$1.52B",
    name: "Palisades restart loan",
    type: "Closed federal loan",
    status: "Closed · licensing conditions remain",
    date: "2024-09",
    purpose: "Restoration and resumption of service at the 800 MWe Palisades plant",
    source: "https://www.energy.gov/edf/palisades",
  },
  {
    amount: "$3.2B",
    name: "ARDP planned federal cost share",
    type: "Cost-shared demonstration funding",
    status: "Subject to appropriations",
    date: "2020-10",
    purpose: "Natrium and Xe-100 demonstrations, matched by industry partners",
    source: "https://www.energy.gov/ne/articles/us-department-energy-announces-160-million-first-awards-under-advanced-reactor",
  },
];

export const technologies = [
  {
    name: "Sodium fast reactor",
    size: "Hundreds of MWe",
    fuel: "HALEU metal fuel",
    proof: "Licensed construction → operating license → full-power operation",
  },
  {
    name: "High-temperature gas reactor",
    size: "Microreactor to 80 MWe/module",
    fuel: "TRISO particle fuel",
    proof: "Fuel fabrication at scale plus commercial heat-and-power operation",
  },
  {
    name: "Fluoride salt-cooled reactor",
    size: "Test reactor to commercial module",
    fuel: "TRISO pebbles",
    proof: "Hermes test data followed by licensed power-reactor operation",
  },
];

export function stageCounts() {
  return stages.map((stage, index) => ({
    ...stage,
    stage: index + 1,
    count: projects.filter((project) => project.stage === index + 1).length,
    companies: projects
      .filter((project) => project.stage === index + 1)
      .map((project) => companies.find((company) => company.slug === project.companySlug))
      .filter((company): company is Company => Boolean(company)),
  }));
}

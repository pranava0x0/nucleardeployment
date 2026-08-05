export type Verification = "Verified" | "Government-reported" | "Company-reported";
export type GenerationClass = "Gen II" | "Gen III+" | "Gen IV" | "Experimental / unclassified";
export type ScaleClass = "Large reactor" | "SMR" | "Microreactor" | "Test reactor" | "Critical experiment";
export type ReactorFamily = "LWR · PWR" | "LWR · BWR" | "LWR · design TBD" | "HTGR" | "SFR" | "FHR" | "MSR" | "Heat-pipe" | "Design TBD";
export type ReactorRole = "Commercial power" | "Demonstration power" | "Research / test" | "Critical experiment" | "Site envelope";

export type Project = {
  slug: string;
  name: string;
  developer: string;
  companySlug: string;
  location: string;
  region: string;
  technology: string;
  generation: GenerationClass;
  scale: ScaleClass;
  family: ReactorFamily;
  reactorRole: ReactorRole;
  capacity: string;
  stage: number;
  stageLabel: string;
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
  programs: string[];
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
    generation: "Gen IV",
    scale: "Large reactor",
    family: "SFR",
    reactorRole: "Demonstration power",
    capacity: "345 MWe + storage",
    stage: 6,
    stageLabel: "Physical deployment",
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
    programs: ["ARDP demonstration"],
  },
  {
    slug: "hermes-2",
    name: "Hermes 2",
    developer: "Kairos Power",
    companySlug: "kairos-power",
    location: "Oak Ridge, Tennessee",
    region: "South",
    technology: "Fluoride salt-cooled high-temperature reactor",
    generation: "Gen IV",
    scale: "Test reactor",
    family: "FHR",
    reactorRole: "Research / test",
    capacity: "Two low-power test reactors",
    stage: 6,
    stageLabel: "Physical deployment",
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
    programs: ["ARDP risk reduction"],
  },
  {
    slug: "long-mott-xe-100",
    name: "Long Mott · Xe-100",
    developer: "Long Mott Energy / X-energy / Dow",
    companySlug: "x-energy",
    location: "Calhoun County, Texas",
    region: "South",
    technology: "High-temperature gas-cooled reactor",
    generation: "Gen IV",
    scale: "SMR",
    family: "HTGR",
    reactorRole: "Demonstration power",
    capacity: "4 × 80 MWe + process heat",
    stage: 3,
    stageLabel: "Development commitment",
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
    programs: ["ARDP demonstration"],
  },
  {
    slug: "project-pele",
    name: "Project Pele",
    developer: "U.S. Department of Defense / BWXT",
    companySlug: "bwxt",
    location: "Idaho National Laboratory",
    region: "West",
    technology: "Transportable high-temperature gas reactor",
    generation: "Gen IV",
    scale: "Microreactor",
    family: "HTGR",
    reactorRole: "Demonstration power",
    capacity: "1–5 MWe",
    stage: 6,
    stageLabel: "Physical deployment",
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
    programs: ["Project Pele"],
  },
  {
    slug: "kaleidos-dome",
    name: "Kaleidos · DOME test",
    developer: "Radiant Industries / NRIC",
    companySlug: "radiant-industries",
    location: "Idaho National Laboratory",
    region: "West",
    technology: "Gas-cooled microreactor",
    generation: "Gen IV",
    scale: "Microreactor",
    family: "HTGR",
    reactorRole: "Research / test",
    capacity: "Experiment",
    stage: 3,
    stageLabel: "Development commitment",
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
    programs: ["DOME"],
  },
  {
    slug: "valar-ward-250",
    name: "Ward 250 critical experiment",
    developer: "Valar Atomics",
    companySlug: "valar-atomics",
    location: "Emery County, Utah",
    region: "West",
    technology: "Zero-power critical experiment",
    generation: "Experimental / unclassified",
    scale: "Critical experiment",
    family: "Design TBD",
    reactorRole: "Critical experiment",
    capacity: "No electricity generation",
    stage: 7,
    stageLabel: "Operational progress",
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
    programs: ["Reactor Pilot Program"],
  },
  {
    slug: "aalo-x-critical-assembly",
    name: "Aalo Critical Test Reactor",
    developer: "Aalo Atomics",
    companySlug: "aalo-atomics",
    location: "Idaho National Laboratory",
    region: "West",
    technology: "Sodium-cooled zero-power critical reactor",
    generation: "Gen IV",
    scale: "Critical experiment",
    family: "SFR",
    reactorRole: "Critical experiment",
    capacity: "No electricity generation",
    stage: 7,
    stageLabel: "Operational progress",
    status: "Initial criticality achieved",
    summary: "A full-scale zero-power core under DOE authorization; it validates reactor physics and systems but does not generate electricity.",
    latest: "DOE reported that Aalo-X completed a zero-power fueled criticality demonstration early on July 4.",
    latestDate: "2026-07",
    next: "Build, license, fuel, and operate the separate 10 MWe Project Ascension reactor before claiming power deployment.",
    nextOwner: "Aalo Atomics, DOE, and NRC",
    blocker: "Power-reactor construction, NRC licensing, fuel, and commercial operation",
    confidence: "High",
    verification: "Government-reported",
    source: "https://www.energy.gov/articles/department-energy-celebrates-fourth-criticality-ahead-july-4th-goal",
    sourceLabel: "DOE fourth-criticality announcement",
    programs: ["Reactor Pilot Program"],
  },
  {
    slug: "antares-mark-0",
    name: "Antares R1 Mark-0",
    developer: "Antares Nuclear",
    companySlug: "antares-nuclear",
    location: "Idaho National Laboratory",
    region: "West",
    technology: "High-temperature heat-pipe microreactor experiment",
    generation: "Gen IV",
    scale: "Critical experiment",
    family: "Heat-pipe",
    reactorRole: "Critical experiment",
    capacity: "Zero-power critical experiment",
    stage: 7,
    stageLabel: "Operational progress",
    status: "Initial criticality achieved",
    summary: "A zero-power fueled experiment that validates reactor physics but does not generate electricity.",
    latest: "DOE reported that the Mark-0 completed zero-power fueled criticality at Idaho National Laboratory.",
    latestDate: "2026-06",
    next: "Complete further testing and establish the NRC licensing and customer pathway for a power-producing reactor.",
    nextOwner: "Antares Nuclear",
    blocker: "Powered demonstration, NRC licensing, fuel, and commercial project execution",
    confidence: "High",
    verification: "Government-reported",
    source: "https://www.energy.gov/articles/department-energy-celebrates-first-advanced-reactor-criticality",
    sourceLabel: "DOE criticality announcement",
    programs: ["Reactor Pilot Program"],
  },
  {
    slug: "atomic-alchemy-groves",
    name: "Groves pilot reactor",
    developer: "Atomic Alchemy",
    companySlug: "atomic-alchemy",
    location: "Caldwell County, Texas",
    region: "South",
    technology: "Test and isotope-production reactor",
    generation: "Experimental / unclassified",
    scale: "Test reactor",
    family: "Design TBD",
    reactorRole: "Research / test",
    capacity: "Not disclosed by DOE",
    stage: 3,
    stageLabel: "Development commitment",
    status: "DOE pilot development",
    summary: "Atomic Alchemy's privately funded Groves project under DOE's Reactor Pilot Program pathway.",
    latest: "A DOE variance package identified the Groves project and its 40-acre Caldwell County site.",
    latestDate: "2026-01",
    next: "Complete the DOE safety basis, authorization, construction, and fuel-readiness gates before operation.",
    nextOwner: "Atomic Alchemy and DOE Idaho Operations",
    blocker: "DOE authorization, construction, and fuel readiness",
    confidence: "Medium",
    verification: "Government-reported",
    source: "https://www.energy.gov/sites/default/files/2026-04/NE_10CFR851_VariancePackage_Final_05JAN2026.pdf",
    sourceLabel: "DOE contractor variance package",
    programs: ["Reactor Pilot Program"],
  },
  {
    slug: "deep-fission-dbr",
    name: "Deep Fission DBR pilot",
    developer: "Deep Fission",
    companySlug: "deep-fission",
    location: "Site not disclosed by DOE",
    region: "Undisclosed",
    technology: "Deep-borehole reactor",
    generation: "Experimental / unclassified",
    scale: "Microreactor",
    family: "LWR · PWR",
    reactorRole: "Research / test",
    capacity: "Not disclosed by DOE",
    stage: 3,
    stageLabel: "Development commitment",
    status: "DOE pilot development",
    summary: "A DBR test-reactor project selected for DOE's Reactor Pilot Program; DOE has not published its site in the cited record.",
    latest: "DOE identified the DBR reactor in its advanced-reactor contractor variance package without publishing a site.",
    latestDate: "2026-01",
    next: "Disclose and authorize a site, complete the safety basis, and demonstrate construction and fuel readiness.",
    nextOwner: "Deep Fission and DOE Idaho Operations",
    blocker: "Site disclosure, DOE authorization, construction method, and fuel",
    confidence: "Low",
    verification: "Government-reported",
    source: "https://www.energy.gov/sites/default/files/2026-04/NE_10CFR851_VariancePackage_Final_05JAN2026.pdf",
    sourceLabel: "DOE contractor variance package",
    programs: ["Reactor Pilot Program"],
  },
  {
    slug: "last-energy-pwr-5",
    name: "PWR-5 pilot reactor",
    developer: "Last Energy",
    companySlug: "last-energy",
    location: "Texas A&M RELLIS Campus, Texas",
    region: "South",
    technology: "Small pressurized-water reactor",
    generation: "Gen III+",
    scale: "Microreactor",
    family: "LWR · PWR",
    reactorRole: "Research / test",
    capacity: "Not disclosed by DOE",
    stage: 3,
    stageLabel: "Development commitment",
    status: "DOE pilot development",
    summary: "Last Energy's PWR-5 test project at the Texas A&M RELLIS campus under the DOE pilot pathway.",
    latest: "DOE identified PWR-5 and the Texas A&M RELLIS campus in its contractor variance package.",
    latestDate: "2026-01",
    next: "Complete site authorization, safety analysis, construction, and operating readiness under DOE oversight.",
    nextOwner: "Last Energy and DOE Idaho Operations",
    blocker: "DOE authorization, construction readiness, and fuel",
    confidence: "Medium",
    verification: "Government-reported",
    source: "https://www.energy.gov/sites/default/files/2026-04/NE_10CFR851_VariancePackage_Final_05JAN2026.pdf",
    sourceLabel: "DOE contractor variance package",
    programs: ["Reactor Pilot Program"],
  },
  {
    slug: "oklo-aurora-pilot",
    name: "Aurora pilot reactor",
    developer: "Oklo",
    companySlug: "oklo",
    location: "Idaho National Laboratory",
    region: "West",
    technology: "Fast microreactor",
    generation: "Gen IV",
    scale: "Microreactor",
    family: "SFR",
    reactorRole: "Research / test",
    capacity: "Not disclosed for pilot",
    stage: 3,
    stageLabel: "Development commitment",
    status: "DOE pilot development",
    summary: "One of two Oklo projects selected through DOE's Reactor Pilot Program.",
    latest: "DOE identified the Aurora reactor at Idaho National Laboratory in its contractor variance package.",
    latestDate: "2026-01",
    next: "Complete DOE authorization, site work, construction, fuel readiness, and critical testing.",
    nextOwner: "Oklo and DOE Idaho Operations",
    blocker: "DOE authorization, fuel fabrication, construction, and test readiness",
    confidence: "Medium",
    verification: "Government-reported",
    source: "https://www.energy.gov/sites/default/files/2026-04/NE_10CFR851_VariancePackage_Final_05JAN2026.pdf",
    sourceLabel: "DOE contractor variance package",
    programs: ["Reactor Pilot Program"],
  },
  {
    slug: "oklo-pluto-pilot",
    name: "Pluto pilot reactor",
    developer: "Oklo",
    companySlug: "oklo",
    location: "Savannah River Site, South Carolina",
    region: "South",
    technology: "Fast test reactor",
    generation: "Gen IV",
    scale: "Test reactor",
    family: "SFR",
    reactorRole: "Research / test",
    capacity: "Not disclosed for pilot",
    stage: 3,
    stageLabel: "Development commitment",
    status: "DOE pilot development",
    summary: "Oklo's second DOE pilot project, paired with an advanced-fuels facility near Savannah River National Laboratory.",
    latest: "DOE identified the Pluto reactor and Advanced Fuels Foundry location in its contractor variance package.",
    latestDate: "2026-01",
    next: "Complete DOE authorization, fuel-facility integration, construction, and critical-test readiness.",
    nextOwner: "Oklo and DOE Idaho Operations",
    blocker: "DOE authorization, fuel facility, construction, and test readiness",
    confidence: "Medium",
    verification: "Government-reported",
    source: "https://www.energy.gov/sites/default/files/2026-04/NE_10CFR851_VariancePackage_Final_05JAN2026.pdf",
    sourceLabel: "DOE contractor variance package",
    programs: ["Reactor Pilot Program"],
  },
  {
    slug: "natura-acu-pilot",
    name: "Natura pilot · ACU",
    developer: "Natura Resources / Abilene Christian University",
    companySlug: "natura-resources",
    location: "Abilene Christian University, Texas",
    region: "South",
    technology: "Molten-salt research reactor",
    generation: "Gen IV",
    scale: "Test reactor",
    family: "MSR",
    reactorRole: "Research / test",
    capacity: "Research reactor; output not disclosed",
    stage: 3,
    stageLabel: "Development commitment",
    status: "DOE pilot development",
    summary: "Natura Resources' university-based test-reactor project in DOE's Reactor Pilot Program.",
    latest: "DOE identified Abilene Christian University as the project site in its contractor variance package.",
    latestDate: "2026-01",
    next: "Complete the DOE authorization basis, site work, construction, fuel loading, and operating readiness.",
    nextOwner: "Natura Resources, ACU, and DOE Idaho Operations",
    blocker: "DOE authorization, university-site execution, and fuel",
    confidence: "Medium",
    verification: "Government-reported",
    source: "https://www.energy.gov/sites/default/files/2026-04/NE_10CFR851_VariancePackage_Final_05JAN2026.pdf",
    sourceLabel: "DOE contractor variance package",
    programs: ["Reactor Pilot Program"],
  },
  {
    slug: "radiant-kaleidos-ripper-pilot",
    name: "Kaleidos + RiPPer pilot",
    developer: "Radiant Industries",
    companySlug: "radiant-industries",
    location: "Idaho National Laboratory",
    region: "West",
    technology: "Gas-cooled microreactor experiments",
    generation: "Gen IV",
    scale: "Microreactor",
    family: "HTGR",
    reactorRole: "Research / test",
    capacity: "Two test reactors; output not disclosed",
    stage: 3,
    stageLabel: "Development commitment",
    status: "DOE pilot development",
    summary: "Radiant's DOE pilot project covers the Kaleidos and RiPPer test reactors at Idaho National Laboratory.",
    latest: "DOE identified both reactors and their INL site in its contractor variance package.",
    latestDate: "2026-01",
    next: "Complete DOE authorization and readiness gates for construction, fuel loading, and critical testing.",
    nextOwner: "Radiant Industries and DOE Idaho Operations",
    blocker: "DOE authorization, test-bed sequencing, construction, and fuel",
    confidence: "Medium",
    verification: "Government-reported",
    source: "https://www.energy.gov/sites/default/files/2026-04/NE_10CFR851_VariancePackage_Final_05JAN2026.pdf",
    sourceLabel: "DOE contractor variance package",
    programs: ["Reactor Pilot Program"],
  },
  {
    slug: "terrestrial-tetra-1",
    name: "TETRA-1 pilot reactor",
    developer: "Terrestrial Energy",
    companySlug: "terrestrial-energy",
    location: "Texas A&M RELLIS Campus, Texas",
    region: "South",
    technology: "Molten-salt test reactor",
    generation: "Gen IV",
    scale: "Test reactor",
    family: "MSR",
    reactorRole: "Research / test",
    capacity: "Not disclosed by DOE",
    stage: 3,
    stageLabel: "Development commitment",
    status: "DOE pilot development",
    summary: "Terrestrial Energy's TETRA-1 test project under the DOE Reactor Pilot Program pathway.",
    latest: "DOE identified TETRA-1 and the Texas A&M RELLIS campus in its contractor variance package.",
    latestDate: "2026-01",
    next: "Complete DOE authorization, site work, fuel preparation, construction, and critical-test readiness.",
    nextOwner: "Terrestrial Energy and DOE Idaho Operations",
    blocker: "DOE authorization, fuel-salt preparation, construction, and testing",
    confidence: "Medium",
    verification: "Government-reported",
    source: "https://www.energy.gov/sites/default/files/2026-04/NE_10CFR851_VariancePackage_Final_05JAN2026.pdf",
    sourceLabel: "DOE contractor variance package",
    programs: ["Reactor Pilot Program"],
  },
  {
    slug: "deployable-unity",
    name: "Unity critical experiment",
    developer: "Deployable Energy",
    companySlug: "deployable-energy",
    location: "Idaho National Laboratory",
    region: "West",
    technology: "Zero-power microreactor experiment",
    generation: "Experimental / unclassified",
    scale: "Critical experiment",
    family: "Design TBD",
    reactorRole: "Critical experiment",
    capacity: "No electricity generation",
    stage: 7,
    stageLabel: "Operational progress",
    status: "Initial criticality achieved",
    summary: "A zero-power experiment authorized through NRIC's Nuclear Energy Launch Pad; it is not a power-producing reactor.",
    latest: "DOE reported that Unity achieved initial criticality at about 11:55 p.m. Mountain Time on June 30, fulfilling the three-reactor July 4 target.",
    latestDate: "2026-07",
    next: "Translate the experiment into a licensed power design, customer project, fuel plan, and repeatable commercial delivery process.",
    nextOwner: "Deployable Energy, DOE, and NRC",
    blocker: "Power design, NRC licensing, fuel, customer project, and commercialization",
    confidence: "High",
    verification: "Government-reported",
    source: "https://www.energy.gov/articles/us-department-energy-meets-president-trumps-goal-delivers-third-advanced-reactor",
    sourceLabel: "DOE third-criticality announcement",
    programs: ["Nuclear Energy Launch Pad"],
  },
  {
    slug: "tamu-rellis-site",
    name: "RELLIS advanced-reactor site",
    developer: "Texas A&M University System",
    companySlug: "texas-am-system",
    location: "Bryan, Texas",
    region: "South",
    technology: "Multi-reactor site envelope; designs not selected",
    generation: "Experimental / unclassified",
    scale: "Test reactor",
    family: "Design TBD",
    reactorRole: "Site envelope",
    capacity: "10–1,000 MWe site envelope",
    stage: 2,
    stageLabel: "Preliminary commitment",
    status: "NRC pre-application engagement",
    summary: "A proposed university site intended to host multiple advanced-reactor projects; no single commercial design is selected.",
    latest: "NRC lists an active pre-application engagement for a future early site permit at the RELLIS campus.",
    latestDate: "2026-02",
    next: "Select the site envelope and reactor assumptions, then submit a complete early site permit application.",
    nextOwner: "Texas A&M University System and NRC",
    blocker: "Design envelope, application submittal, site review, and project customers",
    confidence: "Medium",
    verification: "Verified",
    source: "https://www.nrc.gov/reactors/new-reactors/advanced/who-were-working-with/pre-application-activities/texas-am-system",
    sourceLabel: "NRC pre-application record",
    programs: ["NRC pre-application"],
  },
  {
    slug: "clinch-river-bwrx-300",
    name: "Clinch River · BWRX-300",
    developer: "Tennessee Valley Authority / GE Vernova Hitachi",
    companySlug: "tva",
    location: "Oak Ridge, Tennessee",
    region: "South",
    technology: "Advanced light-water boiling-water reactor",
    generation: "Gen III+",
    scale: "SMR",
    family: "LWR · BWR",
    reactorRole: "Commercial power",
    capacity: "300 MWe",
    stage: 3,
    stageLabel: "Development commitment",
    status: "Construction-permit review",
    summary: "TVA's utility-led BWRX-300 project at the already permitted Clinch River site.",
    latest: "NRC accepted TVA's construction-permit application for a full safety review.",
    latestDate: "2025-07",
    next: "Complete NRC safety review and obtain the construction permit before nuclear construction.",
    nextOwner: "TVA and NRC",
    blocker: "Construction-permit decision, final design, supply chain, and project finance",
    confidence: "High",
    verification: "Verified",
    source: "https://www.energy.gov/ne/articles/nrc-dockets-construction-permit-application-tva-small-modular-reactor",
    sourceLabel: "DOE summary of NRC docketing",
    programs: ["Gen III+ SMR Pathway", "NRC construction-permit review"],
  },
  {
    slug: "palisades-pioneer-smr-300",
    name: "Pioneer Units 1 & 2 · SMR-300",
    developer: "Palisades SMR / Holtec International",
    companySlug: "holtec",
    location: "Covert, Michigan",
    region: "Midwest",
    technology: "Advanced light-water pressurized-water reactor",
    generation: "Gen III+",
    scale: "SMR",
    family: "LWR · PWR",
    reactorRole: "Commercial power",
    capacity: "2 × 300 MWe",
    stage: 3,
    stageLabel: "Development commitment",
    status: "Phased permit review",
    summary: "A proposed two-unit SMR-300 plant adjacent to the existing Palisades reactor.",
    latest: "NRC accepted Part 1 of the phased construction-permit application, including a limited-work request, for detailed review.",
    latestDate: "2026-02",
    next: "Obtain the limited-work authorization and complete the remaining construction-permit application and reviews.",
    nextOwner: "Palisades SMR and NRC",
    blocker: "NRC review, remaining application sections, supply chain, and execution",
    confidence: "High",
    verification: "Verified",
    source: "https://www.nrc.gov/reactors/new-reactors/advanced/who-were-working-with/applicant-projects/pioneer",
    sourceLabel: "NRC Pioneer application record",
    programs: ["Gen III+ SMR Pathway", "NRC construction-permit review"],
  },
  {
    slug: "evinci-dome",
    name: "eVinci DOME experiment",
    developer: "Westinghouse",
    companySlug: "westinghouse",
    location: "Idaho National Laboratory",
    region: "West",
    technology: "Heat-pipe microreactor experiment",
    generation: "Experimental / unclassified",
    scale: "Microreactor",
    family: "Heat-pipe",
    reactorRole: "Research / test",
    capacity: "Up to 20 MWt in DOME",
    stage: 3,
    stageLabel: "Development commitment",
    status: "Conditional DOME selection",
    summary: "A fueled eVinci test reactor selected for the DOME microreactor test bed.",
    latest: "DOE conditionally selected Westinghouse for a self-funded eVinci experiment in DOME.",
    latestDate: "2025-07",
    next: "Complete DOE authorization, experiment fabrication, fuel readiness, and DOME scheduling.",
    nextOwner: "Westinghouse, NRIC, and DOE",
    blocker: "Authorization, fuel, experiment readiness, and test-bed sequencing",
    confidence: "Medium",
    verification: "Government-reported",
    source: "https://www.energy.gov/ne/articles/energy-department-announces-first-microreactor-experiments-dome-test-bed",
    sourceLabel: "DOE DOME selection",
    programs: ["DOME"],
  },
  {
    slug: "uiuc-kronos",
    name: "UIUC · KRONOS MMR",
    developer: "University of Illinois / NANO Nuclear Energy",
    companySlug: "nano-nuclear",
    location: "Champaign County, Illinois",
    region: "Midwest",
    technology: "High-temperature gas-cooled research reactor",
    generation: "Experimental / unclassified",
    scale: "Microreactor",
    family: "HTGR",
    reactorRole: "Research / test",
    capacity: "Non-power research reactor",
    stage: 3,
    stageLabel: "Development commitment",
    status: "Construction-permit application",
    summary: "A university research reactor based on NANO Nuclear Energy's KRONOS technology.",
    latest: "UIUC submitted a construction-permit application and NRC opened its project record.",
    latestDate: "2026-03",
    next: "Pass NRC acceptance and technical review, then obtain a construction permit.",
    nextOwner: "University of Illinois, NANO Nuclear Energy, and NRC",
    blocker: "Application review, design maturity, fuel, university execution, and later operating authorization",
    confidence: "High",
    verification: "Verified",
    source: "https://www.nrc.gov/reactors/new-reactors/advanced/who-were-working-with/applicant-projects/kronos",
    sourceLabel: "NRC KRONOS application record",
    programs: ["NRC research-reactor licensing"],
  },
  {
    slug: "belews-creek-esp",
    name: "Belews Creek early site permit",
    developer: "Duke Energy",
    companySlug: "duke-energy",
    location: "Stokes County, North Carolina",
    region: "South",
    technology: "Advanced-reactor site envelope; design not selected",
    generation: "Experimental / unclassified",
    scale: "SMR",
    family: "Design TBD",
    reactorRole: "Site envelope",
    capacity: "Not selected",
    stage: 3,
    stageLabel: "Development commitment",
    status: "Early site permit review",
    summary: "A coal-site transition candidate under NRC review for future advanced nuclear development.",
    latest: "NRC accepted and docketed Duke Energy's early site permit application for detailed review.",
    latestDate: "2026-02",
    next: "Complete NRC safety and environmental reviews and obtain the early site permit.",
    nextOwner: "Duke Energy and NRC",
    blocker: "Site-permit decision, reactor selection, commercial commitment, and later construction licensing",
    confidence: "High",
    verification: "Verified",
    source: "https://www.nrc.gov/reactors/new-reactors/advanced/who-were-working-with/applicant-projects/dukeenergy",
    sourceLabel: "NRC Belews Creek application record",
    programs: ["NRC early site permit"],
  },
  {
    slug: "constellation-new-york-smr-site",
    name: "New York Gen III+ SMR siting",
    developer: "Constellation SMR Development",
    companySlug: "constellation",
    location: "New York; site not yet public",
    region: "Northeast",
    technology: "Advanced light-water SMR; design not selected",
    generation: "Gen III+",
    scale: "SMR",
    family: "LWR · design TBD",
    reactorRole: "Site envelope",
    capacity: "Not selected",
    stage: 4,
    stageLabel: "Contractual commitment",
    status: "Federal siting award selected",
    summary: "A DOE-backed effort to pursue an NRC early site permit for a future New York SMR project.",
    latest: "DOE selected Constellation for a $17.26 million cost-shared site-preparation award.",
    latestDate: "2026-05",
    next: "Name the site and design, execute the award, and submit a complete NRC early site permit application.",
    nextOwner: "Constellation SMR Development and DOE",
    blocker: "Award execution, site disclosure, design selection, and NRC application",
    confidence: "Medium",
    verification: "Government-reported",
    source: "https://www.energy.gov/articles/energy-department-awards-94-million-american-companies-help-expedite-deployments-small",
    sourceLabel: "DOE Gen III+ SMR award selection",
    programs: ["Gen III+ SMR Pathway"],
  },
  {
    slug: "nppd-nebraska-smr-site",
    name: "Nebraska Gen III+ SMR siting",
    developer: "Nebraska Public Power District",
    companySlug: "nppd",
    location: "Nebraska; site not yet public",
    region: "Midwest",
    technology: "Advanced light-water SMR; design not selected",
    generation: "Gen III+",
    scale: "SMR",
    family: "LWR · design TBD",
    reactorRole: "Site envelope",
    capacity: "Not selected",
    stage: 4,
    stageLabel: "Contractual commitment",
    status: "Federal siting award selected",
    summary: "A DOE-backed effort to obtain an NRC early site permit for future Nebraska SMR deployment.",
    latest: "DOE selected NPPD for a $27.86 million cost-shared site-preparation award.",
    latestDate: "2026-05",
    next: "Name the site and design, execute the award, and submit a complete NRC early site permit application.",
    nextOwner: "Nebraska Public Power District and DOE",
    blocker: "Award execution, site disclosure, design selection, and NRC application",
    confidence: "Medium",
    verification: "Government-reported",
    source: "https://www.energy.gov/articles/energy-department-awards-94-million-american-companies-help-expedite-deployments-small",
    sourceLabel: "DOE Gen III+ SMR award selection",
    programs: ["Gen III+ SMR Pathway"],
  },
  {
    slug: "crane-restart",
    name: "Crane Clean Energy Center restart",
    developer: "Constellation Energy",
    companySlug: "constellation",
    location: "Londonderry Township, Pennsylvania",
    region: "Northeast",
    technology: "Existing pressurized-water reactor restart",
    generation: "Gen II",
    scale: "Large reactor",
    family: "LWR · PWR",
    reactorRole: "Commercial power",
    capacity: "835 MWe",
    stage: 5,
    stageLabel: "Regulatory and financial readiness",
    status: "Finance closed; licensing active",
    summary: "The former Three Mile Island Unit 1 is being restored for a proposed return to commercial service.",
    latest: "DOE closed a $1 billion restart loan while NRC continued licensing reviews and restart inspections.",
    latestDate: "2026-06",
    next: "Complete NRC licensing actions, restore plant systems, pass restart inspections, and receive approval to resume power operations.",
    nextOwner: "Constellation Energy and NRC",
    blocker: "NRC approvals, component restoration, inspections, and startup execution",
    confidence: "High",
    verification: "Verified",
    source: "https://www.nrc.gov/info-finder/reactors/ccec",
    sourceLabel: "NRC Crane restart record",
    programs: ["DOE Energy Dominance Financing", "NRC restart review"],
  },
  {
    slug: "mcre-lotus",
    name: "Molten Chloride Reactor Experiment",
    developer: "Southern Company / TerraPower / Idaho National Laboratory",
    companySlug: "terrapower",
    location: "Idaho National Laboratory",
    region: "West",
    technology: "Fast-spectrum molten-chloride reactor experiment",
    generation: "Gen IV",
    scale: "Test reactor",
    family: "MSR",
    reactorRole: "Research / test",
    capacity: "Non-power experiment",
    stage: 6,
    stageLabel: "Physical deployment",
    status: "Fuel production underway",
    summary: "A fast-spectrum, salt-fueled experiment intended to inform commercial molten-chloride reactor deployment.",
    latest: "INL produced the first of an expected 72–75 fuel-salt batches required for criticality.",
    latestDate: "2025-12",
    next: "Complete fuel production, install the experiment in LOTUS, obtain authorization, and begin the planned test campaign.",
    nextOwner: "INL, Southern Company, TerraPower, and DOE",
    blocker: "Fuel-salt production, facility integration, authorization, and 2028 test readiness",
    confidence: "High",
    verification: "Government-reported",
    source: "https://www.energy.gov/ne/articles/idaho-national-lab-creates-first-batch-fuel-worlds-first-fast-spectrum-molten-salt",
    sourceLabel: "DOE MCRE fuel milestone",
    programs: ["MCRE", "LOTUS"],
  },
  {
    slug: "vogtle-3-4",
    name: "Vogtle Units 3 & 4",
    developer: "Georgia Power / Southern Nuclear / Westinghouse",
    companySlug: "georgia-power",
    location: "Waynesboro, Georgia",
    region: "South",
    technology: "Two-unit AP1000 pressurized-water deployment",
    generation: "Gen III+",
    scale: "Large reactor",
    family: "LWR · PWR",
    reactorRole: "Commercial power",
    capacity: "2,234 MWe total",
    stage: 8,
    stageLabel: "Replication and scale",
    status: "Two repeat units in commercial operation",
    summary: "The first two U.S. AP1000 units, delivered sequentially at one site and now operating commercially.",
    latest: "Unit 4 entered commercial operation after Unit 3, completing the two-unit AP1000 expansion.",
    latestDate: "2024-04",
    next: "Translate the completed two-unit delivery into repeat AP1000 orders with demonstrated cost and schedule learning.",
    nextOwner: "Westinghouse, U.S. utilities, owners, and suppliers",
    blocker: "New binding orders, finance, supply-chain cadence, and repeat delivery economics",
    confidence: "High",
    verification: "Company-reported",
    source: "https://www.georgiapower.com/news-hub/press-releases/vogtle-unit-4-enters-commercial-operation.html",
    sourceLabel: "Georgia Power commercial-operation record",
    programs: ["Commercial AP1000 deployment"],
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
    projectSlugs: ["natrium-kemmerer", "mcre-lotus"],
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
    projectSlugs: ["kaleidos-dome", "radiant-kaleidos-ripper-pilot"],
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
  {
    slug: "aalo-atomics",
    name: "Aalo Atomics",
    role: "Reactor developer and DOE-authorized operator",
    summary: "Developer of the Aalo Critical Test Reactor and the planned 10 MWe Project Ascension power reactor.",
    technology: "Sodium-cooled modular reactor",
    projectSlugs: ["aalo-x-critical-assembly"],
    source: "https://www.energy.gov/articles/department-energy-celebrates-fourth-criticality-ahead-july-4th-goal",
    sourceLabel: "DOE fourth-criticality announcement",
  },
  {
    slug: "antares-nuclear",
    name: "Antares Nuclear",
    role: "Microreactor developer",
    summary: "Developer of the Mark-0 zero-power experiment, the first Reactor Pilot Program project to report criticality.",
    technology: "High-temperature heat-pipe microreactor",
    projectSlugs: ["antares-mark-0"],
    source: "https://www.energy.gov/articles/department-energy-celebrates-first-advanced-reactor-criticality",
    sourceLabel: "DOE criticality announcement",
  },
  {
    slug: "atomic-alchemy",
    name: "Atomic Alchemy",
    role: "Reactor and isotope-production developer",
    summary: "Developer of the Groves pilot project in Caldwell County, Texas.",
    technology: "Test and isotope-production reactor",
    projectSlugs: ["atomic-alchemy-groves"],
    source: "https://www.energy.gov/ne/us-department-energy-reactor-pilot-program",
    sourceLabel: "DOE Reactor Pilot Program roster",
  },
  {
    slug: "deep-fission",
    name: "Deep Fission",
    role: "Reactor developer",
    summary: "Developer of a deep-borehole test reactor selected for DOE's pilot pathway.",
    technology: "Deep-borehole reactor",
    projectSlugs: ["deep-fission-dbr"],
    source: "https://www.energy.gov/ne/us-department-energy-reactor-pilot-program",
    sourceLabel: "DOE Reactor Pilot Program roster",
  },
  {
    slug: "last-energy",
    name: "Last Energy",
    role: "Microreactor developer",
    summary: "Developer of the PWR-5 pilot project at Texas A&M's RELLIS campus.",
    technology: "Small pressurized-water reactor",
    projectSlugs: ["last-energy-pwr-5"],
    source: "https://www.energy.gov/ne/us-department-energy-reactor-pilot-program",
    sourceLabel: "DOE Reactor Pilot Program roster",
  },
  {
    slug: "oklo",
    name: "Oklo",
    role: "Fast-reactor and fuel-cycle developer",
    summary: "Developer of the Aurora and Pluto pilot projects selected by DOE.",
    technology: "Fast microreactors",
    projectSlugs: ["oklo-aurora-pilot", "oklo-pluto-pilot"],
    source: "https://www.energy.gov/ne/us-department-energy-reactor-pilot-program",
    sourceLabel: "DOE Reactor Pilot Program roster",
  },
  {
    slug: "natura-resources",
    name: "Natura Resources",
    role: "Molten-salt reactor developer",
    summary: "Developer of the university-based pilot project at Abilene Christian University.",
    technology: "Molten-salt research reactor",
    projectSlugs: ["natura-acu-pilot"],
    source: "https://www.energy.gov/ne/us-department-energy-reactor-pilot-program",
    sourceLabel: "DOE Reactor Pilot Program roster",
  },
  {
    slug: "terrestrial-energy",
    name: "Terrestrial Energy",
    role: "Molten-salt reactor developer",
    summary: "Developer of the TETRA-1 pilot project at Texas A&M's RELLIS campus.",
    technology: "Molten-salt reactor",
    projectSlugs: ["terrestrial-tetra-1"],
    source: "https://www.energy.gov/ne/us-department-energy-reactor-pilot-program",
    sourceLabel: "DOE Reactor Pilot Program roster",
  },
  {
    slug: "deployable-energy",
    name: "Deployable Energy",
    role: "Microreactor developer",
    summary: "Developer of the Unity zero-power experiment authorized through NRIC's Nuclear Energy Launch Pad.",
    technology: "Microreactor experiment",
    projectSlugs: ["deployable-unity"],
    source: "https://www.energy.gov/articles/us-department-energy-meets-president-trumps-goal-delivers-third-advanced-reactor",
    sourceLabel: "DOE third-criticality announcement",
  },
  {
    slug: "texas-am-system",
    name: "Texas A&M University System",
    role: "Advanced-reactor site sponsor",
    summary: "Sponsor of the multi-reactor RELLIS campus site now in NRC pre-application engagement.",
    technology: "Multi-design advanced-reactor site",
    projectSlugs: ["tamu-rellis-site"],
    source: "https://www.nrc.gov/reactors/new-reactors/advanced/who-were-working-with/pre-application-activities/texas-am-system",
    sourceLabel: "NRC RELLIS pre-application record",
  },
  {
    slug: "tva",
    name: "Tennessee Valley Authority",
    role: "Utility developer and future operator",
    summary: "Applicant for the first U.S. utility-led BWRX-300 construction permit at Clinch River.",
    technology: "Gen III+ BWRX-300 SMR",
    projectSlugs: ["clinch-river-bwrx-300"],
    source: "https://www.energy.gov/ne/articles/nrc-dockets-construction-permit-application-tva-small-modular-reactor",
    sourceLabel: "DOE summary of NRC docketing",
  },
  {
    slug: "holtec",
    name: "Holtec International",
    role: "Reactor developer and project sponsor",
    summary: "Developer of the dual-unit Pioneer SMR-300 project at the Palisades Energy Center.",
    technology: "Gen III+ pressurized-water SMR",
    projectSlugs: ["palisades-pioneer-smr-300"],
    source: "https://www.nrc.gov/reactors/new-reactors/advanced/who-were-working-with/applicant-projects/pioneer",
    sourceLabel: "NRC Pioneer application record",
  },
  {
    slug: "westinghouse",
    name: "Westinghouse",
    role: "Reactor developer and equipment supplier",
    summary: "Developer of the eVinci DOME experiment and AP1000 technology delivered at Vogtle.",
    technology: "Heat-pipe microreactor and AP1000 PWR",
    projectSlugs: ["evinci-dome", "vogtle-3-4"],
    source: "https://www.energy.gov/ne/articles/energy-department-announces-first-microreactor-experiments-dome-test-bed",
    sourceLabel: "DOE DOME selection",
  },
  {
    slug: "nano-nuclear",
    name: "NANO Nuclear Energy",
    role: "Microreactor technology developer",
    summary: "Technology provider for the UIUC KRONOS research-reactor construction-permit application.",
    technology: "High-temperature gas-cooled microreactor",
    projectSlugs: ["uiuc-kronos"],
    source: "https://www.nrc.gov/reactors/new-reactors/advanced/who-were-working-with/applicant-projects/kronos",
    sourceLabel: "NRC KRONOS application record",
  },
  {
    slug: "duke-energy",
    name: "Duke Energy",
    role: "Utility site sponsor",
    summary: "Applicant for the Belews Creek early site permit in North Carolina.",
    technology: "Advanced-reactor site; design not selected",
    projectSlugs: ["belews-creek-esp"],
    source: "https://www.nrc.gov/reactors/new-reactors/advanced/who-were-working-with/applicant-projects/dukeenergy",
    sourceLabel: "NRC Belews Creek application record",
  },
  {
    slug: "constellation",
    name: "Constellation Energy",
    role: "Utility owner, restart sponsor, and site developer",
    summary: "Leads the Crane restart and a DOE-backed New York Gen III+ SMR siting effort.",
    technology: "Existing large PWR and future Gen III+ SMR",
    projectSlugs: ["constellation-new-york-smr-site", "crane-restart"],
    source: "https://www.nrc.gov/info-finder/reactors/ccec",
    sourceLabel: "NRC Crane restart record",
  },
  {
    slug: "nppd",
    name: "Nebraska Public Power District",
    role: "Public-power site developer",
    summary: "DOE-selected applicant for a future Nebraska Gen III+ SMR early site permit.",
    technology: "Gen III+ light-water SMR; design not selected",
    projectSlugs: ["nppd-nebraska-smr-site"],
    source: "https://www.energy.gov/articles/energy-department-awards-94-million-american-companies-help-expedite-deployments-small",
    sourceLabel: "DOE Gen III+ SMR award selection",
  },
  {
    slug: "georgia-power",
    name: "Georgia Power",
    role: "Utility owner and project sponsor",
    summary: "Largest owner of Vogtle Units 3 and 4, the first two U.S. AP1000 units in commercial operation.",
    technology: "Gen III+ AP1000 pressurized-water reactor",
    projectSlugs: ["vogtle-3-4"],
    source: "https://www.georgiapower.com/news-hub/press-releases/vogtle-unit-4-enters-commercial-operation.html",
    sourceLabel: "Georgia Power commercial-operation record",
  },
  {
    slug: "nuscale",
    name: "NuScale Power",
    role: "Reactor technology provider",
    summary: "Holds the only NRC-approved U.S. SMR design; ENTRA1 Energy is its exclusive commercial partner for plant development.",
    technology: "Integral pressurized-water SMR",
    projectSlugs: [],
    source: "https://www.energy.gov/ne/articles/nrc-approves-nuscale-powers-uprated-small-modular-reactor-design",
    sourceLabel: "DOE record of the 77 MWe design approval",
  },
  {
    slug: "gev-hitachi",
    name: "GE Vernova Hitachi",
    role: "Reactor technology provider",
    summary: "Developer of the BWRX-300, the design under NRC construction-permit review at TVA's Clinch River site and under construction at Darlington, Ontario.",
    technology: "Boiling-water SMR",
    projectSlugs: [],
    source: "https://www.federalregister.gov/documents/2026/07/07/2026-13662/tennessee-valley-authority-clinch-river-nuclear-site-unit-1-notice-of-hearing",
    sourceLabel: "NRC Clinch River hearing notice",
  },
];

export const federalActions = [
  {
    eo: "EO 14299",
    title: "National security deployment",
    directive: "Operate an Army-regulated reactor at a domestic military installation by September 30, 2028.",
    owner: "Department of Defense / Army",
    status: "In progress",
    next: "Select vendors and match designs to the nine candidate installations",
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
    status: "Goal exceeded · DOE reported four criticalities",
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
    status: "Four DOE-reported criticalities tracked across the Pilot Program and Launch Pad",
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
  {
    name: "Nuclear Energy Launch Pad",
    lead: "NRIC / Idaho National Laboratory",
    purpose: "DOE-authorized reactor experiments at national-laboratory sites.",
    measure: "First tracked experiment: Deployable Energy Unity",
    status: "Unity achieved DOE-reported initial criticality on June 30, 2026",
    source: "https://www.energy.gov/articles/us-department-energy-meets-president-trumps-goal-delivers-third-advanced-reactor",
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
    name: "Light-water reactor",
    size: "Large reactor or SMR",
    fuel: "LEU / water",
    proof: "Separate PWR from BWR; then track permits, operation, and repeat delivery",
  },
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
  {
    name: "Molten-salt reactor",
    size: "Test reactor to commercial module",
    fuel: "Fuel salt or solid fuel / salt coolant",
    proof: "Fuel chemistry, materials, integrated test, criticality, then power operation",
  },
  {
    name: "Heat-pipe reactor",
    size: "Microreactor",
    fuel: "Design-dependent / passive heat pipes",
    proof: "Fueled test, transport, installation, sustained power, then repeat delivery",
  },
];

export function stageCounts() {
  return stages.map((stage, index) => ({
    ...stage,
    stage: index + 1,
    count: projects.filter((project) => project.stage === index + 1).length,
    companies: [...new Set(projects
      .filter((project) => project.stage === index + 1)
      .map((project) => project.companySlug))]
      .map((slug) => companies.find((company) => company.slug === slug))
      .filter((company): company is Company => Boolean(company)),
  }));
}

/* ---------------------------------------------------------------------------
   The race to a gigawatt
   ---------------------------------------------------------------------------
   Company-centric capacity accounting layered over the project records above.
   Research basis: docs/research/company-packs-*.md (researched 2026-08-05).
   Rules enforced by tests in tests/rendered-html.test.mjs:
     - A megawatt sits in exactly one band, its strongest documented state.
     - Test reactors and critical experiments contribute 0 MWe. They are proof
       events, never capacity.
     - A company-stated target never moves a megawatt between bands. Only a
       documented action does.
     - Binding and non-binding never merge into one figure.
--------------------------------------------------------------------------- */

export type CapacityBand = "operational" | "construction" | "doe-authorized" | "review" | "contracted" | "framework";

/** Strongest evidence first. Board sort and render order both read this. */
export const capacityBands: { band: CapacityBand; label: string; rule: string; authority: string }[] = [
  { band: "operational", label: "Operational", rule: "Grid-connected and generating commercial power.", authority: "Grid operator" },
  { band: "construction", label: "Nuclear construction", rule: "NRC construction permit issued and physical nuclear work documented.", authority: "NRC" },
  { band: "doe-authorized", label: "DOE-authorized build", rule: "Built under a DOE authorization pathway with physical work documented. Not an NRC license to operate.", authority: "DOE" },
  { band: "review", label: "Under review", rule: "Construction-permit or combined-license application docketed and in active regulator review.", authority: "NRC" },
  { band: "contracted", label: "Contracted", rule: "Executed offtake, order, or delivery agreement not yet in regulator review.", authority: "Counterparty" },
  { band: "framework", label: "Announced, non-binding", rule: "MOU, LOI, master agreement, or announced target. No executed project documents.", authority: "None" },
];

export type RaceEntrant = {
  companySlug: string;
  design: string;
  unitMWe: number;
  unitMWeNote?: string;
  lane: "Grid-scale SMR" | "Microreactor";
  ticker?: string;
  rosterBasis: string;
  rosterSource: string;
};

export type CapacityClaim = {
  companySlug: string;
  band: CapacityBand;
  mwe: number;
  label: string;
  /** False if and only if the band is framework. Everything else rests on an executed action. */
  binding: boolean;
  /** YYYY-MM of the action supporting the band, or null when no source states one. */
  date: string | null;
  source: string;
  verification: Verification;
};

export type FundingEvent = {
  companySlug: string;
  /** YYYY-MM, or null when no source dates the event. Never guessed. */
  date: string | null;
  kind: "Venture equity" | "Public offering" | "IPO / listing" | "Strategic investment" | "Federal award" | "Federal loan" | "Cost share";
  /** The frame travels with the figure: "$1.02B IPO proceeds", not a bare number. */
  amount: string;
  counterparty: string;
  source: string;
};

export type ProofEvent = {
  companySlug: string;
  /** YYYY-MM or YYYY-MM-DD, or null when no source dates the event. Never guessed. */
  date: string | null;
  kind: "Criticality" | "Construction start" | "Fuel milestone" | "Permit / authorization" | "Design proof (non-U.S.)" | "Test program";
  label: string;
  /** Keeps a criticality from reading as electricity. */
  powerNote?: string;
  source: string;
  verification: Verification;
};

export const raceEntrants: RaceEntrant[] = [
  {
    companySlug: "terrapower",
    design: "Natrium",
    unitMWe: 345,
    unitMWeNote: "Up to 500 MWe for 5+ hours with the molten-salt storage boost.",
    lane: "Grid-scale SMR",
    rosterBasis: "NRC construction permit issued for Kemmerer Unit 1 and construction underway in Wyoming.",
    rosterSource: "https://www.terrapower.com/NRC-Approves-Natrium-Reactor-Construction-Permit",
  },
  {
    companySlug: "oklo",
    design: "Aurora",
    unitMWe: 75,
    unitMWeNote: "Design scaled from 15 MWe through 50 MWe to a current 75 MWe maximum.",
    lane: "Grid-scale SMR",
    ticker: "NYSE: OKLO",
    rosterBasis: "Aurora-INL under construction on the DOE pathway; combined license application accepted for NRC review.",
    rosterSource: "https://gain.inl.gov/regulatory-update-oklos-combined-license-application-accepted-by-nrc-for-review/",
  },
  {
    companySlug: "kairos-power",
    design: "KP-FHR",
    unitMWe: 140,
    unitMWeNote: "Commercial product rating. Hermes 2 is a ~20 MWe demonstration plant.",
    lane: "Grid-scale SMR",
    rosterBasis: "Hermes 2 holds the first NRC construction permit for a power-producing Gen IV reactor and is under construction.",
    rosterSource: "https://www.kairospower.com/updates/kairos-power-breaks-ground-on-hermes-2-demonstration-plant",
  },
  {
    companySlug: "holtec",
    design: "SMR-300",
    unitMWe: 300,
    unitMWeNote: "Holtec's technical bulletin states 300 MWe net; 2026 partner materials describe approximately 340 MWe.",
    lane: "Grid-scale SMR",
    rosterBasis: "Phased construction-permit application for PIONEER 1&2 docketed at the NRC for the Palisades site.",
    rosterSource: "https://www.federalregister.gov/documents/2026/02/27/2026-03943/smr-llc-pioneer-units-1-and-2-phased-construction-permit-application-limited-work-authorization",
  },
  {
    companySlug: "x-energy",
    design: "Xe-100",
    unitMWe: 80,
    unitMWeNote: "A standard plant bundles four modules for 320 MWe.",
    lane: "Grid-scale SMR",
    ticker: "Nasdaq: XE",
    rosterBasis: "Long Mott construction-permit application under NRC safety review after the environmental review closed.",
    rosterSource: "https://www.nrc.gov/sites/default/files/cdn/doc-collection-news/2026/26-054.pdf",
  },
  {
    companySlug: "gev-hitachi",
    design: "BWRX-300",
    unitMWe: 300,
    lane: "Grid-scale SMR",
    rosterBasis: "TVA's Clinch River Unit 1 construction permit is under NRC review with a mandatory hearing scheduled.",
    rosterSource: "https://www.federalregister.gov/documents/2026/07/07/2026-13662/tennessee-valley-authority-clinch-river-nuclear-site-unit-1-notice-of-hearing",
  },
  {
    companySlug: "nano-nuclear",
    design: "KRONOS MMR",
    unitMWe: 15,
    unitMWeNote: "Rated up to 45 MWt.",
    lane: "Microreactor",
    ticker: "Nasdaq: NNE",
    rosterBasis: "NRC accepted the KRONOS construction-permit application for the University of Illinois site.",
    rosterSource: "https://npre.illinois.edu/news/stories/imdp-cpa",
  },
  {
    companySlug: "radiant-industries",
    design: "Kaleidos",
    unitMWe: 1,
    unitMWeNote: "About 3 MWt.",
    lane: "Microreactor",
    rosterBasis: "Signed delivery agreement with the Defense Innovation Unit and the Department of the Air Force.",
    rosterSource: "https://www.ans.org/news/2025-08-14/article-7277/radiant-signs-contract-on-microreactors-for-the-military/",
  },
  {
    companySlug: "nuscale",
    design: "NuScale Power Module / VOYGR",
    unitMWe: 77,
    unitMWeNote: "The earlier certified design was 50 MWe. A six-module VOYGR-6 plant is 462 MWe.",
    lane: "Grid-scale SMR",
    ticker: "NYSE: SMR",
    rosterBasis: "Holds the only NRC-approved U.S. SMR design and a named U.S. deployment program through ENTRA1 Energy.",
    rosterSource: "https://www.energy.gov/ne/articles/nrc-approves-nuscale-powers-uprated-small-modular-reactor-design",
  },
  {
    companySlug: "terrestrial-energy",
    design: "IMSR",
    unitMWe: 195,
    unitMWeNote: "Per Core-unit. The commercial IMSR400 plant pairs two Core-units for 390 MWe net.",
    lane: "Grid-scale SMR",
    ticker: "Nasdaq: IMSR",
    rosterBasis: "DOE Other Transaction Agreement for a pilot IMSR and roughly 77 acres secured at Texas A&M-RELLIS.",
    rosterSource: "https://www.ans.org/news/2026-06-23/article-8139/terrestrial-energy-and-texas-am-reach-agreement-on-reactor-siting/",
  },
  {
    companySlug: "westinghouse",
    design: "eVinci",
    unitMWe: 5,
    unitMWeNote: "13 MWt. Westinghouse also develops the 300 MWe AP300, which has no named U.S. site, customer, or order on record as of 2026-08-05, so it does not set this row's rating.",
    lane: "Microreactor",
    rosterBasis: "DOE selected the eVinci for the first fueled microreactor experiments at the DOME test bed, the company's only documented U.S. reactor program.",
    rosterSource: "https://www.energy.gov/ne/articles/energy-department-announces-first-microreactor-experiments-dome-test-bed",
  },
  {
    companySlug: "last-energy",
    design: "PWR-20",
    unitMWe: 20,
    unitMWeNote: "PWR-5 is the 5 MWe pilot version of the same design.",
    lane: "Microreactor",
    rosterBasis: "DOE Reactor Pilot Program selection to build and test PWR-5 at Texas A&M-RELLIS, plus a sited Texas project.",
    rosterSource: "https://www.world-nuclear-news.org/articles/last-energy-microreactor-planned-at-texas-university",
  },
  {
    companySlug: "deep-fission",
    design: "Gravity Reactor",
    unitMWe: 15,
    unitMWeNote: "NRC pre-application material describes 45 MWt producing up to 15 MWe; 2025 press describes 15 MWt / 5 MWe.",
    lane: "Microreactor",
    ticker: "Nasdaq: FISN",
    rosterBasis: "DOE Reactor Pilot Program selection with a sited pilot project at Parsons, Kansas.",
    rosterSource: "https://www.world-nuclear-news.org/articles/deep-fission-begins-drilling-first-data-acquisition-well",
  },
  {
    companySlug: "aalo-atomics",
    design: "Aalo-X",
    unitMWe: 10,
    unitMWeNote: "30 MWt. The commercial Aalo Pod bundles units into a 50 MWe plant.",
    lane: "Microreactor",
    rosterBasis: "Built, licensed and operated its own Critical Test Reactor at INL under the DOE Reactor Pilot Program.",
    rosterSource: "https://www.energy.gov/articles/department-energy-celebrates-fourth-criticality-ahead-july-4th-goal",
  },
  {
    companySlug: "valar-atomics",
    design: "Ward 250",
    unitMWe: 5,
    unitMWeNote: "Commercial scale-up target. The Utah test unit ran at 100 kWt.",
    lane: "Microreactor",
    rosterBasis: "Reached DOE-authorized criticality in Utah, the only pilot reactor built outside a national laboratory.",
    rosterSource: "https://www.world-nuclear-news.org/articles/valar-atomics-achieves-criticality-in-doe-reactor-pilot-program",
  },
  {
    companySlug: "bwxt",
    design: "Project Pele / BANR",
    unitMWe: 1.5,
    unitMWeNote: "The Pele demonstration unit is rated 1.5 MWe against a 1–5 MWe program target. BANR is 75 MWt.",
    lane: "Microreactor",
    ticker: "NYSE: BWXT",
    rosterBasis: "Prime contractor building the Project Pele transportable microreactor for the Department of Defense at INL.",
    rosterSource: "https://www.energy.gov/ne/articles/department-defense-breaks-ground-project-pele-microreactor",
  },
  {
    companySlug: "deployable-energy",
    design: "Unity",
    unitMWe: 1,
    lane: "Microreactor",
    rosterBasis: "Reached DOE-authorized criticality at INL and was named to DOE's Launch Pad program.",
    rosterSource: "https://www.energy.gov/articles/us-department-energy-meets-president-trumps-goal-delivers-third-advanced-reactor",
  },
  {
    companySlug: "antares-nuclear",
    design: "R1",
    unitMWe: 0.3,
    unitMWeNote: "200–300 kWe.",
    lane: "Microreactor",
    rosterBasis: "First DOE Reactor Pilot Program participant to reach criticality, at INL with the U.S. Army.",
    rosterSource: "https://www.energy.gov/articles/department-energy-celebrates-first-advanced-reactor-criticality",
  },
];

export const capacityClaims: CapacityClaim[] = [
  // Nuclear construction — NRC permit issued and physical work documented.
  {
    companySlug: "terrapower",
    band: "construction",
    mwe: 345,
    label: "Kemmerer Unit 1, Wyoming · permit issued 2026-03, construction started 2026-04-23",
    binding: true,
    date: "2026-04",
    source: "https://www.terrapower.com/TerraPower-Commences-Construction-on-Americas-First-Utility-Scale-Advanced-Nuclear-Power-Plant",
    verification: "Verified",
  },
  {
    companySlug: "kairos-power",
    band: "construction",
    mwe: 20,
    label: "Hermes 2, Oak Ridge · two 35 MWt reactors on one power system; Kairos separately frames the plant as supplying up to 50 MW",
    binding: true,
    date: "2026-04",
    source: "https://www.kairospower.com/updates/kairos-power-breaks-ground-on-hermes-2-demonstration-plant",
    verification: "Verified",
  },

  // DOE-authorized build — physical work under a DOE pathway, no NRC license to operate.
  {
    companySlug: "oklo",
    band: "doe-authorized",
    mwe: 75,
    label: "Aurora-INL, Idaho · groundbreaking 2025-09-22 on the DOE pathway; NRC combined license still under review",
    binding: true,
    date: "2025-09",
    source: "https://gain.inl.gov/regulatory-update-oklos-combined-license-application-accepted-by-nrc-for-review/",
    verification: "Government-reported",
  },

  // Under review — application docketed and in active regulator review.
  {
    companySlug: "holtec",
    band: "review",
    mwe: 600,
    label: "PIONEER 1&2, Palisades site, Michigan · 2 × 300 MWe; phased permit application with limited work authorization docketed",
    binding: true,
    date: "2026-02",
    source: "https://www.federalregister.gov/documents/2026/02/27/2026-03943/smr-llc-pioneer-units-1-and-2-phased-construction-permit-application-limited-work-authorization",
    verification: "Verified",
  },
  {
    companySlug: "x-energy",
    band: "review",
    mwe: 320,
    label: "Long Mott, Texas · 4 × 80 MWe; environmental review closed 2026-05, safety decision targeted 2026-11",
    binding: true,
    date: "2026-05",
    source: "https://x-energy.com/news/nrc-issues-environmental-assessment-with-finding-of-no-significant-impact-for-dow-and-x-energys-propsed-advanced-nuclear-project-in-texas/",
    verification: "Verified",
  },
  {
    companySlug: "gev-hitachi",
    band: "review",
    mwe: 300,
    label: "Clinch River Unit 1, Tennessee · TVA project; safety evaluation complete, mandatory hearing 2026-08-13",
    binding: true,
    date: "2026-07",
    source: "https://www.federalregister.gov/documents/2026/07/07/2026-13662/tennessee-valley-authority-clinch-river-nuclear-site-unit-1-notice-of-hearing",
    verification: "Verified",
  },
  {
    companySlug: "nano-nuclear",
    band: "review",
    mwe: 15,
    label: "KRONOS MMR, University of Illinois · construction-permit application accepted for review 2026-05-20",
    binding: true,
    date: "2026-05",
    source: "https://npre.illinois.edu/news/stories/imdp-cpa",
    verification: "Verified",
  },

  // Contracted — executed delivery agreement, not yet in regulator review.
  {
    companySlug: "radiant-industries",
    band: "contracted",
    mwe: 1,
    label: "Defense Innovation Unit and Department of the Air Force · delivery agreement signed 2025-08-14; base not yet assigned",
    binding: true,
    date: "2025-08",
    source: "https://www.ans.org/news/2025-08-14/article-7277/radiant-signs-contract-on-microreactors-for-the-military/",
    verification: "Verified",
  },

  // Announced, non-binding.
  {
    companySlug: "oklo",
    band: "framework",
    mwe: 12000,
    label: "Switch master power agreement · stated 12 GW by 2044, individual power contracts still to be signed",
    binding: false,
    date: "2024-12",
    source: "https://www.switch.com/oklo-and-switch-form-landmark-strategic-relationship/",
    verification: "Company-reported",
  },
  {
    companySlug: "oklo",
    band: "framework",
    mwe: 1200,
    label: "Meta · Pike County, Ohio; first phase stated as early as 2030, full capacity 2034",
    binding: false,
    date: "2026-01",
    source: "https://oklo.com/newsroom/news-details/2026/Oklo-Meta-Announce-Agreement-in-Support-of-1-2-GW-Nuclear-Energy-Development-in-Southern-Ohio/default.aspx",
    verification: "Company-reported",
  },
  {
    companySlug: "oklo",
    band: "framework",
    mwe: 500,
    label: "Equinix · letter of intent with a $25M prepayment and a right of first refusal",
    binding: false,
    date: "2024-04",
    source: "https://www.nucnet.org/news/oklo-signs-nuclear-pre-agreement-with-data-company-equinix-4-2-2024",
    verification: "Company-reported",
  },
  {
    companySlug: "oklo",
    band: "framework",
    mwe: 50,
    label: "Diamondback Energy · letter of intent for Permian Basin operations over a 20-year term",
    binding: false,
    date: "2025-04",
    source: "https://www.power-eng.com/nuclear/oklo-secures-up-to-750-mw-worth-of-new-data-center-partnerships/",
    verification: "Company-reported",
  },
  {
    companySlug: "oklo",
    band: "framework",
    mwe: 5,
    label: "Eielson Air Force Base, Alaska · notice of intent to award; contract pending a final NRC license",
    binding: false,
    date: "2025-06",
    source: "https://www.ans.org/news/2025-06-16/article-7114/air-force-issues-notice-to-partner-with-oklo-on-microreactor-deployment-in-alaska/",
    verification: "Government-reported",
  },
  {
    companySlug: "nuscale",
    band: "framework",
    mwe: 6000,
    label: "ENTRA1 Energy and TVA · collaborative agreement across TVA's seven-state region; no power contract signed",
    binding: false,
    date: "2025-09",
    source: "https://www.world-nuclear-news.org/articles/tva-entra1-energy-team-up-for-smr-deployment",
    verification: "Company-reported",
  },
  {
    companySlug: "x-energy",
    band: "framework",
    mwe: 5000,
    label: "Amazon · U.S. framework targeting 2039; the funded Cascade first phase of 320 MWe sits inside this figure",
    binding: false,
    date: "2024-10",
    source: "https://www.ans.org/news/article-6480/amazon-investing-in-smrs-to-deploy-5gw-by-2039/",
    verification: "Company-reported",
  },
  {
    companySlug: "terrestrial-energy",
    band: "framework",
    mwe: 4000,
    label: "Riot Platforms · program ceiling for data-centre sites in Texas and Kentucky; no site-specific commitment",
    binding: false,
    date: "2026-05",
    source: "https://www.riotplatforms.com/terrestrial-energy-and-riot-platforms-launch-collaboration-to-develop-nuclear-powered-large-scale-data-center-projects/",
    verification: "Company-reported",
  },
  {
    companySlug: "terrapower",
    band: "framework",
    mwe: 2800,
    label: "Meta · up to eight plants, no site identified; 4 GW with the storage boost, initial units stated as early as 2032",
    binding: false,
    date: "2026-01",
    source: "https://www.terrapower.com/terrapower-announces-deal-with-meta",
    verification: "Company-reported",
  },
  {
    companySlug: "terrapower",
    band: "framework",
    mwe: 690,
    label: "PacifiCorp · two additional Utah units selected in a 2023 integrated resource plan, planning stage",
    binding: false,
    date: "2023-03",
    source: "https://www.neimagazine.com/news/pacificorp-considers-adding-two-more-natrium-units-to-its-generation-mix-by-2033-10759748/",
    verification: "Company-reported",
  },
  {
    companySlug: "gev-hitachi",
    band: "framework",
    mwe: 3000,
    label: "U.S.–Japan investment framework · unidentified sites in Tennessee and Alabama, separate from Clinch River",
    binding: false,
    date: "2026-03",
    source: "https://www.ans.org/news/2026-03-25/article-7878/new-us-bwrx300-projects-get-japanese-investment/",
    verification: "Government-reported",
  },
  {
    companySlug: "holtec",
    band: "framework",
    mwe: 1360,
    label: "Oyster Creek, New Jersey · 4 × SMR-300 targeted for 2036; no permit, financing, or power purchaser disclosed",
    binding: false,
    date: "2026-07",
    source: "https://www.powermag.com/holtec-targets-2036-for-1-36-gw-smr-300-project-at-oyster-creek/",
    verification: "Company-reported",
  },
  {
    companySlug: "holtec",
    band: "framework",
    mwe: 680,
    label: "Entergy and Hyundai E&C · memorandum of agreement to evaluate dual-unit projects across the Gulf South",
    binding: false,
    date: "2026-08",
    source: "https://www.manilatimes.net/2026/08/04/tmt-newswire/globenewswire/holtec-entergy-and-hyundai-ec-sign-moa-to-evaluate-potential-smr-300-projects-in-gulf-south-region/2397924",
    verification: "Company-reported",
  },
  {
    companySlug: "deep-fission",
    band: "framework",
    mwe: 2000,
    label: "Endeavour Energy · partnership to co-develop capacity for a data-centre portfolio, first reactors stated 2029",
    binding: false,
    date: "2025-01",
    source: "https://www.world-nuclear-news.org/articles/deep-fission-and-endeavour-announce-strategic-partnership",
    verification: "Company-reported",
  },
  {
    companySlug: "last-energy",
    band: "framework",
    mwe: 600,
    label: "Haskell County, Texas · 200-acre developer site for up to 30 units; ERCOT interconnection request filed",
    binding: false,
    date: null,
    source: "https://www.utilitydive.com/news/last-energy-microreactors-texas-ercot-data-centers/741268/",
    verification: "Company-reported",
  },
  {
    companySlug: "kairos-power",
    band: "framework",
    mwe: 480,
    label: "Google master plant development agreement · remainder of the stated 500 MW by 2035 beyond Hermes 2",
    binding: false,
    date: "2024-10",
    source: "https://www.kairospower.com/updates/google-and-kairos-power-partner-to-deploy-500-mw-of-clean-electricity-generation",
    verification: "Company-reported",
  },
  {
    companySlug: "valar-atomics",
    band: "framework",
    mwe: 30,
    label: "NVIDIA · pilot data centre in Emery County, Utah; collaboration, no executed offtake",
    binding: false,
    date: "2026-08",
    source: "https://www.valaratomics.com/docs/Announcing-our-1B-Series-B-Led-By-Sequoia",
    verification: "Company-reported",
  },
  {
    companySlug: "bwxt",
    band: "framework",
    mwe: 0,
    label: "Tata Chemicals · letter of intent for up to eight BANR units in Wyoming; capacity not disclosed",
    binding: false,
    date: "2024-12",
    source: "https://www.tatachemicals.com/upload/content_pdf/BWXT-Tata-LOI-12-December-2024.pdf",
    verification: "Company-reported",
  },
  {
    companySlug: "aalo-atomics",
    band: "framework",
    mwe: 0,
    label: "Crusoe · strategic partnership to power one modular data centre at INL in 2027; capacity not disclosed",
    binding: false,
    date: "2026-07",
    source: "https://www.globenewswire.com/news-release/2026/07/30/3336005/0/en/crusoe-and-aalo-atomics-form-strategic-partnership-with-goal-of-deploying-first-nuclear-powered-ai-factory.html",
    verification: "Company-reported",
  },
];

/** Cash on hand is a balance, not an event. Kept in its own frame so it is never summed with rounds. */
export type CashPosition = { companySlug: string; asOf: string; amount: string; source: string };

export type StatedTarget = {
  companySlug: string;
  target: string;
  statedDate: string | null;
  source: string;
  /** A documented figure that disagrees with the company's own target. */
  conflict?: string;
};

export const fundingEvents: FundingEvent[] = [
  { companySlug: "terrapower", date: "2025-06", kind: "Venture equity", amount: "$650M round", counterparty: "NVentures (NVIDIA), Bill Gates, HD Hyundai", source: "https://www.terrapower.com/terrapower-announces-650-million-fundraise" },
  { companySlug: "terrapower", date: "2022-08", kind: "Venture equity", amount: "$750M minimum equity raise", counterparty: "SK Inc. and SK Innovation", source: "https://www.terrapower.com/fundraise" },
  { companySlug: "terrapower", date: null, kind: "Cost share", amount: "Up to $2B DOE ceiling, 50% of project costs", counterparty: "DOE Advanced Reactor Demonstration Program", source: "https://www.terrapower.com/fundraise" },
  { companySlug: "oklo", date: "2024-05", kind: "IPO / listing", amount: "Up to $645M cash from the combination, including a $300M PIPE", counterparty: "AltC Acquisition Corp (NYSE)", source: "https://news.spacconference.com/2024/05/07/oklo-to-debut-on-nyse-following-altc-acqusition-shareholder-approval/" },
  { companySlug: "oklo", date: "2026-05", kind: "Public offering", amount: "Up to $1B at-the-market program, replacing a prior program that placed ~$1.5B gross", counterparty: "Public markets", source: "https://www.tipranks.com/news/oklo-is-about-to-report-q2-earnings-heres-what-to-expect-from-the-nuclear-energy-stock" },
  { companySlug: "kairos-power", date: "2024-02", kind: "Cost share", amount: "Up to $303M of a $629M project, milestone-based", counterparty: "DOE Advanced Reactor Demonstration Program", source: "https://www.powermag.com/doe-kairos-unveil-milestone-based-funding-agreement-for-advanced-nuclear-demonstration-project/" },
  { companySlug: "kairos-power", date: "2026-02", kind: "Federal award", amount: "$27M agreement", counterparty: "Oak Ridge National Laboratory", source: "https://www.nucnet.org/news/oak-ridge-lab-signs-usd27m-deal-with-kairos-power-for-advanced-reactor-development-2-5-2026" },
  { companySlug: "x-energy", date: "2026-04", kind: "IPO / listing", amount: "~$1.018B gross at $23.00/share", counterparty: "Nasdaq Global Select Market", source: "https://techcrunch.com/2026/04/24/x-energy-stock-pops-27-on-first-day-of-trading-following-upsized-ipo/" },
  { companySlug: "x-energy", date: "2025-11", kind: "Venture equity", amount: "$700M Series D", counterparty: "Jane Street (lead), ARK Invest, Galvanize, Point72", source: "https://x-energy.com/news/x-energy-closes-oversubscribed-700-million-series-d-financing-round-to-continue-expansion-to-meet-global-energy-demand/" },
  { companySlug: "x-energy", date: "2025-02", kind: "Venture equity", amount: "$700M Series C-1", counterparty: "Segra Capital, Jane Street, Ares Management", source: "https://x-energy.com/news/x-energy-closes-upsized-700-million-series-c-1-financing-round-to-accelerate-the-development-of-advanced-small-modular-nuclear-technology/" },
  { companySlug: "holtec", date: "2025-12", kind: "Federal award", amount: "$400M Tier 1 milestone-based cost share", counterparty: "DOE Gen III+ SMR Pathway to Deployment", source: "https://holtecinternational.com/hh-40-24/" },
  { companySlug: "holtec", date: "2026-07", kind: "IPO / listing", amount: "Public S-1 filed; terms not priced", counterparty: "Nasdaq, targeting ticker HNUC", source: "https://www.sec.gov/Archives/edgar/data/0002104277/000119312526301023/d40440ds1.htm" },
  { companySlug: "holtec", date: "2024-09", kind: "Federal loan", amount: "$1.52B loan guarantee for the existing 800 MW Palisades reactor, not the new units; $784.8M advanced as of 2026-03-31", counterparty: "DOE Loan Programs Office", source: "https://holtecinternational.com/2024/09/30/hh-39-17/" },
  { companySlug: "gev-hitachi", date: "2025-12", kind: "Federal award", amount: "Up to $400M Tier 1 award to TVA for Clinch River", counterparty: "DOE Gen III+ SMR Pathway to Deployment", source: "https://www.ans.org/news/2025-12-03/article-7593/doe-selects-tva-and-holtec-for-smr-awards/" },
  { companySlug: "nuscale", date: "2022-05", kind: "IPO / listing", amount: "~$380M proceeds including a $235M PIPE", counterparty: "Spring Valley Acquisition Corp (NYSE)", source: "https://www.nuscalepower.com/press-releases/2022/nuscale-completes-merger-with-spring-valley" },
  { companySlug: "terrestrial-energy", date: "2025-10", kind: "IPO / listing", amount: "Over $292M gross including a $50M PIPE", counterparty: "HCM II Acquisition Corp (Nasdaq)", source: "https://www.barchart.com/story/news/35743041/terrestrial-energy-inc-completes-business-combination-with-hcm-ii-acquisition-corp" },
  { companySlug: "westinghouse", date: "2026-06", kind: "Federal loan", amount: "$17.5B conditional commitment, scoped to AP1000 long-lead items only", counterparty: "EXIM and DOE Office of Energy Dominance Financing", source: "https://info.westinghousenuclear.com/news/westinghouse-announces-department-of-energy-partnership-to-jumpstart-large-scale-nuclear-supply-chain" },
  { companySlug: "westinghouse", date: "2026-07", kind: "IPO / listing", amount: "Confidential draft S-1 filed; share count, price and venue not disclosed", counterparty: "Not disclosed", source: "https://www.bloomberg.com/news/articles/2026-07-31/nuclear-tech-firm-westinghouse-files-confidentially-for-ipo" },
  { companySlug: "aalo-atomics", date: "2025-08", kind: "Venture equity", amount: "$100M Series B; $133M disclosed cumulative", counterparty: "Valor Equity Partners (lead), NRG Energy, Hitachi Ventures", source: "https://www.businesswire.com/news/home/20250820559252/en/Aalo-Atomics-Secures-$100-Million-in-Series-B-Funding-to-Build-Modular-Nuclear-Plants-Purpose-Built-for-Powering-AI-Data-Centers" },
  { companySlug: "radiant-industries", date: "2025-12", kind: "Venture equity", amount: "$300M+ Series D at a valuation above $1.8B; ~$525M+ disclosed cumulative", counterparty: "Draper Associates and Boost VC", source: "https://www.bloomberg.com/news/articles/2025-12-17/nuclear-startup-radiant-raises-300-million-for-small-reactors" },
  { companySlug: "radiant-industries", date: "2025-05", kind: "Venture equity", amount: "$165M Series C", counterparty: "DCVC", source: "https://www.radiantnuclear.com/blog/series-c-close/" },
  { companySlug: "valar-atomics", date: "2026-08", kind: "Venture equity", amount: "$1B Series B at a $6B valuation, plus a $200M credit facility; ~$1.78B disclosed across rounds", counterparty: "Sequoia Capital (lead); Erebor Bank on the facility", source: "https://www.valaratomics.com/docs/Announcing-our-1B-Series-B-Led-By-Sequoia" },
  { companySlug: "valar-atomics", date: "2026-03", kind: "Venture equity", amount: "$450M ($340M equity + $110M debt) at a $2B valuation", counterparty: "Not disclosed", source: "https://theaiworld.org/news/valar-atomics-raises-450m-to-power-ai-data-centres" },
  { companySlug: "valar-atomics", date: "2025-11", kind: "Venture equity", amount: "$130M Series A", counterparty: "Not disclosed", source: "https://techfundingnews.com/a-high-school-dropouts-nuclear-startup-just-landed-1b-from-sequoia-at-a-6b-valuation/" },
  { companySlug: "antares-nuclear", date: "2026-07", kind: "Venture equity", amount: "$470M Series C ($370M equity + $100M debt); ~$604M disclosed cumulative", counterparty: "Paradigm and Caffeinated Capital", source: "https://www.washingtontechnology.com/companies/2026/07/antares-fetches-470m-move-military-base-reactor-push/415052/" },
  { companySlug: "antares-nuclear", date: "2025-12", kind: "Venture equity", amount: "$96M Series B ($71M equity + $25M debt)", counterparty: "Shine Capital", source: "https://www.businesswire.com/news/home/20251202017776/en/Antares-Raises-$96-Million-in-Series-B-Funding-to-Accelerate-Nuclear-Microreactor-Development" },
  { companySlug: "deep-fission", date: "2026-06", kind: "IPO / listing", amount: "$40M gross at $16/share, scaled back from a ~$156M roadshow target", counterparty: "Nasdaq (FISN)", source: "https://www.gurufocus.com/news/8922229/deep-fission-fisn-prices-ipo-at-16-raising-40-million" },
  { companySlug: "last-energy", date: "2025-12", kind: "Venture equity", amount: "$100M Series C; ~$160–164M disclosed cumulative", counterparty: "Astera Institute", source: "https://techcrunch.com/2025/12/16/nuclear-startup-last-energy-raises-100m-for-its-steel-encased-micro-reactor/" },
  { companySlug: "last-energy", date: "2024-08", kind: "Venture equity", amount: "$40M Series B", counterparty: "Gigafund and the Autodesk Foundation", source: "https://www.nucnet.org/news/us-startup-last-energy-raises-usd40-million-for-ambitious-microreactor-project-8-5-2024" },
  { companySlug: "deployable-energy", date: null, kind: "Venture equity", amount: "~$1.7M raised to date alongside substantial founder self-funding", counterparty: "Blue Corridor Ventures, Capital Factory, Nucleation Capital", source: "https://www.premieralts.com/companies/deployable-energy" },
  { companySlug: "nano-nuclear", date: "2025-09", kind: "Federal award", amount: "~$1.25M AFWERX Direct-to-Phase-II contract, a feasibility study rather than a unit order", counterparty: "U.S. Air Force", source: "https://www.globenewswire.com/news-release/2025/09/09/3147107/0/en/FOR-IMMEDIATE-RELEASE-UPDATE-NANO-Nuclear-Awarded-AFWERX-Direct-to-Phase-II-Contract-for-KRONOS-MMR-RDT-E-at-Joint-Base-Anacostia-Bolling.html" },
  { companySlug: "bwxt", date: "2020-12", kind: "Cost share", amount: "Share of a $30M DOE risk-reduction award split across five companies", counterparty: "DOE Advanced Reactor Demonstration Program", source: "https://www.neimagazine.com/news/bwxt-awarded-second-contract-to-evaluate-microreactor-for-wyoming/" },
];

export const cashPositions: CashPosition[] = [
  { companySlug: "oklo", asOf: "2026-03-31", amount: "~$2.5B cash and marketable securities, no debt", source: "https://www.tipranks.com/news/oklo-is-about-to-report-q2-earnings-heres-what-to-expect-from-the-nuclear-energy-stock" },
  { companySlug: "nuscale", asOf: "2026-03-31", amount: "$1.0B cash, equivalents and investments", source: "https://www.nuscalepower.com/press-releases/2026/nuscale-power-reports-first-quarter-2026-results" },
  { companySlug: "x-energy", asOf: "2026-03-31", amount: "$944.0M total liquidity, a pre-IPO balance date", source: "https://x-energy.com/news/x-energy-reports-first-quarter-2026-results/" },
  { companySlug: "nano-nuclear", asOf: "2026-03-31", amount: "$568.7M cash and short-term investments", source: "https://www.stocktitan.net/news/NNE/nano-nuclear-reports-q1-fy-2026-financial-results-and-provides-awkjhq74zjnt.html" },
  { companySlug: "terrestrial-energy", asOf: "2026-03-31", amount: "$289.9M cash and investments", source: "https://www.businesswire.com/news/home/20260514188075/en/Terrestrial-Energy-Reports-First-Quarter-2026-Results" },
];

export const proofEvents: ProofEvent[] = [
  { companySlug: "antares-nuclear", date: "2026-06-04", kind: "Criticality", label: "Mark-0 reached initial criticality at Idaho National Laboratory, the first of the DOE pilot cohort", powerNote: "Zero-power demonstrator. Contributes 0 MWe.", source: "https://www.army.mil/article/293057/antares_nuclears_successful_zero_power_criticality_test_marks_major_step_for_military_applications_of_advanced_microreactors", verification: "Government-reported" },
  { companySlug: "valar-atomics", date: "2026-06-18", kind: "Criticality", label: "Ward 250 reached fuelled criticality in Emery County, Utah, the only pilot reactor built outside a national laboratory", powerNote: "Ran at 100 kWt, a zero-power demonstration. Contributes 0 MWe.", source: "https://www.world-nuclear-news.org/articles/valar-atomics-achieves-criticality-in-doe-reactor-pilot-program", verification: "Government-reported" },
  { companySlug: "deployable-energy", date: "2026-07-01", kind: "Criticality", label: "Unity reached initial criticality at the National Reactor Innovation Center, INL, about 150 days from kickoff", powerNote: "Demonstration reactor. Contributes 0 MWe.", source: "https://www.energy.gov/articles/us-department-energy-meets-president-trumps-goal-delivers-third-advanced-reactor", verification: "Government-reported" },
  { companySlug: "aalo-atomics", date: "2026-07-04", kind: "Criticality", label: "Critical Test Reactor reached initial criticality at INL, the fourth and last before the July 4 goal and the first new reactor built at INL in 50 years", powerNote: "Zero-power test reactor. Contributes 0 MWe.", source: "https://www.energy.gov/articles/department-energy-celebrates-fourth-criticality-ahead-july-4th-goal", verification: "Government-reported" },
  { companySlug: "terrapower", date: "2026-03", kind: "Permit / authorization", label: "NRC issued construction permit CPAR-1, the first for a commercial-scale Gen IV reactor and the first non-light-water permit in over 40 years", source: "https://www.terrapower.com/NRC-Approves-Natrium-Reactor-Construction-Permit", verification: "Verified" },
  { companySlug: "terrapower", date: "2026-04", kind: "Construction start", label: "Nuclear construction began at Kemmerer with about 1,600 workers mobilized", source: "https://www.terrapower.com/TerraPower-Commences-Construction-on-Americas-First-Utility-Scale-Advanced-Nuclear-Power-Plant", verification: "Verified" },
  { companySlug: "kairos-power", date: "2026-04", kind: "Construction start", label: "Groundbreaking at Hermes 2, the first power-producing Gen IV reactor to hold an NRC construction permit", source: "https://www.kairospower.com/updates/kairos-power-breaks-ground-on-hermes-2-demonstration-plant", verification: "Verified" },
  { companySlug: "kairos-power", date: "2026-05", kind: "Permit / authorization", label: "NRC extended the Hermes 1 construction-completion deadline from 2026-12-31 to 2029-04-30", source: "https://www.federalregister.gov/documents/2026/05/18/2026-09880/in-the-matter-of-kairos-power-llc-hermes-test-reactor-extension-of-latest-date-for-completion-of", verification: "Verified" },
  { companySlug: "oklo", date: "2025-09", kind: "Construction start", label: "Groundbreaking on the first Aurora powerhouse at Idaho National Laboratory", source: "https://gain.inl.gov/regulatory-update-oklos-combined-license-application-accepted-by-nrc-for-review/", verification: "Government-reported" },
  { companySlug: "oklo", date: "2025-12", kind: "Test program", label: "Fast-spectrum plutonium criticality experiment with Los Alamos National Laboratory", powerNote: "Research collaboration, not a licensed power reactor. Contributes 0 MWe.", source: "https://oklo.com/newsroom/news-details/2025/Oklo-and-Los-Alamos-National-Lab-Conduct-Fast-Spectrum-Plutonium-Criticality-Experiment/default.aspx", verification: "Company-reported" },
  { companySlug: "oklo", date: "2026-07", kind: "Permit / authorization", label: "DOE issued startup authorization for the Groves isotope test reactor, clearing fuel load; criticality not confirmed as of 2026-08-05", source: "https://www.world-nuclear-news.org/articles/oklo-cleared-to-start-up-test-reactor", verification: "Government-reported" },
  { companySlug: "radiant-industries", date: "2026-02", kind: "Permit / authorization", label: "DOE approved the Kaleidos preliminary documented safety analysis for the DOME test", source: "https://www.radiantnuclear.com/blog/doe-pdsa-approval/", verification: "Government-reported" },
  { companySlug: "radiant-industries", date: "2026-07", kind: "Fuel milestone", label: "First TRISO fuel shipment received at the DOME facility, INL; criticality not confirmed as of 2026-08-05", source: "https://www.world-nuclear-news.org/articles/triso-fuel-delivered-for-kaleidos-reactor-experiment", verification: "Government-reported" },
  { companySlug: "x-energy", date: "2026-02", kind: "Fuel milestone", label: "TRISO-X received a 40-year NRC special nuclear material license for commercial HALEU fuel manufacture", source: "https://www.energy.gov/ne/articles/triso-x-receives-nrc-special-nuclear-material-license-advanced-fuel-fabrication", verification: "Government-reported" },
  { companySlug: "gev-hitachi", date: "2026-03", kind: "Design proof (non-U.S.)", label: "Shaft excavation completed for the first BWRX-300 at Darlington, Ontario", powerNote: "Canadian unit. Contributes 0 MWe to the U.S. race.", source: "https://www.nucnet.org/news/opg-completes-excavation-works-at-darlington-bwrx-300-smr-project-3-1-2026", verification: "Government-reported" },
  { companySlug: "nuscale", date: "2025-05", kind: "Permit / authorization", label: "NRC issued a standard design approval for the uprated 77 MWe design, the only approved U.S. SMR design", source: "https://www.energy.gov/ne/articles/nrc-approves-nuscale-powers-uprated-small-modular-reactor-design", verification: "Government-reported" },
  { companySlug: "nuscale", date: "2026-02", kind: "Design proof (non-U.S.)", label: "RoPower took a final investment decision for a 462 MWe six-module plant at Doicești, Romania", powerNote: "Romanian project. Contributes 0 MWe to the U.S. race.", source: "https://www.world-nuclear-news.org/articles/final-investment-decision-taken-for-romanias-smrs", verification: "Company-reported" },
  { companySlug: "holtec", date: "2026-06", kind: "Design proof (non-U.S.)", label: "Holtec and EDF submitted a joint proposal for up to four SMR-300 units at Cottam, England", powerNote: "UK proposal. Contributes 0 MWe to the U.S. race.", source: "https://www.ans.org/news/2026-06-29/article-8155/holtec-and-edf-submit-proposal-to-deploy-smr300-at-cottam-nottinghamshire/", verification: "Company-reported" },
  { companySlug: "westinghouse", date: "2026-02", kind: "Test program", label: "DOE conditionally selected Westinghouse for the first fuelled microreactor experiments at the DOME test bed", source: "https://www.energy.gov/ne/articles/energy-department-announces-first-microreactor-experiments-dome-test-bed", verification: "Government-reported" },
  { companySlug: "westinghouse", date: null, kind: "Design proof (non-U.S.)", label: "The Saskatchewan Research Council is the first commercial eVinci customer, planning a pilot by 2029", powerNote: "Canadian customer. Contributes 0 MWe to the U.S. race.", source: "https://www.powermag.com/westinghouse-secures-first-customer-for-evinci-nuclear-microreactor/", verification: "Company-reported" },
  { companySlug: "terrestrial-energy", date: "2025-09", kind: "Permit / authorization", label: "NRC approved the IMSR principal design criteria, including its inherent power-control mechanism", source: "https://www.globenewswire.com/news-release/2025/09/10/3147707/0/en/NRC-Completes-Safety-Evaluation-and-Approves-Terrestrial-Energy-IMSR-Principal-Design-Criteria-Including-its-Mechanism-for-Inherent-Reactor-Power-Control.html", verification: "Government-reported" },
  { companySlug: "terrestrial-energy", date: "2026-01", kind: "Permit / authorization", label: "Executed a DOE Other Transaction Agreement for Project TETRA, a pilot IMSR; it did not reach the July 4 2026 criticality goal", source: "https://ir.terrestrialenergy.com/news-releases/news-release-details/terrestrial-energy-executes-doe-agreement-project-tetra-under", verification: "Company-reported" },
  { companySlug: "last-energy", date: "2026-05", kind: "Permit / authorization", label: "DOE approved the PWR-5 preliminary documented safety analysis at Texas A&M-RELLIS; criticality not confirmed as of 2026-08-05", source: "https://www.nucnet.org/news/us-doe-approves-pdsa-for-last-energy-pilot-nuclear-reactor-at-texas-university-5-5-2026", verification: "Government-reported" },
  { companySlug: "last-energy", date: null, kind: "Design proof (non-U.S.)", label: "Signed power purchase agreements for 34 units, 680 MW, with four industrial partners in Poland and the UK", powerNote: "Non-U.S. capacity. Contributes 0 MWe to the U.S. race.", source: "https://www.powermag.com/last-energy-secures-ppas-for-34-smr-nuclear-power-plants-in-poland-and-the-uk/", verification: "Company-reported" },
  { companySlug: "deep-fission", date: "2026-07", kind: "Test program", label: "An unfuelled prototype reactor canister arrived at the Parsons, Kansas site for installation testing", source: "https://www.deepfission.com/pr-media-kit/press-releases/detail/114/deep-fission-prototype-reactor-canister-arrives-at-kansas-site-advancing-reactor-proof-of-concept-program", verification: "Company-reported" },
  { companySlug: "bwxt", date: "2024-09", kind: "Construction start", label: "The Department of Defense broke ground at INL for the Project Pele prototype site", source: "https://www.energy.gov/ne/articles/department-defense-breaks-ground-project-pele-microreactor", verification: "Government-reported" },
  { companySlug: "bwxt", date: null, kind: "Fuel milestone", label: "Delivered a full core of TRISO fuel for the Project Pele microreactor; criticality not confirmed as of 2026-08-05", source: "https://www.bwxt.com/bwxt-delivers-full-core-of-triso-nuclear-fuel-for-project-pele-microreactor/", verification: "Company-reported" },
  { companySlug: "aalo-atomics", date: "2025-09", kind: "Fuel milestone", label: "Signed what Aalo describes as the first U.S. commercial contract for delivery of enriched uranium to a reactor company", source: "https://www.businesswire.com/news/home/20250910715287/en/Aalo-Atomics-Becomes-First-U.S.-Nuclear-Reactor-Company-with-a-Contract-for-Commercial-Delivery-of-Enriched-Uranium-Hits-Crucial-Next-Milestone-on-Path-to-2026-Startup", verification: "Company-reported" },
  { companySlug: "valar-atomics", date: "2026-04", kind: "Permit / authorization", label: "DOE approved the final documented safety analysis for Ward 250, an expedited pathway that bypassed NRC licensing for this test unit", source: "https://oodaloop.com/briefs/technology/valar-atomics-begins-construction-on-ward-250-nuclear-reactor-utah/", verification: "Government-reported" },
  { companySlug: "nano-nuclear", date: "2026-05", kind: "Permit / authorization", label: "NRC formally accepted the KRONOS construction-permit application for full review, an estimated 12-month clock", source: "https://www.globenewswire.com/news-release/2026/05/20/3298411/0/en/NANO-Nuclear-s-KRONOS-MMR-and-the-University-of-Illinois-Urbana-Champaign-Advance-to-Next-Regulatory-Milestone-as-U-S-NRC-Formally-Accepts-Construction-Permit-Application-for-Revie.html", verification: "Verified" },
  { companySlug: "deployable-energy", date: "2026-04", kind: "Permit / authorization", label: "Named one of the first four developers in DOE's Launch Pad program", source: "https://www.rdworldonline.com/doe-announces-first-selections-for-nuclear-energy-dome-program/", verification: "Government-reported" },
  { companySlug: "antares-nuclear", date: "2026-07", kind: "Test program", label: "One of three finalists competing for Air Force installation assignments in Colorado and Montana; no award made", source: "https://www.washingtontechnology.com/companies/2026/07/antares-fetches-470m-move-military-base-reactor-push/415052/", verification: "Company-reported" },
];

export const statedTargets: StatedTarget[] = [
  { companySlug: "terrapower", target: "First Natrium plant completed in 2030", statedDate: "2026-03", source: "https://www.terrapower.com/NRC-Approves-Natrium-Reactor-Construction-Permit", conflict: "Coverage of the same permit frames the plant's NRC-told schedule as early 2031." },
  { companySlug: "oklo", target: "First commercial Aurora-INL plant in late 2027 to early 2028", statedDate: "2025-03", source: "https://www.utilitydive.com/news/oklo-75-mw-reactor-design-smr-nuclear/743578/" },
  { companySlug: "kairos-power", target: "Hermes 2 operating by December 2027", statedDate: "2026-04", source: "https://www.neimagazine.com/news/kairos-breaks-ground-on-hermes-2/" },
  { companySlug: "x-energy", target: "TX-1 fuel facility complete mid-2026, operations from 2027 supplying Long Mott", statedDate: "2026-02", source: "https://www.energy.gov/ne/articles/triso-x-receives-nrc-special-nuclear-material-license-advanced-fuel-fabrication" },
  { companySlug: "gev-hitachi", target: "No commercial-operation date stated for Clinch River Unit 1 as of 2026-08-05", statedDate: null, source: "https://www.opg.com/story/opg-ready-to-begin-building-north-americas-first-small-modular-reactor/", conflict: "The Canadian first unit at Darlington is targeted online by the end of the decade; the U.S. unit has no stated date." },
  { companySlug: "holtec", target: "Execute a power contract for PIONEER in 2026, NRC permit in 2028, interconnection in 2029", statedDate: null, source: "https://energy-communities-alliance.squarespace.com/s/Holtec-Slides.pdf" },
  { companySlug: "nuscale", target: "Management targets converting the TVA collaboration into a signed power contract by the end of 2026", statedDate: "2026-05", source: "https://www.nuscalepower.com/press-releases/2026/nuscale-power-reports-first-quarter-2026-results" },
  { companySlug: "westinghouse", target: "Full-scale commercial eVinci deployment could begin as early as 2029, contingent on NRC licensing and HALEU supply", statedDate: null, source: "https://www.powermag.com/westinghouse-secures-first-customer-for-evinci-nuclear-microreactor/" },
  { companySlug: "westinghouse", target: "AP300 design certification around 2027, first-unit construction toward the end of the decade, with no U.S. site named", statedDate: null, source: "https://www.world-nuclear-news.org/Articles/Westinghouse-unveils-AP300-small-modular-reactor" },
  { companySlug: "terrestrial-energy", target: "Commercial IMSR plant at RELLIS in the early 2030s; no construction-start or first-power date disclosed", statedDate: "2026-06", source: "https://www.ans.org/news/2026-06-23/article-8139/terrestrial-energy-and-texas-am-reach-agreement-on-reactor-siting/" },
  { companySlug: "aalo-atomics", target: "Aalo-X built by the end of 2026 and a reactor paired with a data centre by July 2027", statedDate: null, source: "https://www.aalo.com/aalo-x" },
  { companySlug: "radiant-industries", target: "Factory-scale manufacturing and first customer deliveries beginning 2028", statedDate: null, source: "https://www.esgtoday.com/clean-energy-startup-radiant-raises-165-million-to-replace-diesel-generators-with-portable-nuclear-reactors/" },
  { companySlug: "antares-nuclear", target: "Mark-1 producing electricity in 2027 and installation deployment by 2028", statedDate: "2026-07", source: "https://www.washingtontechnology.com/companies/2026/07/antares-fetches-470m-move-military-base-reactor-push/415052/" },
  { companySlug: "deep-fission", target: "First commercial underground reactor operating at Parsons, Kansas by 2027 or 2028", statedDate: null, source: "https://interestingengineering.com/energy/us-firm-deep-fission-6000-ft-well" },
  { companySlug: "nano-nuclear", target: "Potential KRONOS construction start in the second half of 2027, after the NRC review clock", statedDate: "2026-05", source: "https://npre.illinois.edu/news/stories/imdp-cpa" },
  { companySlug: "last-energy", target: "PWR-5 initial criticality expected in summer 2026, pending DOE authorization", statedDate: "2026-06", source: "https://www.nucnet.org/news/us-doe-approves-pdsa-for-last-energy-pilot-nuclear-reactor-at-texas-university-5-5-2026" },
  { companySlug: "bwxt", target: "Tata Chemicals installation targeted for the early 2030s, with commercial terms still to be established", statedDate: "2024-12", source: "https://www.tatachemicals.com/upload/content_pdf/BWXT-Tata-LOI-12-December-2024.pdf" },
];

/** A gigawatt, the line every bar is read against. */
export const gigawattMWe = 1000;

/**
 * The board track runs past the gigawatt line so the line reads as a target
 * rather than the edge of the bar. Framework megawatts beyond it are clipped
 * visually and carry their full figure in text.
 */
export const raceScaleMWe = 1200;

/** One date for the whole dataset. Every "as of" on the site derives from it. */
export const dataAsOf = "2026-08-05";

export type RaceBandCell = { band: CapacityBand; label: string; mwe: number; claims: CapacityClaim[] };

export type RaceRow = {
  entrant: RaceEntrant;
  company: Company;
  cells: RaceBandCell[];
  /** Sum of every band resting on an executed action. Framework is excluded by design. */
  executedMWe: number;
  frameworkMWe: number;
  strongest: RaceBandCell | null;
  strongestLine: string;
  unitsToGigawatt: number;
  ariaLabel: string;
};

const bandOrder = capacityBands.map((entry) => entry.band);
/** Framework megawatts are announcements. They render, but they never move a row. */
const rankedBands = bandOrder.filter((band) => band !== "framework");

function formatMWe(mwe: number) {
  return `${mwe.toLocaleString("en-US")} MWe`;
}

/**
 * The one place per-entrant band sums are computed. Components render this and
 * never aggregate claims themselves.
 */
export function raceBoard(claims: CapacityClaim[] = capacityClaims): RaceRow[] {
  const rows = raceEntrants.map((entrant) => {
    const company = companies.find((item) => item.slug === entrant.companySlug);
    if (!company) throw new Error(`race entrant ${entrant.companySlug} has no company record`);
    const own = claims.filter((claim) => claim.companySlug === entrant.companySlug);
    const cells: RaceBandCell[] = capacityBands.map(({ band, label }) => {
      const bandClaims = own.filter((claim) => claim.band === band);
      return { band, label, mwe: bandClaims.reduce((total, claim) => total + claim.mwe, 0), claims: bandClaims };
    });
    const executedMWe = cells.filter((cell) => cell.band !== "framework").reduce((total, cell) => total + cell.mwe, 0);
    const frameworkMWe = cells.find((cell) => cell.band === "framework")?.mwe ?? 0;
    const strongest = cells.find((cell) => cell.band !== "framework" && cell.mwe > 0) ?? null;
    const frameworkCell = cells.find((cell) => cell.band === "framework");

    const strongestLine = strongest
      ? `${strongest.label} · ${formatMWe(strongest.mwe)}`
      : frameworkCell?.claims.length
        ? "No executed megawatts · announced pipeline only"
        : "No executed or announced megawatts on record";

    // An unquantified framework is not the same fact as no framework. Saying
    // "0 MWe announced" for a real agreement whose capacity was never disclosed
    // would tell a screen-reader user the opposite of what the caption says.
    const ariaLabel = `${company.name}: ${cells
      .map((cell) => cell.mwe === 0 && cell.claims.length > 0
        ? `${cell.label.toLowerCase()} on record, capacity not disclosed`
        : `${formatMWe(cell.mwe)} ${cell.label.toLowerCase()}`)
      .join(", ")}.`;

    return {
      entrant,
      company,
      cells,
      executedMWe,
      frameworkMWe,
      strongest,
      strongestLine,
      unitsToGigawatt: Math.ceil(gigawattMWe / entrant.unitMWe),
      ariaLabel,
    };
  });

  return rows.sort((a, b) => {
    for (const band of rankedBands) {
      const left = a.cells.find((cell) => cell.band === band)?.mwe ?? 0;
      const right = b.cells.find((cell) => cell.band === band)?.mwe ?? 0;
      if (left !== right) return right - left;
    }
    return a.company.name.localeCompare(b.company.name);
  });
}

/** Board-wide totals. Each band is its own frame; the numbers are never added across bands. */
export function raceTotals(claims: CapacityClaim[] = capacityClaims) {
  return capacityBands.map(({ band, label, rule, authority }) => ({
    band,
    label,
    rule,
    authority,
    mwe: claims.filter((claim) => claim.band === band).reduce((total, claim) => total + claim.mwe, 0),
    entrants: new Set(claims.filter((claim) => claim.band === band && claim.mwe > 0).map((claim) => claim.companySlug)).size,
  }));
}

export function entrantFor(companySlug: string) {
  return raceEntrants.find((entrant) => entrant.companySlug === companySlug) ?? null;
}

/** Newest first. Undated records sort last rather than being dropped or guessed into place. */
export function byDateDescending<T extends { date: string | null }>(records: T[]) {
  return [...records].sort((a, b) => {
    if (a.date === b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });
}

/**
 * How a dossier splits its ledgers. Defined here, not in the component, so a
 * test can prove every record kind lands in exactly one lane. A kind that
 * belongs to no lane would otherwise vanish from the page silently.
 */
export const fundingFrames: { frame: string; note: string; kinds: FundingEvent["kind"][] }[] = [
  { frame: "Raised", note: "Private and public equity. Never added to federal money.", kinds: ["Venture equity", "Public offering", "IPO / listing", "Strategic investment"] },
  { frame: "Awarded", note: "Federal awards and cost share. A ceiling, not cash received.", kinds: ["Federal award", "Cost share"] },
  { frame: "Loaned", note: "Federal debt, repayable. Never counted as a raise.", kinds: ["Federal loan"] },
];

export const proofLanes: { lane: string; note: string; kinds: ProofEvent["kind"][] }[] = [
  { lane: "Licensing", note: "Permits and authorizations, with the authority that granted each one.", kinds: ["Permit / authorization"] },
  { lane: "Physical progress", note: "Work at a site. Criticalities are proof the physics works, not electricity.", kinds: ["Construction start", "Criticality", "Fuel milestone", "Test program"] },
  { lane: "Design proof outside the U.S.", note: "Real progress on the same design abroad. Contributes 0 MWe to the U.S. race.", kinds: ["Design proof (non-U.S.)"] },
];

export function dossierFor(companySlug: string) {
  const entrant = entrantFor(companySlug);
  if (!entrant) return null;
  const claims = capacityClaims.filter((claim) => claim.companySlug === companySlug);
  return {
    entrant,
    row: raceBoard().find((row) => row.entrant.companySlug === companySlug) ?? null,
    funding: fundingFrames.map((frame) => ({
      ...frame,
      events: byDateDescending(fundingEvents.filter((event) => event.companySlug === companySlug && frame.kinds.includes(event.kind))),
    })),
    cash: cashPositions.filter((position) => position.companySlug === companySlug),
    proof: proofLanes.map((lane) => ({
      ...lane,
      events: byDateDescending(proofEvents.filter((event) => event.companySlug === companySlug && lane.kinds.includes(event.kind))),
    })),
    pipeline: {
      executed: byDateDescending(claims.filter((claim) => claim.band !== "framework")),
      announced: byDateDescending(claims.filter((claim) => claim.band === "framework")),
    },
    targets: statedTargets.filter((target) => target.companySlug === companySlug),
  };
}

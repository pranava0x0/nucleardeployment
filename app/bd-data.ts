/**
 * The BD layer: who buys new nuclear, by reactor class, and what it takes to
 * sell into each sector. Buyer positions are sourced facts; sector plans and
 * the manufacturing-path judgment are this site's read, labeled as judgment
 * wherever they appear. Research basis: docs/research/bd-landscape.md
 * (2026-08-17).
 *
 * Every export here is prefixed `bd` so the scripts' merged data namespace
 * (app/data.ts + app/financing-data.ts + this file) stays disjoint.
 */

import type { Verification } from "./data";

/**
 * The BD layer's own freshness stamp, separate from dataAsOf for the same
 * reason financingAsOf is: this layer was assembled and verified later, and
 * its page and sitemap entry carry this date instead.
 */
export const bdAsOf = "2026-08-17";

/**
 * Buyer-facing reactor classes. "Any class" holds positions that create
 * demand without picking a reactor size, such as a state fund or a federal
 * site program; those never imply a class commitment.
 */
export type BdClass = "Microreactor" | "Grid-scale SMR" | "Large LWR" | "Any class";

export const bdClasses: BdClass[] = ["Microreactor", "Grid-scale SMR", "Large LWR", "Any class"];

/** Compact class labels for the matrix and position ledgers. */
export const bdClassShort: Record<BdClass, string> = {
  "Microreactor": "MICRO",
  "Grid-scale SMR": "SMR",
  "Large LWR": "LWR",
  "Any class": "ANY",
};

/**
 * How firm a position is, strongest first. The ladder deliberately keeps an
 * executed contract, an equity stake, moved money, a nonbinding framework, a
 * government program, and a bare statement apart, because collapsing any two
 * of those is how announcement counts lie.
 */
export type BdTier =
  | "Executed"
  | "Equity / board"
  | "Prepayment / deposit"
  | "Framework / LOI"
  | "Program / solicitation"
  | "Stated interest";

export const bdTiers: { tier: BdTier; short: string; meaning: string }[] = [
  { tier: "Executed", short: "EXEC", meaning: "A binding contract, funded agreement, final investment decision, or work in regulatory review." },
  { tier: "Equity / board", short: "EQUITY", meaning: "An investment or governance stake in a reactor company." },
  { tier: "Prepayment / deposit", short: "DEPOSIT", meaning: "Cash moved for future power or units before the offtake itself is signed." },
  { tier: "Framework / LOI", short: "FRAME", meaning: "A nonbinding master agreement, memorandum, or letter of intent." },
  { tier: "Program / solicitation", short: "PROGRAM", meaning: "A government demand program, fund, or open solicitation." },
  { tier: "Stated interest", short: "INTEREST", meaning: "A public statement or funded study, with no instrument behind it." },
];

export type BdSector =
  | "Hyperscalers & data centers"
  | "Frontier AI labs"
  | "Oil & gas"
  | "Industrial & international companies"
  | "Federal & defense"
  | "States & power authorities"
  | "International markets"
  | "Remote & high-reliability operations";

export const bdSectors: BdSector[] = [
  "Hyperscalers & data centers",
  "Frontier AI labs",
  "Oil & gas",
  "Industrial & international companies",
  "Federal & defense",
  "States & power authorities",
  "International markets",
  "Remote & high-reliability operations",
];

/** One position: a class, a rung on the tier ladder, and the source for it. */
export type BdPosition = {
  class: BdClass;
  tier: BdTier;
  /** The claim, with its own figures. Never summed across positions. */
  label: string;
  /** YYYY-MM of the action, or null when no source dates it. Never guessed. */
  date: string | null;
  source: string;
  verification: Verification;
};

export type BdBuyer = {
  slug: string;
  name: string;
  sector: BdSector;
  /** One line on who this is and why they are at the table. */
  note: string;
  positions: BdPosition[];
};

export const bdBuyers: BdBuyer[] = [
  // Hyperscalers & data centers.
  {
    slug: "microsoft",
    name: "Microsoft",
    sector: "Hyperscalers & data centers",
    note: "Bought the first restart: existing-fleet megawatts deliverable this decade.",
    positions: [
      {
        class: "Large LWR",
        tier: "Executed",
        label: "20-year PPA with Constellation launching the Crane Clean Energy Center, the Three Mile Island Unit 1 restart, about 835 MW.",
        date: "2024-09",
        source: "https://www.constellationenergy.com/news/2024/Constellation-to-Launch-Crane-Clean-Energy-Center-Restoring-Jobs-and-Carbon-Free-Power-to-The-Grid.html",
        verification: "Company-reported",
      },
      {
        class: "Any class",
        tier: "Framework / LOI",
        label: "Duke Energy Accelerating Clean Energy MOU, alongside Amazon, Google, and Nucor, to develop anchor tariffs funding clean-firm generation.",
        date: "2024-05",
        source: "https://news.duke-energy.com/releases/responding-to-growing-demand-duke-energy-amazon-google-microsoft-and-nucor-execute-agreements-to-accelerate-clean-energy-options",
        verification: "Company-reported",
      },
    ],
  },
  {
    slug: "meta",
    name: "Meta",
    sector: "Hyperscalers & data centers",
    note: "One executed restart PPA plus two staged SMR frameworks with different vendors.",
    positions: [
      {
        class: "Large LWR",
        tier: "Executed",
        label: "20-year PPA for Constellation's Clinton Clean Energy Center in Illinois: 1,121 MW from June 2027, supporting relicensing plus a 30 MW uprate.",
        date: "2025-06",
        source: "https://www.constellationenergy.com/news/2025/constellation-meta-sign-20-year-deal-for-clean-reliable-nuclear-energy-in-illinois.html",
        verification: "Company-reported",
      },
      {
        class: "Grid-scale SMR",
        tier: "Framework / LOI",
        label: "Oklo agreement supporting up to 1.2 GW in southern Ohio, with Meta able to prepay for power and fund development; first phase stated as early as 2030.",
        date: "2026-01",
        source: "https://oklo.com/newsroom/news-details/2026/Oklo-Meta-Announce-Agreement-in-Support-of-1-2-GW-Nuclear-Energy-Development-in-Southern-Ohio/default.aspx",
        verification: "Company-reported",
      },
      {
        class: "Grid-scale SMR",
        tier: "Framework / LOI",
        label: "TerraPower framework for up to eight Natrium plants, up to 2.8 GW baseload or 4 GW with the storage boost; no site named.",
        date: "2026-01",
        source: "https://www.terrapower.com/terrapower-announces-deal-with-meta",
        verification: "Company-reported",
      },
    ],
  },
  {
    slug: "google",
    name: "Google",
    sector: "Hyperscalers & data centers",
    note: "A restart PPA for this decade and the order-book template for the next.",
    positions: [
      {
        class: "Large LWR",
        tier: "Executed",
        label: "25-year PPA underpinning NextEra's restart of Duane Arnold, Iowa's only nuclear plant (615 MW), targeted online in early 2029.",
        date: "2025-10",
        source: "https://newsroom.nexteraenergy.com/NextEra-Energy-and-Google-Announce-New-Collaboration-to-Accelerate-Nuclear-Energy-Deployment-in-the-U-S?l=12",
        verification: "Company-reported",
      },
      {
        class: "Grid-scale SMR",
        tier: "Framework / LOI",
        label: "Kairos master plant development agreement for up to 500 MW by 2035, sold plant by plant under PPAs; Hermes 2, the first deployment, is under construction.",
        date: "2024-10",
        source: "https://www.kairospower.com/updates/google-and-kairos-power-partner-to-deploy-500-mw-of-clean-electricity-generation",
        verification: "Company-reported",
      },
    ],
  },
  {
    slug: "amazon",
    name: "Amazon",
    sector: "Hyperscalers & data centers",
    note: "The deepest SMR position: equity, a funded first phase, and a 5 GW frame.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Equity / board",
        label: "Amazon's Climate Pledge Fund anchored X-energy's roughly $500M Series C-1, funding Xe-100 design completion, licensing, and the first TRISO-X fuel facility phase.",
        date: "2024-10",
        source: "https://x-energy.com/media/news-releases/amazon-invests-in-x-energy-to-support-advanced-small-modular-nuclear-reactors-and-expand-carbon-free-power",
        verification: "Company-reported",
      },
      {
        class: "Grid-scale SMR",
        tier: "Equity / board",
        label: "The stake came with two X-energy board seats; its size was not disclosed.",
        date: "2024-10",
        source: "https://www.nucnet.org/news/amazon-buys-stake-in-nuclear-reactor-developer-in-bid-to-power-data-centres-10-4-2024",
        verification: "Press-reported",
      },
      {
        class: "Grid-scale SMR",
        tier: "Executed",
        label: "Development and funding agreement with Energy Northwest covering Cascade's initial four Xe-100 modules (320 MWe) at Richland, on a site licensed for up to 960 MWe.",
        date: "2024-10",
        source: "https://www.utilitydive.com/news/washington-nuclear-facility-smrs-cascade-amazon-modular/802967/",
        verification: "Press-reported",
      },
      {
        class: "Grid-scale SMR",
        tier: "Framework / LOI",
        label: "Options-based framework targeting more than 5 GW of Xe-100 projects online in the U.S. by 2039.",
        date: "2024-10",
        source: "https://www.ans.org/news/article-6480/amazon-investing-in-smrs-to-deploy-5gw-by-2039/",
        verification: "Press-reported",
      },
    ],
  },
  {
    slug: "oracle",
    name: "Oracle",
    sector: "Hyperscalers & data centers",
    note: "A stated design intent with no vendor, site, or contract disclosed since.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Stated interest",
        label: "Chairman Larry Ellison told the September 2024 earnings call Oracle is designing a gigawatt data center powered by three small modular reactors, with building permits secured.",
        date: "2024-09",
        source: "https://www.cnbc.com/2024/09/10/oracle-is-designing-a-data-center-that-would-be-powered-by-three-small-nuclear-reactors.html",
        verification: "Press-reported",
      },
    ],
  },
  {
    slug: "switch",
    name: "Switch",
    sector: "Hyperscalers & data centers",
    note: "The largest single frame on the board, and entirely nonbinding.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Framework / LOI",
        label: "Master power agreement with Oklo framing 12 GW of Aurora deployment by 2044; individual power contracts still to be signed.",
        date: "2024-12",
        source: "https://www.switch.com/oklo-and-switch-form-landmark-strategic-relationship/",
        verification: "Company-reported",
      },
    ],
  },
  {
    slug: "equinix",
    name: "Equinix",
    sector: "Hyperscalers & data centers",
    note: "Moves cash early for queue position: a prepayment and the first preorder.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Prepayment / deposit",
        label: "Prepaid Oklo $25M under a pre-agreement carrying a 36-month right of first refusal on up to 500 MWe.",
        date: "2024-04",
        source: "https://www.nucnet.org/news/oklo-signs-nuclear-pre-agreement-with-data-company-equinix-4-2-2024",
        verification: "Press-reported",
      },
      {
        class: "Microreactor",
        tier: "Prepayment / deposit",
        label: "Preorder with deposits for 20 Radiant Kaleidos microreactors, the first commercial microreactor preorder on record.",
        date: "2025-08",
        source: "https://www.accessnewswire.com/newsroom/en/clean-technology/radiant-announces-equinix-preorder-and-deposits-for-20-kaleidos-microreactors-1061067",
        verification: "Company-reported",
      },
    ],
  },
  {
    slug: "crusoe",
    name: "Crusoe",
    sector: "Hyperscalers & data centers",
    note: "A neocloud pairing modular data centers with a microreactor developer on federal land.",
    positions: [
      {
        class: "Microreactor",
        tier: "Framework / LOI",
        label: "Strategic partnership with Aalo to power a Crusoe Spark modular data center at Idaho National Laboratory in 2027, framed as the first nuclear-powered AI factory; no megawatts contracted.",
        date: "2026-07",
        source: "https://www.globenewswire.com/news-release/2026/07/30/3336005/0/en/crusoe-and-aalo-atomics-form-strategic-partnership-with-goal-of-deploying-first-nuclear-powered-ai-factory.html",
        verification: "Company-reported",
      },
    ],
  },
  {
    slug: "nvidia",
    name: "NVIDIA",
    sector: "Hyperscalers & data centers",
    note: "Supplies the load and buys into the supply: reactor equity plus a pilot pairing.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Equity / board",
        label: "NVentures, NVIDIA's venture arm, led TerraPower's $650M raise alongside Bill Gates and HD Hyundai.",
        date: "2025-06",
        source: "https://www.terrapower.com/terrapower-announces-650-million-fundraise",
        verification: "Company-reported",
      },
      {
        class: "Microreactor",
        tier: "Framework / LOI",
        label: "Collaboration with Valar Atomics on a roughly 30 MW pilot AI data center in Emery County, Utah, announced with the Sequoia-led Series B; no executed offtake.",
        date: "2026-08",
        source: "https://www.valaratomics.com/docs/Announcing-our-1B-Series-B-Led-By-Sequoia",
        verification: "Company-reported",
      },
    ],
  },
  {
    slug: "riot-platforms",
    name: "Riot Platforms",
    sector: "Hyperscalers & data centers",
    note: "Bitcoin-mining load converting to AI data centers, shopping for firm power.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Framework / LOI",
        label: "Collaboration with Terrestrial Energy scoped up to 4 GW across data-center sites in Texas and Kentucky; an MOU-level collaboration, not an order.",
        date: "2026-05",
        source: "https://www.riotplatforms.com/terrestrial-energy-and-riot-platforms-launch-collaboration-to-develop-nuclear-powered-large-scale-data-center-projects/",
        verification: "Company-reported",
      },
    ],
  },
  {
    slug: "endeavour-energy",
    name: "Endeavour",
    sector: "Hyperscalers & data centers",
    note: "A data-center developer partnered on borehole microreactors.",
    positions: [
      {
        class: "Microreactor",
        tier: "Framework / LOI",
        label: "Partnership with Deep Fission to co-develop 2 GW of downhole capacity for a data-center portfolio, first reactors stated for 2029.",
        date: "2025-01",
        source: "https://www.world-nuclear-news.org/articles/deep-fission-and-endeavour-announce-strategic-partnership",
        verification: "Press-reported",
      },
    ],
  },

  // Frontier AI labs.
  {
    slug: "openai",
    name: "OpenAI",
    sector: "Frontier AI labs",
    note: "The one lab with a documented reactor-company tie, unwound to permit a purchase.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Equity / board",
        label: "Sam Altman took Oklo public through a merger with his AltC Acquisition Corp in May 2024, then stepped down as chairman in April 2025, giving Oklo more flexibility to explore partnerships with OpenAI and other hyperscalers.",
        date: "2025-04",
        source: "https://www.cnbc.com/2025/04/22/sam-altman-steps-down-as-oklo-chair-freeing-nuclear-company-up-to-work-with-more-ai-companies.html",
        verification: "Press-reported",
      },
    ],
  },

  // Oil & gas.
  {
    slug: "diamondback",
    name: "Diamondback Energy",
    sector: "Oil & gas",
    note: "The template for Permian field electrification: behind-the-meter, 20 years.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Framework / LOI",
        label: "Nonbinding letter of intent with Oklo toward a 20-year agreement for 50 MW near Midland, Texas for Permian Basin operations.",
        date: "2025-04",
        source: "https://oklo.com/newsroom/news-details/2024/Oklo-Signs-LOI-to-Supply-50-Megawatts-of-Power-to-Diamondback-Energy/default.aspx",
        verification: "Company-reported",
      },
    ],
  },
  {
    slug: "liberty-energy",
    name: "Liberty Energy",
    sector: "Oil & gas",
    note: "Oilfield-services capital that bought reactor equity before the offtake market existed.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Equity / board",
        label: "Liberty Energy CEO Chris Wright sat on Oklo's board at his November 2024 nomination as Secretary of Energy, one of the nuclear and geothermal startup investments made from the oilfield-services company.",
        date: "2024-11",
        source: "https://techcrunch.com/2024/11/18/trumps-pro-fracking-energy-secretary-pick-has-also-invested-in-geothermal-and-nuclear-startups",
        verification: "Press-reported",
      },
    ],
  },
  {
    slug: "cenovus-pathways",
    name: "Cenovus / Pathways Alliance",
    sector: "Oil & gas",
    note: "Oil-sands steam is the studied process-heat market; no project has advanced.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Stated interest",
        label: "Alberta committed C$7M toward a C$26.7M Cenovus-led study of how SMRs could supply non-emitting process heat and power to oil-sands steam-assisted gravity drainage operations.",
        date: "2023-09",
        source: "https://www.world-nuclear-news.org/Articles/Alberta-funds-SMR-deployment-study",
        verification: "Press-reported",
      },
    ],
  },

  // Industrial & international companies.
  {
    slug: "dow",
    name: "Dow",
    sector: "Industrial & international companies",
    note: "The first industrial host: power and process heat inside the fence line.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Executed",
        label: "Joint development with X-energy at Seadrift, Texas: the four-module Long Mott project (4 × 80 MWe) is in NRC construction-permit review after the environmental review closed with no significant impact found.",
        date: "2026-05",
        source: "https://x-energy.com/news/nrc-issues-environmental-assessment-with-finding-of-no-significant-impact-for-dow-and-x-energys-propsed-advanced-nuclear-project-in-texas/",
        verification: "Company-reported",
      },
    ],
  },
  {
    slug: "tata-chemicals",
    name: "Tata Chemicals",
    sector: "Industrial & international companies",
    note: "A Mumbai-headquartered buyer for a Wyoming soda-ash site: industrial heat plus geopolitics.",
    positions: [
      {
        class: "Microreactor",
        tier: "Framework / LOI",
        label: "Letter of intent with BWXT for up to eight BANR units at the Green River, Wyoming soda-ash operation, targeting the early 2030s; commercial terms still to be established.",
        date: "2024-12",
        source: "https://www.tatachemicals.com/upload/content_pdf/BWXT-Tata-LOI-12-December-2024.pdf",
        verification: "Company-reported",
      },
    ],
  },
  {
    slug: "nucor",
    name: "Nucor",
    sector: "Industrial & international companies",
    note: "Steelmaking load in the anchor-tariff experiment beside the hyperscalers.",
    positions: [
      {
        class: "Any class",
        tier: "Framework / LOI",
        label: "Duke Energy Accelerating Clean Energy MOU, alongside Amazon, Google, and Microsoft, to develop rate structures where large customers fund clean-firm generation.",
        date: "2024-05",
        source: "https://news.duke-energy.com/releases/responding-to-growing-demand-duke-energy-amazon-google-microsoft-and-nucor-execute-agreements-to-accelerate-clean-energy-options",
        verification: "Company-reported",
      },
    ],
  },

  // Federal & defense.
  {
    slug: "dod-sco",
    name: "DOD Strategic Capabilities Office",
    sector: "Federal & defense",
    note: "The prototype buyer: paid for the first transportable microreactor outright.",
    positions: [
      {
        class: "Microreactor",
        tier: "Executed",
        label: "Project Pele: BWXT is building the transportable 1.5 MWe prototype, being assembled at Idaho National Laboratory under a cost-type contract with a ceiling up to $300M.",
        date: "2022-06",
        source: "https://www.powermag.com/dod-picks-bwxt-to-manufacture-project-pele-prototype-nuclear-microreactor/",
        verification: "Press-reported",
      },
    ],
  },
  {
    slug: "diu-air-force",
    name: "DIU / Department of the Air Force",
    sector: "Federal & defense",
    note: "Buys delivery dates: the first contract that obliges a working unit at a base.",
    positions: [
      {
        class: "Microreactor",
        tier: "Executed",
        label: "Advanced Nuclear Power for Installations delivery agreement with Radiant: a mass-manufactured Kaleidos delivered to a base within 36 months of the August 2025 signing, with Antares and Westinghouse still competing for Colorado and Montana assignments.",
        date: "2025-08",
        source: "https://www.ans.org/news/2025-08-14/article-7277/radiant-signs-contract-on-microreactors-for-the-military/",
        verification: "Press-reported",
      },
      {
        class: "Microreactor",
        tier: "Framework / LOI",
        label: "Air Force and DLA notice of intent to award Oklo a 5 MW microreactor at Eielson AFB, Alaska under a prospective 30-year fixed-price power arrangement, pending NRC licensing.",
        date: "2025-06",
        source: "https://www.ans.org/news/2025-06-16/article-7114/air-force-issues-notice-to-partner-with-oklo-on-microreactor-deployment-in-alaska/",
        verification: "Press-reported",
      },
    ],
  },
  {
    slug: "army",
    name: "U.S. Army",
    sector: "Federal & defense",
    note: "A program of record plus an executive-order deadline on the calendar.",
    positions: [
      {
        class: "Microreactor",
        tier: "Program / solicitation",
        label: "The Janus Program solicits commercially owned and operated microreactors on Army installations, paid against milestones; site selection follows, with no vendor award named.",
        date: "2025-10",
        source: "https://www.army.mil/article/288903/army_announces_janus_program_for_next_generation_nuclear_energy",
        verification: "Government-reported",
      },
      {
        class: "Microreactor",
        tier: "Program / solicitation",
        label: "Executive Order 14299 directs an Army-regulated reactor operating at a domestic military installation by September 30, 2028.",
        date: "2025-05",
        source: "https://www.whitehouse.gov/presidential-actions/2025/05/deploying-advanced-nuclear-reactor-technologies-for-national-security/",
        verification: "Government-reported",
      },
    ],
  },
  {
    slug: "doe",
    name: "Department of Energy",
    sector: "Federal & defense",
    note: "The demand-maker: authorization channels, federal sites, and fleet uprates.",
    positions: [
      {
        class: "Microreactor",
        tier: "Program / solicitation",
        label: "The Reactor Pilot Program, DOME test bed, and Nuclear Energy Launch Pad put four DOE-authorized criticalities on the board by July 4, 2026, the authorization channel first units are using.",
        date: "2026-07",
        source: "https://www.energy.gov/articles/department-energy-celebrates-fourth-criticality-ahead-july-4th-goal",
        verification: "Government-reported",
      },
      {
        class: "Any class",
        tier: "Program / solicitation",
        label: "Selected Idaho National Laboratory, Oak Ridge, Paducah, and Savannah River in December 2025 to host AI data centers paired with new generation, including co-located advanced reactors.",
        date: "2025-12",
        source: "https://www.energy.gov/articles/doe-announces-site-selection-ai-data-center-and-energy-infrastructure-development-federal",
        verification: "Government-reported",
      },
      {
        class: "Large LWR",
        tier: "Program / solicitation",
        label: "UPRISE targets 2.5 GW of added capacity by 2027 and 5 GW by 2029 through uprates, license renewals, and restarts of the existing fleet.",
        date: "2026-03",
        source: "https://www.powermag.com/doe-unveils-initiative-to-add-5-gw-of-nuclear-capacity-through-uprates-and-restarts/",
        verification: "Press-reported",
      },
    ],
  },
  {
    slug: "nasa",
    name: "NASA",
    sector: "Federal & defense",
    note: "Space power runs the same model: companies own the reactor and sell the power.",
    positions: [
      {
        class: "Microreactor",
        tier: "Program / solicitation",
        label: "Under NASA's fission surface power approach, companies own the reactors and sell the power through Space Act Agreements; Antares delivered an electrically heated prototype to Marshall Space Flight Center for testing.",
        date: "2025-12",
        source: "https://spacenews.com/antares-raises-96-million-for-nuclear-reactors-on-earth-and-in-space/",
        verification: "Press-reported",
      },
    ],
  },

  // States & power authorities.
  {
    slug: "tva",
    name: "Tennessee Valley Authority",
    sector: "States & power authorities",
    note: "Public power as first mover: the only utility-led SMR permit in NRC review.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Executed",
        label: "Clinch River Unit 1 (BWRX-300) construction-permit application under NRC review, with the safety evaluation complete and a mandatory hearing noticed for August 2026.",
        date: "2026-07",
        source: "https://www.federalregister.gov/documents/2026/07/07/2026-13662/tennessee-valley-authority-clinch-river-nuclear-site-unit-1-notice-of-hearing",
        verification: "Verified",
      },
      {
        class: "Grid-scale SMR",
        tier: "Framework / LOI",
        label: "Collaborative agreement with ENTRA1 Energy to deploy up to 6 GW of NuScale-based capacity across TVA's seven-state region; no power contract signed.",
        date: "2025-09",
        source: "https://www.nuscalepower.com/press-releases/2025/nuscale-proudly-supports-tva-and-entra1-energy-announcement-of-landmark-6-gigawatt-small-module-reactor-smr-deployment-program",
        verification: "Company-reported",
      },
    ],
  },
  {
    slug: "nypa",
    name: "New York Power Authority",
    sector: "States & power authorities",
    note: "A public-power build mandate with a developer competition already running.",
    positions: [
      {
        class: "Any class",
        tier: "Program / solicitation",
        label: "Directed in June 2025 to develop at least 1 GW of advanced nuclear upstate; the 2025 solicitations drew responses from more than 30 entities, including 23 developer teams, and a developer RFQ followed in 2026.",
        date: "2026-06",
        source: "https://www.nypa.gov/News/Press-Releases/2026/20260623-nuclear",
        verification: "Government-reported",
      },
    ],
  },
  {
    slug: "texas-taneo",
    name: "Texas / TANEO",
    sector: "States & power authorities",
    note: "A state checkbook for development and construction costs, open now.",
    positions: [
      {
        class: "Any class",
        tier: "Program / solicitation",
        label: "The $350M Texas Advanced Nuclear Development Fund opened in April 2026 through two reimbursement programs, one for advanced nuclear construction and one for project design and supply chain work.",
        date: "2026-04",
        source: "https://www.ans.org/news/2026-04-09/article-7920/texas-opens-350m-in-nuclear-funding/",
        verification: "Press-reported",
      },
    ],
  },

  // International markets.
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    sector: "International markets",
    note: "A national SMR selection plus the first regulated-asset-base large build.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Executed",
        label: "Great British Energy - Nuclear selected Rolls-Royce SMR as its preferred technology partner in June 2025 and signed the development contract, with £2.6B allocated in the 2025 Spending Review to enable it.",
        date: null,
        source: "https://www.gov.uk/government/news/great-british-energy-nuclear-and-rolls-royce-smr-sign-contract",
        verification: "Government-reported",
      },
      {
        class: "Large LWR",
        tier: "Executed",
        label: "Sizewell C reached its final investment decision in July 2025 under the first nuclear regulated-asset-base structure, around £38B, with the UK government the largest shareholder.",
        date: "2025-07",
        source: "https://www.sizewellc.com/news-views/final-investment-decision-reached-for-sizewell-c-the-biggest-british-clean-energy-project-in-a-generation/",
        verification: "Company-reported",
      },
    ],
  },
  {
    slug: "poland",
    name: "Poland",
    sector: "International markets",
    note: "The largest committed BWRX-300 export pipeline in Europe.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Executed",
        label: "GE Vernova Hitachi and Orlen Synthos Green Energy signed the Poland Generic Design Agreement in Washington on February 24, 2026, advancing the Polish generic design of the BWRX-300.",
        date: "2026-02",
        source: "https://www.gevernova.com/news/press-releases/deployment-bwrx-300-small-modular-reactor-poland-major-step-forward-design-development",
        verification: "Company-reported",
      },
      {
        class: "Grid-scale SMR",
        tier: "Executed",
        label: "Poland's first SMR will be constructed at Włocławek, one of six locations OSGE shortlisted in 2023 for geological surveys to host BWRX-300 plants.",
        date: null,
        source: "https://www.world-nuclear-news.org/articles/site-of-polands-first-smr-selected",
        verification: "Press-reported",
      },
    ],
  },
  {
    slug: "european-industrials",
    name: "European industrials (Poland & UK)",
    sector: "International markets",
    note: "The only executed microreactor PPA book anywhere is industrial and European.",
    positions: [
      {
        class: "Microreactor",
        tier: "Executed",
        label: "Industrial partners in Poland and the UK hold 34 executed Last Energy PPAs totaling 680 MW, roughly $18.9B in power sales.",
        date: "2024-03",
        source: "https://www.powermag.com/last-energy-secures-ppas-for-34-smr-nuclear-power-plants-in-poland-and-the-uk/",
        verification: "Press-reported",
      },
    ],
  },
  {
    slug: "canada",
    name: "Canada (Ontario & Saskatchewan)",
    sector: "International markets",
    note: "The design proofs U.S. projects lean on: first BWRX-300 build, first eVinci customer.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Executed",
        label: "Ontario approved OPG's four-unit Darlington BWRX-300 program at C$20.9B in 2024 dollars, C$7.7B of it for the first unit and shared systems.",
        date: "2025-05",
        source: "https://www.powermag.com/ontario-authorizes-opg-to-start-construction-of-first-commercial-nuclear-smr/",
        verification: "Press-reported",
      },
      {
        class: "Microreactor",
        tier: "Framework / LOI",
        label: "The Saskatchewan Research Council is the first announced commercial eVinci customer, planning a pilot by 2029.",
        date: null,
        source: "https://www.powermag.com/westinghouse-secures-first-customer-for-evinci-nuclear-microreactor/",
        verification: "Press-reported",
      },
    ],
  },
  {
    slug: "romania",
    name: "Romania",
    sector: "International markets",
    note: "The first NuScale final investment decision anywhere.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Executed",
        label: "RoPower took the final investment decision for a 462 MWe six-module NuScale plant at Doicești.",
        date: "2026-02",
        source: "https://www.world-nuclear-news.org/articles/final-investment-decision-taken-for-romanias-smrs",
        verification: "Press-reported",
      },
    ],
  },
  {
    slug: "japan-investors",
    name: "Japan (sovereign framework)",
    sector: "International markets",
    note: "Allied capital routed into named U.S. reactor programs at head-of-government level.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Framework / LOI",
        label: "The U.S.-Japan investment framework earmarks up to $40B for BWRX-300 builds at unidentified Tennessee and Alabama sites; a strategic framework, not a construction contract.",
        date: "2026-03",
        source: "https://www.ans.org/news/2026-03-25/article-7878/new-us-bwrx300-projects-get-japanese-investment/",
        verification: "Press-reported",
      },
    ],
  },
  {
    slug: "ghana",
    name: "Ghana",
    sector: "International markets",
    note: "The template for World Bank-era emerging-market deals: U.S. design, local owner-operator.",
    positions: [
      {
        class: "Grid-scale SMR",
        tier: "Framework / LOI",
        label: "Nuclear Power Ghana and Regnum Technology Group agreed to deploy a NuScale VOYGR-12 plant, planned as Africa's first commercial advanced light-water SMR, with a subsidiary company to own and operate it.",
        date: "2024-08",
        source: "https://www.nucnet.org/news/african-nation-signs-agreement-for-nuscale-12-module-nuclear-power-plant-8-5-2024",
        verification: "Press-reported",
      },
    ],
  },
  {
    slug: "world-bank",
    name: "World Bank / IAEA",
    sector: "International markets",
    note: "The financing gate that just opened for every emerging-market buyer.",
    positions: [
      {
        class: "Any class",
        tier: "Program / solicitation",
        label: "The World Bank Group formalized an IAEA partnership in June 2025, its first concrete step to reengage with nuclear power in decades, covering life extension of existing plants and SMR development for developing countries.",
        date: "2025-06",
        source: "https://www.worldbank.org/en/news/press-release/2025/06/26/world-bank-group-iaea-formalize-partnership-to-collaborate-on-nuclear-energy-for-development",
        verification: "Institution-reported",
      },
    ],
  },

  // Remote & high-reliability operations.
  {
    slug: "alaska",
    name: "State of Alaska",
    sector: "Remote & high-reliability operations",
    note: "The aggregator for the one market where microreactor FOAK economics already clear.",
    positions: [
      {
        class: "Microreactor",
        tier: "Program / solicitation",
        label: "A statewide push to replace rural diesel generation with microreactors, with a stated goal of all Alaskans having access to 10-cent power by 2030 and state microreactor siting law in place.",
        date: null,
        source: "https://gov.alaska.gov/microreactor-regulations-put-alaskan-communities-at-forefront-of-energy-innovation/",
        verification: "Government-reported",
      },
    ],
  },
];

/** A sourced line inside a sector plan. */
export type BdEvidence = {
  text: string;
  source: string;
};

/** A named move in a sector plan. Site judgment, labeled as such on the page. */
export type BdPlay = {
  move: string;
  why: string;
};

export type BdSectorPlan = {
  sector: BdSector;
  /** The site's read of the sector. Judgment, labeled on the page. */
  thesis: string;
  /** Sector-level facts not already carried by a buyer row above. */
  evidence: BdEvidence[];
  /** The BD moves. Judgment, labeled on the page. */
  plays: BdPlay[];
  /** The event that would most change this sector's plan. Judgment. */
  watch: string;
};

export const bdSectorPlans: BdSectorPlan[] = [
  {
    sector: "Hyperscalers & data centers",
    thesis: "The deepest-pocketed buyers split their nuclear demand three ways: restarts and uprates for megawatts this decade, grid-scale SMR frameworks for the early 2030s, and factory microreactors as the modular hedge. They buy delivery dates, not technology.",
    evidence: [
      {
        text: "DOE's UPRISE initiative targets 2.5 GW of added capacity by 2027 and 5 GW by 2029 through uprates and restarts, the same near-term channel the three executed hyperscaler PPAs bought into.",
        source: "https://www.powermag.com/doe-unveils-initiative-to-add-5-gw-of-nuclear-capacity-through-uprates-and-restarts/",
      },
      {
        text: "Transferable 45Y/48E tax credits cover a large share of capital for reactors beginning construction by 2034, and nuclear survived the 2025 phase-outs that hit wind and solar.",
        source: "https://www.congress.gov/crs-product/IN12719",
      },
      {
        text: "Four federal sites were selected in December 2025 to pair AI data centers with new generation, including co-located reactors, putting land and authorization behind the co-location thesis.",
        source: "https://www.energy.gov/articles/doe-announces-site-selection-ai-data-center-and-energy-infrastructure-development-federal",
      },
    ],
    plays: [
      { move: "Anchor on restarts and uprates first.", why: "The only nuclear megawatts deliverable before 2030 are existing-fleet megawatts, and all three executed hyperscaler deals (Crane, Clinton, Duane Arnold) are exactly that shape." },
      { move: "Structure SMR sales as order books with per-plant PPAs.", why: "The Google-Kairos master agreement shape gives the buyer optionality and gives the developer a book that supply chains and lenders can invest against." },
      { move: "Take deposits for queue position.", why: "Equinix moved cash on both ends of the market, a $25M Oklo prepayment and deposits on 20 Kaleidos units, years before any commercial operation date." },
      { move: "Expect equity asks alongside offtake.", why: "Amazon anchored X-energy's round and NVIDIA led TerraPower's; a board seat prices cheaper than a cost overrun for buyers who intend to order fleets." },
    ],
    watch: "The first SMR framework converting to a signed per-plant power contract. NuScale management targets converting the TVA and ENTRA1 collaboration by the end of 2026; whoever converts first resets every negotiation that follows.",
  },
  {
    sector: "Frontier AI labs",
    thesis: "Labs rent most of their compute from hyperscalers and neoclouds, so lab demand reaches reactors through the landlords. The BD target is the landlord; the lab is the demand signal behind it.",
    evidence: [
      {
        text: "Sam Altman stepped down as Oklo chairman in April 2025, a move that gives the reactor company more flexibility to explore partnerships with OpenAI and other hyperscalers.",
        source: "https://www.cnbc.com/2025/04/22/sam-altman-steps-down-as-oklo-chair-freeing-nuclear-company-up-to-work-with-more-ai-companies.html",
      },
    ],
    plays: [
      { move: "Sell to the landlord, not the tenant.", why: "Crusoe, Switch, and Equinix hold the reactor positions; the labs hold the compute contracts. The buyer of record is whoever owns the building." },
      { move: "Watch governance before offtake.", why: "The one documented lab tie ran through equity and a board seat for a decade before any supply talk; the step-down is what made a purchase possible." },
      { move: "Price the brand.", why: "A lab-branded nuclear PPA carries announcement value for both sides beyond the electrons; the hyperscaler restart deals set the precedent for headline pricing." },
    ],
    watch: "An executed OpenAI-Oklo supply agreement would be the first direct lab offtake on record; the April 2025 step-down exists to permit exactly that.",
  },
  {
    sector: "Oil & gas",
    thesis: "Three postures, only one of them buying. Independents with remote always-on field load are early offtake targets; the majors are rival suppliers building gas with carbon capture for the same data centers; oil sands is a studied, stalled process-heat market.",
    evidence: [
      {
        text: "ExxonMobil is planning a large gas-fired power plant dedicated to serving data centers, rival supply rather than nuclear demand.",
        source: "https://www.powermag.com/exxonmobil-planning-large-gas-fired-plant-to-serve-data-centers/",
      },
      {
        text: "Chevron's joint development with Engine No. 1 and GE Vernova plans up to 4 GW of gas plants co-located with data centers by 2027, on seven turbines with deliveries from late 2026.",
        source: "https://jpt.spe.org/chevron-partners-with-ge-vernova-and-engine-no-1-to-power-up-ai-data-centers-in-us",
      },
      {
        text: "Oklo and Diamondback Energy signed a letter of intent for 50 MW over 20 years for Permian Basin operations, the sector's only tracked offtake instrument.",
        source: "https://www.power-eng.com/nuclear/oklo-secures-up-to-750-mw-worth-of-new-data-center-partnerships/",
      },
    ],
    plays: [
      { move: "Target Permian-class electrification.", why: "The Diamondback template (50 MW, 20 years, behind the meter) matches field load that currently runs on wellhead gas and diesel, priced far above grid power." },
      { move: "Recruit O&G capital even where offtake stalls.", why: "Liberty Energy's Oklo board seat and startup investments preceded any purchase; producer balance sheets understand decade-long, capital-heavy energy projects." },
      { move: "Treat the majors as partners and rivals, not buyers.", why: "Exxon and Chevron are building competing gas supply, but they also hold the sites, water, and interconnection queues that nuclear projects need." },
      { move: "Keep oil sands on the long list.", why: "The steam load is real and studied at C$26.7M depth, but no project has advanced; it prices as a post-FOAK market, not a first market." },
    ],
    watch: "The first executed oil-and-gas offtake. The mechanism exists on paper and in one letter of intent; a signed contract would open a market segment no announcement has yet.",
  },
  {
    sector: "Industrial & international companies",
    thesis: "Industrial buyers purchase steam and reliability, not just electrons, and both live deals put the reactor inside the fence at an existing plant. An international industrial buyer can also carry a U.S. vendor into an allied market.",
    evidence: [
      {
        text: "Dow's Long Mott project pairs four Xe-100 modules with the Seadrift chemical site for electricity and process heat, under NRC construction-permit review.",
        source: "https://www.nrc.gov/reactors/new-reactors/advanced/who-were-working-with/applicant-projects/long-mott",
      },
      {
        text: "The only executed microreactor PPA book anywhere is industrial: 34 Last Energy contracts across Poland and the UK totaling 680 MW.",
        source: "https://www.powermag.com/last-energy-secures-ppas-for-34-smr-nuclear-power-plants-in-poland-and-the-uk/",
      },
    ],
    plays: [
      { move: "Sell process heat where gas boilers dominate.", why: "HTGR and molten-salt outlet temperatures reach steam loads electricity cannot; the Dow and Tata deals are heat deals as much as power deals." },
      { move: "Use the anchor-tariff shape for buyers who will not own.", why: "The Duke MOU structure lets industrial load fund clean-firm generation through a regulated utility without taking project risk directly." },
      { move: "Let one conglomerate open one country.", why: "Tata's Wyoming letter of intent shows the deal flow can run through a foreign industrial buyer to a U.S. site, and the same relationship travels home." },
    ],
    watch: "The Long Mott construction-permit decision, with the NRC safety decision targeted for November 2026. The first industrial-host permit sets the regulatory clock every later fence-line project will be priced against.",
  },
  {
    sector: "Federal & defense",
    thesis: "Government is the first-mover customer on purpose. Executive-order deadlines, delivery contracts with dates, and DOE authorization channels stand in for a commercial market until NRC licenses and factory rates exist. Defense pays for resilience, not for the cheapest megawatt-hour.",
    evidence: [
      {
        text: "Executive Order 14299 puts a date on demand: an Army-regulated reactor operating at a domestic installation by September 30, 2028.",
        source: "https://www.whitehouse.gov/presidential-actions/2025/05/deploying-advanced-nuclear-reactor-technologies-for-national-security/",
      },
      {
        text: "DOE's principal deputy assistant secretary for nuclear energy says demonstration microreactors are going from start to operation in under a year, against a national goal of 400 GW by 2050.",
        source: "https://www.ans.org/news/article-8210/nuclear-is-ready-now/",
      },
      {
        text: "The personnel flow runs both ways: DOE's former chief counsel for nuclear policy joined the board of TRISO fuel maker Standard Nuclear in August 2026.",
        source: "https://www.sec.gov/Archives/edgar/data/0002086716/000162828026056936/cohen_boardxappointmentxpr.htm",
      },
    ],
    plays: [
      { move: "Bid every installation program.", why: "Janus, the ANPI competition, and the Eielson template all carry deadlines that force factory discipline, and defense contracts absorb first-of-a-kind pricing that no commercial buyer will." },
      { move: "Use federal land and DOE authorization to build now.", why: "The Pilot Program, DOME, the Launch Pad, and the AI-site solicitations put steel in the ground while NRC applications run; every criticality so far happened through this channel." },
      { move: "Design for the 30-year fixed-price shape.", why: "The Eielson notice of intent shows the government buying power, not reactors: developer-owned, developer-operated, bankable against a federal offtaker." },
    ],
    watch: "Which vendor wins the first Janus milestones, and whether the Executive Order 14299 reactor is operating on an installation by September 30, 2028.",
  },
  {
    sector: "States & power authorities",
    thesis: "States are building demand floors with public money: a New York public-power build mandate, a Texas grant fund, and TVA's federal-power channel. State programs de-risk the first commercial units that follow the federal cohort.",
    evidence: [
      {
        text: "NYPA's 2025 nuclear solicitations drew responses from more than 30 entities for at least 1 GW upstate, 23 of them developer teams, and a developer RFQ followed in 2026.",
        source: "https://www.nypa.gov/News/Press-Releases/2026/20260623-nuclear",
      },
      {
        text: "DOE's Gen III+ pathway put $400M behind TVA's Clinch River project and $400M behind Holtec's Palisades SMRs in December 2025, the federal half of the state-federal stack.",
        source: "https://www.ans.org/news/2025-12-03/article-7593/doe-selects-tva-and-holtec-for-smr-awards/",
      },
    ],
    plays: [
      { move: "Compete for the two live state checkbooks.", why: "The NYPA RFQ and the Texas fund's construction reimbursements are open now, and both reward projects that already hold federal cost share." },
      { move: "Treat public power as the domestic sovereign buyer.", why: "TVA, NYPA, and the public power districts can sign multi-decade paper and carry siting politics that private load-serving entities cannot." },
      { move: "Stack state money on federal awards.", why: "Clinch River carries a DOE Tier 1 award inside a state that courts nuclear; the projects that close first will hold both halves of the stack." },
    ],
    watch: "NYPA's developer selection for the upstate gigawatt, and whether Texas funds its completion-bonus program in the next budget cycle.",
  },
  {
    sector: "International markets",
    thesis: "Export demand is becoming bankable: the World Bank is reengaging with nuclear for the first time in decades, allied governments are selecting vendors, and sovereign frameworks route capital into named designs. The competition is national, so BD runs government-to-government as much as company-to-company.",
    evidence: [
      {
        text: "The UK ran a national competition and picked its own champion, selecting Rolls-Royce SMR as preferred technology partner in June 2025 and allocating £2.6B in the 2025 Spending Review to enable the contract.",
        source: "https://www.gov.uk/government/news/great-british-energy-nuclear-and-rolls-royce-smr-sign-contract",
      },
      {
        text: "Ontario's Darlington program gives the BWRX-300 its first-of-a-kind proof on an approved C$20.9B budget, the reference plant behind the Polish and U.S. pipelines.",
        source: "https://www.powermag.com/ontario-authorizes-opg-to-start-construction-of-first-commercial-nuclear-smr/",
      },
    ],
    plays: [
      { move: "Sell the fleet curve behind a reference plant.", why: "Darlington, Doicești, and Wylfa give buyers a unit to point at; the pitch for every later unit is the learning ladder, not the prototype." },
      { move: "Finance the first unit with the new sovereign stack.", why: "The World Bank re-entry, EXIM, and frameworks like the U.S.-Japan $40B earmark exist to close deals in markets whose balance sheets could not carry FOAK risk alone." },
      { move: "Structure emerging-market deals as owner-operator subsidiaries.", why: "The Ghana shape, a U.S. design inside a jointly owned local operating company, answers the capability question that stalls first-time nuclear countries." },
    ],
    watch: "The World Bank's first actual nuclear financing, and the first non-North-American final investment decision on a U.S. SMR after Romania's.",
  },
  {
    sector: "Remote & high-reliability operations",
    thesis: "The one market where first-of-a-kind microreactor economics already clear: remote sites pay diesel prices. Buyers are fragmented across villages, mines, and bases, so the sales motion runs through aggregators: states, co-ops, and defense logistics.",
    evidence: [
      {
        text: "Alaska's governor frames rural villages now dependent on diesel generation as the microreactor market, with a stated goal of 10-cent power statewide by 2030 and siting law in place since 2022.",
        source: "https://gov.alaska.gov/microreactor-regulations-put-alaskan-communities-at-forefront-of-energy-innovation/",
      },
      {
        text: "MIT CEEPR's working paper analyzes the value of microreactors in providing both heat and electricity to Alaskan communities.",
        source: "https://ceepr.mit.edu/workingpaper/the-value-of-nuclear-microreactors-in-providing-heat-and-electricity-to-alaskan-communities/",
      },
      {
        text: "NEI's 2019 estimate put first-of-a-kind microreactor generation at $0.14 to $0.41 per kWh, overlapping remote diesel, the first market where the FOAK price closes.",
        source: "https://www.nucnet.org/news/electricity-from-micro-reactors-will-cost-less-than-diesel-generators-says-nei-report",
      },
    ],
    plays: [
      { move: "Price against delivered diesel, not grid LCOE.", why: "The comparison that closes is fuel barged or flown into a remote site, including the logistics chain a reactor deletes for years at a time." },
      { move: "Lead with heat plus power.", why: "Villages and mines buy heat too, and the CEEPR value case rests on serving both loads from one unit." },
      { move: "Sell through aggregators.", why: "State programs, co-op federations, and the DLA fixed-price template pool fragmented 1 to 5 MW loads into contracts big enough to carry project overhead." },
      { move: "Design the O&M case for unattended years.", why: "Multi-year cores and factory refueling are what make the remote economics work; a site that needs a resident nuclear staff never beats diesel." },
    ],
    watch: "The first microreactor operating at a truly remote commercial site, outside a laboratory or base. The Eielson award converting to an executed contract is the nearest defense-remote proof.",
  },
];

/** A named voice on the record: who said it, where, and when. */
export type BdSignal = {
  who: string;
  role: string;
  said: string;
  date: string | null;
  source: string;
  verification: Verification;
};

export const bdSignals: BdSignal[] = [
  {
    who: "Rian Bahran",
    role: "Deputy assistant secretary, DOE",
    said: "Announced UPRISE with a target of 2.5 GW added by 2027 and 5 GW by 2029, calling uprates and restarts the fastest pathway to getting gigawatts on the grid.",
    date: "2026-03",
    source: "https://www.powermag.com/doe-unveils-initiative-to-add-5-gw-of-nuclear-capacity-through-uprates-and-restarts/",
    verification: "Press-reported",
  },
  {
    who: "Michael Goff",
    role: "Principal deputy assistant secretary, DOE Office of Nuclear Energy",
    said: "Says nuclear is ready now, with demonstration microreactors going from start to operation in under a year, a 400 GW by 2050 national goal, and $2.7B awarded for uranium enrichment in January 2026.",
    date: null,
    source: "https://www.ans.org/news/article-8210/nuclear-is-ready-now/",
    verification: "Press-reported",
  },
  {
    who: "Larry Ellison",
    role: "Chairman and CTO, Oracle",
    said: "Told investors Oracle is designing a gigawatt-scale data center to be powered by three small modular reactors, with building permits already secured.",
    date: "2024-09",
    source: "https://www.cnbc.com/2024/09/10/oracle-is-designing-a-data-center-that-would-be-powered-by-three-small-nuclear-reactors.html",
    verification: "Press-reported",
  },
  {
    who: "Sam Altman",
    role: "CEO, OpenAI",
    said: "Stepped down as Oklo chairman in April 2025, a move giving the reactor company more flexibility to explore partnerships with OpenAI and other hyperscalers.",
    date: "2025-04",
    source: "https://www.cnbc.com/2025/04/22/sam-altman-steps-down-as-oklo-chair-freeing-nuclear-company-up-to-work-with-more-ai-companies.html",
    verification: "Press-reported",
  },
  {
    who: "Mike Dunleavy",
    role: "Governor of Alaska",
    said: "Frames microreactors as the replacement for rural diesel generation, with a goal of all Alaskans having access to 10-cent power by 2030.",
    date: null,
    source: "https://gov.alaska.gov/microreactor-regulations-put-alaskan-communities-at-forefront-of-energy-innovation/",
    verification: "Government-reported",
  },
  {
    who: "Radiant Industries",
    role: "Microreactor developer",
    said: "Will build its first factory on a Manhattan Project site in Oak Ridge, Tennessee, with construction from early 2026, the first mass-produced Kaleidos targeted for 2028, and production scaling to 50 reactors a year within a few years after.",
    date: "2025-12",
    source: "https://www.world-nuclear-news.org/articles/radiant-to-locate-microreactor-factory-in-tennessee",
    verification: "Press-reported",
  },
  {
    who: "Aalo Atomics",
    role: "Microreactor developer",
    said: "Describes a planned Gigawatt Factory: more than 4,000,000 sq ft of factory scale-up to mass-manufacture reactors at a rate of hundreds of megawatts a year.",
    date: null,
    source: "https://www.aalo.com/factory",
    verification: "Company-reported",
  },
  {
    who: "Standard Nuclear",
    role: "TRISO fuel maker (NYSE: STDN)",
    said: "Appointed Seth Cohen, DOE's former chief counsel for nuclear policy and an architect of the administration's licensing overhaul, to its board effective August 12, 2026.",
    date: "2026-08",
    source: "https://www.sec.gov/Archives/edgar/data/0002086716/000162828026056936/cohen_boardxappointmentxpr.htm",
    verification: "Verified",
  },
];

/** One rung on the documented path from criticalities to a factory cadence. */
export type BdPathStep = {
  step: string;
  evidence: string;
  date: string | null;
  source: string;
};

export const bdMicroPath: BdPathStep[] = [
  {
    step: "Prove the physics under DOE authority",
    evidence: "Four DOE-authorized criticalities landed by July 4, 2026 through the Reactor Pilot Program and Launch Pad, each roughly a year or less from start.",
    date: "2026-07",
    source: "https://www.energy.gov/articles/department-energy-celebrates-fourth-criticality-ahead-july-4th-goal",
  },
  {
    step: "Contract a delivery date, government first",
    evidence: "The ANPI agreement obliges Radiant to deliver a mass-manufactured unit to a military base within 36 months of its August 2025 signing.",
    date: "2025-08",
    source: "https://www.ans.org/news/2025-08-14/article-7277/radiant-signs-contract-on-microreactors-for-the-military/",
  },
  {
    step: "Put a statutory date behind demand",
    evidence: "Executive Order 14299 directs an Army-regulated reactor operating at a domestic installation by September 30, 2028.",
    date: "2025-05",
    source: "https://www.whitehouse.gov/presidential-actions/2025/05/deploying-advanced-nuclear-reactor-technologies-for-national-security/",
  },
  {
    step: "License fuel at commercial scale",
    evidence: "TRISO-X holds a 40-year NRC special nuclear material license for commercial HALEU fuel manufacture, the first of its kind.",
    date: "2026-02",
    source: "https://www.energy.gov/ne/articles/triso-x-receives-nrc-special-nuclear-material-license-advanced-fuel-fabrication",
  },
  {
    step: "Build factories sized to the target",
    evidence: "Radiant's Oak Ridge factory has construction set to begin in early 2026, with a first mass-produced unit targeted for 2028 and a stated path to 50 reactors a year within a few years after.",
    date: "2025-12",
    source: "https://www.world-nuclear-news.org/articles/radiant-to-locate-microreactor-factory-in-tennessee",
  },
  {
    step: "Book commercial orders against the line",
    evidence: "Equinix placed a preorder with deposits for 20 Kaleidos units, the first commercial microreactor book.",
    date: "2025-08",
    source: "https://www.accessnewswire.com/newsroom/en/clean-technology/radiant-announces-equinix-preorder-and-deposits-for-20-kaleidos-microreactors-1061067",
  },
  {
    step: "Ride the factory cost curve",
    evidence: "INL's bottom-up model prices a first-of-a-kind microreactor at $325/MWh and the same design at about $120/MWh once factory production is reached.",
    date: "2024",
    source: "https://gain.inl.gov/content/uploads/4/2025/03/2024-Document-INL-RPT-24-80433.pdf",
  },
  {
    step: "Land the units where sites are ready",
    evidence: "DOE selected Idaho, Oak Ridge, Paducah, and Savannah River to host AI data centers paired with new generation, including co-located reactors.",
    date: "2025-12",
    source: "https://www.energy.gov/articles/doe-announces-site-selection-ai-data-center-and-energy-infrastructure-development-federal",
  },
];

/**
 * The site's read of the sequencing question, rendered on the page under an
 * explicit judgment label.
 */
export const bdMicroPathJudgment =
  "The sequencing on the record is government first, commercial second. Defense and DOE programs carry the deadlines (2028), absorb first-of-a-kind pricing, and supply authorized sites, while remote markets pay diesel prices that already clear FOAK costs. A 10-to-20-unit year from 2028 onward requires all of: at least one factory shipping at rate, NRC licenses for sites off federal land, fuel deliveries at cadence from the licensed HALEU and TRISO lines, and a commercial book beyond the first preorder. Every one of those has a first instance on the record above; none yet has a second.";

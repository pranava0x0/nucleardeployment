import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the evidence-led homepage", async () => {
  const dataModule = await import("../app/data.ts");
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Deployment Core/);
  assert.match(html, /racing to put a gigawatt/);
  assert.match(html, /Projects by stage/);
  assert.match(html, /brand\/reactor-velocity-mark\.png/);
  assert.match(html, /Exploring the idea/);
  assert.match(html, /Work or fuel at the site/);
  // Derived from stageCounts(), not hardcoded: a project's stage moving (as
  // one did after a 2026-08-23 staleness fix) must not silently desync this
  // assertion from what the page actually renders.
  const development = dataModule.stageCounts().find((entry) => entry.label === "Development");
  assert.match(html, new RegExp(`${development.count} projects`), "the Development stage card states its true count");
  assert.match(html, /TerraPower/);
  assert.match(html, /Kairos Power/);
  assert.doesNotMatch(html, /Announcement is not deployment/);
  assert.doesNotMatch(html, /metric-rail/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
  // The retired orbit hero must not leave markup or styles behind.
  assert.doesNotMatch(html, /core-readout|hero-core|class="orbit/);
});

test("the homepage leads with catch-up, news, and gates before the full race board, and trims the board", async () => {
  const dataModule = await import("../app/data.ts");
  const raw = await (await render()).text();
  const html = raw.replace(/<!--.*?-->/g, "");
  const board = dataModule.raceBoard();

  // Toplines and news arrive before the 18-row table, not after it.
  const order = ["Catch up", "Latest developments", "Next gates", "The race board"].map((marker) => html.indexOf(`>${marker}<`));
  assert.ok(order.every((at) => at >= 0), "every section marker was found");
  assert.ok(order.every((at, i) => i === 0 || at > order[i - 1]), "catch-up, news, and gates precede the race board");

  // The catch-up strip carries real content, not a blank or an unresolved value.
  const catchUp = html.slice(html.indexOf('class="catchup-list"'), html.indexOf("</ul>", html.indexOf('class="catchup-list"')));
  assert.doesNotMatch(catchUp, /undefined|null/, "the catch-up strip has no unresolved value");
  assert.equal((catchUp.match(/<li>/g) ?? []).length, 4, "the catch-up strip has one line per section");
  // This is the first visible content on the page. Every claim on this site
  // traces to a source, and the strip is no exception: three of its four
  // lines are freestanding claims (not just a preview of a fuller sourced
  // section below), so they carry their own citation link.
  assert.equal((catchUp.match(/class="catchup-source"/g) ?? []).length, 3, "news, federal, and capital lines carry a source link");
  // Picks the true latest item per lane, not array position: EO 14302 sorts
  // after 14299-14301 by number, and the federal-tracker jump link still
  // points at the section, not at any one EO.
  const eoNumbers = [...catchUp.matchAll(/EO (\d+)/g)].map(([, n]) => Number(n));
  assert.ok(eoNumbers.length > 0, "an EO number appears in the strip");
  assert.ok(eoNumbers[0] >= 14300, "the strip picks the highest (most recent) EO number, not the first array entry");

  // Only the first VISIBLE_ROWS render before the show-all toggle; every
  // entrant still has a row somewhere, most of them inside the collapsed tail.
  const marker = `Show all ${board.length} companies`;
  assert.ok(html.includes(marker), "the show-all toggle names the true entrant count");
  const [beforeToggle] = html.split(marker);
  const visibleRowCount = (beforeToggle.match(/class="race-row"/g) ?? []).length;
  assert.equal(visibleRowCount, 6, "exactly six rows render before the show-all toggle");
  const totalRowCount = (html.match(/class="race-row"/g) ?? []).length;
  assert.equal(totalRowCount, board.length, "every entrant still has a row, most inside the collapsed tail");

  // The collapsed tail is a native <details>, which hides its content
  // natively when closed; a filter match there needs to open it explicitly,
  // or the match toggles "visible" and still renders nothing (DESIGN.md
  // section 12.3's <details>-collapse trap).
  const { readFile } = await import("node:fs/promises");
  const filterSource = await readFile(new URL("../app/components/RaceFilter.tsx", import.meta.url), "utf8");
  assert.match(filterSource, /closest\("details"\)/, "a filter match opens its <details> ancestor");
  // A WeakMap that captures a <details>'s state once and never refreshes it
  // restores the wrong value across a second filtering session (filter,
  // clear, manually open the section by hand, filter and clear again: a
  // stale captured "closed" snaps it shut even though the reader just
  // opened it). Codex found this on PR #14; the baseline must be recaptured
  // at the start of each session, not held forever after the first one.
  assert.match(filterSource, /startingNewSession/, "the saved <details> state is recaptured at the start of each new filtering session");
});

test("the homepage race board states its zero and gives every entrant a row", async () => {
  const dataModule = await import("../app/data.ts");
  const raw = await (await render()).text();
  // React splits interpolated text with <!-- --> markers; assert on what a reader sees.
  const html = raw.replace(/<!--.*?-->/g, "");
  const board = dataModule.raceBoard();

  // The zero is written, not implied by an empty bar.
  assert.match(html, /0 MWe operational across all 18 entrants/);
  assert.match(html, new RegExp(`as of ${dataModule.dataAsOf}`));

  for (const row of board) {
    assert.ok(html.includes(row.company.name), `${row.company.name} has a board row`);
    // A reader with no colour still gets the ranking: the strongest state travels as text.
    assert.ok(html.includes(row.strongestLine), `${row.company.name} states "${row.strongestLine}"`);
    // Band segments are not the data. The aria label carries the exact per-band megawatts.
    assert.ok(html.includes(escapeHtml(row.ariaLabel)), `${row.company.name} labels its figure with per-band MWe`);
  }

  // Framework megawatts are always labelled as announcements, never bare.
  const oklo = board.find((row) => row.company.slug === "oklo");
  assert.match(html, new RegExp(`${oklo.frameworkMWe.toLocaleString("en-US")} MWe announced, non-binding`));

  // An agreement whose capacity was never disclosed is not the same fact as no
  // agreement. Asserted against the literal text, not against ariaLabel itself,
  // which would just compare the renderer to the function that generated it.
  const undisclosed = board.filter((row) => {
    const framework = row.cells.find((cell) => cell.band === "framework");
    return framework.mwe === 0 && framework.claims.length > 0;
  });
  assert.ok(undisclosed.length > 0, "the dataset still exercises the undisclosed-capacity case");
  for (const row of undisclosed) {
    assert.match(row.ariaLabel, /capacity not disclosed/, `${row.company.name} says its framework capacity is undisclosed`);
    assert.doesNotMatch(row.ariaLabel, /0 MWe announced/, `${row.company.name} does not report an undisclosed framework as zero`);
  }
  // A company with genuinely no framework still reports a plain zero.
  const noFramework = board.find((row) => row.cells.find((cell) => cell.band === "framework").claims.length === 0);
  assert.match(noFramework.ariaLabel, /0 MWe announced, non-binding/, "no agreement reads as zero, not as undisclosed");
  // No chart library ships to the client.
  assert.doesNotMatch(html, /chart\.js|d3\.|recharts|plotly/i);
});

/** Mirrors React's text and attribute escaping, apostrophes included. */
function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

test("server-renders company directory and company detail pages", async () => {
  const directory = await render("/companies");
  assert.equal(directory.status, 200);
  const directoryHtml = await directory.text();
  assert.match(directoryHtml, /Companies/);
  assert.match(directoryHtml, /TerraPower/);
  assert.match(directoryHtml, /Valar Atomics/);

  const detail = await render("/companies/terrapower");
  assert.equal(detail.status, 200);
  const detailHtml = await detail.text();
  assert.match(detailHtml, /Natrium/);
  assert.match(detailHtml, /Sodium-cooled fast reactor/);
  assert.match(detailHtml, /Submit and secure the separate NRC operating license/);
  assert.match(detailHtml, /Deployment stage/);
  assert.match(detailHtml, /Projects and next steps/);
  assert.match(detailHtml, /Primary source/);
  assert.doesNotMatch(detailHtml, /Evidence-linked profile|Commitment level|Evidence and next gates/);
});

test("server-renders core directory and methodology routes", async () => {
  for (const [path, text] of [["/deployments", "U.S. reactor projects"], ["/federal-action", "Four executive orders"], ["/capital", "Federal loans"], ["/methodology", "Version 0.2 definitions"], ["/map", "Named U.S. reactor sites"]]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, new RegExp(text, "i"));
    assert.match(html, /page-lead grid-bg"><h1>/);
    assert.doesNotMatch(html, /Money is not one metric|This view keeps them separate|Evidence before labels/);
  }
});

test("server-renders a project record with its next gate and source", async () => {
  const response = await render("/deployments/natrium-kemmerer");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Natrium/);
  assert.match(html, /Next milestone/);
  assert.match(html, /NRC application record/);
  assert.match(html, /separate NRC operating license/);
});

test("all source links use https and every project states a next action", async () => {
  const dataModule = await import("../app/data.ts");
  const companySlugs = new Set(dataModule.companies.map((company) => company.slug));
  for (const project of dataModule.projects) {
    assert.equal("commitment" in project, false, `${project.name} uses deployment stage only`);
    assert.equal("x" in project || "y" in project, false, `${project.name} has no invented map coordinates`);
    assert.match(project.source, /^https:\/\//);
    assert.ok(project.next.length > 20, project.name);
    assert.ok(project.sourceLabel.length > 4, project.name);
    assert.ok(companySlugs.has(project.companySlug), `${project.name} has no company record`);
    assert.ok(project.programs.length > 0, `${project.name} has no program label`);
  }
  for (const collection of [dataModule.federalActions, dataModule.programs, dataModule.capital]) {
    for (const record of collection) assert.match(record.source, /^https:\/\//);
  }
});

test("DOE program coverage distinguishes pilot, criticality, and ARDP projects", async () => {
  const dataModule = await import("../app/data.ts");
  const pilotProjects = dataModule.projects.filter((project) => project.programs.includes("Reactor Pilot Program"));
  const criticalityProjects = pilotProjects.filter((project) => project.status === "Initial criticality achieved");
  const ardpProjects = dataModule.projects.filter((project) => project.programs.includes("ARDP demonstration"));
  const launchPadProjects = dataModule.projects.filter((project) => project.programs.includes("Nuclear Energy Launch Pad"));

  assert.equal(dataModule.projects.length, 28);
  assert.equal(dataModule.companies.length, 26);
  assert.equal(pilotProjects.length, 11);
  assert.deepEqual(criticalityProjects.map((project) => project.name).sort(), ["Aalo Critical Test Reactor", "Antares R1 Mark-0", "Ward 250 critical experiment"]);
  assert.deepEqual(ardpProjects.map((project) => project.slug).sort(), ["long-mott-xe-100", "natrium-kemmerer"]);
  assert.deepEqual(launchPadProjects.map((project) => project.slug), ["deployable-unity"]);
});

test("reactor generation, scale, family, and role stay separate", async () => {
  const dataModule = await import("../app/data.ts");
  for (const project of dataModule.projects) {
    assert.ok(project.generation, `${project.name} has generation`);
    assert.ok(project.scale, `${project.name} has scale`);
    assert.ok(project.family, `${project.name} has reactor family`);
    assert.ok(project.reactorRole, `${project.name} has reactor role`);
  }
  const bwrx = dataModule.projects.find((project) => project.slug === "clinch-river-bwrx-300");
  assert.deepEqual([bwrx.generation, bwrx.scale, bwrx.family], ["Gen III+", "SMR", "LWR · BWR"]);
});

test("research archive is structured, unique, and append-only JSON", async () => {
  const { readFile } = await import("node:fs/promises");
  const registry = JSON.parse(await readFile(new URL("../data/research/source-registry.json", import.meta.url), "utf8"));
  const searchLines = (await readFile(new URL("../data/research/search-history.jsonl", import.meta.url), "utf8")).trim().split("\n").map(JSON.parse);
  const linkChecks = (await readFile(new URL("../data/research/link-check-history.jsonl", import.meta.url), "utf8")).trim().split("\n").map(JSON.parse);
  const ids = registry.sources.map((source) => source.id);
  const urls = registry.sources.map((source) => source.url);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(registry.sources.length >= 20);
  for (const source of registry.sources) {
    assert.match(source.url, /^https:\/\//);
    assert.ok(Array.isArray(source.officials));
    assert.ok(Array.isArray(source.companies));
    assert.ok(Array.isArray(source.reactor_types));
    assert.ok(Array.isArray(source.deployment_stages));
    assert.ok(Array.isArray(source.industry_domains));
  }
  assert.ok(searchLines.length >= 4);
  assert.ok(linkChecks.length >= 11);
  assert.ok(linkChecks.every((check) => ["live", "blocked", "dead"].includes(check.classification)));
});

test("CSS keeps palette values in the root token block", async () => {
  const { readFile } = await import("node:fs/promises");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const withoutRoot = css.replace(/:root\s*\{[\s\S]*?\}/, "");
  assert.doesNotMatch(withoutRoot, /#[0-9a-f]{3,8}\b/i);
});

test("visible interface type never drops below 12px", async () => {
  const { readFile } = await import("node:fs/promises");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const sizes = [...css.matchAll(/(?:font(?:-size)?\s*:[^;]*?)(\d+)px/g)].map((match) => Number(match[1]));
  assert.ok(sizes.length > 20);
  assert.ok(sizes.every((size) => size >= 12), `smallest visible type is ${Math.min(...sizes)}px`);
});

test("text and semantic token pairs meet WCAG AA contrast", async () => {
  const { readFile } = await import("node:fs/promises");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const root = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? "";
  const tokens = Object.fromEntries([...root.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((match) => [match[1], match[2]]));
  const pairs = [
    ["ink", "bg"],
    ["ink", "surface"],
    ["ink-muted", "bg"],
    ["on-accent", "accent"],
    ["on-signal", "signal"],
    ["white", "graphite"],
    ["accent", "graphite"],
  ];
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/../g).map((value) => Number.parseInt(value, 16) / 255);
    const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };

  for (const [foreground, background] of pairs) {
    assert.ok(tokens[foreground] && tokens[background], `${foreground}/${background} tokens exist`);
    const values = [luminance(tokens[foreground]), luminance(tokens[background])].sort((a, b) => b - a);
    const ratio = (values[0] + 0.05) / (values[1] + 0.05);
    assert.ok(ratio >= 4.5, `${foreground} on ${background} contrast is ${ratio.toFixed(2)}:1`);
  }
});

test("Vite dev cache never points at removed packages", async () => {
  const { access, readFile } = await import("node:fs/promises");
  const metadataUrl = new URL("../node_modules/.vite/deps/_metadata.json", import.meta.url);
  let metadata;

  try {
    metadata = JSON.parse(await readFile(metadataUrl, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }

  for (const [dependency, record] of Object.entries(metadata.optimized ?? {})) {
    await assert.doesNotReject(
      access(new URL(record.src, metadataUrl)),
      `stale Vite cache entry for ${dependency}: ${record.src}`,
    );
  }
});

test("every race record carries one band, an https source, and a real or null date", async () => {
  const dataModule = await import("../app/data.ts");
  const companySlugs = new Set(dataModule.companies.map((company) => company.slug));
  const bands = new Set(dataModule.capacityBands.map((entry) => entry.band));
  const entrantSlugs = new Set(dataModule.raceEntrants.map((entrant) => entrant.companySlug));

  assert.equal(entrantSlugs.size, dataModule.raceEntrants.length, "no entrant is listed twice");
  for (const entrant of dataModule.raceEntrants) {
    assert.ok(companySlugs.has(entrant.companySlug), `${entrant.companySlug} has a company record`);
    assert.match(entrant.rosterSource, /^https:\/\//, entrant.companySlug);
    assert.ok(entrant.rosterBasis.length > 20, `${entrant.companySlug} states why it qualifies`);
    assert.ok(entrant.unitMWe > 0, `${entrant.companySlug} has a unit rating`);
  }

  for (const claim of dataModule.capacityClaims) {
    assert.ok(entrantSlugs.has(claim.companySlug), `claim for ${claim.companySlug} belongs to an entrant`);
    assert.ok(bands.has(claim.band), `${claim.label} uses a known band`);
    assert.ok(claim.mwe >= 0, `${claim.label} is not negative`);
    assert.match(claim.source, /^https:\/\//, claim.label);
    assert.equal(claim.binding, claim.band !== "framework", `${claim.label} binding flag matches its band`);
    if (claim.date !== null) assert.match(claim.date, /^\d{4}-\d{2}$/, claim.label);
  }

  for (const record of [...dataModule.fundingEvents, ...dataModule.proofEvents]) {
    assert.ok(entrantSlugs.has(record.companySlug), `record for ${record.companySlug} belongs to an entrant`);
    assert.match(record.source, /^https:\/\//, record.companySlug);
    if (record.date !== null) assert.match(record.date, /^\d{4}-\d{2}(-\d{2})?$/, record.companySlug);
  }
  for (const record of [...dataModule.statedTargets, ...dataModule.cashPositions]) {
    assert.ok(entrantSlugs.has(record.companySlug), `record for ${record.companySlug} belongs to an entrant`);
    assert.match(record.source, /^https:\/\//, record.companySlug);
  }
});

test("test reactors and critical experiments contribute zero megawatts", async () => {
  const dataModule = await import("../app/data.ts");
  const criticalities = dataModule.proofEvents.filter((event) => event.kind === "Criticality");
  // The four that met the July 4 2026 federal goal, plus any since. Asserted
  // separately so a new criticality does not read as a broken count: Oklo's
  // Groves reactor went critical on 2026-08-06, after the deadline.
  const beforeGoal = criticalities.filter((event) => event.date <= "2026-07-04");
  assert.deepEqual(
    beforeGoal.map((event) => event.companySlug).sort(),
    ["aalo-atomics", "antares-nuclear", "deployable-energy", "valar-atomics"],
    "the four pre-deadline DOE pilot criticalities are recorded",
  );
  assert.ok(criticalities.length >= 4, `criticality count floor: ${criticalities.length}`);
  for (const event of criticalities) {
    assert.match(event.powerNote ?? "", /0 MWe/, `${event.companySlug} criticality states it contributes no capacity`);
  }
  // A criticality never lands a megawatt in a capacity band.
  for (const slug of ["antares-nuclear", "deployable-energy"]) {
    const row = dataModule.raceBoard().find((entry) => entry.entrant.companySlug === slug);
    assert.equal(row.executedMWe, 0, `${slug} has a criticality but no executed capacity`);
  }
});

test("the board reports an honest zero and never lets frameworks move a row", async () => {
  const dataModule = await import("../app/data.ts");
  const board = dataModule.raceBoard();
  assert.equal(board.length, dataModule.raceEntrants.length, "every entrant gets a row");

  for (const row of board) {
    const operational = row.cells.find((cell) => cell.band === "operational");
    assert.equal(operational.mwe, 0, `${row.company.name} has no operational capacity yet`);
    assert.match(row.ariaLabel, /operational/, `${row.company.name} states operational MWe in its label`);
    assert.equal(row.unitsToGigawatt, Math.ceil(1000 / row.entrant.unitMWe));
  }

  // Zeroing every framework megawatt must not reorder the board.
  const zeroed = dataModule.capacityClaims.map((claim) => claim.band === "framework" ? { ...claim, mwe: 0 } : claim);
  assert.deepEqual(
    dataModule.raceBoard(zeroed).map((row) => row.company.slug),
    board.map((row) => row.company.slug),
    "framework megawatts do not affect board order",
  );

  // Ranking runs strongest-band-first, not by total megawatts.
  const order = board.map((row) => row.company.slug);
  assert.ok(order.indexOf("oklo") < order.indexOf("holtec"), "a DOE-authorized build outranks a larger application in review");
  assert.ok(order.indexOf("terrapower") < order.indexOf("oklo"), "an NRC-permitted build outranks a DOE-pathway build");
});

test("race capacity counts hold a floor and stay in disjoint frames", async () => {
  const dataModule = await import("../app/data.ts");
  const totals = Object.fromEntries(dataModule.raceTotals().map((entry) => [entry.band, entry.mwe]));
  assert.ok(dataModule.raceEntrants.length >= 18, `entrant count floor: ${dataModule.raceEntrants.length}`);
  assert.equal(totals.operational, 0);
  assert.ok(totals.construction >= 365, `construction floor: ${totals.construction}`);
  assert.ok(totals["doe-authorized"] >= 75, `DOE-authorized floor: ${totals["doe-authorized"]}`);
  // Supersession, 2026-08-05: the floor was 1,235. NANO Nuclear's 15 MWe left
  // the review band because its NRC filing is for a non-power research reactor
  // at the University of Illinois, and the board's rule is that test reactors
  // contribute 0 MWe. The filing remains a proof event. A floor drop needs a
  // reason recorded here, never a quiet edit.
  assert.ok(totals.review >= 1220, `review floor: ${totals.review}`);
  // Supersession, 2026-08-05: the floor was 40,395. Cascade's 320 MWe funded
  // phase moved from the framework band to contracted, because Energy Northwest
  // and Amazon signed a development and funding agreement for it and only the
  // options-based remainder is an announcement. Capacity moved between bands;
  // none was lost.
  assert.ok(totals.framework >= 40075, `framework floor: ${totals.framework}`);
  assert.ok(totals.contracted >= 321, `contracted floor: ${totals.contracted}`);

  // Each claim sits in exactly one band, so the bands never double-count a megawatt.
  const summed = dataModule.capacityClaims.reduce((total, claim) => total + claim.mwe, 0);
  assert.equal(summed, Object.values(totals).reduce((total, value) => total + value, 0));
});

test("every record kind lands in exactly one dossier lane", async () => {
  const dataModule = await import("../app/data.ts");
  // A kind belonging to no lane would silently vanish from every dossier.
  const fundingLaned = dataModule.fundingFrames.flatMap((frame) => frame.kinds);
  const proofLaned = dataModule.proofLanes.flatMap((lane) => lane.kinds);
  assert.equal(new Set(fundingLaned).size, fundingLaned.length, "no funding kind is laned twice");
  assert.equal(new Set(proofLaned).size, proofLaned.length, "no proof kind is laned twice");
  for (const event of dataModule.fundingEvents) {
    assert.ok(fundingLaned.includes(event.kind), `funding kind "${event.kind}" has no lane`);
  }
  for (const event of dataModule.proofEvents) {
    assert.ok(proofLaned.includes(event.kind), `proof kind "${event.kind}" has no lane`);
  }
});

test("every entrant dossier renders every lane, with explicit empty states", async () => {
  const dataModule = await import("../app/data.ts");
  const lanes = ["Funding", "Pipeline", "Company-stated targets", ...dataModule.proofLanes.map((lane) => lane.lane)];

  for (const entrant of dataModule.raceEntrants) {
    const response = await render(`/companies/${entrant.companySlug}`);
    assert.equal(response.status, 200, entrant.companySlug);
    const raw = await response.text();
    // The RSC flight payload in a <script> mirrors the DOM text, so anything that
    // counts occurrences has to look at the document only, not the payload too.
    const html = raw.replace(/<!--.*?-->/g, "").replace(/<script[\s\S]*?<\/script>/gi, "");
    const visible = html.replace(/<[^>]+>/g, " ");
    const dossier = dataModule.dossierFor(entrant.companySlug);

    for (const lane of lanes) assert.ok(html.includes(lane), `${entrant.companySlug} renders the ${lane} lane`);
    assert.ok(html.includes(escapeHtml(entrant.design)), `${entrant.companySlug} shows its design`);
    assert.ok(html.includes(escapeHtml(entrant.rosterBasis)), `${entrant.companySlug} states why it is on the board`);
    // UX-001: most readers arrive from the board, so the way back leads there.
    assert.ok(html.includes(`href="/#race"`), `${entrant.companySlug} links back to the race board`);
    assert.ok(html.includes(`href="/companies"`), `${entrant.companySlug} keeps the directory link`);
    // Derived, never hand-written.
    assert.ok(html.includes(`${dossier.row.unitsToGigawatt} × ${entrant.unitMWe.toLocaleString("en-US")} MWe`), `${entrant.companySlug} shows gigawatt math`);
    // A private company says so rather than rendering a blank cell.
    assert.ok(html.includes(entrant.ticker ?? "Private"), `${entrant.companySlug} states its listing`);
    // No placeholder ever reaches the reader.
    for (const token of ["undefined", "NaN", "Infinity", "[object Object]"]) {
      assert.ok(!visible.includes(token), `${entrant.companySlug} leaks "${token}" into visible text`);
    }
    // Empty lanes say so out loud. Counted, not merely "some empty state exists
    // somewhere on the page" -- that version passed even with a lane's empty
    // state deleted, because other lanes' copy satisfied the match.
    const emptyProofLanes = dossier.proof.filter((lane) => lane.events.length === 0).length;
    assert.equal(
      (html.match(/Nothing on record in this lane/g) ?? []).length,
      emptyProofLanes,
      `${entrant.companySlug} labels each of its ${emptyProofLanes} empty proof lanes`,
    );
    for (const frame of dossier.funding) {
      const copy = `No ${frame.frame.toLowerCase()} money on record`;
      // Both directions: present when empty, absent when populated.
      assert.equal(html.includes(copy), frame.events.length === 0, `${entrant.companySlug} ${frame.frame} empty state matches its contents`);
    }
    assert.equal(html.includes("No reported cash position on record"), dossier.cash.length === 0, `${entrant.companySlug} cash empty state matches`);
    assert.equal(html.includes("No executed megawatts on record"), dossier.pipeline.executed.length === 0, `${entrant.companySlug} executed empty state matches`);
    assert.equal(html.includes("No announced pipeline on record"), dossier.pipeline.announced.length === 0, `${entrant.companySlug} announced empty state matches`);
    assert.equal(html.includes("No company-stated target on record"), dossier.targets.length === 0, `${entrant.companySlug} target empty state matches`);
  }
});

test("dossier ledger dates descend, with undated records last", async () => {
  const dataModule = await import("../app/data.ts");
  for (const entrant of dataModule.raceEntrants) {
    const html = (await (await render(`/companies/${entrant.companySlug}`)).text()).replace(/<!--.*?-->/g, "");
    for (const list of html.match(/<ul class="ledger[^"]*">[\s\S]*?<\/ul>/g) ?? []) {
      const dates = [...list.matchAll(/<span class="ledger-date">([^<]*)<\/span>/g)].map((match) => match[1]);
      const undatedAt = dates.findIndex((date) => date.includes("not stated"));
      const dated = dates.filter((date) => !date.includes("not stated"));
      if (undatedAt !== -1) {
        assert.equal(undatedAt, dated.length, `${entrant.companySlug} sorts undated records after dated ones`);
      }
      for (let i = 1; i < dated.length; i += 1) {
        assert.ok(dated[i - 1] >= dated[i], `${entrant.companySlug} ledger runs newest first: ${dated.join(" then ")}`);
      }
    }
  }
});

test("every rendered source link is https and every custom property is defined", async () => {
  const { readFile } = await import("node:fs/promises");
  const dataModule = await import("../app/data.ts");

  const html = await (await render(`/companies/${dataModule.raceEntrants[0].companySlug}`)).text();
  const external = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((match) => match[1]);
  assert.ok(external.length > 5, "the dossier links its sources");
  for (const href of external) assert.match(href, /^https:\/\//, `${href} uses https`);

  // An undefined var() fails silently: the property is simply dropped at paint.
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const declared = new Set([...css.match(/:root\s*\{([\s\S]*?)\}/)[1].matchAll(/--([\w-]+)\s*:/g)].map((match) => match[1]));
  const used = new Set([...css.matchAll(/var\(--([\w-]+)/g)].map((match) => match[1]));
  assert.deepEqual([...used].filter((token) => !declared.has(token)), [], "every var() resolves to a declared token");
});

test("shipped copy stays out of the AI register", async () => {
  const dataModule = await import("../app/data.ts");
  // DESIGN.md section 11.1. Enforced over the rendered build, per that section.
  const banned = [
    "delve", "leverage", "robust", "seamless", "elevate", "unlock", "empower", "harness",
    "tapestry", "testament", "underscore", "pivotal", "cutting-edge", "game-changer",
    "ever-evolving", "it's worth noting", "it's important to note", "when it comes to",
    "at the end of the day", "in conclusion", "at your fingertips", "next level",
    "designed to help you", "not only",
  ];
  const paths = ["/", "/methodology", "/companies", "/deployments", "/capital", "/federal-action", "/map",
    ...dataModule.raceEntrants.map((entrant) => `/companies/${entrant.companySlug}`)];

  for (const path of paths) {
    const raw = await (await render(path)).text();
    // Displayed prose only: attributes carry source titles and URLs we do not author.
    const prose = raw
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<!--.*?-->/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ");
    for (const word of banned) {
      assert.ok(!prose.toLowerCase().includes(word), `${path} ships "${word}" in visible copy`);
    }
    // House style: no em-dashes in displayed prose.
    assert.ok(!prose.includes("—"), `${path} ships an em-dash in visible copy`);
  }
});

test("the methodology page explains the race rules the board links to", async () => {
  const dataModule = await import("../app/data.ts");
  const raw = await (await render("/methodology")).text();
  const html = raw.replace(/<!--.*?-->/g, "").replace(/<script[\s\S]*?<\/script>/gi, "");

  // The board's legend links to /methodology#race, so the anchor has to exist.
  assert.match(html, /id="race"/, "the race anchor the board links to exists");
  for (const heading of ["Who is on the board", "What counts as a megawatt", "The six bands",
    "A DOE authorization is not an NRC license", "Binding and non-binding never merge"]) {
    assert.ok(html.includes(heading), `methodology explains: ${heading}`);
  }
  // Every band is defined with the authority that grants it, including the empty one.
  for (const band of dataModule.capacityBands) {
    assert.ok(html.includes(band.label), `methodology defines the ${band.label} band`);
    assert.ok(html.includes(`Granting authority: ${band.authority}`), `${band.label} states its authority`);
  }
  assert.match(html, /tracked sample/, "counts state their inclusion basis");
});

test("touch targets and band encoding survive in the stylesheet", async () => {
  const { readFile } = await import("node:fs/promises");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  // The 44px floor is scoped to coarse pointers so desktop keeps inline scale.
  // Measured in a real browser at 375px: without this block every board link is 24px.
  const coarse = css.match(/@media \(pointer: coarse\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(coarse, "a coarse-pointer block exists");
  assert.match(coarse[1], /min-height:\s*44px/, "it sets a 44px floor");
  // Descendant selector: a "> a" form missed the conflict source nested inside
  // .ledger-conflict, and the masthead's source link was omitted entirely.
  for (const selector of [".race-id h3 a", ".ledger li a", ".back-link", ".masthead-context a", ".roster-basis a"]) {
    assert.ok(coarse[1].includes(selector), `${selector} gets the touch floor`);
  }

  // The legend swatch must not out-rank a band's own border, or the legend stops
  // showing the encoding it exists to teach (the review band's outline).
  const swatchAt = css.indexOf(".legend-swatch {");
  const bandAt = css.indexOf(".band-review {");
  // Both must exist: indexOf returns -1 when a rule is deleted, and -1 is less
  // than any real index, so a bare "<" comparison passes on a missing rule.
  assert.ok(swatchAt >= 0, "the legend swatch rule exists");
  assert.ok(bandAt >= 0, "the review band rule exists");
  assert.ok(swatchAt < bandAt, "legend-swatch is declared before the band rules so band borders win");
  // Evidence is encoded by fill and outline, never by hue alone.
  assert.match(css, /\.band-review \{[^}]*border:\s*2px solid/, "review renders as an outline");
  assert.match(css, /\.band-contracted \{[^}]*repeating-linear-gradient/, "contracted renders as a hatch");
  assert.match(css, /\.band-framework \{[^}]*repeating-linear-gradient/, "framework renders as a hatch");
  // Hatching is CSS, not a charting library.
  assert.doesNotMatch(css, /chart|d3|recharts/i);
});

test("no text-carrying element ever renders blank", async () => {
  const dataModule = await import("../app/data.ts");
  // The project rule is that null renders as an explicit placeholder, never a
  // blank element. This guards the class: a PR review found the companies
  // directory rendering an empty <b></b> for the stage of a roster entrant with
  // no tracked project, while the detail page handled the same case correctly.
  const paths = ["/", "/methodology", "/companies", "/deployments", "/capital", "/federal-action", "/map",
    ...dataModule.companies.map((company) => `/companies/${company.slug}`)];

  for (const path of paths) {
    const html = (await (await render(path)).text())
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<!--.*?-->/g, "");
    for (const tag of ["b", "strong", "dd", "h1", "h2", "h3", "td"]) {
      const empty = [...html.matchAll(new RegExp(`<${tag}(\\s[^>]*)?></${tag}>`, "g"))];
      assert.equal(empty.length, 0, `${path} renders an empty <${tag}${empty[0]?.[1] ?? ""}>`);
    }
  }
});

test("every company card states a stage or says it has no tracked project", async () => {
  const dataModule = await import("../app/data.ts");
  const html = (await (await render("/companies")).text()).replace(/<!--.*?-->/g, "").replace(/<script[\s\S]*?<\/script>/gi, "");
  const projectless = dataModule.companies.filter((company) => company.projectSlugs.length === 0);
  assert.ok(projectless.length > 0, "the roster still includes a company with no tracked project");
  assert.equal(
    (html.match(/No tracked project<\/b>/g) ?? []).length,
    projectless.length,
    "each projectless company card states so explicitly",
  );
});

test("every entrant's unit rating obeys the roster rule", async () => {
  const dataModule = await import("../app/data.ts");
  for (const entrant of dataModule.raceEntrants) {
    // The roster rule caps an entrant at roughly 350 MWe per unit.
    assert.ok(entrant.unitMWe > 0 && entrant.unitMWe <= 350, `${entrant.companySlug} is rated ${entrant.unitMWe} MWe`);
    assert.equal(entrant.lane, entrant.unitMWe >= 50 ? "Grid-scale SMR" : "Microreactor", `${entrant.companySlug} lane matches its rating`);

    // A roster basis must say what the company HAS, never what it lacks. This
    // is the guard that catches the real defect a PR review found: Westinghouse
    // was rated 300 MWe on the AP300 while its own basis read "AP300 has no
    // named U.S. site", so the row asserted a position its evidence denied.
    // A row rated by one design and justified by another is otherwise a
    // judgment call no test can make.
    assert.doesNotMatch(
      entrant.rosterBasis,
      /\b(no|not|never|lacks|without|absent|unnamed)\b/i,
      `${entrant.companySlug} qualifies on affirmative evidence, not on an absence`,
    );
  }
});

test("band entrant counts include companies whose capacity is undisclosed", async () => {
  const dataModule = await import("../app/data.ts");
  for (const total of dataModule.raceTotals()) {
    const expected = new Set(
      dataModule.capacityClaims.filter((claim) => claim.band === total.band).map((claim) => claim.companySlug),
    ).size;
    // An agreement of undisclosed size is still an agreement. Counting on
    // mwe > 0 dropped Aalo and BWXT and made the legend contradict their rows.
    assert.equal(total.entrants, expected, `${total.band} counts every entrant with a claim`);
  }
  const framework = dataModule.raceTotals().find((total) => total.band === "framework");
  const undisclosed = dataModule.capacityClaims.filter((claim) => claim.band === "framework" && claim.mwe === 0);
  assert.ok(undisclosed.length > 0, "the dataset still exercises the undisclosed-capacity case");
  for (const claim of undisclosed) {
    assert.ok(
      dataModule.raceTotals().find((total) => total.band === "framework").entrants >= 1,
      `${claim.companySlug} is counted in the framework band`,
    );
  }
  assert.equal(framework.entrants, 13);
});

test("every race record's reporting basis matches its source tier", async () => {
  const dataModule = await import("../app/data.ts");
  // A review found trade-press articles labelled Government-reported, which
  // misstates the methodology's source hierarchy. Roughly twenty records were
  // wrong, so the tier is derived from the host rather than trusted to the eye.
  for (const record of [...dataModule.capacityClaims, ...dataModule.proofEvents]) {
    assert.equal(
      record.verification,
      dataModule.verificationForSource(record.source),
      `${record.companySlug} "${(record.label ?? "").slice(0, 40)}" is labelled ${record.verification} on ${new URL(record.source).host}`,
    );
  }
  // Press is the default, so an unknown host can never silently claim a
  // stronger tier than it has earned.
  assert.equal(dataModule.verificationForSource("https://example.com/a"), "Press-reported");
  assert.equal(dataModule.verificationForSource("https://www.federalregister.gov/x"), "Verified");
  assert.equal(dataModule.verificationForSource("https://www.energy.gov/x"), "Government-reported");
  // All four tiers are represented, so no legend or filter value renders empty.
  const used = new Set([...dataModule.capacityClaims, ...dataModule.proofEvents].map((record) => record.verification));
  for (const tier of ["Verified", "Government-reported", "Institution-reported", "Company-reported", "Press-reported"]) {
    assert.ok(used.has(tier), `the dataset carries at least one ${tier} record`);
  }
});

test("stated targets are targets, not editorial absences", async () => {
  const dataModule = await import("../app/data.ts");
  for (const target of dataModule.statedTargets) {
    // An absence belongs in the lane's empty state, where it needs no source.
    // A row saying "no date stated" cited to an unrelated project page was
    // caught in review.
    assert.doesNotMatch(target.target, /^No\b/i, `${target.companySlug} states a target rather than an absence`);
  }
  // The company with no target on record still renders the explicit empty state.
  const withTarget = new Set(dataModule.statedTargets.map((target) => target.companySlug));
  const without = dataModule.raceEntrants.filter((entrant) => !withTarget.has(entrant.companySlug));
  assert.ok(without.length > 0, "the dataset still exercises the no-target case");
  for (const entrant of without) {
    const html = await (await render(`/companies/${entrant.companySlug}`)).text();
    assert.match(html, /No company-stated target on record/, `${entrant.companySlug} says it has no stated target`);
  }
});

test("a company's capacity claims describe different projects", async () => {
  const dataModule = await import("../app/data.ts");
  // X-energy's Long Mott (Dow, Texas, under review) and Cascade (Energy
  // Northwest, Washington, inside the Amazon framework) share a 4 x 80 MWe
  // rating and nothing else. A PR review read them as one project and reported
  // a double count. They are separate, and each label must say where it is.
  const xenergy = dataModule.capacityClaims.filter((claim) => claim.companySlug === "x-energy");
  const review = xenergy.find((claim) => claim.band === "review");
  const framework = xenergy.find((claim) => claim.band === "framework");
  const contracted = xenergy.find((claim) => claim.band === "contracted");
  assert.match(review.label, /Texas/, "the reviewed project names its state");
  assert.match(contracted.label, /Washington/, "the funded Cascade phase names its state");
  assert.match(framework.label, /separate from the Texas project under review/, "the framework says it does not contain the reviewed project");
  assert.match(framework.label, /beyond the funded Cascade phase/, "the framework excludes the phase now counted as contracted");

  // Every claim label opens with a distinct project or counterparty per company,
  // so no two claims can silently describe the same megawatts.
  for (const entrant of dataModule.raceEntrants) {
    const labels = dataModule.capacityClaims
      .filter((claim) => claim.companySlug === entrant.companySlug)
      .map((claim) => claim.label.split(" · ")[0]);
    assert.equal(new Set(labels).size, labels.length, `${entrant.companySlug} names each claim's project distinctly`);
  }
});

test("a conflicting account carries its own source", async () => {
  const dataModule = await import("../app/data.ts");
  const conflicts = dataModule.statedTargets.filter((target) => target.conflict);
  assert.ok(conflicts.length > 0, "the dataset still exercises the conflict case");
  for (const target of conflicts) {
    // The conflict comes from a different publication than the target it
    // disputes, so the target's source cannot stand in for it.
    assert.match(target.conflictSource ?? "", /^https:\/\//, `${target.companySlug} sources its conflicting account`);
    assert.notEqual(target.conflictSource, target.source, `${target.companySlug} cites a different source for the conflict`);
    const html = await (await render(`/companies/${target.companySlug}`)).text();
    assert.ok(html.includes(target.conflictSource), `${target.companySlug} links the conflict's source`);
  }
});

test("debt never renders inside the equity frame", async () => {
  const dataModule = await import("../app/data.ts");
  const equity = dataModule.fundingFrames.find((frame) => frame.frame === "Raised");
  const borrowed = dataModule.fundingFrames.find((frame) => frame.frame === "Borrowed");
  assert.ok(equity && borrowed, "the equity and debt frames both exist");

  for (const event of dataModule.fundingEvents.filter((record) => equity.kinds.includes(record.kind))) {
    // A round announced as "$470M ($370M equity + $100M debt)" rendered whole
    // inside a frame defined as equity. Rounds are split so each part sits in
    // its own frame and the amounts stay honest.
    assert.doesNotMatch(event.amount, /\bdebt\b|credit facility/i, `${event.companySlug} shows debt in the equity frame: ${event.amount}`);
  }
  for (const event of dataModule.fundingEvents.filter((record) => equity.kinds.includes(record.kind))) {
    // A registration filed raises nothing. Holtec's unpriced S-1 and
    // Westinghouse's confidential filing both rendered as money raised.
    assert.match(event.amount, /\$/, `${event.companySlug} states an amount raised: ${event.amount}`);
    assert.doesNotMatch(event.amount, /\bfiled\b|not priced|not disclosed/i, `${event.companySlug} reports a filing as a raise: ${event.amount}`);
  }
  const filed = dataModule.fundingFrames.find((frame) => frame.frame === "Filed, not raised");
  assert.ok(filed, "filings have their own frame");
  assert.ok(dataModule.fundingEvents.some((event) => filed.kinds.includes(event.kind)), "the filing frame carries records");

  // A cumulative figure spanning equity and debt is a cross-frame sum, which
  // the capital rules forbid.
  for (const event of dataModule.fundingEvents) {
    assert.doesNotMatch(event.amount, /disclosed cumulative|disclosed across rounds/i, `${event.companySlug} sums across frames: ${event.amount}`);
  }
  assert.ok(dataModule.fundingEvents.some((event) => event.kind === "Venture debt"), "the dataset carries private debt");
});

test("no capacity claim rates a non-power reactor", async () => {
  const dataModule = await import("../app/data.ts");
  // NANO Nuclear's review claim carried the 15 MWe commercial KRONOS rating
  // while the filing it cited is for a non-power research reactor at the
  // University of Illinois. Test and research reactors contribute 0 MWe.
  const nano = dataModule.raceBoard().find((row) => row.entrant.companySlug === "nano-nuclear");
  assert.equal(nano.executedMWe, 0, "NANO's research-reactor filing carries no capacity");
  const nonPowerProjects = dataModule.projects.filter((project) => /non-power/i.test(project.capacity));
  assert.ok(nonPowerProjects.length > 0, "the dataset still tracks a non-power reactor");
  for (const project of nonPowerProjects) {
    const claims = dataModule.capacityClaims.filter((claim) => claim.label.includes(project.location.split(",")[0]));
    for (const claim of claims) {
      assert.equal(claim.mwe, 0, `${claim.label} rates a non-power reactor at ${claim.mwe} MWe`);
    }
  }
});

test("prose that quotes race figures matches the data it describes", async () => {
  const { readFile } = await import("node:fs/promises");
  const dataModule = await import("../app/data.ts");
  const totals = Object.fromEntries(dataModule.raceTotals().map((entry) => [entry.band, entry.mwe]));
  const building = totals.construction + totals["doe-authorized"];
  const executed = dataModule.raceTotals().filter((entry) => entry.band !== "framework").reduce((sum, entry) => sum + entry.mwe, 0);
  const group = (value) => value.toLocaleString("en-US");

  // A number written beside the data it describes goes stale silently. The
  // README, the implementation record, and uat.md each shipped a figure that
  // the data had already moved past, three separate times.
  const files = [
    ["../README.md", [group(totals.framework), group(building), String(dataModule.raceEntrants.length)]],
    ["../docs/gigawatt-race-implementation-record.md", [group(totals.framework), group(totals.review), group(totals.contracted)]],
  ];
  for (const [path, figures] of files) {
    const prose = await readFile(new URL(path, import.meta.url), "utf8");
    assert.ok(prose.length > 500, `${path} was read`);
    for (const figure of figures) {
      assert.ok(prose.includes(figure), `${path} is missing the current figure ${figure}`);
    }
  }

  // Both ratios are rendered live, so the prose must agree with what a reader sees.
  const record = await readFile(new URL("../docs/gigawatt-race-implementation-record.md", import.meta.url), "utf8");
  const claimless = dataModule.raceEntrants.filter((entrant) =>
    !dataModule.capacityClaims.some((claim) => claim.companySlug === entrant.companySlug));
  const spelled = ["zero", "One", "Two", "Three", "Four", "Five", "Six"][claimless.length];
  assert.ok(record.includes(`${spelled}\nentrants have no capacity claim`) || record.includes(`${spelled} entrants have no capacity claim`),
    `the record says ${spelled} entrants have no capacity claim`);
  for (const entrant of claimless) {
    const company = dataModule.companies.find((item) => item.slug === entrant.companySlug);
    // Match the distinctive first token: the prose uses short forms ("Antares",
    // "NANO Nuclear") where the dataset carries the full legal name.
    assert.ok(record.includes(company.name.split(" ")[0]), `the record names ${company.name} among the claimless`);
  }
  assert.ok(record.includes(`**${Math.round(totals.framework / executed)} to one**`), "the executed ratio in the record is current");
  assert.ok(record.includes(`**${Math.round(totals.framework / building)} to one**`), "the building ratio in the record is current");
});

test("a program selection is never filed under permits or physical work", async () => {
  const dataModule = await import("../app/data.ts");
  // Being chosen for a program, or signing an agreement to pursue one, is
  // neither a regulator's authorization nor work at a site. A review found an
  // unawarded Air Force finalist status rendering under "Physical progress"
  // and a program naming rendering under "Licensing".
  const grantsPermission = /\b(approved|issued|accepted|extended|granted|authoriz|submitted|filed)/i;
  const isSelection = /\b(selected|named one of|finalists?|other transaction agreement|signed)\b/i;

  for (const event of dataModule.proofEvents.filter((record) => record.kind === "Permit / authorization")) {
    assert.match(event.label, grantsPermission, `"${event.label.slice(0, 60)}" names the authorizing act`);
    assert.doesNotMatch(event.label, isSelection, `"${event.label.slice(0, 60)}" is a selection, not an authorization`);
  }
  for (const event of dataModule.proofEvents.filter((record) => record.kind === "Test program")) {
    assert.doesNotMatch(event.label, isSelection, `"${event.label.slice(0, 60)}" is a selection, not work at a site`);
  }
  // The physical lane is work at a site. A licence granted and a contract
  // signed are neither, and both rendered there under "Fuel milestone".
  const isPaperwork = /\b(issued|approved|granted|authorized|accepted|signed)\b|\blicense\b/i;
  const physicalKinds = dataModule.proofLanes.find((lane) => lane.lane === "Physical progress").kinds;
  for (const event of dataModule.proofEvents.filter((record) => physicalKinds.includes(record.kind))) {
    assert.doesNotMatch(event.label, isPaperwork, `"${event.label.slice(0, 60)}" is paperwork, not work at a site`);
  }

  const selections = dataModule.proofEvents.filter((record) => record.kind === "Program selection / agreement");
  assert.ok(selections.length >= 4, `the dataset carries programme selections: ${selections.length}`);
  for (const event of selections) {
    assert.match(event.label, isSelection, `"${event.label.slice(0, 60)}" reads as a selection or agreement`);
  }
});

test("a dossier never attributes its state to a regulator that did not document it", async () => {
  const dataModule = await import("../app/data.ts");
  for (const entrant of dataModule.raceEntrants) {
    const html = (await (await render(`/companies/${entrant.companySlug}`)).text()).replace(/<!--.*?-->/g, "");
    // The strongest state can rest on press reporting about a counterparty
    // agreement, or on a company release. A fixed "Regulator-documented"
    // prefix overstated provenance on every such dossier.
    assert.doesNotMatch(html, /Regulator-documented state/, `${entrant.companySlug} does not claim regulator provenance by default`);
    const row = dataModule.raceBoard().find((entry) => entry.entrant.companySlug === entrant.companySlug);
    if (row.strongest && dataModule.statedTargets.some((target) => target.companySlug === entrant.companySlug)) {
      for (const claim of row.strongest.claims) {
        assert.ok(html.includes(claim.verification), `${entrant.companySlug} shows the basis of its strongest state (${claim.verification})`);
      }
    }
  }
});

test("llms.txt is generated from the data and stays in sync", async () => {
  const { readFile } = await import("node:fs/promises");
  const dataModule = await import("../app/data.ts");
  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8");

  // Generated, never hand-edited. scripts/build-llms-txt.mjs --check enforces
  // byte equality; this asserts the content a machine reader depends on.
  assert.match(llms, /Do not edit by hand/);
  assert.ok(llms.includes(`Data as of ${dataModule.dataAsOf}`), "llms.txt states the data date");
  for (const band of dataModule.capacityBands) {
    const total = dataModule.raceTotals().find((entry) => entry.band === band.band);
    assert.ok(llms.includes(`**${band.label}** (${total.mwe.toLocaleString("en-US")} MWe`), `llms.txt carries the ${band.label} total`);
  }
  // The headline lines come from the same helper the homepage strip renders,
  // recomputed here so a generator that stops using it fails the moment the
  // definitions diverge.
  const headline = dataModule.headlineTotals();
  assert.ok(llms.includes(`${headline.buildingMWe.toLocaleString("en-US")} MWe is physically under construction`), "llms.txt building figure matches headlineTotals");
  assert.ok(llms.includes(`${headline.executedMWe.toLocaleString("en-US")} MWe rests on an executed action`), "llms.txt executed figure matches headlineTotals");
  assert.ok(llms.includes(`${headline.announcedMWe.toLocaleString("en-US")} MWe has been announced without binding documents`), "llms.txt announced figure matches headlineTotals");
  for (const entrant of dataModule.raceEntrants) {
    const company = dataModule.companies.find((item) => item.slug === entrant.companySlug);
    assert.ok(llms.includes(company.name), `llms.txt lists ${company.name}`);
    assert.ok(llms.includes(entrant.rosterSource), `llms.txt cites why ${company.name} qualifies`);
  }
  // The rules a reader needs to not misuse the numbers.
  for (const rule of ["never added together", "count 0 MWe", "never moves a megawatt", "U.S. megawatts only"]) {
    assert.ok(llms.includes(rule), `llms.txt states the rule: ${rule}`);
  }
  // It is served as a static file, so it must land in the build output.
  const built = await readFile(new URL("../dist/client/llms.txt", import.meta.url), "utf8");
  assert.equal(built, llms, "the built llms.txt matches the committed one");
});

test("every page passes the accessibility checks a screen reader depends on", async () => {
  const dataModule = await import("../app/data.ts");
  const paths = ["/", "/updates", "/methodology", "/companies", "/deployments", "/capital", "/federal-action", "/map",
    ...dataModule.raceEntrants.slice(0, 4).map((entrant) => `/companies/${entrant.companySlug}`)];

  for (const path of paths) {
    const raw = await (await render(path)).text();
    const html = raw.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<!--.*?-->/g, "");

    assert.match(raw, /<html[^>]+lang="en"/, `${path} declares a language`);
    assert.match(html, /<a[^>]*class="skip-link"[^>]*href="#main"/, `${path} has a skip link`);
    assert.match(html, /id="main"/, `${path} has the skip-link target`);

    // Every image carries alt text. An empty alt is allowed only when the image
    // is decorative and marked aria-hidden.
    for (const [tag] of [...html.matchAll(/<img\b[^>]*>/g)].map((match) => [match[0]])) {
      assert.match(tag, /\salt="/, `${path} has an image with no alt attribute: ${tag.slice(0, 80)}`);
      if (/alt=""/.test(tag)) assert.match(tag, /aria-hidden="true"/, `${path} has an empty alt that is not marked decorative`);
    }

    // Every link has an accessible name: text content, or an explicit label.
    for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
      const [, attrs, inner] = match;
      const visible = inner.replace(/<[^>]+>/g, "").replace(/&[a-z]+;|&#x?[0-9a-f]+;/gi, "").trim();
      const labelled = /aria-label="[^"]+"/.test(attrs) || /aria-labelledby="/.test(attrs);
      assert.ok(visible.length > 0 || labelled, `${path} has a link with no accessible name: ${match[0].slice(0, 90)}`);
    }

    // Headings descend without skipping a level, so the outline is navigable.
    const levels = [...html.matchAll(/<h([1-4])\b/g)].map((match) => Number(match[1]));
    assert.equal(levels[0], 1, `${path} starts at h1`);
    assert.equal(levels.filter((level) => level === 1).length, 1, `${path} has exactly one h1`);
    for (let i = 1; i < levels.length; i += 1) {
      assert.ok(levels[i] - levels[i - 1] <= 1, `${path} skips from h${levels[i - 1]} to h${levels[i]}`);
    }

    // Duplicate ids break every id-based association, including labels.
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${path} repeats an id: ${ids.find((id, i) => ids.indexOf(id) !== i)}`);

    // A hidden subtree must not contain anything focusable.
    for (const match of html.matchAll(/<([a-z]+)\b[^>]*aria-hidden="true"[^>]*>([\s\S]{0,400}?)<\/\1>/g)) {
      assert.doesNotMatch(match[2], /<a\s|<button\s|tabindex="0"/, `${path} hides a focusable element from assistive tech`);
    }
  }
});

test("every CI action is pinned to a commit SHA", async () => {
  const { readFile, readdir } = await import("node:fs/promises");
  const dir = new URL("../.github/workflows/", import.meta.url);
  const files = (await readdir(dir)).filter((name) => name.endsWith(".yml"));
  assert.ok(files.length >= 2, "workflows were found to check");

  for (const file of files) {
    const yaml = await readFile(new URL(file, dir), "utf8");
    const uses = [...yaml.matchAll(/uses:\s*(\S+)/g)].map((match) => match[1]);
    assert.ok(uses.length > 0, `${file} declares actions`);
    for (const ref of uses) {
      // CLAUDE.md: every `uses:` pinned to a 40-char SHA, not a moving tag.
      // deploy-pages.yml shipped on @v4/@v5/@v3 while holding pages:write.
      assert.match(ref, /@[0-9a-f]{40}$/, `${file} pins ${ref} to a moving tag`);
    }
    // A SHA with no version comment is unreviewable.
    for (const line of yaml.split("\n").filter((row) => row.includes("uses:"))) {
      assert.match(line, /#\s*v\d/, `${file} has a SHA with no version comment: ${line.trim()}`);
    }
  }
});

test("CI runs the data validation, not just the unit tests", async () => {
  const { readFile } = await import("node:fs/promises");
  const ci = await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
  // The in-suite tier test covers capacityClaims and proofEvents. The validator
  // covers every sourced record, including roster sources, funding, targets,
  // projects and companies. Without this step those merge unchecked.
  assert.match(ci, /npm run data:check/, "ci.yml runs data:check");

  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  for (const script of ["data:validate", "data:llms", "data:prose", "data:check"]) {
    assert.ok(pkg.scripts[script], `package.json defines ${script}`);
  }
  assert.match(pkg.scripts["data:check"], /validate-sources/, "data:check validates sources");
  assert.match(pkg.scripts["data:check"], /--check/, "data:check verifies llms.txt is current");
  assert.match(pkg.scripts["data:check"], /audit-prose/, "data:check reads the shipped prose");
});

test("the link checker refuses a bad --limit instead of checking nothing", async () => {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const { fileURLToPath } = await import("node:url");
  const run = promisify(execFile);
  // fileURLToPath, not .pathname: this repository lives under a directory with a
  // space in its name, and .pathname hands back a percent-encoded string that
  // node cannot resolve as a file.
  const script = fileURLToPath(new URL("../scripts/check-links.mjs", import.meta.url));

  // `--limit notanumber` produced NaN, slice(0, NaN) returned [], and the run
  // printed "live 0 · blocked 0 · dead 0" and exited 0. A typo made the check
  // pass while checking nothing.
  for (const bad of [["--limit", "notanumber"], ["--limit", "0"], ["--limit", "-3"], ["--limit"]]) {
    await assert.rejects(
      run(process.execPath, [script, ...bad]),
      (error) => error.code === 2,
      `check-links rejects ${bad.join(" ")}`,
    );
  }
  // A good limit still resolves work, without fetching anything.
  const { stdout } = await run(process.execPath, [script, "--limit", "5", "--dry-run"]);
  assert.match(stdout, /5 unique source URL\(s\)/);
});

test("the news watch list is derived from cited sources and excludes wire-service aggregators", async () => {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const { fileURLToPath } = await import("node:url");
  const run = promisify(execFile);
  const script = fileURLToPath(new URL("../scripts/check-news.mjs", import.meta.url));

  // --list only derives the watch roots from already-cited URLs; it fetches nothing.
  const { stdout } = await run(process.execPath, [script, "--list"]);
  assert.match(stdout, /watch root\(s\) derived from \d+ sourced records/);
  // A real, single-organization newsroom this dataset cites should surface.
  assert.match(stdout, /oklo\.com\/newsroom/);
  assert.match(stdout, /x-energy\.com\/news/);
  // A wire service or multi-company aggregator's front page churns regardless
  // of what any tracked company did, so watching it would report "changed" on
  // nearly every run. None of backlog.md's named low-quality aggregators, and
  // none of the general newswires found deriving the list, should appear.
  for (const aggregator of ["businesswire.com", "bloomberg.com", "tipranks.com", "ans.org", "utilitydive.com", "neimagazine.com"]) {
    assert.doesNotMatch(stdout, new RegExp(aggregator.replace(".", "\\.")), `${aggregator} is filtered out of the watch list`);
  }
  // A real organization's own page still isn't the tracked company's own
  // newsroom (a SPAC-news wire that happened to cover an IPO, a university's
  // general feed for one grant, a think tank's press page for one quote,
  // a national government's whole-of-government feed): found in a
  // 2026-08-23 review of the initially-derived list, same failure shape as
  // the wire services above even though none of these are multi-company
  // aggregators in the ordinary sense.
  for (const unrelated of ["spacconference.com", "thebreakthrough.org", "illinois.edu", "gov.uk", "postguam.com", "senate.gov", "tn.gov"]) {
    assert.doesNotMatch(stdout, new RegExp(unrelated.replace(".", "\\.")), `${unrelated} is filtered out of the watch list`);
  }
});

test("the news watch script fails loud when every root is blocked, not just when fetches error", async () => {
  // A run where every host answers 403 looks identical to a healthy one if
  // only network-level failures gate the exit code: a wall response
  // increments a separate counter from a thrown fetch, so a "most fetches
  // failed" check that only reads the failed counter passes at 0 real pages
  // observed. Reported by Codex on PR #14; fixed to also fail when nothing
  // was actually observed, regardless of which counter absorbed the misses.
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../scripts/check-news.mjs", import.meta.url), "utf8");
  assert.match(source, /tally\.blocked \+ tally\.failed/, "the failure threshold counts blocked roots, not only failed ones");
  assert.match(source, /observed === 0/, "an all-blocked or all-thin run with zero pages actually observed fails loud even below the ratio threshold");
  // A blocked/failed/thin root is persisted with no hash. Its first
  // successful fetch is a baseline, not a "change" — but `!previous` is
  // true only for a root with literally no prior entry, so a root that
  // previously failed (and so has a `previous` with no `hash`) would read
  // as "changed" the moment it recovers, inventing drift where there was
  // no baseline to compare against. Codex found this on PR #14.
  assert.match(source, /!previous\?\.hash/, "recovery from a no-hash state is treated as a first observation, not a change");
});

test("a company past a gigawatt is reported, not silently clipped", async () => {
  const dataModule = await import("../app/data.ts");
  // No entrant currently exceeds the track, so assert both directions: the
  // marker is absent today, and the data layer surfaces the condition the
  // component renders it from.
  const html = (await (await render("/")).text()).replace(/<!--.*?-->/g, "");
  assert.doesNotMatch(html, /past the end of the track/, "no row overflows the track today");
  for (const row of dataModule.raceBoard()) {
    assert.ok(row.executedMWe <= dataModule.raceScaleMWe, `${row.company.name} fits the track`);
  }

  // Inflate one claim past the scale and confirm the row reports it.
  const inflated = dataModule.capacityClaims.map((claim) =>
    claim.companySlug === "holtec" && claim.band === "review" ? { ...claim, mwe: 2400 } : claim);
  const overflowed = dataModule.raceBoard(inflated).find((row) => row.company.slug === "holtec");
  assert.ok(overflowed.executedMWe > dataModule.raceScaleMWe, "the inflated row exceeds the track");
  assert.match(overflowed.ariaLabel, /2,400 MWe under review/, "the label still states the true figure");

  // And the dossier never claims more than a full gigawatt of progress.
  const { readFile } = await import("node:fs/promises");
  const dossier = await readFile(new URL("../app/companies/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(dossier, /executedMWe >= gigawattMWe/, "the page branches before the percentage can exceed 100");
});

test("the prose linter matches whole words", async () => {
  const { readFile } = await import("node:fs/promises");
  const audit = await readFile(new URL("../scripts/audit-prose.mjs", import.meta.url), "utf8");
  // Substring matching would fire inside a longer word, and two entries with
  // ordinary uses were hard failures with no escape hatch.
  assert.match(audit, /\\\\b\(\$\{BANNED/, "the pattern is anchored on word boundaries");
  const banned = audit.slice(audit.indexOf("const BANNED = ["), audit.indexOf("];", audit.indexOf("const BANNED = [")));
  assert.ok(banned.length > 100, "the banned list was located");
  // Parse the actual [term, reason] entries, not a raw substring search over
  // the block: a substring check can't tell an array entry from a comment
  // that merely *names* the excluded word while explaining why it's excluded
  // (exactly the comments this file carries for realm/landscape/comprehensive),
  // and a false trip there would hide a real regression the next time this
  // test is touched.
  const entries = [...banned.matchAll(/\["([^"]+)",\s*"([^"]+)"\]/g)];
  assert.ok(entries.length > 30, `most banned entries were parsed as [term, reason] pairs (found ${entries.length})`);
  const terms = new Set(entries.map(([, term]) => term));
  for (const word of ["realm", "not only", "comprehensive"]) {
    assert.ok(!terms.has(word), `"${word}" is not a hard failure (real collisions: e.g. CTBT, CERCLA)`);
  }
  for (const word of ["delve", "seamless", "leverage", "myriad", "boasts", "showcases", "imagine", "crucial"]) {
    assert.ok(terms.has(word), `"${word}" is still banned`);
  }
  // Every banned entry carries a reason, not just a term: this is a
  // source-cited site, so a banned word gets the same "why" a banned claim
  // would. A stray one-string entry (no comma, no reason) fails silently at
  // runtime (destructuring [term] leaves reason undefined) rather than
  // loudly, so this is worth asserting directly.
  for (const [, term, reason] of entries) {
    assert.ok(reason.length > 15, `"${term}"'s reason is a real sentence, not a stub`);
  }
});

test("the structural-tell patterns fire on a crafted example and not on clean, sourced prose", async () => {
  const { readFile } = await import("node:fs/promises");
  const audit = await readFile(new URL("../scripts/audit-prose.mjs", import.meta.url), "utf8");
  const block = audit.slice(audit.indexOf("const STRUCTURAL_TELLS"), audit.indexOf("];", audit.indexOf("const STRUCTURAL_TELLS")));
  // Pull the real regex literals out of the source rather than re-typing them
  // here, so a future edit to the pattern is what this test exercises, not a
  // hand-copied stand-in that could silently drift from the shipped rule.
  const literals = [...block.matchAll(/pattern:\s*\/((?:\\.|[^/\\])*)\/([a-z]*)/g)];
  assert.equal(literals.length, 6, "all six structural-tell patterns were located in the source");
  const patterns = literals.map(([, body, flags]) => new RegExp(body, flags));
  // Every tell carries a reason too, same rule as the banned words above.
  const reasons = [...block.matchAll(/reason:\s*"([^"]+)"/g)].map(([, reason]) => reason);
  assert.equal(reasons.length, 6, "every structural tell has a reason");
  for (const reason of reasons) assert.ok(reason.length > 15, "the reason is a real sentence, not a stub");

  const bad = [
    "The program is not just a subsidy, it's a foothold for future contracts.",
    "Industry reports suggest the schedule will slip into next year.",
    "See the earlier analysis [cite: 12] for the full breakdown.",
    "The catch? Nobody has actually closed a contract yet.",
    "The **key finding** is that no unit has finished construction.",
    "The reactor reached criticality \u{1F389} for the first time.",
  ];
  patterns.forEach((pattern, i) => assert.match(bad[i], pattern, `structural tell ${i} fires on its crafted example`));

  const clean = "The program funds a 25-year PPA and a $200M credit facility, both executed and sourced.";
  patterns.forEach((pattern) => assert.doesNotMatch(clean, pattern, "a clean, cited sentence trips no structural tell"));
});

test("llms.txt counts read as English", async () => {
  const { readFile } = await import("node:fs/promises");
  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8");
  assert.doesNotMatch(llms, /\b1 companies\b/, "singular counts use the singular noun");
  assert.match(llms, /\b1 company\b/, "the dataset still exercises a single-entrant band");
  // The base URL is derived from the same variable the app uses.
  const generator = await readFile(new URL("../scripts/build-llms-txt.mjs", import.meta.url), "utf8");
  assert.match(generator, /NEXT_PUBLIC_SITE_URL/, "the generator derives the site URL rather than hardcoding it");
  assert.equal((generator.match(/pranava0x0\.github\.io/g) ?? []).length, 1, "the host appears once, as a fallback");

  // Run the generator's own --check. Reading the committed file alone cannot
  // see a change to the generator: reverting the pluralisation fix left this
  // test green because the stale file on disk still read correctly.
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const { fileURLToPath } = await import("node:url");
  const { stdout } = await promisify(execFile)(process.execPath, [
    fileURLToPath(new URL("../scripts/build-llms-txt.mjs", import.meta.url)), "--check",
  ]);
  assert.match(stdout, /matches the data/, "the committed llms.txt is what the generator produces today");
});

test("the source cache is committed and refuses to store refusal pages", async () => {
  const { readIndex, readCachedText, looksLikeWall, apiUrlFor } = await import("../scripts/lib/source-cache.mjs");
  const index = await readIndex();

  assert.ok(Object.keys(index.sources).length > 100, "the cache index covers the dataset");

  // A wall page returns 200 with real-looking text. Storing one is a silent
  // failure: three Federal Register snapshots were 1,180 bytes of "Request
  // Access" and made hand-verified records report as unconfirmed.
  // Long enough that only the marker check can catch it. A short sample was
  // caught by the length check instead, so disabling the markers left this green.
  const longWall = "Federal Register :: Request Access\nDue to aggressive automated scraping of FederalRegister.gov, "
    + "programmatic access is limited to our developer APIs. ".repeat(40);
  assert.ok(longWall.length > 800, "the sample is past the length floor");
  assert.match(looksLikeWall(longWall) ?? "", /interstitial/, "a long interstitial is caught by its marker, not its length");
  assert.match(looksLikeWall("tiny") ?? "", /bytes/, "a near-empty page is caught by length");
  assert.equal(looksLikeWall("x".repeat(2000)), null, "real content is not flagged");

  // Federal Register publishes an API and refuses page scraping; use it.
  assert.match(
    apiUrlFor("https://www.federalregister.gov/documents/2026/02/27/2026-03943/smr-llc-pioneer-units-1-and-2-phased-construction-permit-application-limited-work-authorization"),
    /api\/v1\/documents\/2026-03943\.json$/,
  );
  assert.equal(apiUrlFor("https://oklo.com/newsroom/whatever"), null, "other hosts are fetched normally");

  // Nothing stored may itself be a wall.
  for (const [url, entry] of Object.entries(index.sources)) {
    if (entry.state !== "stored") continue;
    const text = await readCachedText(entry.hash);
    assert.ok(text, `${url} is marked stored and has a snapshot`);
    assert.equal(looksLikeWall(text), null, `${url} stored a refusal page`);
  }

  // Every source the dataset cites has an index entry, so nothing is silently
  // uncached after a record is added. loadData merges the financing layer, so
  // its sources are held to the same rule.
  const { sourcedRecords, loadData } = await import("../scripts/lib/records.mjs");
  const cited = new Set(sourcedRecords(await loadData()).map((row) => row.source));
  const missing = [...cited].filter((url) => !index.sources[url]);
  assert.deepEqual(missing, [], "every cited source is in the cache index; run npm run data:cache");
});

test("today's criticality is recorded as proof, not capacity", async () => {
  const dataModule = await import("../app/data.ts");
  const groves = dataModule.proofEvents.find((event) => event.date === "2026-08-06" && event.kind === "Criticality");
  assert.ok(groves, "the 2026-08-06 criticality is recorded");
  assert.equal(groves.companySlug, "oklo");
  assert.match(groves.powerNote, /0 MWe/, "a test reactor contributes no capacity");
  assert.match(groves.label, /private land/, "the label states what is new about it");

  // It must not have moved a megawatt. Groves is an isotope test reactor.
  const oklo = dataModule.raceBoard().find((row) => row.entrant.companySlug === "oklo");
  assert.equal(oklo.executedMWe, 75, "Oklo's executed capacity is unchanged by a test-reactor criticality");
  assert.equal(dataModule.raceTotals().find((total) => total.band === "operational").mwe, 0, "still no operational capacity");

  // The superseded note is gone: it said criticality was unconfirmed.
  const auth = dataModule.proofEvents.find((event) => event.companySlug === "oklo" && /startup authorization/.test(event.label));
  assert.doesNotMatch(auth.label, /not confirmed/, "the superseded status note was removed");
  assert.equal(dataModule.dataAsOf, "2026-08-06", "the dataset date reflects the newest record");
});

test("the homepage leads with four separate frames and a filterable board", async () => {
  const { readFile } = await import("node:fs/promises");
  const dataModule = await import("../app/data.ts");
  const raw = await (await render()).text();
  const html = raw.replace(/<!--.*?-->/g, "");
  const totals = dataModule.headlineTotals();

  // The helper's frames, cross-checked against an independent sum over the
  // claims themselves so a band-list edit in one place cannot drift the other.
  const sumBands = (bands) => dataModule.capacityClaims
    .filter((claim) => bands.includes(claim.band))
    .reduce((total, claim) => total + claim.mwe, 0);
  assert.equal(totals.operationalMWe, sumBands(["operational"]));
  assert.equal(totals.buildingMWe, sumBands(["construction", "doe-authorized"]));
  assert.equal(totals.executedMWe, sumBands(["operational", "construction", "doe-authorized", "review", "contracted"]));
  assert.equal(totals.announcedMWe, sumBands(["framework"]));

  // The strip renders each frame with its own label, and never a grand total.
  const mwe = (value) => value.toLocaleString("en-US");
  assert.match(html, new RegExp(`${mwe(totals.buildingMWe)}</b><span[^>]*>MWe being built`));
  assert.match(html, new RegExp(`${mwe(totals.executedMWe)}</b><span[^>]*>MWe on executed actions`));
  assert.match(html, new RegExp(`${mwe(totals.announcedMWe)}</b><span[^>]*>MWe announced, non-binding`));
  assert.doesNotMatch(html, new RegExp(mwe(totals.executedMWe + totals.announcedMWe)), "executed and announced are never summed");

  // Every row carries the filter haystack the client input matches against.
  const board = dataModule.raceBoard();
  const haystacks = [...html.matchAll(/data-filter="([^"]*)"/g)].map((match) => match[1]);
  assert.equal(haystacks.length, board.length, "every board row is filterable");
  for (const row of board) {
    assert.ok(haystacks.some((value) => value.includes(row.company.name.toLowerCase())), `${row.company.name} is findable by name`);
  }
  // The no-match state ships in the page, hidden until the filter empties it.
  assert.match(html, /data-race-empty[^>]*hidden|hidden[^>]*data-race-empty/);
  assert.match(html, /No entrant matches that filter/);

  // The hidden attribute must actually hide: a display rule on the row class
  // would otherwise win. Same guard for closed <details> with styled bodies.
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important/, "the [hidden] rule ships");
  assert.match(css, /details\.acc:not\(\[open\]\)\s*>\s*:not\(summary\)\s*\{\s*display:\s*none/, "closed accordions hide their bodies");
  // The dossier back link lands on #race; without scroll margin the sticky
  // header would cover the very section the link promises. The wrapped tablet
  // header stands ~110px, so that breakpoint needs its own clearance.
  assert.match(css, /\[id\]\s*\{\s*scroll-margin-top/, "anchor targets clear the sticky header");
  assert.match(css, /\[id\]\s*\{\s*scroll-margin-top:\s*122px/, "anchor targets clear the wrapped tablet header");
  // 16px on coarse pointers stops iOS Safari zooming the viewport on focus.
  assert.match(css, /\.race-filter input, \.filters input, \.filters select \{ font-size: 16px/, "touch inputs hold 16px to suppress iOS focus zoom");

  // The key sits above the rows: the legend line precedes the first race row.
  assert.ok(html.indexOf("key-line") >= 0 && html.indexOf("race-row") >= 0, "key and rows both render");
  assert.ok(html.indexOf("key-line") < html.indexOf("race-row"), "the band key renders before the first row");

  // The reader's next steps are one tap away.
  for (const target of ["/updates", "/feed.xml", "/llms.txt", "https://github.com/pranava0x0/nucleardeployment/issues"]) {
    assert.ok(html.includes(`href="${target}"`), `the homepage links ${target}`);
  }
});

test("the homepage surfaces the newest dated evidence and the nearest gates", async () => {
  const dataModule = await import("../app/data.ts");
  const raw = await (await render()).text();
  const html = raw.replace(/<!--.*?-->/g, "");

  const latest = dataModule.timeline().filter((entry) => entry.date).slice(0, 3);
  assert.equal(latest.length, 3, "the dataset still has three dated events to show");
  for (const entry of latest) {
    assert.ok(html.includes(escapeHtml(entry.label)), `latest developments carries: ${entry.label.slice(0, 60)}`);
    assert.ok(html.includes(entry.source), `the entry links its document: ${entry.source.slice(0, 60)}`);
  }

  const gates = [...dataModule.projects]
    .filter((project) => project.stage < 7)
    .sort((a, b) => b.stage - a.stage || b.latestDate.localeCompare(a.latestDate))
    .slice(0, 4);
  assert.equal(gates.length, 4, "four projects still sit below operational");
  for (const project of gates) {
    assert.ok(html.includes(escapeHtml(project.next)), `${project.name} states its next gate on the homepage`);
    assert.ok(html.includes(escapeHtml(project.nextOwner)), `${project.name} names its gate owner`);
  }
});

test("the updates page ledgers every evidence event and every next gate", async () => {
  const dataModule = await import("../app/data.ts");
  const raw = await (await render("/updates")).text();
  const html = raw.replace(/<!--.*?-->/g, "");

  const entries = dataModule.timeline();
  assert.ok(entries.length > 50, "the merged timeline found the proof and capital ledgers");
  for (const entry of entries) {
    assert.ok(html.includes(escapeHtml(entry.label)), `the ledger carries: ${entry.label.slice(0, 60)}`);
    assert.ok(html.includes(entry.source), `the ledger links: ${entry.source.slice(0, 60)}`);
    // Every event's company resolves to a page the entry links to.
    const company = dataModule.companies.find((item) => item.slug === entry.companySlug);
    assert.ok(company, `${entry.companySlug} resolves to a company record`);
  }

  // Month groups exist for every distinct dated month, newest first.
  const months = [...new Set(entries.filter((entry) => entry.date).map((entry) => entry.date.slice(0, 7)))];
  assert.ok(months.length > 6, "the ledger spans multiple months");
  for (const month of months) {
    assert.ok(html.includes(`>${month}</h3>`), `the ledger groups ${month}`);
  }
  const sortedMonths = [...months].sort((a, b) => b.localeCompare(a));
  assert.deepEqual(months, sortedMonths, "months arrive newest first");

  // Undated events are a labeled group, never guessed into a month.
  const undated = entries.filter((entry) => !entry.date);
  if (undated.length > 0) {
    assert.match(html, /No date on record/);
    assert.match(html, /never guessed/);
  }

  // The full register: every tracked project, its next gate, its owner.
  for (const project of dataModule.projects) {
    assert.ok(html.includes(escapeHtml(project.next)), `${project.name} states its next gate`);
    assert.ok(html.includes(escapeHtml(project.nextOwner)), `${project.name} names its owner`);
  }
});

test("sitemap, robots, and feed cover every route and stay in sync", async () => {
  const { readFile } = await import("node:fs/promises");
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const { fileURLToPath } = await import("node:url");
  const dataModule = await import("../app/data.ts");

  // The committed files regenerate byte-identical from the data.
  // fileURLToPath, not .pathname: this checkout sits under a directory with a
  // space in its name, and .pathname hands node a percent-encoded path.
  await promisify(execFile)("node", [fileURLToPath(new URL("../scripts/build-seo.mjs", import.meta.url)), "--check"]);

  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const base = "https://pranava0x0.github.io/nucleardeployment";
  for (const route of ["/", "/updates/", "/deployments/", "/companies/", "/map/", "/federal-action/", "/capital/", "/financing/", "/bd/", "/methodology/"]) {
    assert.ok(sitemap.includes(`<loc>${base}${route}</loc>`), `sitemap lists ${route}`);
  }
  for (const company of dataModule.companies) {
    assert.ok(sitemap.includes(`${base}/companies/${company.slug}/`), `sitemap lists ${company.slug}`);
  }
  for (const project of dataModule.projects) {
    assert.ok(sitemap.includes(`${base}/deployments/${project.slug}/`), `sitemap lists ${project.slug}`);
    // lastmod is the page's own record date, not a global stamp (DESIGN.md
    // 11.2) — floored at the previously-committed value, though, so a
    // correction that moves a project's latestDate earlier (2026-08-23:
    // Aurora-INL's stage fix) can't regress the sitemap date and tell
    // crawlers a just-edited page is now older than what they last saw.
    // lastmod is therefore >= latestDate, not necessarily equal to it.
    const match = sitemap.match(new RegExp(`<loc>${base}/deployments/${project.slug}/</loc><lastmod>([^<]+)</lastmod>`));
    assert.ok(match, `${project.slug} carries a lastmod`);
    assert.ok(match[1] >= project.latestDate, `${project.slug}'s lastmod (${match[1]}) never regresses behind its latestDate (${project.latestDate})`);
  }
  const urlCount = (sitemap.match(/<url>/g) ?? []).length;
  assert.equal(urlCount, 10 + dataModule.companies.length + dataModule.projects.length, "sitemap covers exactly the shipped routes");
  const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
  assert.ok(lastmods.length > 8, "sitemap states lastmod dates");
  // The financing and BD layers carry their own later stamps; everything else
  // stays bounded by the race dataset's date.
  const financingModule = await import("../app/financing-data.ts");
  const bdModule = await import("../app/bd-data.ts");
  assert.ok(
    sitemap.includes(`<loc>${base}/financing/</loc><lastmod>${financingModule.financingAsOf}</lastmod>`),
    "the financing route carries the financing layer's own date, not the race dataset's",
  );
  assert.ok(
    sitemap.includes(`<loc>${base}/bd/</loc><lastmod>${bdModule.bdAsOf}</lastmod>`),
    "the BD route carries the BD layer's own date, not the race dataset's",
  );
  assert.ok(financingModule.financingAsOf > dataModule.dataAsOf, "the financing stamp postdates the race dataset it sits beside");
  assert.ok(bdModule.bdAsOf > financingModule.financingAsOf, "the BD stamp postdates the financing layer it sits beside");
  const layerStamps = new Set([financingModule.financingAsOf, bdModule.bdAsOf]);
  // A floored lastmod (build-seo.mjs's notBefore) is allowed past its layer's
  // stamp: it names the date a specific record was corrected, not a claim
  // about when the dataset overall last advanced. dataAsOf correctly did not
  // move for the 2026-08-23 Aurora-INL fix, since the newest documented
  // event behind it is still 2025-09; only the sitemap floor did.
  const flooredExceptions = new Set(["2026-08-23"]);
  assert.ok(
    lastmods.every((date) => date <= dataModule.dataAsOf || layerStamps.has(date) || flooredExceptions.has(date)),
    "no page claims a date newer than its own layer's stamp, except a known floored correction",
  );
  assert.ok(lastmods.some((date) => date !== dataModule.dataAsOf), "record pages carry their own dates, not one global stamp");

  const robots = await readFile(new URL("../public/robots.txt", import.meta.url), "utf8");
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.ok(robots.includes(`Sitemap: ${base}/sitemap.xml`), "robots points at the sitemap");
  assert.ok(robots.includes(`${base}/llms.txt`), "robots points agents at llms.txt");

  const feed = await readFile(new URL("../public/feed.xml", import.meta.url), "utf8");
  const dated = dataModule.timeline().filter((entry) => entry.date);
  const itemCount = (feed.match(/<item>/g) ?? []).length;
  assert.equal(itemCount, Math.min(50, dated.length), "the feed carries the capped dated ledger");
  assert.doesNotMatch(feed, />Undated</, "undated events stay out of the feed");
  // Duplicate guids collapse items in readers; every one must be unique.
  const guids = [...feed.matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)].map((match) => match[1]);
  assert.equal(new Set(guids).size, guids.length, "feed guids are unique");
  assert.equal(guids.length, itemCount, "every item carries a guid");
  const pubDates = (feed.match(/<pubDate>/g) ?? []).length;
  assert.equal(pubDates, itemCount, "every item carries a pubDate");
  // Raw ampersands corrupt XML; only entities may follow one.
  assert.doesNotMatch(feed, /&(?!amp;|lt;|gt;|quot;|apos;|#)/, "feed XML is escaped");
  assert.doesNotMatch(sitemap, /&(?!amp;|lt;|gt;|quot;|apos;|#)/, "sitemap XML is escaped");

  // The static files land in the build output like llms.txt does.
  for (const name of ["sitemap.xml", "robots.txt", "feed.xml"]) {
    const built = await readFile(new URL(`../dist/client/${name}`, import.meta.url), "utf8");
    const committed = await readFile(new URL(`../public/${name}`, import.meta.url), "utf8");
    assert.equal(built, committed, `the built ${name} matches the committed one`);
  }
});

test("a sitemap lastmod never regresses behind what was already committed", async () => {
  // Codex found this on PR #14: correcting a stale record to cite an
  // earlier, more accurate event moved its lastmod backward, and a crawler
  // reads a regressed date as "this page is now older than what I last
  // saw" and skips recrawling exactly the page that just changed. Prove the
  // floor by sabotage: seed a future-dated lastmod for a real URL, rerun
  // the generator, and confirm it held rather than reverting to the data's
  // own (earlier) date. Backs up and restores the real committed file so
  // this test cannot corrupt it if a later assertion throws.
  const { readFile, writeFile } = await import("node:fs/promises");
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const { fileURLToPath } = await import("node:url");
  const run = promisify(execFile);
  const sitemapPath = new URL("../public/sitemap.xml", import.meta.url);
  const generator = fileURLToPath(new URL("../scripts/build-seo.mjs", import.meta.url));

  const original = await readFile(sitemapPath, "utf8");
  const url = "https://pranava0x0.github.io/nucleardeployment/deployments/oklo-aurora-pilot/";
  const targetLine = original.split("\n").find((line) => line.includes(`<loc>${url}</loc>`));
  assert.ok(targetLine, "the sitemap already lists the URL this test seeds a future date on");

  try {
    const seeded = original.replace(targetLine, `  <url><loc>${url}</loc><lastmod>2099-01-01</lastmod></url>`);
    await writeFile(sitemapPath, seeded);
    await run("node", [generator]);
    const regenerated = await readFile(sitemapPath, "utf8");
    assert.match(regenerated, /oklo-aurora-pilot\/<\/loc><lastmod>2099-01-01<\/lastmod>/, "a future-dated committed lastmod holds rather than reverting to the (earlier) derived date");
  } finally {
    await writeFile(sitemapPath, original);
    await run("node", [generator]);
    const restored = await readFile(sitemapPath, "utf8");
    assert.equal(restored, original, "the real committed sitemap is restored byte-for-byte after the sabotage");
  }
});

test("every page states a canonical and the lead pages carry structured data", async () => {
  const dataModule = await import("../app/data.ts");
  const pages = [
    ["/", true],
    ["/updates", true],
    ["/methodology", false],
    ["/companies", false],
    ["/deployments", false],
    ["/capital", false],
    ["/federal-action", false],
    ["/map", false],
    [`/companies/${dataModule.raceEntrants[0].companySlug}`, true],
    [`/deployments/${dataModule.projects[0].slug}`, true],
  ];
  for (const [path, expectsJsonLd] of pages) {
    const raw = await (await render(path)).text();
    assert.match(raw, /<link rel="canonical"/, `${path} states a canonical URL`);

    const scripts = [...raw.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (!expectsJsonLd) continue;
    assert.ok(scripts.length > 0, `${path} carries structured data`);
    for (const [, body] of scripts) {
      const parsed = JSON.parse(body);
      assert.ok(parsed["@context"] === "https://schema.org", `${path} structured data declares its context`);
    }
  }

  // The homepage dataset block matches the data it describes.
  const home = await (await render()).text();
  const homeScripts = [...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(homeScripts.length, 1, "the homepage carries one structured-data block");
  const graph = JSON.parse(homeScripts[0][1])["@graph"];
  const dataset = graph.find((node) => node["@type"] === "Dataset");
  assert.ok(dataset, "the homepage declares the tracker as a Dataset");
  assert.equal(dataset.dateModified, dataModule.dataAsOf, "the Dataset date matches the data");
  const website = graph.find((node) => node["@type"] === "WebSite");
  assert.ok(website, "the homepage declares the WebSite");

  // Slug pages carry breadcrumbs that resolve to real routes.
  const companyPage = await (await render(`/companies/${dataModule.raceEntrants[0].companySlug}`)).text();
  const crumb = JSON.parse([...companyPage.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)][0][1]);
  assert.equal(crumb["@type"], "BreadcrumbList");
  assert.equal(crumb.itemListElement.length, 3);
});

test("the header and footer map the whole site", async () => {
  const raw = await (await render()).text();
  const html = raw.replace(/<!--.*?-->/g, "");
  for (const route of ["/", "/updates", "/deployments", "/companies", "/map", "/federal-action", "/capital", "/financing", "/bd", "/methodology"]) {
    assert.ok(html.includes(`href="${route}"`), `the navigation reaches ${route}`);
  }
  // The footer carries the credit and the code, per the footer rule.
  assert.match(html, /Built by Pranava Raparla/);
  assert.ok(html.includes("https://github.com/pranava0x0/nucleardeployment"), "the footer links the repository");
  assert.ok(html.includes("https://www.pranavaraparla.com"), "the footer links the author");
});

test("the financing page renders every lane, company row, and labeled judgment", async () => {
  const dataModule = await import("../app/data.ts");
  const financing = await import("../app/financing-data.ts");
  const raw = await (await render("/financing")).text();
  const html = raw.replace(/<!--.*?-->/g, "").replace(/<script[\s\S]*?<\/script>/gi, "");

  for (const heading of [
    "The cost ladder", "What n units buy", "Company by company", "Contracting mechanisms",
    "Pooled insurance and liability", "Who underwrites", "Cost overruns on the record",
    "Siting, by class", "Captured reports",
  ]) {
    assert.ok(html.includes(heading), `the financing page carries "${heading}"`);
  }

  // Anchor figures from three different evidence classes, asserted as literal text.
  assert.ok(html.includes("$169/MWh"), "the Vogtle actual is on the page");
  assert.ok(html.includes("$325/MWh"), "the microreactor FOAK estimate is on the page");
  assert.ok(html.includes("241% average overnight-cost overrun"), "the overrun history headline is on the page");

  // The three mechanism lanes render, and unexecuted intent never sits in the in-use group.
  assert.ok(html.includes("Available or pending, no executed instance"), "the pending lane renders");
  assert.ok(financing.mechanisms.some((mechanism) => mechanism.status === "Pending"),
    "the dataset still exercises the pending case");

  // Every entrant gets a financing row with all five labeled lines.
  for (const row of financing.companyFinance) {
    const name = dataModule.companies.find((company) => company.slug === row.companySlug)?.name;
    assert.ok(name && html.includes(name), `${row.companySlug} appears in the financing matrix`);
  }
  const rowCount = financing.companyFinance.length;
  for (const label of ["Model", "Government", "Commercial", "Stated cost", "Next gate"]) {
    const count = html.split(`>${label}</span>`).length - 1;
    assert.equal(count, rowCount, `every company row carries a "${label}" line (${count} of ${rowCount})`);
  }

  // Judgments stay labeled as judgments, one per company row, nowhere else.
  const judgmentCount = html.split("Site judgment, derived from the records above.").length - 1;
  assert.equal(judgmentCount, rowCount, "every next gate is labeled as the site's judgment");

  // A missing cost claim is an explicit statement, in both directions.
  const nullClaims = financing.companyFinance.filter((row) => row.costClaim === null).length;
  const placeholderCount = html.split("No price or cost target on record").length - 1;
  assert.equal(placeholderCount, nullClaims, "every absent cost claim states its absence exactly once");
  assert.ok(nullClaims > 0 && nullClaims < rowCount, "the dataset exercises both the stated and absent cost-claim cases");

  // An absence is the site's finding, never pinned on a source, in both directions.
  const emptyCommercial = financing.companyFinance.filter((row) => row.commercial.length === 0).length;
  const absenceCount = html.split("No commercial position on record. A research finding, not a sourced claim.").length - 1;
  assert.equal(absenceCount, emptyCommercial, "every empty commercial lane states the research finding exactly once");
  assert.ok(emptyCommercial > 0 && emptyCommercial < rowCount, "the dataset exercises both the sourced and absent commercial cases");

  // No chart library ships for this page either.
  assert.doesNotMatch(raw, /chart\.js|d3\.|recharts|plotly/i);
});

test("the financing matrix covers the race roster exactly, lane by lane", async () => {
  const dataModule = await import("../app/data.ts");
  const financing = await import("../app/financing-data.ts");
  const entrantSlugs = dataModule.raceEntrants.map((entrant) => entrant.companySlug).sort();
  const financeSlugs = financing.companyFinance.map((row) => row.companySlug).sort();
  assert.deepEqual(financeSlugs, entrantSlugs, "one financing row per race entrant, no extras and no gaps");
  // The page renders only the two roster lanes; a lane rename in data.ts must fail here, not render an empty group.
  const lanes = new Set(dataModule.raceEntrants.map((entrant) => entrant.lane));
  assert.deepEqual([...lanes].sort(), ["Grid-scale SMR", "Microreactor"]);
});

test("financing records keep source hygiene: https, real-or-null dates, paired claims", async () => {
  const financing = await import("../app/financing-data.ts");
  const sourced = [
    ...financing.costBenchmarks, ...financing.learningRungs.map((rung) => ({ ...rung, date: null })),
    ...financing.overrunRecords, ...financing.mechanisms, ...financing.liabilityPools,
    ...financing.underwriters, ...financing.sitingFacts.map((fact) => ({ ...fact, date: null })),
  ];
  for (const record of sourced) {
    assert.match(record.source, /^https:\/\//, `${record.source} is https`);
    if (record.date != null) assert.match(record.date, /^\d{4}(-\d{2})?(-\d{2})?$/, `${record.date} is a real date`);
  }
  for (const row of financing.companyFinance) {
    // Every government and commercial claim carries its own source; a row
    // summarizing four deals under one link is the mis-citation Codex flagged.
    // An empty commercial array is legitimate: it renders as an explicit
    // research-finding state instead of pinning an absence on a source.
    assert.ok(row.government.length >= 1, `${row.companySlug} states at least one government line`);
    for (const line of [...row.government, ...row.commercial]) {
      assert.match(line.source, /^https:\/\//, `${row.companySlug} claim sources are https`);
      assert.ok(line.text.length > 20, `${row.companySlug} claims are sentences, not fragments`);
    }
    assert.match(row.modelSource, /^https:\/\//, `${row.companySlug} model source is https`);
    assert.equal(row.costClaim === null, row.costClaimSource === null,
      `${row.companySlug}: a cost claim and its source travel together`);
  }
});

test("every report-backed figure resolves to its captured page, quotes verbatim", async () => {
  const { readFile } = await import("node:fs/promises");
  const financing = await import("../app/financing-data.ts");
  const referenced = [
    ...financing.costBenchmarks, ...financing.learningRungs, ...financing.overrunRecords,
    ...financing.underwriters,
  ].filter((record) => record.report);

  assert.ok(referenced.length >= 10, "the report-backed records still exist");
  const knownSlugs = new Set(financing.capturedReports.map((report) => report.slug));
  const pagesBySlug = new Map();

  for (const record of referenced) {
    const { reportSlug, page, quote } = record.report;
    assert.ok(knownSlugs.has(reportSlug), `${reportSlug} is listed in capturedReports`);
    if (!pagesBySlug.has(reportSlug)) {
      const text = await readFile(new URL(`../data/sources/reports/${reportSlug}.txt`, import.meta.url), "utf8");
      const pages = new Map();
      const chunks = text.split(/--- PAGE (\d+) ---/);
      // split() yields [before, n1, text1, n2, text2, ...]; pair them up.
      for (let index = 1; index < chunks.length; index += 2) {
        pages.set(Number(chunks[index]), chunks[index + 1] ?? "");
      }
      const meta = JSON.parse(await readFile(new URL(`../data/sources/reports/${reportSlug}.meta.json`, import.meta.url), "utf8"));
      assert.ok(meta.page_count > 0 && meta.url.startsWith("https://"), `${reportSlug} meta records capture provenance`);
      pagesBySlug.set(reportSlug, { pages, pageCount: meta.page_count });
    }
    const { pages, pageCount } = pagesBySlug.get(reportSlug);
    assert.ok(page >= 1 && page <= pageCount, `${reportSlug} p. ${page} exists (${pageCount} pages)`);
    assert.ok(pages.has(page), `${reportSlug} captured text carries a page ${page} marker`);
    if (quote) {
      const normalized = pages.get(page).replace(/\s+/g, " ");
      assert.ok(normalized.includes(quote.replace(/\s+/g, " ")),
        `${reportSlug} p. ${page} carries the quote "${quote}"`);
    }
  }
});

test("timeline entries stay distinguishable under the list keys the pages use", async () => {
  const dataModule = await import("../app/data.ts");
  // Two funding events can share one source URL and date (an equity raise and
  // its debt facility announced together); the homepage and updates lists key
  // on source-date-label, so that triple must be unique. Valar's 2026-08 pair
  // is the live case: same URL, same month, different labels.
  const keys = dataModule.timeline().map((entry) => `${entry.source}-${entry.date}-${entry.label.slice(0, 24)}`);
  const seen = new Set();
  for (const key of keys) {
    assert.ok(!seen.has(key), `duplicate timeline key: ${key}`);
    seen.add(key);
  }
  const valarPair = dataModule.timeline().filter((entry) =>
    entry.source === "https://www.valaratomics.com/docs/Announcing-our-1B-Series-B-Led-By-Sequoia");
  assert.ok(valarPair.length >= 2, "the dataset still exercises the shared source-and-date case");

  // The uniqueness above only protects the pages if they key on the triple.
  // React keys never reach the HTML, so check the seam in the source itself.
  const { readFile } = await import("node:fs/promises");
  for (const path of ["../app/page.tsx", "../app/updates/page.tsx"]) {
    const component = await readFile(new URL(path, import.meta.url), "utf8");
    assert.ok(component.includes("${entry.source}-${entry.date}-${entry.label.slice(0, 24)}"),
      `${path} keys its timeline list on source, date, and label`);
  }
});

test("the BD page renders the matrix, every buyer, and labeled judgment", async () => {
  const bd = await import("../app/bd-data.ts");
  const raw = await (await render("/bd")).text();
  // Entities are decoded before matching: buyer and sector names carry "&",
  // which React renders as &amp;.
  const html = raw.replace(/<!--.*?-->/g, "").replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');

  // The extraction can't pass vacuously: the collections must be populated
  // before any count below means anything.
  assert.ok(bd.bdBuyers.length > 0 && bd.bdSectorPlans.length > 0 && bd.bdSignals.length > 0 && bd.bdMicroPath.length > 0,
    "the BD collections are populated");

  for (const heading of [
    "The demand matrix", "Positions on the record", "Sector plans",
    "The microreactor cadence question", "On the record", "What this page does not claim",
  ]) {
    assert.ok(html.includes(heading), `the BD page carries "${heading}"`);
  }

  // Every buyer renders in the matrix (row header) and the ledger (anchor).
  for (const buyer of bd.bdBuyers) {
    assert.ok(html.includes(`#buyer-${buyer.slug}`), `${buyer.slug} has a matrix link`);
    assert.ok(html.includes(`id="buyer-${buyer.slug}"`), `${buyer.slug} has a ledger anchor`);
    assert.ok(html.includes(buyer.name), `${buyer.name} appears on the page`);
  }

  // Every sector renders, and every sector holds at least one buyer and one
  // plan: the one-example-per-enum rule, both directions.
  for (const sector of bd.bdSectors) {
    assert.ok(html.includes(sector), `sector "${sector}" renders`);
    assert.ok(bd.bdBuyers.some((buyer) => buyer.sector === sector), `sector "${sector}" has a buyer`);
  }
  assert.deepEqual(
    bd.bdSectorPlans.map((plan) => plan.sector).sort(),
    [...bd.bdSectors].sort(),
    "exactly one plan per sector, no extras and no gaps",
  );

  // The matrix shows one chip per populated buyer-class pair, no more. Scoped
  // to the matrix table itself: the compact tier legend below it reuses the
  // same chip styling on purpose and would otherwise inflate this count.
  const expectedChips = bd.bdBuyers.reduce(
    (count, buyer) => count + new Set(buyer.positions.map((position) => position.class)).size, 0);
  const matrixTable = html.match(/<table class="bd-matrix">[\s\S]*?<\/table>/)?.[0];
  assert.ok(matrixTable, "the matrix table renders");
  const chipCount = matrixTable.split('class="bd-chip').length - 1;
  assert.equal(chipCount, expectedChips, `the matrix renders ${expectedChips} chips (${chipCount} found)`);

  // The strongest tier wins the cell: Amazon holds Executed, Equity, and
  // Framework positions in one class, and its single chip must read EXEC.
  const amazonRow = html.match(/#buyer-amazon">Amazon<\/a><\/th>([\s\S]*?)<\/tr>/);
  assert.ok(amazonRow, "the Amazon matrix row renders");
  assert.equal(amazonRow[1].split('class="bd-chip').length - 1, 1, "Amazon's positions collapse to one class cell");
  assert.ok(amazonRow[1].includes(">EXEC<"), "Amazon's cell shows its strongest tier, not its weakest");

  // Every position renders with its source; so do evidence lines, signals,
  // and path rungs. Nothing else on the page emits that link text.
  const expectedSources = bd.bdBuyers.reduce((count, buyer) => count + buyer.positions.length, 0)
    + bd.bdSectorPlans.reduce((count, plan) => count + plan.evidence.length, 0)
    + bd.bdSignals.length + bd.bdMicroPath.length;
  const sourceCount = html.split("Source ↗").length - 1;
  assert.equal(sourceCount, expectedSources, `every sourced BD record renders exactly one source link (${sourceCount} of ${expectedSources})`);

  // Judgment stays labeled, once per plan plus the sequencing read.
  assert.equal(html.split("Thesis · site judgment").length - 1, bd.bdSectorPlans.length, "every plan labels its thesis as judgment");
  assert.equal(html.split("Watch · site judgment").length - 1, bd.bdSectorPlans.length, "every plan labels its watch item as judgment");
  assert.equal(html.split("Sequencing · site judgment").length - 1, 1, "the cadence sequencing is labeled as judgment");

  // A null date is an explicit statement, and the dataset exercises it.
  const nullDated = bd.bdSignals.filter((signal) => signal.date === null).length
    + bd.bdMicroPath.filter((rung) => rung.date === null).length;
  assert.ok(nullDated > 0, "the dataset exercises the undated case");
  assert.equal(html.split("Date not stated").length - 1, nullDated, "every undated record states so exactly once");

  // The tier ladder itself is exercised end to end: every rung has at least
  // one live position, so no legend row describes nothing.
  for (const entry of bd.bdTiers) {
    assert.ok(bd.bdBuyers.some((buyer) => buyer.positions.some((position) => position.tier === entry.tier)),
      `tier "${entry.tier}" has at least one position`);
    assert.ok(html.includes(entry.meaning), `the legend explains "${entry.tier}"`);
  }
  for (const cls of bd.bdClasses) {
    assert.ok(bd.bdBuyers.some((buyer) => buyer.positions.some((position) => position.class === cls)),
      `class "${cls}" has at least one position`);
  }

  // No chart library ships for this page either.
  assert.doesNotMatch(raw, /chart\.js|d3\.|recharts|plotly/i);
});

test("BD records keep source hygiene: https, real-or-null dates, matching tiers", async () => {
  const dataModule = await import("../app/data.ts");
  const bd = await import("../app/bd-data.ts");

  const slugs = bd.bdBuyers.map((buyer) => buyer.slug);
  assert.equal(new Set(slugs).size, slugs.length, "buyer slugs are unique");

  const positions = bd.bdBuyers.flatMap((buyer) => buyer.positions);
  for (const record of [...positions, ...bd.bdSignals]) {
    assert.match(record.source, /^https:\/\//, `${record.source} is https`);
    if (record.date != null) assert.match(record.date, /^\d{4}(-\d{2})?(-\d{2})?$/, `${record.date} is a real date`);
    // The stated reporting basis must match the source host, the same rule
    // the race records are held to.
    assert.equal(record.verification, dataModule.verificationForSource(record.source),
      `${record.source} is labeled ${record.verification}`);
  }
  for (const record of [...bd.bdSectorPlans.flatMap((plan) => plan.evidence), ...bd.bdMicroPath]) {
    assert.match(record.source, /^https:\/\//, `${record.source} is https`);
  }

  // Dates never predate the actions they describe or outrun the layer stamp.
  for (const record of [...positions, ...bd.bdSignals, ...bd.bdMicroPath]) {
    if (record.date != null) assert.ok(record.date <= bd.bdAsOf, `${record.date} does not postdate the layer stamp`);
  }
});

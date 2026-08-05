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
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Deployment Core/);
  assert.match(html, /America is rebuilding the machinery/);
  assert.match(html, /Projects by stage/);
  assert.match(html, /brand\/reactor-velocity-mark\.png/);
  assert.match(html, /Exploring the idea/);
  assert.match(html, /Work or fuel at the site/);
  assert.match(html, /15 projects/);
  assert.match(html, /TerraPower/);
  assert.match(html, /Kairos Power/);
  assert.doesNotMatch(html, /Announcement is not deployment/);
  assert.doesNotMatch(html, /metric-rail/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

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
  assert.equal(criticalities.length, 4, "all four DOE pilot criticalities are recorded");
  assert.deepEqual(
    criticalities.map((event) => event.companySlug).sort(),
    ["aalo-atomics", "antares-nuclear", "deployable-energy", "valar-atomics"],
  );
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
  assert.ok(totals.review >= 1235, `review floor: ${totals.review}`);
  assert.ok(totals.framework >= 40395, `framework floor: ${totals.framework}`);

  // Each claim sits in exactly one band, so the bands never double-count a megawatt.
  const summed = dataModule.capacityClaims.reduce((total, claim) => total + claim.mwe, 0);
  assert.equal(summed, Object.values(totals).reduce((total, value) => total + value, 0));
});

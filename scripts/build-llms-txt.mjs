#!/usr/bin/env node
/**
 * Generate `public/llms.txt` from the dataset.
 *
 *   node scripts/build-llms-txt.mjs           write the file
 *   node scripts/build-llms-txt.mjs --check   fail if the file is out of date
 *
 * The file is for agents and other machine readers: the band totals, the rules
 * that govern them, and every entrant's position with its source. It is
 * generated, never hand-edited, and a test runs --check so the committed copy
 * cannot drift from the data it describes.
 */

import { readFile, writeFile } from "node:fs/promises";
import { loadData } from "./lib/records.mjs";

const OUT = new URL("../public/llms.txt", import.meta.url);
const data = await loadData();
const mwe = (value) => value.toLocaleString("en-US");

const totals = data.raceTotals();
const executed = totals.filter((entry) => entry.band !== "framework").reduce((sum, entry) => sum + entry.mwe, 0);
const building = totals.filter((entry) => entry.band === "construction" || entry.band === "doe-authorized").reduce((sum, entry) => sum + entry.mwe, 0);
const framework = totals.find((entry) => entry.band === "framework").mwe;

const lines = [];
const say = (line = "") => lines.push(line);

say("# Deployment Core");
say();
say("> A public evidence layer for U.S. nuclear deployment. It tracks which companies");
say("> are building new-design reactors, how far each has actually got, and what");
say("> document proves it. Every number on the site links to a source.");
say();
say(`Data as of ${data.dataAsOf}. This is a tracked sample, not a census.`);
say();

say("## What the site measures");
say();
say("Companies race to put one gigawatt of new-design nuclear on the U.S. grid.");
say("Each company's capacity is split into bands by how strong the evidence is.");
say("A megawatt sits in exactly one band, so the bands never double-count.");
say();
for (const band of data.capacityBands) {
  const total = totals.find((entry) => entry.band === band.band);
  say(`- **${band.label}** (${mwe(total.mwe)} MWe, ${total.entrants} companies): ${band.rule} Granting authority: ${band.authority}.`);
}
say();

say("## The headline numbers");
say();
say(`- No company has generated a commercial megawatt. Operational capacity is 0 MWe.`);
say(`- ${mwe(building)} MWe is physically under construction.`);
say(`- ${mwe(executed)} MWe rests on an executed action of any kind, including applications filed.`);
say(`- ${mwe(framework)} MWe has been announced without binding documents.`);
say(`- Announced capacity is about ${Math.round(framework / executed)}x everything executed, and about ${Math.round(framework / building)}x what is being built.`);
say();

say("## Rules that govern the numbers");
say();
say("- Binding and non-binding capacity are never added together.");
say("- Test reactors and critical experiments count 0 MWe. A criticality proves the");
say("  physics works. It is not electricity and not a licence to sell any.");
say("- A company-stated target never moves a megawatt between bands. Only a");
say("  documented action does.");
say("- U.S. megawatts only. The same design built abroad counts 0 MWe here.");
say("- A DOE authorization is not an NRC licence. The bands keep them apart.");
say();

say("## Companies");
say();
for (const [index, row] of data.raceBoard().entries()) {
  const parts = row.cells.filter((cell) => cell.mwe > 0).map((cell) => `${mwe(cell.mwe)} MWe ${cell.label.toLowerCase()}`);
  say(`${index + 1}. **${row.company.name}** (${row.entrant.design}, ${mwe(row.entrant.unitMWe)} MWe per unit, ${row.entrant.lane})`);
  say(`   - Strongest state: ${row.strongestLine}`);
  say(`   - Capacity: ${parts.length ? parts.join("; ") : "none on record"}`);
  say(`   - On the board because: ${row.entrant.rosterBasis} Source: ${row.entrant.rosterSource}`);
  say(`   - Full record: https://pranava0x0.github.io/nucleardeployment/companies/${row.company.slug}`);
}
say();

say("## Where the evidence comes from");
say();
const tiers = {};
for (const record of [...data.capacityClaims, ...data.proofEvents]) {
  tiers[record.verification] = (tiers[record.verification] ?? 0) + 1;
}
say("Every record names who reported it, in the order the methodology ranks them:");
for (const tier of ["Verified", "Government-reported", "Institution-reported", "Company-reported", "Press-reported"]) {
  if (tiers[tier]) say(`- ${tier}: ${tiers[tier]} records`);
}
say();
say("- Verified means the regulator's own record, such as a Federal Register notice.");
say("- Press-reported is a real source, but it is never the best one available when");
say("  the company or the regulator published the same fact.");
say();

say("## Pages");
say();
say("- https://pranava0x0.github.io/nucleardeployment/ - the race board");
say("- https://pranava0x0.github.io/nucleardeployment/methodology - roster rule, band rules, source hierarchy");
say("- https://pranava0x0.github.io/nucleardeployment/deployments - every tracked project record");
say("- https://pranava0x0.github.io/nucleardeployment/companies - every company");
say("- https://pranava0x0.github.io/nucleardeployment/federal-action - executive orders and DOE programs");
say("- https://pranava0x0.github.io/nucleardeployment/capital - loans, awards, and cost shares");
say();
say("Generated from app/data.ts by scripts/build-llms-txt.mjs. Do not edit by hand.");

const text = lines.join("\n") + "\n";

if (process.argv.includes("--check")) {
  let current = null;
  try {
    current = await readFile(OUT, "utf8");
  } catch {
    console.error("public/llms.txt is missing. Run: node scripts/build-llms-txt.mjs");
    process.exit(1);
  }
  if (current !== text) {
    console.error("public/llms.txt is out of date. Run: node scripts/build-llms-txt.mjs");
    process.exit(1);
  }
  console.log("public/llms.txt matches the data.");
} else {
  await writeFile(OUT, text);
  console.log(`Wrote public/llms.txt (${lines.length} lines, ${text.length} bytes).`);
}

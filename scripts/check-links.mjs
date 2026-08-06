#!/usr/bin/env node
/**
 * Check that every cited source still resolves, and append the run to
 * `data/research/link-check-history.jsonl`.
 *
 *   node scripts/check-links.mjs                 check every source
 *   node scripts/check-links.mjs --limit 20      check the first 20
 *   node scripts/check-links.mjs --dry-run       list what would be checked
 *
 * A 200 is not proof the page supports the claim. This answers "is it still
 * there", nothing more. Whether the page says what the site says it says is a
 * human read, recorded as `content_check` in the same history file.
 *
 * Rate limited to one request per host every 2 seconds, per the project's
 * network-ethics rule. Failures are classified rather than retried blindly: a
 * 403 is a bot wall that will not open, a timeout might.
 */

import { appendFile } from "node:fs/promises";
import { hostOf, loadData, sourcedRecords } from "./lib/records.mjs";

const args = process.argv.slice(2);
const limit = args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : Infinity;
const dryRun = args.includes("--dry-run");

const data = await loadData();
const urls = [...new Set(sourcedRecords(data).map((row) => row.source))].slice(0, limit);

if (dryRun) {
  console.log(`${urls.length} unique source URL(s) across ${new Set(urls.map(hostOf)).size} hosts.`);
  process.exit(0);
}

const HISTORY = new URL("../data/research/link-check-history.jsonl", import.meta.url);
const lastHit = new Map();
const results = { live: 0, blocked: 0, dead: 0 };

/** Classify rather than retry. A wall will not open; a timeout might. */
function classify(status, error) {
  if (error) return error.name === "TimeoutError" ? "blocked" : "dead";
  if (status === 403 || status === 401 || status === 429) return "blocked";
  if (status >= 200 && status < 400) return "live";
  return "dead";
}

for (const [index, url] of urls.entries()) {
  const host = hostOf(url);
  const since = Date.now() - (lastHit.get(host) ?? 0);
  if (since < 2000) await new Promise((resolve) => setTimeout(resolve, 2000 - since));
  lastHit.set(host, Date.now());

  let status = 0;
  let error = null;
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "user-agent": "deployment-core link check (https://github.com/pranava0x0/nucleardeployment)" },
    });
    status = response.status;
  } catch (caught) {
    error = caught;
  }

  const classification = classify(status, error);
  results[classification] += 1;
  const mark = { live: "ok", blocked: "wall", dead: "DEAD" }[classification];
  console.log(`${String(index + 1).padStart(3)}/${urls.length}  ${mark.padEnd(5)} ${String(status || "-").padEnd(4)} ${url.slice(0, 96)}`);

  await appendFile(HISTORY, JSON.stringify({
    checked_at: new Date().toISOString(),
    url,
    http_status: status,
    classification,
    action: classification === "dead" ? "review" : "keep",
  }) + "\n");
}

console.log(`\nlive ${results.live} · blocked ${results.blocked} · dead ${results.dead}`);
console.log("Appended to data/research/link-check-history.jsonl");
if (results.dead) console.log("\nDead links need a replacement source, not deletion of the claim.");
process.exit(results.dead ? 1 : 0);

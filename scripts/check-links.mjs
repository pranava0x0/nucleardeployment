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
 * Rate limited to one request per host every 2 seconds, measured from the end
 * of the previous request so a slow response cannot shorten the gap.
 *
 * Classification is deliberate about what it cannot know. Only an HTTP response
 * that says the page is gone counts as dead. A DNS failure, a refused
 * connection, or a timeout means we could not reach it, which is not evidence
 * about the source, and the run aborts rather than writing that guess into an
 * append-only file if the network looks broken.
 */

import { appendFile } from "node:fs/promises";
import { hostOf, loadData, sourcedRecords } from "./lib/records.mjs";

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");

/**
 * An unvalidated Number() here turns "check everything" into "check nothing":
 * NaN reaches slice(0, NaN), which returns [], and the run reports success
 * having checked no links at all.
 */
function parseLimit(args) {
  const at = args.indexOf("--limit");
  if (at === -1) return Infinity;
  const raw = args[at + 1];
  if (raw === undefined) {
    console.error("--limit needs a value, for example --limit 20");
    process.exit(2);
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    console.error(`--limit must be a positive whole number, got ${JSON.stringify(raw)}`);
    process.exit(2);
  }
  return value;
}

const limit = parseLimit(argv);
const data = await loadData();
const urls = [...new Set(sourcedRecords(data).map((row) => row.source))].slice(0, limit);

// An empty work list is a failure, not a quiet success.
if (urls.length === 0) {
  console.error("No source URLs to check. That is a bug in the dataset or the filter, not a pass.");
  process.exit(2);
}

if (dryRun) {
  console.log(`${urls.length} unique source URL(s) across ${new Set(urls.map(hostOf)).size} hosts.`);
  process.exit(0);
}

const HISTORY = new URL("../data/research/link-check-history.jsonl", import.meta.url);
const lastHit = new Map();
const results = { live: 0, blocked: 0, dead: 0 };
const rows = [];

/** Node reports network-level failures as a TypeError carrying a cause code. */
const UNREACHABLE = new Set(["ENOTFOUND", "ECONNREFUSED", "ECONNRESET", "EAI_AGAIN", "ETIMEDOUT", "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_SOCKET"]);

function classify(status, error) {
  // We could not reach it. That is a fact about the network, not the source.
  if (error) return "blocked";
  // A wall: the page is there, we are not allowed to see it.
  if (status === 401 || status === 403 || status === 429) return "blocked";
  if (status >= 200 && status < 400) return "live";
  // Only the server saying the page is gone counts as dead.
  return "dead";
}

async function probe(url) {
  // HEAD first: a status code does not need the body, and several of these
  // sources are multi-hundred-kilobyte filings and PDFs.
  for (const method of ["HEAD", "GET"]) {
    try {
      const response = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
        headers: { "user-agent": "deployment-core link check (https://github.com/pranava0x0/nucleardeployment)" },
      });
      // Some servers reject HEAD outright; fall through to GET before believing it.
      if (method === "HEAD" && (response.status === 405 || response.status === 501)) continue;
      return { status: response.status, error: null };
    } catch (error) {
      if (method === "HEAD") continue;
      return { status: 0, error };
    }
  }
  return { status: 0, error: null };
}

for (const [index, url] of urls.entries()) {
  const host = hostOf(url);
  const since = Date.now() - (lastHit.get(host) ?? 0);
  if (since < 2000) await new Promise((resolve) => setTimeout(resolve, 2000 - since));

  const { status, error } = await probe(url);
  // Stamped after the request settles, so the gap is between requests rather
  // than between their start times.
  lastHit.set(host, Date.now());

  const classification = classify(status, error);
  const unreachable = Boolean(error) && UNREACHABLE.has(error.cause?.code ?? "");
  results[classification] += 1;
  rows.push({ url, status, classification, unreachable });

  const mark = { live: "ok", blocked: "wall", dead: "DEAD" }[classification];
  const note = error ? ` (${error.cause?.code ?? error.name})` : "";
  console.log(`${String(index + 1).padStart(3)}/${urls.length}  ${mark.padEnd(5)} ${String(status || "-").padEnd(4)} ${url.slice(0, 90)}${note}`);
}

// If most of the run could not connect, the network is the problem. Writing
// that into an append-only audit trail would libel every source in the dataset.
const unreachableCount = rows.filter((row) => row.unreachable).length;
if (unreachableCount > rows.length / 2) {
  console.error(`\n${unreachableCount} of ${rows.length} requests could not connect. Network looks down.`);
  console.error("Nothing written to the history file. Re-run when connectivity is back.");
  process.exit(2);
}

for (const row of rows) {
  await appendFile(HISTORY, JSON.stringify({
    checked_at: new Date().toISOString(),
    url: row.url,
    http_status: row.status,
    classification: row.classification,
    action: row.classification === "dead" ? "review" : "keep",
  }) + "\n");
}

console.log(`\nlive ${results.live} · blocked ${results.blocked} · dead ${results.dead}`);
console.log(`Appended ${rows.length} row(s) to data/research/link-check-history.jsonl`);
if (results.dead) console.log("\nDead links need a replacement source, not deletion of the claim.");
process.exit(results.dead ? 1 : 0);

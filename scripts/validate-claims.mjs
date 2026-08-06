#!/usr/bin/env node
/**
 * Check each data point against its own source: does the cited page actually
 * contain the figures, dates, and names the record claims?
 *
 *   npm run data:claims                 check every record against the local cache
 *   npm run data:claims -- --web        re-fetch anything the cache cannot answer
 *   npm run data:claims -- --company X  check one company
 *   npm run data:claims -- --json       machine-readable
 *
 * Local store first, web second, by design. The cache is the record of what a
 * source said when it was read; the web is what it says now. Consulting the
 * cache first makes a normal run free, offline-capable, and deterministic, and
 * it means a page that has since been rewritten still shows what was cited.
 *
 * What this catches is the defect a link check cannot see: a real, reachable,
 * plausible URL that does not say what the site says it says. That exact defect
 * shipped here and survived three review rounds.
 *
 * What it does not do is judge. A term the page does not contain is a prompt to
 * go read it, not a verdict: sources paraphrase, spell out numbers, and put
 * figures in images. Treat the output as a queue.
 */

import { hostOf, loadData, sourcedRecords } from "./lib/records.mjs";
import { claimTerms, htmlToText, missingTerms, readCachedText, readIndex, urlHash } from "./lib/source-cache.mjs";

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const valueOf = (flag) => {
  const at = argv.indexOf(flag);
  return at === -1 ? null : argv[at + 1];
};

const useWeb = has("--web");
const onlyCompany = valueOf("--company");
const asJson = has("--json");

const data = await loadData();
const index = await readIndex();
let rows = sourcedRecords(data);
if (onlyCompany) rows = rows.filter((row) => row.companySlug === onlyCompany);

if (rows.length === 0) {
  console.error(onlyCompany ? `No records for company ${onlyCompany}` : "No records to check.");
  process.exit(2);
}

const lastHit = new Map();
async function fetchText(url) {
  const host = hostOf(url);
  const since = Date.now() - (lastHit.get(host) ?? 0);
  if (since < 2000) await new Promise((resolve) => setTimeout(resolve, 2000 - since));
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
      headers: { "user-agent": "deployment-core claim check (https://github.com/pranava0x0/nucleardeployment)" },
    });
    lastHit.set(host, Date.now());
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "";
    if (!/text\/|xml|json/.test(type)) return null;
    return htmlToText(await response.text());
  } catch {
    lastHit.set(host, Date.now());
    return null;
  }
}

const results = [];
for (const row of rows) {
  const terms = claimTerms(String(row.label ?? ""));
  const hash = urlHash(row.source);
  const entry = index.sources[row.source];
  let text = await readCachedText(hash);
  let checkedAgainst = text ? "cache" : null;

  if (!text && useWeb) {
    text = await fetchText(row.source);
    if (text) checkedAgainst = "web";
  }

  if (!text) {
    results.push({
      ...row, terms, state: entry?.state === "blocked" ? "blocked"
        : entry?.state === "not-text" ? "not-text" : "uncached",
      note: entry?.note ?? "No local snapshot. Run npm run data:cache.",
      missing: [],
    });
    continue;
  }

  const missing = missingTerms(text, terms);
  results.push({
    ...row,
    terms,
    checkedAgainst,
    state: terms.length === 0 ? "no-terms" : missing.length === 0 ? "supported" : "unconfirmed",
    missing,
  });
}

const counts = {};
for (const result of results) counts[result.state] = (counts[result.state] ?? 0) + 1;

if (asJson) {
  console.log(JSON.stringify({ checked: results.length, counts, results }, null, 2));
  process.exit(0);
}

console.log(`Checked ${results.length} record(s) against their sources.\n`);
for (const [state, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  const meaning = {
    supported: "every figure, date and name in the label appears in the source",
    unconfirmed: "the source does not obviously contain part of the claim; go read it",
    uncached: "no local snapshot yet",
    blocked: "the host refuses scripted fetches; verify in a browser",
    "not-text": "the source is a PDF or binary; read it with a PDF tool",
    "no-terms": "the label carries no checkable figure, date or name",
  }[state];
  console.log(`   ${state.padEnd(13)} ${String(count).padStart(4)}   ${meaning}`);
}

const unconfirmed = results.filter((result) => result.state === "unconfirmed");
if (unconfirmed.length) {
  console.log(`\n${unconfirmed.length} record(s) to read. Missing terms are a prompt, not a verdict:\n`);
  for (const result of unconfirmed.slice(0, 30)) {
    console.log(`   ${result.companySlug} · ${result.kind}`);
    console.log(`      claim   ${String(result.label).slice(0, 96)}`);
    console.log(`      missing ${result.missing.slice(0, 6).join(" | ")}`);
    console.log(`      source  ${result.source}`);
  }
  if (unconfirmed.length > 30) console.log(`   ... and ${unconfirmed.length - 30} more. Use --json for all.`);
}

const blocked = results.filter((result) => ["blocked", "not-text", "uncached"].includes(result.state));
if (blocked.length) console.log(`\n${blocked.length} record(s) could not be checked locally. Run npm run data:cache, or verify those in a browser.`);

// Unconfirmed is a queue, not a build failure: sources legitimately paraphrase.
// Only a record with no source snapshot at all and no way to get one is an error.
process.exit(0);

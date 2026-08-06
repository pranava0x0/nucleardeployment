#!/usr/bin/env node
/**
 * Validate every sourced record in the dataset.
 *
 *   node scripts/validate-sources.mjs            report and exit non-zero on error
 *   node scripts/validate-sources.mjs --press    list only the press-cited records
 *   node scripts/validate-sources.mjs --json     machine-readable output
 *
 * Checks, in order of how badly each one bites:
 *   1. Every source is https and parses as a URL.
 *   2. Every record's reporting basis matches its source host.
 *   3. Off-origin junk: a host on no list at all is reported so the tier map
 *      gets a deliberate decision rather than a silent default.
 *   4. Press-cited records are listed as upgrade candidates. A trade-press
 *      article is a legitimate source; it is just never the best available one
 *      when the company or the regulator published the same fact.
 *
 * This does not fetch anything. Reachability is `check-links.mjs`, and whether
 * a page actually supports its claim is a human read: a 200 and a real file are
 * not proof, which is how a source that documented a different event survived
 * three review rounds here.
 */

import { hostOf, loadData, sourcedRecords } from "./lib/records.mjs";

const args = new Set(process.argv.slice(2));
const data = await loadData();
const rows = sourcedRecords(data);

const errors = [];
const pressRows = [];
const unknownHosts = new Map();

const knownHosts = new Set(data.verificationHosts.flatMap((tier) => tier.hosts));

const byTier = {};

for (const row of rows) {
  const host = hostOf(row.source);
  if (!host) {
    errors.push(`${row.kind} ${row.companySlug}: source does not parse as a URL: ${row.source}`);
    continue;
  }
  if (!row.source.startsWith("https://")) {
    errors.push(`${row.kind} ${row.companySlug}: source is not https: ${row.source}`);
  }
  // Resolved once per row. A second pass to build the tally recomputed this for
  // every record and left two places to keep in step.
  const tier = data.verificationForSource(row.source);
  byTier[tier] = (byTier[tier] ?? 0) + 1;
  if (row.verification && row.verification !== tier) {
    errors.push(`${row.kind} ${row.companySlug}: labelled ${row.verification} but ${host} is ${tier}`);
  }
  if (!knownHosts.has(host)) {
    unknownHosts.set(host, (unknownHosts.get(host) ?? 0) + 1);
  }
  if (tier === "Press-reported") pressRows.push({ ...row, host });
}

if (args.has("--json")) {
  console.log(JSON.stringify({ total: rows.length, byTier, errors, press: pressRows, unknownHosts: [...unknownHosts] }, null, 2));
} else if (args.has("--press")) {
  console.log(`${pressRows.length} of ${rows.length} records cite trade press.\n`);
  const byCompany = new Map();
  for (const row of pressRows) {
    if (!byCompany.has(row.companySlug)) byCompany.set(row.companySlug, []);
    byCompany.get(row.companySlug).push(row);
  }
  for (const [company, list] of [...byCompany].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`${company} (${list.length})`);
    for (const row of list) {
      console.log(`   ${row.kind.padEnd(28)} ${row.host.padEnd(28)} ${String(row.label).slice(0, 62)}`);
    }
  }
} else {
  console.log(`Checked ${rows.length} sourced records across ${new Set(rows.map((row) => row.companySlug)).size} companies.\n`);
  console.log("Reporting basis by source tier:");
  for (const [tier, count] of Object.entries(byTier).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${tier.padEnd(22)} ${String(count).padStart(4)}  ${Math.round((count / rows.length) * 100)}%`);
  }
  if (unknownHosts.size) {
    console.log(`\n${unknownHosts.size} host(s) on no tier list, defaulting to press:`);
    for (const [host, count] of [...unknownHosts].sort((a, b) => b[1] - a[1])) {
      console.log(`   ${host.padEnd(40)} ${count}`);
    }
  }
  console.log(`\n${pressRows.length} record(s) cite trade press. Run with --press to list them.`);
  if (!errors.length) console.log("\nNo source errors.");
}

// Printed in every mode. Exiting non-zero without saying why leaves the caller
// to rerun a different subcommand to find out.
if (errors.length && !args.has("--json")) {
  console.error(`\n${errors.length} error(s):`);
  for (const error of errors) console.error(`   ${error}`);
}

process.exit(errors.length ? 1 : 0);

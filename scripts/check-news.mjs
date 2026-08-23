#!/usr/bin/env node
/**
 * A freshness canary for the "Latest developments" feed: on demand, check
 * whether a newsroom this dataset already cites has published something new
 * since the last check.
 *
 *   npm run data:news             check every derived watch root
 *   npm run data:news -- --list   print the derived watch list and exit
 *
 * This never writes to app/data.ts, financing-data.ts, or bd-data.ts, and it
 * never invents a URL. Every watch root is derived by truncating a URL this
 * dataset already cites down to its newsroom index (a "newsroom." subdomain,
 * or a /newsroom//press//news/ path segment), so a run only ever visits pages
 * a person already opened and verified once. Per REFRESH.md, sourcing a new
 * record is still a person reading the primary document and citing it by
 * hand; this script only says where something changed, never what it means.
 *
 * Polite by construction, matching cache-sources.mjs: one request per host
 * every 2 seconds, an honest user agent, no retries against a wall.
 */

import { hostOf, loadData, sourcedRecords } from "./lib/records.mjs";
import { htmlToText, looksLikeWall, titleOf } from "./lib/source-cache.mjs";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const WATCH_PATH = new URL("../data/research/news-watch.json", import.meta.url);

const argv = process.argv.slice(2);
const listOnly = argv.includes("--list");

/**
 * Wire services and multi-company aggregators whose front page changes
 * constantly regardless of whether a tracked company did anything: watching
 * one would report "changed" almost every run and teach a reader to ignore
 * this script's output. Includes every low-quality aggregator host already
 * named in backlog.md's press-upgrade queue, plus the general newswires and
 * trade press that showed up deriving the initial watch list.
 */
const AGGREGATOR_HOSTS = new Set([
  "businesswire.com", "accessnewswire.com", "prnewswire.com", "globenewswire.com",
  "bloomberg.com", "tipranks.com", "stocktitan.net", "gurufocus.com", "premieralts.com",
  "techfundingnews.com", "theaiworld.org", "interestingengineering.com", "manilatimes.net",
  "utilitydive.com", "ans.org", "nucnet.org", "neimagazine.com", "barchart.com",
]);

/**
 * Truncate an already-cited URL down to the newsroom index it lives under.
 * Returns null for anything that is not clearly a single organization's own
 * newsroom/press URL, rather than guessing: a regulator docket, an SEC
 * filing, a one-off trade-press article, or a wire-service front page has no
 * listing page this script can safely or usefully derive.
 */
function watchRootFor(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  if (AGGREGATOR_HOSTS.has(host)) return null;
  if (/^(newsroom|press|news|media)\./i.test(parsed.hostname)) {
    return `${parsed.protocol}//${parsed.hostname}/`;
  }
  const segments = parsed.pathname.split("/").filter(Boolean);
  const at = segments.findIndex((segment) => /^(newsroom|press-releases|pressroom|press|news|media|announcements)$/i.test(segment));
  if (at === -1) return null;
  return `${parsed.protocol}//${parsed.hostname}/${segments.slice(0, at + 1).join("/")}/`;
}

async function readWatchIndex() {
  try {
    return JSON.parse(await readFile(WATCH_PATH, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return { updated_at: null, roots: {} };
    throw error;
  }
}

async function writeWatchIndex(index) {
  await mkdir(new URL("../data/research/", import.meta.url), { recursive: true });
  const roots = Object.fromEntries(Object.entries(index.roots).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(WATCH_PATH, JSON.stringify({ ...index, roots }, null, 2) + "\n");
}

const data = await loadData();

/** root URL -> the company slugs / sections whose sources point at it. */
const rootsToOwners = new Map();
for (const row of sourcedRecords(data)) {
  const root = watchRootFor(row.source);
  if (!root) continue;
  if (!rootsToOwners.has(root)) rootsToOwners.set(root, new Set());
  rootsToOwners.get(root).add(row.companySlug);
}

const roots = [...rootsToOwners.keys()].sort();

if (roots.length === 0) {
  console.log("No newsroom-shaped source URLs found to watch.");
  process.exit(0);
}

if (listOnly) {
  for (const root of roots) console.log(`${root}  (${[...rootsToOwners.get(root)].join(", ")})`);
  console.log(`\n${roots.length} watch root(s) derived from ${sourcedRecords(data).length} sourced records.`);
  process.exit(0);
}

const watchIndex = await readWatchIndex();
const lastHit = new Map();
const tally = { changed: 0, unchanged: 0, first: 0, blocked: 0, failed: 0 };
const changedRoots = [];

for (const [position, root] of roots.entries()) {
  const host = hostOf(root);
  const since = Date.now() - (lastHit.get(host) ?? 0);
  if (since < 2000) await new Promise((resolve) => setTimeout(resolve, 2000 - since));

  let status = 0;
  let html = "";
  let error = null;
  try {
    const response = await fetch(root, {
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
      headers: {
        "user-agent": "deployment-core news watch (https://github.com/pranava0x0/nucleardeployment)",
        accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
      },
    });
    status = response.status;
    if (response.ok) html = await response.text();
  } catch (caught) {
    error = caught;
  }
  lastHit.set(host, Date.now());

  const previous = watchIndex.roots[root];
  let state;
  let text = "";
  let hash = previous?.hash ?? null;

  if (error) {
    state = "failed";
  } else if (status === 401 || status === 403 || status === 429) {
    state = "blocked";
  } else if (!html) {
    state = status >= 200 && status < 400 ? "blocked" : "failed";
  } else {
    text = htmlToText(html);
    const wall = looksLikeWall(text);
    if (wall) {
      state = "blocked";
    } else {
      hash = createHash("sha256").update(text).digest("hex").slice(0, 16);
      state = !previous ? "first" : hash === previous.hash ? "unchanged" : "changed";
    }
  }

  tally[state] += 1;
  if (state === "changed") changedRoots.push(root);

  if (state === "first" || state === "changed") {
    watchIndex.roots[root] = {
      hash,
      title: titleOf(html),
      bytes: text.length,
      checked_at: new Date().toISOString(),
      changed_at: new Date().toISOString(),
      owners: [...rootsToOwners.get(root)],
    };
  } else if (previous) {
    watchIndex.roots[root] = { ...previous, checked_at: new Date().toISOString() };
  }

  const mark = { unchanged: "same", changed: "NEW ", first: "init", blocked: "wall", failed: "FAIL" }[state];
  console.log(`${String(position + 1).padStart(3)}/${roots.length}  ${mark}  ${String(status || "-").padEnd(4)} ${root}`);
}

watchIndex.updated_at = new Date().toISOString();
await writeWatchIndex(watchIndex);

console.log(`\nunchanged ${tally.unchanged} · changed ${tally.changed} · first check ${tally.first} · blocked ${tally.blocked} · failed ${tally.failed}`);

if (changedRoots.length > 0) {
  console.log("\nChanged since last check, go read these for anything worth a new record:");
  for (const root of changedRoots) console.log(`   ${root}  (${[...rootsToOwners.get(root)].join(", ")})`);
  console.log("\nThis script only detects drift. Add a record the normal way: find the primary");
  console.log("document, npm run data:cache -- --url <URL>, npm run data:claims, then edit");
  console.log("app/data.ts / financing-data.ts / bd-data.ts by hand. See REFRESH.md.");
}

if (tally.failed > roots.length / 2) {
  console.error("\nMost fetches failed. Network looks down; re-run rather than trusting this pass.");
  process.exit(2);
}

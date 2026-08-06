#!/usr/bin/env node
/**
 * Fetch every cited source once and store a readable snapshot under
 * `data/sources/`, so the evidence survives the page changing.
 *
 *   npm run data:cache                  fetch anything not already cached
 *   npm run data:cache -- --refresh     re-fetch everything, even if cached
 *   npm run data:cache -- --url <URL>   cache one URL, for a new record
 *   npm run data:cache -- --stale 90    re-fetch anything older than 90 days
 *   npm run data:cache -- --dry-run     show what would be fetched
 *
 * Polite by construction: one request per host every 2 seconds, an honest
 * user agent, and no retries against a wall. Hosts that block scripted fetches
 * are recorded as blocked with their status, which is itself useful to know
 * and is exactly the case a human has to verify in a browser.
 *
 * This exists so a validation run does not have to touch the network, and so a
 * reader in a year can see what a source said on the day it was cited.
 */

import { hostOf, loadData, sourcedRecords } from "./lib/records.mjs";
import {
  apiUrlFor, cachedHashes, htmlToText, looksLikeWall, readIndex, textFromFederalRegisterApi,
  titleOf, urlHash, writeCachedPage, writeIndex,
} from "./lib/source-cache.mjs";

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const valueOf = (flag, fallback = null) => {
  const at = argv.indexOf(flag);
  return at === -1 ? fallback : argv[at + 1];
};

const refresh = has("--refresh");
const dryRun = has("--dry-run");
const singleUrl = valueOf("--url");
const staleDays = valueOf("--stale") ? Number(valueOf("--stale")) : null;

if (valueOf("--stale") && (!Number.isFinite(staleDays) || staleDays <= 0)) {
  console.error(`--stale needs a positive number of days, got ${JSON.stringify(valueOf("--stale"))}`);
  process.exit(2);
}

const data = await loadData();
const index = await readIndex();
const alreadyCached = await cachedHashes();

/** Every URL the dataset cites, or the single one asked for. */
const allUrls = singleUrl
  ? [singleUrl]
  : [...new Set(sourcedRecords(data).map((row) => row.source))];

const stale = (url) => {
  if (!staleDays) return false;
  const entry = index.sources[url];
  if (!entry?.fetched_at) return true;
  return (Date.now() - Date.parse(entry.fetched_at)) / 86400000 > staleDays;
};

const todo = allUrls.filter((url) => refresh || stale(url) || !alreadyCached.has(urlHash(url)));

if (todo.length === 0) {
  console.log(`All ${allUrls.length} source(s) already cached. Use --refresh or --stale <days> to re-fetch.`);
  process.exit(0);
}

console.log(`${todo.length} of ${allUrls.length} source(s) need fetching across ${new Set(todo.map(hostOf)).size} host(s).`);
if (dryRun) {
  for (const url of todo) console.log(`   ${url}`);
  process.exit(0);
}

const lastHit = new Map();
const tally = { stored: 0, blocked: 0, failed: 0 };

for (const [position, url] of todo.entries()) {
  const host = hostOf(url);
  const since = Date.now() - (lastHit.get(host) ?? 0);
  if (since < 2000) await new Promise((resolve) => setTimeout(resolve, 2000 - since));

  let status = 0;
  let html = "";
  let error = null;
  let contentType = "";
  // Some hosts refuse scripted page fetches and publish an API instead. Using
  // the documented path is politer and is the only way to get real content.
  const apiUrl = apiUrlFor(url);
  const fetchUrl = apiUrl ?? url;
  try {
    const response = await fetch(fetchUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
      headers: {
        "user-agent": "deployment-core source cache (https://github.com/pranava0x0/nucleardeployment)",
        accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8",
      },
    });
    status = response.status;
    contentType = response.headers.get("content-type") ?? "";
    if (response.ok && /text\/|xml|json/.test(contentType)) html = await response.text();
  } catch (caught) {
    error = caught;
  }
  lastHit.set(host, Date.now());

  const hash = urlHash(url);
  // A 200 carrying a refusal page is worse than a 403: it stores clean and
  // proves nothing. Check the body before believing the status.
  let wall = null;
  if (html) {
    const text = apiUrl ? textFromFederalRegisterApi(html) : htmlToText(html);
    wall = looksLikeWall(text);
  }
  let state;
  if (error) {
    state = "unreachable";
    tally.failed += 1;
  } else if (status === 401 || status === 403 || status === 429) {
    state = "blocked";
    tally.blocked += 1;
  } else if (!html) {
    // A real response we cannot read as text, such as a PDF.
    state = status >= 200 && status < 400 ? "not-text" : "error";
    tally[state === "not-text" ? "blocked" : "failed"] += 1;
  } else if (wall) {
    state = "blocked";
    tally.blocked += 1;
  } else {
    state = "stored";
    tally.stored += 1;
  }

  if (state === "stored") {
    const text = apiUrl ? textFromFederalRegisterApi(html) : htmlToText(html);
    await writeCachedPage(hash, text, {
      url, fetched_via: fetchUrl, fetched_at: new Date().toISOString(), http_status: status,
      content_type: contentType, bytes: text.length, title: apiUrl ? text.split("\n")[0] : titleOf(html),
    });
    index.sources[url] = {
      hash, fetched_at: new Date().toISOString(), http_status: status,
      state, title: apiUrl ? text.split("\n")[0] : titleOf(html), bytes: text.length,
      ...(apiUrl ? { fetched_via: fetchUrl } : {}),
    };
  } else {
    index.sources[url] = {
      hash: index.sources[url]?.hash ?? hash,
      fetched_at: new Date().toISOString(),
      http_status: status,
      state,
      note: state === "blocked"
        ? (wall
          ? `Server answered ${status} with a refusal page (${wall}). Verify in a browser and record the read in link-check-history.jsonl.`
          : "Host refuses scripted fetches. Verify in a browser and record the read in link-check-history.jsonl.")
        : state === "not-text"
          ? "Real response, not readable as text. A PDF or binary; read it with a PDF tool."
          : `Could not fetch: ${error?.cause?.code ?? error?.name ?? status}`,
    };
  }

  const mark = { stored: "ok", blocked: "wall", "not-text": "bin", unreachable: "FAIL", error: "FAIL" }[state];
  console.log(`${String(position + 1).padStart(3)}/${todo.length}  ${mark.padEnd(4)} ${String(status || "-").padEnd(4)} ${url.slice(0, 88)}`);
}

index.updated_at = new Date().toISOString();
await writeIndex(index);

console.log(`\nstored ${tally.stored} · blocked or binary ${tally.blocked} · failed ${tally.failed}`);
console.log("Snapshots in data/sources/pages/, index in data/sources/index.json");
if (tally.failed > todo.length / 2) {
  console.error("\nMost fetches failed. Network looks down; re-run rather than trusting this pass.");
  process.exit(2);
}

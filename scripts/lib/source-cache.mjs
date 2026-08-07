/**
 * A local, committed snapshot of every source the site cites.
 *
 * The point is that the evidence survives the internet. Pages get rewritten,
 * companies reorganise their newsrooms, trade press moves behind a wall, and a
 * citation that resolved when it was written stops proving anything. A stored
 * copy means a future reader can see what the page said on the day it was read,
 * and a validation run can check a claim without touching the network.
 *
 * Layout, under `data/sources/`:
 *   index.json          one entry per URL: hash, fetch date, status, title, bytes
 *   pages/<hash>.txt    the readable text of the page as fetched
 *   pages/<hash>.meta.json  headers and fetch context worth keeping
 *
 * Text, not raw HTML: the text is what a claim is checked against, it diffs
 * legibly in review, and it keeps the repository small enough to commit.
 * Content-addressed by URL hash so re-fetching the same URL overwrites one file
 * rather than accumulating copies.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";

export const CACHE_DIR = new URL("../../data/sources/", import.meta.url);
export const PAGES_DIR = new URL("pages/", CACHE_DIR);
export const INDEX_PATH = new URL("index.json", CACHE_DIR);

/** Stable, short, filesystem-safe id for a URL. */
export function urlHash(url) {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

export async function ensureCacheDirs() {
  await mkdir(PAGES_DIR, { recursive: true });
}

export async function readIndex() {
  try {
    return JSON.parse(await readFile(INDEX_PATH, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return { updated_at: null, sources: {} };
    throw error;
  }
}

export async function writeIndex(index) {
  await ensureCacheDirs();
  // Sorted so the committed file diffs cleanly instead of reordering on each run.
  const sources = Object.fromEntries(Object.entries(index.sources).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(INDEX_PATH, JSON.stringify({ ...index, sources }, null, 2) + "\n");
}

export async function readCachedText(hash) {
  try {
    return await readFile(new URL(`pages/${hash}.txt`, CACHE_DIR), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export async function writeCachedPage(hash, text, meta) {
  await ensureCacheDirs();
  await writeFile(new URL(`pages/${hash}.txt`, CACHE_DIR), text);
  await writeFile(new URL(`pages/${hash}.meta.json`, CACHE_DIR), JSON.stringify(meta, null, 2) + "\n");
}

export async function cachedHashes() {
  try {
    const names = await readdir(PAGES_DIR);
    return new Set(names.filter((name) => name.endsWith(".txt")).map((name) => name.replace(/\.txt$/, "")));
  } catch (error) {
    if (error.code === "ENOENT") return new Set();
    throw error;
  }
}

/**
 * HTML to readable text. Deliberately simple: scripts, styles and tags out,
 * entities decoded, whitespace collapsed per block. It only has to be good
 * enough to search for a claim's key terms and for a human to read back.
 */
export function htmlToText(html) {
  const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'", "#x27": "'", "#8217": "’", "#8211": "–", "#8212": "—" };
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article|br|table)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&([a-z]+|#x?[0-9a-f]+);/gi, (match, name) => entities[name.toLowerCase()] ?? match)
    .split("\n")
    .map((line) => line.replace(/[ \t ]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

export function titleOf(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? htmlToText(match[1]).slice(0, 200) : null;
}

/**
 * Terms worth checking a claim against. Numbers, dates, and capitalised names
 * survive rewording; ordinary words do not, and matching on them produces
 * confident nonsense.
 */
const COMMON_CAPITALS = new Set([
  "the", "this", "each", "under", "with", "from", "for", "and", "its", "not",
  "only", "first", "second", "third", "fourth", "fifth", "over", "into", "onto",
  "signed", "secured", "selected", "named", "holds", "reached", "phased", "built",
  "executed", "issued", "approved", "accepted", "targeted", "announced", "listed",
]);

export function claimTerms(label) {
  const terms = new Set();
  for (const match of label.matchAll(/\b\d[\d,.]*\s?(?:MWe|MWt|GW|MW|kWt)\b/gi)) terms.add(match[0]);
  for (const match of label.matchAll(/\b(?:19|20)\d{2}(?:-\d{2})?(?:-\d{2})?\b/g)) terms.add(match[0]);
  // Skip the first word: a label opens with a capital regardless of whether
  // that word is a name, and "Secured", "Selected", "Holds" and "Phased" were
  // all reported as missing entities.
  const body = label.replace(/^\S+\s+/, "");
  for (const match of body.matchAll(/\b[A-Z][A-Za-z0-9-]{2,}(?:\s+[A-Z][A-Za-z0-9-]{2,})?/g)) {
    if (!COMMON_CAPITALS.has(match[0].toLowerCase())) terms.add(match[0]);
  }
  return [...terms];
}

/** Does the cached text support these terms? Returns the ones it cannot find. */
export function missingTerms(text, terms) {
  if (!text) return terms;
  const haystack = text.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");
  return terms.filter((term) => {
    const needle = term.toLowerCase();
    if (haystack.includes(needle)) return false;
    // A figure written "345 MWe" in the label may appear as "345-MWe" or "345 MW".
    const loose = needle.replace(/\s+/g, "[\\s-]?").replace(/mwe|mwt/g, "mw[et]?");
    return !new RegExp(loose).test(haystack);
  });
}

/**
 * A wall page returns 200 with real-looking text, so storing it as a snapshot
 * is a silent data-quality failure: the file looks fine and proves nothing.
 * All three federalregister.gov snapshots were 1,180 bytes of "Request Access"
 * before this check existed, which made the claim validator report records that
 * had been verified by hand as unconfirmed.
 */
const WALL_MARKERS = [
  "request access",
  "due to aggressive automated scraping",
  "enable javascript",
  "verify you are human",
  "just a moment",
  "attention required",
  "access denied",
  "are you a robot",
  "unusual traffic",
];

export function looksLikeWall(text) {
  if (!text) return "empty response";
  const head = text.slice(0, 1500).toLowerCase();
  for (const marker of WALL_MARKERS) {
    if (head.includes(marker)) return `interstitial: "${marker}"`;
  }
  // An article that renders to almost nothing is a wall or a JS-only shell.
  if (text.length < 800) return `only ${text.length} bytes of text`;
  return null;
}

/**
 * Federal Register blocks scripted page fetches and points at its API instead.
 * Using the documented path is both politer and the only way to get the real
 * document text, so the three notices this project cites become real snapshots
 * rather than three copies of the refusal page.
 */
export function apiUrlFor(url) {
  const match = url.match(/^https:\/\/(?:www\.)?federalregister\.gov\/documents\/\d{4}\/\d{2}\/\d{2}\/([^/]+)\//);
  if (match) return `https://www.federalregister.gov/api/v1/documents/${match[1]}.json`;
  return null;
}

/** Flatten a Federal Register API document into readable text. */
export function textFromFederalRegisterApi(json) {
  const doc = JSON.parse(json);
  const parts = [doc.title, doc.abstract, `Document number: ${doc.document_number}`,
    `Published: ${doc.publication_date}`, `Type: ${doc.type}`,
    (doc.agencies ?? []).map((agency) => agency.name).join(", "),
    doc.action, doc.dates, doc.html_url];
  return parts.filter(Boolean).join("\n");
}

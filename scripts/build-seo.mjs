#!/usr/bin/env node
/**
 * Generate the three machine-discovery files in `public/` from the dataset:
 *
 *   sitemap.xml   every route, with lastmod from dataAsOf
 *   robots.txt    crawling welcome, sitemap and llms.txt pointers
 *   feed.xml      RSS 2.0 over the dated evidence ledger (timeline())
 *
 *   node scripts/build-seo.mjs           write the files
 *   node scripts/build-seo.mjs --check   fail if any committed copy is stale
 *
 * These are plain files rather than framework metadata routes on purpose: the
 * vinext build and the `next build` Pages export must both ship them, and
 * `public/` is the one path both copy through unchanged.
 *
 * Undated events stay out of the feed: RSS requires a timestamp and a date is
 * never guessed. A month-precision date serializes as the first of that month
 * at noon UTC for the protocol field only; the item title keeps the source's
 * own precision.
 */

import { readFile, writeFile } from "node:fs/promises";
import { loadData } from "./lib/records.mjs";

/** Matches app/site.ts, which builds the same values from the build env. */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://pranava0x0.github.io").replace(/\/$/, "");
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "/nucleardeployment").replace(/\/$/, "");
/** Routes as GitHub Pages serves them: trailing slash, no redirect hop. */
const page = (path = "") => `${SITE_URL}${BASE_PATH}${path}/`;
const file = (path) => `${SITE_URL}${BASE_PATH}${path}`;

const escapeXml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");

const data = await loadData();

// --- sitemap.xml -----------------------------------------------------------

// lastmod is the real per-page change date (DESIGN.md 11.2), so a record page
// moves only when one of its own records does. Aggregate routes render the
// whole dataset and carry its date. Mixed-precision dates (YYYY-MM beside
// YYYY-MM-DD) compare correctly as strings and are both valid W3C datetimes.
const companyDates = new Map();
const noteDate = (slug, date) => {
  if (!date) return;
  const prev = companyDates.get(slug);
  if (!prev || date > prev) companyDates.set(slug, date);
};
for (const claim of data.capacityClaims) noteDate(claim.companySlug, claim.date);
for (const event of data.fundingEvents) noteDate(event.companySlug, event.date);
for (const event of data.proofEvents) noteDate(event.companySlug, event.date);
for (const position of data.cashPositions) noteDate(position.companySlug, position.asOf);
for (const target of data.statedTargets) noteDate(target.companySlug, target.statedDate);
for (const project of data.projects) noteDate(project.companySlug, project.latestDate);

/** [route, lastmod]. A null lastmod is omitted, never guessed. */
const routes = [
  ...["", "/updates", "/deployments", "/companies", "/map", "/federal-action", "/capital", "/methodology"]
    .map((route) => [route, data.dataAsOf]),
  ...data.companies.map((company) => [`/companies/${company.slug}`, companyDates.get(company.slug) ?? null]),
  ...data.projects.map((project) => [`/deployments/${project.slug}`, project.latestDate]),
];

const sitemap = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...routes.map(([route, lastmod]) =>
    `  <url><loc>${escapeXml(page(route))}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`),
  `</urlset>`,
  ``,
].join("\n");

// --- robots.txt ------------------------------------------------------------

const robots = [
  `# Deployment Core. Crawling is welcome; every page cites its sources.`,
  `User-agent: *`,
  `Allow: /`,
  ``,
  `Sitemap: ${file("/sitemap.xml")}`,
  ``,
  `# Machine-readable summary of the dataset, for agents:`,
  `# ${file("/llms.txt")}`,
  ``,
].join("\n");

// --- feed.xml --------------------------------------------------------------

/** Noon UTC keeps the calendar date stable in every timezone a reader is in. */
const rfc822 = (date) => new Date(`${date.length === 7 ? `${date}-01` : date}T12:00:00Z`).toUTCString();

const FEED_CAP = 50;
const dated = data.timeline().filter((entry) => entry.date);
// Two events can share a source and a date (an equity raise and its debt
// facility announced together), so the guid carries kind and label too.
const guid = (entry) => `${entry.source}#${entry.date}#${entry.kind}#${entry.label.slice(0, 40)}`;
const items = dated.slice(0, FEED_CAP).map((entry) => [
  `    <item>`,
  `      <title>${escapeXml(`${entry.date} · ${entry.company}: ${entry.label}`)}</title>`,
  `      <link>${escapeXml(entry.source)}</link>`,
  `      <guid isPermaLink="false">${escapeXml(guid(entry))}</guid>`,
  `      <pubDate>${rfc822(entry.date)}</pubDate>`,
  `      <description>${escapeXml([entry.detail, `${entry.lane} event · ${entry.kind}`, `${entry.verification}.`].filter(Boolean).join(" · "))}</description>`,
  `    </item>`,
].join("\n"));

const feed = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
  `  <channel>`,
  `    <title>Deployment Core · U.S. nuclear updates</title>`,
  `    <link>${escapeXml(page("/updates"))}</link>`,
  `    <atom:link href="${escapeXml(file("/feed.xml"))}" rel="self" type="application/rss+xml"/>`,
  `    <description>Dated evidence events for U.S. new-design nuclear: criticalities, construction starts, permits, raises, awards, and loans. Each item links the document behind it. Dates keep the source's own precision in the title.</description>`,
  `    <language>en-us</language>`,
  `    <lastBuildDate>${rfc822(data.dataAsOf)}</lastBuildDate>`,
  ...items,
  `  </channel>`,
  `</rss>`,
  ``,
].join("\n");

// --- write or check --------------------------------------------------------

const outputs = [
  ["public/sitemap.xml", sitemap],
  ["public/robots.txt", robots],
  ["public/feed.xml", feed],
];

if (process.argv.includes("--check")) {
  const stale = [];
  for (const [path, text] of outputs) {
    let current = null;
    try {
      current = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
    } catch {
      stale.push(path);
      continue;
    }
    if (current !== text) stale.push(path);
  }
  if (stale.length) {
    console.error(`Out of date: ${stale.join(", ")}. Run: node scripts/build-seo.mjs`);
    process.exit(1);
  }
  console.log("sitemap.xml, robots.txt, and feed.xml match the data.");
} else {
  for (const [path, text] of outputs) {
    await writeFile(new URL(`../${path}`, import.meta.url), text);
    console.log(`Wrote ${path} (${text.length} bytes).`);
  }
}

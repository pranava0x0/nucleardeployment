#!/usr/bin/env node
/**
 * Read every string the site ships and flag the ones that read like a model
 * wrote them.
 *
 *   node scripts/audit-prose.mjs           report and exit non-zero on a hit
 *   node scripts/audit-prose.mjs --stats    sentence length and reading stats
 *
 * Reads the built HTML, so it covers component copy, dataset labels, and
 * anything a future template introduces. Run `npm run build` first.
 *
 * The rules come from DESIGN.md section 11.1. Two are hard failures, the model
 * register and the em-dash. The rest are warnings, because a long sentence is
 * sometimes the right sentence and a script cannot tell.
 */

import { loadData } from "./lib/records.mjs";

const BANNED = [
  "delve", "leverage", "robust", "seamless", "elevate", "unlock", "empower", "harness",
  "tapestry", "testament", "underscore", "pivotal", "cutting-edge", "game-changer",
  "ever-evolving", "realm", "it's worth noting", "it's important to note",
  "when it comes to", "at the end of the day", "in conclusion", "at your fingertips",
  "next level", "designed to help you", "not only", "navigate the complexities",
  "in today's", "a testament to", "plays a crucial role", "stands as",
];

/** Padding that adds length without adding meaning. */
const HEDGES = ["generally", "typically", "in most cases", "arguably", "somewhat", "fairly", "quite"];

const data = await loadData();
const paths = ["/", "/methodology", "/companies", "/deployments", "/capital", "/federal-action", "/map",
  ...data.raceEntrants.map((entrant) => `/companies/${entrant.companySlug}`)];

const worker = (await import(new URL("../dist/server/index.js", import.meta.url).href + `?t=${Math.random()}`)).default;

async function prose(path) {
  const response = await worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  const html = await response.text();
  // Break on block elements first. Without this, table cells and list items run
  // together into one unpunctuated blob and every page reads as a single
  // 900-word sentence, which tells you nothing about the writing.
  const blocks = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--.*?-->/g, "")
    .replace(/<\/(p|li|h1|h2|h3|h4|div|section|article|td|th|dd|dt|figcaption|span|b|a|small|i)>/gi, "\n")
    .replace(/<(br|hr)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#x?[0-9a-f]+;/gi, " ")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return { text: blocks.join(" "), blocks };
}

const failures = [];
const warnings = [];
const sentenceLengths = [];

for (const path of paths) {
  const { text, blocks } = await prose(path);
  const lower = text.toLowerCase();

  for (const word of BANNED) {
    const at = lower.indexOf(word);
    if (at >= 0) failures.push(`${path}: model register "${word}" — ...${text.slice(Math.max(0, at - 50), at + 50)}...`);
  }
  const dash = text.indexOf("—");
  if (dash >= 0) failures.push(`${path}: em-dash — ...${text.slice(Math.max(0, dash - 50), dash + 50)}...`);

  for (const hedge of HEDGES) {
    const at = lower.indexOf(` ${hedge} `);
    if (at >= 0) warnings.push(`${path}: hedge "${hedge}" — ...${text.slice(Math.max(0, at - 40), at + 40)}...`);
  }

  // Sentences over 32 words are usually two sentences. Measured per block, so a
  // table of short cells is not mistaken for one long sentence.
  for (const block of blocks) {
    for (const sentence of block.split(/(?<=[.?!])\s+/)) {
      const words = sentence.trim().split(/\s+/).filter(Boolean).length;
      if (words < 4) continue;
      sentenceLengths.push(words);
      if (words > 32) warnings.push(`${path}: ${words} words: ${sentence.slice(0, 130)}`);
    }
  }
}

if (process.argv.includes("--stats")) {
  const sorted = [...sentenceLengths].sort((a, b) => a - b);
  const mean = sentenceLengths.reduce((sum, value) => sum + value, 0) / sentenceLengths.length;
  console.log(`Sentences: ${sentenceLengths.length}`);
  console.log(`Mean words: ${mean.toFixed(1)}`);
  console.log(`Median: ${sorted[Math.floor(sorted.length / 2)]}`);
  console.log(`90th percentile: ${sorted[Math.floor(sorted.length * 0.9)]}`);
  console.log(`Longest: ${sorted.at(-1)}`);
  console.log(`Over 32 words: ${sentenceLengths.filter((n) => n > 32).length}`);
}

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const warning of [...new Set(warnings)].slice(0, 25)) console.log(`   ${warning}`);
}
if (failures.length) {
  console.log(`\n${failures.length} failure(s):`);
  for (const failure of [...new Set(failures)]) console.log(`   ${failure}`);
  process.exit(1);
}
console.log(`\nNo model-register words or em-dashes across ${paths.length} pages.`);

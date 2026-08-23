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
 * The rules come from DESIGN.md section 11.1, plus a 2026-08-23 sweep of
 * AI-writing tells (Reddit, X, and Wikipedia's "Signs of AI writing") not
 * already named there. The model-register words, the structural tells, and
 * the em-dash are hard failures; sentence length and hedging stay warnings,
 * because a long sentence is sometimes the right sentence and a script
 * cannot tell. Every hard-failure entry carries the "why", printed in the
 * failure output: this is a source-cited evidence site, so the bar for a
 * banned word is the same bar as a banned claim, does it say something a
 * reader could verify, or does it just sound confident.
 */

import { loadData } from "./lib/records.mjs";

/**
 * Every entry is `[term, why]`. The "why" is not decoration: this is a
 * source-cited evidence site, and the test for each word is the same test
 * that governs every claim on it — does it say something a reader could
 * verify, or does it just sound confident? A word survives here only if it
 * fails that test in every ordinary use, which is also why some plausible
 * candidates are deliberately absent. "realm" and "not only" were tried and
 * removed: both have ordinary uses ("the regulatory realm", "not only the
 * NRC but also DOE") and a hard failure with no escape hatch would block a
 * legitimate sentence. "landscape" was considered and left out for the same
 * reason: too common in ordinary energy-policy prose ("the financing
 * landscape") to ban outright, unlike the much rarer "tapestry" or "beacon".
 * "comprehensive" was added then removed the same way, caught by a 2026-08-23
 * review: a nuclear/regulatory site plausibly cites the Comprehensive
 * Nuclear-Test-Ban Treaty or CERCLA by name, and there was no escape hatch.
 * Matched on word boundaries, so "underscore" does not fire inside a longer
 * word.
 */
const BANNED = [
  // LLM register: words that assert quality, depth, or significance instead
  // of stating the fact that would demonstrate it. A reader can verify a
  // date or a dollar figure; none of these are checkable the same way.
  ["delve", "faux-scholarly opener that adds no fact; models default to it the way this site defaults to a source link"],
  ["leverage", "a vague synonym for 'use' that hides which concrete tool or asset is actually meant"],
  ["seamless", "an unfalsifiable quality claim with no observable referent"],
  ["elevate", "marketing vapor; names a feeling, not a change a reader could check"],
  ["unlock", "implies a hidden capability was freed, when the real action is usually just 'submit', 'file', or 'build'"],
  ["empower", "abstracts away who does what; a source-cited record names the actor and the act"],
  ["harness", "borrowed-power metaphor dressing up a plain verb like 'use' or 'apply'"],
  ["tapestry", "ornamental metaphor; this site names the components, it doesn't weave them"],
  ["testament", "asserts significance instead of citing the fact that would prove it"],
  ["a testament to", "phrase form of testament, same defect"],
  ["underscore", "caption-register verb that states something matters without saying why"],
  ["pivotal", "unearned-significance word; unlike a stage number or a megawatt figure, 'pivotal' can't be checked against a source"],
  ["cutting-edge", "unfalsifiable superlative with no observable referent, and it dates the sentence the day it's written"],
  ["game-changer", "a prediction dressed as a fact; this site tracks evidence, not verdicts about the future"],
  ["ever-evolving", "filler modifier; every field is 'ever-evolving', so the phrase carries zero information"],
  ["robust", "vague strength claim that never names which specific risk was actually addressed"],
  ["plays a crucial role", "asserts importance instead of naming the mechanism that makes it true"],
  ["crucial", "bare form of the above; if something matters, name the consequence instead"],
  // Marketing-verb substitution: a plain "is" or "has" dressed up as an
  // achievement. Added 2026-08-23 from a Reddit/X/Wikipedia sweep of tells
  // not already covered above.
  ["boasts", "a marketing verb standing in for 'has'; a source-cited site states the fact, it doesn't sell it"],
  ["boasting", "gerund form of boasts, same defect"],
  ["showcases", "the same substitution as boasts, for 'shows' or 'demonstrates'"],
  ["showcasing", "gerund form of showcases, same defect"],
  // Vague-scale filler: describes magnitude without a number, on a site
  // whose entire premise is that magnitude is always countable.
  ["myriad", "vague-quantity filler; if the count is knowable, this site can state the number"],
  ["plethora", "same defect as myriad, more ornate"],
  // "comprehensive" was tried and removed for the same reason as the two
  // excluded words named in this file's header comment: a nuclear/regulatory
  // site plausibly cites the Comprehensive Nuclear-Test-Ban Treaty or CERCLA
  // (Comprehensive Environmental Response, Compensation, and Liability Act)
  // by name, and a hard failure with no escape hatch would block a real
  // statute or treaty title.
  ["multifaceted", "asserts complexity without naming any of the facets"],
  ["unwavering", "unfalsifiable commitment claim with no observable referent"],
  ["beacon", "spatial-metaphor cliché from the same ornamental family as tapestry"],
  // Rhetorical-scenario opener: has no place in a record of things that
  // already happened and are already sourced.
  ["imagine", "fiction-register scenario opener; every claim here is dated and sourced, nothing needs imagining"],
  // Filler, throat-clearing, and hollow summary: words that occupy space
  // before or after the actual sentence without changing its meaning.
  ["it's worth noting", "throat-clearing; if it's worth saying, just say it"],
  ["it's important to note", "same defect as above, longer"],
  ["when it comes to", "topic-introduction filler that adds words without adding meaning"],
  ["at the end of the day", "hollow-summary filler that announces a conclusion instead of giving one"],
  ["in conclusion", "essay-register signpost; a section doesn't need to announce its own ending"],
  ["at your fingertips", "marketing-vapor cliché for 'available'"],
  ["next level", "vague improvement claim with no stated comparison point"],
  ["designed to help you", "marketing vapor describing intent rather than what the thing does"],
  ["navigate the complexities", "vague-difficulty cliché that never names the actual complexity"],
  ["in today's", "throat-clearing scene-setter that delays the actual sentence"],
];

const escapeForRegex = (word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const bannedPattern = new RegExp(`\\b(${BANNED.map(([term]) => escapeForRegex(term)).join("|")})\\b`, "i");
const bannedReasons = new Map(BANNED.map(([term, reason]) => [term.toLowerCase(), reason]));

/**
 * Structural tells rather than single banned words: a hedged half-claim, an
 * unnamed source standing in for a citation, an infomercial-register
 * transition, or a stray artifact from a copied model response or an
 * unconverted markdown draft. Each is a hard failure, same tier as the
 * banned words and the em-dash, because none has a legitimate use on a
 * site whose entire product is that every claim traces to a named source.
 */
const STRUCTURAL_TELLS = [
  {
    // Scoped to "it's/it is", not a bare "but": "not just Vogtle, but Summer"
    // and "not just built, but licensed" are ordinary scope-widening English
    // a nuclear-regulatory site writes constantly. "not just X, it's Y" is
    // the actual tell (restating one claim as a bigger one for rhetorical
    // weight); "but" alone caught both and had no escape hatch, same failure
    // this file's own header warns against ("realm", "not only").
    label: "negative-parallelism filler (\"not just X, it's Y\")",
    reason: "restates one claim as a bigger one for rhetorical weight instead of citing a second fact; the standard tell across every AI-writing checklist",
    pattern: /\bnot just [a-z][^.!?]{0,60}?,?\s+it'?s\b/i,
  },
  {
    // "observers"/"analysts" bare have real uses on a regulatory site ("IAEA
    // observers", "NRC observers note the docket is incomplete") and no
    // escape hatch; scoped to the actual weasel phrase, an unnamed plural
    // standing in for a citation.
    label: "weasel attribution (unnamed plural source)",
    reason: "invents plural sourcing for what is usually one claim; this site names the specific document or it doesn't ship the claim",
    pattern: /\b(industry reports|industry observers) (suggest|say|argue|note|believe)\b/i,
  },
  {
    label: "leftover model artifact",
    reason: "a literal token from a copied model response (a citation marker, an unresolved reference) that was never meant to reach a reader",
    pattern: /oaicite|contentReference|\[cite[:\]]/i,
  },
  {
    label: "infomercial rhetorical-question transition",
    reason: "a canned transition borrowed from ad copy ('The catch?', 'Sound familiar?'), not a question this site's factual register ever needs to ask",
    pattern: /\bthe (catch|kicker)\?|sound familiar\?/i,
  },
  {
    label: "unconverted markdown emphasis",
    reason: "a literal **double-asterisk** pair means a draft was pasted in without converting its markdown to real emphasis; this codebase renders JSX, not markdown, so this can only ever be a leftover",
    pattern: /\*\*[^*\n]+\*\*/,
  },
  {
    label: "emoji in body copy",
    reason: "DESIGN.md bans emoji in body copy outright (outline pills do the badge work instead); this closes the gap between that rule and something that actually enforces it",
    pattern: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u,
  },
];

/** Padding that adds length without adding meaning. */
const HEDGES = ["generally", "typically", "in most cases", "arguably", "somewhat", "fairly", "quite"];

const data = await loadData();
// The financing page was missing from this sweep from its first release; it
// and the BD page are listed now so every layer's prose gets linted.
const paths = ["/", "/updates", "/methodology", "/companies", "/deployments", "/capital", "/federal-action", "/map", "/financing", "/bd",
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

  const banned = bannedPattern.exec(text);
  if (banned) {
    const at = banned.index;
    const reason = bannedReasons.get(banned[1].toLowerCase()) ?? "";
    failures.push(`${path}: model register "${banned[1]}" (${reason}) - ...${text.slice(Math.max(0, at - 50), at + 50)}...`);
  }
  const dash = text.indexOf("—");
  if (dash >= 0) failures.push(`${path}: em-dash (the em-dash reads as a model tic at scale; use a comma, colon, period, or parentheses) - ...${text.slice(Math.max(0, dash - 50), dash + 50)}...`);

  for (const tell of STRUCTURAL_TELLS) {
    const hit = text.match(tell.pattern);
    if (hit) {
      const at = hit.index;
      failures.push(`${path}: ${tell.label} (${tell.reason}) - ...${text.slice(Math.max(0, at - 50), at + hit[0].length + 50)}...`);
    }
  }

  for (const hedge of HEDGES) {
    const at = lower.indexOf(` ${hedge} `);
    if (at >= 0) warnings.push(`${path}: hedge "${hedge}" - ...${text.slice(Math.max(0, at - 40), at + 40)}...`);
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

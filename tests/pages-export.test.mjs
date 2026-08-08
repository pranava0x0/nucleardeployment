import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const homepage = await readFile(new URL("../out/index.html", import.meta.url), "utf8");

test("GitHub Pages export keeps assets and routes under the repository path", async () => {
  assert.match(homepage, /(?:src|href)="\/nucleardeployment\/_next\//);
  assert.match(homepage, /href="\/nucleardeployment\/companies\/terrapower\/?"/);
  await readFile(new URL("../out/companies/terrapower/index.html", import.meta.url), "utf8");
});

test("GitHub Pages social image URL is absolute and not double-prefixed", () => {
  assert.match(homepage, /content="https:\/\/pranava0x0\.github\.io\/nucleardeployment\/og\.png"/);
  assert.doesNotMatch(homepage, /nucleardeployment\/nucleardeployment/);
});

test("GitHub Pages export ships the canonical, the updates route, and the machine files", async () => {
  // A canonical that 301s is wasted, so it carries the trailing slash the
  // Pages server actually responds with.
  assert.match(homepage, /<link rel="canonical" href="https:\/\/pranava0x0\.github\.io\/nucleardeployment\/"/);
  const updates = await readFile(new URL("../out/updates/index.html", import.meta.url), "utf8");
  assert.match(updates, /<link rel="canonical" href="https:\/\/pranava0x0\.github\.io\/nucleardeployment\/updates\/"/);
  assert.match(updates, /Evidence ledger/);

  for (const name of ["sitemap.xml", "robots.txt", "feed.xml", "llms.txt"]) {
    await readFile(new URL(`../out/${name}`, import.meta.url), "utf8");
  }
  const sitemap = await readFile(new URL("../out/sitemap.xml", import.meta.url), "utf8");
  assert.match(sitemap, /<loc>https:\/\/pranava0x0\.github\.io\/nucleardeployment\/updates\/<\/loc>/);
});

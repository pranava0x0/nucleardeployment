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

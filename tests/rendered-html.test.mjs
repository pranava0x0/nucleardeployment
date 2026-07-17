import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the evidence-led homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Deployment Core/);
  assert.match(html, /America is rebuilding the machinery/);
  assert.match(html, /From interest to repeat deployment/);
  assert.match(html, /Exploring the idea/);
  assert.match(html, /Work or fuel at the site/);
  assert.match(html, /2 projects/);
  assert.match(html, /TerraPower/);
  assert.match(html, /Kairos Power/);
  assert.doesNotMatch(html, /Announcement is not deployment/);
  assert.match(html, /sourced U\.S\. projects currently tracked/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("server-renders company directory and company detail pages", async () => {
  const directory = await render("/companies");
  assert.equal(directory.status, 200);
  const directoryHtml = await directory.text();
  assert.match(directoryHtml, /Companies/);
  assert.match(directoryHtml, /TerraPower/);
  assert.match(directoryHtml, /Valar Atomics/);

  const detail = await render("/companies/terrapower");
  assert.equal(detail.status, 200);
  const detailHtml = await detail.text();
  assert.match(detailHtml, /Natrium/);
  assert.match(detailHtml, /Sodium-cooled fast reactor/);
  assert.match(detailHtml, /Submit and secure the separate NRC operating license/);
});

test("server-renders core directory and methodology routes", async () => {
  for (const [path, text] of [["/deployments", "Deployments"], ["/federal-action", "Four orders"], ["/capital", "Money is not one metric"], ["/methodology", "Evidence before labels"]]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), new RegExp(text, "i"));
  }
});

test("server-renders a project record with its next gate and source", async () => {
  const response = await render("/deployments/natrium-kemmerer");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Natrium/);
  assert.match(html, /Next required milestone/);
  assert.match(html, /NRC application record/);
  assert.match(html, /separate NRC operating license/);
});

test("all source links use https and every project states a next action", async () => {
  const dataModule = await import("../app/data.ts");
  for (const project of dataModule.projects) {
    assert.match(project.source, /^https:\/\//);
    assert.ok(project.next.length > 20, project.name);
    assert.ok(project.sourceLabel.length > 4, project.name);
  }
  for (const collection of [dataModule.federalActions, dataModule.programs, dataModule.capital]) {
    for (const record of collection) assert.match(record.source, /^https:\/\//);
  }
});

test("CSS keeps palette values in the root token block", async () => {
  const { readFile } = await import("node:fs/promises");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const withoutRoot = css.replace(/:root\s*\{[\s\S]*?\}/, "");
  assert.doesNotMatch(withoutRoot, /#[0-9a-f]{3,8}\b/i);
});

test("text and semantic token pairs meet WCAG AA contrast", async () => {
  const { readFile } = await import("node:fs/promises");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const root = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? "";
  const tokens = Object.fromEntries([...root.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((match) => [match[1], match[2]]));
  const pairs = [
    ["ink", "bg"],
    ["ink", "surface"],
    ["ink-muted", "bg"],
    ["on-accent", "accent"],
    ["on-signal", "signal"],
    ["white", "graphite"],
    ["accent", "graphite"],
  ];
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/../g).map((value) => Number.parseInt(value, 16) / 255);
    const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };

  for (const [foreground, background] of pairs) {
    assert.ok(tokens[foreground] && tokens[background], `${foreground}/${background} tokens exist`);
    const values = [luminance(tokens[foreground]), luminance(tokens[background])].sort((a, b) => b - a);
    const ratio = (values[0] + 0.05) / (values[1] + 0.05);
    assert.ok(ratio >= 4.5, `${foreground} on ${background} contrast is ${ratio.toFixed(2)}:1`);
  }
});

test("Vite dev cache never points at removed packages", async () => {
  const { access, readFile } = await import("node:fs/promises");
  const metadataUrl = new URL("../node_modules/.vite/deps/_metadata.json", import.meta.url);
  let metadata;

  try {
    metadata = JSON.parse(await readFile(metadataUrl, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }

  for (const [dependency, record] of Object.entries(metadata.optimized ?? {})) {
    await assert.doesNotReject(
      access(new URL(record.src, metadataUrl)),
      `stale Vite cache entry for ${dependency}: ${record.src}`,
    );
  }
});

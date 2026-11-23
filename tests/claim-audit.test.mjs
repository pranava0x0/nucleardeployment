import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadData } from '../scripts/lib/records.mjs';
import { validateClaimAudit } from '../scripts/lib/claim-audits.mjs';
import { fleetObservation } from '../app/fission-data.ts';
const data = await loadData();
const audit = JSON.parse(await readFile(new URL('../data/research/claims-audit-2026-11-22.json', import.meta.url)));
const worklist = JSON.parse(await readFile(new URL('../data/research/claims-audit-2026-11-22-worklist.json', import.meta.url)));

test('all 139 original flags have a current disposition and exact archived evidence', async () => {
  assert.equal(worklist.records.length, 139);
  const result = await validateClaimAudit(data, audit, worklist);
  assert.deepEqual(result.errors, []);
  assert.equal(Object.values(result.counts).reduce((a,b) => a+b,0), 139);
  assert.equal(result.reviewed.size, 136);
});

test('review approvals expire when claims, sources, snapshots or quotes change', async () => {
  const before = JSON.parse(JSON.stringify(data));
  const first = audit.records.find((row) => row.final);
  const obj = first.final.canonical_path.reduce((value,key) => value[key], before);
  obj.rosterBasis += ' Changed claim';
  assert.ok((await validateClaimAudit(before, audit, worklist)).errors.some((e) => /canonical record changed/.test(e)));
  const sourceChange = structuredClone(audit); sourceChange.records.find((r) => r.final).final.source = 'https://example.com/other';
  assert.ok((await validateClaimAudit(data, sourceChange, worklist)).errors.some((e) => /final sourced record missing|no evidence/.test(e)));
  const quoteChange = structuredClone(audit); quoteChange.records.find((r) => r.final).evidence[0].quotes = ['Fabricated evidence'];
  assert.ok((await validateClaimAudit(data, quoteChange, worklist)).errors.some((e) => /quote absent/.test(e)));
  assert.ok((await validateClaimAudit(data, audit, worklist, async () => 'Rewritten source')).errors.some((e) => /snapshot changed/.test(e)));
  assert.ok((await validateClaimAudit(data, {...audit, records: audit.records.slice(1)}, worklist)).errors.some((e) => /no disposition/.test(e)));
});

test('national fleet and advanced-reactor denominators cannot collapse into one headline', () => {
  assert.deepEqual(data.fleetYears, ['2021','2022','2023','2024','2025']);
  assert.equal(data.nationalBaseline.units.value, 94);
  assert.equal(data.nationalBaseline.capacity.value, 96880);
  assert.equal(data.nationalBaseline.generation.value, 784.781);
  assert.equal(data.nationalBaseline.share.value, 17.7);
  assert.equal(data.nationalBaseline.capacityFactor.value, 91);
  assert.throws(() => fleetObservation('nuclear_net_generation','2030'), /Expected one/);
  assert.equal(data.headlineTotals().operationalMWe, 0);
  assert.equal(data.headlineTotals().buildingMWe, 420);
  assert.equal(data.headlineTotals().announcedMWe, 37060);
});

test('thermal experiments, AI demand and unquantified agreements receive no generation credit', () => {
  const valar = data.raceBoard().find((r) => r.company.slug === 'valar-atomics');
  assert.equal(valar.entrant.unitMWe, null);
  assert.equal(valar.unitsToGigawatt, null);
  assert.ok(!data.capacityClaims.some((r) => r.companySlug === 'kairos-power' && r.band === 'construction'));
  assert.ok(data.capacityClaims.filter((r) => r.companySlug === 'valar-atomics').every((r) => r.mwe === 0));
  assert.ok(data.capacityClaims.filter((r) => r.companySlug === 'gev-hitachi' && r.band === 'framework').every((r) => r.mwe === 0));
  assert.equal(data.fissionFamilies.length, 13);
  assert.equal(data.fissionCrosswalk.historical_labels.length, 3);
  assert.equal(data.fissionCrosswalk.research_configurations.length, 6);
});


test('fleet figures, periods, series and units must match the actual EIA source rows', async () => {
  const { validateFleetStatistics } = await import('../scripts/lib/fleet-evidence.mjs');
  const csv = await readFile(new URL('../data/research/fleet-2026-11-22/eia-mer-table-8-1.csv', import.meta.url), 'utf8');
  const annual = data.fleetStatistics.filter((row) => row.series_id);
  assert.deepEqual(validateFleetStatistics(annual, csv), []);
  for (const change of [
    (row) => { row.value = 999; row.source_value = '999'; },
    (row) => { row.observation_date = '2030-12-31'; row.source_period = '203013'; },
    (row) => { row.series_id = 'NUGBPUS'; },
    (row) => { row.unit = 'MWe'; },
    (row) => { row.geography = 'Global'; },
    (row) => { row.evidence_quote = annual[1].evidence_quote; },
  ]) {
    const changed = structuredClone(annual); change(changed[0]);
    assert.ok(validateFleetStatistics(changed, csv).length > 0, 'a genuine but unrelated quote cannot approve a changed observation');
  }
});

import { readFile } from 'node:fs/promises';
import { loadData } from './lib/records.mjs';
import { validateFleetStatistics } from './lib/fleet-evidence.mjs';
import { loadClaimAudit } from './lib/claim-audits.mjs';
const data = await loadData();
const audit = await loadClaimAudit(data);
const errors = [...audit.errors];
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const texts = new Map();
for (const source of data.fissionSources) texts.set(source.url, await readFile(source.snapshot_path, 'utf8'));
for (const row of [...data.fleetStatistics, ...data.fleetMilestones, ...data.fissionFamilies.flatMap((family) => family.examples)]) {
  if (!texts.has(row.source_url) || !norm(texts.get(row.source_url)).includes(norm(row.evidence_quote))) errors.push(`Primary-source quote missing: ${row.metric ?? row.name ?? row.id}`);
}
for (const row of data.fissionCrosswalk.evidence) if (!norm(await readFile(row.snapshot_path, 'utf8')).includes(norm(row.quote))) errors.push(`Crosswalk quote missing: ${row.quote}`);
errors.push(...validateFleetStatistics(data.fleetStatistics.filter((row) => row.series_id), texts.get('https://www.eia.gov/totalenergy/data/browser/csv.php?tbl=T08.01')));
console.log(`139-claim audit: ${JSON.stringify(audit.counts)}. ${data.fleetStatistics.length} fleet observations; ${data.fissionFamilies.length} fission families.`);
if (errors.length) console.error(errors.join('\n'));
process.exitCode = errors.length ? 1 : 0;

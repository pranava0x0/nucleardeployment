import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { urlHash } from './source-cache.mjs';
import { sourcedRecords } from './records.mjs';

export const digest = (value) => createHash('sha256').update(value).digest('hex');
export const claimIdentity = ({ kind, companySlug, source, label }) => JSON.stringify([kind, companySlug, source, label]);
const root = new URL('../../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));

/** A review is valid only for the exact canonical object and unchanged evidence. */
export async function validateClaimAudit(data, audit, worklist, readSnapshot = (path) => readFile(new URL(path, root), 'utf8')) {
  const errors = [], reviewed = new Map(), rows = sourcedRecords(data);
  const origins = new Map();
  for (const name of ['fleet-2026-11-22', 'families-2026-11-22', 'claim-primary-replacements-2026-11-22']) {
    for (const source of (await readJson(`data/research/${name}.json`)).sources) {
      const urls = origins.get(source.snapshot_path) ?? new Set(); urls.add(source.url); origins.set(source.snapshot_path, urls);
    }
  }
  const original = new Map(worklist.records.map((row) => [row.audit_id, row]));
  const seen = new Set();
  if (audit.records.length !== original.size) errors.push(`Expected ${original.size} dispositions, got ${audit.records.length}`);
  for (const row of audit.records) {
    const prefix = `${row.audit_id}: `;
    const before = original.get(row.audit_id);
    if (!before || seen.has(row.audit_id)) { errors.push(prefix + 'unknown or duplicate audit ID'); continue; }
    seen.add(row.audit_id);
    if (row.audit_id !== `claim-${digest([before.kind, before.companySlug, before.source, before.label].join('|')).slice(0, 16)}`) errors.push(prefix + 'invalid original identity');
    if (claimIdentity(row.original) !== claimIdentity(before)) errors.push(prefix + 'original record changed');
    if (!row.reason?.trim() || !row.reviewed_at) errors.push(prefix + 'missing reason or review date');
    const start = errors.length;
    if (row.outcome === 'removed') {
      if (rows.some((item) => claimIdentity(item) === claimIdentity(before))) errors.push(prefix + 'removed claim is published again');
      if (row.final || row.evidence?.length) errors.push(prefix + 'removal cannot approve a surviving claim');
      continue;
    }
    if (!['supported', 'corrected'].includes(row.outcome) || !row.final || !row.evidence?.length) { errors.push(prefix + 'missing final record or evidence'); continue; }
    const final = row.final;
    const object = final.canonical_path.reduce((value, key) => value?.[key], data);
    if (!object || digest(JSON.stringify(object)) !== final.record_sha256) errors.push(prefix + 'canonical record changed; re-review required');
    if (rows.filter((item) => claimIdentity(item) === claimIdentity(final)).length !== 1) errors.push(prefix + 'final sourced record missing or ambiguous');
    if (!row.evidence.some((item) => item.source_url === final.source)) errors.push(prefix + 'no evidence from the cited final source');
    for (const item of row.evidence) {
      if (!/^data\/(sources|research)\/[\w./-]+$/.test(item.snapshot_path) || item.snapshot_path.includes('..')) { errors.push(prefix + 'invalid evidence path'); continue; }
      try {
        let sameSource = false;
        if (item.snapshot_path.startsWith('data/sources/pages/')) sameSource = item.snapshot_path === `data/sources/pages/${urlHash(item.source_url)}.txt`;
        else if (item.snapshot_path.startsWith('data/sources/reports/')) { const meta = await readJson(item.snapshot_path.replace(/\.txt$/, '.meta.json')); sameSource = (meta.url ?? meta.source_url) === item.source_url; }
        else sameSource = origins.get(item.snapshot_path)?.has(item.source_url);
        if (!sameSource) errors.push(prefix + 'snapshot belongs to a different source URL');
        const text = await readSnapshot(item.snapshot_path);
        if (digest(text) !== item.snapshot_sha256) errors.push(prefix + 'evidence snapshot changed');
        if (!item.quotes?.length || item.quotes.some((quote) => !quote.trim() || !text.includes(quote))) errors.push(prefix + 'quote absent from cited snapshot');
      } catch { errors.push(prefix + `missing snapshot ${item.snapshot_path}`); }
    }
    if (errors.length === start) reviewed.set(claimIdentity(final), { audit_id: row.audit_id, outcome: row.outcome, reason: row.reason });
  }
  for (const id of original.keys()) if (!seen.has(id)) errors.push(`${id}: no disposition`);
  return { errors, reviewed, counts: Object.fromEntries(['supported', 'corrected', 'removed'].map((key) => [key, audit.records.filter((row) => row.outcome === key).length])) };
}

export async function loadClaimAudit(data) {
  const [audit, worklist] = await Promise.all(['data/research/claims-audit-2026-11-22.json', 'data/research/claims-audit-2026-11-22-worklist.json'].map(readJson));
  return validateClaimAudit(data, audit, worklist);
}

/**
 * One place that knows how to walk every sourced record in the dataset.
 *
 * Every script here reads through this module rather than reaching into
 * `app/data.ts` itself, so adding a record type means editing one list instead
 * of hunting through four scripts for the ones that missed it.
 */

const DATA_URL = new URL("../../app/data.ts", import.meta.url);

export async function loadData() {
  return import(DATA_URL.href);
}

/**
 * Every field that holds a source URL, with enough context to say which record
 * it came from. `verification` is null where the record type has no reporting
 * basis of its own, such as a roster source or a stated target.
 */
export function sourcedRecords(data) {
  const rows = [];
  const push = (kind, companySlug, label, source, verification = null) =>
    rows.push({ kind, companySlug, label, source, verification });

  for (const entrant of data.raceEntrants) {
    push("entrant.rosterSource", entrant.companySlug, entrant.rosterBasis, entrant.rosterSource);
  }
  for (const claim of data.capacityClaims) {
    push(`claim.${claim.band}`, claim.companySlug, claim.label, claim.source, claim.verification);
  }
  for (const event of data.fundingEvents) {
    push(`funding.${event.kind}`, event.companySlug, event.amount, event.source);
  }
  for (const position of data.cashPositions) {
    push("cash", position.companySlug, position.amount, position.source);
  }
  for (const event of data.proofEvents) {
    push(`proof.${event.kind}`, event.companySlug, event.label, event.source, event.verification);
  }
  for (const target of data.statedTargets) {
    push("target", target.companySlug, target.target, target.source);
    if (target.conflictSource) push("target.conflict", target.companySlug, target.conflict, target.conflictSource);
  }
  // The project records predate the race layer but are part of the same
  // published evidence, so they are validated on the same terms.
  for (const project of data.projects) {
    push("project", project.companySlug, project.name, project.source, project.verification);
  }
  for (const company of data.companies) {
    push("company", company.slug, company.name, company.source);
  }
  return rows;
}

export function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * One place that knows how to walk every sourced record in the dataset.
 *
 * Every script here reads through this module rather than reaching into
 * `app/data.ts` itself, so adding a record type means editing one list instead
 * of hunting through four scripts for the ones that missed it.
 */

const DATA_URL = new URL("../../app/data.ts", import.meta.url);
const FINANCING_URL = new URL("../../app/financing-data.ts", import.meta.url);

export async function loadData() {
  // One merged view: the race dataset and the financing layer validate on the
  // same terms. Export names are disjoint between the two modules.
  const [data, financing] = await Promise.all([import(DATA_URL.href), import(FINANCING_URL.href)]);
  return { ...data, ...financing };
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
  // The older context tables cite sources too. They were never walked, which
  // is how a rotted capital-table URL stayed invisible until a funding record
  // began citing the same page.
  for (const item of data.capital) {
    push("capital", "context", `${item.amount} ${item.name}`, item.source);
  }
  for (const action of data.federalActions) {
    push("federal-action", "context", `${action.eo} ${action.title}`, action.source);
  }
  for (const program of data.programs) {
    push("program", "context", program.name, program.source);
  }
  // The financing layer. Landscape records carry the pseudo-slug "financing"
  // so per-company tooling stays meaningful; company rows carry real slugs.
  for (const benchmark of data.costBenchmarks) {
    push("finance.benchmark", "financing", `${benchmark.figure} (${benchmark.lane} ${benchmark.series})`, benchmark.source);
  }
  for (const rung of data.learningRungs) {
    push("finance.learning", "financing", `${rung.units}: ${rung.effect}`, rung.source);
  }
  for (const record of data.overrunRecords) {
    push("finance.overrun", "financing", `${record.subject}: ${record.figure}`, record.source);
  }
  for (const mechanism of data.mechanisms) {
    push(`finance.mechanism.${mechanism.status === "In use" ? "in-use" : "proposed"}`, "financing", mechanism.mechanism, mechanism.source);
  }
  for (const pool of data.liabilityPools) {
    push("finance.insurance", "financing", `${pool.name}: ${pool.capacity}`, pool.source);
  }
  for (const underwriter of data.underwriters) {
    push("finance.underwriter", "financing", `${underwriter.name}: ${underwriter.commitment}`, underwriter.source);
  }
  for (const fact of data.sitingFacts) {
    push("finance.siting", "financing", fact.fact, fact.source);
  }
  for (const report of data.capturedReports) {
    push("finance.report", "financing", report.title, report.url);
  }
  for (const row of data.companyFinance) {
    push("finance.model", row.companySlug, row.model, row.modelSource);
    for (const line of row.government) push("finance.government", row.companySlug, line.text, line.source);
    for (const line of row.commercial) push("finance.commercial", row.companySlug, line.text, line.source);
    if (row.costClaimSource) push("finance.cost-claim", row.companySlug, row.costClaim, row.costClaimSource);
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

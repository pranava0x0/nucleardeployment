import fleet from "../data/research/fleet-2026-11-22.json" with { type: "json" };
import taxonomy from "../data/research/families-2026-11-22.json" with { type: "json" };

export const fissionReviewedAt = "2026-11-22";
export const fleetStatistics = fleet.statistics;
export const fleetMilestones = fleet.milestones;
export const fissionFamilies = taxonomy.families;
export const fissionCrosswalk = taxonomy.historical_role_crosswalk;
export const fissionSources = [...fleet.sources, ...taxonomy.sources];
export const fissionCoverageGaps = [...fleet.gaps, ...taxonomy.gaps, ...fissionCrosswalk.gaps];

export const fleetYears = [...new Set(fleetStatistics
  .filter((row) => row.metric === "nuclear_net_generation")
  .map((row) => row.observation_date.slice(0, 4)))].sort();

/** Annual observations and year-end stocks share a year, never a denominator. */
export function fleetObservation(metric: string, year = fleetYears.at(-1)!) {
  const rows = fleetStatistics.filter((row) => row.metric === metric && row.observation_date.startsWith(year));
  if (rows.length !== 1) throw new Error(`Expected one ${metric} observation for ${year}; found ${rows.length}`);
  return rows[0];
}

export const nationalBaseline = {
  year: fleetYears.at(-1)!,
  units: fleetObservation("operable_reactor_units"),
  capacity: fleetObservation("operable_net_summer_capacity"),
  generation: fleetObservation("nuclear_net_generation"),
  share: fleetObservation("nuclear_generation_share"),
  capacityFactor: fleetObservation("nuclear_capacity_factor"),
};

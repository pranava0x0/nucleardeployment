const definitions = {
  operable_reactor_units: ['NUOUPUS', 'Number', 'reactors', 1, 'Year-end stock'],
  operable_net_summer_capacity: ['NUGBPUS', 'Million Kilowatts', 'MWe', 1000, 'Year-end stock'],
  nuclear_net_generation: ['NUETPUS', 'Million Kilowatthours', 'TWh', 0.001, 'Calendar-year observation'],
  nuclear_generation_share: ['NUETSUS', 'Percent', 'percent', 1, 'Calendar-year observation'],
  nuclear_capacity_factor: ['NUCASUS', 'Percent', 'percent', 1, 'Calendar-year observation'],
};

/** EIA Table 8.1 quotes each field, including comma-bearing descriptions. */
function csvFields(line) {
  const fields = []; let field = '', quoted = false;
  for (let at = 0; at < line.length; at++) {
    const char = line[at];
    if (char === '"') {
      if (quoted && line[at + 1] === '"') { field += '"'; at++; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) { fields.push(field); field = ''; }
    else field += char;
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  fields.push(field); return fields;
}

/** Bind metric, observation year, unit, frame and conversion to one actual source row. */
export function validateFleetStatistics(statistics, csv) {
  const lines = csv.replace(/\r/g, '').trim().split('\n');
  const header = csvFields(lines.shift());
  if (header.join('|') !== 'MSN|YYYYMM|Value|Column_Order|Description|Unit') return ['Unexpected EIA CSV schema'];
  const sourceRows = new Map();
  for (const line of lines) {
    const fields = csvFields(line);
    const key = `${fields[0]}|${fields[1]}`;
    if (sourceRows.has(key)) return [`Duplicate EIA source row: ${key}`];
    sourceRows.set(key, { fields, line });
  }
  const errors = [], seen = new Set();
  for (const row of statistics) {
    const definition = definitions[row.metric];
    if (!definition) { errors.push(`Unknown annual fleet metric: ${row.metric}`); continue; }
    const [series, sourceUnit, unit, multiplier, frame] = definition;
    const year = row.observation_date?.slice(0, 4), key = `${series}|${year}13`, source = sourceRows.get(key);
    const label = `${row.metric} ${row.observation_date}`;
    if (seen.has(key)) errors.push(`Duplicate fleet observation: ${label}`);
    seen.add(key);
    if (!source || row.geography !== 'United States (50 states and District of Columbia)' || row.observation_date !== `${year}-12-31` || row.series_id !== series || row.source_period !== `${year}13` || row.source_unit !== sourceUnit || row.unit !== unit || row.frame !== frame || row.source_url !== 'https://www.eia.gov/totalenergy/data/browser/csv.php?tbl=T08.01') {
      errors.push(`Fleet source identity mismatch: ${label}`); continue;
    }
    if (source.fields[5] !== sourceUnit || row.source_value !== source.fields[2] || row.evidence_quote !== source.line || !Number.isFinite(Number(source.fields[2])) || !Number.isFinite(row.value) || Math.abs(row.value - Number(source.fields[2]) * multiplier) > 1e-9) errors.push(`Fleet source value mismatch: ${label}`);
  }
  for (const year of ['2021', '2022', '2023', '2024', '2025']) for (const [series] of Object.values(definitions)) if (!seen.has(`${series}|${year}13`)) errors.push(`Missing annual fleet observation: ${series} ${year}`);
  return errors;
}

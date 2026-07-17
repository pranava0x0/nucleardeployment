# Backlog

## Shipped beyond the first release

- [x] Show company names inside the commitment pipeline.
- [x] Add a sourced company directory and company detail pages linked to project records.
- [x] Add repository-path-safe static export and GitHub Pages deployment on every push to `main`.
- [x] Replace tiny all-caps section eyebrows and oversized gaps with a tighter reactor construction-log hierarchy.

## Data foundation

- [ ] Move the canonical dataset from `app/data.ts` into validated normalized records with entities for projects, designs, programs, milestones, commitments, licenses, funding, facilities, and sources.
- [ ] Add `captured_at`, `last_verified_at`, supersession, conflicting-date, and independent-verification fields.
- [ ] Build an idempotent source-to-public-data generator and run it twice in tests.
- [ ] Add historical snapshots so stage changes can be audited over time.

## Research expansion

- [x] Verify and add all 11 initial Reactor Pilot Program projects; distinguish project count from company count.
- [ ] Build the complete U.S. project census with NRC, DOE, utility, DoD, and national-lab sources.
- [ ] Build the global comparison from regulator/IAEA/country primary sources before publishing global counts.
- [ ] Add the full DOE program inventory, EO deliverable deadlines, congressional authorities, awards, and appropriation status.
- [ ] Add fuel-cycle and manufacturing facilities with project dependency links.
- [ ] Add company financing records, binding status, close dates, conditions, and valuation provenance.

## Product

- [ ] Replace the schematic map with a lightweight geographic layer only after complete coordinates and accessible list parity exist.
- [ ] Add shareable URL filters and project comparison.
- [ ] Add CSV downloads and a public API after the normalized schema stabilizes.
- [ ] Add change log, source-monitoring queue, and editorial review screen.
- [ ] Add a 90-day / 18-month change view backed by historical snapshots.

## Quality

- [x] Add automated contrast checks for the text and semantic token pairs used in the UI.
- [ ] Add browser UAT at 375×812, 768×1024, and 1280×800 when browser testing is requested or available.
- [ ] Add link-liveness checks that classify dead versus blocked sources without treating HTTP 200 as fact verification.

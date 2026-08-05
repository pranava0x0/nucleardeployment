# Backlog

## Shipped beyond the first release

- [x] Show company names inside the deployment pipeline.
- [x] Add a sourced company directory and company detail pages linked to project records.
- [x] Add repository-path-safe static export and GitHub Pages deployment on every push to `main`.
- [x] Replace tiny all-caps section eyebrows and oversized gaps with a tighter reactor construction-log hierarchy.
- [x] Split reactor generation, scale, family, and operating role into separate project fields and filters.
- [x] Add a machine-readable source registry plus append-only web-search and agent-run history.
- [x] Replace the misleading schematic map with a regional location ledger until verified coordinates exist.

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

- [ ] Add a true geographic layer only after complete coordinates and accessible list parity exist.
- [ ] Add shareable URL filters and project comparison.
- [ ] Add CSV downloads and a public API after the normalized schema stabilizes.
- [ ] Add change log, source-monitoring queue, and editorial review screen.
- [ ] Add a 90-day / 18-month change view backed by historical snapshots.

## Quality

- [x] Upgrade Next.js off the range covered by the 2026-07-20 advisory (nine CVEs, four high, including the CVE-2026-64642 middleware bypass). Moved 16.2.6 to 16.2.12.
- [ ] **Medium.** Triage the 11 high `npm audit` findings in the build chain (`postcss`, `sharp`, `undici`, `miniflare`, `wrangler`, `js-yaml`, `brace-expansion`, `fast-uri`, `react-server-dom-webpack`). All are pre-existing and none reach the static export, but the count grew from 0 on 2026-07-17 without any dependency change. The `--force` path wants `@cloudflare/vite-plugin@1.50.0`, outside the stated range. See `security.md`.
- [ ] Pin the five `deploy-pages.yml` actions to full commit SHAs. They still use moving `@v4` / `@v5` tags in a workflow holding `pages: write` and `id-token: write`.
- [ ] Upgrade the `deploy-pages.yml` actions off the deprecated Node 20 runtime. Every run currently emits a forced-to-Node-24 warning.
- [x] Run the build and test gate on every pull request, not only on push to `main`, so a broken change cannot silently freeze the deployed site.
- [x] Add automated contrast checks for the text and semantic token pairs used in the UI.
- [ ] Add browser UAT at 375×812, 768×1024, and 1280×800 when browser testing is requested or available.
- [ ] Add link-liveness checks that classify dead versus blocked sources without treating HTTP 200 as fact verification.

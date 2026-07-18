# Deployment Core

Deployment Core is an evidence-led tracker for U.S. nuclear deployment. It separates announcements from binding commitments, licensing, physical construction, criticality, operation, and replication.

The current release is a research-backed tracked set: 28 sourced projects and 24 company records, including all 11 initial Reactor Pilot Program projects. It is not yet a comprehensive national census.

## What is included

- National overview and eight-stage commitment ladder
- Linked company names inside every active pipeline stage
- Company directory and sourced company detail pages
- DOE program labels that separate the Reactor Pilot Program, Nuclear Energy Launch Pad, ARDP, DOME, and Project Pele
- Four tracked 2026 criticality records: three government-reported and one company-reported
- Filterable deployment directory
- Project pages with latest evidence, next gate, owner, blocker, and confidence
- Schematic U.S. project map plus a non-map list
- Four-order federal-action crosswalk
- DOE program inventory
- Capital ledger that keeps closed, conditional, and appropriated support separate
- Supply-chain dependency view
- Public methodology, definitions, and limitations

## Run locally

```bash
npm ci
npm run dev
```

Use the local URL printed by the development server.

## Verify

```bash
npm test
npm run lint
npm run test:pages
```

## Publish

Every push to `main` builds, verifies, and deploys the static export with GitHub Actions. The project-path checks prevent broken assets and links on GitHub Pages.

Live site: <https://pranava0x0.github.io/nucleardeployment/>

## Data and source rules

The current dataset lives in `app/data.ts`. Every public record must have a direct HTTPS source and a specific next action. Primary regulator and agency sources outrank company reporting. No record may imply that criticality equals electricity generation or commercial operation.

See `docs/research-foundation.md` for scope, taxonomy, research gaps, user journeys, and the expansion plan. See `backlog.md` for next work.

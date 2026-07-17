# Deployment Core

Deployment Core is an evidence-led tracker for U.S. nuclear deployment. It separates announcements from binding commitments, licensing, physical construction, criticality, operation, and replication.

The current release is a research-backed tracked set. Its counts describe six sourced projects, not a comprehensive national census.

## What is included

- National overview and eight-stage commitment ladder
- Linked company names inside every active pipeline stage
- Company directory and sourced company detail pages
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

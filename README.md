# Deployment Core

Deployment Core is an evidence-led tracker for U.S. nuclear deployment. It separates announcements from binding commitments, licensing, physical construction, criticality, operation, and replication.

The site leads with the race to a gigawatt: 18 companies building new-design reactors for U.S. deployment, ranked by the strongest state their megawatts have actually reached. As of 2026-08-05 that ranking starts from an honest zero. No entrant has generated a commercial megawatt, 440 MWe are physically being built, and 40,395 MWe have been announced without binding documents behind them.

The current release is a research-backed tracked set: 28 sourced projects and 26 company records, including all 11 initial Reactor Pilot Program projects. It is not yet a complete national census.

## What is included

- The race board: per-company capacity in six evidence bands, with a fixed one-gigawatt line on every bar
- Company race dossiers: funding in separate frames, licensing, physical progress, pipeline, and company-stated targets beside the regulator-documented state
- National overview and eight-stage deployment pipeline
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
- Public methodology, definitions, and limitations, including the roster rule, the band definitions, and why a DOE authorization is not an NRC license

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

Race capacity carries its own rules, enforced by tests: a megawatt sits in exactly one band, the strongest state its evidence supports; test reactors and critical experiments contribute zero megawatts; a company-stated target never moves a megawatt between bands; and binding and non-binding capacity are never summed. Per-company research packs are in `docs/research/`.

See `docs/research-foundation.md` for scope, taxonomy, research gaps, user journeys, and the expansion plan. See `backlog.md` for next work.

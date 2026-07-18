# Issues

## Open

- The dataset now covers 28 sourced U.S. projects, all 11 initial Reactor Pilot Program projects, and 24 companies, but it is not yet a complete U.S. or global census.
- `npm audit` reports moderate transitive findings in the vinext/Next.js build chain. No high or critical findings remain after updating Vite, the Cloudflare Vite plugin, and Wrangler on 2026-07-17. Avoid `npm audit fix --force`; it proposes incompatible downgrades.

## Resolved

- 2026-07-17 — UI-003: The site used oversized gaps, undersized labels, generic serif/mono eyebrows, and an invented schematic map. Replaced the map with a regional location ledger, tightened the global rhythm, raised the type floor, and moved the visual system to a control-room palette with condensed industrial display type.
- 2026-07-17 — DATA-002: The tracker collapsed generation, size, and reactor family into one text field and omitted active NRC/DOE projects. Added four explicit taxonomy axes, generation/scale filters, 11 sourced projects, nine company profiles, and a durable research registry/search log.
- 2026-07-17 — UI-002: Pipeline company names, directory metadata, and capital-ledger text were too small. Removed the generic metric rail, changed the pipeline to readable 4×2 desktop and 2-column tablet layouts, raised company names from 8px to 12px, and raised capital-ledger body text to 11–17px. Verified at 1280×800, 768×1024, and 375×812.
- 2026-07-17 — DATA-001: The tracker omitted the DOE Reactor Pilot Program roster and the July 4 criticality outcome. Added all 11 initial pilot projects, the Unity Launch Pad experiment, 15 company records, and explicit government-reported versus company-reported evidence labels.
- 2026-07-17 — BUG-001: The development page showed a runtime overlay because Vite's generated dependency cache referenced the removed starter package `react-loading-skeleton`. Added a cache-integrity regression test, cleared only the generated Vite cache, and restarted the server. Verified all routes in the browser with no fresh console errors at tablet, mobile, and desktop sizes.
- 2026-07-17: starter dependency set included vulnerable Vite 8.0.13 and older Cloudflare tooling. Updated to Vite 8.1.5, `@cloudflare/vite-plugin` 1.45.1, and Wrangler 4.112.0; high-severity audit count fell from 6 to 0.

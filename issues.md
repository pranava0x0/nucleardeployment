# Issues

## Open

- The current map is schematic, not geographically precise. It is labeled and paired with the same records in a list.
- The dataset is a sourced MVP sample, not the complete U.S. or global inventory requested in the full brief.
- `npm audit` reports moderate transitive findings in the vinext/Next.js build chain. No high or critical findings remain after updating Vite, the Cloudflare Vite plugin, and Wrangler on 2026-07-17. Avoid `npm audit fix --force`; it proposes incompatible downgrades.

## Resolved

- 2026-07-17 — BUG-001: The development page showed a runtime overlay because Vite's generated dependency cache referenced the removed starter package `react-loading-skeleton`. Added a cache-integrity regression test, cleared only the generated Vite cache, and restarted the server. Verified all routes in the browser with no fresh console errors at tablet, mobile, and desktop sizes.
- 2026-07-17: starter dependency set included vulnerable Vite 8.0.13 and older Cloudflare tooling. Updated to Vite 8.1.5, `@cloudflare/vite-plugin` 1.45.1, and Wrangler 4.112.0; high-severity audit count fell from 6 to 0.

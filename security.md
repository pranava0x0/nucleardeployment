# Security advisory log

Last updated: 2026-07-17

## Current posture

- Next.js 16.2.6 and React 19.2.6 meet the patched versions named in the May 2026 Next.js/React advisory and the React2Shell advisory.
- Vite is pinned to 8.1.5. The starter's 8.0.13 version was in a vulnerable range for development-server file-read issues and newer Windows path handling findings.
- `@cloudflare/vite-plugin` is pinned to 1.45.1 and Wrangler to 4.112.0 to remove high-severity transitive findings in Miniflare, Undici, WebSocket handling, and esbuild.
- Development server binds to loopback by default. Do not expose it with `--host` or a public tunnel.
- No secrets, credentials, user input persistence, authentication, uploads, or external runtime fetches are part of this MVP.

## Audit result

`npm audit` after the security updates reports 0 critical, 0 high, 9 moderate, and 1 low findings. Remaining findings are in the vinext/Next.js/Drizzle development chain. The automated "fix" path proposes incompatible major downgrades, so they are documented rather than forced.

Before any future dependency install or upgrade:

1. Refresh `https://pranava0x0.github.io/vibe-coding-security/llms-ctx.txt`.
2. Run `npm audit` and inspect direct plus runtime dependencies.
3. Verify package names and exact versions against the registry.
4. Keep this log current.

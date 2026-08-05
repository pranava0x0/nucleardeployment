# Security advisory log

Last updated: 2026-08-05

## Open finding: Next.js is behind the July 2026 patch

The 2026-08-05 sweep supersedes the May 2026 assessment below. A Next.js
advisory published 2026-07-20 covers nine CVEs (four high, five medium:
cache confusion, middleware bypass, SSRF) affecting 16.0 through 16.2.10 and
fixed in 16.2.11. The named high-severity entry is CVE-2026-64642, a
middleware bypass on the Turbopack App Router path.

This project pins Next.js 16.2.6, which is inside the affected range. The
May 2026 note below is still accurate for CVE-2026-44578 — 16.2.6 patched
that one — but it is no longer sufficient on its own.

Upgrade to 16.2.11 or later, then rerun `npm run lint`, `npm test`, and
`npm run test:pages` before merging. Tracked in `backlog.md` under Quality.

## Current posture

- React 19.2.6 clears the React2Shell advisory, which patched at 19.2.4.
- Next.js 16.2.6 patched CVE-2026-44578 (May 2026) but predates the July 2026
  advisory. See the open finding above.
- Vite is pinned to 8.1.5. The starter's 8.0.13 version was in a vulnerable range for development-server file-read issues and newer Windows path handling findings.
- `@cloudflare/vite-plugin` is pinned to 1.45.1 and Wrangler to 4.112.0 to remove high-severity transitive findings in Miniflare, Undici, WebSocket handling, and esbuild.
- Development server binds to loopback by default. Do not expose it with `--host` or a public tunnel.
- No secrets, credentials, user input persistence, authentication, uploads, or external runtime fetches are part of this MVP.

## Continuous integration posture

- `ci.yml` triggers on `pull_request`, never `pull_request_target`. It checks
  out untrusted head code, so it holds `contents: read` and nothing else. The
  2026 Cordyceps campaign turned `pull_request_target` plus write scope into
  unauthenticated code execution across 300+ repositories; this workflow has
  neither half of that pair.
- No `ci.yml` step interpolates event-controlled text (PR title, body, branch
  name) into a `run:` shell.
- `ci.yml` actions are pinned to full commit SHAs with version comments, so a
  retagged `v7` cannot change what executes.
- `deploy-pages.yml` still pins its five actions to moving major tags
  (`@v4`, `@v5`) and holds `pages: write` plus `id-token: write`. Pinning those
  to SHAs is tracked in `backlog.md` under Quality.

## Audit result

`npm audit` after the security updates reports 0 critical, 0 high, 9 moderate, and 1 low findings. Remaining findings are in the vinext/Next.js/Drizzle development chain. The automated "fix" path proposes incompatible major downgrades, so they are documented rather than forced.

Before any future dependency install or upgrade, or before adding a GitHub
Action or third-party CDN asset:

1. Refresh `https://pranava0x0.github.io/vibe-coding-security/llms-ctx.txt`.
2. Run `npm audit` and inspect direct plus runtime dependencies.
3. Verify package names and exact versions against the registry.
4. Keep this log current.

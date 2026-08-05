# Security advisory log

Last updated: 2026-08-05

## Resolved 2026-08-05: Next.js raised to 16.2.12

The 2026-08-05 sweep found a Next.js advisory published 2026-07-20 covering
nine CVEs (four high, five medium: cache confusion, middleware bypass, SSRF)
affecting 16.0 through 16.2.10 and fixed in 16.2.11. The named high-severity
entry is CVE-2026-64642, a middleware bypass on the Turbopack App Router
path. This project pinned 16.2.6, inside the affected range.

Raised `next` and `eslint-config-next` to 16.2.12, which is 16.2.11 plus one
patch release. 16.3.0 was available and rejected: it was two days old at the
time, inside the window where most 2025-26 supply-chain takedowns were
caught, and a minor bump carries behaviour change a security patch does not
need. 16.2.12 was eleven days old, clearing that cooldown.

Verified after upgrade: lint clean, 12/12 rendered-HTML tests, 2/2 Pages
export tests.

## Current posture

- Next.js 16.2.12 clears both the May 2026 advisory (CVE-2026-44578, patched
  at 16.2.6) and the July 2026 advisory (patched at 16.2.11).
- React 19.2.6 clears the React2Shell advisory, which patched at 19.2.4.
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

As of 2026-08-05, `npm audit` reports 0 critical, 11 high, 4 moderate, and 1
low. The 2026-07-17 line below recorded 0 high; that number decayed on its
own as advisories were published against already-installed transitive
packages, not through any dependency change here.

The 11 high findings are confirmed pre-existing and unrelated to the Next.js
upgrade. Auditing `main`'s lockfile and the upgraded lockfile side by side
with `npm audit --package-lock-only` returns an identical
`high=11 moderate=4 low=1` on both.

All 11 sit in the build and development toolchain, none in shipped page
output: `postcss`, `sharp`, `undici`, `miniflare`, `wrangler`,
`@cloudflare/vite-plugin`, `js-yaml`, `brace-expansion`, `fast-uri`,
`react-server-dom-webpack`, and `next`'s own transitive `postcss`/`sharp`.
The site is a static export with no server runtime, so the request-path
findings (undici desync, fast-uri host confusion) have no production surface.

`npm audit fix --force` proposes `@cloudflare/vite-plugin@1.50.0`, outside
the stated dependency range. Not applied. Tracked in `backlog.md`.

Superseded 2026-07-17 line, kept for history: `npm audit` after the July
security updates reported 0 critical, 0 high, 9 moderate, and 1 low.

Before any future dependency install or upgrade, or before adding a GitHub
Action or third-party CDN asset:

1. Refresh `https://pranava0x0.github.io/vibe-coding-security/llms-ctx.txt`.
2. Run `npm audit` and inspect direct plus runtime dependencies.
3. Verify package names and exact versions against the registry.
4. Keep this log current.

# Production readiness — 22 October 2026

The app and game improvements are tracked in
[release PR #34](https://github.com/zznam/cursor-cafe-game-portal/pull/34).
This document records pre-release validation; the PR and Vercel deployment
history record subsequent merge and rollout status. Use
[DEPLOYMENT.md](DEPLOYMENT.md) for the Vercel + Neon release process; the old
Supabase setup instructions are historical.

## Verified implementation

- Favorites, catalog sorting, daily streaks, ten passport badges, and personal
  bests build on the existing local-progress features.
- Classic games report finished scores; scene restarts begin a new recorded
  round and dismiss the previous result. Lower-is-better puzzle results stay in
  personal bests rather than entering a descending-score leaderboard.
- Hexagon Match 3 recognizes all three axes, aligns visible tiles with their
  input targets, guarantees a playable initial board, refreshes stuck boards,
  and finishes a scored round after 20 valid moves.
- Score submission survives blocked browser storage, prevents concurrent
  submissions, exposes retryable failures, and uses a modal with contained focus.
- The contact page opens a GitHub issue draft for review. It no longer claims
  that an undelivered message was sent or advertises an unverified mailbox.
- The production `source-map-js` dependency is patched to 1.2.2. The container
  now uses Node 22, matching `package.json` and the CI application jobs.
- Next.js and its lint configuration are updated to 16.4.2, addressing the
  newly reported production advisories affecting 16.3.8. The stricter React
  checks also prompted ignoring obsolete comment responses and restoring
  sound preferences in the Play action, with in-session settings kept on restart.
- Browser CI uses Ubuntu's official HTTPS archive after the Azure mirror
  stalled dependency downloads. The dependency setup has an eight-minute limit;
  all browser projects and tests remain enabled.

## Validation

- Clean dependency install, production build, TypeScript, and ESLint passed.
  ESLint has 49 existing warnings and no errors.
- All 34 unit/database/release tests passed. The security utility coverage gate
  passed with 100% lines, statements, and functions, and 91.66% branches.
- `npm audit --omit=dev --audit-level=high` reports zero vulnerabilities.
- The production Docker image built and ran with UID 1001 on Node 22. Liveness,
  the contact page, and a public asset returned 200. The container health check
  passed; readiness correctly returned 503 without database credentials.
- Terraform format checks and validation of both AWS roots passed in an isolated
  container using Terraform 1.14.7 and the locked AWS provider 6.67.0. No cloud
  resources or checked-in provider locks were changed.
- The 511-case desktop, phone, tablet, and WebKit browser matrix produced 462
  passes, 47 intentional platform skips, one Safari focus failure, and one
  intermittent rapid-input test failure that passed on retry. Both issues were
  corrected. On the rebuilt final artifact, all 16 affected score, favorites,
  and pastry-game checks passed across all four projects with retries disabled.
  See [docs/testing.md](docs/testing.md) for commands and coverage.

## Hosted baseline before this release

Read-only checks of `https://cursor-cafe-game-portal.vercel.app` returned 200 for
liveness, readiness, and the catalog. The promoted release reports commit
`40fca8838f62b43f45da96fc23174f7405eaa523` at the time of this baseline check.
The configured Neon database also passed a read-only readiness query, contained
31 game listings, and recorded both portable PostgreSQL migrations.

## Remaining release boundaries

Publish and promote through the existing release process, then verify the new release identity,
readiness, catalog, and gameplay. This work adds no database migration; running
the catalog seed refreshes the Hexagon Match 3 description while preserving IDs
and player activity.

The full development-dependency audit still reports the `braces` 3.0.3 advisory
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) through the
Next.js ESLint plugin (five affected entries in that chain). The registry reported
no patched `braces` release during this check. The suggested npm fix downgrades
Next.js lint tooling, so it was not applied. This dependency is excluded from
the production dependency audit; the issue has not been suppressed.

Public scores remain client-reported casual scores, not an anti-cheat system.
Passport and favorites stay in the player's browser. Backup restore drills,
cloud quota alerts, and regional failover were not exercised by these local
checks; the operational requirements remain in the deployment guide.

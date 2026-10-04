# Test coverage

## Commands

```sh
npm run lint
npm run type-check
npm run test:coverage
npm run build
npx playwright install chromium webkit
E2E_MOCK_DATABASE=true npm run test:e2e
# If port 3000 is occupied:
E2E_BASE_URL=http://localhost:3100 E2E_MOCK_DATABASE=true npm run test:e2e
```

`npm run test:coverage` runs all Node suites and enforces at least 95% lines/functions/statements and 90% branches for `lib/validation.ts` and `lib/server/guest-token.ts`. The report is written to `coverage/lcov.info` and uploaded by CI. This is explicitly a security-utility coverage gate, not a whole-repository percentage.

## Layers

- **Validation and identity:** bounded query inputs, zero/negative/fractional scores, social content bounds, rejected spoofed fields, supported events, forged/expired/rotated/malformed guest tokens.
- **Database:** applies the portable PostgreSQL schema directly through PGlite with no Supabase objects. Checks foreign keys, shared atomic rate limits/expiry, rating upserts and insert/edit/delete aggregates, play triggers, score constraints, and readiness when a trigger is disabled. A separate historical Supabase migration test retains coverage of its old roles and permissions for migration reference.
- **Release behavior:** runs the real AWS deployment script against deterministic command doubles. Checks successful revision verification, an ECS automatic rollback that reports stable, and smoke-test failure rollback including the initial zero-task bootstrap case. It never contacts AWS.
- **Browser/API:** real production Next.js server with a local PGlite PostgreSQL socket server. Covers desktop/mobile/tablet navigation, real Phaser canvas startup, category filtering, pagination, full-catalog search, cancellation/error states, corrupted favorites, social forms and writes, guest rating isolation, request validation, security headers, and health endpoints. These tests are credential-free and never read or mutate production data.
- **Build/infra:** production build, non-root Docker health smoke, Terraform format/validate, dependency audit, and release image vulnerability scan. Deployment-config regression tests cover native Vercel IDs, unique prebuilt retries, and bounded deterministic AWS IDs with full commit SHAs.

The browser fixture uses the PostgreSQL protocol and real SQL constraints/triggers. It runs with one worker because the outage test temporarily stops its database socket server, then verifies recovery. Cloud IAM, DNS latency/failover, certificate issuance, Neon cold starts/quotas and cross-region behavior require staging verification.

Missing seeded games now fail the browser suite instead of silently skipping. Desktop-only navigation is skipped on mobile/tablet; outage control is skipped when tests run without the isolated database fixture. CI runs Chromium desktop/mobile plus WebKit mobile for the new features and full-catalog touch suite. Chromium tablet remains available locally.

## Café release acceptance

`tests/cafe.test.ts` verifies the four-game rotation and UTC boundaries, invalid
and historical dates, 1,000 solvable pipe boards, block boundaries and intersecting
line clearing, stack geometry, seeded obstacle sequences, best-result comparisons,
immutable progress aggregation, duplicate/abandoned attempts and all eight badges.
The PostgreSQL suite checks repeated catalog seeding preserves existing IDs,
ratings, comments and play counts; fixtures apply every migration in order.

`e2e/cafe-features.spec.ts` covers discovery URL state, selection beyond pagination,
actual puzzle solving and completed seeded runs, midnight rollover, cross-tab
progress, malformed/unavailable storage and sharing fallback. `e2e/touch-games.spec.ts` exercises all 31 game modules on touch
surfaces, including every advertised action, pause/restart, portrait/landscape
reflow, Sudoku/word/mine controls, cancelled sports gestures, and real
simultaneous contacts for Pong. Existing
keyboard-focus and runtime tests remain release requirements.

Progress is local to this browser. Immutable run-start and result records use
`cafe:v1:activity:*` storage keys, so independent tabs cannot overwrite one another.
Official daily and past-date practice attempts keep separate bests and histories;
only official completions count toward daily badges. Invalid records are ignored;
unavailable storage falls back to session memory with a notice. No account, cloud sync or anti-cheat guarantee is introduced.

## Release validation (2026-10-04)

- Production build and TypeScript check passed. ESLint reported no errors and 49
  pre-existing warnings.
- All 24 unit/SQL tests passed, including repeated seeding with preserved scores,
  ratings, comments, IDs and play counts. The configured security coverage gate
  passed (100% statements/lines/functions, 91.66% branches).
- The 491-case browser matrix covered Chromium desktop, phone and tablet, plus
  WebKit mobile. There were 47 intentional platform-specific skips. The broad run
  passed 443 tests and exposed one rapid category-reset race, which was fixed.
  On the final build, the 56 affected discovery/daily/progress scenarios were
  verified: 55 passed together; the remaining restart assertion was corrected to
  wait for Phaser's deferred canvas teardown and passed in a separate rerun.
- Axe 4.11.1 found no WCAG A/AA violations in ten desktop/phone checks covering
  discovery, daily, passport, and running pastry/Sudoku players with zoom and pan.
  Canvas gameplay also received visual, keyboard and real touch-event checks.

These checks use browser device emulation and an isolated local SQL fixture.
Production migrations, seeding and deployment have not been performed.

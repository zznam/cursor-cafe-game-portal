# Test coverage

## Commands

```sh
npm run lint
npm run type-check
npm run test:coverage
npm run build
npx playwright install chromium
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

Missing seeded games now fail the browser suite instead of silently skipping. Desktop-only navigation is skipped on mobile/tablet; outage control is skipped when tests run without the isolated database fixture. Use `--project=chromium-desktop --project=chromium-mobile` for the CI subset; tablet remains available locally.

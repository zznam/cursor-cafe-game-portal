# Test coverage

## Commands

```sh
npm run lint
npm run type-check
npm run test:coverage
npm run build
npx playwright install chromium
E2E_MOCK_DATABASE=true npm run test:e2e
```

`npm run test:coverage` runs all Node suites and enforces at least 95% lines/functions/statements and 90% branches for `lib/validation.ts` and `lib/server/guest-token.ts`. The report is written to `coverage/lcov.info` and uploaded by CI. This is explicitly a security-utility coverage gate, not a whole-repository percentage.

## Layers

- **Validation and identity:** bounded query inputs, zero/negative/fractional scores, social content bounds, rejected spoofed fields, supported events, forged/expired/rotated/malformed guest tokens.
- **Database:** applies the actual migration to PostgreSQL through PGlite; checks anonymous and authenticated write denial, service-only RPCs, shared rate limits and expiration, rating insert/edit/delete totals, analytics/play-count transaction, and score constraints. Supabase-managed auth/storage schemas and the baseline UUID extension are stubbed only for this isolated engine.
- **Release behavior:** runs the real AWS deployment script against deterministic command doubles. Checks successful revision verification, an ECS automatic rollback that reports stable, and smoke-test failure rollback including the initial zero-task bootstrap case. It never contacts AWS.
- **Browser/API:** real production Next.js server with a local PostgREST HTTP fixture. Covers desktop/mobile/tablet navigation, real Phaser canvas startup, category filtering, pagination, full-catalog search, cancellation/error states, corrupted favorites, social forms and writes, guest rating isolation, request validation, security headers, and health endpoints. These tests are credential-free and never read or mutate production data.
- **Build/infra:** production build, non-root Docker health smoke, Terraform format/validate, dependency audit, and release image vulnerability scan.

The local database fixture is intentionally not an emulator of every Supabase feature. PostgreSQL permissions/trigger behavior is tested separately against the SQL engine. Cloud IAM, DNS latency/failover, certificate issuance, Supabase replica lag and cross-region network behavior require a later staging environment; local test success does not claim those live checks passed.

Missing seeded games now fail the browser suite instead of silently skipping. The only intended browser skip is the desktop-only navigation case on mobile/tablet projects. Use `--project=chromium-desktop --project=chromium-mobile` for the CI subset; tablet remains available locally.

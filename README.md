# Cursor Café

A Next.js 16 / React 19 portal for Phaser browser games, with search, category browsing, favorites, ratings, comments, and leaderboards.

**Vercel + Neon PostgreSQL is the default deployment.** Multi-region AWS is an optional custom deployment, enabled only by explicitly running its workflows. No AWS account is needed for development or the normal Vercel path.

## Play at the Café

- 31 games with touch controls, pause/restart, and keyboard or mouse support.
- Four café originals: Coffee Connections, Pastry Blocks, Cup Stack, and Sugar Orbit.
- `/daily`: a shared seeded challenge rotating at midnight UTC, unlimited retries,
  personal bests, and player-initiated result sharing. Past dates are practice.
- `/passport`: game stamps, eight milestone badges, personal bests, and daily history.
  Progress stays in this browser; clearing browser data removes it.
- `/games`: mood, estimated session length, device support, and category filters,
  plus a “Surprise me” choice across the complete matching catalog.

Existing installations must run both the additive migrations and catalog seed
before deploying this release. Seeding retains game IDs and existing player activity.

## Local development

Use Node.js 22.12 or newer within Node 22.

```sh
npm ci
cp .env.local.example .env.local
npm run dev
```

Set `DATABASE_URL`, `SESSION_SECRET`, and `SITE_URL` as described in `.env.local.example`. Generate the session secret with `openssl rand -hex 32`. Service credentials remain on the server. Run `npm run db:migrate` and `npm run db:seed` before starting the app. Existing Supabase data must be exported separately; follow the migration instructions in [DEPLOYMENT.md](DEPLOYMENT.md).

## Quality checks

```sh
npm run lint
npm run type-check
npm run test:coverage
npm run build
npx playwright install chromium webkit
E2E_MOCK_DATABASE=true npm run test:e2e
```

Browser tests use the built application and a local PostgreSQL fixture, with no production data or credentials. The SQL suite executes the current PostgreSQL schema and historical Supabase hardening migration against PostgreSQL through PGlite. Coverage thresholds apply to request schemas and guest-token signing; they are not a whole-app coverage claim. See [testing](docs/testing.md).

## Deployment

- **Default:** [Vercel deployment guide](DEPLOYMENT.md). `npm run deploy`, `deploy.sh`, and `quick-deploy.sh` all target Vercel. Native Vercel Git integration stays available; the supplied Vercel pipeline can be enabled instead.
- **Explicit custom option:** [AWS launch runbook](docs/aws-deployment.md), Terraform under `infra/aws`, and manually dispatched **Custom AWS infrastructure** / **Custom AWS release** workflows.
- **Design and limitations:** [architecture and review](docs/architecture.md).

## Project layout

| Directory | Purpose |
| --- | --- |
| `app`, `components` | Server-rendered portal and interactive UI |
| `app/api`, `lib/server` | Validated APIs, signed guest identity, database access |
| `games` | Phaser games, loaded on demand |
| `database/migrations` | Versioned portable PostgreSQL schema |
| `tests`, `e2e` | Security, SQL, release and browser regression tests |
| `infra/aws` | Optional multi-region AWS infrastructure |
| `.github/workflows` | Quality gates, default Vercel deployment, opt-in AWS and database workflows |

For game contributions, see [CONTRIBUTING.md](CONTRIBUTING.md) and [GAME_INTEGRATION.md](GAME_INTEGRATION.md). New games can report interaction and result events through `GameRuntime`; existing `useGameApi` integrations remain available for scores and analytics. No database credentials belong in a game or browser component.

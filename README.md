# Cursor Café

A Next.js 16 / React 19 portal for Phaser browser games, with search, category browsing, favorites, ratings, comments, and leaderboards.

**Vercel + Supabase remains the default deployment.** Multi-region AWS is an optional custom deployment, enabled only by explicitly running its workflows. No AWS account is needed for development or the normal Vercel path.

## Local development

Use Node.js 22.12 or newer within Node 22.

```sh
npm ci
cp .env.local.example .env.local
npm run dev
```

Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, and `SITE_URL` as described in `.env.local.example`. Generate the session secret with `openssl rand -hex 32`. Service credentials remain on the server. Apply the database migrations before using writes; existing installations must follow the baseline instructions in [DEPLOYMENT.md](DEPLOYMENT.md).

## Quality checks

```sh
npm run lint
npm run type-check
npm run test:coverage
npm run build
npx playwright install chromium
E2E_MOCK_DATABASE=true npm run test:e2e
```

Browser tests use the built application and a local PostgREST fixture, with no production data or credentials. The SQL suite executes the production hardening migration against PostgreSQL through PGlite. Coverage thresholds apply to request schemas and guest-token signing; they are not a whole-app coverage claim. See [testing](docs/testing.md).

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
| `supabase/migrations` | Versioned database schema and permissions |
| `tests`, `e2e` | Security, SQL, release and browser regression tests |
| `infra/aws` | Optional multi-region AWS infrastructure |
| `.github/workflows` | Quality gates, default Vercel deployment, opt-in AWS and database workflows |

For game contributions, see [CONTRIBUTING.md](CONTRIBUTING.md) and [GAME_INTEGRATION.md](GAME_INTEGRATION.md). Game modules continue to use `useGameApi` for scores and analytics; no database credentials belong in a game or browser component.

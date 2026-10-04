# Deploy to Vercel with Neon PostgreSQL

The default deployment is **Vercel + Neon PostgreSQL**. The app uses standard PostgreSQL through `pg`, so another hosted PostgreSQL provider also works. Deno KV requires a different data model and is not a drop-in SQL replacement. Optional AWS deployment remains in [docs/aws-deployment.md](docs/aws-deployment.md).

## 1. Prepare a free Neon database

Create a project in the [Neon console](https://console.neon.tech) on the Free plan. Choose a region near your Vercel function region. Copy the pooled PostgreSQL connection string from **Connect**, including `sslmode=verify-full` (or the supplied `sslmode=require`). This is a server secret; never put it in browser code or a `NEXT_PUBLIC_` variable.

For local setup:

```sh
cp .env.local.example .env.local
# Fill DATABASE_URL, SESSION_SECRET, and SITE_URL in .env.local.
# Generate the session secret with: openssl rand -hex 32
npm run db:migrate
npm run db:seed
npm run dev
```

`db:migrate` applies SQL under `database/migrations` in one transaction with an advisory lock and checksum history. Repeated runs skip applied migrations; edited applied files are rejected. Use a fresh database for the initial PostgreSQL migration. `DATABASE_MIGRATION_URL` can hold a direct connection string for migration/seed commands; otherwise they use `DATABASE_URL`.

`db:seed` inserts listings for the full bundled catalog and refreshes descriptive and discovery metadata on existing games. It preserves game IDs, scores, ratings, comments, play counts, and existing featured choices. Games without a bundled thumbnail use a shared placeholder. Both commands load `.env.local`; they do not print credentials.

For an existing deployment, apply reviewed additive migrations before deploying code that queries the new fields. Refresh the catalog after the new game bundles are deployed, then verify `/api/health/ready`, the catalog, and the new game pages.

### Existing Supabase data

This code change initializes a new database; it does **not** recover data from the unreachable Supabase project. If you need old comments, ratings, scores, or analytics, resume/export the old project first. Keep it until data has been verified in Neon.

Export only the application tables: `games`, `ratings`, `comments`, `leaderboards`, and `analytics`. Preserve their IDs and relationships. Do not restore Supabase-managed Auth, Storage, roles, or the old full schema into Neon. The historical `supabase/` directory is retained as migration reference.

Import into a separate Neon branch with triggers disabled during the data copy, validate the new constraints, then recompute `rating_sum`, `total_ratings`, and `average_rating` before enabling the rating/play triggers. Preserve existing play counts so importing analytics does not double-count plays. Move any Supabase-hosted assets separately and update URLs. Verify before selecting that branch for production. The bundled games themselves are served by the app.

### Manual migration workflow

The **Database migrations** workflow uses GitHub environment `database-production`, restricted to the main branch, and secret `DATABASE_MIGRATION_URL`. It applies committed PostgreSQL migrations using the same transaction/checksum runner. Seed explicitly before the first launch; later application releases do not automatically reset or seed the database.

## 2. Configure Vercel

Use Next.js and Node.js 22. Set these server-only variables for the intended environment (Production, or a separate database/branch for Preview):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon pooled PostgreSQL connection string with TLS |
| `SESSION_SECRET` | At least 32 random characters; retain it across releases |
| `SITE_URL` | Exact canonical HTTPS origin, e.g. `https://play.example.com` |
| `DATABASE_READ_URL` | Optional catalog read connection; omit initially |
| `IMAGE_HOSTS` | Optional comma-separated image hostnames, configured before building |

`DATABASE_MIGRATION_URL` is only needed where setup commands run; Vercel runtime does not need it. Remove obsolete `SUPABASE_*` and `NEXT_PUBLIC_SUPABASE_*` variables after the new release is verified. Keep `ASSET_PREFIX` unset on Vercel.

Guest writes require an Origin equal to `SITE_URL`. Preview deployments need their own origin and isolated database branch/secrets for mutation tests. Database calls use parameterized SQL; primary connections handle social reads, writes, and shared atomic rate limits. Catalog reads optionally use `DATABASE_READ_URL`.

Redeploy after changing variables: Vercel applies configuration changes to new deployments. Verify the new deployment URL, rather than an older immutable deployment URL.

## 3. Choose one release mechanism

### Native Vercel Git integration

Keep the existing integration and merge to the production branch. Enable Vercel deployment checks / branch protection for the **Quality gates** workflow as appropriate for your account. Local deployments remain:

```sh
npm install --global vercel@62.1.0
vercel login
vercel link
npm run deploy
```

`deploy.sh` runs lint, type checks, and unit/SQL/release tests, then calls `vercel --prod`. It never removes or overwrites project environment variables.

### Supplied GitHub deployment pipeline

Use **Deploy to Vercel (default)** manually on `main`, or set repository variable `VERCEL_CI_DEPLOY=true` to run it after successful main-branch quality gates. If enabling this mode, disable duplicate production deployments in the Vercel Git integration; do not run both release mechanisms for the same branch.

Create environment `vercel-production`, restricted to `main`, with:

- Variables: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Secret: `VERCEL_TOKEN`.
- Optional secret: `VERCEL_AUTOMATION_BYPASS_SECRET` for protected deployment smoke tests.

The pipeline pulls the project configuration, builds, creates a production deployment without assigning the domain, checks readiness/catalog/homepage, and promotes the verified URL. A failed smoke test leaves the currently promoted production deployment serving traffic. Automatic runs check out the exact commit tested by CI. Manual runs execute quality gates first.

Native builds use Vercel's automatic deployment ID. The prebuilt pipeline supplies `APP_DEPLOYMENT_ID` from the repository ID, workflow run ID, and attempt, which the app hashes to a valid 32-character ID. Each rebuild gets a unique deployment ID even when releasing the same commit again; `APP_VERSION` retains the full commit SHA for health and smoke checks. Custom AWS builds derive their deployment ID from `APP_VERSION`, keeping the one built artifact consistent across regions.

## Operations

- `/api/health` is process liveness. `/api/health/ready` verifies the primary, configured catalog read connection, nonempty catalog, and required database functions/triggers. Responses are never cached.
- Monitor Vercel errors and Neon compute/storage/transfer quotas. Configure backups/PITR and test restores before a public launch.
- Database mutation rate limits are shared across instances and regions. Guests are not verified accounts, and browser-generated scores are not cheat-proof. Add account verification/moderation and server-verified scoring before prizes or high-trust competitions.
- Keep analytics retention bounded operationally, for example deleting rows older than 90 days in a scheduled database job. Choose the retention period for your product before launch.
- Roll back an application release with Vercel's previous production deployment or `vercel rollback <deployment-url>`. Database migrations are forward-only; ensure old and new application versions are schema-compatible before rollback.

For additional regions or custom network/runtime control, explicitly choose the [AWS runbook](docs/aws-deployment.md). No cloud resources have been provisioned by this implementation.

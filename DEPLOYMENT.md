# Deploy to Vercel (default)

The normal deployment is **Vercel + the existing Supabase project**. AWS is an optional custom path in [docs/aws-deployment.md](docs/aws-deployment.md); nothing in the default deploy scripts provisions AWS.

## 1. Prepare Supabase

Back up an existing database before migrating. The app now routes all writes through validated APIs and disables direct anonymous database writes. Use a short maintenance window when upgrading the old app: the hardening migration intentionally prevents its older browser-write code from working until the new app is deployed.

For a **new database**, run both files in `supabase/migrations` in order using the Supabase CLI, or run `supabase/schema.sql` once in the SQL editor. The combined schema is a convenience for new installs, not an idempotent migration.

For a database **already created from the old `schema.sql`**, first compare its schema with `20261002000100_baseline.sql`. After confirming they match, mark that baseline as applied:

```sh
supabase migration repair 20261002000100 --status applied --db-url "$SUPABASE_DB_URL"
supabase db push --db-url "$SUPABASE_DB_URL" --dry-run
supabase db push --db-url "$SUPABASE_DB_URL"
```

Do not rerun the baseline over existing tables or run `db reset` in production. The hardening migration preserves legacy rows and adds constraints using `NOT VALID`; validate/clean old rows separately. Existing unsigned guest IDs remain readable but are not claimed by new signed guests.

Seed actual games using the repository seed SQL before launch. `/api/health/ready` verifies both credentials and the hardened schema; the deployment smoke test also requires a nonempty catalog.

The manual **Database migrations** workflow uses GitHub environment `database-production` and secret `SUPABASE_DB_URL` (an SSL-enabled direct or session-pooler connection). Restrict this environment to the main branch. This workflow remains separate from application releases so database changes can be reviewed and timed explicitly.

## 2. Configure Vercel

Import the repository into Vercel using Next.js and Node.js 22. The native Git integration remains the default; no `git.deploymentEnabled` override is added.

Set these **server-only** production environment variables:

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | Primary project URL |
| `SUPABASE_ANON_KEY` | Public/anon API key used for reads |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role key used for mutations |
| `SESSION_SECRET` | At least 32 random characters; retain it across releases |
| `SITE_URL` | Exact canonical HTTPS origin, e.g. `https://play.example.com` |
| `SUPABASE_READ_URL` | Optional catalog-only read endpoint; omit initially |
| `IMAGE_HOSTS` | Optional comma-separated image hostnames, configured before building |

Keep `ASSET_PREFIX` unset on Vercel; Vercel serves its own static assets. Legacy `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are accepted as a read-only compatibility fallback, but new setup should use the server names above. Never prefix the service key or session secret with `NEXT_PUBLIC_`.

Guest writes require an Origin equal to `SITE_URL`. Preview deployments need their own configured origin and a separate test database/secrets before testing mutations. Unconfigured previews fail writes closed.

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

## Operations

- `/api/health` is process liveness. `/api/health/ready` verifies the primary, configured catalog read endpoint, and the service role/migration contract. Responses are never cached.
- Monitor Vercel errors and Supabase saturation/replication lag. Configure backups/PITR and test restores before a public launch.
- Database mutation rate limits are shared across instances and regions. Guests are not verified accounts, and browser-generated scores are not cheat-proof. Add account verification/moderation and server-verified scoring before prizes or high-trust competitions.
- Keep analytics retention bounded operationally, for example deleting rows older than 90 days in a scheduled database job. Choose the retention period for your product before launch.
- Roll back an application release with Vercel's previous production deployment or `vercel rollback <deployment-url>`. Database migrations are forward-only; ensure old and new application versions are schema-compatible before rollback.

For additional regions or custom network/runtime control, explicitly choose the [AWS runbook](docs/aws-deployment.md). No cloud resources have been provisioned by this implementation.

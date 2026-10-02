# Optional custom AWS deployment

**Vercel remains the default.** Choose this runbook only when you explicitly want AWS. Both AWS workflows are manual `workflow_dispatch` actions restricted to `main`; merging application code does not deploy AWS.

This implementation prepares infrastructure for a future account/domain. It has not been applied to an AWS account. Expect paid resources: two load balancers, four NAT gateways, four baseline Fargate tasks after launch, WAF, logs, and data transfer. Price these against your expected traffic and budget before applying.

## Architecture

Defaults are Singapore (`ap-southeast-1`) and Ireland (`eu-west-1`), each with two availability zones. Set `primary_region` / `secondary_region` to change them before the first apply. Changing an existing region creates replacement infrastructure and needs a migration plan.

- Route 53 latency aliases with target health evaluation route the app hostname to healthy regional ALBs. DNS caching means failover is not instantaneous; if all targets are unhealthy, DNS/ALB can fail open. This is availability routing, not data-residency enforcement.
- HTTPS ALBs terminate ACM certificates; HTTP redirects to HTTPS. Regional DNS names support direct smoke tests.
- Fargate tasks have no public IP, run as a non-root user, and receive traffic only from the ALB security group. Each AZ has its own NAT for Supabase/API access.
- WAF provides regional abuse controls; PostgreSQL enforces shared write quotas across all instances. The IP limiter assumes Vercel's sanitized forwarding header or direct ALB ingress that appends the peer to `X-Forwarded-For`; do not add an arbitrary proxy without reviewing this trust boundary.
- Two private versioned S3 buckets contain the same immutable Next.js chunks. CloudFront uses an origin group with secondary-region failover. Releases upload assets to both buckets before changing app tasks. Old assets and images are deliberately retained for rollback; prune only after your support/rollback window.
- Supabase remains external to AWS Terraform. Catalog reads can use regional replicas; all mutations, rate limits, readiness contracts, comments, ratings, and leaderboards use the primary. **This is not a multi-writer or automatically promoted database.** Enable backups/PITR and document primary recovery separately.

## Prerequisites

An AWS account (preferably dedicated production), AWS CLI v2 credentials for initial bootstrap, a public Route 53 hosted zone with delegated DNS, Terraform 1.14.7, Docker, a migrated/seeded Supabase project, and a GitHub repository with Actions enabled.

## 1. Bootstrap state and CI identity once

```sh
terraform -chdir=infra/aws/bootstrap init
terraform -chdir=infra/aws/bootstrap plan \
  -var='github_repository=OWNER/REPOSITORY' -out=bootstrap.tfplan
terraform -chdir=infra/aws/bootstrap apply bootstrap.tfplan
terraform -chdir=infra/aws/bootstrap output
```

If the account already has GitHub's OIDC provider, pass `existing_github_oidc_provider_arn` instead of creating a duplicate. `github_repository` is case-sensitive. The trust policies are restricted to this repository and the exact environments `aws-production` and `aws-infrastructure-production`. Require main-branch deployment restrictions and reviewer approval on those environments in GitHub; environment subjects alone do not restrict branches.

Keep the bootstrap state safe. It initially uses local state so it can create the remote state bucket. Migrate it to its own `bootstrap/terraform.tfstate` key by adding an S3 backend block in `infra/aws/bootstrap` and running `terraform init -migrate-state`; never use the application's `production/terraform.tfstate` key. Back up the initial state securely until migration is complete.

The release role is scoped to the application repositories/services/assets and runtime PassRole. The infrastructure role intentionally has broader network/control-plane permissions to create resources; it cannot read runtime secret values. Use a dedicated account and restrict access to that environment. No long-lived AWS access keys are stored in GitHub.

## 2. Create application infrastructure with zero tasks

```sh
cp infra/aws/terraform.tfvars.example infra/aws/terraform.tfvars
cp infra/aws/backend.hcl.example infra/aws/backend.hcl
# Fill the existing zone, hostname, regions, Supabase URL, and state bucket.
terraform -chdir=infra/aws init -backend-config=backend.hcl
terraform -chdir=infra/aws plan -out=production.tfplan
terraform -chdir=infra/aws apply production.tfplan
terraform -chdir=infra/aws output -json
```

Keep `launch_enabled=false` initially. The service starts with zero tasks so no placeholder image runs before secrets and a release exist. Certificates need publicly resolvable DNS; do not continue until validation completes.

Terraform owns service/network/runtime configuration. The release pipeline owns deployed task revisions and desired count; these fields are explicitly ignored by Terraform. A Terraform runtime-template change takes effect on the next release, which reads the latest task family template.

## 3. Populate regional runtime secrets outside Terraform

Each region creates a secret named `cursor-cafe/runtime` (or your project prefix). Create a local ignored `runtime-secrets.json` file containing:

```json
{
  "SUPABASE_ANON_KEY": "public-key",
  "SUPABASE_SERVICE_ROLE_KEY": "server-only-service-key",
  "SESSION_SECRET": "at-least-32-random-characters-identical-in-both-regions"
}
```

```sh
aws secretsmanager put-secret-value --region ap-southeast-1 \
  --secret-id cursor-cafe/runtime --secret-string file://runtime-secrets.json
aws secretsmanager put-secret-value --region eu-west-1 \
  --secret-id cursor-cafe/runtime --secret-string file://runtime-secrets.json
```

Remove the local file afterward. The values are never placed in Terraform state or build arguments. Rotate by updating both regions and deploying new tasks. Rotating `SESSION_SECRET` invalidates existing guest cookies; guest rating ownership then starts anew.

## 4. Configure GitHub and release explicitly

Create `aws-production` and `aws-infrastructure-production` environments. Restrict both to `main`; add required reviewers. Add these repository variables (not secret values):

| Variable | Source |
| --- | --- |
| `AWS_PROJECT` | `cursor-cafe` or the selected project prefix |
| `AWS_PRIMARY_REGION`, `AWS_SECONDARY_REGION` | Same regions as Terraform |
| `AWS_DEPLOY_ROLE_ARN` | Bootstrap deploy role output |
| `AWS_TERRAFORM_ROLE_ARN` | Bootstrap infrastructure role output |
| `TF_STATE_BUCKET` | Bootstrap state bucket output |
| `AWS_ZONE_ID`, `APP_HOSTNAME` | Existing zone and canonical app hostname |
| `SUPABASE_URL` | Primary Supabase URL |
| `SUPABASE_PRIMARY_READ_URL`, `SUPABASE_SECONDARY_READ_URL` | Optional catalog replicas; leave empty initially |
| `ASSET_BUCKET`, `ASSET_SECONDARY_BUCKET`, `ASSET_PREFIX` | Application Terraform outputs |
| `IMAGE_HOSTS` | Optional build-time remote image host allowlist |
| `LAUNCH_ENABLED` | `false` before the first release, then `true` |
| `ALARM_EMAIL` | Optional operator email; confirm both SNS subscriptions |

Dispatch **Custom AWS release** on `main`. It runs quality gates, builds a single amd64 image, scans it, uploads both asset origins, pushes the same image to both regional ECR registries, and deploys by digest. The secondary region rolls first. A successful stable-task revision check and regional smoke test are required before the primary rolls. Existing task counts above two are preserved.

After the first successful release, set `LAUNCH_ENABLED=true`, then run **Custom AWS infrastructure** with action `plan`, review it, and explicitly run `apply`. This registers a two-task minimum and CPU target-tracking autoscaling. Edit Terraform capacity defaults or extend workflow inputs for other limits. Infrastructure and application workflows share a concurrency group to avoid conflicting changes.

## Rollback and incident response

ECS circuit breakers roll back failed deployments. The script additionally detects stable-but-rolled-back services and restores the previous task revision if smoke tests fail. On bootstrap failure it restores the original zero task count. The failed region rolls back; a secondary region already verified successfully can remain on the new version if the primary fails, so every change must support mixed versions during rollout.

The workflow saves `previous-REGION.txt` and digest files as a 90-day release record. To explicitly roll back a deployed region:

```sh
aws ecs update-service --region REGION --cluster PROJECT-REGION \
  --service PROJECT-REGION --task-definition PREVIOUS_TASK_DEFINITION_ARN
aws ecs wait services-stable --region REGION --cluster PROJECT-REGION --services PROJECT-REGION
node scripts/smoke.mjs https://REGION.YOUR_HOSTNAME PREVIOUS_COMMIT_SHA REGION
```

Do not roll back database schemas automatically. Prefer compatible, forward migrations. Preserve old image digests and S3 chunks until rollback support expires.

Health and 5xx alarms publish to regional SNS topics. Confirm subscriptions, configure an external uptime check against the canonical and both regional URLs, exercise an application-region outage, and rehearse a database restore before launch. Container liveness is independent of database readiness, avoiding container restart loops during a database outage. CloudWatch logs retain 30 days. Supabase analytics retention and database backups are separate operational tasks.

## Sources

- [AWS ECS deployment circuit breaker](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-circuit-breaker.html)
- [Route 53 latency routing and health](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-values-latency.html)
- [Next.js self-hosting and multiple instances](https://nextjs.org/docs/app/guides/self-hosting)
- [Supabase read replicas and primary routing](https://supabase.com/docs/guides/platform/read-replicas)

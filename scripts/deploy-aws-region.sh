#!/usr/bin/env bash
set -euo pipefail
: "${AWS_REGION:?}" "${AWS_PROJECT:?}" "${IMAGE_URI:?}" "${REGIONAL_URL:?}" "${APP_VERSION:?}"
service="${AWS_PROJECT}-${AWS_REGION}"
# Terraform owns the latest family template; releases only replace its image.
# This ensures changes to secrets, environment, CPU, or IAM appear on the next release.
aws ecs describe-task-definition --task-definition "$service" --query taskDefinition > task.json
jq --arg image "$IMAGE_URI" --arg version "$APP_VERSION" '
  del(.taskDefinitionArn,.revision,.status,.requiresAttributes,.compatibilities,.registeredAt,.registeredBy)
  | .containerDefinitions |= map(if .name == "app" then .image = $image | .environment = ([.environment[] | select(.name != "APP_VERSION")] + [{name:"APP_VERSION",value:$version}]) else . end)
' task.json > release-task.json
previous_count=$(aws ecs describe-services --cluster "$service" --services "$service" --query 'services[0].desiredCount' --output text)
previous=$(aws ecs describe-services --cluster "$service" --services "$service" --query 'services[0].taskDefinition' --output text)
new=$(aws ecs register-task-definition --cli-input-json file://release-task.json --query 'taskDefinition.taskDefinitionArn' --output text)
printf '%s\n' "$previous" > "previous-${AWS_REGION}.txt"
rollback() {
  echo "Release failed in $AWS_REGION; restoring $previous"
  aws ecs update-service --cluster "$service" --service "$service" --task-definition "$previous" --desired-count "$previous_count" >/dev/null
  aws ecs wait services-stable --cluster "$service" --services "$service" || true
}
trap rollback ERR
count=$(aws ecs describe-services --cluster "$service" --services "$service" --query 'services[0].desiredCount' --output text)
if (( count < 2 )); then count=2; fi
aws ecs update-service --cluster "$service" --service "$service" --task-definition "$new" --desired-count "$count" >/dev/null
aws ecs wait services-stable --cluster "$service" --services "$service"
# The waiter also succeeds after ECS rolls back. Verify the requested revision explicitly.
active=$(aws ecs describe-services --cluster "$service" --services "$service" --query 'services[0].taskDefinition' --output text)
test "$active" = "$new"
node scripts/smoke.mjs "$REGIONAL_URL" "$APP_VERSION" "$AWS_REGION"
trap - ERR

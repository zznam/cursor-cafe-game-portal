terraform {
  required_version = ">= 1.10, < 2.0"
  required_providers { aws = { source = "hashicorp/aws", version = "~> 6.0" } }
}
variable "region" { default = "ap-southeast-1" }
variable "project" { default = "cursor-cafe" }
variable "github_repository" {
  description = "Case-sensitive GitHub owner/repository"
  type        = string
}
variable "existing_github_oidc_provider_arn" {
  description = "Use the existing GitHub OIDC provider when this account already has one."
  default     = ""
}
provider "aws" { region = var.region }
data "aws_caller_identity" "current" {}
resource "aws_s3_bucket" "state" {
  bucket = "${var.project}-tfstate-${data.aws_caller_identity.current.account_id}"
  lifecycle { prevent_destroy = true }
}
resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id
  versioning_configuration { status = "Enabled" }
}
resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}
resource "aws_s3_bucket_public_access_block" "state" {
  bucket                  = aws_s3_bucket.state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
resource "aws_s3_bucket_policy" "state" {
  bucket = aws_s3_bucket.state.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Deny", Principal = "*", Action = "s3:*", Resource = [aws_s3_bucket.state.arn, "${aws_s3_bucket.state.arn}/*"], Condition = { Bool = { "aws:SecureTransport" = "false" } } }] })
}
resource "aws_iam_openid_connect_provider" "github" {
  count          = var.existing_github_oidc_provider_arn == "" ? 1 : 0
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}
locals {
  oidc_arn = var.existing_github_oidc_provider_arn != "" ? var.existing_github_oidc_provider_arn : aws_iam_openid_connect_provider.github[0].arn
  account  = data.aws_caller_identity.current.account_id
}
resource "aws_iam_role" "github" {
  for_each = toset(["aws-production", "aws-infrastructure-production"])
  name     = "${var.project}-github-${each.key}"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{
    Effect = "Allow", Principal = { Federated = local.oidc_arn }, Action = "sts:AssumeRoleWithWebIdentity",
    Condition = { StringEquals = {
      "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com",
      "token.actions.githubusercontent.com:sub" = "repo:${var.github_repository}:environment:${each.key}"
      }
    }
  }] })
}
resource "aws_iam_role_policy" "deploy" {
  role = aws_iam_role.github["aws-production"].id
  policy = jsonencode({ Version = "2012-10-17", Statement = [
    { Effect = "Allow", Action = ["ecr:GetAuthorizationToken"], Resource = "*" },
    { Effect = "Allow", Action = ["ecr:BatchCheckLayerAvailability", "ecr:GetDownloadUrlForLayer", "ecr:BatchGetImage", "ecr:CompleteLayerUpload", "ecr:UploadLayerPart", "ecr:InitiateLayerUpload", "ecr:PutImage", "ecr:DescribeImages"], Resource = "arn:aws:ecr:*:${local.account}:repository/${var.project}" },
    { Effect = "Allow", Action = ["ecs:DescribeServices", "ecs:UpdateService"], Resource = "arn:aws:ecs:*:${local.account}:service/${var.project}-*/*" },
    { Effect = "Allow", Action = ["ecs:RegisterTaskDefinition", "ecs:DescribeTaskDefinition", "ecs:TagResource"], Resource = "*" },
    { Effect = "Allow", Action = ["iam:PassRole"], Resource = "arn:aws:iam::${local.account}:role/${var.project}-runtime-*", Condition = { StringEquals = { "iam:PassedToService" = "ecs-tasks.amazonaws.com" } } },
    { Effect = "Allow", Action = ["s3:ListBucket"], Resource = "arn:aws:s3:::${var.project}-assets-${local.account}*" },
    { Effect = "Allow", Action = ["s3:PutObject", "s3:GetObject"], Resource = "arn:aws:s3:::${var.project}-assets-${local.account}*/_next/static/*" }
  ] })
}
# Use a dedicated production account. Infrastructure creation needs account-level
# network/control-plane permissions; app release credentials have the narrower policy above.
resource "aws_iam_role_policy" "infrastructure" {
  role = aws_iam_role.github["aws-infrastructure-production"].id
  policy = jsonencode({ Version = "2012-10-17", Statement = [
    { Effect = "Allow", Action = ["ec2:*", "elasticloadbalancing:*", "ecs:*", "ecr:*", "application-autoscaling:*", "cloudwatch:*", "logs:*", "acm:*", "route53:*", "wafv2:*", "cloudfront:*", "sns:*", "s3:*"], Resource = "*" },
    { Effect = "Allow", Action = ["secretsmanager:CreateSecret", "secretsmanager:DescribeSecret", "secretsmanager:UpdateSecret", "secretsmanager:TagResource", "secretsmanager:UntagResource", "secretsmanager:DeleteSecret", "secretsmanager:GetResourcePolicy"], Resource = "arn:aws:secretsmanager:*:${local.account}:secret:${var.project}/*" },
    { Effect = "Allow", Action = ["iam:CreateRole", "iam:GetRole", "iam:UpdateAssumeRolePolicy", "iam:DeleteRole", "iam:TagRole", "iam:UntagRole", "iam:ListRolePolicies", "iam:ListAttachedRolePolicies", "iam:ListInstanceProfilesForRole", "iam:GetRolePolicy", "iam:PutRolePolicy", "iam:DeleteRolePolicy", "iam:AttachRolePolicy", "iam:DetachRolePolicy", "iam:PassRole"], Resource = "arn:aws:iam::${local.account}:role/${var.project}-runtime-*" },
    { Effect = "Allow", Action = ["iam:CreateServiceLinkedRole"], Resource = "arn:aws:iam::${local.account}:role/aws-service-role/*", Condition = { StringLike = { "iam:AWSServiceName" = ["ecs.amazonaws.com", "ecs.application-autoscaling.amazonaws.com", "elasticloadbalancing.amazonaws.com"] } } }
  ] })
}
output "state_bucket" { value = aws_s3_bucket.state.id }
output "deploy_role_arn" { value = aws_iam_role.github["aws-production"].arn }
output "infrastructure_role_arn" { value = aws_iam_role.github["aws-infrastructure-production"].arn }

data "aws_caller_identity" "current" { provider = aws.primary }
resource "aws_s3_bucket" "assets" {
  provider = aws.primary
  bucket   = "${var.project}-assets-${data.aws_caller_identity.current.account_id}"
  lifecycle { prevent_destroy = true }
}
resource "aws_s3_bucket_public_access_block" "assets" {
  provider                = aws.primary
  bucket                  = aws_s3_bucket.assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  provider = aws.primary
  bucket   = aws_s3_bucket.assets.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}
resource "aws_s3_bucket_versioning" "assets" {
  provider = aws.primary
  bucket   = aws_s3_bucket.assets.id
  versioning_configuration { status = "Enabled" }
}
resource "aws_cloudfront_origin_access_control" "assets" {
  provider                          = aws.primary
  name                              = "${var.project}-assets"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
resource "aws_cloudfront_distribution" "assets" {
  provider        = aws.primary
  enabled         = true
  is_ipv6_enabled = true
  comment         = "Shared immutable Next.js chunks for all regions and retained releases"
  origin {
    domain_name              = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id                = "assets"
    origin_access_control_id = aws_cloudfront_origin_access_control.assets.id
  }
  origin {
    domain_name              = aws_s3_bucket.assets_secondary.bucket_regional_domain_name
    origin_id                = "assets-secondary"
    origin_access_control_id = aws_cloudfront_origin_access_control.assets.id
  }
  origin_group {
    origin_id = "regional-assets"
    failover_criteria { status_codes = [403, 404, 500, 502, 503, 504] }
    member { origin_id = "assets" }
    member { origin_id = "assets-secondary" }
  }
  default_cache_behavior {
    target_origin_id           = "regional-assets"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.assets.id
  }
  restrictions {
    geo_restriction { restriction_type = "none" }
  }
  viewer_certificate { cloudfront_default_certificate = true }
}
resource "aws_cloudfront_response_headers_policy" "assets" {
  provider = aws.primary
  name     = "${var.project}-assets"
  cors_config {
    access_control_allow_credentials = false
    access_control_allow_headers { items = ["*"] }
    access_control_allow_methods { items = ["GET", "HEAD", "OPTIONS"] }
    access_control_allow_origins { items = ["https://${var.hostname}"] }
    origin_override = true
  }
  security_headers_config {
    content_type_options { override = true }
    strict_transport_security {
      access_control_max_age_sec = 31536000
      override                   = true
    }
  }
}
resource "aws_s3_bucket_policy" "assets" {
  provider = aws.primary
  bucket   = aws_s3_bucket.assets.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [
    { Effect = "Allow", Principal = { Service = "cloudfront.amazonaws.com" }, Action = "s3:GetObject", Resource = "${aws_s3_bucket.assets.arn}/*", Condition = { StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.assets.arn } } },
    { Effect = "Deny", Principal = "*", Action = "s3:*", Resource = [aws_s3_bucket.assets.arn, "${aws_s3_bucket.assets.arn}/*"], Condition = { Bool = { "aws:SecureTransport" = "false" } } }
  ] })
}

resource "aws_s3_bucket" "assets_secondary" {
  provider = aws.secondary
  bucket   = "${var.project}-assets-${data.aws_caller_identity.current.account_id}-${var.secondary_region}"
  lifecycle { prevent_destroy = true }
}
resource "aws_s3_bucket_public_access_block" "assets_secondary" {
  provider                = aws.secondary
  bucket                  = aws_s3_bucket.assets_secondary.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
resource "aws_s3_bucket_server_side_encryption_configuration" "assets_secondary" {
  provider = aws.secondary
  bucket   = aws_s3_bucket.assets_secondary.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}
resource "aws_s3_bucket_versioning" "assets_secondary" {
  provider = aws.secondary
  bucket   = aws_s3_bucket.assets_secondary.id
  versioning_configuration { status = "Enabled" }
}
resource "aws_s3_bucket_policy" "assets_secondary" {
  provider = aws.secondary
  bucket   = aws_s3_bucket.assets_secondary.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [
    { Effect = "Allow", Principal = { Service = "cloudfront.amazonaws.com" }, Action = "s3:GetObject", Resource = "${aws_s3_bucket.assets_secondary.arn}/*", Condition = { StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.assets.arn } } },
    { Effect = "Deny", Principal = "*", Action = "s3:*", Resource = [aws_s3_bucket.assets_secondary.arn, "${aws_s3_bucket.assets_secondary.arn}/*"], Condition = { Bool = { "aws:SecureTransport" = "false" } } }
  ] })
}

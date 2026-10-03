module "primary" {
  source                        = "./modules/region"
  providers                     = { aws = aws.primary }
  project                       = var.project
  region                        = var.primary_region
  cidr                          = "10.40.0.0/16"
  manage_shared_certificate_dns = true
  hostname                      = var.hostname
  zone_id                       = var.zone_id
  supabase_url                  = var.supabase_url
  read_url                      = var.primary_read_url
  image_hosts                   = var.image_hosts
  launch_enabled                = var.launch_enabled
  min_capacity                  = var.min_capacity
  max_capacity                  = var.max_capacity
  alarm_email                   = var.alarm_email
}
module "secondary" {
  source                        = "./modules/region"
  providers                     = { aws = aws.secondary }
  project                       = var.project
  region                        = var.secondary_region
  cidr                          = "10.50.0.0/16"
  manage_shared_certificate_dns = false
  hostname                      = var.hostname
  zone_id                       = var.zone_id
  supabase_url                  = var.supabase_url
  read_url                      = var.secondary_read_url
  image_hosts                   = var.image_hosts
  launch_enabled                = var.launch_enabled
  min_capacity                  = var.min_capacity
  max_capacity                  = var.max_capacity
  alarm_email                   = var.alarm_email
}
output "primary" { value = module.primary.release }
output "secondary" { value = module.secondary.release }
output "asset_bucket" { value = aws_s3_bucket.assets.id }
output "asset_prefix" { value = "https://${aws_cloudfront_distribution.assets.domain_name}" }
output "site_url" { value = "https://${var.hostname}" }

output "asset_secondary_bucket" { value = aws_s3_bucket.assets_secondary.id }

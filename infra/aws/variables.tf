variable "project" {
  type    = string
  default = "cursor-cafe"
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,11}$", var.project))
    error_message = "Use a lowercase project slug of 3-12 characters."
  }
}
variable "primary_region" { default = "ap-southeast-1" }
variable "secondary_region" {
  default = "eu-west-1"
  validation {
    condition     = var.primary_region != var.secondary_region
    error_message = "Primary and secondary regions must differ."
  }
}
variable "zone_id" { type = string }
variable "hostname" { type = string }
variable "supabase_url" { type = string }
variable "primary_read_url" { default = "" }
variable "secondary_read_url" { default = "" }
variable "image_hosts" { default = "" }
variable "launch_enabled" {
  description = "Set true AFTER the first successful image deployment to enable autoscaling."
  default     = false
}
variable "alarm_email" {
  description = "Optional operator email; confirm both regional SNS subscriptions."
  default     = ""
}
variable "min_capacity" {
  default = 2
  validation {
    condition     = var.min_capacity >= 2
    error_message = "Production requires at least two tasks per region."
  }
}
variable "max_capacity" { default = 10 }

terraform {
  required_providers { aws = { source = "hashicorp/aws" } }
}
variable "project" { type = string }
variable "region" { type = string }
variable "cidr" { type = string }
variable "hostname" { type = string }
variable "zone_id" { type = string }
variable "image_hosts" { type = string }
variable "launch_enabled" { type = bool }
variable "min_capacity" { type = number }
variable "max_capacity" { type = number }
variable "alarm_email" { type = string }
locals { name = "${var.project}-${var.region}" }
data "aws_availability_zones" "available" { state = "available" }

variable "manage_shared_certificate_dns" { type = bool }

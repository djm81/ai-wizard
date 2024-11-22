variable "environment" {
  type        = string
  description = "Environment name (dev, test, prod)"
}

variable "domain_name" {
  type        = string
  description = "Domain name for the frontend"
}

variable "frontend_bucket_name" {
  type        = string
  description = "Name of the S3 bucket for frontend hosting"
}

variable "route53_hosted_zone_id" {
  type        = string
  description = "Route53 hosted zone ID"
}

variable "common_tags" {
  type        = map(string)
  description = "Common tags to be applied to all resources"
}

variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "aws_account_id" {
  type        = string
  description = "AWS account ID"
} 
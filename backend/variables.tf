variable "aws_region" {
  description = "The AWS region to deploy to"
  default     = "eu-west-1"
}

variable "db_username" {
  description = "Username for the RDS instance"
}

variable "db_password" {
  description = "Password for the RDS instance"
}

variable "secret_key" {
  description = "Secret key for the application"
}

variable "domain_name" {
  description = "The domain name for the application"
  type        = string
}

variable "route53_zone_id" {
  description = "The Route53 Hosted Zone ID"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API Key"
  type        = string
}
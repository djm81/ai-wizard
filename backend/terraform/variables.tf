variable "aws_account_id" {
  description = "The AWS account ID for the deployment"
  type        = string
}

variable "aws_region" {
  description = "The AWS region to deploy to"
  type        = string
}

variable "domain_name" {
  description = "The domain name for the application"
  type        = string
}

variable "route53_hosted_zone_id" {
  description = "The Route53 Hosted Zone ID"
  type        = string
}

variable "environment" {
  description = "The deployment environment (e.g., dev, test, prod)"
  type        = string
}

# New variables for Zappa and DynamoDB
variable "zappa_deployments_bucket_name" {
  description = "The name of the S3 bucket for Zappa deployments"
  type        = string
}

variable "dynamodb_table_name" {
  description = "The name of the DynamoDB table"
  type        = string
}

variable "lambda_source_code_hash" {
  description = "Base64-encoded SHA256 hash of the Lambda function source code"
  type        = string
}

variable "frontend_bucket_name" {
  description = "The name of the S3 bucket for frontend hosting"
  type        = string
}

variable "database_url" {
  description = "Database URL"
  type        = string
  sensitive   = true
}

# Add any other variables you might need

variable "stages" {
  description = "List of stages to deploy"
  type        = list(string)
  default     = ["dev", "test", "prod"]
}

variable "lambda_function_name_prefix" {
  description = "Prefix for Lambda function names"
  type        = string
  default     = "ai-wizard-backend"
}

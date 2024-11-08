variable "aws_account_id" {
  description = "The AWS account ID for the deployment"
  type        = string
}

variable "aws_region" {
  description = "The AWS region to deploy to"
  type        = string
}

variable "domain_name" {
  description = "The domain name for the application (e.g., dev.ai-wizard.apps.noldmedia.com)"
  type        = string
}

variable "route53_hosted_zone_id" {
  description = "The Route53 Hosted Zone ID for DNS management"
  type        = string
}

variable "environment" {
  description = "The deployment environment (dev, test, or prod)"
  type        = string
  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, prod."
  }
}

variable "zappa_deployments_bucket_name" {
  description = "The name prefix of the S3 bucket for Zappa deployments (will be suffixed with environment)"
  type        = string
}

variable "dynamodb_table_name" {
  description = "The name prefix of the DynamoDB table (will be suffixed with environment)"
  type        = string
}

variable "lambda_source_code_hash" {
  description = "Base64-encoded SHA256 hash of the Lambda function source code package"
  type        = string
}

variable "frontend_bucket_name" {
  description = "The name prefix of the S3 bucket for frontend hosting (will be suffixed with environment)"
  type        = string
}

variable "database_url" {
  description = "The PostgreSQL database connection URL"
  type        = string
  sensitive   = true
}

variable "lambda_function_name_prefix" {
  description = "Prefix for Lambda function names (will be suffixed with environment)"
  type        = string
  default     = "ai-wizard-backend"
}

variable "aws_region" {
  type        = string
  description = "AWS region"
}

variable "aws_account_id" {
  type        = string
  description = "AWS account ID"
}

variable "domain_name" {
  type        = string
  description = "Domain name for the application"
}

variable "route53_hosted_zone_id" {
  type        = string
  description = "Route53 hosted zone ID"
}

variable "frontend_bucket_name" {
  type        = string
  description = "Name of the S3 bucket for frontend hosting"
}

variable "lambda_function_name_prefix" {
  type        = string
  description = "Prefix for Lambda function names"
}

variable "dynamodb_table_name" {
  type        = string
  description = "Base name for the DynamoDB table"
}

variable "database_url" {
  type        = string
  description = "Database connection URL"
}

variable "lambda_source_code_hash" {
  type        = string
  description = "Base64-encoded SHA256 hash of the Lambda function source code package"
}

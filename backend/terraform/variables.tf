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
  description = "The deployment environment (e.g., dev, test, qual, prod)"
  type        = string
}

# New variables for Zappa and DynamoDB
variable "zappa_deployments_bucket_name" {
  description = "The name of the S3 bucket for Zappa deployments"
  type        = string
  default     = "ai-wizard-zappa-deployments"
}

variable "dynamodb_table_name" {
  description = "The name of the DynamoDB table"
  type        = string
  default     = "ai-wizard-table"
}

variable "lambda_function_name" {
  description = "The name of the Lambda function"
  type        = string
  default     = "ai-wizard-lambda"
}

variable "frontend_bucket_name" {
  description = "The name of the S3 bucket for frontend hosting"
  type        = string
  default     = "ai-wizard-frontend"
}

variable "openai_api_key" {
  description = "OpenAI API Key"
  type        = string
  sensitive   = true
}

variable "database_url" {
  description = "Database URL"
  type        = string
  default     = "memory:///"
}

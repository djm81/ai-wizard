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
  description = "The deployment environment (e.g., dev, staging, prod)"
  type        = string
  default     = "prod"
}

# New variables for Zappa and DynamoDB
variable "zappa_deployments_bucket_name" {
  description = "The name of the S3 bucket for Zappa deployments"
  type        = string
  default     = "ai-wizard-zappa-deployments-${aws_region}"
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
  default     = "ai-wizard-frontend-${aws_region}"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, test, prod)"
}

variable "domain_name" {
  type        = string
  description = "Domain name for the backend API"
}

variable "lambda_function_name_prefix" {
  type        = string
  description = "Prefix for Lambda function names"
}

variable "lambda_source_code_hash" {
  type        = string
  description = "Base64-encoded SHA256 hash of the Lambda function source code package"
}

variable "database_url" {
  type        = string
  description = "Database connection URL"
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

variable "cloudwatch_retention_days" {
  type        = number
  description = "Number of days to retain CloudWatch logs"
  default     = 14
}

variable "api_gateway_throttling_burst_limit" {
  type        = number
  description = "API Gateway throttling burst limit"
  default     = 100
}

variable "api_gateway_throttling_rate_limit" {
  type        = number
  description = "API Gateway throttling rate limit"
  default     = 50
}

variable "lambda_memory_size" {
  type        = number
  description = "Amount of memory in MB for the Lambda function"
  default     = 128
}

variable "lambda_timeout" {
  type        = number
  description = "Lambda function timeout in seconds"
  default     = 30
} 
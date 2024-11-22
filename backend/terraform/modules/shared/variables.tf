variable "environment" {
  type        = string
  description = "Environment name (dev, test, prod)"
}

variable "dynamodb_table_name" {
  type        = string
  description = "Base name for the DynamoDB table"
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
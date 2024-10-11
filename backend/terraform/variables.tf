variable "aws_region" {
  description = "The AWS region to deploy to"
  type        = string
}

variable "postgres_db_username" {
  description = "Username for the RDS instance"
  type        = string
  sensitive   = true
}

variable "postgres_db_password" {
  description = "Password for the RDS instance"
  type        = string
  sensitive   = true
}

variable "db_secret_key" {
  description = "Database secret key for the application"
  type        = string
  sensitive   = true
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
  sensitive   = true
}

variable "environment" {
  description = "The deployment environment (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "ecs_task_cpu" {
  description = "The amount of CPU to allocate for the ECS task"
  type        = number
  default     = 256
}

variable "ecs_task_memory" {
  description = "The amount of memory to allocate for the ECS task"
  type        = number
  default     = 512
}
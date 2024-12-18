variable "environment" {
  type        = string
  description = "Environment name (e.g., dev, staging, prod)"
}

variable "common_tags" {
  type        = map(string)
  description = "Common tags to be applied to all resources"
}

variable "log_retention_days" {
  type        = number
  description = "Number of days to retain logs"
  default     = 30
}

variable "opensearch_instance_type" {
  type        = string
  description = "OpenSearch instance type"
  default     = "t3.small.search"
}

variable "opensearch_volume_size" {
  type        = number
  description = "Size of the EBS volume in GB"
  default     = 10
}

variable "vpc_id" {
  type        = string
  description = "VPC ID where OpenSearch will be deployed"
}

variable "subnet_ids" {
  type        = list(string)
  description = "List of subnet IDs for OpenSearch VPC configuration"
}

variable "allowed_cidr_blocks" {
  type        = list(string)
  description = "List of CIDR blocks allowed to access OpenSearch"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  type        = list(string)
  description = "List of availability zones to use"
  default     = ["eu-west-1a", "eu-west-1b"] # Adjust based on your region
}

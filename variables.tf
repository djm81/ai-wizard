variable "aws_region" {
  description = "The AWS region to deploy to"
  default     = "eu-west-1"  # Changed from us-west-2 to eu-west-1
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
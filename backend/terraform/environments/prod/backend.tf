terraform {
  backend "s3" {
    /* Will be filled in dynamically by CI/CD pipeline */
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.72"
    }
  }
  required_version = ">= 1.0.0"
} 
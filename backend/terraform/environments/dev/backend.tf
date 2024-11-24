terraform {
  backend "s3" {
    /* Will be filled in dynamically by CI/CD pipeline */
  }

  required_version = ">= 1.0.0"
} 
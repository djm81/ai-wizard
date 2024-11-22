provider "aws" {
  region = var.aws_region
  alias  = "assume_role"
  assume_role {
    role_arn = "arn:aws:iam::${var.aws_account_id}:role/AIWizardDeploymentRole"
  }
}

provider "aws" {
  region = "us-east-1"
  alias  = "assume_role_us_east_1"
  assume_role {
    role_arn = "arn:aws:iam::${var.aws_account_id}:role/AIWizardDeploymentRole"
  }
}

locals {
  environment = "prod"
  common_tags = {
    Project     = "ai-wizard"
    ManagedBy   = "Terraform"
    Environment = local.environment
  }
}

module "shared" {
  source = "../../modules/shared"

  environment         = local.environment
  dynamodb_table_name = var.dynamodb_table_name
  common_tags        = local.common_tags
  aws_region         = var.aws_region
  aws_account_id     = var.aws_account_id

  providers = {
    aws.assume_role = aws.assume_role
  }
}

module "backend" {
  source = "../../modules/backend"

  environment                = local.environment
  domain_name               = var.domain_name
  lambda_function_name_prefix = var.lambda_function_name_prefix
  lambda_source_code_hash   = var.lambda_source_code_hash
  database_url             = var.database_url
  route53_hosted_zone_id   = var.route53_hosted_zone_id
  common_tags             = local.common_tags
  aws_region              = var.aws_region
  aws_account_id          = var.aws_account_id

  providers = {
    aws.assume_role = aws.assume_role
  }

  depends_on = [module.shared]
}

module "frontend" {
  source = "../../modules/frontend"

  environment          = local.environment
  domain_name         = var.domain_name
  frontend_bucket_name = var.frontend_bucket_name
  route53_hosted_zone_id = var.route53_hosted_zone_id
  common_tags         = local.common_tags
  aws_region          = var.aws_region
  aws_account_id      = var.aws_account_id

  providers = {
    aws.assume_role = aws.assume_role
    aws.assume_role_us_east_1 = aws.assume_role_us_east_1
  }
} 
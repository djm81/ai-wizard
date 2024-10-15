# Remove or comment out the aws_region line, as it will be provided by the GitHub variable
aws_account_id     = "720534672987"
aws_region         = "eu-west-1"

environment        = "production"
vpc_cidr           = "10.0.0.0/16"
ecs_task_cpu       = 256
ecs_task_memory    = 512
domain_name        = "ai-wizard.noldmedia.com"
route53_zone_id    = "Z1KTU6QAAHBQNV"
ecr_image_tag      = "latest"

# The following variables should be set via environment variables or a secure secret management system
postgres_db_username = "aiwizard"
postgres_db_password = "your-secure-password"
openai_api_key       = "your-openai-api-key"
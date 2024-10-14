terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.0.0"

  backend "s3" {
    /* Will be filled in dynamically by CI/CD pipeline */
  }
}

provider "aws" {
  region = var.aws_region
  alias  = "assume_role"
  assume_role {
    role_arn = "arn:aws:iam::${var.aws_account_id}:role/AIWizardDeploymentRole"
  }
}

locals {
  common_tags = {
    Project     = "ai-wizard"
    ManagedBy   = "Terraform"
    Environment = var.environment
  }
}

# VPC and Networking
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 3.0"

  providers = {
    aws = aws.assume_role  # Use the assume_role provider
  }

  name = "ai-wizard-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = merge(local.common_tags, {
    Name = "ai-wizard-vpc"
  })
}

# ECR Repository
resource "aws_ecr_repository" "ai_wizard" {
  provider = aws.assume_role  # Use the assume_role provider
  name                 = "ai-wizard"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(local.common_tags, {
    Name = "ai-wizard-ecr"
  })
}

# ECS Cluster
resource "aws_ecs_cluster" "ai_wizard" {
  provider = aws.assume_role  # Use the assume_role provider
  name = "ai-wizard-cluster"

  tags = merge(local.common_tags, {
    Name = "ai-wizard-cluster"
  })
}

# ECS Task Execution Role
resource "aws_iam_role" "ecs_task_execution_role" {
  provider = aws.assume_role  # Use the assume_role provider
  name = "ai-wizard-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "ai-wizard-ecs-task-execution-role"
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  provider = aws.assume_role  # Use the assume_role provider
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Generate a random string for SECRET_KEY
resource "random_string" "secret_key" {
  length  = 32
  special = true
}

# Store the SECRET_KEY in AWS Secrets Manager
resource "aws_secretsmanager_secret" "app_secrets" {
  provider = aws.assume_role  # Use the assume_role provider
  # Name = "ai-wizard-app-secrets-${var.environment}"
  tags = merge(local.common_tags, {
    Name = "ai-wizard-app-secrets-${var.environment}"
  })
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  provider = aws.assume_role  # Use the assume_role provider
  secret_id     = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    SECRET_KEY = random_string.secret_key.result  # Use the generated secret key
    OPENAI_API_KEY = var.openai_api_key
  })
}

# ECS Task Definition
resource "aws_ecs_task_definition" "ai_wizard" {
  provider = aws.assume_role  # Use the assume_role provider
  family                   = "ai-wizard"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "ai-wizard"
      image = "${aws_ecr_repository.ai_wizard.repository_url}:${var.ecr_image_tag}"
      cpu   = 256
      memory = 512
      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
        }
      ]
      essential = true
      secrets = [
        {
          name      = "SECRET_KEY"
          valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:SECRET_KEY::"
        },
        {
          name      = "OPENAI_API_KEY"
          valueFrom = "${aws_secretsmanager_secret.app_secrets.arn}:OPENAI_API_KEY::"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ai_wizard.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = merge(local.common_tags, {
    Name = "ai-wizard-task-definition"
  })
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ai_wizard" {
  provider = aws.assume_role  # Use the assume_role provider
  name              = "/ecs/ai-wizard"
  retention_in_days = 14

  tags = merge(local.common_tags, {
    Name = "ai-wizard-log-group"
  })
}

# ACM Certificate
resource "aws_acm_certificate" "ai_wizard" {
  provider = aws.assume_role
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(local.common_tags, {
    Name = "ai-wizard-acm-certificate"
  })
}

# Route53 record for ACM validation
resource "aws_route53_record" "acm_validation" {
  provider = aws.assume_role
  for_each = {
    for dvo in aws_acm_certificate.ai_wizard.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.route53_zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "ai_wizard" {
  provider                = aws.assume_role
  certificate_arn         = aws_acm_certificate.ai_wizard.arn
  validation_record_fqdns = [for record in aws_route53_record.acm_validation : record.fqdn]
}

# Application Load Balancer
resource "aws_lb" "ai_wizard" {
  provider = aws.assume_role
  name               = "ai-wizard-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = slice(module.vpc.public_subnets, 0, 2)

  depends_on = [module.vpc]

  tags = merge(local.common_tags, {
    Name = "ai-wizard-alb"
  })
}

resource "aws_lb_target_group" "ai_wizard" {
  provider = aws.assume_role  # Use the assume_role provider
  name        = "ai-wizard-tg"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 10
    timeout             = 60
    interval            = 300
    matcher             = "200"
  }

  tags = merge(local.common_tags, {
    Name = "ai-wizard-target-group"
  })
}

resource "aws_lb_listener" "https" {
  provider = aws.assume_role
  load_balancer_arn = aws_lb.ai_wizard.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.ai_wizard.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ai_wizard.arn
  }

  depends_on = [aws_acm_certificate.ai_wizard, aws_lb_target_group.ai_wizard]
  
  tags = merge(local.common_tags, {
    Name = "ai-wizard-https-listener"
  })
}

resource "aws_lb_listener" "http_redirect" {
  provider = aws.assume_role  # Use the assume_role provider
  load_balancer_arn = aws_lb.ai_wizard.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }

  tags = merge(local.common_tags, {
    Name = "ai-wizard-http-redirect-listener"
  })
}

# ECS Service
resource "aws_ecs_service" "ai_wizard" {
  provider = aws.assume_role
  name            = "ai-wizard-service"
  cluster         = aws_ecs_cluster.ai_wizard.id
  task_definition = aws_ecs_task_definition.ai_wizard.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ai_wizard.arn
    container_name   = "ai-wizard"
    container_port   = 8000
  }

  depends_on = [aws_lb_listener.https, aws_iam_role_policy_attachment.ecs_task_execution_role_policy]

  tags = merge(local.common_tags, {
    Name = "ai-wizard-service"
  })
}

# Security Groups
resource "aws_security_group" "alb" {
  provider = aws.assume_role  # Use the assume_role provider
  name        = "ai-wizard-alb-sg"
  description = "Controls access to the ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "ai-wizard-alb-sg"
  })
}

resource "aws_security_group" "ecs_tasks" {
  provider = aws.assume_role  # Use the assume_role provider
  name        = "ai-wizard-ecs-tasks-sg"
  description = "Allow inbound access from the ALB only"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "ai-wizard-ecs-tasks-sg"
  })
}

# Route53 record for the application
resource "aws_route53_record" "ai_wizard" {
  provider = aws.assume_role
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.ai_wizard.dns_name
    zone_id                = aws_lb.ai_wizard.zone_id
    evaluate_target_health = true
  }

  depends_on = [aws_lb.ai_wizard]
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  provider = aws.assume_role  # Use the assume_role provider
  alarm_name          = "ai-wizard-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 70
  alarm_description   = "Alarm when CPU exceeds 70% for 5 minutes"
  alarm_actions       = [aws_sns_topic.ai_wizard_alerts.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.ai_wizard.name
    ServiceName = aws_ecs_service.ai_wizard.name
  }

  tags = merge(local.common_tags, {
    Name = "ai-wizard-high-cpu-alarm"
  })
}

resource "aws_cloudwatch_metric_alarm" "memory_high" {
  provider = aws.assume_role  # Use the assume_role provider
  alarm_name          = "ai-wizard-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 70
  alarm_description   = "Alarm when memory exceeds 70% for 5 minutes"
  alarm_actions       = [aws_sns_topic.ai_wizard_alerts.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.ai_wizard.name
    ServiceName = aws_ecs_service.ai_wizard.name
  }

  tags = merge(local.common_tags, {
    Name = "ai-wizard-high-memory-alarm"
  })
}

# SNS Topic for Alerts
resource "aws_sns_topic" "ai_wizard_alerts" {
  provider = aws.assume_role  # Use the assume_role provider
  name = "ai-wizard-alerts"

  tags = merge(local.common_tags, {
    Name = "ai-wizard-alerts-sns-topic"
  })
}

# RDS Instance
resource "aws_db_instance" "ai_wizard" {
  provider = aws.assume_role  # Use the assume_role provider
  identifier           = "ai-wizard-db"
  engine               = "postgres"
  engine_version       = "13.7"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  storage_type         = "gp2"
  db_name              = "aiwizard"
  username             = var.postgres_db_username
  password             = var.postgres_db_password
  publicly_accessible  = false
  skip_final_snapshot  = true
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name = aws_db_subnet_group.ai_wizard.name

  tags = merge(local.common_tags, {
    Name = "ai-wizard-db"
  })
}

# DB Subnet Group
resource "aws_db_subnet_group" "ai_wizard" {
  provider = aws.assume_role  # Use the assume_role provider
  name       = "ai-wizard-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = merge(local.common_tags, {
    Name = "ai-wizard-db-subnet-group"
  })
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  provider = aws.assume_role  # Use the assume_role provider
  name        = "ai-wizard-rds-sg"
  description = "Allow inbound access from ECS tasks only"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  tags = merge(local.common_tags, {
    Name = "ai-wizard-rds-sg"
  })
}

# Outputs
output "alb_dns_name" {
  value = aws_lb.ai_wizard.dns_name
}

output "ecr_repository_url" {
  value = aws_ecr_repository.ai_wizard.repository_url
}

output "rds_endpoint" {
  value = aws_db_instance.ai_wizard.endpoint
}

# AWS Secrets Manager - for database credentials
resource "aws_secretsmanager_secret" "db_credentials" {
  provider = aws.assume_role  # Use the assume_role provider
  name = "ai-wizard-db-credentials"
  
  tags = merge(local.common_tags, {
    Name = "ai-wizard-db-credentials"
  })
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  provider = aws.assume_role  # Use the assume_role provider
  secret_id     = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.postgres_db_username
    password = var.postgres_db_password
    db_secret_key = random_string.secret_key.result  # Use the generated secret key
  })
}

# AWS Systems Manager Parameter Store - for other application secrets
resource "aws_ssm_parameter" "openai_api_key" {
  provider = aws.assume_role  # Use the assume_role provider
  name  = "/ai-wizard/openai-api-key"
  type  = "SecureString"
  value = var.openai_api_key

  tags = merge(local.common_tags, {
    Name = "ai-wizard-openai-api-key"
  })
}

resource "aws_ssm_parameter" "db_secret_key" {
  provider = aws.assume_role  # Use the assume_role provider
  name  = "/ai-wizard/db-secret-key"
  type  = "SecureString"
  value = random_string.secret_key.result  # Use the generated secret key

  tags = merge(local.common_tags, {
    Name = "ai-wizard-db-secret-key"
  })
}

# Update the ECS task execution role to allow access to the secrets
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy_secrets" {
  provider = aws.assume_role  # Use the assume_role provider
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy_ssm" {
  provider = aws.assume_role  # Use the assume_role provider
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
}

# Ensure the ECS task role has permission to read the secret
resource "aws_iam_role_policy_attachment" "ecs_task_secrets_manager" {
  provider = aws.assume_role  # Use the assume_role provider
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
}
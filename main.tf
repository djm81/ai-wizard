provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 3.0"

  name = "ai-wizard-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
}

# ECR Repository
resource "aws_ecr_repository" "ai_wizard" {
  name = "ai-wizard"
}

# ECS Cluster
resource "aws_ecs_cluster" "ai_wizard" {
  name = "ai-wizard-cluster"
}

# ECS Task Definition
resource "aws_ecs_task_definition" "ai_wizard" {
  family                   = "ai-wizard"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name  = "ai-wizard"
      image = "${aws_ecr_repository.ai_wizard.repository_url}:latest"
      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
        }
      ]
      environment = [
        {
          name  = "DATABASE_URL"
          value = "postgresql://${aws_db_instance.ai_wizard.username}:${aws_db_instance.ai_wizard.password}@${aws_db_instance.ai_wizard.endpoint}/${aws_db_instance.ai_wizard.name}"
        },
        {
          name  = "SECRET_KEY"
          value = aws_ssm_parameter.secret_key.value
        }
      ]
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "ai_wizard" {
  name            = "ai-wizard-service"
  cluster         = aws_ecs_cluster.ai_wizard.id
  task_definition = aws_ecs_task_definition.ai_wizard.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ai_wizard.arn
    container_name   = "ai-wizard"
    container_port   = 8000
  }
}

# RDS Instance
resource "aws_db_instance" "ai_wizard" {
  identifier           = "ai-wizard-db"
  engine               = "postgres"
  engine_version       = "13.7"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  storage_type         = "gp2"
  username             = var.db_username
  password             = var.db_password
  publicly_accessible  = false
  skip_final_snapshot  = true
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name = aws_db_subnet_group.ai_wizard.name
}

# DB Subnet Group
resource "aws_db_subnet_group" "ai_wizard" {
  name       = "ai-wizard-db-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

# Application Load Balancer
resource "aws_lb" "ai_wizard" {
  name               = "ai-wizard-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets
}

resource "aws_lb_target_group" "ai_wizard" {
  name        = "ai-wizard-tg"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"
}

resource "aws_lb_listener" "ai_wizard" {
  load_balancer_arn = aws_lb.ai_wizard.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ai_wizard.arn
  }
}

# Security Groups
resource "aws_security_group" "alb" {
  name        = "ai-wizard-alb-sg"
  description = "Controls access to the ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs_tasks" {
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
}

resource "aws_security_group" "rds" {
  name        = "ai-wizard-rds-sg"
  description = "Allow inbound access from ECS tasks only"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# SSM Parameter for Secret Key
resource "aws_ssm_parameter" "secret_key" {
  name  = "/ai-wizard/secret-key"
  type  = "SecureString"
  value = var.secret_key
}

# Outputs
output "alb_dns_name" {
  value = aws_lb.ai_wizard.dns_name
}

output "ecr_repository_url" {
  value = aws_ecr_repository.ai_wizard.repository_url
}
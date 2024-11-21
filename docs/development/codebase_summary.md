# AI Wizard Codebase Summary

## Architecture Overview

### Backend Structure
```mermaid
graph TB
    A[FastAPI Application] --> B[AWS Lambda]
    B --> C[API Gateway]
    C --> D[Route53 DNS]
    D --> E[CloudFront]
    B --> F[DynamoDB]
    B --> G[S3 Buckets]

    subgraph "Per Stage"
        B
        C
        F
        G
    end
```

### Deployment Architecture
1. **Stages**:
```mermaid
graph LR
    A[Development] --> B[Testing]
    B --> C[Production]

    subgraph "dev"
        A
    end
    subgraph "test"
        B
    end
    subgraph "prod"
        C
    end
```

2. **AWS Resources per Stage**:
```mermaid
graph TB
    subgraph "Stage Resources"
        A[Lambda Function] --> B[API Gateway]
        A --> C[DynamoDB Tables]
        A --> D[S3 Buckets]
        B --> E[CloudFront]
        E --> F[Route53]
        F --> G[ACM Certificates]
    end
```

## CI/CD Pipeline Flow

```mermaid
graph TB
    subgraph "Test & Build"
        A[Code Changes] --> B[Run Tests]
        B --> C[Build Package]
        C --> D[Upload to S3]
    end

    subgraph "Infrastructure"
        E[Terraform Plan] --> F[Create Resources]
        F --> G[Configure DNS]
    end

    subgraph "Deployment"
        H[Zappa Deploy] --> I[Update Lambda]
        I --> J[Configure API Gateway]
    end

    D --> H
    G --> H
```

## Key Components

### 1. Infrastructure as Code (Terraform)
```mermaid
graph TB
    subgraph "Terraform Resources"
        A[Lambda] --> B[API Gateway]
        A --> C[DynamoDB]
        A --> D[S3]
        B --> E[CloudFront]
        E --> F[Route53]
    end
```

### 2. Serverless Configuration (Zappa)
```yaml
{
    "dev": {
        "aws_region": "eu-west-1",
        "project_name": "ai-wizard",
        "lambda_name": "ai-wizard-backend-dev",
        // Stage-specific settings
    },
    "test": {
        "extends": "dev",
        // Test-specific overrides
    },
    "prod": {
        "extends": "dev",
        "memory_size": 1024,
        // Production-specific overrides
    }
}
```

### 3. CI/CD Workflows

#### Test and Build Flow
```mermaid
graph TB
    A[Push/PR] --> B{Should Run?}
    B -->|Yes| C[Run Tests]
    C --> D[Build Package]
    D --> E[Upload to S3]
    E --> F[Notify Status]
```

#### Deploy Flow
```mermaid
graph TB
    A[Trigger] --> B{Should Deploy?}
    B -->|Yes| C[Plan Infrastructure]
    C --> D[Apply Changes]
    D --> E[Deploy Lambda]
    E --> F[Update DNS]
    F --> G[Notify Status]
```

## Resource Naming Convention
```mermaid
graph TB
    A[Resource Name] --> B[Project Prefix]
    B --> C[Resource Type]
    C --> D[Stage]

    subgraph "Example"
        E[ai-wizard-backend-dev]
    end
```

## Security Model
```mermaid
graph TB
    subgraph "IAM Roles"
        A[Deployment Role] --> B[Lambda Execution Role]
        B --> C[Service Permissions]
    end

    subgraph "Access Control"
        D[API Gateway] --> E[Lambda Authorizer]
        E --> F[JWT Validation]
    end
```

## Environment Management
```mermaid
graph TB
    subgraph "Configuration"
        A[Environment Variables] --> B[Stage Settings]
        B --> C[Resource Config]
    end

    subgraph "Domain Structure"
        D[Production] --> E[domain.com]
        F[Testing] --> G[test.domain.com]
        H[Development] --> I[dev.domain.com]
    end
```

## Related Documentation
- [Deployment Strategy](strategies/deployment_strategy.md)
- [Security Patterns](decisions/security_patterns.md)

## Tags
#architecture #aws #serverless #terraform #zappa #cicd #fastapi #python

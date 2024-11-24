# AI Wizard Codebase Summary

## Architecture Overview

### Infrastructure Modules
```mermaid
graph TB
    subgraph "Terraform Modules"
        direction TB
        
        subgraph "Shared Module"
            S1[VPC & Networking]
            S2[IAM Roles]
            S3[Security Groups]
            S4[Route53 Base]
            S1 --> S2
            S2 --> S3
            S3 --> S4
        end

        subgraph "Backend Module"
            B1[Lambda Function]
            B2[API Gateway]
            B3[DynamoDB]
            B4[CloudWatch]
            B1 --> B2
            B1 --> B3
            B1 --> B4
        end

        subgraph "Frontend Module"
            F1[S3 Bucket]
            F2[CloudFront]
            F3[Route53 Records]
            F4[ACM Certificate]
            F1 --> F2
            F2 --> F3
            F4 --> F2
        end

        S4 --> F3
        S2 --> B1
    end
```

### Deployment Pipeline Flow
```mermaid
graph TB
    subgraph "Infrastructure Deployment"
        S1[Shared Infrastructure] --> B1[Backend Deployment]
        S1 --> F1[Frontend Deployment]
        
        subgraph "Shared Pipeline"
            S1 --> S2[Terraform Validate]
            S2 --> S3[Plan Shared Module]
            S3 --> S4[Apply Shared]
        end

        subgraph "Backend Pipeline"
            B1 --> B2[Run Tests]
            B2 --> B3[Build Lambda]
            B3 --> B4[Plan Backend Module]
            B4 --> B5[Apply Backend]
        end

        subgraph "Frontend Pipeline"
            F1 --> F2[Run Tests]
            F2 --> F3[Build Frontend]
            F3 --> F4[Plan Frontend Module]
            F4 --> F5[Apply Frontend]
            F5 --> F6[Deploy to S3]
            F6 --> F7[Invalidate Cache]
        end
    end
```

### Application Architecture
```mermaid
graph TB
    subgraph "Frontend Components"
        R1[React App]
        R2[Firebase Auth]
        R3[Material UI]
        R4[TypeScript]
        R1 --> R2
        R1 --> R3
        R1 --> R4
    end

    subgraph "Backend Services"
        A1[FastAPI]
        A2[JWT Auth]
        A3[OpenAI Integration]
        A4[SQLAlchemy]
        A1 --> A2
        A1 --> A3
        A1 --> A4
    end

    subgraph "AWS Infrastructure"
        W1[CloudFront]
        W2[API Gateway]
        W3[Lambda]
        W4[DynamoDB]
        W5[S3]
        W1 --> W2
        W2 --> W3
        W3 --> W4
        W3 --> W5
    end

    R1 --> W1
    W2 --> A1
```

## CI/CD Pipeline Dependencies

```mermaid
graph TB
    subgraph "Pipeline Dependencies"
        S1[Shared Infrastructure] --> |Required For| B1[Backend Pipeline]
        S1 --> |Required For| F1[Frontend Pipeline]
        
        B1 --> |Independent| F1
        F1 --> |Independent| B1
        
        subgraph "Validation Steps"
            V1[Terraform Validate]
            V2[Infrastructure Check]
            V3[Dependency Verification]
            V1 --> V2
            V2 --> V3
        end
        
        S1 --> V1
        B1 --> V2
        F1 --> V2
    end
```

## Environment Management
```mermaid
graph TB
    subgraph "Multi-Environment Setup"
        direction TB
        
        subgraph "Development"
            D1[dev.domain.com]
            D2[Lambda dev]
            D3[DynamoDB dev]
        end
        
        subgraph "Testing"
            T1[test.domain.com]
            T2[Lambda test]
            T3[DynamoDB test]
        end
        
        subgraph "Production"
            P1[domain.com]
            P2[Lambda prod]
            P3[DynamoDB prod]
        end
        
        D1 --> T1
        T1 --> P1
        D2 --> T2
        T2 --> P2
        D3 --> T3
        T3 --> P3
    end
```

## Security Model
```mermaid
graph TB
    subgraph "Authentication Flow"
        F1[Firebase Auth] --> |Token| A1[API Gateway]
        A1 --> |Validate| L1[Lambda Authorizer]
        L1 --> |JWT| B1[Backend API]
        B1 --> |Verify| F2[Firebase Admin SDK]
    end

    subgraph "Authorization"
        B1 --> |Role Check| R1[IAM Roles]
        R1 --> |Permissions| S1[AWS Services]
        S1 --> D1[DynamoDB]
        S1 --> S2[S3]
    end
```

## Key Features

### Backend Capabilities
- Enhanced OpenAPI specification
- Improved JWT validation
- Comprehensive test coverage
- Modular FastAPI structure
- Type-safe database operations
- Proper error handling

### Frontend Features
- Modern React with TypeScript
- Material-UI components
- Real-time validation
- Enhanced state management
- Component testing
- Responsive design

### Infrastructure
- Modular Terraform design
- Multi-environment support
- Proper resource tagging
- Security best practices
- State management in S3
- Automated deployments

## Related Documentation
- [Deployment Strategy](strategies/deployment_strategy.md)
- [Security Patterns](decisions/security_patterns.md)
- [Local Development](development/local_setup.md)

## Tags
#architecture #aws #terraform #fastapi #react #typescript #cicd #security

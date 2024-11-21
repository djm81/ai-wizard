# AI Wizard

# Project overview and status
AI Wizard is a rapid application assistant that helps developers quickly prototype and build applications through AI-powered conversations.

## Project Status

The project is currently in active development. The core functionality includes:
- User authentication via Firebase
- Project management with CRUD operations
- AI-powered conversations for requirement gathering
- Code generation through OpenAI integration (GPT-4 Turbo)
- Real-time project collaboration
- Secure API endpoints with JWT authentication

# Recent updates section for changelog tracking
### Recent Updates
- Added comprehensive error handling and loading states
- Implemented Material-UI components for consistent UI/UX
- Added TypeScript support with strict type checking
- Integrated test suites for both frontend and backend
- Added support for project descriptions and metadata
- Implemented secure Firebase authentication flow

# Architecture details for technical documentation
## Architecture Overview

### Frontend
- Single Page Application (SPA) built with React 18 and TypeScript
- Material-UI (MUI) for component design
- Firebase Authentication for user management
- React Router v6 for navigation
- Jest and React Testing Library for testing
- RSBuild for modern build tooling
- Deployed to AWS CloudFront/S3

### Backend
- FastAPI-based REST API with Python 3.12+
- SQLAlchemy ORM with PostgreSQL
- AWS Lambda for serverless execution
- API Gateway for request handling
- OpenAI integration for AI capabilities
- Poetry for dependency management
- Pytest for testing
- Terraform for infrastructure management

## Prerequisites

### Required Accounts
- AWS Account with appropriate permissions
- GitHub Account (for CI/CD)
- Firebase Account (for authentication)
- OpenAI Account (for AI capabilities)

### Development Tools
- Python 3.12+
- Poetry (Python dependency management)
- Node.js 18+ and npm
- AWS CLI v2
- Terraform 1.0.0+

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/dom-ai/ai-wizard.git
   cd ai-wizard
   ```

2. Backend Setup:
   ```bash
   cd backend

   # Install dependencies
   poetry install

   # Create environment file
   cp .env.example .env

   # Set up Firebase credentials
   mkdir -p app/config
   cp path/to/your/firebase-adminsdk.json app/config/
   ```

3. Configure environment variables in `.env`:
   ```
   # Backend Environment Variables
   SECRET_KEY=your_secret_key
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4-turbo-preview
   ALLOWED_ORIGINS=http://localhost:3000
   DATABASE_URL=postgresql://user:password@localhost:5432/ai_wizard
   ```

4. Frontend Setup:
   ```bash
   cd frontend
   npm install

   # Create environment file
   cp .env.example .env
   ```

5. Configure frontend environment variables in `.env`:
   ```
   PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   PUBLIC_API_URL=http://localhost:8000
   ```

## Running Locally

1. Start the backend:
   ```bash
   cd backend
   poetry run uvicorn app.main:app --reload
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Testing

### Backend Tests
```bash
cd backend
poetry run pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Infrastructure Setup

1. Set up AWS deployment role:
   ```bash
   cd backend/aws-setup
   ./setup.sh
   ```

2. Initialize Terraform:
   ```bash
   cd backend/terraform
   terraform init
   ```

3. Apply Terraform configuration:
   ```bash
   terraform apply
   ```

## Environment Variables

### Required for Backend Deployment
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `TF_VAR_AWS_ACCOUNT_ID`
- `TF_VAR_DOMAIN_NAME`
- `TF_VAR_ROUTE53_HOSTED_ZONE_ID`
- `OPENAI_API_KEY`
- `DATABASE_URL`

### Required for Frontend Deployment
- Firebase configuration
- API endpoint configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See LICENSE file for details

## Support

For support, please open an issue in the GitHub repository.

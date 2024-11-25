# AI Wizard

## Project Overview and Status
AI Wizard is a rapid application assistant that helps developers quickly prototype and build applications through AI-powered conversations.

## Project Status

The project is currently in active development with significant improvements:

### Backend Improvements
- Enhanced OpenAPI specification with detailed schema validation
- Improved JWT token validation with proper error handling
- Comprehensive test coverage (>90%)
- Modular FastAPI router structure
- Enhanced error handling and logging
- Type-safe database operations with SQLAlchemy 2.0

### Frontend Enhancements
- Modernized React 18 with TypeScript
- Improved UI/UX with Material-UI components
- Real-time validation and error handling
- Enhanced state management
- Comprehensive component testing
- Responsive design improvements

### Infrastructure Updates
- Modular Terraform architecture
  - Shared infrastructure module (VPC, networking, IAM)
  - Backend module (Lambda, API Gateway, DynamoDB)
  - Frontend module (S3, CloudFront, Route53)
- Enhanced CI/CD pipelines
  - Proper dependency management
  - Infrastructure validation
  - Automated testing
  - Deployment safeguards

## Project Documentation

### Architecture & Implementation
- [Codebase Summary](docs/development/codebase_summary.md) - Detailed architecture diagrams and technical overview
- [Codebase Evaluation](docs/development/codebase_evaluation.md) - Enterprise architecture assessment and roadmap

The codebase evaluation provides:
- Maturity assessment across different domains
- Current strengths and improvement areas
- Recommendations for reaching expert level
- Security and compliance considerations

The codebase summary includes:
- Infrastructure module diagrams
- Deployment pipeline flows
- Application architecture
- Security model visualization
- Environment management details

## Architecture Overview

### Frontend (React/TypeScript)
- React 18 with TypeScript
- Material-UI (MUI) for components
- Firebase Authentication
- React Router v6
- Jest and React Testing Library
- RSBuild for modern build tooling
- AWS CloudFront/S3 deployment

### Backend (FastAPI/Python)
- FastAPI with OpenAPI 3.0 specification
- Enhanced JWT validation
- SQLAlchemy 2.0 ORM
- AWS Lambda deployment
- API Gateway integration
- Comprehensive test suite
- Poetry for dependency management

### Infrastructure (Terraform)
- Modular design
- State management in S3
- Multi-environment support
- Proper resource tagging
- Security best practices

## Local Development

### Prerequisites
- Python 3.12+
- Node.js 20+
- Poetry
- npm
- Docker (optional, for local database)

### Backend Local Setup

```bash
# Clone repository
git clone https://github.com/dom-ai/ai-wizard.git
cd ai-wizard/backend

# Install dependencies
poetry install

# Set up environment
cp .env.example .env

# Configure environment variables
cat > .env << EOL
DATABASE_URL=postgresql://user:password@localhost:5432/ai_wizard
SECRET_KEY=your_local_secret
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4-turbo-preview
ALLOWED_ORIGINS=http://localhost:3000
EOL

# Set up Firebase credentials
mkdir -p app/config
# Copy your Firebase admin SDK JSON file
cp path/to/your/firebase-adminsdk.json app/config/

# Run database migrations
poetry run alembic upgrade head

# Start development server
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Local Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Set environment variables
cat > .env << EOL
PUBLIC_API_URL=http://localhost:8000
PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id
EOL

# Start development server
npm run dev
```

### Local Database Setup

```bash
# Start PostgreSQL with Docker
docker run -d \
  --name ai-wizard-db \
  -e POSTGRES_USER=ai_wizard \
  -e POSTGRES_PASSWORD=local_password \
  -e POSTGRES_DB=ai_wizard \
  -p 5432:5432 \
  postgres:15

# Verify database connection
poetry run python -c "from app.db.database import engine; engine.connect()"
```

### Running Tests

#### Backend Tests
```bash
cd backend

# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=app tests/

# Run specific test file
poetry run pytest tests/services/test_project_service.py

# Run with detailed output
poetry run pytest -v --cov=app --cov-report=term-missing tests/
```

#### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test src/components/ProjectList.test.tsx
```

### API Documentation
- Local Swagger UI: http://localhost:8000/docs
- Local ReDoc: http://localhost:8000/redoc
- OpenAPI Schema: http://localhost:8000/openapi.json

### Development Tools

#### Backend
- FastAPI Debug Toolbar (development only)
- SQLAlchemy Session Debugger
- Alembic for migrations
- pytest-watch for TDD

#### Frontend
- React Developer Tools
- Redux DevTools
- TypeScript compiler in watch mode
- ESLint with TypeScript rules

### Local Development Tips
1. Use `poetry shell` to activate virtual environment
2. Enable hot reload for both frontend and backend
3. Use `.env.local` for local-only settings
4. Keep test database in memory for faster tests
5. Use Firebase Local Emulator for auth testing

### Common Development Tasks

#### Database Migrations
```bash
cd backend

# Create new migration
poetry run alembic revision --autogenerate -m "description"

# Apply migrations
poetry run alembic upgrade head

# Rollback one step
poetry run alembic downgrade -1
```

#### Code Generation
```bash
# Generate TypeScript types from OpenAPI schema
npm run generate-types

# Update OpenAPI schema
poetry run python scripts/update_openapi.py
```

#### Dependency Updates
```bash
# Backend
poetry update

# Frontend
npm update
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Create a Pull Request

### Development Guidelines
- Follow OpenAPI specification for API changes
- Write comprehensive tests
- Use TypeScript strictly
- Follow project's ESLint configuration
- Document infrastructure changes

## Support

For support:
1. Check documentation in `/docs`
2. Open an issue in GitHub repository
3. Review existing issues and discussions

## License

MIT License - See LICENSE file for details

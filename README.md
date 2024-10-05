# AI Wizard

AI Wizard is a rapid application assistant that helps developers quickly prototype and build applications.

## Overview

The application is a Single Page Application (SPA) that interacts with users to collect application specifications, refine requirements through iterative questioning, and ultimately generate the required code, tests, and documentation.

## Frontend Setup

### Prerequisites

- Node.js (v14 or later)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dom-ai/ai-wizard.git
   cd ai-wizard-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Structure

- **Framework**: React.js
- **UI Library**: Material-UI
- **Routing**: React Router
- **State Management**: React's built-in state management

### API Communication

The frontend communicates with the backend API hosted at `http://localhost:8000/api`. Ensure the backend is running to make API calls.

## Backend Setup

### Prerequisites

- Python (v3.9 or later)
- Poetry (for dependency management)

### Installation

1. Navigate to the backend directory:
   ```bash
   cd ai-wizard-backend
   ```

2. Install dependencies:
   ```bash
   poetry install
   ```

3. Copy the example environment file and fill in the required values:
   ```bash
   cp .env.example .env
   ```

4. Run database migrations (if applicable):
   ```bash
   alembic upgrade head
   ```

5. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Backend Structure

- **Framework**: FastAPI
- **Database**: PostgreSQL (or SQLite for development)
- **Authentication**: OAuth2 with JWT tokens
- **Asynchronous Processing**: Celery with Redis (if applicable)

### API Endpoints

The backend provides the following API endpoints:

- **Projects**
  - `GET /api/projects`: Retrieve all projects
  - `POST /api/projects`: Create a new project
  - `PUT /api/projects/{project_id}`: Update a project
  - `DELETE /api/projects/{project_id}`: Delete a project

- **AI Interactions**
  - `GET /api/ai-interactions`: Retrieve all AI interactions
  - `POST /api/ai-interactions`: Create a new AI interaction

## Running Tests

To run tests for both frontend and backend, use the following commands:

### Frontend Tests

```bash
npm test
```

### Backend Tests

```bash
poetry run pytest
```


## Deployment

For deployment, consider using Docker. A Dockerfile is provided for the backend. To build and run the Docker container:

1. Build the Docker image:
   ```bash
   docker build -t ai-wizard-backend .
   ```

2. Run the Docker container:
   ```bash
   docker run -d -p 8000:8000 ai-wizard-backend
   ```

## License

MIT License

Copyright (c) 2024 Dom

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
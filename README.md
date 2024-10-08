# AI Wizard

AI Wizard is a rapid application assistant that helps developers quickly prototype and build applications.

## Overview

The application is a Single Page Application (SPA) that interacts with users to collect application specifications, refine requirements through iterative questioning, and ultimately generate the required code, tests, and documentation.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or later)
- npm (Node Package Manager)
- Python (v3.12 or later)
- Poetry (for Python dependency management)
- Docker (optional, for containerized deployment)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/dom-ai/ai-wizard.git
   cd ai-wizard
   ```

2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

3. Set up the backend:
   ```bash
   cd ../backend
   poetry install
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env` in both the frontend and backend directories
   - Fill in the required values (see "External Services Setup" below)

5. Run database migrations:
   ```bash
   poetry run alembic upgrade head
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   poetry run uvicorn app.main:app --reload
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

The application should now be running at `http://localhost:3000` (frontend) and `http://localhost:8000` (backend API).

## External Services Setup

### Google Firebase and OAuth

1. Create a new project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable the Google sign-in method in the Authentication section.
3. Create a web app in your Firebase project to get the configuration details.
4. In the Google Cloud Console (linked from Firebase), create OAuth 2.0 Client IDs for your application.
5. Add the following to your frontend `.env` file:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   ```

6. Download the Firebase Admin SDK private key JSON file and save it as `app/config/firebase-adminsdk.json` in the backend directory.

### OpenAI API

1. Sign up for an account at [OpenAI](https://openai.com/).
2. Generate an API key in your account dashboard.
3. Add the following to your backend `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

### AWS Setup (for deployment)

1. Create an AWS account if you don't have one.
2. Set up IAM user with necessary permissions for ECR and ECS.
3. Configure AWS CLI with your credentials.
4. Create an ECR repository named `ai-wizard`.
5. Create an ECS cluster named `ai-wizard-cluster`.
6. Create an ECS task definition and service named `ai-wizard-service`.

## Running Tests

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
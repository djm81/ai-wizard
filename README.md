# AI Wizard

AI Wizard is a rapid application assistant that helps developers quickly prototype and build applications.

## Setup

1. Clone the repository
2. Install dependencies: `poetry install`
3. Copy `.env.example` to `.env` and fill in the required values
4. Run database migrations: `alembic upgrade head`
5. Start the server: `uvicorn app.main:app --reload`

## Running Tests

To run tests, use the following command:
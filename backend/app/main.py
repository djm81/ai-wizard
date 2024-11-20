"""main module for AI Wizard backend."""

import time
from pathlib import Path
from typing import Optional

from app.api.router import router
from app.core.config import settings
from app.core.firebase import initialize_firebase
from app.db.database import setup_database
from app.db.init_db import init_db
from app.utils.logging_config import logger
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# Initialize Firebase Admin SDK
initialize_firebase()

# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    openapi_version=settings.OPENAPI_VERSION,
    description=settings.API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Setup database and create tables
setup_database(app)
init_db()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=settings.ALLOW_CREDENTIALS,
    allow_methods=settings.ALLOW_METHODS,
    allow_headers=settings.ALLOW_HEADERS,
    expose_headers=["*"],
    max_age=600,  # Cache preflight requests for 10 minutes
)


# Add logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log request and response details"""
    start_time = time.time()

    # Log request details
    logger.info(f"Request started: {request.method} {request.url}")
    logger.debug(f"Headers: {dict(request.headers)}")

    try:
        response = await call_next(request)

        # Calculate request processing time
        process_time = time.time() - start_time

        # Log response details
        logger.info(
            f"Request completed: {request.method} {request.url} "
            f"- Status: {response.status_code} "
            f"- Duration: {process_time:.3f}s"
        )

        return response
    except Exception as e:
        logger.error(
            f"Request failed: {request.method} {request.url} "
            f"- Error: {str(e)}",
            exc_info=True,
        )
        raise


# Include routers without /api prefix since we're using api.domain.com
app.include_router(router)


@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to the AI Wizard API"}


@app.get("/test-auth")
async def test_auth(request: Request):
    """Test endpoint to verify authorization header handling"""
    auth_header = request.headers.get("Authorization", "")
    logger.info(f"Auth test endpoint accessed")
    logger.debug(
        f"Authorization header present: {'Authorization' in request.headers}"
    )
    return {
        "message": "Auth test endpoint",
        "auth_header_present": bool(auth_header),
        "auth_scheme": auth_header.split()[0]
        if " " in auth_header
        else "No scheme",
    }


def get_host() -> str:
    """Get host based on environment with secure defaults."""
    if settings.ENVIRONMENT == "development":
        # Development only, properly secured with warning
        if settings.ALLOW_ALL_INTERFACES:  # type: ignore
            logger.warning(
                "Binding to all interfaces (0.0.0.0) - "
                "This is only safe in development environments"
            )
            return "0.0.0.0"  # nosec B104
        return "127.0.0.1"
    return "127.0.0.1"  # Restrict in production


def get_allowed_ips() -> Optional[str]:
    """Get allowed IPs configuration based on environment."""
    if settings.ENVIRONMENT == "development" and settings.ALLOW_ALL_INTERFACES:
        return "*"
    return None


if __name__ == "__main__":
    import uvicorn

    # Configure host and port with secure defaults
    host = get_host()
    port = settings.PORT

    # Log binding configuration
    logger.info("Starting server on %s:%d", host, port)
    if host == "0.0.0.0":
        logger.warning(
            "Server is bound to all interfaces - "
            "ensure this is intentional and properly secured"
        )

    uvicorn.run(
        app,
        host=host,
        port=port,
        proxy_headers=True,
        forwarded_allow_ips=get_allowed_ips(),
    )

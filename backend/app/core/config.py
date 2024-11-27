"""config module for AI Wizard backend."""

import json
import os

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

# Determine if we're running in AWS Lambda
IS_LAMBDA = bool(os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
IS_PYTEST = bool(os.getenv("PYTEST_CURRENT_TEST"))

# Default origins for development
DEFAULT_ORIGINS = ["http://localhost:3000"]  # React dev server

# Determine which env file to use for local development
if IS_PYTEST:
    env_file = ".env.test"
    if os.path.exists(".env.test.local"):
        env_file = ".env.test.local"
else:
    env_file = ".env"
    if os.path.exists(".env.local"):
        env_file = ".env.local"


class Settings(BaseSettings):
    """Application settings and configuration"""

    # API Info for FastAPI
    API_TITLE: str = "ai-wizard-backend-api"
    API_VERSION: str = "0.1.0"
    API_DESCRIPTION: str = "AI Wizard Backend API for intelligent assistance"
    OPENAPI_VERSION: str = "3.0.4"

    # Environment
    ENVIRONMENT: str = "dev"
    PORT: int = 8000
    ALLOW_ALL_INTERFACES: bool = False

    # CORS settings - Accept string input and convert to list
    ALLOWED_ORIGINS_STR: str = Field(
        default=",".join(DEFAULT_ORIGINS),
        alias="ALLOWED_ORIGINS",
        description="Comma-separated list of allowed origins"
    )

    ALLOW_CREDENTIALS: bool = True
    ALLOW_METHODS: list[str] = ["*"]
    ALLOW_HEADERS: list[str] = ["*"]

    # Database and Auth
    DATABASE_URL: str = "sqlite:///:memory:"
    SECRET_KEY: SecretStr = SecretStr("fallback_secret_key_for_development")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OpenAI Configuration
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    OPENAI_API_KEY: SecretStr | None = None

    # Logging configuration
    LOG_LEVEL: str = "INFO"
    DEBUG: bool = False

    IS_LAMBDA: bool = IS_LAMBDA
    IS_PYTEST: bool = IS_PYTEST

    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        """Get list of allowed origins."""
        if isinstance(self.ALLOWED_ORIGINS_STR, str):
            return [origin.strip() for origin in str(self.ALLOWED_ORIGINS_STR).split(",")]
        return DEFAULT_ORIGINS

    model_config = SettingsConfigDict(
        env_file=env_file,
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
        env_prefix="",
    )

    def __init__(self, **kwargs):
        """Initialize settings with environment-specific configuration"""
        super().__init__(**kwargs)

        # If running in Lambda, ensure we use environment variables
        if self.IS_LAMBDA:
            if "DATABASE_URL" in os.environ:
                self.DATABASE_URL = os.environ["DATABASE_URL"]
            if "SECRET_KEY" in os.environ:
                self.SECRET_KEY = SecretStr(os.environ["SECRET_KEY"])
            if "OPENAI_MODEL" in os.environ:
                self.OPENAI_MODEL = os.environ["OPENAI_MODEL"]
            if "OPENAI_API_KEY" in os.environ:
                self.OPENAI_API_KEY = SecretStr(os.environ["OPENAI_API_KEY"])
            if "ENVIRONMENT" in os.environ:
                self.ENVIRONMENT = os.environ["ENVIRONMENT"]


# Initialize settings
settings = Settings()

# Log initial configuration
import logging

logger = logging.getLogger("ai-wizard")
logger.info(f"Environment: {settings.ENVIRONMENT}")
logger.info(f"Using env file: {env_file}")
logger.info(f"ALLOWED_ORIGINS: {settings.ALLOWED_ORIGINS}")

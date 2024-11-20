"""config module for AI Wizard backend."""

import os
from typing import List, Optional

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

# Determine if we're running in AWS Lambda
IS_LAMBDA = bool(os.getenv("AWS_LAMBDA_FUNCTION_NAME"))

# Determine which env file to use for local development
env_file = ".env.test" if os.getenv("PYTEST_CURRENT_TEST") else ".env"


class Settings(BaseSettings):
    """Application settings and configuration"""

    # API Info for FastAPI
    API_TITLE: str = "ai-wizard-backend-api"
    API_VERSION: str = "0.1.0"
    API_DESCRIPTION: str = "AI Wizard Backend API for intelligent assistance"
    OPENAPI_VERSION: str = "3.0.4"

    # CORS settings
    if os.getenv("ALLOWED_ORIGINS") and len(os.getenv("ALLOWED_ORIGINS")) > 0:
        ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS").split(',')
    else:
        ALLOWED_ORIGINS: list[str] = [
            "http://localhost:3000",  # React dev server
            "http://localhost:5173",  # Vite dev server
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ]
    
    ALLOW_CREDENTIALS: bool = True
    ALLOW_METHODS: list[str] = ["*"]
    ALLOW_HEADERS: list[str] = ["*"]
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///:memory:")
    SECRET_KEY: SecretStr = SecretStr(
        os.getenv("SECRET_KEY", "fallback_secret_key_for_development")
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OpenAI Configuration
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
    OPENAI_API_KEY: SecretStr | None = None

    # Logging configuration
    LOG_LEVEL: str = "INFO"
    DEBUG: bool = False

    IS_LAMBDA: bool = IS_LAMBDA

    model_config = SettingsConfigDict(
        # Only use env_file in local development
        env_file=None if IS_LAMBDA else env_file,
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
        # Use empty string for env_prefix to avoid None error
        env_prefix="",
    )

    def __init__(self, **kwargs):
        """Initialize settings with environment-specific configuration"""
        super().__init__(**kwargs)

        # If running in Lambda, ensure we use environment variables
        if IS_LAMBDA:
            self.ALLOWED_ORIGINS = os.environ.get(
                "ALLOWED_ORIGINS", self.ALLOWED_ORIGINS
            )
            self.DATABASE_URL = os.environ.get(
                "DATABASE_URL", self.DATABASE_URL
            )
            self.SECRET_KEY = SecretStr(
                os.environ.get("SECRET_KEY", self.SECRET_KEY.get_secret_value())
            )
            self.OPENAI_MODEL = os.environ.get(
                "OPENAI_MODEL", self.OPENAI_MODEL
            )
            if "OPENAI_API_KEY" in os.environ:
                self.OPENAI_API_KEY = SecretStr(os.environ["OPENAI_API_KEY"])


settings = Settings()

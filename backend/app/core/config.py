from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr
from typing import List
import os

# Determine which env file to use based on environment
env_file = ".env.test" if os.getenv("PYTEST_CURRENT_TEST") else ".env"

class Settings(BaseSettings):
    """Application settings and configuration"""
    PROJECT_NAME: str = "AI Wizard Backend API"
    PROJECT_VERSION: str = "1.0.0"
    
    allowed_origins_env_value: str | None = os.getenv("ALLOWED_ORIGINS")
    # CORS origins configuration with default value, if not provided
    if allowed_origins_env_value:
        ALLOWED_ORIGINS: List[str] = [origin.strip() for origin in allowed_origins_env_value.split(",") if origin.strip()]
    else:
        ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///:memory:")
    SECRET_KEY: SecretStr = SecretStr(os.getenv("SECRET_KEY", "fallback_secret_key_for_development"))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OpenAI Configuration
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
    OPENAI_API_KEY: SecretStr | None = None

    model_config = SettingsConfigDict(
        env_file=env_file,
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr, field_validator
from typing import List
import os

class Settings(BaseSettings):
    """Application settings and configuration"""
    PROJECT_NAME: str = "AI Wizard"
    PROJECT_VERSION: str = "1.0.0"
    
    # CORS origins configuration with default value
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: str | List[str] | None) -> List[str]:
        """Parse ALLOWED_ORIGINS from string or list
        
        Args:
            v: Input value from default or direct assignment
            
        Returns:
            List[str]: List of allowed origins
        """
        # Environment variable always takes precedence if it exists
        env_value = os.getenv("ALLOWED_ORIGINS")
        if env_value:
            return [origin.strip() for origin in env_value.split(",") if origin.strip()]
        
        # If no environment variable, use the input value
        if isinstance(v, list):
            return [str(origin).strip() for origin in v if str(origin).strip()]
        
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        
        # Fallback to default
        return ["http://localhost:3000"]

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///:memory:")
    SECRET_KEY: SecretStr = SecretStr(os.getenv("SECRET_KEY", "fallback_secret_key_for_development"))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OpenAI Configuration
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
    OPENAI_API_KEY: SecretStr | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

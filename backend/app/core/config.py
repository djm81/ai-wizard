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
            v: Input value, can be string, list of strings, or None
            
        Returns:
            List[str]: List of allowed origins
        """
        # If environment variable exists, use it instead of the input value
        env_origins = os.getenv("ALLOWED_ORIGINS")
        if env_origins is not None:
            # Split by comma and strip whitespace
            return [origin.strip() for origin in env_origins.split(",") if origin.strip()]
        
        # If no environment variable, handle the input value
        if v is None:
            return ["http://localhost:3000"]
        
        if isinstance(v, list):
            return [str(origin).strip() for origin in v if str(origin).strip()]
        
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        
        # If we get here, v is neither None, list, nor string
        return ["http://localhost:3000"]
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///:memory:")
    SECRET_KEY: SecretStr = SecretStr(os.getenv("SECRET_KEY", "fallback_secret_key_for_development"))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OpenAI Configuration
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
    OPENAI_API_KEY: SecretStr | None = None

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()

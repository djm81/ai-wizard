from pydantic_settings import BaseSettings
from pydantic import SecretStr
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Wizard"
    PROJECT_VERSION: str = "1.0.0"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]  # Update this with your frontend URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///:memory:")
    SECRET_KEY: SecretStr = SecretStr(os.getenv("SECRET_KEY", "fallback_secret_key_for_development"))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()

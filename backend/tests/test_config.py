"""Test configuration module."""

import os

from app.core.config import DEFAULT_ORIGINS, Settings


def test_settings_allowed_origins():
    """Test ALLOWED_ORIGINS configuration"""
    # Set test environment variable
    os.environ["ALLOWED_ORIGINS"] = "http://localhost:3000"

    # Create new settings instance
    settings = Settings()

    # Verify ALLOWED_ORIGINS is properly parsed
    assert settings.ALLOWED_ORIGINS == ["http://localhost:3000"]


def test_settings_allowed_origins_json():
    """Test ALLOWED_ORIGINS configuration with JSON format"""
    # Set test environment variable with JSON format
    os.environ["ALLOWED_ORIGINS"] = '["http://localhost:3000"]'

    # Create new settings instance
    settings = Settings()

    # Verify ALLOWED_ORIGINS is properly parsed
    assert settings.ALLOWED_ORIGINS == ["http://localhost:3000"]


def test_settings_default_allowed_origins():
    """Test default ALLOWED_ORIGINS when not set in environment"""
    # Clear environment variable
    if "ALLOWED_ORIGINS" in os.environ:
        del os.environ["ALLOWED_ORIGINS"]

    # Create new settings instance
    settings = Settings()

    # Verify default values are used
    assert settings.ALLOWED_ORIGINS == DEFAULT_ORIGINS

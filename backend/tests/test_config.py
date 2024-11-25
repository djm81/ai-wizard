"""Test configuration module."""

import os

from app.core.config import DEFAULT_ORIGINS, Settings


def test_settings_allowed_origins():
    """Test ALLOWED_ORIGINS configuration with single origin"""
    # Set test environment variable
    os.environ["ALLOWED_ORIGINS"] = "http://localhost:3000"

    # Create new settings instance
    settings = Settings()

    # Verify ALLOWED_ORIGINS is properly parsed
    assert settings.ALLOWED_ORIGINS == ["http://localhost:3000"]


def test_settings_allowed_origins_multiple():
    """Test ALLOWED_ORIGINS configuration with multiple origins"""
    # Set test environment variable with comma-separated values
    os.environ["ALLOWED_ORIGINS"] = "http://localhost:3000,http://example.com"

    # Create new settings instance
    settings = Settings()

    # Verify ALLOWED_ORIGINS is properly parsed
    assert settings.ALLOWED_ORIGINS == ["http://localhost:3000", "http://example.com"]


def test_settings_default_allowed_origins():
    """Test default ALLOWED_ORIGINS when not set in environment"""
    # Clear environment variable
    if "ALLOWED_ORIGINS" in os.environ:
        del os.environ["ALLOWED_ORIGINS"]

    # Create new settings instance
    settings = Settings()

    # Verify default values are used
    assert settings.ALLOWED_ORIGINS == DEFAULT_ORIGINS


def test_settings_allowed_origins_whitespace():
    """Test ALLOWED_ORIGINS handles whitespace correctly"""
    # Set test environment variable with whitespace
    os.environ["ALLOWED_ORIGINS"] = " http://localhost:3000 , http://example.com "

    # Create new settings instance
    settings = Settings()

    # Verify ALLOWED_ORIGINS is properly parsed with whitespace removed
    assert settings.ALLOWED_ORIGINS == ["http://localhost:3000", "http://example.com"]

"""test_auth_service module for AI Wizard backend."""

from unittest.mock import patch

import firebase_admin.auth
import pytest
from app.services.auth_service import AuthService
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials


@pytest.mark.asyncio
class TestAuthService:
    """Test suite for AuthService"""

    async def test_get_current_user_success(self, db_session, test_user):
        """Test successful user authentication"""
        service = AuthService(db_session)
        mock_credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="mock-token"
        )

        with patch("firebase_admin.auth.verify_id_token") as mock_verify:
            mock_verify.return_value = {"email": test_user.email}
            user = await service.get_current_user(mock_credentials)
            assert user.id == test_user.id
            assert user.email == test_user.email

    async def test_get_current_user_invalid_token(self, db_session):
        """Test authentication with invalid token"""
        service = AuthService(db_session)
        mock_credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="invalid-token"
        )

        with patch("firebase_admin.auth.verify_id_token") as mock_verify:
            mock_verify.side_effect = firebase_admin.auth.InvalidIdTokenError(
                "Invalid token"
            )
            with pytest.raises(HTTPException) as exc_info:
                await service.get_current_user(mock_credentials)
            assert exc_info.value.status_code == 401

    async def test_get_current_user_user_not_found_creates_user(
        self, db_session
    ):
        """Test authentication creates new user when not found"""
        service = AuthService(db_session)
        mock_credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="mock-token"
        )

        with patch("firebase_admin.auth.verify_id_token") as mock_verify:
            mock_verify.return_value = {
                "email": "newuser@example.com",
                "name": "New User",
            }
            user = await service.get_current_user(mock_credentials)
            assert user.email == "newuser@example.com"
            assert user.full_name == "New User"

    async def test_get_current_user_existing_user(self, db_session, test_user):
        """Test authentication with existing user"""
        service = AuthService(db_session)
        mock_credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="mock-token"
        )

        with patch("firebase_admin.auth.verify_id_token") as mock_verify:
            mock_verify.return_value = {
                "email": test_user.email,
                "name": test_user.full_name,
            }
            user = await service.get_current_user(mock_credentials)
            assert user.id == test_user.id
            assert user.email == test_user.email

    async def test_get_current_user_missing_email(self, db_session):
        """Test authentication with token missing email claim"""
        service = AuthService(db_session)
        mock_credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="mock-token"
        )

        with patch("firebase_admin.auth.verify_id_token") as mock_verify:
            mock_verify.return_value = {"name": "Test User"}  # No email claim
            with pytest.raises(HTTPException) as exc_info:
                await service.get_current_user(mock_credentials)
            assert exc_info.value.status_code == 401
            assert "Token missing email claim" in str(exc_info.value.detail)

    async def test_get_current_user_no_credentials(self, db_session):
        """Test authentication with no credentials"""
        service = AuthService(db_session)
        with pytest.raises(HTTPException) as exc_info:
            await service.get_current_user(None)
        assert exc_info.value.status_code == 401
        assert "Could not validate credentials" in str(exc_info.value.detail)

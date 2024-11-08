import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
import firebase_admin.auth
from unittest.mock import patch, MagicMock
from app.services.auth_service import AuthService

@pytest.mark.asyncio
class TestAuthService:
    """Test suite for AuthService"""

    def test_verify_password(self, db_session):
        """Test password verification"""
        service = AuthService(db_session)
        password = "testpassword123"
        hashed = service.get_password_hash(password)
        assert service.verify_password(password, hashed) is True
        assert service.verify_password("wrongpassword", hashed) is False

    def test_get_password_hash(self, db_session):
        """Test password hashing"""
        service = AuthService(db_session)
        password = "testpassword123"
        hashed1 = service.get_password_hash(password)
        hashed2 = service.get_password_hash(password)
        # Each hash should be different due to salt
        assert hashed1 != hashed2
        # But both should verify
        assert service.verify_password(password, hashed1)
        assert service.verify_password(password, hashed2)

    @pytest.mark.asyncio
    async def test_get_current_user_success(self, db_session, test_user):
        """Test successful user authentication"""
        service = AuthService(db_session)
        mock_credentials = HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials="mock-token"
        )

        with patch('firebase_admin.auth.verify_id_token') as mock_verify:
            mock_verify.return_value = {"email": test_user.email}
            user = await service.get_current_user(mock_credentials)
            assert user.id == test_user.id
            assert user.email == test_user.email

    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self, db_session):
        """Test authentication with invalid token"""
        service = AuthService(db_session)
        mock_credentials = HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials="invalid-token"
        )

        with patch('firebase_admin.auth.verify_id_token') as mock_verify:
            mock_verify.side_effect = firebase_admin.auth.InvalidIdTokenError("Invalid token")
            with pytest.raises(HTTPException) as exc_info:
                await service.get_current_user(mock_credentials)
            assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user_user_not_found(self, db_session):
        """Test authentication with valid token but non-existent user"""
        service = AuthService(db_session)
        mock_credentials = HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials="mock-token"
        )

        with patch('firebase_admin.auth.verify_id_token') as mock_verify:
            mock_verify.return_value = {"email": "nonexistent@example.com"}
            with pytest.raises(HTTPException) as exc_info:
                await service.get_current_user(mock_credentials)
            assert exc_info.value.status_code == 401
            assert "User not found in database" in str(exc_info.value.detail) 
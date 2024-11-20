"""auth_service module for AI Wizard backend."""

import logging
import secrets

import firebase_admin.auth
from app.db.database import get_db
from app.models.user import User
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth as firebase_auth
from firebase_admin.auth import ExpiredIdTokenError, InvalidIdTokenError, RevokedIdTokenError
from sqlalchemy.orm import Session

security = HTTPBearer()
logger = logging.getLogger(__name__)


class AuthService:
    """Service for handling authentication and authorization"""

    def __init__(self, db: Session):
        self.db = db

    async def get_current_user(
        self, credentials: HTTPAuthorizationCredentials = Security(security)
    ) -> User:
        """Get current user from token"""
        try:
            if not credentials:
                logger.error("No credentials provided")
                raise HTTPException(
                    status_code=401,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            token = credentials.credentials
            logger.debug(f"Attempting to verify token: {token[:10]}...")

            try:
                # Verify Firebase token
                decoded_token = firebase_auth.verify_id_token(token)
                logger.debug(f"Token decoded successfully. Claims: {decoded_token}")
            except InvalidIdTokenError as e:
                logger.error(f"Invalid token error: {str(e)}")
                raise HTTPException(
                    status_code=401,
                    detail="Invalid authentication token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            except ExpiredIdTokenError as e:
                logger.error(f"Token expired error: {str(e)}")
                raise HTTPException(
                    status_code=401,
                    detail="Token has expired",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            except RevokedIdTokenError as e:
                logger.error(f"Token revoked error: {str(e)}")
                raise HTTPException(
                    status_code=401,
                    detail="Token has been revoked",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            except Exception as e:
                logger.error(
                    f"Firebase token verification error: {str(e)}",
                    exc_info=True,
                )
                raise HTTPException(
                    status_code=401,
                    detail=f"Authentication failed: {str(e)}",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            if "email" not in decoded_token:
                logger.error(f"Token missing email claim. Available claims: {decoded_token.keys()}")
                raise HTTPException(
                    status_code=401,
                    detail="Token missing email claim",
                )

            # Get user from database by email
            email = decoded_token["email"]
            logger.debug(f"Looking up user with email: {email}")
            user = self.db.query(User).filter(User.email == email).first()

            if not user:
                logger.info(f"Creating new user for email: {email}")
                # Create user if they don't exist
                user = User(
                    email=email,
                    full_name=decoded_token.get("name", email.split("@")[0]),
                    is_active=True,
                    is_superuser=False,
                    hashed_password=get_firebase_placeholder_password(),
                )
                self.db.add(user)
                try:
                    self.db.commit()
                    self.db.refresh(user)
                    logger.info(f"Created new user with email: {email}")
                except Exception as e:
                    self.db.rollback()
                    logger.error(f"Failed to create user: {str(e)}")
                    raise HTTPException(status_code=500, detail="Failed to create user account")

            return user

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=401,
                detail=f"Authentication failed: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )


def get_firebase_placeholder_password() -> str:
    """Generate a secure random placeholder for Firebase users."""
    return f"firebase_auth_{secrets.token_urlsafe(32)}"

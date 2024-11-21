"""auth_service module for AI Wizard backend."""

# Standard library imports
import uuid
from typing import Annotated

# Third party imports
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth as firebase_auth
from firebase_admin.auth import ExpiredIdTokenError, InvalidIdTokenError, RevokedIdTokenError
from sqlalchemy.orm import Session

# Local application imports
from app.core.config import settings
from app.core.logging_config import logger
from app.db.database import get_db
from app.models.user import User

security = HTTPBearer()

# Type aliases for dependency injection
DBSession = Annotated[Session, Depends(get_db)]
AuthCredentials = Annotated[HTTPAuthorizationCredentials, Security(security)]


class AuthService:
    """Service for handling authentication and authorization"""

    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _get_firebase_placeholder_password() -> str:
        """Generate a secure random placeholder for Firebase users.

        This is used when creating new users from Firebase authentication
        to satisfy the database schema requirement for a password field,
        while actual authentication is handled by Firebase.

        Returns:
            str: A random UUID-based placeholder password
        """
        return f"firebase_auth_{uuid.uuid4().hex}"

    @classmethod
    async def get_current_user(
        cls,
        credentials: AuthCredentials,
        db: DBSession,
    ) -> User:
        """Get current user from token."""
        # This code block is only reachable in tests, FastAPI handles missing credentials in production
        if credentials is None:  # type: ignore[unreachable] # pylint: disable=using-constant-test
            logger.error("Authentication failed: No credentials provided")
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = credentials.credentials
        if settings.DEBUG:
            logger.debug("Token received: %s...", token[:10])

        try:
            # Verify Firebase token
            decoded_token = firebase_auth.verify_id_token(token)
            if settings.DEBUG:
                # Filter sensitive data before logging
                safe_claims = {
                    k: v
                    for k, v in decoded_token.items()
                    if k not in {"sub", "user_id", "iat", "exp"}
                }
                logger.debug("Token claims: %s", safe_claims)

        except (InvalidIdTokenError, ExpiredIdTokenError, RevokedIdTokenError) as e:
            error_details = {
                InvalidIdTokenError: ("Invalid token", "invalid_token"),
                ExpiredIdTokenError: ("Token expired", "token_expired"),
                RevokedIdTokenError: ("Token revoked", "token_revoked"),
            }
            message, error_type = error_details[type(e)]

            logger.warning(message, extra={"error_type": error_type, "error": str(e)})
            raise HTTPException(
                status_code=401,
                detail=message,
                headers={"WWW-Authenticate": "Bearer"},
            )
        except Exception as e:
            logger.error(
                "Firebase token verification failed",
                extra={"error": str(e), "error_type": type(e).__name__},
                exc_info=True,
            )
            raise HTTPException(
                status_code=401,
                detail="Authentication failed",  # Generic message for security
                headers={"WWW-Authenticate": "Bearer"},
            )

        if "email" not in decoded_token:
            logger.error(
                "Token missing email claim",
                extra={
                    "available_claims": [
                        claim
                        for claim in decoded_token.keys()
                        if claim not in {"sub", "user_id", "iat", "exp"}
                    ]
                },
            )
            raise HTTPException(
                status_code=401,
                detail="Invalid token format",  # Generic message for security
            )

        try:
            # Get user from database by email
            email = decoded_token["email"]
            if settings.DEBUG:
                logger.debug("Looking up user: %s", email)

            service = cls(db)
            user = service.db.query(User).filter(User.email == email).first()

            if not user:
                logger.info("Creating new user: %s", email)
                # Create user if they don't exist
                user = User(
                    email=email,
                    full_name=decoded_token.get("name", email.split("@")[0]),
                    is_active=True,
                    is_superuser=False,
                    hashed_password=cls._get_firebase_placeholder_password(),
                )
                service.db.add(user)
                try:
                    service.db.commit()
                    service.db.refresh(user)
                    logger.info("User created successfully: %s", email)
                except Exception as e:
                    service.db.rollback()
                    logger.error(
                        "Failed to create user",
                        extra={"email": email, "error": str(e), "error_type": type(e).__name__},
                        exc_info=True,
                    )
                    raise HTTPException(
                        status_code=500,
                        detail="Internal server error",  # Generic message for security
                    )

            return user
        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                "Database operation failed",
                extra={"error": str(e), "error_type": type(e).__name__},
                exc_info=True,
            )
            raise HTTPException(
                status_code=500,
                detail="Internal server error",  # Generic message for security
            )

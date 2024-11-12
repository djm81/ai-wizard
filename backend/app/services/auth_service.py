from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import firebase_admin.auth
import bcrypt
from app.models.user import User
from app.db.database import get_db
from sqlalchemy.orm import Session

security = HTTPBearer()

class AuthService:
    """Service for handling authentication and authorization"""
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password using bcrypt"""
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )

    def get_password_hash(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    async def get_current_user(
        self, 
        credentials: HTTPAuthorizationCredentials = Security(security)
    ) -> User:
        """Get current user from token"""
        try:
            token = credentials.credentials
            # Verify Firebase token
            decoded_token = firebase_admin.auth.verify_id_token(token)
            
            # Get user from database by email
            user = self.db.query(User).filter(User.email == decoded_token["email"]).first()
            if not user:
                raise HTTPException(status_code=401, detail="User not found in database")
            
            return user
            
        except Exception as e:
            raise HTTPException(
                status_code=401,
                detail=str(e),
                headers={"WWW-Authenticate": "Bearer"},
            )
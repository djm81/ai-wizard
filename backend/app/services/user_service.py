from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.db.database import get_db
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.user import UserCreate, UserUpdate, UserProfileCreate, UserProfileUpdate
import json

class UserService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create_user(self, user: UserCreate) -> User:
        db_user = User(**user.dict(exclude={"password"}))
        db_user.hashed_password = self.get_password_hash(user.password)
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_user(self, user_id: int) -> User:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str) -> User:
        return self.db.query(User).filter(User.email == email).first()

    def update_user(self, user_id: int, user: UserUpdate) -> User:
        db_user = self.get_user(user_id)
        if db_user:
            update_data = user.dict(exclude_unset=True)
            if "password" in update_data:
                update_data["hashed_password"] = self.get_password_hash(update_data.pop("password"))
            for key, value in update_data.items():
                setattr(db_user, key, value)
            self.db.commit()
            self.db.refresh(db_user)
        return db_user

    def delete_user(self, user_id: int) -> bool:
        db_user = self.get_user(user_id)
        if db_user:
            self.db.delete(db_user)
            self.db.commit()
            return True
        return False

    def create_user_profile(self, user_id: int, profile: UserProfileCreate) -> UserProfile:
        db_profile = UserProfile(**profile.dict(), user_id=user_id)
        db_profile.preferences = json.dumps(profile.preferences)
        self.db.add(db_profile)
        self.db.commit()
        self.db.refresh(db_profile)
        return db_profile

    def get_user_profile(self, user_id: int) -> UserProfile:
        return self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    def update_user_profile(self, user_id: int, profile: UserProfileUpdate) -> UserProfile:
        db_profile = self.get_user_profile(user_id)
        if db_profile:
            update_data = profile.dict(exclude_unset=True)
            if "preferences" in update_data:
                update_data["preferences"] = json.dumps(update_data["preferences"])
            for key, value in update_data.items():
                setattr(db_profile, key, value)
            self.db.commit()
            self.db.refresh(db_profile)
        return db_profile

    def get_password_hash(self, password: str) -> str:
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)
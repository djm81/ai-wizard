"""users module for AI Wizard backend."""

from app.db.database import get_db
from app.models.user import User as UserModel
from app.schemas.user import (
    User,
    UserCreate,
    UserProfile,
    UserProfileCreate,
    UserProfileUpdate,
    UserUpdate,
)
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/users", response_model=User)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    user_service: UserService = Depends(),
):
    """Create a new user.

    Args:
        user: User creation data
        db: Database session
        user_service: User service instance

    Returns:
        Created user object
    """
    return user_service.create_user(db=db, user=user)


@router.get("/users/me", response_model=User)
async def read_users_me(
    current_user: User = Depends(AuthService.get_current_user),
    user_service: UserService = Depends(),
):
    """Get current authenticated user.

    Args:
        current_user: Current authenticated user
        user_service: User service instance

    Returns:
        Current user object
    """
    return current_user


@router.put("/me", response_model=User)
def update_user_me(
    user: UserUpdate,
    current_user: UserModel = Depends(AuthService.get_current_user),
    user_service: UserService = Depends(),
):
    return user_service.update_user(current_user.id, user)


@router.delete("/me")
def delete_user_me(
    current_user: UserModel = Depends(AuthService.get_current_user),
    user_service: UserService = Depends(),
):
    return user_service.delete_user(current_user.id)


@router.post("/me/profile", response_model=UserProfile)
def create_user_profile(
    profile: UserProfileCreate,
    current_user: UserModel = Depends(AuthService.get_current_user),
    user_service: UserService = Depends(),
):
    return user_service.create_user_profile(current_user.id, profile)


@router.get("/me/profile", response_model=UserProfile)
def read_user_profile(
    current_user: UserModel = Depends(AuthService.get_current_user),
    user_service: UserService = Depends(),
):
    return user_service.get_user_profile(current_user.id)


@router.put("/me/profile", response_model=UserProfile)
def update_user_profile(
    profile: UserProfileUpdate,
    current_user: UserModel = Depends(AuthService.get_current_user),
    user_service: UserService = Depends(),
):
    return user_service.update_user_profile(current_user.id, profile)

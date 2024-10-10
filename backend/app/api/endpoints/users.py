from fastapi import APIRouter, Depends, HTTPException, status
from app.services.user_service import UserService
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserUpdate, UserProfileCreate, UserProfileUpdate, User, UserProfile, UserWithProfile
from app.models.user import User as UserModel

router = APIRouter()

@router.post("/", response_model=User)
def create_user(user: UserCreate, user_service: UserService = Depends()):
    db_user = user_service.get_user_by_email(user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_service.create_user(user)

@router.get("/me", response_model=UserWithProfile)
def read_users_me(current_user: UserModel = Depends(AuthService.get_current_user)):
    return current_user

@router.put("/me", response_model=User)
def update_user_me(user: UserUpdate, current_user: UserModel = Depends(AuthService.get_current_user), user_service: UserService = Depends()):
    return user_service.update_user(current_user.id, user)

@router.delete("/me")
def delete_user_me(current_user: UserModel = Depends(AuthService.get_current_user), user_service: UserService = Depends()):
    return user_service.delete_user(current_user.id)

@router.post("/me/profile", response_model=UserProfile)
def create_user_profile(profile: UserProfileCreate, current_user: UserModel = Depends(AuthService.get_current_user), user_service: UserService = Depends()):
    return user_service.create_user_profile(current_user.id, profile)

@router.get("/me/profile", response_model=UserProfile)
def read_user_profile(current_user: UserModel = Depends(AuthService.get_current_user), user_service: UserService = Depends()):
    return user_service.get_user_profile(current_user.id)

@router.put("/me/profile", response_model=UserProfile)
def update_user_profile(profile: UserProfileUpdate, current_user: UserModel = Depends(AuthService.get_current_user), user_service: UserService = Depends()):
    return user_service.update_user_profile(current_user.id, profile)
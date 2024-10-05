import pytest
from sqlalchemy.orm import Session
from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserUpdate
from app.models.user import User

def test_create_user(db: Session):
    user_service = UserService(db)
    user_create = UserCreate(email="test@example.com", password="testpassword", full_name="Test User")
    user = user_service.create_user(user_create)
    assert user.email == "test@example.com"
    assert user.full_name == "Test User"

def test_get_user_by_email(db: Session):
    user_service = UserService(db)
    user_create = UserCreate(email="test2@example.com", password="testpassword", full_name="Test User 2")
    created_user = user_service.create_user(user_create)
    fetched_user = user_service.get_user_by_email("test2@example.com")
    assert fetched_user is not None
    assert fetched_user.id == created_user.id

def test_update_user(db: Session):
    user_service = UserService(db)
    user_create = UserCreate(email="test3@example.com", password="testpassword", full_name="Test User 3")
    created_user = user_service.create_user(user_create)
    updated_user = user_service.update_user(created_user.id, UserUpdate(full_name="Updated Test User 3"))
    assert updated_user.full_name == "Updated Test User 3"

def test_delete_user(db: Session):
    user_service = UserService(db)
    user_create = UserCreate(email="test4@example.com", password="testpassword", full_name="Test User 4")
    created_user = user_service.create_user(user_create)
    assert user_service.delete_user(created_user.id) is True
    assert user_service.get_user_by_email("test4@example.com") is None
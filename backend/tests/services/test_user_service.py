import pytest
from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserUpdate, UserProfileCreate, UserProfileUpdate
from app.models.user import User
from app.models.user_profile import UserProfile

@pytest.mark.unit
class TestUserService:
    def test_create_user(self, db_session):
        service = UserService(db_session)
        user_create = UserCreate(
            email="test@example.com",
            password="testpassword",
            full_name="Test User"
        )
        db_user = service.create_user(user_create)
        assert db_user.email == user_create.model_dump()["email"]
        assert db_user.full_name == user_create.model_dump()["full_name"]

    def test_get_user_by_email(self, db_session, test_user):
        service = UserService(db_session)
        user = service.get_user_by_email(test_user.email)
        assert user is not None
        assert user.id == test_user.id
        assert user.email == test_user.email

    def test_update_user(self, db_session, test_user):
        service = UserService(db_session)
        user_update = UserUpdate(
            full_name="Updated Name"
        )
        updated_user = service.update_user(test_user.id, user_update)
        assert updated_user.full_name == user_update.model_dump()["full_name"]

    def test_delete_user(self, db_session, test_user):
        service = UserService(db_session)
        service.delete_user(test_user.id)
        deleted_user = service.get_user_by_email(test_user.email)
        assert deleted_user is None

    def test_create_user_profile(self, db_session, test_user):
        service = UserService(db_session)
        profile_create = UserProfileCreate(
            bio="Test bio",
            preferences={"theme": "dark"}
        )
        profile = service.create_user_profile(test_user.id, profile_create)
        assert profile.bio == profile_create.bio
        assert profile.user_id == test_user.id

    def test_update_user_profile(self, db_session, test_user):
        service = UserService(db_session)
        # First create a profile
        profile_create = UserProfileCreate(bio="Initial bio")
        service.create_user_profile(test_user.id, profile_create)
        
        # Then update it
        profile_update = UserProfileUpdate(bio="Updated bio")
        updated_profile = service.update_user_profile(test_user.id, profile_update)
        assert updated_profile.bio == "Updated bio" 
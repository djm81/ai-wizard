"""conftest module for AI Wizard backend."""

import os
from typing import Generator

import pytest
from app.core.config import settings
from app.db.database import get_db
from app.main import app
from app.models.ai_interaction import AIInteraction
from app.models.base import Base
from app.models.project import Project
from app.models.user import User
from app.services.ai_service import AIService
from app.services.auth_service import AuthService
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# Set test environment variables before importing settings
def pytest_configure(config):
    """Configure test environment"""
    os.environ["ENVIRONMENT"] = "test"
    os.environ["ALLOWED_ORIGINS"] = "http://localhost:3000,http://localhost:5173"
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    os.environ["SECRET_KEY"] = "test-secret-key"
    os.environ["OPENAI_API_KEY"] = "test-api-key"

# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Setup test environment variables"""
    # This ensures environment variables are set before any tests run
    os.environ["ENVIRONMENT"] = "test"
    os.environ["ALLOWED_ORIGINS"] = "http://localhost:3000"
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    os.environ["SECRET_KEY"] = "test-secret-key"
    os.environ["OPENAI_API_KEY"] = "test-api-key"
    yield

@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(db_session: Session) -> User:
    """Create a test user"""
    user = User(
        email="test@example.com",
        hashed_password="hashed_password",
        full_name="Test User",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers() -> dict[str, str]:
    """Provide mock auth headers for testing"""
    return {"Authorization": "Bearer mock-token"}


@pytest.fixture
def client(
    db_session: Session, test_user: User
) -> Generator[TestClient, None, None]:
    """Test client fixture with auth and DB overrides"""

    def get_test_db():
        yield db_session

    async def mock_get_current_user() -> User:
        return test_user

    app.dependency_overrides[get_db] = get_test_db
    app.dependency_overrides[
        AuthService.get_current_user
    ] = mock_get_current_user

    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def test_project(db_session: Session, test_user: User) -> Project:
    project = Project(
        user_id=test_user.id,
        name="Test Project",
        description="Test Description",
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    return project


@pytest.fixture
def test_ai_interaction(
    db_session: Session, test_user: User, test_project: Project
) -> AIInteraction:
    interaction = AIInteraction(
        user_id=test_user.id,
        project_id=test_project.id,
        prompt="Test prompt",
        response="Test response",
    )
    db_session.add(interaction)
    db_session.commit()
    db_session.refresh(interaction)
    return interaction


@pytest.fixture
def ai_service(db_session):
    """Fixture for AIService with test configuration"""
    service = AIService(db_session)
    # Don't initialize OpenAI client in tests
    service.client = None  # Will be mocked in individual tests
    service.model = "test-model"
    return service


# ruff: noqa: B101
# Bandit B101 is disabled for test files as assertions are intended for testing

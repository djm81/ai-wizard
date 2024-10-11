import sys
import os
from dotenv import load_dotenv

# Load test environment variables
load_dotenv(".env.test")

# Add the project root to the Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.db.database import get_db
from app.main import app
from fastapi.testclient import TestClient

test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def db():
    # Use in-memory SQLite database for testing
    # test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    # TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    
    # Create all tables in the test database
    Base.metadata.create_all(bind=test_engine)
    
    # Create a new session for the test
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
#        Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="module")
def client():
    app.dependency_overrides[get_db] = lambda: TestingSessionLocal()
    with TestClient(app) as c:
        yield c
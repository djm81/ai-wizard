import pytest
from sqlalchemy.orm import Session
from app.services.project_service import ProjectService
from app.services.user_service import UserService
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.schemas.user import UserCreate
from app.schemas.ai_interaction import AIInteractionCreate

def test_create_project(db: Session):
    user_service = UserService(db)
    project_service = ProjectService(db)
    
    user_create = UserCreate(email="project_test@example.com", password="testpassword", full_name="Project Test User")
    user = user_service.create_user(user_create)
    
    project_create = ProjectCreate(name="Test Project", description="A test project")
    project = project_service.create_project(user.id, project_create)
    
    assert project.name == "Test Project"
    assert project.description == "A test project"
    assert project.user_id == user.id

def test_get_project(db: Session):
    user_service = UserService(db)
    project_service = ProjectService(db)
    
    user_create = UserCreate(email="project_test2@example.com", password="testpassword", full_name="Project Test User 2")
    user = user_service.create_user(user_create)
    
    project_create = ProjectCreate(name="Test Project 2", description="Another test project")
    created_project = project_service.create_project(user.id, project_create)
    
    fetched_project = project_service.get_project(created_project.id)
    assert fetched_project is not None
    assert fetched_project.id == created_project.id

def test_update_project(db: Session):
    user_service = UserService(db)
    project_service = ProjectService(db)
    
    user_create = UserCreate(email="project_test3@example.com", password="testpassword", full_name="Project Test User 3")
    user = user_service.create_user(user_create)
    
    project_create = ProjectCreate(name="Test Project 3", description="Yet another test project")
    created_project = project_service.create_project(user.id, project_create)
    
    updated_project = project_service.update_project(created_project.id, ProjectUpdate(name="Updated Test Project 3"))
    assert updated_project.name == "Updated Test Project 3"

def test_delete_project(db: Session):
    user_service = UserService(db)
    project_service = ProjectService(db)
    
    user_create = UserCreate(email="project_test4@example.com", password="testpassword", full_name="Project Test User 4")
    user = user_service.create_user(user_create)
    
    project_create = ProjectCreate(name="Test Project 4", description="A project to be deleted")
    created_project = project_service.create_project(user.id, project_create)
    
    assert project_service.delete_project(created_project.id) is True
    assert project_service.get_project(created_project.id) is None

def test_create_ai_interaction(db: Session):
    user_service = UserService(db)
    project_service = ProjectService(db)
    
    user_create = UserCreate(email="ai_test@example.com", password="testpassword", full_name="AI Test User")
    user = user_service.create_user(user_create)
    
    project_create = ProjectCreate(name="AI Test Project", description="A project for AI interaction")
    project = project_service.create_project(user.id, project_create)
    
    interaction_create = AIInteractionCreate(prompt="Test prompt", response="Test response")
    interaction = project_service.create_ai_interaction(user.id, project.id, interaction_create)
    
    assert interaction.prompt == "Test prompt"
    assert interaction.response == "Test response"
    assert interaction.user_id == user.id
    assert interaction.project_id == project.id

def test_get_project_interactions(db: Session):
    user_service = UserService(db)
    project_service = ProjectService(db)
    
    user_create = UserCreate(email="ai_test2@example.com", password="testpassword", full_name="AI Test User 2")
    user = user_service.create_user(user_create)
    
    project_create = ProjectCreate(name="AI Test Project 2", description="Another project for AI interaction")
    project = project_service.create_project(user.id, project_create)
    
    interaction_create1 = AIInteractionCreate(prompt="Test prompt 1", response="Test response 1")
    interaction_create2 = AIInteractionCreate(prompt="Test prompt 2", response="Test response 2")
    
    project_service.create_ai_interaction(user.id, project.id, interaction_create1)
    project_service.create_ai_interaction(user.id, project.id, interaction_create2)
    
    interactions = project_service.get_project_interactions(project.id)
    assert len(interactions) == 2
    assert interactions[0].prompt == "Test prompt 1"
    assert interactions[1].prompt == "Test prompt 2"
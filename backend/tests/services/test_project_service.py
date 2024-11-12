import pytest
from fastapi import HTTPException
from app.services.project_service import ProjectService
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.schemas.ai_interaction import AIInteractionCreate

@pytest.mark.unit
class TestProjectService:
    def test_get_user_projects(self, db_session, test_user, test_project):
        service = ProjectService(db_session)
        projects = service.get_user_projects(test_user.id)
        assert len(projects) == 1
        assert projects[0].id == test_project.id
        assert projects[0].name == test_project.name

    def test_create_project(self, db_session, test_user):
        service = ProjectService(db_session)
        project_create = ProjectCreate(
            name="New Project",
            description="New Description"
        )
        project = service.create_project(test_user.id, project_create)
        assert project.name == "New Project"
        assert project.description == "New Description"
        assert project.user_id == test_user.id

    def test_get_project(self, db_session, test_project):
        service = ProjectService(db_session)
        project = service.get_project(test_project.id)
        assert project.id == test_project.id
        assert project.name == test_project.name

    def test_get_project_not_found(self, db_session):
        service = ProjectService(db_session)
        with pytest.raises(HTTPException) as exc:
            service.get_project(999)
        assert exc.value.status_code == 404

    def test_get_project_interactions(self, db_session, test_project, test_ai_interaction):
        service = ProjectService(db_session)
        interactions = service.get_project_interactions(test_project.id)
        assert len(interactions) == 1
        assert interactions[0].id == test_ai_interaction.id

    def test_create_ai_interaction(self, db_session, test_user, test_project):
        service = ProjectService(db_session)
        interaction_create = AIInteractionCreate(
            prompt="New prompt",
            response="New response"
        )
        interaction = service.create_ai_interaction(
            test_user.id,
            test_project.id,
            interaction_create
        )
        assert interaction.prompt == "New prompt"
        assert interaction.response == "New response"
        assert interaction.user_id == test_user.id
        assert interaction.project_id == test_project.id 
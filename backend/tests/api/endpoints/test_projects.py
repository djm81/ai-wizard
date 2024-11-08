import pytest
from fastapi.testclient import TestClient
from app.models.user import User
from app.models.project import Project
from app.models.ai_interaction import AIInteraction

@pytest.mark.unit
class TestProjectEndpoints:
    def test_list_projects(self, client, test_user, test_project, auth_headers):
        response = client.get("/api/projects/", headers=auth_headers)
        assert response.status_code == 200
        projects = response.json()
        assert len(projects) == 1
        assert projects[0]["id"] == test_project.id
        assert projects[0]["name"] == test_project.name

    def test_create_project(self, client, test_user, auth_headers):
        project_data = {
            "name": "New Project",
            "description": "New Description"
        }
        response = client.post(
            "/api/projects/",
            json=project_data,
            headers=auth_headers
        )
        assert response.status_code == 201
        created_project = response.json()
        assert created_project["name"] == project_data["name"]
        assert created_project["description"] == project_data["description"]

    def test_read_project(self, client, test_user, test_project, auth_headers):
        response = client.get(
            f"/api/projects/{test_project.id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        project = response.json()
        assert project["id"] == test_project.id
        assert project["name"] == test_project.name

    def test_list_project_interactions(self, client, test_user, test_project, test_ai_interaction, auth_headers):
        response = client.get(
            f"/api/projects/{test_project.id}/ai-interactions",
            headers=auth_headers
        )
        assert response.status_code == 200
        interactions = response.json()
        assert len(interactions) == 1
        assert interactions[0]["id"] == test_ai_interaction.id
        assert interactions[0]["prompt"] == test_ai_interaction.prompt

    def test_create_project_interaction(self, client, test_user, test_project, auth_headers):
        interaction_data = {
            "prompt": "New prompt",
            "response": "New response"
        }
        response = client.post(
            f"/api/projects/{test_project.id}/ai-interactions",
            json=interaction_data,
            headers=auth_headers
        )
        assert response.status_code == 201
        created_interaction = response.json()
        assert created_interaction["prompt"] == interaction_data["prompt"]
        assert created_interaction["response"] == interaction_data["response"]
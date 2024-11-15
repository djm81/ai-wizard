import pytest
from fastapi.testclient import TestClient
from app.models.user import User
from app.models.project import Project
from app.models.ai_interaction import AIInteraction
from app.services.auth_service import AuthService
from unittest.mock import patch

@pytest.mark.asyncio
class TestProjectEndpoints:
    async def test_list_projects(self, client, test_user, test_project, auth_headers):
        with patch.object(AuthService, 'get_current_user', return_value=test_user):
            response = client.get("/api/projects/", headers=auth_headers)
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["id"] == test_project.id

    async def test_create_project(self, client, test_user, auth_headers):
        with patch.object(AuthService, 'get_current_user', return_value=test_user):
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
            data = response.json()
            assert data["name"] == project_data["name"]
            assert data["description"] == project_data["description"]

    async def test_read_project(self, client, test_user, test_project, auth_headers):
        with patch.object(AuthService, 'get_current_user', return_value=test_user):
            response = client.get(
                f"/api/projects/{test_project.id}",
                headers=auth_headers
            )
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == test_project.id

    async def test_list_project_interactions(self, client, test_user, test_project, test_ai_interaction, auth_headers):
        with patch.object(AuthService, 'get_current_user', return_value=test_user):
            response = client.get(
                f"/api/projects/{test_project.id}/ai-interactions",
                headers=auth_headers
            )
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["id"] == test_ai_interaction.id

    async def test_create_project_interaction(self, client, test_user, test_project, auth_headers):
        with patch.object(AuthService, 'get_current_user', return_value=test_user):
            interaction_data = {
                "prompt": "New test prompt"
            }
            response = client.post(
                f"/api/projects/{test_project.id}/ai-interactions",
                json=interaction_data,
                headers=auth_headers
            )
            assert response.status_code == 201
            data = response.json()
            assert data["prompt"] == interaction_data["prompt"]
            assert "placeholder response" in data["response"].lower()
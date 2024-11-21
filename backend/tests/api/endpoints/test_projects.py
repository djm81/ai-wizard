"""test_projects module for AI Wizard backend."""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.models.ai_interaction import AIInteraction
from app.models.project import Project
from app.models.user import User
from app.services.auth_service import AuthService


@pytest.mark.asyncio
class TestProjectEndpoints:
    async def test_list_projects(self, client, test_user, test_project, auth_headers):
        with patch.object(AuthService, "get_current_user", return_value=test_user):
            response = client.get("/projects/", headers=auth_headers)
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["name"] == test_project.name

    async def test_create_project(self, client, test_user, auth_headers):
        with patch.object(AuthService, "get_current_user", return_value=test_user):
            project_data = {
                "name": "New Project",
                "description": "New Description",
            }
            response = client.post("/projects/", json=project_data, headers=auth_headers)
            assert response.status_code == 201
            data = response.json()
            assert data["name"] == project_data["name"]
            assert data["description"] == project_data["description"]

    async def test_read_project(self, client, test_user, test_project, auth_headers):
        with patch.object(AuthService, "get_current_user", return_value=test_user):
            response = client.get(f"/projects/{test_project.id}", headers=auth_headers)
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == test_project.name

    async def test_list_project_interactions(
        self, client, test_user, test_project, test_ai_interaction, auth_headers
    ):
        with patch.object(AuthService, "get_current_user", return_value=test_user):
            response = client.get(
                f"/projects/{test_project.id}/ai-interactions",
                headers=auth_headers,
            )
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["id"] == test_ai_interaction.id

    async def test_create_project_interaction(self, client, test_user, test_project, auth_headers):
        with patch.object(AuthService, "get_current_user", return_value=test_user):
            interaction_data = {"prompt": "New test prompt"}
            response = client.post(
                f"/projects/{test_project.id}/ai-interactions",
                json=interaction_data,
                headers=auth_headers,
            )
            assert response.status_code == 201
            data = response.json()
            assert data["prompt"] == interaction_data["prompt"]
            assert "placeholder response" in data["response"].lower()

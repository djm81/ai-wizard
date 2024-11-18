"""test_ai_interactions module for AI Wizard backend."""

from unittest.mock import patch

import pytest
from app.services.auth_service import AuthService


class TestAIInteractionEndpoints:
    async def test_create_ai_interaction(
        self, client, test_user, test_project, auth_headers
    ):
        with patch.object(
            AuthService, "get_current_user", return_value=test_user
        ):
            interaction_data = {"prompt": "Test prompt for AI"}
            response = client.post(
                f"/projects/{test_project.id}/ai-interactions",
                json=interaction_data,
                headers=auth_headers,
            )
            assert response.status_code == 201
            assert response.json()["prompt"] == interaction_data["prompt"]

    async def test_read_ai_interaction(
        self, client, test_user, test_ai_interaction, auth_headers
    ):
        with patch.object(
            AuthService, "get_current_user", return_value=test_user
        ):
            response = client.get(
                f"/projects/{test_ai_interaction.project_id}/ai-interactions/{test_ai_interaction.id}",
                headers=auth_headers,
            )
            assert response.status_code == 200
            assert response.json()["prompt"] == test_ai_interaction.prompt

    async def test_list_project_interactions(
        self, client, test_user, test_project, test_ai_interaction, auth_headers
    ):
        with patch.object(
            AuthService, "get_current_user", return_value=test_user
        ):
            response = client.get(
                f"/projects/{test_project.id}/ai-interactions",
                headers=auth_headers,
            )
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["id"] == test_ai_interaction.id

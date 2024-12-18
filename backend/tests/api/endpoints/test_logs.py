import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_create_log_success(mock_logger):
    log_entry = {
        "timestamp": "2024-01-01T00:00:00Z",
        "requestId": "test-123",
        "level": "info",
        "message": "Test log message",
        "method": "GET",
        "url": "http://test.com",
        "duration": 100.0,
        "status": 200,
        "source": "frontend",
        "environment": "test"
    }

    response = client.post("/logs", json=log_entry)
    assert response.status_code == 200
    assert response.json() == {"status": "logged"}

    # Verify logger was called correctly with structlog format
    mock_logger.bind.assert_called_once_with(request_id="test-123")
    mock_logger.bind.return_value.info.assert_called_once_with(
        "Test log message",
        **{k: v for k, v in log_entry.items() if v is not None}
    )

def test_create_log_invalid_level(mock_logger):
    log_entry = {
        "timestamp": "2024-01-01T00:00:00Z",
        "requestId": "test-123",
        "level": "invalid",  # Invalid level
        "message": "Test log message",
        "source": "frontend",
        "environment": "test"
    }

    response = client.post("/logs", json=log_entry)
    assert response.status_code == 422
    mock_logger.bind.assert_not_called()

def test_create_log_invalid_source(mock_logger):
    log_entry = {
        "timestamp": "2024-01-01T00:00:00Z",
        "requestId": "test-123",
        "level": "info",
        "message": "Test log message",
        "source": "invalid",  # Invalid source
        "environment": "test"
    }

    response = client.post("/logs", json=log_entry)
    assert response.status_code == 422
    mock_logger.bind.assert_not_called()

def test_create_log_missing_required(mock_logger):
    log_entry = {
        "timestamp": "2024-01-01T00:00:00Z",
        # Missing required fields
    }

    response = client.post("/logs", json=log_entry)
    assert response.status_code == 422
    mock_logger.bind.assert_not_called()

def test_create_log_error_handling(mock_logger):
    log_entry = {
        "timestamp": "2024-01-01T00:00:00Z",
        "requestId": "test-123",
        "level": "info",
        "message": "Test log message",
        "source": "frontend",
        "environment": "test"
    }

    # Make logger.bind().info raise an exception
    mock_logger.bind.return_value.info.side_effect = Exception("Test error")

    response = client.post("/logs", json=log_entry)
    assert response.status_code == 500

    # Verify error was logged with correct structlog format
    mock_logger.bind.assert_called_with(request_id="test-123")
    mock_logger.bind.return_value.error.assert_called_once_with(
        "Failed to process frontend log",
        error="Test error",
        log_data={k: v for k, v in log_entry.items() if v is not None},
        exc_info=True
    )

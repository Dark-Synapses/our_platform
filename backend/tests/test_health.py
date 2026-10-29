from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient
from pymongo.errors import ServerSelectionTimeoutError

from app.core.config import Settings
from app.main import create_app


def test_readiness_checks_database_and_closes_client():
    mongo = AsyncMock()

    # AsyncMongoClient.__getitem__ returns an async database object.
    db = AsyncMock()
    mongo.__getitem__.return_value = db

    mongo.admin.command.return_value = {"ok": 1}
    with patch("app.main.create_client", return_value=mongo):
        with TestClient(create_app(Settings(mongo_password="test"))) as client:
            response = client.get("/api/v1/health/ready")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
        mongo.admin.command.assert_awaited_once_with("ping")
        mongo.close.assert_awaited_once()


def test_database_failure_returns_503_without_exposing_details():
    mongo = AsyncMock()

    # AsyncMongoClient.__getitem__ returns an async database object.
    db = AsyncMock()
    mongo.__getitem__.return_value = db

    mongo.admin.command.side_effect = ServerSelectionTimeoutError("private detail")
    with patch("app.main.create_client", return_value=mongo):
        with TestClient(create_app(Settings(mongo_password="test"))) as client:
            assert client.get("/api/v1/health/live").status_code == 200
            response = client.get("/api/v1/health/ready")
        assert response.status_code == 503
        assert response.json() == {"detail": "Database unavailable"}

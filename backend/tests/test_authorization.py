from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

from app.main import create_app
from app.modules.auth.router import get_db


def make_client(role):
    app = create_app()
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db
    app.state.database = db

    client = TestClient(app)
    client.cookies.set("ds_session", "test-token")

    user = {
        "id": "test-user",
        "role": role,
        "email": "test@example.com",
        "full_name": "Test User",
    }

    return client, db, user


def test_client_cannot_access_admin_requests():
    client, _, user = make_client("client")
    with patch(
        "app.modules.admin.router.auth_service.current_user",
        new_callable=AsyncMock,
        return_value=user,
    ):
        response = client.get("/api/v1/admin/service-requests")
    assert response.status_code == 403


def test_client_cannot_access_admin_inquiries():
    client, _, user = make_client("client")
    with patch(
        "app.modules.admin.router.auth_service.current_user",
        new_callable=AsyncMock,
        return_value=user,
    ):
        response = client.get("/api/v1/admin/contact-inquiries")
    assert response.status_code == 403


def test_admin_cannot_create_client_request():
    client, _, user = make_client("admin")
    with patch(
        "app.modules.service_requests.router.auth_service.current_user",
        new_callable=AsyncMock,
        return_value=user,
    ):
        response = client.post(
            "/api/v1/service-requests",
            json={
                "service_type": "ai_services",
                "title": "Test Request",
                "description": "This is a valid test request description.",
            },
        )
    assert response.status_code == 403


def test_unauthenticated_client_cannot_list_requests():
    app = create_app()
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db
    app.state.database = db

    response = TestClient(app).get("/api/v1/service-requests")
    assert response.status_code == 401

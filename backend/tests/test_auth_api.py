from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

from app.main import create_app
from app.modules.auth.router import get_db

USER = {
    "_id": "user-test-id",
    "full_name": "Test Client",
    "email": "client@example.com",
    "password_hash": "mocked-hash",
    "company_name": "Example Ltd",
    "role": "client",
}


def make_client():
    app = create_app()
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db
    app.state.database = db
    return TestClient(app), db


def test_register_success():
    client, db = make_client()
    db.users.insert_one = AsyncMock(
        return_value=MagicMock(inserted_id="user-test-id")
    )
    db.users.find_one = AsyncMock(return_value=USER)

    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test Client",
            "email": "client@example.com",
            "password": "StrongPassword123!",
            "company_name": "Example Ltd",
        },
    )

    assert response.status_code == 201
    assert response.json()["role"] == "client"
    assert "password_hash" not in response.json()


def test_register_short_password():
    client, _ = make_client()
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test Client",
            "email": "client@example.com",
            "password": "short",
        },
    )
    assert response.status_code == 422


def test_login_success():
    client, db = make_client()
    db.users.find_one = AsyncMock(return_value=USER)
    db.sessions.insert_one = AsyncMock()

    with patch(
        "app.modules.auth.service.verify_password",
        return_value=True,
    ):
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "client@example.com",
                "password": "StrongPassword123!",
            },
        )

    assert response.status_code == 200
    assert response.json()["role"] == "client"
    assert "ds_session" in response.cookies
    assert "httponly" in response.headers["set-cookie"].lower()


def test_login_invalid_password():
    client, db = make_client()
    db.users.find_one = AsyncMock(return_value=USER)

    with patch(
        "app.modules.auth.service.verify_password",
        return_value=False,
    ):
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "client@example.com",
                "password": "WrongPassword123!",
            },
        )

    assert response.status_code == 401


def test_me_without_session():
    client, _ = make_client()
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_logout():
    client, db = make_client()
    db.sessions.delete_one = AsyncMock()

    client.cookies.set("ds_session", "test-session-token")
    response = client.post("/api/v1/auth/logout")

    assert response.status_code == 200
    cookie_header = response.headers["set-cookie"].lower()
    assert "ds_session=" in cookie_header
    assert "max-age=0" in cookie_header
    db.sessions.delete_one.assert_awaited_once()

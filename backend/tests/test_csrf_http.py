import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.modules.auth.router import get_db


@pytest.mark.parametrize(
    ("headers", "expected"),
    [
        ({}, 403),
        ({"Origin": "https://evil.example"}, 403),
        ({"Origin": "http://localhost:5173.evil.example"}, 403),
        ({"Origin": "http://localhost:5173"}, 200),
        ({"Referer": "http://localhost:5173/dashboard"}, 200),
        ({
            "Origin": "https://evil.example",
            "Referer": "http://localhost:5173/dashboard",
        }, 403),
    ],
)
def test_logout_origin_http(headers, expected):
    app = create_app()
    app.dependency_overrides[get_db] = lambda: None

    client = TestClient(app)
    response = client.post(
        "/api/v1/auth/logout",
        headers=headers,
    )

    assert response.status_code == expected

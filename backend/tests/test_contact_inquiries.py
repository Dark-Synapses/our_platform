from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient

from app.main import create_app
from app.modules.auth.router import get_db
from app.modules.admin.router import require_admin
from app.modules.contact_inquiries import repository
from app.modules.contact_inquiries.rate_limit import check_rate_limit


VALID = {
    "name": "Test Client",
    "email": "client@example.com",
    "company": "Example Ltd",
    "service": "AI Services",
    "message": "We need an AI solution for our business operations.",
    "website": "",
}


def make_client(admin=False):
    app = create_app()
    db = MagicMock()
    db.contact_inquiries.insert_one = AsyncMock(
        return_value=MagicMock(inserted_id="test-inquiry-id")
    )
    db.contact_rate_limits.find_one_and_update = AsyncMock(
        return_value={"count": 1}
    )
    app.dependency_overrides[get_db] = lambda: db

    # The test client does not enter the application lifespan,
    # so provide the mocked database for auth dependencies.
    app.state.database = db

    if admin:
        app.dependency_overrides[require_admin] = lambda: {
            "id": "admin-test",
            "role": "admin",
        }

    return TestClient(app), db


def test_create_contact_inquiry():
    client, db = make_client()
    response = client.post(
        "/api/v1/contact-inquiries",
        json=VALID,
        headers={"Origin": "http://localhost:5173"},
    )

    assert response.status_code == 201
    assert response.json()["status"] == "submitted"
    assert response.json()["id"] == "test-inquiry-id"

    db.contact_inquiries.insert_one.assert_awaited_once()
    document = db.contact_inquiries.insert_one.await_args.args[0]
    assert document["email"] == "client@example.com"
    assert document["service"] == "AI Services"
    assert document["status"] == "submitted"


def test_invalid_email():
    client, db = make_client()
    response = client.post(
        "/api/v1/contact-inquiries",
        json={**VALID, "email": "invalid-email"},
    )
    assert response.status_code == 422
    db.contact_inquiries.insert_one.assert_not_awaited()


def test_missing_required_field():
    client, db = make_client()
    data = {key: value for key, value in VALID.items() if key != "message"}
    response = client.post("/api/v1/contact-inquiries", json=data)
    assert response.status_code == 422
    db.contact_inquiries.insert_one.assert_not_awaited()


def test_honeypot_rejected():
    client, db = make_client()
    response = client.post(
        "/api/v1/contact-inquiries",
        json={**VALID, "website": "https://spam.example"},
    )
    assert response.status_code == 400
    db.contact_inquiries.insert_one.assert_not_awaited()


def test_admin_requires_authentication():
    client, db = make_client()
    response = client.get("/api/v1/admin/contact-inquiries")
    assert response.status_code == 401



def test_contact_rate_limit_rejected():
    client, db = make_client()
    db.contact_rate_limits.find_one_and_update = AsyncMock(
        return_value={"count": 6}
    )

    response = client.post(
        "/api/v1/contact-inquiries",
        json=VALID,
        headers={"Origin": "http://localhost:5173"},
    )

    assert response.status_code == 429
    assert response.headers["retry-after"] == "900"
    db.contact_inquiries.insert_one.assert_not_awaited()

from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

from app.main import create_app
from app.modules.auth.router import get_db
from app.modules.notifications import events


def test_contact_inquiry_notifies_all_admins():
    app = create_app()
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db

    db.users.find.return_value.to_list = AsyncMock(
        return_value=[
            {"_id": "admin-1"},
            {"_id": "admin-2"},
        ]
    )

    with (
        patch(
            "app.modules.contact_inquiries.router.check_rate_limit",
            new_callable=AsyncMock,
            return_value=True,
        ),
        patch(
            "app.modules.contact_inquiries.router.repository.create_inquiry",
            new_callable=AsyncMock,
            return_value={
                "id": "inquiry-1",
                "status": "submitted",
                "created_at": "2026-11-06T12:00:00Z",
            },
        ),
        patch.object(
            events.repository,
            "create_notification",
            new_callable=AsyncMock,
        ) as create,
    ):
        client = TestClient(app, headers={"Origin": "http://localhost:5173"})
        response = client.post(
            "/api/v1/contact-inquiries",
            json={
                "name": "Test Client",
                "email": "client@example.com",
                "service": "AI Services",
                "message": "We need an AI solution for our business.",
            },
        )

    assert response.status_code == 201, response.text
    assert create.await_count == 2
    recipients = {
        call.kwargs["recipient_id"]
        for call in create.await_args_list
    }
    assert recipients == {"admin-1", "admin-2"}


def test_failed_contact_inquiry_does_not_notify_admins():
    app = create_app()
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db

    with (
        patch(
            "app.modules.contact_inquiries.router.check_rate_limit",
            new_callable=AsyncMock,
            return_value=True,
        ),
        patch(
            "app.modules.contact_inquiries.router.repository.create_inquiry",
            new_callable=AsyncMock,
            side_effect=RuntimeError("Database write failed"),
        ),
        patch.object(
            events.repository,
            "create_notification",
            new_callable=AsyncMock,
        ) as create,
    ):
        client = TestClient(
            app,
            headers={"Origin": "http://localhost:5173"},
            raise_server_exceptions=False,
        )
        response = client.post(
            "/api/v1/contact-inquiries",
            json={
                "name": "Test Client",
                "email": "client@example.com",
                "service": "AI Services",
                "message": "Test contact inquiry failure.",
            },
        )

    assert response.status_code == 500
    create.assert_not_awaited()

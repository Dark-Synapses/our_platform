from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

from bson import ObjectId
from fastapi.testclient import TestClient

from app.main import create_app
from app.modules.auth.router import get_db
from app.modules.notifications.router import get_notification_user


def make_client(authenticated=True):
    app = create_app()
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db
    app.state.database = db

    if authenticated:
        app.dependency_overrides[get_notification_user] = lambda: {
            "id": "client-1",
            "role": "client",
        }

    return TestClient(app, headers={"Origin": "http://localhost:5173"}), db


def test_notifications_require_auth():
    client, _ = make_client(authenticated=False)
    response = client.get("/api/v1/notifications")
    assert response.status_code == 401


def test_list_notifications():
    client, db = make_client()
    notification_id = ObjectId()

    cursor = MagicMock()
    cursor.sort.return_value = cursor
    cursor.to_list = AsyncMock(return_value=[{
        "_id": notification_id,
        "type": "request_status_changed",
        "title": "Request updated",
        "message": "Your request is in review.",
        "reference_id": "request-1",
        "is_read": False,
        "created_at": datetime.now(timezone.utc),
    }])
    db.notifications.find.return_value = cursor

    response = client.get("/api/v1/notifications")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["is_read"] is False
    db.notifications.find.assert_called_once_with(
        {"recipient_id": "client-1"}
    )


def test_unread_count():
    client, db = make_client()
    db.notifications.count_documents = AsyncMock(return_value=3)

    response = client.get("/api/v1/notifications/unread-count")

    assert response.status_code == 200
    assert response.json() == {"unread_count": 3}


def test_mark_notification_read():
    client, db = make_client()
    db.notifications.update_one = AsyncMock(
        return_value=MagicMock(matched_count=1)
    )

    response = client.patch(
        f"/api/v1/notifications/{ObjectId()}/read"
    )

    assert response.status_code == 200
    assert response.json() == {"status": "read"}


def test_cannot_mark_other_users_notification():
    client, db = make_client()
    db.notifications.update_one = AsyncMock(
        return_value=MagicMock(matched_count=0)
    )

    response = client.patch(
        f"/api/v1/notifications/{ObjectId()}/read"
    )

    assert response.status_code == 404
    query = db.notifications.update_one.await_args.args[0]
    assert query["recipient_id"] == "client-1"


def test_invalid_notification_id():
    client, db = make_client()

    response = client.patch(
        "/api/v1/notifications/invalid-id/read"
    )

    assert response.status_code == 404
    db.notifications.update_one.assert_not_called()

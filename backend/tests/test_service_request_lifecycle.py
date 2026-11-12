from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

from bson import ObjectId
from fastapi.testclient import TestClient

from app.main import create_app
from app.modules.admin.router import require_admin
from app.modules.auth.router import get_db
from app.modules.service_requests.router import require_client

REQUEST_ID = ObjectId()
NOW = datetime.now(timezone.utc)

DOCUMENT = {
    "_id": REQUEST_ID,
    "client_id": "client-1",
    "service_type": "digital_forensics",
    "title": "Content authenticity analysis",
    "description": "We need to verify the authenticity of digital media.",
    "status": "submitted",
    "created_at": NOW,
}


def make_client(role="client"):
    app = create_app()
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db
    app.state.database = db

    user = {"id": "client-1", "role": role}

    if role == "client":
        app.dependency_overrides[require_client] = lambda: user
    else:
        app.dependency_overrides[require_admin] = lambda: {
            "id": "admin-1",
            "role": "admin",
        }

    return TestClient(app), db


def test_create_digital_forensics_request():
    client, db = make_client()
    db.service_requests.insert_one = AsyncMock(
        return_value=MagicMock(inserted_id=REQUEST_ID)
    )
    db.users.find.return_value.to_list = AsyncMock(
        return_value=[{"_id": "admin-1"}]
    )
    db.notifications.insert_one = AsyncMock(
        return_value=MagicMock(inserted_id=ObjectId())
    )

    response = client.post(
        "/api/v1/service-requests",
        json={
            "service_type": "digital_forensics",
            "title": "Content authenticity analysis",
            "description": "We need to verify the authenticity of digital media.",
        },
    )

    assert response.status_code == 201
    assert response.json()["service_type"] == "digital_forensics"
    assert response.json()["status"] == "submitted"

    document = db.service_requests.insert_one.await_args.args[0]
    assert document["client_id"] == "client-1"


def test_list_requests_filters_by_client():
    client, db = make_client()

    cursor = MagicMock()
    cursor.sort.return_value = cursor
    cursor.to_list = AsyncMock(return_value=[DOCUMENT])
    db.service_requests.find.return_value = cursor

    response = client.get("/api/v1/service-requests")

    assert response.status_code == 200
    assert len(response.json()) == 1
    db.service_requests.find.assert_called_once_with(
        {"client_id": "client-1"}
    )


def test_admin_status_update_creates_audit():
    client, db = make_client("admin")

    db.service_requests.find_one = AsyncMock(
        side_effect=[
            DOCUMENT,
            {**DOCUMENT, "status": "in_review"},
        ]
    )
    db.service_requests.update_one = AsyncMock(
        return_value=MagicMock(matched_count=1)
    )
    db.service_request_audit.insert_one = AsyncMock()

    response = client.patch(
        f"/api/v1/admin/service-requests/{REQUEST_ID}/status",
        json={"status": "in_review"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "in_review"

    db.service_request_audit.insert_one.assert_not_awaited()
    update = db.service_requests.update_one.await_args.args[1]
    audit = update["$push"]["status_history"]

    assert audit["previous_status"] == "submitted"
    assert audit["new_status"] == "in_review"
    assert audit["admin_id"] == "admin-1"


def test_admin_status_conflict():
    client, db = make_client("admin")

    db.service_requests.find_one = AsyncMock(
        return_value=DOCUMENT
    )
    db.service_requests.update_one = AsyncMock(
        return_value=MagicMock(matched_count=0)
    )
    db.service_request_audit.insert_one = AsyncMock()

    from unittest.mock import patch

    from app.modules.notifications import events

    with patch.object(
        events.repository,
        "create_notification",
        new_callable=AsyncMock,
    ) as create:
        response = client.patch(
            f"/api/v1/admin/service-requests/{REQUEST_ID}/status",
            json={"status": "in_review"},
        )

    assert response.status_code == 409
    db.service_requests.update_one.assert_awaited_once()
    db.service_request_audit.insert_one.assert_not_awaited()
    create.assert_not_awaited()


def test_admin_rejects_invalid_request_id():
    client, _ = make_client("admin")

    response = client.patch(
        "/api/v1/admin/service-requests/not-valid/status",
        json={"status": "approved"},
    )

    assert response.status_code == 400


def test_request_creation_survives_notification_lookup_failure():
    client, db = make_client()
    db.service_requests.insert_one = AsyncMock(
        return_value=MagicMock(inserted_id=REQUEST_ID)
    )
    db.users.find.return_value.to_list = AsyncMock(
        side_effect=RuntimeError("Notification lookup failed")
    )

    response = client.post(
        "/api/v1/service-requests",
        json={
            "service_type": "digital_forensics",
            "title": "Content authenticity analysis",
            "description": "Verify the authenticity of digital media.",
        },
    )

    assert response.status_code == 201
    db.service_requests.insert_one.assert_awaited_once()


def test_status_update_notifies_request_owner():
    from unittest.mock import patch

    from app.modules.notifications import events

    client, db = make_client(role="admin")

    db.service_requests.find_one = AsyncMock(
        side_effect=[
            {
                "_id": REQUEST_ID,
                "client_id": "client-1",
                "status": "submitted",
                "service_type": "digital_forensics",
                "title": "Content authenticity analysis",
                "description": "Verify digital media.",
                "created_at": datetime.now(timezone.utc),
            },
            {
                "_id": REQUEST_ID,
                "client_id": "client-1",
                "status": "in_review",
                "service_type": "digital_forensics",
                "title": "Content authenticity analysis",
                "description": "Verify digital media.",
                "created_at": datetime.now(timezone.utc),
            },
        ]
    )
    db.service_requests.update_one = AsyncMock(
        return_value=MagicMock(matched_count=1)
    )
    db.service_request_audit.insert_one = AsyncMock()

    with patch.object(
        events.repository,
        "create_notification",
        new_callable=AsyncMock,
    ) as create:
        response = client.patch(
            f"/api/v1/admin/service-requests/{REQUEST_ID}/status",
            json={"status": "in_review"},
        )

    assert response.status_code == 200
    create.assert_awaited_once()
    assert create.await_args.kwargs["recipient_id"] == "client-1"
    assert (
        create.await_args.kwargs["notification_type"]
        == "request_status_changed"
    )

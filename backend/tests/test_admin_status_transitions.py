from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient

from app.main import create_app
from app.modules.admin.router import require_admin
from app.modules.auth.router import get_db

REQUEST_ID = ObjectId()


@pytest.mark.parametrize(
    ("current", "target"),
    [
        ("submitted", "approved"),
        ("approved", "rejected"),
        ("rejected", "rejected"),
    ],
)
def test_invalid_transition_does_not_write(current, target):
    app = create_app()
    db = MagicMock()
    app.state.database = db
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: {
        "id": "admin-1",
        "role": "admin",
    }

    db.service_requests.find_one = AsyncMock(
        return_value={"_id": REQUEST_ID, "status": current}
    )
    db.service_requests.update_one = AsyncMock()
    db.service_request_audit.insert_one = AsyncMock()

    client = TestClient(app)
    response = client.patch(
        f"/api/v1/admin/service-requests/{REQUEST_ID}/status",
        json={"status": target},
    )

    assert response.status_code == 409
    db.service_requests.update_one.assert_not_awaited()
    db.service_request_audit.insert_one.assert_not_awaited()


def test_approved_request_can_be_reopened():
    app = create_app()
    db = MagicMock()
    app.state.database = db
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: {
        "id": "admin-1",
        "role": "admin",
    }

    document = {
        "_id": REQUEST_ID,
        "client_id": "client-1",
        "service_type": "ai_services",
        "title": "Example service request",
        "description": "Example service request description",
        "status": "approved",
        "created_at": datetime.now(timezone.utc),
    }

    db.service_requests.find_one = AsyncMock(
        side_effect=[
            document,
            {**document, "status": "in_review"},
        ]
    )
    db.service_requests.update_one = AsyncMock(
        return_value=MagicMock(matched_count=1)
    )
    db.service_request_audit.insert_one = AsyncMock()

    with patch(
        "app.modules.admin.router.notify_client",
        new_callable=AsyncMock,
    ):
        client = TestClient(app)
        response = client.patch(
            f"/api/v1/admin/service-requests/{REQUEST_ID}/status",
            json={"status": "in_review"},
        )

    assert response.status_code == 200
    assert response.json()["status"] == "in_review"
    update = db.service_requests.update_one.await_args.args[1]
    assert update["$set"]["status"] == "in_review"
    assert update["$push"]["status_history"]["new_status"] == "in_review"
    db.service_request_audit.insert_one.assert_not_awaited()

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock

from bson import ObjectId
from test_service_request_lifecycle import DOCUMENT, REQUEST_ID, make_client


def test_admin_details_merges_legacy_and_embedded_history():
    client, db = make_client("admin")

    now = datetime.now(timezone.utc)
    old_event = {
        "_id": ObjectId(),
        "previous_status": "submitted",
        "new_status": "in_review",
        "admin_id": "admin-1",
        "created_at": now - timedelta(days=2),
    }
    new_event = {
        "_id": ObjectId(),
        "previous_status": "in_review",
        "new_status": "approved",
        "admin_id": "admin-1",
        "created_at": now - timedelta(days=1),
    }

    db.service_requests.find_one = AsyncMock(
        return_value={
            **DOCUMENT,
            "status": "approved",
            "status_history": [new_event],
        }
    )

    cursor = MagicMock()
    cursor.sort.return_value = cursor
    cursor.to_list = AsyncMock(return_value=[old_event])
    db.service_request_audit.find.return_value = cursor
    db.users.find_one = AsyncMock(return_value=None)

    response = client.get(
        f"/api/v1/admin/service-requests/{REQUEST_ID}"
    )

    assert response.status_code == 200
    history = response.json()["history"]

    assert len(history) == 2
    assert [item["new_status"] for item in history] == [
        "in_review",
        "approved",
    ]

    assert all(
        {"id", "previous_status", "new_status", "admin_id", "created_at"}
        <= item.keys()
        for item in history
    )

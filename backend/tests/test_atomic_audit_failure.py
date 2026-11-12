from unittest.mock import AsyncMock, patch

import pytest
from pymongo.errors import OperationFailure
from test_service_request_lifecycle import DOCUMENT, REQUEST_ID, make_client


def test_atomic_update_failure_does_not_create_separate_audit():
    client, db = make_client("admin")

    db.service_requests.find_one = AsyncMock(
        return_value=DOCUMENT
    )
    db.service_requests.update_one = AsyncMock(
        side_effect=OperationFailure("Simulated write failure")
    )
    db.service_request_audit.insert_one = AsyncMock()

    with patch(
        "app.modules.admin.router.notify_client",
        new_callable=AsyncMock,
    ) as notify:
        with pytest.raises(OperationFailure):
            client.patch(
                f"/api/v1/admin/service-requests/{REQUEST_ID}/status",
                json={"status": "in_review"},
            )

    update = db.service_requests.update_one.await_args.args[1]
    assert update["$set"]["status"] == "in_review"
    assert update["$push"]["status_history"]["new_status"] == "in_review"

    db.service_request_audit.insert_one.assert_not_awaited()
    notify.assert_not_awaited()

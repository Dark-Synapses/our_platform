from unittest.mock import AsyncMock, MagicMock

import pytest
from pymongo import ASCENDING, DESCENDING

from app.core.indexes import ensure_application_indexes


@pytest.mark.asyncio
async def test_application_indexes():
    db = MagicMock()
    db.service_requests.create_index = AsyncMock()
    db.service_request_audit.create_index = AsyncMock()
    db.contact_inquiries.create_index = AsyncMock()
    db.notifications.create_index = AsyncMock()

    await ensure_application_indexes(db)

    db.service_requests.create_index.assert_any_await(
        [
            ("client_id", ASCENDING),
            ("created_at", DESCENDING),
        ],
        name="client_requests_recent",
    )

    db.service_requests.create_index.assert_any_await(
        [("created_at", DESCENDING)],
        name="service_requests_recent",
    )

    db.service_request_audit.create_index.assert_awaited_once_with(
        [
            ("request_id", ASCENDING),
            ("created_at", DESCENDING),
        ],
        name="request_audit_recent",
    )

    db.contact_inquiries.create_index.assert_awaited_once_with(
        [("created_at", DESCENDING)],
        name="contact_inquiries_recent",
    )

    db.notifications.create_index.assert_any_await(
        [
            ("recipient_id", ASCENDING),
            ("created_at", DESCENDING),
        ],
        name="recipient_notifications_recent",
    )

    db.notifications.create_index.assert_any_await(
        [
            ("recipient_id", ASCENDING),
            ("is_read", ASCENDING),
        ],
        name="recipient_notifications_unread",
    )

    assert db.notifications.create_index.await_count == 2

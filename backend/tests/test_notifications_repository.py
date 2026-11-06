from unittest.mock import AsyncMock, MagicMock

import pytest
from bson import ObjectId

from app.modules.notifications import repository


@pytest.mark.asyncio
async def test_create_notification():
    db = MagicMock()
    db.notifications.insert_one = AsyncMock(
        return_value=MagicMock(inserted_id=ObjectId())
    )

    result = await repository.create_notification(
        db,
        recipient_id="client-1",
        recipient_role="client",
        notification_type="request_status_changed",
        title="Request updated",
        message="Your request is now in review.",
    )

    assert result["recipient_id"] == "client-1"
    assert result["is_read"] is False
    db.notifications.insert_one.assert_awaited_once()


@pytest.mark.asyncio
async def test_unread_count():
    db = MagicMock()
    db.notifications.count_documents = AsyncMock(return_value=3)

    count = await repository.unread_count(db, "client-1")

    assert count == 3
    db.notifications.count_documents.assert_awaited_once_with(
        {"recipient_id": "client-1", "is_read": False}
    )


@pytest.mark.asyncio
async def test_mark_as_read_is_scoped_to_recipient():
    db = MagicMock()
    db.notifications.update_one = AsyncMock(
        return_value=MagicMock(matched_count=1)
    )

    notification_id = str(ObjectId())

    result = await repository.mark_as_read(
        db, notification_id, "client-1"
    )

    assert result is True
    query = db.notifications.update_one.await_args.args[0]
    assert query["recipient_id"] == "client-1"


@pytest.mark.asyncio
async def test_invalid_notification_id():
    db = MagicMock()

    result = await repository.mark_as_read(
        db, "invalid-id", "client-1"
    )

    assert result is False
    db.notifications.update_one.assert_not_called()

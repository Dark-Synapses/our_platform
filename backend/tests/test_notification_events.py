from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.modules.notifications import events


@pytest.mark.asyncio
async def test_notify_all_admins():
    db = MagicMock()
    db.users.find.return_value.to_list = AsyncMock(
        return_value=[
            {"_id": "admin-1"},
            {"_id": "admin-2"},
        ]
    )

    with patch.object(
        events.repository,
        "create_notification",
        new_callable=AsyncMock,
    ) as create:
        await events.notify_admins(
            db,
            "new_service_request",
            "New request",
            "A new request was submitted.",
        )

    assert create.await_count == 2


@pytest.mark.asyncio
async def test_admin_notification_failure_is_isolated():
    db = MagicMock()
    db.users.find.return_value.to_list = AsyncMock(
        return_value=[
            {"_id": "admin-1"},
            {"_id": "admin-2"},
        ]
    )

    with patch.object(
        events.repository,
        "create_notification",
        new_callable=AsyncMock,
        side_effect=[RuntimeError("failure"), None],
    ) as create:
        await events.notify_admins(
            db,
            "new_service_request",
            "New request",
            "A new request was submitted.",
        )

    assert create.await_count == 2


@pytest.mark.asyncio
async def test_notify_client():
    db = MagicMock()

    with patch.object(
        events.repository,
        "create_notification",
        new_callable=AsyncMock,
    ) as create:
        await events.notify_client(
            db,
            "client-1",
            "request_status_changed",
            "Request updated",
            "Your request is now in review.",
        )

    create.assert_awaited_once()
    assert create.await_args.kwargs["recipient_id"] == "client-1"


@pytest.mark.asyncio
async def test_admin_lookup_failure_does_not_raise():
    db = MagicMock()
    db.users.find.return_value.to_list = AsyncMock(
        side_effect=RuntimeError("MongoDB unavailable")
    )

    await events.notify_admins(
        db,
        "new_service_request",
        "New request",
        "A new request was submitted.",
    )

    db.notifications.insert_one.assert_not_called()


@pytest.mark.asyncio
async def test_client_notification_failure_does_not_raise():
    db = MagicMock()

    with patch.object(
        events.repository,
        "create_notification",
        new_callable=AsyncMock,
        side_effect=RuntimeError("Notification insert failed"),
    ) as create:
        await events.notify_client(
            db,
            "client-1",
            "request_status_changed",
            "Request updated",
            "Your request status changed.",
        )

    create.assert_awaited_once()
    assert create.await_args.kwargs["recipient_id"] == "client-1"

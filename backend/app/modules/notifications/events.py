import logging

from app.modules.notifications import repository

logger = logging.getLogger(__name__)


async def notify_admins(
    db,
    notification_type,
    title,
    message,
    reference_id=None,
):
    try:
        cursor = db.users.find({"role": "admin"})
        admins = await cursor.to_list(length=1000)
    except Exception:
        logger.exception("Failed to load notification recipients")
        return

    for admin in admins:
        try:
            await repository.create_notification(
                db,
                recipient_id=admin["_id"],
                recipient_role="admin",
                notification_type=notification_type,
                title=title,
                message=message,
                reference_id=reference_id,
            )
        except Exception:
            logger.exception(
                "Failed to create admin notification"
            )


async def notify_client(
    db,
    client_id,
    notification_type,
    title,
    message,
    reference_id=None,
):
    try:
        await repository.create_notification(
            db,
            recipient_id=client_id,
            recipient_role="client",
            notification_type=notification_type,
            title=title,
            message=message,
            reference_id=reference_id,
        )
    except Exception:
        logger.exception(
            "Failed to create client notification"
        )

from datetime import datetime, timezone

from bson import ObjectId
from pymongo import DESCENDING


async def create_notification(
    db,
    recipient_id,
    recipient_role,
    notification_type,
    title,
    message,
    reference_id=None,
):
    document = {
        "recipient_id": str(recipient_id),
        "recipient_role": recipient_role,
        "type": notification_type,
        "title": title,
        "message": message,
        "reference_id": str(reference_id) if reference_id else None,
        "is_read": False,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.notifications.insert_one(document)
    document["_id"] = result.inserted_id
    return document


async def list_notifications(db, recipient_id, limit=50):
    cursor = db.notifications.find(
        {"recipient_id": str(recipient_id)}
    ).sort("created_at", DESCENDING)

    return await cursor.to_list(length=limit)


async def unread_count(db, recipient_id):
    return await db.notifications.count_documents(
        {
            "recipient_id": str(recipient_id),
            "is_read": False,
        }
    )


async def mark_as_read(db, notification_id, recipient_id):
    if not ObjectId.is_valid(notification_id):
        return False

    result = await db.notifications.update_one(
        {
            "_id": ObjectId(notification_id),
            "recipient_id": str(recipient_id),
        },
        {"$set": {"is_read": True}},
    )

    return result.matched_count > 0

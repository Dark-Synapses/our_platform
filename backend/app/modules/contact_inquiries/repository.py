from datetime import datetime, timezone

from pymongo import DESCENDING


async def create_inquiry(db, data):
    now = datetime.now(timezone.utc)

    document = {
        "name": data.name.strip(),
        "email": str(data.email).strip().lower(),
        "company": data.company.strip(),
        "service": data.service,
        "message": data.message.strip(),
        "status": "submitted",
        "created_at": now,
    }

    result = await db.contact_inquiries.insert_one(document)
    return {
        "id": str(result.inserted_id),
        "status": document["status"],
        "created_at": now,
    }


async def list_inquiries(db):
    cursor = db.contact_inquiries.find().sort(
        "created_at", DESCENDING
    )
    return await cursor.to_list(length=100)

from datetime import datetime, timezone


async def create_request(db, client_id, data):
    document = {
        "client_id": client_id,
        "service_type": data.service_type,
        "title": data.title.strip(),
        "description": data.description.strip(),
        "status": "submitted",
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.service_requests.insert_one(document)
    document["_id"] = result.inserted_id
    return document


async def list_client_requests(db, client_id):
    cursor = db.service_requests.find(
        {"client_id": client_id}
    ).sort("created_at", -1)

    return await cursor.to_list(length=100)

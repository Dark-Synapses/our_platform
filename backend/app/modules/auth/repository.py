from datetime import datetime, timedelta, timezone

from pymongo import ASCENDING


async def ensure_indexes(db):
    await db.users.create_index(
        [("email", ASCENDING)],
        unique=True,
    )
    await db.sessions.create_index(
        [("token_hash", ASCENDING)],
        unique=True,
    )
    await db.sessions.create_index(
        "expires_at",
        expireAfterSeconds=0,
    )


async def find_user_by_email(db, email):
    return await db.users.find_one({"email": email})


async def find_user_by_id(db, user_id):
    return await db.users.find_one({"_id": user_id})


async def create_user(db, user):
    result = await db.users.insert_one(user)
    return await find_user_by_id(db, result.inserted_id)


async def create_session(db, user_id, token_hash):
    now = datetime.now(timezone.utc)
    await db.sessions.insert_one({
        "user_id": user_id,
        "token_hash": token_hash,
        "created_at": now,
        "expires_at": now + timedelta(days=7),
    })


async def find_session(db, token_hash):
    return await db.sessions.find_one({
        "token_hash": token_hash,
        "expires_at": {"$gt": datetime.now(timezone.utc)},
    })


async def delete_session(db, token_hash):
    await db.sessions.delete_one({"token_hash": token_hash})

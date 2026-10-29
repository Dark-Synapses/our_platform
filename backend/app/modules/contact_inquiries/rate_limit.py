from datetime import datetime, timezone

from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError


WINDOW_SECONDS = 15 * 60
MAX_REQUESTS = 5


async def check_rate_limit(db, client_ip: str) -> bool:
    now = datetime.now(timezone.utc)
    window_start = int(now.timestamp()) // WINDOW_SECONDS * WINDOW_SECONDS
    key = f"contact:{client_ip}:{window_start}"

    for attempt in range(3):
        try:
            result = await db.contact_rate_limits.find_one_and_update(
                {"_id": key},
                {
                    "$inc": {"count": 1},
                    "$setOnInsert": {
                        "expires_at": datetime.fromtimestamp(
                            window_start + 2 * WINDOW_SECONDS,
                            tz=timezone.utc,
                        ),
                    },
                },
                upsert=True,
                return_document=ReturnDocument.AFTER,
            )
            return result["count"] <= MAX_REQUESTS
        except DuplicateKeyError:
            if attempt == 2:
                raise

    raise RuntimeError("Rate limit update failed")


async def ensure_indexes(db):
    await db.contact_rate_limits.create_index(
        "expires_at",
        expireAfterSeconds=0,
    )

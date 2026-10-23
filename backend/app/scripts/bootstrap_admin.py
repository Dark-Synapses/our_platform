import asyncio
from datetime import datetime, timezone

from app.core.config import Settings
from app.core.database import create_client


async def main():
    email = input("Existing account email: ").strip().lower()

    if not email or "@" not in email:
        raise SystemExit("Invalid email.")

    confirmation = input(
        f"Promote {email} to admin? Type PROMOTE: "
    )
    if confirmation != "PROMOTE":
        raise SystemExit("Cancelled.")

    settings = Settings()
    client = create_client(settings)

    try:
        db = client[settings.mongo_database]
        user = await db.users.find_one({"email": email})

        if user is None:
            raise SystemExit(
                "Account not found. Register it first."
            )

        result = await db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "role": "admin",
                    "role_updated_at": datetime.now(timezone.utc),
                }
            },
        )

        print(
            "Admin account configured."
            if result.modified_count
            else "Account already has this role."
        )
    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())

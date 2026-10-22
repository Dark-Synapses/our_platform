from pymongo import AsyncMongoClient

from app.core.config import Settings


def create_client(settings: Settings) -> AsyncMongoClient:
    # Separate arguments safely support passwords containing URI characters.
    return AsyncMongoClient(
        host=settings.mongo_host,
        username=settings.mongo_username,
        password=settings.mongo_password.get_secret_value(),
        authSource="admin",
        serverSelectionTimeoutMS=3000,
    )

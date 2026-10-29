from pymongo import AsyncMongoClient

from app.core.config import Settings


def create_client(settings: Settings) -> AsyncMongoClient:
    if settings.mongo_uri is not None:
        uri = settings.mongo_uri.get_secret_value().strip()

        if not uri.startswith(("mongodb://", "mongodb+srv://")):
            raise ValueError("DS_MONGO_URI must be a MongoDB connection URI")

        return AsyncMongoClient(
            uri,
            serverSelectionTimeoutMS=10000,
        )

    if settings.mongo_password is None:
        raise ValueError(
            "Set DS_MONGO_URI or DS_MONGO_PASSWORD"
        )

    return AsyncMongoClient(
        host=settings.mongo_host,
        username=settings.mongo_username,
        password=settings.mongo_password.get_secret_value(),
        authSource="admin",
        serverSelectionTimeoutMS=3000,
    )

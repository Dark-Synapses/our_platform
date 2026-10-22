from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import Settings
from app.core.database import create_client
from app.modules.health.router import router as health_router


def create_app(settings: Settings | None = None) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        config = settings or Settings()
        client = create_client(config)
        app.state.mongo = client
        app.state.database = client[config.mongo_database]
        try:
            yield
        finally:
            await client.close()

    application = FastAPI(title="Dark Synapses API", lifespan=lifespan)
    application.include_router(health_router, prefix="/api/v1")
    return application


app = create_app()

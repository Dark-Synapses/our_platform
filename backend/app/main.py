from app.modules.admin.router import router as admin_router
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import Settings
from app.core.database import create_client
from app.modules.auth import repository as auth_repository
from app.modules.auth.router import router as auth_router
from app.modules.service_requests.router import router as service_requests_router
from app.modules.health.router import router as health_router


def create_app(settings: Settings | None = None) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        config = settings or Settings()
        client = create_client(config)
        app.state.mongo = client
        app.state.database = client[config.mongo_database]
        await auth_repository.ensure_indexes(app.state.database)
        try:
            yield
        finally:
            await client.close()

    application = FastAPI(title="Dark Synapses API", lifespan=lifespan)
    application.state.cookie_secure = False  # Local HTTP only
    application.include_router(auth_router, prefix="/api/v1")
    application.include_router(service_requests_router, prefix="/api/v1")
    application.include_router(admin_router, prefix="/api/v1")
    application.include_router(health_router, prefix="/api/v1")
    return application


app = create_app()

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import Settings
from app.core.database import create_client
from app.core.indexes import ensure_application_indexes
from app.modules.admin.router import router as admin_router
from app.modules.auth import repository as auth_repository
from app.modules.auth.router import router as auth_router
from app.modules.contact_inquiries.rate_limit import (
    ensure_indexes as ensure_contact_indexes,
)
from app.modules.contact_inquiries.router import router as contact_inquiries_router
from app.modules.health.router import router as health_router
from app.modules.karen.llm import KarenLLM
from app.modules.karen.router import router as karen_router
from app.modules.karen.runtime import KarenRuntime
from app.modules.karen.session import SessionStore
from app.modules.notifications.router import router as notifications_router
from app.modules.projects.router import router as projects_router
from app.modules.service_requests.router import router as service_requests_router


def create_app(settings: Settings | None = None) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        config = settings or Settings()
        client = create_client(config)
        app.state.mongo = client
        app.state.database = client[config.mongo_database]
        await auth_repository.ensure_indexes(app.state.database)
        await ensure_contact_indexes(app.state.database)
        await ensure_application_indexes(app.state.database)
        app.state.karen = None
        app.state.karen_llm = None
        app.state.karen_sessions = None
        try:
            if config.karen_enabled:
                app.state.karen = KarenRuntime(config)
                app.state.karen_llm = KarenLLM(config)
                app.state.karen_sessions = SessionStore(config)
            yield
        finally:
            try:
                try:
                    if app.state.karen_llm is not None:
                        await app.state.karen_llm.close()
                finally:
                    if app.state.karen is not None:
                        await app.state.karen.close()
            finally:
                try:
                    if app.state.karen_sessions is not None:
                        await app.state.karen_sessions.close()
                finally:
                    await client.close()

    application = FastAPI(title="Dark Synapses API", lifespan=lifespan)
    config = settings or Settings()
    application.state.cookie_secure = config.cookie_secure
    application.state.allowed_origins = {
        origin.strip() for origin in config.allowed_origins.split(",") if origin.strip()
    }
    application.include_router(auth_router, prefix="/api/v1")
    application.include_router(contact_inquiries_router, prefix="/api/v1")
    application.include_router(service_requests_router, prefix="/api/v1")
    application.include_router(admin_router, prefix="/api/v1")
    application.include_router(health_router, prefix="/api/v1")
    application.include_router(karen_router, prefix="/api/v1")
    application.include_router(notifications_router, prefix="/api/v1")
    application.include_router(projects_router, prefix="/api/v1")
    return application


app = create_app()

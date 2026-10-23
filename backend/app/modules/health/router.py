from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from pymongo.errors import PyMongoError

router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    status: str = "ok"


@router.get("/live", response_model=HealthResponse)
async def liveness() -> HealthResponse:
    return HealthResponse()


@router.get("/ready", response_model=HealthResponse)
async def readiness(request: Request) -> HealthResponse:
    try:
        await request.app.state.mongo.admin.command("ping")
    except PyMongoError as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return HealthResponse()

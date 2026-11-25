from fastapi import APIRouter, HTTPException, Request

router = APIRouter(prefix="/karen", tags=["karen"])


@router.get("/health", include_in_schema=False)
async def health(request: Request):
    runtime = getattr(request.app.state, "karen", None)
    if runtime is None:
        raise HTTPException(status_code=503, detail="Karen disabled")
    # Passive public probe: never trigger expensive model work from HTTP.
    return {"status": "initialized" if runtime.resources else "idle"}

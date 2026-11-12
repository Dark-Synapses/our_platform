from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response

from app.core.security import hash_session_token
from app.modules.auth import repository, service
from app.modules.auth.schemas import (
    LoginRequest,
    RegisterRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

COOKIE_NAME = "ds_session"


def get_db(request: Request):
    return request.app.state.database


def check_origin(request: Request):
    from urllib.parse import urlsplit

    allowed_origins = request.app.state.allowed_origins
    origin = request.headers.get("origin")

    if origin is None:
        referer = request.headers.get("referer")
        if referer:
            try:
                parsed = urlsplit(referer)
                if (
                    parsed.scheme in ("http", "https")
                    and parsed.hostname
                    and parsed.username is None
                    and parsed.password is None
                ):
                    port = parsed.port
                    host = parsed.hostname
                    if ":" in host:
                        host = f"[{host}]"
                    origin = (
                        f"{parsed.scheme}://{host}"
                        + (f":{port}" if port is not None else "")
                    )
            except ValueError:
                pass

    if origin not in allowed_origins:
        raise HTTPException(
            status_code=403,
            detail="Invalid origin",
        )


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(
    data: RegisterRequest,
    request: Request,
    db=Depends(get_db),
):
    check_origin(request)
    return await service.register(db, data)


@router.post("/login", response_model=UserResponse)
async def login(
    data: LoginRequest,
    request: Request,
    response: Response,
    db=Depends(get_db),
):
    check_origin(request)
    token, user = await service.login(db, data)

    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=request.app.state.cookie_secure,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
        path="/",
    )
    return user


@router.get("/me", response_model=UserResponse)
async def me(
    ds_session: str | None = Cookie(default=None),
    db=Depends(get_db),
):
    return await service.current_user(db, ds_session)


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    ds_session: str | None = Cookie(default=None),
    db=Depends(get_db),
):
    check_origin(request)

    if ds_session:
        await repository.delete_session(
            db, hash_session_token(ds_session)
        )

    response.delete_cookie(
        COOKIE_NAME,
        path="/",
        samesite="lax",
        secure=request.app.state.cookie_secure,
        httponly=True,
    )
    return {"message": "Logged out"}

from datetime import datetime, timezone

from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError

from app.core.security import (
    create_session_token,
    hash_password,
    hash_session_token,
    verify_password,
)
from app.modules.auth import repository


def normalize_email(email):
    return email.strip().lower()


def public_user(user):
    return {
        "id": str(user["_id"]),
        "full_name": user["full_name"],
        "email": user["email"],
        "company_name": user.get("company_name"),
        "role": user["role"],
    }


async def register(db, data):
    email = normalize_email(str(data.email))

    user = {
        "full_name": data.full_name.strip(),
        "email": email,
        "password_hash": hash_password(data.password),
        "company_name": data.company_name,
        "role": "client",
        "created_at": datetime.now(timezone.utc),
    }

    try:
        created = await repository.create_user(db, user)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Email already registered",
        ) from None

    return public_user(created)


async def login(db, data):
    user = await repository.find_user_by_email(
        db, normalize_email(str(data.email))
    )

    if not user or not verify_password(
        data.password, user["password_hash"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_session_token()
    await repository.create_session(
        db, user["_id"], hash_session_token(token)
    )
    return token, public_user(user)


async def current_user(db, token):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = await repository.find_session(
        db, hash_session_token(token)
    )
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = await repository.find_user_by_id(
        db, session["user_id"]
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")

    return public_user(user)

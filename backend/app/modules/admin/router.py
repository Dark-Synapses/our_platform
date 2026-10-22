from datetime import datetime, timezone
from typing import Literal

from bson import ObjectId
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request
from pydantic import BaseModel
from pymongo import DESCENDING

from app.modules.auth import service as auth_service
from app.modules.auth.router import check_origin, get_db
from app.modules.service_requests.router import serialize_request

router = APIRouter(prefix="/admin", tags=["Admin"])


async def require_admin(
    request: Request,
    ds_session: str | None = Cookie(default=None),
):
    user = await auth_service.current_user(
        request.app.state.database,
        ds_session,
    )

    if user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return user


class StatusUpdate(BaseModel):
    status: Literal[
        "submitted",
        "in_review",
        "approved",
        "rejected",
    ]


@router.get("/service-requests")
async def list_requests(
    admin=Depends(require_admin),
    db=Depends(get_db),
):
    cursor = db.service_requests.find().sort(
        "created_at", DESCENDING
    )
    documents = await cursor.to_list(length=100)

    return [serialize_request(item) for item in documents]


@router.patch("/service-requests/{request_id}/status")
async def update_request_status(
    request_id: str,
    data: StatusUpdate,
    request: Request,
    admin=Depends(require_admin),
    db=Depends(get_db),
):
    check_origin(request)

    if not ObjectId.is_valid(request_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid request ID",
        )

    object_id = ObjectId(request_id)
    existing = await db.service_requests.find_one(
        {"_id": object_id}
    )

    if existing is None:
        raise HTTPException(
            status_code=404,
            detail="Service request not found",
        )

    now = datetime.now(timezone.utc)

    result = await db.service_requests.update_one(
        {
            "_id": object_id,
            "status": existing["status"],
        },
        {
            "$set": {
                "status": data.status,
                "updated_at": now,
                "updated_by": admin["id"],
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=409,
            detail="Request changed. Refresh and retry.",
        )

    await db.service_request_audit.insert_one({
        "request_id": object_id,
        "admin_id": admin["id"],
        "previous_status": existing["status"],
        "new_status": data.status,
        "created_at": now,
    })

    updated = await db.service_requests.find_one(
        {"_id": object_id}
    )
    return serialize_request(updated)


@router.get("/service-requests/{request_id}")
async def get_request_details(
    request_id: str,
    admin=Depends(require_admin),
    db=Depends(get_db),
):
    if not ObjectId.is_valid(request_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid request ID",
        )

    object_id = ObjectId(request_id)
    document = await db.service_requests.find_one(
        {"_id": object_id}
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Service request not found",
        )

    client = None
    client_id = document.get("client_id")

    if client_id and ObjectId.is_valid(str(client_id)):
        user = await db.users.find_one(
            {"_id": ObjectId(str(client_id))}
        )

        if user:
            client = {
                "id": str(user["_id"]),
                "full_name": user.get("full_name"),
                "email": user.get("email"),
                "company_name": user.get("company_name"),
            }

    history_cursor = db.service_request_audit.find(
        {"request_id": object_id}
    ).sort("created_at", 1)

    history_docs = await history_cursor.to_list(
        length=500
    )

    history = [
        {
            "id": str(event["_id"]),
            "previous_status": event.get(
                "previous_status"
            ),
            "new_status": event.get("new_status"),
            "admin_id": str(event.get("admin_id", "")),
            "created_at": event["created_at"],
        }
        for event in history_docs
    ]

    return {
        "request": serialize_request(document),
        "client": client,
        "history": history,
    }

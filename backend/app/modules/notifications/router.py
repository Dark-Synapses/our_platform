from fastapi import APIRouter, Cookie, Depends, HTTPException, Request

from app.modules.auth import service as auth_service
from app.modules.auth.router import check_origin, get_db
from app.modules.notifications import repository

router = APIRouter(prefix="/notifications", tags=["Notifications"])


async def get_notification_user(
    request: Request,
    ds_session: str | None = Cookie(default=None),
):
    return await auth_service.current_user(
        request.app.state.database,
        ds_session,
    )


def serialize_notification(document):
    return {
        "id": str(document["_id"]),
        "type": document["type"],
        "title": document["title"],
        "message": document["message"],
        "reference_id": document.get("reference_id"),
        "is_read": document["is_read"],
        "created_at": document["created_at"],
    }


@router.get("")
async def get_notifications(
    user=Depends(get_notification_user),
    db=Depends(get_db),
):
    documents = await repository.list_notifications(
        db, user["id"]
    )
    return [serialize_notification(item) for item in documents]


@router.get("/unread-count")
async def get_unread_count(
    user=Depends(get_notification_user),
    db=Depends(get_db),
):
    count = await repository.unread_count(db, user["id"])
    return {"unread_count": count}


@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    request: Request,
    user=Depends(get_notification_user),
    db=Depends(get_db),
):
    check_origin(request)

    updated = await repository.mark_as_read(
        db, notification_id, user["id"]
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    return {"status": "read"}

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request

from app.modules.auth import service as auth_service
from app.modules.auth.router import check_origin, get_db
from app.modules.service_requests import repository
from app.modules.service_requests.schemas import (
    ServiceRequestCreate,
    ServiceRequestResponse,
)

router = APIRouter(prefix="/service-requests", tags=["Service Requests"])


async def require_client(
    request: Request,
    ds_session: str | None = Cookie(default=None),
):
    user = await auth_service.current_user(
        request.app.state.database,
        ds_session,
    )

    if user["role"] != "client":
        raise HTTPException(status_code=403, detail="Client access required")

    return user


def serialize_request(document):
    return {
        "id": str(document["_id"]),
        "service_type": document["service_type"],
        "title": document["title"],
        "description": document["description"],
        "status": document["status"],
        "created_at": document["created_at"],
    }


@router.post(
    "",
    response_model=ServiceRequestResponse,
    status_code=201,
)
async def create_service_request(
    data: ServiceRequestCreate,
    request: Request,
    user=Depends(require_client),
    db=Depends(get_db),
):
    check_origin(request)

    document = await repository.create_request(
        db, user["id"], data
    )
    return serialize_request(document)


@router.get("", response_model=list[ServiceRequestResponse])
async def get_my_requests(
    user=Depends(require_client),
    db=Depends(get_db),
):
    documents = await repository.list_client_requests(
        db, user["id"]
    )
    return [serialize_request(item) for item in documents]

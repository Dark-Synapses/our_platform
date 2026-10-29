from fastapi import APIRouter, Depends, HTTPException, Request

from app.modules.auth.router import check_origin, get_db
from app.modules.admin.router import require_admin
from app.modules.contact_inquiries import repository
from app.modules.contact_inquiries.rate_limit import check_rate_limit
from app.modules.contact_inquiries.schemas import (
    ContactInquiryCreate,
    ContactInquiryResponse,
)

router = APIRouter(tags=["Contact Inquiries"])


@router.post(
    "/contact-inquiries",
    response_model=ContactInquiryResponse,
    status_code=201,
)
async def create_contact_inquiry(
    data: ContactInquiryCreate,
    request: Request,
    db=Depends(get_db),
):
    check_origin(request)

    # Honeypot: legitimate users leave this field empty.
    if data.website:
        raise HTTPException(
            status_code=400,
            detail="Unable to process inquiry",
        )

    if not data.name.strip() or not data.message.strip():
        raise HTTPException(
            status_code=422,
            detail="Name and message are required",
        )

    client_ip = request.client.host if request.client else "unknown"

    if not await check_rate_limit(db, client_ip):
        raise HTTPException(
            status_code=429,
            detail="Too many inquiries. Please try again later.",
            headers={"Retry-After": "900"},
        )

    return await repository.create_inquiry(db, data)


@router.get("/admin/contact-inquiries")
async def admin_list_contact_inquiries(
    admin=Depends(require_admin),
    db=Depends(get_db),
):
    documents = await repository.list_inquiries(db)

    return [
        {
            "id": str(item["_id"]),
            "name": item["name"],
            "email": item["email"],
            "company": item.get("company", ""),
            "service": item["service"],
            "message": item["message"],
            "status": item["status"],
            "created_at": item["created_at"],
        }
        for item in documents
    ]

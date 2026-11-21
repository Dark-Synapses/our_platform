import re
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from pymongo import ASCENDING

from app.modules.admin.router import require_admin
from app.modules.auth.router import check_origin, get_db

router = APIRouter(tags=["Projects"])
SERVICES = {
    "AI Services",
    "Cybersecurity",
    "AI Security",
    "AI-Powered Security",
    "Digital Forensics",
}


class ProjectInput(BaseModel):
    slug: str = Field(min_length=3, max_length=100)
    title: str = Field(min_length=2, max_length=160)
    category: Literal[
        "AI Services",
        "Cybersecurity",
        "AI Security",
        "AI-Powered Security",
        "Digital Forensics",
    ] = "AI Services"
    service_categories: list[str] = Field(default_factory=list, max_length=5)
    discipline: str = Field(default="", max_length=160)
    summary: str = Field(default="", max_length=2000)
    challenge: str = Field(default="", max_length=3000)
    approach: str = Field(default="", max_length=3000)
    technologies: list[str] = Field(default_factory=list, max_length=20)
    features: list[str] = Field(default_factory=list, max_length=30)
    data_story: str = Field(default="", max_length=3000)
    media: list[str] = Field(default_factory=list, max_length=15)
    image: str | None = None
    note: str = Field(default="", max_length=3000)
    featured: bool = False
    display_order: int = Field(default=100, ge=0, le=100000)
    status: Literal["draft", "published", "in_progress"] = "draft"


def validate_project(data: ProjectInput):
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", data.slug):
        raise HTTPException(422, "Slug must be lowercase kebab-case")
    if any(x not in SERVICES for x in data.service_categories):
        raise HTTPException(422, "Invalid service category")
    for url in [*data.media, *([data.image] if data.image else [])]:
        if not url.startswith("/") or url.startswith("//") or "\\" in url:
            raise HTTPException(422, "Media must use safe site-relative paths")


def serialize(d, public=False):
    excluded = {"_id", "created_at", "updated_at", "updated_by"}
    if public:
        excluded.add("note")
    return {k: v for k, v in d.items() if k not in excluded}


@router.get("/projects")
async def list_public_projects(db=Depends(get_db)):
    cursor = db.projects.find({"status": "published"}).sort(
        [("display_order", ASCENDING), ("slug", ASCENDING)]
    )
    return [serialize(x, public=True) for x in await cursor.to_list(length=200)]


@router.get("/projects/{slug}")
async def get_public_project(slug: str, db=Depends(get_db)):
    doc = await db.projects.find_one({"slug": slug, "status": "published"})
    if not doc:
        raise HTTPException(404, "Project not found")
    return serialize(doc, public=True)


@router.get("/admin/projects")
async def list_admin_projects(admin=Depends(require_admin), db=Depends(get_db)):
    docs = (
        await db.projects.find({})
        .sort([("display_order", ASCENDING), ("slug", ASCENDING)])
        .to_list(length=200)
    )
    return [serialize(x) for x in docs]


@router.put("/admin/projects/{slug}")
async def upsert_project(
    slug: str,
    data: ProjectInput,
    request: Request,
    admin=Depends(require_admin),
    db=Depends(get_db),
):
    check_origin(request)
    validate_project(data)
    if slug != data.slug:
        raise HTTPException(422, "URL slug and body slug must match")
    now = datetime.now(timezone.utc)
    payload = data.model_dump()
    payload["updated_at"] = now
    payload["updated_by"] = admin["id"]
    await db.projects.update_one(
        {"slug": slug},
        {"$set": payload, "$setOnInsert": {"created_at": now}},
        upsert=True,
    )
    return {"ok": True, "slug": slug}


@router.delete("/admin/projects/{slug}")
async def delete_project(
    slug: str, request: Request, admin=Depends(require_admin), db=Depends(get_db)
):
    check_origin(request)
    result = await db.projects.delete_one({"slug": slug})
    if not result.deleted_count:
        raise HTTPException(404, "Project not found")
    return {"ok": True}

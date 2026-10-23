from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


ServiceType = Literal[
    "ai_services",
    "cybersecurity",
    "ai_security",
    "ai_powered_security",
]


class ServiceRequestCreate(BaseModel):
    service_type: ServiceType
    title: str = Field(min_length=5, max_length=150)
    description: str = Field(min_length=20, max_length=5000)


class ServiceRequestResponse(BaseModel):
    id: str
    service_type: ServiceType
    title: str
    description: str
    status: Literal["submitted", "in_review", "approved", "rejected"]
    created_at: datetime

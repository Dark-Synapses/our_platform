from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, ConfigDict


ServiceName = Literal[
    "AI Services",
    "Cybersecurity Services",
    "AI Security",
    "AI-Powered Security Systems",
    "Digital Forensics & Content Authenticity",
    "Other / General Inquiry",
]


class ContactInquiryCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    company: str = Field(default="", max_length=150)
    service: ServiceName
    message: str = Field(min_length=15, max_length=5000)
    website: str = Field(default="", max_length=200)


class ContactInquiryResponse(BaseModel):
    id: str
    status: Literal["submitted"]
    created_at: datetime

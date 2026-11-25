"""Public knowledge contracts; no private records or conversation ingestion."""

import hashlib
import json
from typing import Literal
from uuid import NAMESPACE_URL, uuid5

from pydantic import BaseModel, ConfigDict, Field, field_validator

Service = Literal[
    "AI Services", "Cybersecurity", "AI Security", "AI-Powered Security",
    "Digital Forensics",
]


class KnowledgeDocument(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True, str_strip_whitespace=True)

    source_id: str = Field(pattern=r"^[a-z0-9]+(?:[-:][a-z0-9]+)*$", max_length=150)
    kind: Literal["company", "service", "project", "team", "faq"]
    title: str = Field(min_length=1, max_length=200)
    text: str = Field(min_length=1, max_length=16000)
    source_path: str = Field(min_length=1, max_length=300)
    visibility: Literal["public"] = "public"
    service: Service | None = None

    @field_validator("source_path")
    @classmethod
    def safe_path(cls, value: str) -> str:
        if not value.startswith("/") or any(
            x in value for x in ("//", "\\", "%", "?", "#", "..", "\n", "\r")
        ) or any(c.isspace() for c in value):
            raise ValueError("Expected a canonical public site path")
        if value.split("/")[1] not in {"", "about", "services", "projects", "contact"}:
            raise ValueError("Source route is not public knowledge")
        return value

    @property
    def revision(self) -> str:
        raw = json.dumps(self.model_dump(), sort_keys=True, ensure_ascii=False)
        return hashlib.sha256(raw.encode()).hexdigest()

    def point_id(self, index: int) -> str:
        if index < 0:
            raise ValueError("Invalid chunk index")
        return str(uuid5(NAMESPACE_URL, f"dark-synapses:{self.source_id}:{index}"))

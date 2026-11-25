"""Validated temporary conversation state for Karen."""

from datetime import UTC, datetime
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ContextModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ConversationTurn(ContextModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=6000)


class ProjectTopic(ContextModel):
    topic_id: str = Field(default_factory=lambda: uuid4().hex)
    title: str = Field(min_length=1, max_length=200)
    problem: str = Field(default="", max_length=2000)

    requirements: dict[str, str] = Field(
        default_factory=dict, max_length=30
    )
    constraints: dict[str, str] = Field(
        default_factory=dict, max_length=30
    )
    decisions: dict[str, str] = Field(
        default_factory=dict, max_length=20
    )
    open_questions: list[str] = Field(
        default_factory=list, max_length=10
    )


class UnresolvedEvidence(ContextModel):
    topic_id: str
    text: str = Field(min_length=1, max_length=2000)


class PendingAction(ContextModel):
    action_id: str = Field(default_factory=lambda: uuid4().hex)
    kind: Literal["contact", "service_request"]
    topic_id: str | None = None
    status: Literal["awaiting_confirmation"] = (
        "awaiting_confirmation"
    )


class KarenSessionState(ContextModel):
    schema_version: Literal[1] = 1
    session_id: str = Field(default_factory=lambda: uuid4().hex)
    revision: int = Field(default=0, ge=0)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC)
    )

    active_topic_id: str | None = None

    topics: dict[str, ProjectTopic] = Field(
        default_factory=dict, max_length=10
    )

    recent_messages: list[ConversationTurn] = Field(
        default_factory=list, max_length=8
    )

    conversation_summary: str = Field(
        default="", max_length=3000
    )

    entity_references: dict[str, str] = Field(
        default_factory=dict, max_length=20
    )

    unresolved_evidence: list[UnresolvedEvidence] = Field(
        default_factory=list, max_length=12
    )

    pending_action: PendingAction | None = None

    @model_validator(mode="after")
    def validate_references(self):
        for key, topic in self.topics.items():
            if key != topic.topic_id:
                raise ValueError("Invalid topic identifier")

        if (
            self.active_topic_id is not None
            and self.active_topic_id not in self.topics
        ):
            raise ValueError("Unknown active topic")

        if (
            self.pending_action is not None
            and self.pending_action.topic_id is not None
            and self.pending_action.topic_id not in self.topics
        ):
            raise ValueError("Unknown pending action topic")

        for evidence in self.unresolved_evidence:
            if evidence.topic_id not in self.topics:
                raise ValueError("Unknown evidence topic")

        return self

    @property
    def active_topic(self) -> ProjectTopic | None:
        if self.active_topic_id is None:
            return None
        return self.topics[self.active_topic_id]

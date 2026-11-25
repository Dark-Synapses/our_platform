"""Pure, bounded project state transitions; persistence is caller-owned."""
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError

from app.modules.karen.context import (
    KarenSessionState,
    ProjectTopic,
    UnresolvedEvidence,
)
from app.modules.karen.evidence import uncovered_spans


class StateMutationError(Exception):
    pass


class FactChange(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    section: Literal["requirements", "constraints", "decisions"]
    key: str = Field(min_length=1, max_length=100)
    value: str | None = Field(max_length=1000)
    evidence: str = Field(min_length=1, max_length=2000)


class TopicUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    title: str | None = Field(max_length=200)
    problem: str | None = Field(max_length=2000)
    changes: list[FactChange] = Field(max_length=10)


def apply_topic_update(state, resolution, update: TopicUpdate, message: str):
    """Return a validated copy; never mutate input or commit to Redis."""
    candidate = KarenSessionState.model_validate_json(state.model_dump_json())
    if (
        resolution.intent != "technical_consultation"
        or resolution.requires_clarification
        or resolution.topic_relation not in {"new", "continue", "return"}
    ):
        return candidate
    relation = resolution.topic_relation
    target = resolution.target_topic_id
    if relation == "new":
        if target is not None or len(candidate.topics) >= 10:
            raise StateMutationError("Cannot create topic")
        if not update.title or not update.title.strip():
            raise StateMutationError("Missing topic title")
        topic = ProjectTopic(title=update.title, problem=update.problem or "")
        candidate.topics[topic.topic_id] = topic
    else:
        if target not in candidate.topics:
            raise StateMutationError("Unknown topic")
        if (relation == "continue") != (target == candidate.active_topic_id):
            raise StateMutationError("Invalid topic transition")
        topic = candidate.topics[target]
        if update.title is not None or update.problem is not None:
            raise StateMutationError("Existing topic identity cannot be rewritten")
    seen = set()
    for change in update.changes:
        key = change.key.strip().lower()
        identity = (change.section, key)
        if not key or identity in seen or not change.evidence.strip():
            raise StateMutationError("Invalid or duplicate change")
        if change.evidence not in message:
            raise StateMutationError("Missing user evidence")
        seen.add(identity)
        facts = getattr(topic, change.section)
        if change.value is None:
            if key not in facts:
                raise StateMutationError("Unknown fact to remove")
            del facts[key]
        elif change.value.strip():
            facts[key] = change.value.strip()
        else:
            raise StateMutationError("Empty fact")
    candidate.active_topic_id = topic.topic_id
    # Preserve uncovered source text separately from authoritative facts.
    # Navigation-only turns do not introduce a new evidence record.
    if resolution.retrieval_query.strip() or update.changes:
        spans = uncovered_spans(message, [c.evidence for c in update.changes])
        for span in spans:
            entry = UnresolvedEvidence(topic_id=topic.topic_id, text=span)
            if entry not in candidate.unresolved_evidence:
                if len(candidate.unresolved_evidence) >= 12:
                    raise StateMutationError("Evidence capacity exceeded")
                candidate.unresolved_evidence.append(entry)
    try:
        candidate = KarenSessionState.model_validate_json(
            candidate.model_dump_json()
        )
    except ValidationError:
        raise StateMutationError("Invalid updated state") from None
    if len(candidate.model_dump_json().encode()) > 65536:
        raise StateMutationError("Session state too large")
    return candidate

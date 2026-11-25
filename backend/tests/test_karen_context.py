import pytest
from pydantic import ValidationError

from app.modules.karen.context import (
    ConversationTurn,
    KarenSessionState,
    PendingAction,
    ProjectTopic,
)


def test_new_sessions_are_isolated():
    first = KarenSessionState()
    second = KarenSessionState()

    assert first.session_id != second.session_id

    topic = ProjectTopic(title="Acoustic anomaly detection")
    first.topics[topic.topic_id] = topic

    assert not second.topics
    assert second.active_topic is None


def test_state_serialization_roundtrip():
    topic = ProjectTopic(
        title="Industrial AI",
        requirements={"data": "Healthy recordings only"},
        constraints={"deployment": "Central server"},
    )

    state = KarenSessionState(
        topics={topic.topic_id: topic},
        active_topic_id=topic.topic_id,
    )

    restored = KarenSessionState.model_validate_json(
        state.model_dump_json()
    )

    assert restored == state
    assert restored.active_topic is not None
    assert (
        restored.active_topic.constraints["deployment"]
        == "Central server"
    )


def test_multiple_topics_preserve_requirements():
    first = ProjectTopic(
        title="Acoustic AI",
        constraints={"deployment": "Central server"},
    )

    second = ProjectTopic(title="RAG security")

    state = KarenSessionState(
        topics={
            first.topic_id: first,
            second.topic_id: second,
        },
        active_topic_id=second.topic_id,
    )

    assert state.active_topic == second

    restored = KarenSessionState.model_validate({
        **state.model_dump(),
        "active_topic_id": first.topic_id,
    })

    assert restored.active_topic == first


def test_unknown_active_topic_rejected():
    with pytest.raises(ValidationError):
        KarenSessionState(active_topic_id="unknown")


def test_recent_message_limit():
    messages = [
        ConversationTurn(role="user", content="Test")
        for _ in range(9)
    ]

    with pytest.raises(ValidationError):
        KarenSessionState(recent_messages=messages)


def test_pending_action_requires_valid_topic():
    with pytest.raises(ValidationError):
        KarenSessionState(
            pending_action=PendingAction(
                kind="service_request",
                topic_id="unknown",
            )
        )


def test_unexpected_state_fields_rejected():
    with pytest.raises(ValidationError):
        KarenSessionState(unexpected_field=True)

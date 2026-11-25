import pytest

from app.modules.karen.context import KarenSessionState, ProjectTopic
from app.modules.karen.evidence import acknowledge_evidence, uncovered_spans
from app.modules.karen.resolver import QueryResolution
from app.modules.karen.state_manager import (
    StateMutationError,
    TopicUpdate,
    apply_topic_update,
)


def test_coverage_preserves_full_mixed_message():
    message = "Sampling is 16.5 kHz. Which features work?"
    assert uncovered_spans(message, ["Sampling is 16.5 kHz."]) == [message]
    assert uncovered_spans(message, [message]) == []
    assert uncovered_spans("A A", ["A"]) == ["A A"]


def test_missing_extraction_is_retained_not_promoted():
    topic = ProjectTopic(title="Audio")
    state = KarenSessionState(
        topics={topic.topic_id: topic}, active_topic_id=topic.topic_id,
    )
    resolution = QueryResolution(
        intent="technical_consultation", topic_relation="continue",
        target_topic_id=topic.topic_id, retrieval_query="Audio features",
        requires_clarification=False,
    )
    update = TopicUpdate(title=None, problem=None, changes=[])
    message = "Sampling is 16 kHz. Which features work?"
    candidate = apply_topic_update(state, resolution, update, message)
    assert not state.unresolved_evidence
    assert candidate.topics == state.topics
    assert candidate.unresolved_evidence[0].text == message
    assert candidate.unresolved_evidence[0].topic_id == topic.topic_id
    assert (
        KarenSessionState.model_validate_json(
            candidate.model_dump_json()
        ) == candidate
    )
    assert apply_topic_update(candidate, resolution, update, message) == candidate
    for i in range(11):
        candidate = apply_topic_update(candidate, resolution, update, str(i))
    with pytest.raises(StateMutationError, match="Evidence capacity exceeded"):
        apply_topic_update(candidate, resolution, update, "overflow")
    assert len(candidate.unresolved_evidence) == 12
    reviewed = acknowledge_evidence(candidate, topic.topic_id, message)
    assert len(reviewed.unresolved_evidence) == 11
    assert len(candidate.unresolved_evidence) == 12
    assert reviewed.topics == candidate.topics

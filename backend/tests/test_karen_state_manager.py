import pytest

from app.modules.karen.context import KarenSessionState
from app.modules.karen.resolver import QueryResolution
from app.modules.karen.state_manager import (
    StateMutationError,
    TopicUpdate,
    apply_topic_update,
)


def resolution(relation, target=None, **kwargs):
    return QueryResolution(**{
        "intent": "technical_consultation", "topic_relation": relation,
        "target_topic_id": target, "retrieval_query": "acoustic detection",
        "requires_clarification": False, **kwargs,
    })


def update(title=None, changes=None):
    return TopicUpdate(title=title, problem=None, changes=changes or [])


def fact(key, value, evidence):
    return dict(section="constraints", key=key, value=value, evidence=evidence)


def test_create_switch_return_and_modify():
    original = KarenSessionState()
    a = apply_topic_update(original, resolution("new"), update("Audio"), "Audio")
    aid = a.active_topic_id
    b = apply_topic_update(a, resolution("continue", aid), update(changes=[
        fact("deployment", "Central only", "Central only"),
        fact("data", "Healthy only", "Healthy only"),
    ]), "Central only; Healthy only")
    c = apply_topic_update(b, resolution("continue", aid), update(changes=[
        fact("deployment", "Edge permitted", "Edge permitted"),
    ]), "Edge permitted")
    d = apply_topic_update(c, resolution("new"), update("Video"), "Video")
    e = apply_topic_update(d, resolution("return", aid), update(), "Return")
    assert e.active_topic_id == aid
    assert len(e.topics) == 2
    assert e.active_topic.constraints == {
        "deployment": "Edge permitted", "data": "Healthy only",
    }
    assert b.active_topic.constraints["deployment"] == "Central only"
    assert not original.topics
    assert e.revision == original.revision


def test_missing_evidence_rejected_atomically():
    state = KarenSessionState()
    with pytest.raises(StateMutationError):
        apply_topic_update(state, resolution("new"), update("Audio", [
            fact("deployment", "Edge", "invented evidence"),
        ]), "Audio")
    assert not state.topics


def test_clarification_does_not_create_topic():
    state = KarenSessionState()
    result = apply_topic_update(
        state, resolution("new", requires_clarification=True),
        update("Audio"), "Audio",
    )
    assert result == state


def test_explicit_removal():
    state = apply_topic_update(KarenSessionState(), resolution("new"),
                               update("Audio", [fact("data", "A", "A")]), "A")
    result = apply_topic_update(state, resolution("continue", state.active_topic_id),
                                update(changes=[fact("data", None, "Remove A")]),
                                "Remove A")
    assert not result.active_topic.constraints
    assert state.active_topic.constraints == {"data": "A"}

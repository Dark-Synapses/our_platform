import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.modules.karen.context import KarenSessionState, ProjectTopic
from app.modules.karen.execution import build_execution_graph
from app.modules.karen.resolver import QueryResolution, ResolutionError
from app.modules.karen.state_manager import StateMutationError, TopicUpdate


def run(original, intent, relation, query, target=None, clarification=False,
        update=None, failure=None):
    result = SimpleNamespace(
        resolution=QueryResolution(
            intent=intent, topic_relation=relation, target_topic_id=target,
            retrieval_query=query, requires_clarification=clarification,
        ),
        topic_update=update,
    )
    resolver = SimpleNamespace(resolve=AsyncMock(return_value=result,
                                                 side_effect=failure))
    before = original.model_dump_json()
    try:
        return asyncio.run(build_execution_graph(resolver).ainvoke({
            "original": original, "message": " RAM 512 MB ",
        }))
    finally:
        assert original.model_dump_json() == before
        resolver.resolve.assert_awaited_once()
        assert resolver.resolve.call_args.kwargs == {"extract_updates": True}
        assert resolver.resolve.call_args.args[1] == "RAM 512 MB"


@pytest.mark.parametrize("intent,clarification,route", [
    ("general_conversation", False, "general"),
    ("company_information", False, "company"),
    ("contact", False, "action"),
    ("service_request", False, "action"),
    ("technical_consultation", True, "clarify"),
])
def test_non_mutating_routes(intent, clarification, route):
    original = KarenSessionState()
    result = run(original, intent, "none", "", clarification=clarification)
    assert result["route"] == route
    assert result["candidate"] == original
    assert result["candidate"] is not original


def test_new_topic():
    result = run(KarenSessionState(), "technical_consultation", "new", "AI",
                 update=TopicUpdate(title="AI", problem=None, changes=[]))
    assert result["route"] == "technical"
    assert result["candidate"].active_topic.title == "AI"


@pytest.mark.parametrize("relation", ["continue", "return"])
def test_fact_update(relation):
    topic = ProjectTopic(title="AI", constraints={"ram": "256 MB"})
    other = ProjectTopic(title="Other")
    original = KarenSessionState(
        topics={topic.topic_id: topic, other.topic_id: other},
        active_topic_id=(
            topic.topic_id if relation == "continue" else other.topic_id
        ),
    )
    update = TopicUpdate(title=None, problem=None, changes=[{
        "section": "constraints", "key": "ram", "value": "512 MB",
        "evidence": "RAM 512 MB",
    }])
    result = run(original, "technical_consultation", relation, "",
                 target=topic.topic_id, update=update)
    assert result["route"] == "fact_update"
    assert result["candidate"].active_topic_id == topic.topic_id
    assert result["candidate"].active_topic.constraints["ram"] == "512 MB"
    assert result["candidate"].revision == original.revision


def test_resolver_failure():
    with pytest.raises(ResolutionError):
        run(KarenSessionState(), "technical_consultation", "new", "AI",
            failure=ResolutionError("Unavailable"))


def test_invalid_update():
    with pytest.raises(StateMutationError):
        run(KarenSessionState(), "technical_consultation", "new", "AI",
            update=TopicUpdate(title=None, problem=None, changes=[]))

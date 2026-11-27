
import asyncio
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.modules.karen.context import (
    KarenSessionState,
    ProjectTopic,
)
from app.modules.karen.execution import build_execution_graph
from app.modules.karen.llm import LLMResult, LLMUnavailable
from app.modules.karen.qualification import QualificationError
from app.modules.karen.resolver import QueryResolution
from app.modules.karen.state_manager import TopicUpdate


MESSAGE = "The RAM limit is 512 MB. What approach should we use?"


def dependencies(
    scope="IN_SCOPE",
    assessment="ENGINEERING_REQUIRED",
    questions=None,
):
    topic = ProjectTopic(
        title="Acoustic anomaly detection",
        requirements={"training_data": "Healthy recordings only"},
        constraints={"ram": "256 MB"},
    )
    other = ProjectTopic(title="Unrelated private project")

    state = KarenSessionState(
        topics={
            topic.topic_id: topic,
            other.topic_id: other,
        },
        active_topic_id=topic.topic_id,
    )

    resolution = QueryResolution(
        intent="technical_consultation",
        topic_relation="continue",
        target_topic_id=topic.topic_id,
        retrieval_query="Acoustic anomaly detection with 512 MB RAM",
        requires_clarification=False,
        requires_technical_analysis=True,
    )

    update = TopicUpdate(
        title=None,
        problem=None,
        changes=[{
            "section": "constraints",
            "key": "ram",
            "value": "512 MB",
            "evidence": "The RAM limit is 512 MB.",
        }],
    )

    resolver = SimpleNamespace(
        resolve=AsyncMock(return_value=SimpleNamespace(
            resolution=resolution,
            topic_update=update,
        ))
    )

    payload = {
        "scope": scope,
        "assessment": assessment,
        "rationale": "Preliminary technical assessment",
        "questions": questions or [],
    }

    llm = SimpleNamespace(
        generate=AsyncMock(return_value=LLMResult(
            json.dumps(payload), 100, 50, 150, "fake"
        ))
    )

    return state, resolver, llm


def invoke(state, resolver, llm):
    before = state.model_dump_json()

    try:
        graph = build_execution_graph(
            resolver,
            qualification_llm=llm,
        )
        return asyncio.run(graph.ainvoke({
            "original": state,
            "message": MESSAGE,
        }))
    finally:
        assert state.model_dump_json() == before
        resolver.resolve.assert_awaited_once()


@pytest.mark.parametrize(
    "scope,assessment,questions,expected",
    [
        ("IN_SCOPE", "ENGINEERING_REQUIRED", [], "proceed"),
        ("IN_SCOPE", "RESEARCH_REQUIRED", [], "proceed"),
        ("IN_SCOPE", "FEASIBILITY_STUDY_REQUIRED", [], "proceed"),
        ("PARTIALLY_IN_SCOPE", "ENGINEERING_REQUIRED", [], "proceed"),
        (
            "IN_SCOPE", "INSUFFICIENT_REQUIREMENTS",
            ["What hardware is available?"], "clarification",
        ),
        (
            "PARTIALLY_IN_SCOPE", "INSUFFICIENT_REQUIREMENTS",
            ["What hardware is available?"], "clarification",
        ),
        (
            "NEEDS_CLARIFICATION", "INSUFFICIENT_REQUIREMENTS",
            ["What is the target application?"], "clarification",
        ),
        ("OUT_OF_SCOPE", "NOT_APPLICABLE", [], "out_of_scope"),
    ],
)
def test_qualification_routes(
    scope, assessment, questions, expected,
):
    state, resolver, llm = dependencies(
        scope, assessment, questions,
    )

    result = invoke(state, resolver, llm)

    assert result["route"] == "technical"
    assert result["qualification_route"] == expected
    assert result["qualification"].qualification.scope == scope
    assert result["qualification"].usage.total_tokens == 150
    assert result["candidate"].revision == state.revision

    llm.generate.assert_awaited_once()


def test_qualification_receives_latest_candidate():
    state, resolver, llm = dependencies()

    result = invoke(state, resolver, llm)

    messages = llm.generate.call_args.args[0]
    payload = json.loads(messages[1]["content"])

    assert payload["topic"]["constraints"]["ram"] == "512 MB"
    assert payload["topic"]["requirements"]["training_data"] == (
        "Healthy recordings only"
    )
    assert "256 MB" not in messages[1]["content"]
    assert "Unrelated private project" not in messages[1]["content"]
    assert payload["message"] == MESSAGE
    assert result["candidate"].active_topic.constraints["ram"] == "512 MB"


@pytest.mark.parametrize(
    "intent,relation,query,clarification,expected",
    [
        ("general_conversation", "none", "", False, "general"),
        ("company_information", "none", "Services", False, "company"),
        ("contact", "none", "Contact", False, "action"),
        ("service_request", "none", "Request", False, "action"),
        ("technical_consultation", "unclear", "", True, "clarify"),
        ("technical_consultation", "continue", "", False, "fact_update"),
    ],
)
def test_nontechnical_routes_skip_qualification(
    intent, relation, query, clarification, expected,
):
    state, resolver, llm = dependencies()
    resolved = resolver.resolve.return_value

    resolved.resolution = QueryResolution(
        intent=intent,
        topic_relation=relation,
        target_topic_id=(
            state.active_topic_id if relation == "continue" else None
        ),
        retrieval_query=query,
        requires_clarification=clarification,
        requires_technical_analysis=False,
    )

    result = invoke(state, resolver, llm)

    assert result["route"] == expected
    assert "qualification" not in result
    assert "qualification_route" not in result
    llm.generate.assert_not_awaited()


def test_qualification_provider_failure():
    state, resolver, llm = dependencies()

    llm.generate.side_effect = LLMUnavailable("Unavailable")

    with pytest.raises(LLMUnavailable):
        invoke(state, resolver, llm)

    llm.generate.assert_awaited_once()


def test_invalid_qualification_output():
    state, resolver, llm = dependencies()

    llm.generate.return_value = LLMResult(
        "{}", 100, 10, 110, "fake"
    )

    with pytest.raises(QualificationError):
        invoke(state, resolver, llm)

    llm.generate.assert_awaited_once()

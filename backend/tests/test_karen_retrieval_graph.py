
import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.modules.karen.context import (
    KarenSessionState,
    ProjectTopic,
)
from app.modules.karen.execution import build_execution_graph
from app.modules.karen.ingestion import load_catalog
from app.modules.karen.resolver import QueryResolution
from app.modules.karen.retrieval import Evidence
from app.modules.karen.state_manager import TopicUpdate


def make_dependencies(
    intent="company_information",
    relation="none",
    query="Dark Synapses company services",
    clarification=False,
    analysis=False,
):
    topic = ProjectTopic(
        title="Private acoustic research",
        constraints={"ram": "512 MB"},
    )

    state = KarenSessionState(
        topics={topic.topic_id: topic},
        active_topic_id=topic.topic_id,
    )

    resolution = QueryResolution(
        intent=intent,
        topic_relation=relation,
        target_topic_id=(
            topic.topic_id if relation == "continue" else None
        ),
        retrieval_query=query,
        requires_clarification=clarification,
        requires_technical_analysis=analysis,
    )

    resolver = SimpleNamespace(
        resolve=AsyncMock(return_value=SimpleNamespace(
            resolution=resolution,
            topic_update=TopicUpdate(
                title=None,
                problem=None,
                changes=[],
            ),
        ))
    )

    evidence = [
        Evidence(
            point_id=doc.point_id(0),
            source_id=doc.source_id,
            title=doc.title,
            text=doc.text,
            source_path=doc.source_path,
            revision=doc.revision,
            dense_score=0.8,
            fusion_score=0.03,
        )
        for doc in load_catalog()
    ]

    runtime = SimpleNamespace()
    return state, resolver, runtime, evidence


def invoke(state, resolver, runtime):
    before = state.model_dump_json()

    try:
        graph = build_execution_graph(
            resolver,
            retrieval_runtime=runtime,
        )

        return asyncio.run(graph.ainvoke({
            "original": state,
            "message": "Test message",
        }))
    finally:
        assert state.model_dump_json() == before
        resolver.resolve.assert_awaited_once()


def test_company_retrieval_returns_full_catalog(monkeypatch):
    state, resolver, runtime, evidence = make_dependencies()

    search = AsyncMock(return_value=evidence)

    monkeypatch.setattr(
        "app.modules.karen.execution.retrieve",
        search,
    )

    result = invoke(state, resolver, runtime)

    assert result["route"] == "company"
    assert result["company_evidence"] == evidence
    assert len(result["company_evidence"]) == 5
    assert len({
        item.source_id
        for item in result["company_evidence"]
    }) == 5

    assert result["candidate"] == state
    assert result["candidate"] is not state
    assert "qualification" not in result

    search.assert_awaited_once_with(
        runtime,
        "Dark Synapses company services",
        limit=5,
    )


@pytest.mark.parametrize(
    "intent,relation,query,clarification,analysis,expected",
    [
        (
            "general_conversation", "none", "",
            False, False, "general",
        ),
        (
            "contact", "none", "Contact",
            False, False, "action",
        ),
        (
            "service_request", "none", "Service request",
            False, False, "action",
        ),
        (
            "technical_consultation", "unclear", "",
            True, False, "clarify",
        ),
        (
            "technical_consultation", "continue", "",
            False, False, "fact_update",
        ),
        (
            "technical_consultation", "continue",
            "Acoustic anomaly detection",
            False, True, "technical",
        ),
    ],
)
def test_other_routes_skip_company_retrieval(
    monkeypatch, intent, relation, query,
    clarification, analysis, expected,
):
    state, resolver, runtime, _ = make_dependencies(
        intent, relation, query, clarification, analysis,
    )

    search = AsyncMock()

    monkeypatch.setattr(
        "app.modules.karen.execution.retrieve",
        search,
    )

    result = invoke(state, resolver, runtime)

    assert result["route"] == expected
    assert "company_evidence" not in result
    search.assert_not_awaited()


def test_retrieval_failure_preserves_original(monkeypatch):
    state, resolver, runtime, _ = make_dependencies()

    search = AsyncMock(
        side_effect=RuntimeError("Knowledge index out of sync")
    )

    monkeypatch.setattr(
        "app.modules.karen.execution.retrieve",
        search,
    )

    with pytest.raises(
        RuntimeError,
        match="Knowledge index out of sync",
    ):
        invoke(state, resolver, runtime)

    search.assert_awaited_once()


def test_empty_retrieval_does_not_invent_evidence(monkeypatch):
    state, resolver, runtime, _ = make_dependencies()

    search = AsyncMock(return_value=[])

    monkeypatch.setattr(
        "app.modules.karen.execution.retrieve",
        search,
    )

    result = invoke(state, resolver, runtime)

    assert result["company_evidence"] == []
    assert result["candidate"] == state
    search.assert_awaited_once()

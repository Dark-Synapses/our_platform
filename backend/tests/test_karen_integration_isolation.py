"""Integrated graph, resolver, retrieval and runtime failure tests."""

import asyncio
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest

from app.modules.karen.context import KarenSessionState, ProjectTopic
from app.modules.karen.execution import build_execution_graph
from app.modules.karen.ingestion import chunks, load_catalog
from app.modules.karen.llm import LLMResult
from app.modules.karen.resolver import ContextResolver
from app.modules.karen.retrieval import retrieve
from app.modules.karen.runtime import KarenRuntime, RuntimeBusy


def make_state(title="Private acoustic project"):
    topic = ProjectTopic(
        title=title,
        constraints={"ram": "512 MB"},
    )
    return KarenSessionState(
        topics={topic.topic_id: topic},
        active_topic_id=topic.topic_id,
    )


def make_resolver(query="", intent="company_information"):
    payload = {
        "intent": intent,
        "topic_relation": "none",
        "target_topic_id": None,
        "retrieval_query": query,
        "requires_clarification": False,
        "requires_technical_analysis": False,
        "topic_update": {
            "title": None,
            "problem": None,
            "changes": [],
        },
    }

    llm = SimpleNamespace(
        generate=AsyncMock(return_value=LLMResult(
            json.dumps(payload), 100, 50, 150, "fake"
        ))
    )
    return ContextResolver(llm), llm


def make_runtime(failure=None):
    points = []

    for doc in load_catalog():
        for index, text in enumerate(chunks(doc)):
            payload = doc.model_dump(exclude={"text"}) | {
                "text": text,
                "chunk_index": index,
                "revision": doc.revision,
            }

            points.append(SimpleNamespace(
                id=doc.point_id(index),
                payload=payload,
                score=0.8,
            ))

    vector = [0.1, 0.2, 0.3]

    if failure == "missing_point":
        points.pop()
    elif failure == "unknown_point":
        points[0].id = "unknown-point"
    elif failure == "tampered_payload":
        points[0].payload["text"] = "Unverified injected claim"
    elif failure == "stale_revision":
        points[0].payload["revision"] = "stale"
    elif failure == "nonfinite_score":
        points[0].score = float("nan")
    elif failure == "invalid_dimensions":
        vector = [0.1]
    elif failure == "zero_embedding":
        vector = [0.0, 0.0, 0.0]
    elif failure == "nonfinite_embedding":
        vector = [0.1, float("inf"), 0.3]

    model = SimpleNamespace(
        embed=Mock(side_effect=lambda _: iter([vector]))
    )

    redis = SimpleNamespace(close=Mock())

    qdrant = SimpleNamespace(
        query_points=Mock(
            return_value=SimpleNamespace(points=points)
        ),
        close=Mock(),
    )

    if failure == "qdrant_unavailable":
        qdrant.query_points.side_effect = ConnectionError(
            "Qdrant unavailable"
        )

    if failure == "embedding_unavailable":
        model.embed.side_effect = RuntimeError(
            "Embedding unavailable"
        )

    runtime = KarenRuntime(
        SimpleNamespace(
            karen_retrieval_concurrency=2,
            karen_embedding_dimensions=3,
        ),
        factory=lambda: (model, redis, qdrant),
    )

    return runtime, model, redis, qdrant


async def invoke(graph, state, message):
    before = state.model_dump_json()

    try:
        return await graph.ainvoke({
            "original": state,
            "message": message,
        })
    finally:
        assert state.model_dump_json() == before


@pytest.mark.parametrize("query", ["", "   ", "AI services"])
def test_real_pipeline_company_query(query):
    async def scenario():
        state = make_state()
        resolver, llm = make_resolver(query)
        runtime, model, redis, qdrant = make_runtime()

        graph = build_execution_graph(
            resolver, retrieval_runtime=runtime
        )

        try:
            result = await invoke(
                graph, state, "What services do you offer?"
            )

            expected_query = (
                query.strip()
                or "Dark Synapses company information"
            )

            assert result["route"] == "company"
            assert len(result["company_evidence"]) == 5
            assert result["candidate"] == state
            assert result["candidate"] is not state
            assert "qualification" not in result

            model.embed.assert_called_once_with(
                [expected_query]
            )
            qdrant.query_points.assert_called_once()
            llm.generate.assert_awaited_once()

            assert "Private acoustic project" not in str(
                result["company_evidence"]
            )
        finally:
            await runtime.close()

        assert runtime.pending == 0
        redis.close.assert_called_once()
        qdrant.close.assert_called_once()

    asyncio.run(scenario())


@pytest.mark.parametrize(
    "failure,error,match",
    [
        ("missing_point", RuntimeError, "index out of sync"),
        ("unknown_point", RuntimeError, "index out of sync"),
        ("tampered_payload", RuntimeError, "index out of sync"),
        ("stale_revision", RuntimeError, "index out of sync"),
        ("nonfinite_score", RuntimeError, "index out of sync"),
        ("invalid_dimensions", ValueError, "Invalid query embedding"),
        ("zero_embedding", ValueError, "Invalid query embedding"),
        ("nonfinite_embedding", ValueError, "Invalid query embedding"),
        ("qdrant_unavailable", ConnectionError, "Qdrant unavailable"),
        ("embedding_unavailable", RuntimeError, "Embedding unavailable"),
    ],
)
def test_pipeline_fails_closed(failure, error, match):
    async def scenario():
        state = make_state()
        resolver, llm = make_resolver("AI services")
        runtime, model, redis, qdrant = make_runtime(failure)

        graph = build_execution_graph(
            resolver, retrieval_runtime=runtime
        )

        try:
            with pytest.raises(error, match=match):
                await invoke(graph, state, "Explain your services")

            llm.generate.assert_awaited_once()

            if failure in {
                "invalid_dimensions",
                "zero_embedding",
                "nonfinite_embedding",
                "embedding_unavailable",
            }:
                qdrant.query_points.assert_not_called()

        finally:
            await runtime.close()

        assert runtime.pending == 0

    asyncio.run(scenario())


def test_closed_runtime_failure():
    async def scenario():
        state = make_state()
        resolver, llm = make_resolver("AI services")
        runtime, model, _, qdrant = make_runtime()

        await runtime.close()

        graph = build_execution_graph(
            resolver, retrieval_runtime=runtime
        )

        with pytest.raises(RuntimeBusy):
            await invoke(graph, state, "Explain your services")

        model.embed.assert_not_called()
        qdrant.query_points.assert_not_called()
        llm.generate.assert_awaited_once()
        assert runtime.pending == 0

    asyncio.run(scenario())


@pytest.mark.parametrize("query", ["", "   ", "x" * 1001])
def test_invalid_retrieval_query_never_reaches_runtime(query):
    async def scenario():
        runtime, model, _, qdrant = make_runtime()

        try:
            with pytest.raises(
                ValueError, match="Invalid retrieval request"
            ):
                await retrieve(runtime, query)

            model.embed.assert_not_called()
            qdrant.query_points.assert_not_called()
            assert runtime.pending == 0
        finally:
            await runtime.close()

    asyncio.run(scenario())


def test_concurrent_session_and_evidence_isolation():
    async def scenario():
        a = make_state("PRIVATE_SESSION_ALPHA")
        b = make_state("PRIVATE_SESSION_BETA")

        resolver, llm = make_resolver("AI services")
        runtime, model, _, qdrant = make_runtime()

        graph = build_execution_graph(
            resolver, retrieval_runtime=runtime
        )

        try:
            first, second = await asyncio.gather(
                invoke(graph, a, "What AI services do you offer?"),
                invoke(graph, b, "What AI services do you offer?"),
            )

            assert first["candidate"].session_id == a.session_id
            assert second["candidate"].session_id == b.session_id

            assert first["candidate"] == a
            assert second["candidate"] == b

            assert first["candidate"] is not a
            assert second["candidate"] is not b

            evidence_a = first["company_evidence"]
            evidence_b = second["company_evidence"]

            assert evidence_a == evidence_b
            assert evidence_a is not evidence_b
            assert len(evidence_a) == 5

            assert "PRIVATE_SESSION_ALPHA" not in str(evidence_a)
            assert "PRIVATE_SESSION_BETA" not in str(evidence_b)

            for call in llm.generate.call_args_list:
                content = call.args[0][1]["content"]
                assert (
                    ("PRIVATE_SESSION_ALPHA" in content)
                    != ("PRIVATE_SESSION_BETA" in content)
                )

            evidence_a.clear()
            assert len(evidence_b) == 5

            assert model.embed.call_count == 2
            assert qdrant.query_points.call_count == 2
            assert llm.generate.await_count == 2

        finally:
            await runtime.close()

        assert runtime.pending == 0

    asyncio.run(scenario())


def test_evidence_not_reused_across_turns():
    async def scenario():
        state = make_state()
        resolver, llm = make_resolver("AI services")
        runtime, model, _, qdrant = make_runtime()

        graph = build_execution_graph(
            resolver, retrieval_runtime=runtime
        )

        try:
            first = await invoke(graph, state, "Your AI services?")
            assert len(first["company_evidence"]) == 5

            _, general_llm = make_resolver(
                "", intent="general_conversation"
            )

            llm.generate.return_value = (
                general_llm.generate.return_value
            )

            second = await invoke(
                graph, first["candidate"], "Thank you"
            )

            assert second["route"] == "general"
            assert "company_evidence" not in second
            assert "qualification" not in second

            model.embed.assert_called_once()
            qdrant.query_points.assert_called_once()

        finally:
            await runtime.close()

        assert runtime.pending == 0

    asyncio.run(scenario())

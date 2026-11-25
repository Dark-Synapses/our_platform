import asyncio

import pytest

from app.modules.karen.graph import build_routing_graph, select_route
from app.modules.karen.resolver import QueryResolution


@pytest.mark.parametrize(
    "intent,relation,query,clarification,expected",
    [
        ("technical_consultation", "new", "AI research", False, "technical"),
        ("technical_consultation", "continue", "", False, "fact_update"),
        ("technical_consultation", "return", "", False, "fact_update"),
        ("technical_consultation", "new", "", False, "clarify"),
        ("technical_consultation", "unclear", "AI", False, "clarify"),
        ("technical_consultation", "new", "AI", True, "clarify"),
        ("company_information", "none", "services", False, "company"),
        ("contact", "none", "", False, "action"),
        ("service_request", "none", "", False, "action"),
        ("general_conversation", "none", "", False, "general"),
        ("unclear", "unclear", "", False, "clarify"),
        ("contact", "none", "", True, "clarify"),
    ],
)
def test_routing(intent, relation, query, clarification, expected):
    resolution = QueryResolution(
        intent=intent,
        topic_relation=relation,
        target_topic_id=None,
        retrieval_query=query,
        requires_clarification=clarification,
    )
    before = resolution.model_dump_json()
    assert select_route(resolution) == expected
    result = asyncio.run(build_routing_graph().ainvoke({"resolution": resolution}))
    assert result["route"] == expected
    assert resolution.model_dump_json() == before

"""Side-effect-free routing skeleton for the Karen execution graph."""

from typing import Literal, TypedDict

from langgraph.graph import END, START, StateGraph

from app.modules.karen.resolver import QueryResolution

Route = Literal[
    "clarify", "technical", "fact_update", "company", "action", "general"
]


class GraphState(TypedDict, total=False):
    resolution: QueryResolution
    route: Route


def select_route(resolution: QueryResolution) -> Route:
    if resolution.requires_clarification or resolution.intent == "unclear":
        return "clarify"
    if resolution.intent == "technical_consultation":
        if resolution.topic_relation == "unclear":
            return "clarify"
        if not resolution.retrieval_query.strip():
            if resolution.topic_relation in {"continue", "return"}:
                return "fact_update"
            return "clarify"
        return "technical"
    if resolution.intent == "company_information":
        return "company"
    if resolution.intent in {"contact", "service_request"}:
        return "action"
    return "general"


def _route(state: GraphState) -> Route:
    return select_route(QueryResolution.model_validate(state["resolution"]))


def _dispatch(state: GraphState) -> GraphState:
    return {"route": _route(state)}


def build_routing_graph():
    """Compile a routing-only graph; no provider, storage or action calls."""
    graph = StateGraph(GraphState)
    graph.add_node("dispatch", _dispatch)
    graph.add_edge(START, "dispatch")
    routes: tuple[Route, ...] = (
        "clarify", "technical", "fact_update", "company", "action", "general"
    )
    for route in routes:
        graph.add_node(route, _dispatch)
        graph.add_edge(route, END)
    graph.add_conditional_edges("dispatch", _route, {r: r for r in routes})
    return graph.compile()

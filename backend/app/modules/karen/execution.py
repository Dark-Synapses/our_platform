"""Resolve and route a turn without committing session state."""

from typing import TypedDict

from langgraph.graph import END, START, StateGraph

from app.modules.karen.context import KarenSessionState
from app.modules.karen.graph import Route, select_route
from app.modules.karen.resolver import ContextResolver, ResolutionResult
from app.modules.karen.state_manager import StateMutationError, apply_topic_update


class ExecutionState(TypedDict, total=False):
    original: KarenSessionState
    message: str
    resolved: ResolutionResult
    candidate: KarenSessionState
    route: Route


def build_execution_graph(resolver: ContextResolver):
    """Compile an async graph with no checkpointer or external actions."""

    async def resolve(state: ExecutionState) -> ExecutionState:
        original = KarenSessionState.model_validate_json(
            state["original"].model_dump_json()
        )
        message = state["message"].strip()
        result = await resolver.resolve(original, message, extract_updates=True)
        return {"resolved": result}

    def prepare(state: ExecutionState) -> ExecutionState:
        result = state["resolved"]
        route = select_route(result.resolution)
        candidate = KarenSessionState.model_validate_json(
            state["original"].model_dump_json()
        )
        if route in {"technical", "fact_update"}:
            if result.topic_update is None:
                raise StateMutationError("Missing topic update")
            candidate = apply_topic_update(
                candidate, result.resolution, result.topic_update,
                state["message"].strip(),
            )
        return {"candidate": candidate, "route": route}

    def route_turn(state: ExecutionState) -> Route:
        return state["route"]

    def finish(state: ExecutionState) -> ExecutionState:
        return {"route": state["route"]}

    graph = StateGraph(ExecutionState)
    graph.add_node("resolve", resolve)
    graph.add_node("prepare", prepare)
    graph.add_edge(START, "resolve")
    graph.add_edge("resolve", "prepare")
    routes: tuple[Route, ...] = (
        "clarify", "technical", "fact_update", "company", "action", "general"
    )
    for route in routes:
        graph.add_node(route, finish)
        graph.add_edge(route, END)
    graph.add_conditional_edges("prepare", route_turn, {r: r for r in routes})
    return graph.compile()

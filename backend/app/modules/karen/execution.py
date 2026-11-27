"""Resolve and route a turn without committing session state."""

from typing import Literal, TypedDict

from langgraph.graph import END, START, StateGraph

from app.modules.karen.context import KarenSessionState
from app.modules.karen.graph import Route, select_route
from app.modules.karen.llm import KarenLLM
from app.modules.karen.retrieval import Evidence, retrieve
from app.modules.karen.qualification import (
    Qualification,
    QualificationResult,
    qualify,
)
from app.modules.karen.resolver import ContextResolver, ResolutionResult
from app.modules.karen.state_manager import StateMutationError, apply_topic_update


QualificationRoute = Literal[
    "proceed", "clarification", "out_of_scope"
]


def select_qualification_route(
    qualification: Qualification,
) -> QualificationRoute:
    if qualification.scope == "OUT_OF_SCOPE":
        return "out_of_scope"

    if (
        qualification.scope == "NEEDS_CLARIFICATION"
        or qualification.assessment == "INSUFFICIENT_REQUIREMENTS"
    ):
        return "clarification"

    return "proceed"


class ExecutionState(TypedDict, total=False):
    original: KarenSessionState
    message: str
    resolved: ResolutionResult
    candidate: KarenSessionState
    route: Route
    qualification: QualificationResult
    qualification_route: QualificationRoute
    company_evidence: list[Evidence]


def build_execution_graph(
    resolver: ContextResolver,
    *,
    qualification_llm: KarenLLM | None = None,
    retrieval_runtime=None,
):
    """Compile routing, qualification and retrieval without persistence."""

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

    async def qualify_technical(
        state: ExecutionState,
    ) -> ExecutionState:
        if qualification_llm is None:
            raise RuntimeError("Qualification dependency missing")

        result = await qualify(
            qualification_llm,
            state["candidate"],
            state["message"].strip(),
        )

        return {
            "qualification": result,
            "qualification_route": select_qualification_route(
                result.qualification
            ),
        }

    def route_qualification(
        state: ExecutionState,
    ) -> QualificationRoute:
        return state["qualification_route"]

    async def retrieve_company(
        state: ExecutionState,
    ) -> ExecutionState:
        if retrieval_runtime is None:
            raise RuntimeError("Retrieval dependency missing")

        query = state["resolved"].resolution.retrieval_query

        evidence = await retrieve(
            retrieval_runtime,
            query,
            limit=5,
        )

        return {"company_evidence": evidence}

    graph = StateGraph(ExecutionState)
    graph.add_node("resolve", resolve)
    graph.add_node("prepare", prepare)
    graph.add_edge(START, "resolve")
    graph.add_edge("resolve", "prepare")
    routes: tuple[Route, ...] = (
        "clarify", "technical", "fact_update", "company", "action", "general"
    )
    for route in routes:
        if route == "company" and retrieval_runtime is not None:
            graph.add_node(route, retrieve_company)
            graph.add_edge(route, END)
        elif route == "technical" and qualification_llm is not None:
            graph.add_node(route, qualify_technical)
            graph.add_conditional_edges(
                route,
                route_qualification,
                {
                    "proceed": "qualified",
                    "clarification": "qualification_clarification",
                    "out_of_scope": "qualification_out_of_scope",
                },
            )
        else:
            graph.add_node(route, finish)
            graph.add_edge(route, END)

    if qualification_llm is not None:
        for node in (
            "qualified",
            "qualification_clarification",
            "qualification_out_of_scope",
        ):
            graph.add_node(node, finish)
            graph.add_edge(node, END)
    graph.add_conditional_edges("prepare", route_turn, {r: r for r in routes})
    return graph.compile()

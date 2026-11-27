import asyncio
import statistics
import time

from app.core.config import Settings
from app.modules.karen.context import KarenSessionState
from app.modules.karen.execution import build_execution_graph
from app.modules.karen.ingestion import load_catalog
from app.modules.karen.llm import KarenLLM
from app.modules.karen.resolver import ContextResolver
from app.modules.karen.runtime import KarenRuntime


class MeasuredLLM(KarenLLM):
    def __init__(self, config):
        super().__init__(config)
        self.calls = 0
        self.tokens = 0

    async def generate(self, *args, **kwargs):
        self.calls += 1
        result = await super().generate(*args, **kwargs)
        self.tokens += result.total_tokens
        return result


class MeasuredRuntime(KarenRuntime):
    def __init__(self, config):
        super().__init__(config)
        self.calls = 0
        self.latencies = []

    async def run(self, operation, timeout=15):
        self.calls += 1
        start = time.perf_counter()

        try:
            return await super().run(
                operation, timeout=timeout
            )
        finally:
            self.latencies.append(
                time.perf_counter() - start
            )


CASES = [
    (
        "company_overview",
        "What services does Dark Synapses provide?",
        "company",
    ),
    (
        "company_ai",
        "Does your company develop AI agents and RAG systems?",
        "company",
    ),
    (
        "new_technical_project",
        "We need industrial acoustic anomaly detection "
        "using only healthy machine recordings. "
        "What approach should we investigate?",
        "technical",
    ),
    (
        "constraint_update",
        "The deployment device has a RAM limit of 512 MB.",
        "fact_update",
    ),
    (
        "company_forensics",
        "What digital forensics services does Dark Synapses offer?",
        "company",
    ),
    (
        "technical_followup",
        "Returning to our acoustic anomaly detection project, "
        "can we use supervised learning with our available data "
        "and RAM constraint?",
        "technical",
    ),
    (
        "unsupported_company_fact",
        "What is the office address of Dark Synapses?",
        "company",
    ),
    (
        "general",
        "Thank you for your help.",
        "general",
    ),
    (
        "contact",
        "I would like to contact your team.",
        "action",
    ),
]


async def main():
    config = Settings()

    llm = MeasuredLLM(config)
    runtime = MeasuredRuntime(config)
    resolver = ContextResolver(llm)

    graph = build_execution_graph(
        resolver,
        qualification_llm=llm,
        retrieval_runtime=runtime,
    )

    catalog = {
        doc.source_id for doc in load_catalog()
    }

    state = KarenSessionState()

    results = []
    failures = []
    attempted = 0
    project_id = None

    try:
        for index, (name, message, expected) in enumerate(
            CASES, 1
        ):
            attempted += 1

            print(f"\n=== TURN {index}: {name} ===")
            print("MESSAGE:", message)
            print("EXPECTED_ROUTE:", expected)

            before = state.model_dump_json()
            calls_before = llm.calls
            tokens_before = llm.tokens
            retrieval_before = runtime.calls
            start = time.perf_counter()

            try:
                result = await graph.ainvoke({
                    "original": state,
                    "message": message,
                })

                elapsed = time.perf_counter() - start

                route = result["route"]
                candidate = result["candidate"]

                calls = llm.calls - calls_before
                tokens = llm.tokens - tokens_before
                retrieval_calls = (
                    runtime.calls - retrieval_before
                )

                print("ACTUAL_ROUTE:", route)
                print("LLM_CALLS:", calls)
                print("TOKENS:", tokens)
                print("RETRIEVAL_CALLS:", retrieval_calls)
                print("LATENCY_MS:", round(elapsed * 1000, 2))

                print(
                    "RESOLVED_QUERY:",
                    result["resolved"].resolution.retrieval_query,
                )

                assert state.model_dump_json() == before
                assert candidate is not state
                assert candidate.session_id == state.session_id
                assert candidate.revision == state.revision

                assert route == expected, (
                    f"Unexpected route: {route}"
                )

                assert calls == (
                    2 if route == "technical" else 1
                )

                assert retrieval_calls == (
                    1 if route == "company" else 0
                )

                if route == "company":
                    evidence = result["company_evidence"]

                    assert len(evidence) == len(catalog)
                    assert {
                        item.source_id for item in evidence
                    } == catalog

                    assert "qualification" not in result
                    assert candidate == state

                    print("EVIDENCE_COUNT:", len(evidence))

                    for rank, item in enumerate(evidence, 1):
                        print(
                            "EVIDENCE:",
                            rank,
                            item.source_id,
                            "DENSE:",
                            round(item.dense_score, 4),
                        )

                    if name == "unsupported_company_fact":
                        print(
                            "ANSWER_SUPPORT: NOT_EVALUATED"
                        )

                else:
                    assert "company_evidence" not in result

                if route == "technical":
                    qualification = (
                        result["qualification"].qualification
                    )

                    print(
                        "QUALIFICATION:",
                        qualification.model_dump_json(),
                    )

                    print(
                        "QUALIFICATION_ROUTE:",
                        result["qualification_route"],
                    )

                    assert qualification.scope == "IN_SCOPE"
                    assert (
                        result["qualification_route"]
                        == "proceed"
                    )

                else:
                    assert "qualification" not in result
                    assert "qualification_route" not in result

                if name == "new_technical_project":
                    assert candidate.active_topic is not None
                    project_id = candidate.active_topic_id

                    assert any(
                        "healthy" in str(value).lower()
                        for value in
                        candidate.active_topic.requirements.values()
                    )

                if project_id is not None:
                    assert candidate.active_topic_id == project_id
                    assert len(candidate.topics) == 1

                if name in {
                    "constraint_update",
                    "company_forensics",
                    "technical_followup",
                    "unsupported_company_fact",
                    "general",
                    "contact",
                }:
                    assert any(
                        "512" in str(value)
                        for value in
                        candidate.active_topic.constraints.values()
                    )

                if route not in {
                    "technical", "fact_update"
                }:
                    assert candidate == state

                results.append({
                    "name": name,
                    "route": route,
                    "latency": elapsed,
                    "tokens": tokens,
                })

                # Adopt locally only; no session persistence.
                state = candidate

                print("ORIGINAL_STATE_UNCHANGED: PASS")
                print("RESULT: PASS")

            except Exception as exc:
                failures.append(name)

                print("ERROR_TYPE:", type(exc).__name__)
                print("ERROR_CODE:", getattr(exc, "code", None))
                print("ERROR:", str(exc)[:300])

                print(
                    "ORIGINAL_STATE_UNCHANGED:",
                    state.model_dump_json() == before,
                )

                print("RESULT: FAIL")

                if name in {
                    "new_technical_project",
                    "constraint_update",
                }:
                    print("STOP: dependent context unavailable")
                    break

            if index < len(CASES):
                await asyncio.sleep(8)

    finally:
        try:
            await llm.close()
        finally:
            await runtime.close()

    print("\n=== INTEGRATED BENCHMARK SUMMARY ===")
    print("PLANNED:", len(CASES))
    print("ATTEMPTED:", attempted)
    print("PASSED:", len(results))
    print("FAILED:", len(failures))
    print("NOT_EXECUTED:", len(CASES) - attempted)
    print("FAILED_CASES:", failures)

    print("TOTAL_LLM_CALLS:", llm.calls)
    print("TOTAL_TOKENS:", llm.tokens)
    print("TOTAL_RETRIEVAL_CALLS:", runtime.calls)

    for route in (
        "company", "technical", "fact_update",
        "general", "action",
    ):
        values = [
            item["latency"] * 1000
            for item in results
            if item["route"] == route
        ]

        if values:
            print(
                route.upper() + "_MEAN_MS:",
                round(statistics.mean(values), 2),
            )

    if runtime.latencies:
        print(
            "RETRIEVAL_COLD_MS:",
            round(runtime.latencies[0] * 1000, 2),
        )

        warm = runtime.latencies[1:]

        if warm:
            print(
                "RETRIEVAL_WARM_MEAN_MS:",
                round(statistics.mean(warm) * 1000, 2),
            )

    print("LLM_CLOSED:", llm.closed)
    print("LLM_PENDING:", llm.pending)
    print("RUNTIME_CLOSED:", runtime.closed)
    print("RUNTIME_PENDING:", runtime.pending)

    assert len(results) == len(CASES)
    assert not failures
    assert llm.calls == 11
    assert runtime.calls == 4
    assert llm.closed and llm.pending == 0
    assert runtime.closed and runtime.pending == 0

    print("FINAL_STATUS: PASS")


if __name__ == "__main__":
    asyncio.run(main())

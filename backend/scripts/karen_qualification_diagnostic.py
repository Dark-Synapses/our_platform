import asyncio
import json
import time

from app.core.config import Settings
from app.modules.karen.context import KarenSessionState
from app.modules.karen.execution import build_execution_graph
from app.modules.karen.llm import KarenLLM
from app.modules.karen.resolver import ContextResolver


class DiagnosticLLM(KarenLLM):
    def __init__(self, config):
        super().__init__(config)
        self.calls = 0
        self.tokens = 0

    async def generate(self, *args, **kwargs):
        self.calls += 1

        response_format = kwargs.get("response_format") or {}

        schema_name = response_format.get(
            "json_schema", {}
        ).get("name", "unknown")

        start = time.perf_counter()

        result = await super().generate(*args, **kwargs)

        self.tokens += result.total_tokens

        print("LLM_STAGE:", schema_name)
        print("LLM_LATENCY:", round(
            time.perf_counter() - start, 3
        ))
        print("LLM_TOKENS:", result.total_tokens)

        try:
            payload = json.loads(result.text)
            print("RAW_STRUCTURED_OUTPUT:", json.dumps(
                payload, ensure_ascii=False
            ))
        except json.JSONDecodeError:
            print("RAW_STRUCTURED_OUTPUT: INVALID_JSON")

        return result


CASES = [
    (
        "acoustic",
        "We need industrial acoustic anomaly detection "
        "using only healthy machine recordings. "
        "What approach should we investigate?",
        True,
        "technical",
        "proceed",
    ),
    (
        "ram_constraint",
        "The deployment device has a RAM limit of 512 MB.",
        False,
        "fact_update",
        None,
    ),
    (
        "contextual_followup",
        "Can we use supervised learning with our "
        "available training data and hardware constraints?",
        False,
        "technical",
        "proceed",
    ),
    (
        "extreme_constraints",
        "We need real-time 4K video deepfake detection "
        "at 60 FPS on a CPU-only device with 64 MB RAM. "
        "Assess whether this is feasible.",
        True,
        "technical",
        "proceed",
    ),
]


async def main():
    llm = DiagnosticLLM(Settings())

    graph = build_execution_graph(
        ContextResolver(llm),
        qualification_llm=llm,
    )

    state = KarenSessionState()
    passed = 0
    attempted = 0
    context_valid = True

    try:
        for name, message, reset, route, qroute in CASES:

            if reset:
                state = KarenSessionState()
                context_valid = True

            if not context_valid:
                print("SKIPPED_DEPENDENT_CASE:", name)
                continue

            attempted += 1
            original = state
            before = original.model_dump_json()
            calls_before = llm.calls

            print("\n=== CASE:", name, "===")
            print("MESSAGE:", message)

            try:
                result = await graph.ainvoke({
                    "original": original,
                    "message": message,
                })

                print("ROUTE:", result["route"])
                print(
                    "QUALIFICATION_ROUTE:",
                    result.get("qualification_route"),
                )

                candidate = result["candidate"]

                assert original.model_dump_json() == before
                assert candidate is not original
                assert candidate.revision == original.revision
                assert result["route"] == route
                assert result.get("qualification_route") == qroute

                expected_calls = 2 if route == "technical" else 1

                assert llm.calls - calls_before == expected_calls

                if route == "technical":
                    qualification = result[
                        "qualification"
                    ].qualification

                    assert qualification.scope == "IN_SCOPE"

                    assert qualification.assessment in {
                        "ENGINEERING_REQUIRED",
                        "RESEARCH_REQUIRED",
                        "FEASIBILITY_STUDY_REQUIRED",
                    }

                    if name == "extreme_constraints":
                        assert qualification.assessment == (
                            "FEASIBILITY_STUDY_REQUIRED"
                        )

                if name in {
                    "ram_constraint",
                    "contextual_followup",
                }:
                    assert any(
                        "512" in value
                        for value in
                        candidate.active_topic.constraints.values()
                    )

                state = candidate
                passed += 1
                print("RESULT: PASS")

            except Exception as exc:
                print("RESULT: FAIL")
                print("ERROR_TYPE:", type(exc).__name__)
                print("ERROR_CODE:", getattr(exc, "code", None))
                print("ERROR:", str(exc)[:300])

                print(
                    "ORIGINAL_STATE_UNCHANGED:",
                    original.model_dump_json() == before,
                )

                context_valid = False

            await asyncio.sleep(8)

    finally:
        await llm.close()

        print("\n=== DIAGNOSTIC SUMMARY ===")
        print("PLANNED:", len(CASES))
        print("ATTEMPTED:", attempted)
        print("PASSED:", passed)
        print("FAILED:", attempted - passed)
        print("TOTAL_LLM_CALLS:", llm.calls)
        print("TOTAL_TOKENS:", llm.tokens)
        print("LLM_CLOSED:", llm.closed)
        print("PENDING:", llm.pending)

    if passed != len(CASES):
        raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())

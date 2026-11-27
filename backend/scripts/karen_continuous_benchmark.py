import asyncio
import statistics
import time

from app.core.config import Settings
from app.modules.karen.context import KarenSessionState
from app.modules.karen.execution import build_execution_graph
from app.modules.karen.llm import KarenLLM
from app.modules.karen.resolver import ContextResolver

cases = [
    (
        "new_acoustic",
        "I want to develop an AI system for industrial acoustic "
        "anomaly detection using only healthy recordings. "
        "What approach should we investigate?",
        "technical",
    ),
    (
        "add_constraint",
        "The deployment device has a RAM limit of 256 MB.",
        "fact_update",
    ),
    (
        "correct_constraint",
        "Correction: the RAM limit is 512 MB, not 256 MB.",
        "fact_update",
    ),
    (
        "new_deepfake",
        "Let's discuss a separate project: AI deepfake video "
        "detection. What techniques should we investigate?",
        "technical",
    ),
    (
        "return_acoustic",
        "Let's return to the industrial acoustic anomaly "
        "detection project.",
        "fact_update",
    ),
    (
        "contextual_question",
        "Can we use supervised learning with our available "
        "training data and hardware constraints?",
        "technical",
    ),
    (
        "company_information",
        "What services does Dark Synapses provide?",
        "company",
    ),
    (
        "contact",
        "How can I contact your team?",
        "action",
    ),
]


class MeasuredLLM(KarenLLM):
    def __init__(self, config):
        super().__init__(config)
        self.calls = 0

    async def generate(self, *args, **kwargs):
        self.calls += 1
        return await super().generate(*args, **kwargs)


async def main():
    llm = MeasuredLLM(Settings())
    print("MODEL:", llm.config.karen_llm_model)
    resolver = ContextResolver(llm)
    graph = build_execution_graph(resolver)

    state = KarenSessionState()
    acoustic_id = None
    deepfake_id = None

    latencies = []
    tokens = []
    passed = 0
    attempted = 0

    try:
        for index, (name, message, expected) in enumerate(cases):
            attempted += 1

            print("\n=== TURN:", index + 1, name, "===")
            print("MESSAGE:", message)
            print("EXPECTED_ROUTE:", expected)

            original = state
            before = original.model_dump_json()

            calls_before = llm.calls
            start = time.perf_counter()

            try:
                result = await graph.ainvoke({
                    "original": original,
                    "message": message,
                })

                elapsed = time.perf_counter() - start

                candidate = result["candidate"]
                resolved = result["resolved"]
                route = result["route"]
                usage = resolved.usage

                latencies.append(elapsed)

                if usage.total_tokens is not None:
                    tokens.append(usage.total_tokens)

                print("ROUTE:", route)
                print(
                    "RESOLUTION:",
                    resolved.resolution.model_dump_json(),
                )
                print(
                    "TOPIC_UPDATE:",
                    resolved.topic_update.model_dump_json()
                    if resolved.topic_update else None,
                )
                print(
                    "CANDIDATE:",
                    candidate.model_dump_json(),
                )
                print("LATENCY:", round(elapsed, 3))
                print("INPUT_TOKENS:", usage.input_tokens)
                print("OUTPUT_TOKENS:", usage.output_tokens)
                print("TOTAL_TOKENS:", usage.total_tokens)
                print("LLM_CALLS:", llm.calls - calls_before)
                print(
                    "SEMANTIC_DECISION:",
                    resolved.resolution.requires_technical_analysis,
                )

                assert llm.calls - calls_before == 1, (
                    "Unexpected LLM call count"
                )

                assert (
                    resolved.resolution.requires_technical_analysis
                    is (expected == "technical")
                ), "Unexpected semantic decision"
                print("REASONING_TOKENS:", usage.reasoning_tokens)

                assert original.model_dump_json() == before, (
                    "Original state mutated"
                )

                assert candidate is not original
                assert candidate.session_id == original.session_id
                assert candidate.revision == original.revision
                assert route == expected, "Unexpected route"

                if name == "new_acoustic":
                    acoustic_id = candidate.active_topic_id
                    assert acoustic_id is not None
                    assert len(candidate.topics) == 1

                elif name in {"add_constraint", "correct_constraint"}:
                    assert candidate.active_topic_id == acoustic_id

                    constraints = candidate.active_topic.constraints
                    expected_ram = (
                        "256" if name == "add_constraint" else "512"
                    )

                    assert any(
                        expected_ram in value
                        for value in constraints.values()
                    ), "RAM constraint not extracted"

                    if name == "correct_constraint":
                        assert not any(
                            "256" in value
                            for value in constraints.values()
                        ), "Stale RAM constraint retained"

                elif name == "new_deepfake":
                    deepfake_id = candidate.active_topic_id
                    assert deepfake_id != acoustic_id
                    assert len(candidate.topics) == 2
                    assert (
                        candidate.topics[acoustic_id]
                        == original.topics[acoustic_id]
                    )

                elif name in {
                    "return_acoustic",
                    "contextual_question",
                }:
                    assert candidate.active_topic_id == acoustic_id
                    assert (
                        candidate.topics[deepfake_id]
                        == original.topics[deepfake_id]
                    )

                elif name in {"company_information", "contact"}:
                    assert candidate == original

                # Adopt candidate in local memory only.
                # No Redis persistence or business actions.
                state = candidate
                passed += 1

                print("ORIGINAL_STATE_UNCHANGED: True")
                print("TURN_RESULT: PASS")

            except Exception as exc:
                print("TURN_RESULT: FAIL")
                print("ERROR_TYPE:", type(exc).__name__)
                print("ERROR:", str(exc)[:300])
                print(
                    "ORIGINAL_STATE_UNCHANGED:",
                    original.model_dump_json() == before,
                )
                break

            if index < len(cases) - 1:
                await asyncio.sleep(6)

    finally:
        await llm.close()

        print("\n=== LIVE GRAPH SUMMARY ===")
        print("PLANNED:", len(cases))
        print("ATTEMPTED:", attempted)
        print("PASSED:", passed)
        print("FAILED:", attempted - passed)
        print("NOT_EXECUTED:", len(cases) - attempted)

        if latencies:
            print("MEAN_LATENCY:", round(statistics.mean(latencies), 3))
            print("MAX_LATENCY:", round(max(latencies), 3))

        if tokens:
            print("TOTAL_TOKENS:", sum(tokens))
            print("MEAN_TOKENS:", round(statistics.mean(tokens), 2))

        print("FINAL_STATE:", state.model_dump_json())
        print("TOTAL_LLM_CALLS:", llm.calls)
        print("LLM_CLOSED:", llm.closed)
        print("PENDING:", llm.pending)

    if passed != len(cases):
        raise SystemExit(1)


asyncio.run(main())

import asyncio
import inspect
import json
import statistics
import time

from app.core.config import Settings
from app.modules.karen import runtime as runtime_module
from app.modules.karen.ingestion import load_catalog
from app.modules.karen.retrieval import retrieve


AI = "service:ai"
CYBER = "service:cybersecurity"
AI_SECURITY = "service:ai-security"
AI_POWERED = "service:ai-powered-security"
FORENSICS = "service:content-authenticity-digital-forensics"


DIRECT = [
    ("AI agents and LLM development", AI),
    ("OCR and document intelligence", AI),
    ("API penetration testing", CYBER),
    ("Network vulnerability assessment", CYBER),
    ("Prompt injection testing", AI_SECURITY),
    ("RAG data exposure assessment", AI_SECURITY),
    ("AI-assisted threat detection", AI_POWERED),
    ("Security workflow automation", AI_POWERED),
    ("Voice cloning detection", FORENSICS),
    ("Digital image authenticity analysis", FORENSICS),
]


SEMANTIC = [
    (
        "Build an intelligent assistant that can answer "
        "questions from internal documents",
        AI,
    ),
    (
        "Extract structured information from scanned invoices",
        AI,
    ),
    (
        "Find exploitable weaknesses in our backend endpoints",
        CYBER,
    ),
    (
        "Evaluate the security of our corporate infrastructure",
        CYBER,
    ),
    (
        "Check whether malicious instructions can manipulate "
        "our language model",
        AI_SECURITY,
    ),
    (
        "Determine whether our chatbot leaks confidential "
        "retrieved information",
        AI_SECURITY,
    ),
    (
        "Help security analysts automatically identify "
        "suspicious patterns",
        AI_POWERED,
    ),
    (
        "Reduce repetitive investigation tasks using "
        "machine intelligence",
        AI_POWERED,
    ),
    (
        "Determine whether a recording contains "
        "artificially generated speech",
        FORENSICS,
    ),
    (
        "Investigate whether a photograph has been manipulated",
        FORENSICS,
    ),
]


BROAD = [
    "What services does Dark Synapses provide?",
    "Tell me about all your technical capabilities",
    "Give me an overview of your service portfolio",
]


UNSUPPORTED = [
    "Restaurant menu website design without AI",
    "Wedding photography packages",
    "Residential plumbing repair",
    "What is the company's office address?",
    "How much does your company charge per hour?",
    "What is the name of your chief executive?",
    "Do you currently provide a fully managed 24/7 SOC?",
]


def percentile(values, p):
    if not values:
        return None

    ordered = sorted(values)
    index = (len(ordered) - 1) * p
    lower = int(index)
    upper = min(lower + 1, len(ordered) - 1)
    fraction = index - lower

    return (
        ordered[lower] * (1 - fraction)
        + ordered[upper] * fraction
    )


async def main():
    runtime_cls = getattr(
        runtime_module, "KarenRuntime", None
    )

    if runtime_cls is None:
        raise RuntimeError(
            "KarenRuntime class not found. "
            "Inspect runtime.py before continuing."
        )

    runtime = runtime_cls(Settings())

    expected_catalog = {
        doc.source_id for doc in load_catalog()
    }

    assert len(expected_catalog) == 5

    rows = []
    latencies = []
    relevant_scores = []
    unsupported_scores = []
    errors = []

    print("CATALOG_SIZE:", len(expected_catalog))

    cases = (
        [("direct", q, target) for q, target in DIRECT]
        + [
            ("semantic", q, target)
            for q, target in SEMANTIC
        ]
        + [("broad", q, None) for q in BROAD]
        + [
            ("unsupported", q, None)
            for q in UNSUPPORTED
        ]
    )

    try:
        for index, (category, query, target) in enumerate(
            cases, 1
        ):
            print(f"\n=== CASE {index}: {category} ===")
            print("QUERY:", query)
            print("EXPECTED_SOURCE:", target)

            start = time.perf_counter()

            try:
                evidence = await retrieve(
                    runtime,
                    query,
                    limit=5,
                )

                elapsed = time.perf_counter() - start
                latencies.append(elapsed)

                ids = [item.source_id for item in evidence]

                assert len(ids) == 5
                assert len(set(ids)) == 5
                assert set(ids) == expected_catalog

                print("LATENCY_MS:", round(elapsed * 1000, 2))

                for rank, item in enumerate(evidence, 1):
                    print("EVIDENCE:", json.dumps({
                        "rank": rank,
                        "source_id": item.source_id,
                        "title": item.title,
                        "dense_score": item.dense_score,
                        "fusion_score": item.fusion_score,
                        "source_path": item.source_path,
                        "revision": item.revision,
                    }, ensure_ascii=False))

                rank = (
                    ids.index(target) + 1
                    if target in ids
                    else None
                )

                max_dense = max(
                    item.dense_score for item in evidence
                )

                target_dense = next(
                    (
                        item.dense_score
                        for item in evidence
                        if item.source_id == target
                    ),
                    None,
                )

                if target_dense is not None:
                    relevant_scores.append(target_dense)

                if category == "unsupported":
                    unsupported_scores.append(max_dense)

                rows.append({
                    "category": category,
                    "query": query,
                    "rank": rank,
                    "target_dense": target_dense,
                    "max_dense": max_dense,
                    "latency_ms": elapsed * 1000,
                })

                print("EXPECTED_RANK:", rank)

                if target is not None:
                    print("HIT_AT_1:", rank == 1)
                    print(
                        "HIT_AT_3:",
                        rank is not None and rank <= 3,
                    )
                elif category == "broad":
                    print("CATALOG_COVERAGE: PASS")
                else:
                    print(
                        "RELEVANCE_STATUS: "
                        "OBSERVATION_ONLY"
                    )

            except Exception as exc:
                errors.append(query)
                print("ERROR_TYPE:", type(exc).__name__)
                print("ERROR:", str(exc)[:300])

    finally:
        closed = runtime.close()

        if inspect.isawaitable(closed):
            await closed

    print("\n=== RETRIEVAL BENCHMARK SUMMARY ===")
    print("PLANNED:", len(cases))
    print("COMPLETED:", len(rows))
    print("ERRORS:", len(errors))

    for category in ("direct", "semantic", "combined"):
        selected = [
            row for row in rows
            if (
                row["category"] == category
                or (
                    category == "combined"
                    and row["category"] in {
                        "direct", "semantic"
                    }
                )
            )
        ]

        planned = 20 if category == "combined" else 10

        hit1 = sum(
            row["rank"] == 1 for row in selected
        )

        hit3 = sum(
            row["rank"] is not None and row["rank"] <= 3
            for row in selected
        )

        mrr = sum(
            1 / row["rank"] if row["rank"] else 0
            for row in selected
        ) / planned

        print(f"\nCATEGORY: {category}")
        print("HIT_AT_1:", round(hit1 / planned, 4))
        print("HIT_AT_3:", round(hit3 / planned, 4))
        print("MRR:", round(mrr, 4))

    print("\n=== SCORE DISTRIBUTIONS ===")

    for name, values in (
        ("RELEVANT_TARGET", relevant_scores),
        ("UNSUPPORTED_MAX", unsupported_scores),
    ):
        if values:
            print(name, json.dumps({
                "min": min(values),
                "median": statistics.median(values),
                "max": max(values),
                "values": sorted(values),
            }))

    if relevant_scores and unsupported_scores:
        print(
            "SCORE_SEPARATION:",
            min(relevant_scores) - max(unsupported_scores),
        )

    print("\n=== LATENCY ===")

    if latencies:
        print(
            "FIRST_SUCCESSFUL_RETRIEVAL_MS:",
            round(latencies[0] * 1000, 2),
        )

    warm = latencies[1:]

    if warm:
        print(
            "WARM_MEAN_MS:",
            round(statistics.mean(warm) * 1000, 2),
        )
        print(
            "WARM_MEDIAN_MS:",
            round(statistics.median(warm) * 1000, 2),
        )
        print(
            "WARM_P95_MS:",
            round(percentile(warm, 0.95) * 1000, 2),
        )
        print(
            "WARM_MAX_MS:",
            round(max(warm) * 1000, 2),
        )

    print("ERROR_QUERIES:", errors)

    if errors or len(rows) != len(cases):
        raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())

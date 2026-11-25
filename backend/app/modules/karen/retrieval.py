"""Hybrid retrieval for the small, reviewed service catalog."""

import math
import re
from collections import Counter
from dataclasses import dataclass

from app.modules.karen.ingestion import COLLECTION, chunks, load_catalog

STOP = frozenset(
    "a an the and or of to for in on with from is are "
    "be by using we our that this whether".split()
)


@dataclass(frozen=True)
class Evidence:
    point_id: str
    source_id: str
    title: str
    text: str
    source_path: str
    revision: str
    dense_score: float
    fusion_score: float


def tokenize(text):
    return [t for t in re.findall(r"[a-z0-9]+", text.lower()) if t not in STOP]


def bm25(query, corpus):
    frequencies = {pid: Counter(tokenize(text)) for pid, text in corpus.items()}
    n = len(frequencies)
    if not n:
        return []
    lengths = {pid: sum(freq.values()) for pid, freq in frequencies.items()}
    avg = sum(lengths.values()) / n
    if not avg:
        return []
    df = Counter()
    for freq in frequencies.values():
        df.update(freq.keys())
    scores = {}
    for pid, freq in frequencies.items():
        score = 0.0
        for term in sorted(set(tokenize(query))):
            tf = freq.get(term, 0)
            if tf:
                idf = math.log(1 + (n - df[term] + 0.5) / (df[term] + 0.5))
                score += idf * tf * 2.5 / (
                    tf + 1.5 * (0.25 + 0.75 * lengths[pid] / avg)
                )
        if score > 0:
            scores[pid] = score
    return sorted(scores, key=lambda pid: (-scores[pid], pid))


def fuse(dense, sparse):
    scores = {}
    for ranking in (dense, sparse):
        for rank, pid in enumerate(dict.fromkeys(ranking), 1):
            scores[pid] = scores.get(pid, 0) + 1 / (60 + rank)
    return sorted(scores, key=lambda pid: (-scores[pid], pid)), scores


async def retrieve(runtime, query: str, limit: int = 3):
    query = query.strip()
    if not query or len(query) > 1000 or not 1 <= limit <= 5:
        raise ValueError("Invalid retrieval request")
    expected = {
        d.point_id(i): (d, i, text)
        for d in load_catalog()
        for i, text in enumerate(chunks(d))
    }

    def search(model, redis, qdrant):
        vector = [float(v) for v in next(iter(model.embed([query])))]
        if (len(vector) != runtime.config.karen_embedding_dimensions
                or not all(map(math.isfinite, vector)) or not any(vector)):
            raise ValueError("Invalid query embedding")
        hits = qdrant.query_points(
            collection_name=COLLECTION, query=vector, limit=len(expected),
            with_payload=True, with_vectors=False,
        ).points
        if {str(p.id) for p in hits} != set(expected):
            raise RuntimeError("Knowledge index out of sync")
        dense = {}
        for p in hits:
            pid = str(p.id)
            doc, index, text = expected[pid]
            payload = doc.model_dump(exclude={"text"}) | {
                "text": text, "chunk_index": index, "revision": doc.revision,
            }
            if p.payload != payload or not math.isfinite(p.score):
                raise RuntimeError("Knowledge index out of sync")
            dense[pid] = p.score
        sparse = bm25(query, {
            pid: f"{doc.title} {text}"
            for pid, (doc, _, text) in expected.items()
        })
        ranking, scores = fuse(dense, sparse)
        return [Evidence(
            pid, expected[pid][0].source_id, expected[pid][0].title,
            expected[pid][2], expected[pid][0].source_path,
            expected[pid][0].revision, dense[pid], scores[pid],
        ) for pid in ranking[:limit]]

    return await runtime.run(search)

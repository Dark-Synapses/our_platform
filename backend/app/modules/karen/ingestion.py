"""Explicit offline ingestion of the reviewed static service catalog."""

import json
import math
from pathlib import Path

from app.modules.karen.knowledge import KnowledgeDocument

COLLECTION = "karen_services_dense_v1"


def load_catalog():
    path = Path(__file__).with_name("company_knowledge.json")
    docs = [KnowledgeDocument.model_validate(x) for x in json.loads(path.read_text())]
    if not docs or len({d.source_id for d in docs}) != len(docs):
        raise ValueError("Empty catalog or duplicate source IDs")
    if any(d.kind != "service" for d in docs):
        raise ValueError("Expected static service catalog")
    return docs


def chunks(doc):
    # Conservative character bound for the English BGE catalog; not token counting.
    words = doc.text.split()
    result = []
    current = ""
    for word in words:
        if len(word) > 800:
            raise ValueError("Oversized knowledge word")
        if current and len(current) + len(word) + 1 > 800:
            result.append(current)
            current = ""
        current = f"{current} {word}".strip()
    if current:
        result.append(current)
    return result


def prepare_points(docs, embed, dimensions):
    records = [(d, i, t) for d in docs for i, t in enumerate(chunks(d))]
    vectors = list(embed([f"{d.title}: {t}" for d, _, t in records]))
    if len(vectors) != len(records):
        raise ValueError("Embedding count mismatch")
    points = []
    for (doc, index, text), vector in zip(records, vectors, strict=True):
        values = [float(v) for v in vector]
        if len(values) != dimensions or not all(map(math.isfinite, values)):
            raise ValueError("Invalid embedding")
        if not any(values):
            raise ValueError("Zero embedding")
        payload = doc.model_dump(exclude={"text"}) | {
            "text": text, "chunk_index": index, "revision": doc.revision,
        }
        points.append(dict(id=doc.point_id(index), vector=values, payload=payload))
    return points


async def ingest_catalog(runtime, collection=COLLECTION):
    """Single-writer maintenance operation; not a request-path operation."""
    docs = load_catalog()
    dimensions = runtime.config.karen_embedding_dimensions

    def ingest(model, redis, qdrant):
        from qdrant_client import models

        points = prepare_points(docs, model.embed, dimensions)
        if not qdrant.collection_exists(collection):
            qdrant.create_collection(
                collection_name=collection,
                vectors_config=models.VectorParams(
                    size=dimensions, distance=models.Distance.COSINE,
                ),
            )
        config = qdrant.get_collection(collection).config.params.vectors
        if not isinstance(config, models.VectorParams) or (
            config.size != dimensions or config.distance != models.Distance.COSINE
        ):
            raise ValueError("Incompatible collection configuration")
        qdrant.upsert(
            collection_name=collection,
            points=[models.PointStruct(**p) for p in points], wait=True,
        )
        # Remove obsolete points only in this dedicated catalog collection.
        expected = {p["id"] for p in points}
        stale = []
        offset = None
        while True:
            records, offset = qdrant.scroll(
                collection_name=collection, limit=100, offset=offset,
                with_payload=False, with_vectors=False,
            )
            stale.extend(p.id for p in records if str(p.id) not in expected)
            if offset is None:
                break
        if stale:
            qdrant.delete(collection, models.PointIdsList(points=stale), wait=True)
        count = qdrant.count(collection, exact=True).count
        if count != len(points):
            raise RuntimeError("Catalog count mismatch")
        return {"documents": len(docs), "points": count, "removed": len(stale)}

    if collection != COLLECTION:
        raise ValueError("Unexpected catalog collection")
    return await runtime.run(ingest, timeout=120)

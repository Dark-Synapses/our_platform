import pytest

from app.modules.karen.ingestion import chunks, load_catalog, prepare_points


def test_catalog_points():
    docs = load_catalog()
    points = prepare_points(docs, lambda texts: [[1, 0] for _ in texts], 2)
    assert len(docs) == len(points) == 5
    assert len({p["id"] for p in points}) == 5
    assert all(p["payload"]["visibility"] == "public" for p in points)
    assert points == prepare_points(docs, lambda t: [[1, 0] for _ in t], 2)


def test_chunk_preservation():
    doc = load_catalog()[0].model_copy(update={"text": "word " * 500})
    parts = chunks(doc)
    assert len(parts) > 1
    assert all(len(p) <= 800 for p in parts)
    assert " ".join(parts).split() == doc.text.split()


@pytest.mark.parametrize("vector", [[0, 0], [1], [float("nan"), 1]])
def test_invalid_vector(vector):
    with pytest.raises(ValueError):
        prepare_points(load_catalog(), lambda t: [vector for _ in t], 2)


def test_missing_embeddings():
    with pytest.raises(ValueError):
        prepare_points(load_catalog(), lambda t: [], 2)

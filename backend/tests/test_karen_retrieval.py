from app.modules.karen.retrieval import bm25, fuse, tokenize


def test_tokenize():
    assert tokenize("The AI-generated audio") == ["ai", "generated", "audio"]


def test_bm25():
    assert bm25("audio", {"a": "audio audio", "b": "video"}) == ["a"]


def test_no_keyword_match():
    assert bm25("unknown", {"a": "audio"}) == []


def test_fusion():
    ranking, scores = fuse(["a", "b", "c"], ["b"])
    assert ranking == ["b", "a", "c"]
    assert scores["b"] > scores["a"]


def test_dense_fallback():
    assert fuse(["b", "a"], [])[0] == ["b", "a"]

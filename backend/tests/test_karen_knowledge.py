import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.modules.karen.knowledge import KnowledgeDocument


def document(**updates):
    data = dict(source_id="service:ai", kind="service", title="AI",
                text="AI engineering", source_path="/services/ai")
    return KnowledgeDocument(**(data | updates))


def test_revision_and_point_identity():
    first = document()
    second = document(text="Updated content")
    assert first.revision == document().revision
    assert first.revision != second.revision
    assert first.point_id(0) == second.point_id(0)
    assert first.point_id(0) != first.point_id(1)
    with pytest.raises(ValueError):
        first.point_id(-1)


@pytest.mark.parametrize(
    "path",
    ["//evil.test", "/admin/projects", "/projects/../admin",
                                  "/services/%2e", "https://evil.test", "/team"])
def test_private_or_invalid_paths(path):
    with pytest.raises(ValidationError):
        document(source_path=path)


def test_private_metadata_rejected():
    with pytest.raises(ValidationError):
        document(visibility="private")
    with pytest.raises(ValidationError):
        document(note="private")


def test_service_catalog():
    path = Path(__file__).parents[1] / "app/modules/karen/company_knowledge.json"
    docs = [KnowledgeDocument.model_validate(x) for x in json.loads(path.read_text())]
    assert len(docs) == len({d.source_id for d in docs}) == 5
    assert len({d.service for d in docs}) == 5
    cyber = next(d for d in docs if d.service == "Cybersecurity")
    assert "planned expansion" in cyber.text

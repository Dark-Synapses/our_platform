import asyncio
import json

import pytest
from pydantic import ValidationError

from app.modules.karen.context import KarenSessionState, ProjectTopic
from app.modules.karen.llm import LLMResult
from app.modules.karen.qualification import (
    Qualification,
    QualificationError,
    qualify,
)

VALID = dict(scope="IN_SCOPE", assessment="RESEARCH_REQUIRED",
             rationale="Novel AI problem", questions=[])


class FakeLLM:
    def __init__(self, result):
        self.result = result
        self.calls = []

    async def generate(self, messages, **kwargs):
        self.calls.append((messages, kwargs))
        return LLMResult(json.dumps(self.result), 1, 1, 2, "fake")


@pytest.mark.parametrize("changes", [
    {"scope": "OUT_OF_SCOPE"},
    {"assessment": "NOT_APPLICABLE"},
    {"scope": "NEEDS_CLARIFICATION"},
    {"questions": ["a", "b", "c"]},
    {"rationale": " "},
])
def test_invalid(changes):
    with pytest.raises(ValidationError):
        Qualification.model_validate(VALID | changes)


def test_qualification_isolated_context():
    a = ProjectTopic(title="Acoustic")
    b = ProjectTopic(title="Unrelated secret")
    state = KarenSessionState(topics={a.topic_id: a, b.topic_id: b},
                              active_topic_id=a.topic_id)
    before = state.model_dump_json()
    llm = FakeLLM(VALID)
    result = asyncio.run(qualify(llm, state, "New AI method"))
    assert result.qualification.scope == "IN_SCOPE"
    assert state.model_dump_json() == before
    messages, kwargs = llm.calls[0]
    assert "Unrelated secret" not in messages[1]["content"]
    assert kwargs["response_format"]["json_schema"]["strict"] is True


def test_invalid_provider_response():
    with pytest.raises(QualificationError):
        asyncio.run(qualify(FakeLLM({}), KarenSessionState(), "AI"))


def test_invalid_message_no_provider_call():
    llm = FakeLLM(VALID)
    with pytest.raises(QualificationError):
        asyncio.run(qualify(llm, KarenSessionState(), " "))
    assert not llm.calls

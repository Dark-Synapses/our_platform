import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.core.config import Settings
from app.modules.karen.context import KarenSessionState
from app.modules.karen.llm import KarenLLM
from app.modules.karen.resolver import (
    ContextResolver,
    QueryResolution,
)


def make_client(text):
    response = SimpleNamespace(
        choices=[
            SimpleNamespace(
                message=SimpleNamespace(content=text),
                finish_reason="stop",
            )
        ],
        usage=SimpleNamespace(
            prompt_tokens=100,
            completion_tokens=50,
            total_tokens=150,
        ),
        model="test-model",
    )

    create = AsyncMock(return_value=response)

    client = SimpleNamespace(
        chat=SimpleNamespace(
            completions=SimpleNamespace(create=create)
        ),
        close=AsyncMock(),
    )

    return client, create


@pytest.mark.asyncio
async def test_plain_generation_unchanged():
    client, create = make_client("Normal assistant response")
    llm = KarenLLM(Settings())
    llm.client = client

    try:
        result = await llm.generate([
            {"role": "user", "content": "Hello"},
        ])

        assert result.text == "Normal assistant response"
        assert "response_format" not in create.call_args.kwargs
        assert "reasoning_effort" not in create.call_args.kwargs
        assert result.reasoning_tokens is None
        assert llm.pending == 0
    finally:
        await llm.close()


@pytest.mark.asyncio
async def test_strict_schema_forwarded_to_provider():
    text = json.dumps({
        "intent": "technical_consultation",
        "topic_relation": "new",
        "target_topic_id": None,
        "retrieval_query": "Thermal defect detection",
        "requires_clarification": False,
    })

    client, create = make_client(text)
    llm = KarenLLM(Settings())
    llm.client = client

    try:
        result = await ContextResolver(llm).resolve(
            KarenSessionState(),
            "Can AI detect defects using thermal images?",
        )

        response_format = create.call_args.kwargs[
            "response_format"
        ]

        assert create.call_args.kwargs["reasoning_effort"] == "low"
        assert response_format["type"] == "json_schema"

        schema = response_format["json_schema"]

        assert schema["strict"] is True
        assert schema["schema"] == QueryResolution.model_json_schema()
        assert result.resolution.topic_relation == "new"
        assert result.usage.total_tokens == 150
        assert llm.pending == 0
    finally:
        await llm.close()


@pytest.mark.asyncio
async def test_reasoning_usage_and_override():
    client, create = make_client("Answer")
    create.return_value.usage.completion_tokens_details = SimpleNamespace(
        reasoning_tokens=12
    )
    llm = KarenLLM(Settings(), factory=lambda: client)
    try:
        result = await llm.generate([], reasoning_effort="low")
        assert result.reasoning_tokens == 12
        assert result.total_tokens == 150
        assert create.call_args.kwargs["reasoning_effort"] == "low"
    finally:
        await llm.close()

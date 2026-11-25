import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.core.config import Settings
from app.modules.karen.llm import KarenLLM, LLMBusy, LLMUnavailable


def fake_client():
    response = SimpleNamespace(
        choices=[SimpleNamespace(
            message=SimpleNamespace(content="Answer"), finish_reason="stop"
        )],
        usage=SimpleNamespace(
            prompt_tokens=10, completion_tokens=5, total_tokens=15
        ),
        model="test-model",
    )
    return SimpleNamespace(
        chat=SimpleNamespace(completions=SimpleNamespace(
            create=AsyncMock(return_value=response)
        )),
        close=AsyncMock(),
    )


def test_generate_and_reuse():
    async def scenario():
        client = fake_client()
        llm = KarenLLM(Settings(), factory=lambda: client)
        for _ in range(2):
            result = await llm.generate([])
            assert result.text == "Answer"
            assert result.total_tokens == 15
        assert client.chat.completions.create.await_count == 2
        assert llm.pending == 0
        await llm.close()
        client.close.assert_awaited_once()
        with pytest.raises(LLMUnavailable):
            await llm.generate([])

    asyncio.run(scenario())


def test_missing_key():
    async def scenario():
        llm = KarenLLM(Settings(karen_groq_api_key=None))
        with pytest.raises(LLMUnavailable, match="not configured"):
            await llm.generate([])
        assert llm.pending == 0
        await llm.close()

    asyncio.run(scenario())


def test_rate_limit_and_recovery():
    async def scenario():
        client = fake_client()
        llm = KarenLLM(Settings(), factory=lambda: client)
        error = RuntimeError("private provider details")
        error.status_code = 429
        create = client.chat.completions.create
        create.side_effect = error
        with pytest.raises(LLMBusy, match="Provider rate limit"):
            await llm.generate([])
        assert llm.pending == 0
        create.side_effect = None
        assert (await llm.generate([])).total_tokens == 15
        await llm.close()

    asyncio.run(scenario())


def test_capacity_and_cancellation():
    async def scenario():
        client = fake_client()
        started = asyncio.Event()

        async def blocked(**kwargs):
            started.set()
            await asyncio.Event().wait()

        client.chat.completions.create.side_effect = blocked
        llm = KarenLLM(
            Settings(karen_llm_concurrency=1), factory=lambda: client
        )
        task = asyncio.create_task(llm.generate([]))
        try:
            await asyncio.wait_for(started.wait(), 2)
            with pytest.raises(LLMBusy):
                await llm.generate([])
            task.cancel()
            with pytest.raises(asyncio.CancelledError):
                await task
            assert llm.pending == 0
        finally:
            await llm.close()

    asyncio.run(scenario())

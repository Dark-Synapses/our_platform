"""Bounded asynchronous Groq transport; no conversation storage."""

import asyncio
from dataclasses import dataclass


class LLMUnavailable(Exception):
    pass


class LLMBusy(LLMUnavailable):
    pass


@dataclass(frozen=True)
class LLMResult:
    text: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    model: str


class KarenLLM:
    def __init__(self, config, factory=None):
        self.config = config
        self.factory = factory or self._create_client
        self.client = None
        self.pending = 0
        self.closed = False
        self.tasks = set()

    def _create_client(self):
        from groq import AsyncGroq

        key = self.config.karen_groq_api_key
        if not key or not key.get_secret_value().strip():
            raise LLMUnavailable("LLM not configured")
        return AsyncGroq(
            api_key=key.get_secret_value(), timeout=30, max_retries=0
        )

    async def generate(self, messages):
        if self.closed:
            raise LLMUnavailable("LLM closed")
        if self.pending >= self.config.karen_llm_concurrency:
            raise LLMBusy("LLM busy")
        self.pending += 1
        task = asyncio.current_task()
        self.tasks.add(task)
        try:
            if self.client is None:
                self.client = self.factory()
            async with asyncio.timeout(30):
                response = await self.client.chat.completions.create(
                    model=self.config.karen_llm_model,
                    messages=messages,
                    temperature=0.2,
                    max_completion_tokens=768,
                )
            text = response.choices[0].message.content
            usage = response.usage
            if not text or not text.strip() or usage is None:
                raise LLMUnavailable("Incomplete LLM response")
            if response.choices[0].finish_reason != "stop":
                raise LLMUnavailable("Incomplete LLM completion")
            return LLMResult(
                text, usage.prompt_tokens, usage.completion_tokens,
                usage.total_tokens, response.model,
            )
        except LLMUnavailable:
            raise
        except Exception as exc:
            status = getattr(exc, "status_code", None)
            if status == 429:
                raise LLMBusy("Provider rate limit") from None
            raise LLMUnavailable("LLM request failed") from None
        finally:
            self.pending -= 1
            self.tasks.discard(task)

    async def close(self):
        self.closed = True
        tasks = list(self.tasks)
        for task in tasks:
            task.cancel()
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
        if self.client is not None:
            await self.client.close()
            self.client = None

import asyncio
from threading import Event
from types import SimpleNamespace

import pytest

from app.modules.karen.runtime import KarenRuntime, RuntimeBusy


def test_timeout_keeps_running_work_admitted():
    async def scenario():
        started = Event()
        release = Event()
        client = SimpleNamespace(close=lambda: None)
        runtime = KarenRuntime(
            SimpleNamespace(karen_retrieval_concurrency=1),
            factory=lambda: (None, client, client),
        )

        def blocking(*args):
            started.set()
            release.wait(5)

        try:
            task = asyncio.create_task(runtime.run(blocking, timeout=0.2))
            assert await asyncio.to_thread(started.wait, 2)
            with pytest.raises(TimeoutError):
                await task
            assert runtime.pending == 1
            queued = asyncio.create_task(runtime.run(blocking))
            await asyncio.sleep(0)
            with pytest.raises(RuntimeBusy):
                await runtime.run(blocking)
            queued.cancel()
            with pytest.raises(asyncio.CancelledError):
                await queued
        finally:
            release.set()
            await runtime.close()
        assert runtime.pending == 0

    asyncio.run(scenario())


def test_resources_created_once():
    async def scenario():
        calls = []
        client = SimpleNamespace(close=lambda: None)

        def factory():
            calls.append(1)
            return object(), client, client

        runtime = KarenRuntime(
            SimpleNamespace(karen_retrieval_concurrency=2), factory=factory
        )
        try:
            a, b = await asyncio.gather(
                runtime.run(lambda model, *_: model),
                runtime.run(lambda model, *_: model),
            )
            assert a is b
            assert calls == [1]
        finally:
            await runtime.close()

    asyncio.run(scenario())


def test_running_cancellation_keeps_capacity():
    async def scenario():
        started = Event()
        release = Event()
        client = SimpleNamespace(close=lambda: None)

        runtime = KarenRuntime(
            SimpleNamespace(karen_retrieval_concurrency=1),
            factory=lambda: (None, client, client),
        )

        def blocking(*args):
            started.set()
            release.wait(5)

        try:
            task = asyncio.create_task(runtime.run(blocking))
            assert await asyncio.to_thread(started.wait, 2)

            task.cancel()

            with pytest.raises(asyncio.CancelledError):
                await task

            assert runtime.pending == 1

        finally:
            release.set()
            await runtime.close()

        assert runtime.pending == 0

    asyncio.run(scenario())


def test_initialization_failure_can_recover():
    async def scenario():
        attempts = []
        client = SimpleNamespace(close=lambda: None)

        def factory():
            attempts.append(1)

            if len(attempts) == 1:
                raise RuntimeError("Dependency unavailable")

            return object(), client, client

        runtime = KarenRuntime(
            SimpleNamespace(karen_retrieval_concurrency=1),
            factory=factory,
        )

        try:
            with pytest.raises(RuntimeError):
                await runtime.run(lambda *_: True)

            assert runtime.resources is None

            assert await runtime.run(lambda *_: True)
            assert len(attempts) == 2

        finally:
            await runtime.close()

        assert runtime.pending == 0

    asyncio.run(scenario())


def test_closed_runtime_rejects_operations():
    async def scenario():
        runtime = KarenRuntime(
            SimpleNamespace(karen_retrieval_concurrency=1)
        )

        await runtime.close()

        with pytest.raises(RuntimeBusy):
            await runtime.run(lambda *_: True)

        assert runtime.pending == 0

    asyncio.run(scenario())

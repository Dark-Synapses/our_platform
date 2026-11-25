"""Opt-in tests against a real Redis instance; only own keys are deleted."""
import asyncio
import os

import pytest
import pytest_asyncio

from app.core.config import Settings
from app.modules.karen.context import ConversationTurn
from app.modules.karen.session import (
    SessionCapacityExceeded,
    SessionConflict,
    SessionExpired,
    SessionStore,
    SessionUnavailable,
)

pytestmark = pytest.mark.skipif(
    os.getenv("DS_TEST_KAREN_REDIS") != "1", reason="Redis integration opt-in"
)


@pytest_asyncio.fixture
async def store():
    instance = SessionStore(Settings(karen_session_ttl_seconds=2))
    state = await instance.create()
    try:
        yield instance, state
    finally:
        await instance.delete(state.session_id)
        await instance.close()


@pytest.mark.asyncio
async def test_roundtrip_and_revision(store):
    instance, state = store
    state.recent_messages.append(ConversationTurn(role="user", content="Hello"))
    updated = await instance.save(state)
    assert updated.revision == 1
    assert await instance.load(state.session_id) == updated
    with pytest.raises(SessionConflict):
        await instance.save(state)


@pytest.mark.asyncio
async def test_concurrent_updates(store):
    instance, state = store
    results = await asyncio.gather(
        instance.save(state), instance.save(state), return_exceptions=True
    )
    assert sum(isinstance(r, SessionConflict) for r in results) == 1
    assert (await instance.load(state.session_id)).revision == 1


@pytest.mark.asyncio
async def test_expiry_and_no_resurrection(store):
    instance, state = store
    await asyncio.sleep(2.2)
    with pytest.raises(SessionExpired):
        await instance.load(state.session_id)
    with pytest.raises(SessionExpired):
        await instance.save(state)


@pytest.mark.asyncio
async def test_delete(store):
    instance, state = store
    await instance.delete(state.session_id)
    with pytest.raises(SessionExpired):
        await instance.load(state.session_id)


@pytest.mark.asyncio
async def test_oversized_state(store):
    instance, state = store
    state.entity_references = {"large": "x" * 65536}
    with pytest.raises(ValueError, match="too large"):
        await instance.save(state)
    assert (await instance.load(state.session_id)).revision == 0


@pytest.mark.asyncio
async def test_cross_client_and_deleted_write(store):
    instance, state = store
    other = SessionStore(instance.config)
    try:
        loaded = await other.load(state.session_id)
        results = await asyncio.gather(
            instance.save(state), other.save(loaded), return_exceptions=True
        )
        assert sum(isinstance(r, SessionConflict) for r in results) == 1
        latest = await other.load(state.session_id)
        await instance.delete(state.session_id)
        with pytest.raises(SessionExpired):
            await other.save(latest)
    finally:
        await other.close()


@pytest.mark.asyncio
async def test_absolute_deadline_and_refresh(store):
    instance, state = store
    client = instance._redis()
    key = instance._key(state.session_id)
    before = await client.pexpiretime(key)
    await asyncio.sleep(0.1)
    await instance.load(state.session_id)
    assert await client.pexpiretime(key) == before
    updated = await instance.save(state)
    assert await client.pexpiretime(key) > before
    instance.MAX_AGE = 3
    instance.ttl = 5
    updated = await instance.save(updated)
    deadline = int((updated.created_at.timestamp() + 3) * 1000)
    assert await client.pexpiretime(key) <= deadline
    await asyncio.sleep(3.1)
    with pytest.raises(SessionExpired):
        await instance.load(state.session_id)


@pytest.mark.asyncio
async def test_closed_store(store):
    instance, state = store
    other = SessionStore(instance.config)
    try:
        await other.load(state.session_id)
        await other.close()
        await other.close()
        for operation in (
            lambda: other.create(),
            lambda: other.load(state.session_id),
            lambda: other.save(state),
            lambda: other.delete(state.session_id),
        ):
            with pytest.raises(SessionUnavailable, match="closed"):
                await operation()
        assert other.client is None
    finally:
        await other.close()


@pytest.mark.asyncio
async def test_invalid_identifier(store):
    instance, _ = store
    with pytest.raises(ValueError):
        await instance.load("not-a-session")


@pytest.mark.asyncio
async def test_redis_error_contract(store, monkeypatch):
    from redis.exceptions import ConnectionError, OutOfMemoryError, TimeoutError

    instance, state = store
    client = instance._redis()
    for error, expected in (
        (ConnectionError, SessionUnavailable),
        (TimeoutError, SessionUnavailable),
        (OutOfMemoryError, SessionCapacityExceeded),
    ):
        async def fail(*args, **kwargs):
            raise error("internal details")

        with monkeypatch.context() as patch:
            patch.setattr(client, "get", fail)
            with pytest.raises(expected) as exc:
                await instance.load(state.session_id)
            assert "internal details" not in str(exc.value)
    assert await instance.load(state.session_id) == state

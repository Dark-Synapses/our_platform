"""Internal, ephemeral session storage. Not an authentication boundary."""
from datetime import UTC, datetime, timedelta
from functools import wraps
from math import floor
from uuid import UUID

from app.modules.karen.context import KarenSessionState


class SessionConflict(Exception):
    pass


class SessionExpired(Exception):
    pass


class SessionUnavailable(Exception):
    pass


class SessionCapacityExceeded(SessionUnavailable):
    pass


def redis_errors(method):
    @wraps(method)
    async def wrapped(self, *args, **kwargs):
        from redis.exceptions import ConnectionError, OutOfMemoryError, TimeoutError

        try:
            return await method(self, *args, **kwargs)
        except OutOfMemoryError:
            raise SessionCapacityExceeded("Session capacity exceeded") from None
        except (ConnectionError, TimeoutError):
            raise SessionUnavailable("Session storage unavailable") from None

    return wrapped


class SessionStore:
    PREFIX = "karen:session:v1:"
    MAX_BYTES = 65536
    MAX_AGE = 14400

    def __init__(self, config):
        self.config = config
        self.client = None
        self.closed = False
        self.ttl = config.karen_session_ttl_seconds
        if not 1 <= self.ttl <= self.MAX_AGE:
            raise ValueError("Invalid session TTL")

    def _redis(self):
        if self.closed:
            raise SessionUnavailable("Session store closed")
        if self.client is None:
            from redis.asyncio import Redis

            self.client = Redis.from_url(
                self.config.karen_redis_url, max_connections=20,
                socket_connect_timeout=5, socket_timeout=5,
            )
        return self.client

    def _key(self, session_id):
        parsed = UUID(session_id)
        if parsed.version != 4 or parsed.hex != session_id:
            raise ValueError("Invalid session identifier")
        return self.PREFIX + session_id

    def _encode(self, state):
        state = KarenSessionState.model_validate(state.model_dump())
        raw = state.model_dump_json().encode()
        if len(raw) > self.MAX_BYTES:
            raise ValueError("Session state too large")
        return raw

    def _deadline(self, state):
        now = datetime.now(UTC)
        absolute = state.created_at + timedelta(seconds=self.MAX_AGE)
        if absolute <= now:
            raise SessionExpired("Session expired")
        deadline = min(absolute, now + timedelta(seconds=self.ttl))
        return floor(deadline.timestamp() * 1000)

    @redis_errors
    async def create(self):
        state = KarenSessionState()
        if not await self._redis().set(
            self._key(state.session_id), self._encode(state),
            pxat=self._deadline(state), nx=True,
        ):
            raise SessionConflict("Session already exists")
        return state

    @redis_errors
    async def load(self, session_id):
        raw = await self._redis().get(self._key(session_id))
        if raw is None:
            raise SessionExpired("Session expired")
        if len(raw) > self.MAX_BYTES:
            raise ValueError("Session state too large")
        state = KarenSessionState.model_validate_json(raw)
        if state.session_id != session_id:
            raise ValueError("Invalid stored session identifier")
        self._deadline(state)
        return state

    @redis_errors
    async def save(self, state):
        from redis.exceptions import WatchError

        key = self._key(state.session_id)
        async with self._redis().pipeline(transaction=True) as pipe:
            try:
                await pipe.watch(key)
                raw = await pipe.get(key)
                if raw is None:
                    raise SessionExpired("Session expired")
                if len(raw) > self.MAX_BYTES:
                    raise ValueError("Session state too large")
                current = KarenSessionState.model_validate_json(raw)
                if current.session_id != state.session_id:
                    raise ValueError("Invalid stored session identifier")
                if current.revision != state.revision:
                    raise SessionConflict("Session revision changed")
                updated = state.model_copy(update={
                    "revision": current.revision + 1,
                    "created_at": current.created_at,
                    "updated_at": datetime.now(UTC),
                })
                payload = self._encode(updated)
                deadline = self._deadline(updated)
                pipe.multi()
                pipe.set(key, payload, pxat=deadline, xx=True)
                result = await pipe.execute()
                if not result[0]:
                    raise SessionExpired("Session expired")
                return updated
            except WatchError:
                raise SessionConflict("Session revision changed") from None

    @redis_errors
    async def delete(self, session_id):
        await self._redis().delete(self._key(session_id))

    async def close(self):
        self.closed = True
        client, self.client = self.client, None
        if client is not None:
            await client.aclose()

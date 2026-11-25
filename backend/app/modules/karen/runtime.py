"""Process-local, bounded execution for Karen's synchronous dependencies."""
import asyncio
from concurrent.futures import ThreadPoolExecutor
from threading import Lock


class RuntimeBusy(Exception):
    pass


class KarenRuntime:
    def __init__(self, config, factory=None):
        self.config = config
        workers = config.karen_retrieval_concurrency
        if not 1 <= workers <= 32:
            raise ValueError("Invalid Karen concurrency")
        self.executor = ThreadPoolExecutor(max_workers=workers)
        self.capacity = workers * 2
        self.pending = 0
        self.closed = False
        self.lock = Lock()
        self.resources = None
        self.factory = factory or self._create_resources

    def _create_resources(self):
        from fastembed import TextEmbedding
        from qdrant_client import QdrantClient
        from redis import Redis

        c = self.config
        model = TextEmbedding(
            model_name=c.karen_embedding_model,
            cache_dir=c.karen_model_cache,
            threads=c.karen_embedding_threads,
            providers=["CPUExecutionProvider"],
            local_files_only=True,
        )
        redis = Redis.from_url(
            c.karen_redis_url, socket_connect_timeout=5, socket_timeout=5
        )
        try:
            qdrant = QdrantClient(url=c.karen_qdrant_url, timeout=5)
        except Exception:
            redis.close()
            raise
        return model, redis, qdrant

    def _resources(self):
        with self.lock:
            if self.resources is None:
                self.resources = self.factory()
            return self.resources

    async def run(self, operation, timeout=15):
        # Admission and completion accounting run on the owning event loop.
        if self.closed or self.pending >= self.capacity:
            raise RuntimeBusy("Karen runtime unavailable or busy")
        self.pending += 1
        loop = asyncio.get_running_loop()
        try:
            future = self.executor.submit(lambda: operation(*self._resources()))
        except BaseException:
            self.pending -= 1
            raise

        def completed(_):
            loop.call_soon_threadsafe(self._release)

        future.add_done_callback(completed)
        wrapped = asyncio.wrap_future(future)
        try:
            return await asyncio.wait_for(wrapped, timeout)
        except (TimeoutError, asyncio.CancelledError):
            future.cancel()
            raise

    def _release(self):
        self.pending -= 1

    async def check(self):
        def probe(model, redis, qdrant):
            if not redis.ping():
                raise RuntimeError("Redis unavailable")
            qdrant.get_collections()
            vector = next(model.query_embed(["Karen readiness check"]))
            if vector.shape != (self.config.karen_embedding_dimensions,):
                raise RuntimeError("Invalid embedding dimensions")

        await self.run(probe)

    async def close(self):
        self.closed = True
        await asyncio.to_thread(self.executor.shutdown, wait=True, cancel_futures=True)
        if self.resources is not None:
            _, redis, qdrant = self.resources
            try:
                await asyncio.to_thread(redis.close)
            finally:
                await asyncio.to_thread(qdrant.close)
            self.resources = None

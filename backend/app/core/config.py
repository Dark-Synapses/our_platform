from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="DS_")

    mongo_uri: SecretStr | None = None

    mongo_host: str = "mongo"
    mongo_username: str = "dark_synapses"
    mongo_password: SecretStr | None = None
    mongo_database: str = "dark_synapses"

    cookie_secure: bool = False
    allowed_origins: str = (
        "http://localhost:5173,http://127.0.0.1:5173"
    )


    # Karen AI runtime
    karen_enabled: bool = False
    karen_redis_url: str = "redis://redis:6379/0"
    karen_qdrant_url: str = "http://qdrant:6333"

    karen_embedding_model: str = "BAAI/bge-small-en-v1.5"
    karen_embedding_dimensions: int = 384
    karen_model_cache: str = "/app/model-cache"
    karen_embedding_threads: int = 2

    karen_retrieval_concurrency: int = 10
    karen_session_ttl_seconds: int = 1800

    karen_groq_api_key: SecretStr | None = None
    karen_llm_model: str = "openai/gpt-oss-120b"
    karen_llm_concurrency: int = Field(default=4, ge=1, le=32)

from pydantic import SecretStr
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

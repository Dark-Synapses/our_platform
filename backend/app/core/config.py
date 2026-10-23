from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="DS_")

    mongo_host: str = "mongo"
    mongo_username: str = "dark_synapses"
    mongo_password: SecretStr
    mongo_database: str = "dark_synapses"

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Local open-source LLM gateway (Ollama). Kept here so non-service code
    # (health probes, admin endpoints) can surface model configuration;
    # inference itself goes through app.services.llm.
    OLLAMA_BASE_URL: str = "http://localhost:11434/v1"
    OLLAMA_TEXT_MODEL: str = "gemma3:4b"
    OLLAMA_VISION_MODEL: str = "gemma3:4b"

    # Supabase (optional persistence when configured; else in-memory/SQLite)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()

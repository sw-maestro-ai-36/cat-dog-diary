"""환경변수 기반 설정. 로컬 dev는 monorepo root .env.local 자동 로드,
Railway prod는 dashboard env vars로 inject (env_file 무시).

ADR-0011 환경변수 명세 정합. dev에서는 Next.js와 변수 공유를 위해
SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL 둘 다 alias로 수용.
"""
from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[4]
ENV_FILE = ROOT_DIR / ".env.local"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    internal_shared_secret: str = Field(min_length=16)
    supabase_url: str = Field(
        validation_alias=AliasChoices("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"),
    )

    @property
    def jwks_url(self) -> str:
        return f"{self.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]

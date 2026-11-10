import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
SANDBOX_DIR = BASE_DIR / "sandbox"
SANDBOX_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    app_name: str = "ACIB - Adaptive Code-mixed Indic Benchmark"
    version: str = "1.0.0"
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/acib_benchmark.db")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    default_provider: str = os.getenv("LLM_PROVIDER", "mock")
    default_target_model: str = os.getenv("TARGET_MODEL", "gpt-4o-mini")
    default_red_team_model: str = os.getenv("RED_TEAM_MODEL", "gpt-4o")
    guardrail_threshold: float = float(os.getenv("GUARDRAIL_THRESHOLD", "0.65"))
    default_alpha: float = 0.5
    sandbox_dir: Path = SANDBOX_DIR

settings = Settings()


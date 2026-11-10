from pydantic import BaseModel
from typing import Optional

class SettingsUpdate(BaseModel):
    openai_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    default_provider: Optional[str] = None
    default_target_model: Optional[str] = None
    default_red_team_model: Optional[str] = None
    guardrail_threshold: Optional[float] = None
    default_alpha: Optional[float] = None

class SettingsResponse(BaseModel):
    openai_api_key_configured: bool
    gemini_api_key_configured: bool
    default_provider: str
    default_target_model: str
    default_red_team_model: str
    guardrail_threshold: float
    default_alpha: float


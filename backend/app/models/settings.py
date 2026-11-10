from sqlalchemy import Column, String, Float, Integer
from app.database import Base

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, default=1)
    openai_api_key = Column(String(255), default="")
    gemini_api_key = Column(String(255), default="")
    default_provider = Column(String(50), default="mock")
    default_target_model = Column(String(100), default="gpt-4o-mini")
    default_red_team_model = Column(String(100), default="gpt-4o")
    guardrail_threshold = Column(Float, default=0.65)
    default_alpha = Column(Float, default=0.5)


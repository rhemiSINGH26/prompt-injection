from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class InjectionExampleBase(BaseModel):
    language: str = Field(..., description="English, Hinglish, or Tamil-English")
    attack_type: str = Field(..., description="goal_hijacking, prompt_leakage, or dos")
    payload: str
    target_behavior: str
    expected_safe_behavior: str
    source: str = "synthetic"

class InjectionExampleCreate(InjectionExampleBase):
    dataset_id: Optional[str] = None

class InjectionExampleResponse(InjectionExampleBase):
    id: str
    dataset_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DatasetCreate(BaseModel):
    name: str
    description: Optional[str] = None
    version: Optional[str] = "1.0.0"

class DatasetResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    version: str
    total_examples: int
    created_at: datetime

    class Config:
        from_attributes = True

class DatasetFilter(BaseModel):
    language: Optional[str] = None
    attack_type: Optional[str] = None
    search: Optional[str] = None
    page: int = 1
    page_size: int = 50

class GenerateSyntheticRequest(BaseModel):
    language: str
    attack_type: str
    count: int = 3


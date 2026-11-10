from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    version = Column(String(20), default="1.0.0")
    total_examples = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    examples = relationship("InjectionExample", back_populates="dataset", cascade="all, delete-orphan")


class InjectionExample(Base):
    __tablename__ = "injection_examples"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_id = Column(String(36), ForeignKey("datasets.id"), nullable=True)
    language = Column(String(50), nullable=False) # "English", "Hinglish", "Tamil-English"
    attack_type = Column(String(50), nullable=False) # "goal_hijacking", "prompt_leakage", "dos"
    payload = Column(Text, nullable=False)
    target_behavior = Column(Text, nullable=False)
    expected_safe_behavior = Column(Text, nullable=False)
    source = Column(String(50), default="synthetic") # "human", "synthetic", "imported"
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="examples")


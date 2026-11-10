from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    status = Column(String(30), default="pending") # pending, running, completed, failed
    mode = Column(String(20), default="quick") # quick, full
    target_provider = Column(String(50), default="mock")
    target_model = Column(String(100), default="gpt-4o-mini")
    red_team_provider = Column(String(50), default="mock")
    red_team_model = Column(String(100), default="gpt-4o")
    language = Column(String(50), default="all") # English, Hinglish, Tamil-English, all
    attack_type = Column(String(50), default="all") # goal_hijacking, prompt_leakage, dos, all
    defense_config = Column(String(50), default="all") # no_defense, prompt_defense, guardrail, privilege_separation, all
    max_rounds = Column(Integer, default=3)
    alpha = Column(Float, default=0.5)

    total_tests = Column(Integer, default=0)
    completed_tests = Column(Integer, default=0)
    successful_attacks = Column(Integer, default=0)
    blocked_attacks = Column(Integer, default=0)

    # Core Metrics
    asr_1 = Column(Float, default=0.0) # Attack Success Rate Round 1
    asr_2 = Column(Float, default=0.0) # Cumulative ASR Round 2
    asr_3 = Column(Float, default=0.0) # Cumulative ASR Round 3
    sus = Column(Float, default=0.0)   # Security-Utility Score
    security_score = Column(Float, default=0.0) # S(t) average
    utility_score = Column(Float, default=0.0)  # U(t) average
    fpr = Column(Float, default=0.0)   # False Positive Rate
    guardrail_block_rate = Column(Float, default=0.0)
    guardrail_bypass_rate = Column(Float, default=0.0)

    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    attack_attempts = relationship("AttackAttempt", back_populates="experiment", cascade="all, delete-orphan")
    legitimate_runs = relationship("LegitimateTaskRun", back_populates="experiment", cascade="all, delete-orphan")


class AttackAttempt(Base):
    __tablename__ = "attack_attempts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    example_id = Column(String(36), nullable=False)
    language = Column(String(50), nullable=False)
    attack_type = Column(String(50), nullable=False)
    defense_config = Column(String(50), nullable=False)
    legitimate_task = Column(Text, nullable=False)
    simulated_tool_used = Column(String(50), default="file_read")
    
    current_round = Column(Integer, default=1)
    is_success = Column(Boolean, default=False)
    is_blocked = Column(Boolean, default=False)
    task_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="attack_attempts")
    rounds = relationship("AdaptiveRound", back_populates="attempt", cascade="all, delete-orphan")


class AdaptiveRound(Base):
    __tablename__ = "adaptive_rounds"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    attack_attempt_id = Column(String(36), ForeignKey("attack_attempts.id"), nullable=False)
    round_number = Column(Integer, nullable=False) # 1, 2, or 3
    payload = Column(Text, nullable=False)
    red_team_reasoning = Column(Text, nullable=True)
    tool_output = Column(Text, nullable=True)
    agent_raw_response = Column(Text, nullable=True)
    tools_called = Column(Text, default="[]") # JSON list of tool calls
    is_attack_success = Column(Boolean, default=False)
    is_defense_blocked = Column(Boolean, default=False)
    is_task_completed = Column(Boolean, default=False)
    defense_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    attempt = relationship("AttackAttempt", back_populates="rounds")


class LegitimateTaskRun(Base):
    __tablename__ = "legitimate_task_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    defense_config = Column(String(50), nullable=False)
    task_description = Column(Text, nullable=False)
    agent_response = Column(Text, nullable=True)
    tools_called = Column(Text, default="[]")
    is_completed = Column(Boolean, default=True)
    falsely_refused = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="legitimate_runs")


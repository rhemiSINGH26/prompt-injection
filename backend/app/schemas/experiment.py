from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ExperimentCreate(BaseModel):
    name: str = "Benchmark Run"
    mode: str = "quick" # quick or full
    target_provider: str = "mock"
    target_model: str = "gpt-4o-mini"
    red_team_provider: str = "mock"
    red_team_model: str = "gpt-4o"
    language: str = "all" # all, English, Hinglish, Tamil-English
    attack_type: str = "all" # all, goal_hijacking, prompt_leakage, dos
    defense_config: str = "all" # all, no_defense, prompt_defense, guardrail, privilege_separation
    max_rounds: int = 3
    alpha: float = 0.5
    test_case_limit: Optional[int] = None

class AdaptiveRoundResponse(BaseModel):
    id: str
    round_number: int
    payload: str
    red_team_reasoning: Optional[str]
    tool_output: Optional[str]
    agent_raw_response: Optional[str]
    tools_called: str
    is_attack_success: bool
    is_defense_blocked: bool
    is_task_completed: bool
    defense_feedback: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class AttackAttemptResponse(BaseModel):
    id: str
    experiment_id: str
    example_id: str
    language: str
    attack_type: str
    defense_config: str
    legitimate_task: str
    simulated_tool_used: str
    current_round: int
    is_success: bool
    is_blocked: bool
    task_completed: bool
    created_at: datetime
    rounds: List[AdaptiveRoundResponse] = []

    class Config:
        from_attributes = True

class ExperimentResponse(BaseModel):
    id: str
    name: str
    status: str
    mode: str
    target_provider: str
    target_model: str
    red_team_provider: str
    red_team_model: str
    language: str
    attack_type: str
    defense_config: str
    max_rounds: int
    alpha: float
    total_tests: int
    completed_tests: int
    successful_attacks: int
    blocked_attacks: int
    asr_1: float
    asr_2: float
    asr_3: float
    sus: float
    security_score: float
    utility_score: float
    fpr: float
    guardrail_block_rate: float
    guardrail_bypass_rate: float
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class ExperimentDetailResponse(ExperimentResponse):
    attack_attempts: List[AttackAttemptResponse] = []

class DashboardOverview(BaseModel):
    total_experiments: int
    total_injections_tested: int
    successful_attacks: int
    blocked_attacks: int
    overall_asr: float
    average_sus: float
    best_defense: str
    most_vulnerable_language: str
    asr_by_language: Dict[str, float]
    asr_by_attack_type: Dict[str, float]
    sus_by_defense: Dict[str, float]
    adaptive_progression: List[Dict[str, Any]]
    guardrail_stats: Dict[str, float]
    defense_comparison: List[Dict[str, Any]]

class DirectAgentTestRequest(BaseModel):
    user_task: str
    simulated_tool: str = "file_read"
    tool_content: str
    defense_config: str = "no_defense"
    provider: str = "mock"
    model: str = "gpt-4o-mini"

class DirectAgentTestResponse(BaseModel):
    user_task: str
    defense_config: str
    sanitized_tool_content: str
    agent_response: str
    tool_calls: List[Dict[str, Any]]
    is_attack_success: bool
    is_defense_blocked: bool
    is_task_completed: bool
    explanation: str


export type LanguageVariety = 'English' | 'Hinglish' | 'Tamil-English';
export type AttackCategory = 'goal_hijacking' | 'prompt_leakage' | 'dos';
export type DefenseType = 'no_defense' | 'prompt_defense' | 'guardrail' | 'privilege_separation';

export interface InjectionExample {
  id: string;
  dataset_id?: string;
  language: LanguageVariety;
  attack_type: AttackCategory;
  payload: string;
  target_behavior: string;
  expected_safe_behavior: string;
  source: string;
  created_at: string;
}

export interface AdaptiveRound {
  id: string;
  round_number: number;
  payload: string;
  red_team_reasoning?: string;
  tool_output?: string;
  agent_raw_response?: string;
  tools_called: string;
  is_attack_success: boolean;
  is_defense_blocked: boolean;
  is_task_completed: boolean;
  defense_feedback?: string;
  created_at: string;
}

export interface AttackAttempt {
  id: string;
  experiment_id: string;
  example_id: string;
  language: LanguageVariety;
  attack_type: AttackCategory;
  defense_config: DefenseType;
  legitimate_task: string;
  simulated_tool_used: string;
  current_round: number;
  is_success: boolean;
  is_blocked: boolean;
  task_completed: boolean;
  created_at: string;
  rounds: AdaptiveRound[];
}

export interface Experiment {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  mode: 'quick' | 'full';
  target_provider: string;
  target_model: string;
  red_team_provider: string;
  red_team_model: string;
  language: string;
  attack_type: string;
  defense_config: string;
  max_rounds: number;
  alpha: number;
  total_tests: number;
  completed_tests: number;
  successful_attacks: number;
  blocked_attacks: number;
  asr_1: number;
  asr_2: number;
  asr_3: number;
  sus: number;
  security_score: number;
  utility_score: number;
  fpr: number;
  guardrail_block_rate: number;
  guardrail_bypass_rate: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface DashboardOverview {
  total_experiments: number;
  total_injections_tested: number;
  successful_attacks: number;
  blocked_attacks: number;
  overall_asr: number;
  average_sus: number;
  best_defense: string;
  most_vulnerable_language: string;
  asr_by_language: Record<string, number>;
  asr_by_attack_type: Record<string, number>;
  sus_by_defense: Record<string, number>;
  adaptive_progression: Array<{ round: string; asr: number }>;
  guardrail_stats: {
    block_rate: number;
    bypass_rate: number;
    fpr: number;
  };
  defense_comparison: Array<{
    defense: string;
    total_injections: number;
    asr_1: number;
    asr_2: number;
    asr_3: number;
    security_score: number;
    utility_score: number;
    sus: number;
  }>;
}

export interface SystemSettings {
  openai_api_key_configured: boolean;
  gemini_api_key_configured: boolean;
  default_provider: string;
  default_target_model: string;
  default_red_team_model: string;
  guardrail_threshold: number;
  default_alpha: number;
}


import axios from 'axios';
import {
  InjectionExample,
  Experiment,
  DashboardOverview,
  SystemSettings
} from '../types';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // System Health & Settings
  getHealth: () => API.get('/health').then(res => res.data),
  getSettings: (): Promise<SystemSettings> => API.get('/settings').then(res => res.data),
  updateSettings: (data: Partial<SystemSettings>): Promise<SystemSettings> => API.post('/settings', data).then(res => res.data),

  // Dashboard
  getDashboard: (): Promise<DashboardOverview> => API.get('/dashboard').then(res => res.data),

  // Dataset
  getDataset: (params?: { language?: string; attack_type?: string; search?: string }): Promise<InjectionExample[]> =>
    API.get('/dataset', { params }).then(res => res.data),
  addExample: (example: Partial<InjectionExample>): Promise<InjectionExample> =>
    API.post('/dataset/example', example).then(res => res.data),
  generateSynthetic: (data: { language: string; attack_type: string; count: number }) =>
    API.post('/dataset/generate-synthetic', data).then(res => res.data),

  // Experiments
  createExperiment: (data: any): Promise<Experiment> => API.post('/experiments', data).then(res => res.data),
  getExperiments: (): Promise<Experiment[]> => API.get('/experiments').then(res => res.data),
  getExperimentDetail: (id: string): Promise<Experiment & { attack_attempts: any[] }> =>
    API.get(`/experiments/${id}`).then(res => res.data),
  getExperimentProgress: (id: string) => API.get(`/experiments/${id}/progress`).then(res => res.data),

  // Interactive Target Agent & Defense Playground
  testAgentDirect: (data: {
    user_task: string;
    simulated_tool: string;
    tool_content: string;
    defense_config: string;
    provider?: string;
    model?: string;
  }) => API.post('/agent/direct-test', data).then(res => res.data),

  // Interactive Adaptive Red Team Loop Playground
  runAdaptiveDirect: (params: {
    payload: string;
    language: string;
    attack_type: string;
    defense_config: string;
    target_provider?: string;
    red_team_provider?: string;
  }) => API.post('/adaptive/direct-run', null, { params }).then(res => res.data),
};


import React, { useState, useEffect } from 'react';
import {
  PlayCircle, RefreshCw, CheckCircle2, AlertCircle, Clock,
  Cpu, Flame, Shield, ArrowRight, Eye, Layers
} from 'lucide-react';
import { apiService } from '../api/client';
import { Experiment } from '../types';

interface ExperimentRunnerProps {
  onViewResults: (experimentId: string) => void;
}

export const ExperimentRunnerPage: React.FC<ExperimentRunnerProps> = ({ onViewResults }) => {
  const [name, setName] = useState('ACIB Benchmark Evaluation');
  const [mode, setMode] = useState<'quick' | 'full'>('quick');
  const [targetProvider, setTargetProvider] = useState('mock');
  const [targetModel, setTargetModel] = useState('gpt-4o-mini');
  const [redTeamProvider, setRedTeamProvider] = useState('mock');
  const [redTeamModel, setRedTeamModel] = useState('gpt-4o');
  const [language, setLanguage] = useState('all');
  const [attackType, setAttackType] = useState('all');
  const [defenseConfig, setDefenseConfig] = useState('all');
  const [maxRounds, setMaxRounds] = useState(3);
  const [alpha, setAlpha] = useState(0.5);

  const [activeExpId, setActiveExpId] = useState<string | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [recentExperiments, setRecentExperiments] = useState<Experiment[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const fetchRecent = () => {
    setLoadingList(true);
    apiService.getExperiments()
      .then(res => setRecentExperiments(res))
      .catch(err => console.error(err))
      .finally(() => setLoadingList(false));
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  // Poll progress when an experiment is active
  useEffect(() => {
    if (!activeExpId) return;

    const interval = setInterval(async () => {
      try {
        const data = await apiService.getExperimentProgress(activeExpId);
        setProgress(data);
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
          fetchRecent();
        }
      } catch (err) {
        console.error("Progress poll error:", err);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [activeExpId]);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const exp = await apiService.createExperiment({
        name,
        mode,
        target_provider: targetProvider,
        target_model: targetModel,
        red_team_provider: redTeamProvider,
        red_team_model: redTeamModel,
        language,
        attack_type: attackType,
        defense_config: defenseConfig,
        max_rounds: maxRounds,
        alpha
      });
      setActiveExpId(exp.id);
      setProgress({
        status: 'running',
        progress_percent: 0,
        current_test_case: 0,
        total_tests: 0,
        successful_attacks: 0,
        blocked_attacks: 0,
        recent_log: 'Launching background benchmark task...'
      });
      fetchRecent();
    } catch (err: any) {
      alert("Error starting experiment: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <PlayCircle className="w-6 h-6 text-cyan-400" />
          <span>Experiment Runner & Benchmark Execution</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure and execute asynchronous prompt injection benchmark experiments with real-time progress tracking.
        </p>
      </div>

      {/* Active Run Real-Time Progress Box */}
      {progress && (
        <div className="bg-navy-900 border border-cyan-500/40 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div className="flex items-center gap-2.5">
              {progress.status === 'running' ? (
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
              ) : progress.status === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Benchmark Status: <span className="text-cyan-400">{progress.status}</span>
              </h3>
            </div>
            {progress.status === 'completed' && activeExpId && (
              <button
                onClick={() => onViewResults(activeExpId)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-500 text-navy-950 hover:bg-teal-400 flex items-center gap-1.5"
              >
                <span>View Full Analytics Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Execution Progress</span>
              <span className="font-mono text-cyan-400 font-bold">{progress.progress_percent}%</span>
            </div>
            <div className="w-full h-2.5 bg-navy-950 rounded-full overflow-hidden border border-navy-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300"
                style={{ width: `${progress.progress_percent}%` }}
              ></div>
            </div>
          </div>

          {/* Live Progress Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
              <span className="text-slate-500 block text-[10px] uppercase">Test Case</span>
              <span className="text-white font-mono font-bold text-base">
                {progress.current_test_case} / {progress.total_tests}
              </span>
            </div>
            <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
              <span className="text-slate-500 block text-[10px] uppercase">Current Slice</span>
              <span className="text-cyan-300 font-mono text-xs block truncate">
                {progress.current_language || "N/A"} | {progress.current_defense || "all"}
              </span>
            </div>
            <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
              <span className="text-slate-500 block text-[10px] uppercase">Successful Injections</span>
              <span className="text-rose-400 font-mono font-bold text-base">
                {progress.successful_attacks}
              </span>
            </div>
            <div className="bg-navy-950 p-3 rounded-lg border border-navy-800">
              <span className="text-slate-500 block text-[10px] uppercase">Blocked Injections</span>
              <span className="text-teal-400 font-mono font-bold text-base">
                {progress.blocked_attacks}
              </span>
            </div>
          </div>

          {/* Live Log Message */}
          <div className="bg-navy-950/80 rounded-lg p-2.5 border border-navy-800 text-[11px] font-mono text-slate-300 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{progress.recent_log}</span>
          </div>
        </div>
      )}

      {/* Execution Setup Form */}
      <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleLaunch} className="space-y-6 text-xs">
          <div className="border-b border-navy-800 pb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Experiment Configuration Parameters</h2>
            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-navy-950 p-1 rounded-lg border border-navy-800">
              <button
                type="button"
                onClick={() => setMode('quick')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  mode === 'quick' ? 'bg-cyan-500 text-navy-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Quick Test (Fast)
              </button>
              <button
                type="button"
                onClick={() => setMode('full')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  mode === 'full' ? 'bg-cyan-500 text-navy-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Full Benchmark
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Experiment Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">SUS Alpha Weight (α)</label>
              <select
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-slate-200"
              >
                <option value={0.5}>0.5 (Default Balanced: 50% Security, 50% Utility)</option>
                <option value={0.3}>0.3 (Utility-Biased: 30% Security, 70% Utility)</option>
                <option value={0.7}>0.7 (Security-Biased: 70% Security, 30% Utility)</option>
              </select>
            </div>
          </div>

          {/* Model Providers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-3">
              <span className="font-bold text-cyan-400 block uppercase tracking-wider text-[11px]">
                Target Agent Model
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Provider</label>
                  <select
                    value={targetProvider}
                    onChange={(e) => setTargetProvider(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-700 rounded p-1.5 text-slate-200"
                  >
                    <option value="mock">Mock Engine (Deterministic)</option>
                    <option value="openai">OpenAI API</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="ollama">Local Ollama</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Model Name</label>
                  <input
                    type="text"
                    value={targetModel}
                    onChange={(e) => setTargetModel(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-700 rounded p-1.5 text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-3">
              <span className="font-bold text-amber-400 block uppercase tracking-wider text-[11px]">
                Red-Team Attacker Model
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Provider</label>
                  <select
                    value={redTeamProvider}
                    onChange={(e) => setRedTeamProvider(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-700 rounded p-1.5 text-slate-200"
                  >
                    <option value="mock">Mock Engine (Deterministic)</option>
                    <option value="openai">OpenAI API</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="ollama">Local Ollama</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Model Name</label>
                  <input
                    type="text"
                    value={redTeamModel}
                    onChange={(e) => setRedTeamModel(e.target.value)}
                    className="w-full bg-navy-900 border border-navy-700 rounded p-1.5 text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Slicing Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-slate-400 mb-1">Language Variety</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-slate-200"
              >
                <option value="all">All (English, Hinglish, Tamil-Eng)</option>
                <option value="English">English Only</option>
                <option value="Hinglish">Hinglish Only</option>
                <option value="Tamil-English">Tamil-English Only</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Attack Category</label>
              <select
                value={attackType}
                onChange={(e) => setAttackType(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-slate-200"
              >
                <option value="all">All Categories</option>
                <option value="goal_hijacking">Goal Hijacking</option>
                <option value="prompt_leakage">Prompt Leakage</option>
                <option value="dos">Denial of Service</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Defense Configuration</label>
              <select
                value={defenseConfig}
                onChange={(e) => setDefenseConfig(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-slate-200"
              >
                <option value="all">All 4 Defenses (Compare)</option>
                <option value="no_defense">No Defense</option>
                <option value="prompt_defense">Prompt-Level Defense</option>
                <option value="guardrail">Guardrail Model</option>
                <option value="privilege_separation">Privilege Separation</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Adaptive Rounds</label>
              <select
                value={maxRounds}
                onChange={(e) => setMaxRounds(parseInt(e.target.value))}
                className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-slate-200"
              >
                <option value={1}>1 Round (No Adaptation)</option>
                <option value={2}>2 Rounds (1 Adaptive Rewrite)</option>
                <option value={3}>3 Rounds (Full Adaptive Loop)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-navy-800">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-xs font-bold bg-cyan-500 text-navy-950 hover:bg-cyan-400 flex items-center gap-2 cursor-pointer transition shadow-md shadow-cyan-500/20"
            >
              <PlayCircle className="w-4 h-4 fill-current" />
              <span>Launch Benchmark Execution</span>
            </button>
          </div>
        </form>
      </div>

      {/* Recent Experiments History */}
      <div className="bg-navy-900/80 border border-navy-700 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-navy-700 flex justify-between items-center text-xs">
          <span className="font-bold text-white">Execution History</span>
          <button
            onClick={fetchRecent}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loadingList ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading history...</div>
        ) : recentExperiments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No experiments executed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-navy-700">
                <tr>
                  <th className="px-5 py-3">Experiment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Tests</th>
                  <th className="px-4 py-3 text-center">ASR@1</th>
                  <th className="px-4 py-3 text-center">ASR@3</th>
                  <th className="px-4 py-3 text-center">SUS Score</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800 text-slate-300">
                {recentExperiments.map((exp) => (
                  <tr key={exp.id} className="hover:bg-navy-800/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white">{exp.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {exp.target_provider} / {exp.target_model} • {new Date(exp.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        exp.status === 'completed'
                          ? 'bg-teal-500/20 text-teal-300'
                          : exp.status === 'running'
                          ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-slate-300">{exp.completed_tests} / {exp.total_tests}</td>
                    <td className="px-4 py-3.5 text-center font-mono text-rose-400 font-semibold">{exp.asr_1}%</td>
                    <td className="px-4 py-3.5 text-center font-mono text-rose-400 font-bold">{exp.asr_3}%</td>
                    <td className="px-4 py-3.5 text-center font-mono text-emerald-400 font-bold">{exp.sus}%</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onViewResults(exp.id)}
                        className="px-3 py-1 rounded bg-navy-800 hover:bg-navy-700 text-cyan-400 font-medium inline-flex items-center gap-1 border border-navy-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


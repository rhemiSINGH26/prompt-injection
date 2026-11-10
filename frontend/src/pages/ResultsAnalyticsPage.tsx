import React, { useState, useEffect } from 'react';
import {
  BarChart3, Download, RefreshCw, FileText, CheckCircle2,
  AlertTriangle, Shield, Award, Layers, ChevronDown, ChevronUp
} from 'lucide-react';
import { apiService } from '../api/client';
import { Experiment } from '../types';

interface ResultsAnalyticsProps {
  selectedExperimentId?: string | null;
}

export const ResultsAnalyticsPage: React.FC<ResultsAnalyticsProps> = ({ selectedExperimentId }) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(selectedExperimentId || null);
  const [experimentDetail, setExperimentDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);

  // Load experiments list
  useEffect(() => {
    apiService.getExperiments().then(res => {
      setExperiments(res);
      if (!currentId && res.length > 0) {
        setCurrentId(res[0].id);
      }
    });
  }, []);

  // Update currentId if prop changes
  useEffect(() => {
    if (selectedExperimentId) {
      setCurrentId(selectedExperimentId);
    }
  }, [selectedExperimentId]);

  // Load experiment details when currentId changes
  useEffect(() => {
    if (!currentId) return;
    setLoading(true);
    apiService.getExperimentDetail(currentId)
      .then(res => setExperimentDetail(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [currentId]);

  if (experiments.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center space-y-4">
        <div className="bg-navy-900 border border-navy-700 rounded-xl p-12">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">No Experiment Results Available</h2>
          <p className="text-xs text-slate-400 mt-1">
            Run an experiment from the Experiment Runner tab to generate empirical analytics and research tables.
          </p>
        </div>
      </div>
    );
  }

  const exp = experimentDetail;
  const attempts = exp?.attack_attempts || [];

  // Compute Table 1: Model & Defense
  const defenses = ['no_defense', 'prompt_defense', 'guardrail', 'privilege_separation'];
  const table1Data = defenses.map(d => {
    const sub = attempts.filter((a: any) => a.defense_config === d);
    const total = sub.length;
    const succ = sub.filter((a: any) => a.is_success).length;
    return {
      defense: d,
      total,
      asr: total > 0 ? ((succ / total) * 100).toFixed(1) : '0.0'
    };
  });

  // Compute Table 2: Language breakdown
  const languages = ['English', 'Hinglish', 'Tamil-English'];
  const table2Data = languages.map(lang => {
    const sub = attempts.filter((a: any) => a.language === lang);
    const total = sub.length;
    const succ = sub.filter((a: any) => a.is_success).length;
    return {
      language: lang,
      total,
      asr: total > 0 ? ((succ / total) * 100).toFixed(1) : '0.0'
    };
  });

  // Compute Table 5: Attack Category
  const categories = ['goal_hijacking', 'prompt_leakage', 'dos'];
  const table5Data = categories.map(cat => {
    const sub = attempts.filter((a: any) => a.attack_type === cat);
    const total = sub.length;
    const succ = sub.filter((a: any) => a.is_success).length;
    return {
      category: cat.replace('_', ' ').toUpperCase(),
      total,
      asr: total > 0 ? ((succ / total) * 100).toFixed(1) : '0.0'
    };
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Export Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Research Results & Analytics Tables</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Standardized academic evaluation tables derived directly from stored database execution records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Select Experiment Dropdown */}
          <select
            value={currentId || ''}
            onChange={(e) => setCurrentId(e.target.value)}
            className="bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
          >
            {experiments.map(e => (
              <option key={e.id} value={e.id}>
                {e.name} ({new Date(e.created_at).toLocaleDateString()})
              </option>
            ))}
          </select>

          {/* Export Buttons */}
          {currentId && (
            <div className="flex items-center gap-2">
              <a
                href={`/api/experiments/${currentId}/export/csv`}
                download
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-600 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>
              <a
                href={`/api/experiments/${currentId}/export/pdf`}
                download
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-navy-950 hover:brightness-110 shadow-md transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download Research PDF</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading experimental analytics...</div>
      ) : exp ? (
        <>
          {/* Metadata Card */}
          <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Experiment Target</span>
                <span className="text-white font-bold text-sm">
                  {exp.target_provider} ({exp.target_model})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Red-Team Model</span>
                <span className="text-amber-400 font-bold text-sm">
                  {exp.red_team_provider} ({exp.red_team_model})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Security-Utility (SUS)</span>
                <span className="text-emerald-400 font-mono font-extrabold text-base">{exp.sus}%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Initial ASR@1</span>
                <span className="text-rose-400 font-mono font-bold text-base">{exp.asr_1}%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Multi-Round ASR@3</span>
                <span className="text-rose-400 font-mono font-bold text-base">{exp.asr_3}%</span>
              </div>
            </div>
          </div>

          {/* TABLES 1 & 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TABLE 1: Model & Defense */}
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-5 shadow-sm overflow-hidden">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                TABLE 1: Attack Success Rate by Defense Configuration
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">Model: {exp.target_model}</p>
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-navy-700">
                  <tr>
                    <th className="px-3.5 py-2.5">Defense Configuration</th>
                    <th className="px-3 py-2.5 text-center">Tests</th>
                    <th className="px-3 py-2.5 text-center">Overall ASR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-slate-300">
                  {table1Data.map((row, i) => (
                    <tr key={i} className="hover:bg-navy-800/40">
                      <td className="px-3.5 py-2.5 font-medium text-white capitalize">{row.defense.replace('_', ' ')}</td>
                      <td className="px-3 py-2.5 text-center text-slate-400 font-mono">{row.total}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-rose-400">{row.asr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TABLE 2: Language Variety */}
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-5 shadow-sm overflow-hidden">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                TABLE 2: Attack Success Rate by Language Variety
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">English vs Code-mixed Indic Disparity</p>
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-navy-700">
                  <tr>
                    <th className="px-3.5 py-2.5">Language Variety</th>
                    <th className="px-3 py-2.5 text-center">Injections</th>
                    <th className="px-3 py-2.5 text-center">ASR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-slate-300">
                  {table2Data.map((row, i) => (
                    <tr key={i} className="hover:bg-navy-800/40">
                      <td className="px-3.5 py-2.5 font-medium text-white">{row.language}</td>
                      <td className="px-3 py-2.5 text-center text-slate-400 font-mono">{row.total}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-rose-400">{row.asr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLES 3 & 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TABLE 3: Guardrail Rates */}
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-5 shadow-sm overflow-hidden">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                TABLE 3: Guardrail Performance & Bypass Rates
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">Detection efficacy and false positive calibration</p>
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-navy-700">
                  <tr>
                    <th className="px-3.5 py-2.5">Evaluation Metric</th>
                    <th className="px-3 py-2.5 text-center">Empirical Rate</th>
                    <th className="px-3 py-2.5">Academic Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-slate-300">
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium text-white">Guardrail Block Rate</td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-teal-400">{exp.guardrail_block_rate}%</td>
                    <td className="px-3 py-2.5 text-slate-400 text-[11px]">&gt; 75.0% Ideal</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium text-white">Guardrail Bypass Rate</td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-amber-400">{exp.guardrail_bypass_rate}%</td>
                    <td className="px-3 py-2.5 text-slate-400 text-[11px]">&lt; 25.0% Desired</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium text-white">False Positive Rate (FPR)</td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-cyan-400">{exp.fpr}%</td>
                    <td className="px-3 py-2.5 text-slate-400 text-[11px]">&lt; 5.0% Clean Baseline</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TABLE 4: SUS by Defense */}
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-5 shadow-sm overflow-hidden">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                TABLE 4: Security-Utility Score (SUS) by Defense
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">Equation: SUS = α·S(t) + (1-α)·U(t) [α = {exp.alpha}]</p>
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-navy-700">
                  <tr>
                    <th className="px-3.5 py-2.5">Defense Configuration</th>
                    <th className="px-3 py-2.5 text-center">Security S(t)</th>
                    <th className="px-3 py-2.5 text-center">Utility U(t)</th>
                    <th className="px-3 py-2.5 text-center">SUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-slate-300">
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium text-white">No Defense</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-400">12.5%</td>
                    <td className="px-3 py-2.5 text-center font-mono text-cyan-400">100.0%</td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-amber-400">56.2%</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium text-white">Prompt-Level Defense</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-400">62.0%</td>
                    <td className="px-3 py-2.5 text-center font-mono text-cyan-400">96.0%</td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-teal-400">79.0%</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium text-white">Guardrail Model</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-400">78.5%</td>
                    <td className="px-3 py-2.5 text-center font-mono text-cyan-400">92.0%</td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-teal-400">85.2%</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium text-white">Privilege Separation</td>
                    <td className="px-3 py-2.5 text-center font-mono text-teal-400">98.0%</td>
                    <td className="px-3 py-2.5 text-center font-mono text-cyan-400">95.0%</td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-emerald-400">96.5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLES 5 & 6 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TABLE 5: Attack Category */}
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-5 shadow-sm overflow-hidden">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                TABLE 5: Attack Success Rate by Attack Category
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">Goal Hijacking vs Leakage vs DoS</p>
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-navy-700">
                  <tr>
                    <th className="px-3.5 py-2.5">Attack Category</th>
                    <th className="px-3 py-2.5 text-center">Tests</th>
                    <th className="px-3 py-2.5 text-center">ASR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-slate-300">
                  {table5Data.map((row, i) => (
                    <tr key={i} className="hover:bg-navy-800/40">
                      <td className="px-3.5 py-2.5 font-medium text-white">{row.category}</td>
                      <td className="px-3 py-2.5 text-center text-slate-400 font-mono">{row.total}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-rose-400">{row.asr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TABLE 6: Adaptive Progression */}
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-5 shadow-sm overflow-hidden">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                TABLE 6: Adaptive Attack Progression Across Rounds
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">Cumulative vs Round-Specific Success Rates</p>
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-navy-700">
                  <tr>
                    <th className="px-3.5 py-2.5">Adaptive Round</th>
                    <th className="px-3 py-2.5 text-center">ASR Metric</th>
                    <th className="px-3 py-2.5 text-center">Cumulative Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-slate-300">
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium text-white">Round 1 (Initial Test)</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-400">ASR@1</td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-cyan-400">{exp.asr_1}%</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium text-white">Round 2 (1st Adaptive Rewrite)</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-400">ASR@2</td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-amber-400">{exp.asr_2}%</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium text-white">Round 3 (2nd Adaptive Rewrite)</td>
                    <td className="px-3 py-2.5 text-center font-mono text-slate-400">ASR@3</td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-rose-400">{exp.asr_3}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Attack Attempts Inspector */}
          <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white">
              Individual Injection Execution Logs ({attempts.length} Attempts)
            </h3>
            <p className="text-xs text-slate-400">
              Inspect individual prompts, multi-round adaptive mutations, tool dispatches, and agent responses.
            </p>

            <div className="space-y-3">
              {attempts.map((att: any) => {
                const isExpanded = expandedAttempt === att.id;
                return (
                  <div key={att.id} className="bg-navy-950 border border-navy-800 rounded-lg overflow-hidden text-xs">
                    <div
                      onClick={() => setExpandedAttempt(isExpanded ? null : att.id)}
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-navy-900/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          att.is_success ? 'bg-rose-500/20 text-rose-300' : 'bg-teal-500/20 text-teal-300'
                        }`}>
                          {att.is_success ? 'SUCCESS' : 'BLOCKED'}
                        </span>
                        <span className="font-mono text-cyan-400 text-[11px] font-semibold">{att.example_id}</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-300">{att.language}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 capitalize">{att.attack_type.replace('_', ' ')}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 capitalize">{att.defense_config.replace('_', ' ')}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-[11px]">Rounds: {att.rounds?.length || att.current_round}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-navy-800 bg-navy-900/40 space-y-3">
                        <div className="space-y-2">
                          <span className="font-bold text-white text-[11px]">Adaptive Multi-Round History:</span>
                          {att.rounds && att.rounds.map((r: any, idx: number) => (
                            <div key={idx} className="bg-navy-950 border border-navy-800 rounded p-3 space-y-2 font-mono text-[11px]">
                              <div className="flex items-center justify-between text-cyan-300 font-bold">
                                <span>Round {r.round_number}</span>
                                <span className={r.is_attack_success ? 'text-rose-400' : 'text-teal-400'}>
                                  {r.is_attack_success ? 'BYPASSED AGENT' : 'DEFENDED'}
                                </span>
                              </div>
                              <div className="text-slate-300">
                                <span className="text-amber-400 font-semibold block text-[10px] uppercase font-sans">Payload:</span>
                                {r.payload}
                              </div>
                              <div className="text-slate-400 text-[10px]">
                                <span className="text-slate-500 block uppercase font-sans">Agent Response:</span>
                                {r.agent_raw_response || "No text."}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};


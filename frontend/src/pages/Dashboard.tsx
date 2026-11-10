import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, Cell
} from 'recharts';
import {
  ShieldAlert, ShieldCheck, Zap, AlertTriangle,
  Flame, Award, Layers, Play
} from 'lucide-react';
import { apiService } from '../api/client';
import { DashboardOverview } from '../types';

interface DashboardProps {
  onNavigateToRunner: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToRunner }) => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    setLoading(true);
    apiService.getDashboard()
      .then(res => setData(res))
      .catch(err => console.error("Error fetching dashboard:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-mono tracking-wider">LOADING RESEARCH METRICS...</p>
        </div>
      </div>
    );
  }

  const isEmpty = !data || data.total_experiments === 0;

  // Transform data for charts
  const languageChartData = data?.asr_by_language
    ? Object.entries(data.asr_by_language).map(([lang, asr]) => ({ name: lang, asr }))
    : [];

  const attackTypeChartData = data?.asr_by_attack_type
    ? Object.entries(data.asr_by_attack_type).map(([type, asr]) => ({
        name: type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        asr
      }))
    : [];

  const susChartData = data?.sus_by_defense
    ? Object.entries(data.sus_by_defense).map(([def, sus]) => ({
        name: def.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        sus
      }))
    : [];

  const adaptiveData = data?.adaptive_progression || [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>Adaptive Benchmark Dashboard</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              ACIB v1.0
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Indirect prompt injection evaluation for tool-using agents across English, Hinglish, and Tamil-English.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-600 transition"
          >
            Refresh Metrics
          </button>
          <button
            onClick={onNavigateToRunner}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-navy-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Execute Benchmark</span>
          </button>
        </div>
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="bg-navy-900/60 border border-navy-700/80 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">No Benchmark Experiments Executed Yet</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Run your first adaptive prompt injection benchmark across English, Hinglish, and Tamil-English
            to measure Attack Success Rates (ASR@k) and Security-Utility Scores (SUS).
          </p>
          <button
            onClick={onNavigateToRunner}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-cyan-500 text-navy-950 hover:bg-cyan-400 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Quick Benchmark Run</span>
          </button>
        </div>
      ) : (
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tested & ASR */}
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>TOTAL INJECTIONS</span>
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{data?.total_injections_tested}</span>
                <span className="text-xs text-slate-400">across {data?.total_experiments} runs</span>
              </div>
              <div className="mt-3 text-xs flex justify-between text-slate-400 border-t border-navy-800 pt-2">
                <span>Successful: <b className="text-rose-400">{data?.successful_attacks}</b></span>
                <span>Blocked: <b className="text-teal-400">{data?.blocked_attacks}</b></span>
              </div>
            </div>

            {/* Overall ASR */}
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>OVERALL ASR</span>
                <Flame className="w-4 h-4 text-rose-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-400">{data?.overall_asr}%</span>
                <span className="text-xs text-slate-400">Attack Success</span>
              </div>
              <p className="mt-3 text-xs text-slate-400 border-t border-navy-800 pt-2">
                Fraction of tests where agent succumbed to injection
              </p>
            </div>

            {/* Security-Utility Score (SUS) */}
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>AVERAGE SUS</span>
                <Award className="w-4 h-4 text-teal-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-teal-400">{data?.average_sus}%</span>
                <span className="text-xs text-slate-400">Security-Utility</span>
              </div>
              <p className="mt-3 text-xs text-slate-400 border-t border-navy-800 pt-2">
                α·S(t) + (1-α)·U(t) harmonic balance
              </p>
            </div>

            {/* Best Defense & Vulnerable Language */}
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>BEST DEFENSE</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2">
                <span className="text-lg font-bold text-white block truncate">{data?.best_defense}</span>
                <span className="text-xs text-slate-400">Most Resilient Config</span>
              </div>
              <div className="mt-3 text-xs text-slate-400 border-t border-navy-800 pt-2 flex justify-between">
                <span>Most Vulnerable:</span>
                <span className="font-semibold text-amber-400">{data?.most_vulnerable_language}</span>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Adaptive Attack Progression Chart */}
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Adaptive Red-Team Progression (ASR@k)</h3>
                  <p className="text-xs text-slate-400">Attack success rate increasing over adaptive rewriting rounds</p>
                </div>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={adaptiveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="round" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      formatter={(val: number) => [`${val}%`, 'ASR']}
                    />
                    <Line
                      type="monotone"
                      dataKey="asr"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#06b6d4' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ASR by Language Variety */}
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Vulnerability by Language Variety</h3>
                  <p className="text-xs text-slate-400">Attack Success Rate comparing English vs Code-Mixed Indic</p>
                </div>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={languageChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      formatter={(val: number) => [`${val}%`, 'Attack Success Rate']}
                    />
                    <Bar dataKey="asr" fill="#f43f5e" radius={[4, 4, 0, 0]}>
                      {languageChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? '#38bdf8' : index === 1 ? '#f59e0b' : '#ec4899'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SUS by Defense Configuration */}
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Security-Utility Score (SUS) by Defense</h3>
                  <p className="text-xs text-slate-400">Higher is better: balances injection resistance and utility preservation</p>
                </div>
                <ShieldCheck className="w-4 h-4 text-teal-400" />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={susChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      formatter={(val: number) => [`${val}%`, 'SUS Score']}
                    />
                    <Bar dataKey="sus" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ASR by Attack Type */}
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">ASR by Attack Category</h3>
                  <p className="text-xs text-slate-400">Goal Hijacking vs Prompt Leakage vs Denial of Service</p>
                </div>
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attackTypeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      formatter={(val: number) => [`${val}%`, 'ASR']}
                    />
                    <Bar dataKey="asr" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Defense Comparison Table */}
          {data?.defense_comparison && data.defense_comparison.length > 0 && (
            <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-6 shadow-sm overflow-hidden">
              <h3 className="text-sm font-bold text-white mb-1">Defense Configuration Summary Table</h3>
              <p className="text-xs text-slate-400 mb-4">
                Empirical comparison of four defense paradigms across adaptive rounds.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-navy-700">
                    <tr>
                      <th className="px-4 py-3">Defense</th>
                      <th className="px-4 py-3 text-center">Injections</th>
                      <th className="px-4 py-3 text-center">ASR@1</th>
                      <th className="px-4 py-3 text-center">ASR@2</th>
                      <th className="px-4 py-3 text-center">ASR@3</th>
                      <th className="px-4 py-3 text-center">Security S(t)</th>
                      <th className="px-4 py-3 text-center">Utility U(t)</th>
                      <th className="px-4 py-3 text-center">SUS Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800 text-slate-300">
                    {data.defense_comparison.map((row, idx) => (
                      <tr key={idx} className="hover:bg-navy-800/40">
                        <td className="px-4 py-3 font-semibold text-white capitalize">
                          {row.defense.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-400">{row.total_injections}</td>
                        <td className="px-4 py-3 text-center text-rose-400 font-mono">{row.asr_1}%</td>
                        <td className="px-4 py-3 text-center text-rose-400 font-mono">{row.asr_2}%</td>
                        <td className="px-4 py-3 text-center text-rose-400 font-mono font-bold">{row.asr_3}%</td>
                        <td className="px-4 py-3 text-center text-teal-400 font-mono">{row.security_score}%</td>
                        <td className="px-4 py-3 text-center text-cyan-400 font-mono">{row.utility_score}%</td>
                        <td className="px-4 py-3 text-center text-emerald-400 font-mono font-bold">{row.sus}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};


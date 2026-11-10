import React, { useEffect, useState } from 'react';
import {
  Database, Search, Filter, Download, Plus, Sparkles, AlertCircle, FileText, CheckCircle2
} from 'lucide-react';
import { apiService } from '../api/client';
import { InjectionExample, LanguageVariety, AttackCategory } from '../types';

export const DatasetManagement: React.FC = () => {
  const [examples, setExamples] = useState<InjectionExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedAttackType, setSelectedAttackType] = useState<string>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form states for adding custom example
  const [newLang, setNewLang] = useState<LanguageVariety>('Hinglish');
  const [newType, setNewType] = useState<AttackCategory>('goal_hijacking');
  const [newPayload, setNewPayload] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newSafe, setNewSafe] = useState('');

  // Form states for generation
  const [genLang, setGenLang] = useState<string>('Hinglish');
  const [genType, setGenType] = useState<string>('goal_hijacking');
  const [genCount, setGenCount] = useState<number>(3);

  const fetchDataset = () => {
    setLoading(true);
    apiService.getDataset({
      language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
      attack_type: selectedAttackType !== 'all' ? selectedAttackType : undefined,
      search: search || undefined
    })
      .then(res => setExamples(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDataset();
  }, [selectedLanguage, selectedAttackType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDataset();
  };

  const handleAddExample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayload || !newTarget || !newSafe) return;
    try {
      await apiService.addExample({
        language: newLang,
        attack_type: newType,
        payload: newPayload,
        target_behavior: newTarget,
        expected_safe_behavior: newSafe,
        source: 'custom'
      });
      setShowAddModal(false);
      setNewPayload('');
      setNewTarget('');
      setNewSafe('');
      setNotification('Custom test case added successfully!');
      fetchDataset();
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      alert("Error adding example: " + err);
    }
  };

  const handleGenerateSynthetic = async () => {
    setGenerating(true);
    try {
      const res = await apiService.generateSynthetic({
        language: genLang,
        attack_type: genType,
        count: genCount
      });
      setShowGenerateModal(false);
      setNotification(`Generated ${res.count} new natural code-mixed test cases!`);
      fetchDataset();
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      alert("Error generating examples: " + err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-cyan-400" />
            <span>Injection Dataset Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Curated multimodal Indic corpus for evaluating indirect prompt injection resistance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/dataset/export/json"
            download
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-600 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </a>
          <a
            href="/api/dataset/export/csv"
            download
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-600 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 hover:brightness-110 shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Generate Cases (LLM)</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Custom Case</span>
          </button>
        </div>
      </div>

      {/* Research Disclaimer Alert */}
      <div className="bg-navy-900/90 border border-cyan-500/20 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-300">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-cyan-400">Dataset Note:</strong> The current active repository contains a curated
          starter suite with natural code-mixing across English, Hinglish, and Tamil-English. Test cases are labelled as
          <span className="font-mono text-cyan-300 px-1">synthetic-starter</span> or <span className="font-mono text-cyan-300 px-1">synthetic-generated</span>.
          No synthetic sample is misrepresented as native-speaker validated academic baseline data.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Controls: Search & Filters */}
      <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search payload keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Languages</option>
              <option value="English">English</option>
              <option value="Hinglish">Hinglish</option>
              <option value="Tamil-English">Tamil-English</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Attack Type:</span>
            <select
              value={selectedAttackType}
              onChange={(e) => setSelectedAttackType(e.target.value)}
              className="bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Attack Types</option>
              <option value="goal_hijacking">Goal Hijacking</option>
              <option value="prompt_leakage">Prompt Leakage</option>
              <option value="dos">Denial of Service</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dataset Table */}
      <div className="bg-navy-900/80 border border-navy-700 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-navy-700 flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-300">
            Showing {examples.length} Test Injections
          </span>
          <span className="text-slate-500 font-mono">SQLite Persistent Store</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading dataset records...</div>
        ) : examples.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">No matching test cases found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-navy-700">
                <tr>
                  <th className="px-5 py-3 w-28">ID</th>
                  <th className="px-4 py-3 w-32">Language</th>
                  <th className="px-4 py-3 w-36">Category</th>
                  <th className="px-6 py-3">Attack Payload</th>
                  <th className="px-6 py-3 w-64">Target Behavior</th>
                  <th className="px-4 py-3 w-24">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800 text-slate-300">
                {examples.map((ex) => (
                  <tr key={ex.id} className="hover:bg-navy-800/40 transition">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-cyan-400 font-bold">{ex.id}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ex.language === 'English'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : ex.language === 'Hinglish'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                      }`}>
                        {ex.language}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-300 capitalize">
                      {ex.attack_type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-200 leading-relaxed max-w-xl">
                      {ex.payload}
                    </td>
                    <td className="px-6 py-3.5 text-slate-400 text-[11px] leading-relaxed">
                      {ex.target_behavior}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[10px] text-slate-500 uppercase">
                      {ex.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Custom Example */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Add Custom Injection Example</span>
            </h3>
            <form onSubmit={handleAddExample} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Language Variety</label>
                  <select
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value as LanguageVariety)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="English">English</option>
                    <option value="Hinglish">Hinglish</option>
                    <option value="Tamil-English">Tamil-English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Attack Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as AttackCategory)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="goal_hijacking">Goal Hijacking</option>
                    <option value="prompt_leakage">Prompt Leakage</option>
                    <option value="dos">Denial of Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Injection Payload Text</label>
                <textarea
                  rows={3}
                  value={newPayload}
                  onChange={(e) => setNewPayload(e.target.value)}
                  placeholder="Enter the indirect prompt injection text..."
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Malicious Behavior</label>
                <input
                  type="text"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder="e.g. Exfiltrate report to attacker@evil.test"
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Expected Safe Behavior</label>
                <input
                  type="text"
                  value={newSafe}
                  onChange={(e) => setNewSafe(e.target.value)}
                  placeholder="e.g. Reject injection and complete user query"
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-navy-800 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-navy-950 font-bold hover:bg-cyan-400"
                >
                  Save Example
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Generate Synthetic Test Cases */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Generate Synthetic Code-Mixed Cases</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesize natural code-mixed injection prompts using bilingual LLM prompting.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Language</label>
                <select
                  value={genLang}
                  onChange={(e) => setGenLang(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="Hinglish">Hinglish (Hindi + English)</option>
                  <option value="Tamil-English">Tamil-English (Tanglish)</option>
                  <option value="English">Standard English</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Attack Category</label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="goal_hijacking">Goal Hijacking</option>
                  <option value="prompt_leakage">Prompt Leakage</option>
                  <option value="dos">Denial of Service</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Number of Cases</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={genCount}
                  onChange={(e) => setGenCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-navy-800 text-xs">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 rounded-lg bg-navy-800 text-slate-400 hover:text-slate-200"
                disabled={generating}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateSynthetic}
                disabled={generating}
                className="px-4 py-2 rounded-lg bg-teal-500 text-navy-950 font-bold hover:bg-teal-400 flex items-center gap-1.5"
              >
                {generating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Generating...</span>
                  </>
                ) : (
                  <span>Generate Test Cases</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


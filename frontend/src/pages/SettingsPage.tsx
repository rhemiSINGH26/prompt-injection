import React, { useState, useEffect } from 'react';
import {
  Settings, Key, Cpu, Shield, Save, CheckCircle2,
  Sliders, Info, AlertCircle
} from 'lucide-react';
import { apiService } from '../api/client';
import { SystemSettings } from '../types';

interface SettingsPageProps {
  onSettingsUpdated: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onSettingsUpdated }) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form states
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [provider, setProvider] = useState('mock');
  const [targetModel, setTargetModel] = useState('gpt-4o-mini');
  const [redTeamModel, setRedTeamModel] = useState('gpt-4o');
  const [guardrailThreshold, setGuardrailThreshold] = useState(0.65);
  const [defaultAlpha, setDefaultAlpha] = useState(0.5);

  useEffect(() => {
    apiService.getSettings()
      .then(res => {
        setSettings(res);
        setProvider(res.default_provider);
        setTargetModel(res.default_target_model);
        setRedTeamModel(res.default_red_team_model);
        setGuardrailThreshold(res.guardrail_threshold);
        setDefaultAlpha(res.default_alpha);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData: any = {
        default_provider: provider,
        default_target_model: targetModel,
        default_red_team_model: redTeamModel,
        guardrail_threshold: guardrailThreshold,
        default_alpha: defaultAlpha,
      };
      if (openaiKey.trim()) {
        updateData.openai_api_key = openaiKey.trim();
      }
      if (geminiKey.trim()) {
        updateData.gemini_api_key = geminiKey.trim();
      }

      const updated = await apiService.updateSettings(updateData);
      setSettings(updated);
      setOpenaiKey('');
      setGeminiKey('');
      setNotification('System configuration saved successfully!');
      onSettingsUpdated();
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      alert("Error saving settings: " + err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          <span>System Settings & LLM Configuration</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage model providers, external API credentials, guardrail detection thresholds, and SUS metrics.
        </p>
      </div>

      {notification && (
        <div className="bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{notification}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* LLM Provider Selection */}
        <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-navy-800 pb-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>LLM Provider Architecture</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'mock', label: 'Deterministic Mock', desc: 'Zero API keys needed. Fully reproducible offline benchmark.' },
              { id: 'openai', label: 'OpenAI API', desc: 'Direct OpenAI chat completions with function calling.' },
              { id: 'gemini', label: 'Google Gemini', desc: 'Gemini 1.5 Flash / Pro Multilingual models.' },
            ].map((p) => (
              <div
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  provider === p.id
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-navy-950 border-navy-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white mb-1 flex items-center justify-between">
                  <span>{p.label}</span>
                  {provider === p.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Default Target Agent Model</label>
              <input
                type="text"
                value={targetModel}
                onChange={(e) => setTargetModel(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2.5 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Default Red-Team Model</label>
              <input
                type="text"
                value={redTeamModel}
                onChange={(e) => setRedTeamModel(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2.5 text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* API Credentials */}
        <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-navy-800 pb-3">
            <Key className="w-4 h-4 text-amber-400" />
            <span>External API Credentials (Secure Server Store)</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Keys are strictly stored in backend memory and environment configuration. They are never exposed to the client.
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">OpenAI API Key</label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {settings?.openai_api_key_configured ? (
                    <span className="text-teal-400 font-semibold">Configured on Server ✓</span>
                  ) : (
                    "Not Configured"
                  )}
                </span>
              </div>
              <input
                type="password"
                placeholder={settings?.openai_api_key_configured ? "••••••••••••••••••••••••" : "sk-proj-..."}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2.5 text-slate-200 font-mono"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">Google Gemini API Key</label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {settings?.gemini_api_key_configured ? (
                    <span className="text-teal-400 font-semibold">Configured on Server ✓</span>
                  ) : (
                    "Not Configured"
                  )}
                </span>
              </div>
              <input
                type="password"
                placeholder={settings?.gemini_api_key_configured ? "••••••••••••••••••••••••" : "AIzaSy..."}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-2.5 text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Defense & Metric Thresholds */}
        <div className="bg-navy-900/80 border border-navy-700 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-navy-800 pb-3">
            <Sliders className="w-4 h-4 text-teal-400" />
            <span>Benchmark Parameter Calibration</span>
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1.5">
                <span>Guardrail Detection Threshold (τ)</span>
                <span className="font-mono text-cyan-400 font-bold">{guardrailThreshold}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.95"
                step="0.05"
                value={guardrailThreshold}
                onChange={(e) => setGuardrailThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Tool outputs with injection confidence ≥ {guardrailThreshold} are blocked and sanitized.
              </span>
            </div>

            <div className="pt-2 border-t border-navy-800">
              <div className="flex justify-between text-slate-300 font-semibold mb-1.5">
                <span>Default SUS Alpha Weight (α)</span>
                <span className="font-mono text-teal-400 font-bold">{defaultAlpha}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={defaultAlpha}
                onChange={(e) => setDefaultAlpha(parseFloat(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                SUS = α·S(t) + (1-α)·U(t). Default 0.5 balances injection security and legitimate utility.
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-xs font-bold bg-cyan-500 text-navy-950 hover:bg-cyan-400 flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20 transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};


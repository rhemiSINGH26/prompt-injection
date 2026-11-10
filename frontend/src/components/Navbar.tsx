import React from 'react';
import { ShieldCheck, Cpu, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { SystemSettings } from '../types';

interface NavbarProps {
  settings: SystemSettings | null;
  onQuickRun: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ settings, onQuickRun, onOpenSettings }) => {
  const provider = settings?.default_provider || 'mock';

  return (
    <header className="h-16 border-b border-navy-700/60 bg-navy-900/80 backdrop-blur px-6 flex items-center justify-between z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
            System Online
          </span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-xs text-slate-400">
          Academic Research Suite v1.0.0
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Provider Status Pill */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-navy-800 border border-navy-700 hover:border-cyan-500/40 transition-colors"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">Provider:</span>
          <span className="uppercase text-cyan-400 font-bold">{provider}</span>
          {provider === 'mock' ? (
            <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/20">
              Offline Mode
            </span>
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
          )}
        </button>

        {/* Quick Benchmark Button */}
        <button
          onClick={onQuickRun}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 text-navy-950 hover:brightness-110 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Launch Quick Test</span>
        </button>
      </div>
    </header>
  );
};


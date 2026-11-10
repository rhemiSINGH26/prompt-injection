import React from 'react';
import {
  LayoutDashboard,
  Database,
  Bot,
  ShieldAlert,
  Flame,
  PlayCircle,
  BarChart3,
  Settings,
  ShieldCheck,
  Terminal
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dataset', label: 'Dataset Management', icon: Database },
    { id: 'target_agent', label: 'Target Agent', icon: Bot },
    { id: 'defenses', label: 'Defense Configuration', icon: ShieldCheck },
    { id: 'adaptive_red_team', label: 'Adaptive Red Team', icon: Flame },
    { id: 'experiment_runner', label: 'Experiment Runner', icon: PlayCircle },
    { id: 'results', label: 'Results & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-700/60 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-navy-700/60 bg-navy-950/40">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Terminal className="w-5 h-5 text-navy-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-white text-base">ACIB</span>
              <span className="text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">
                BENCHMARK
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Indic Tool-Agent Security</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-navy-700/60 bg-navy-950/20 text-xs text-slate-400">
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-semibold text-slate-300">ACIB Research Harness</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Adaptive Code-mixed Indic Prompt Injection Suite (English, Hinglish, Tamil-English)
        </p>
      </div>
    </aside>
  );
};


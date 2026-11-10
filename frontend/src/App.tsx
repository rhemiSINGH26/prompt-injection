import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { DatasetManagement } from './pages/DatasetManagement';
import { TargetAgentPage } from './pages/TargetAgentPage';
import { DefenseConfigPage } from './pages/DefenseConfigPage';
import { AdaptiveRedTeamPage } from './pages/AdaptiveRedTeamPage';
import { ExperimentRunnerPage } from './pages/ExperimentRunnerPage';
import { ResultsAnalyticsPage } from './pages/ResultsAnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { apiService } from './api/client';
import { SystemSettings } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);

  const fetchSettings = () => {
    apiService.getSettings()
      .then(res => setSettings(res))
      .catch(err => console.error("Could not fetch settings:", err));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleViewResults = (experimentId: string) => {
    setSelectedExperimentId(experimentId);
    setActiveTab('results');
  };

  const handleQuickRun = () => {
    setActiveTab('experiment_runner');
  };

  return (
    <div className="flex h-screen bg-navy-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          settings={settings}
          onQuickRun={handleQuickRun}
          onOpenSettings={() => setActiveTab('settings')}
        />

        <main className="flex-1 overflow-y-auto bg-navy-950/60">
          {activeTab === 'dashboard' && (
            <Dashboard onNavigateToRunner={() => setActiveTab('experiment_runner')} />
          )}
          {activeTab === 'dataset' && <DatasetManagement />}
          {activeTab === 'target_agent' && <TargetAgentPage />}
          {activeTab === 'defenses' && <DefenseConfigPage />}
          {activeTab === 'adaptive_red_team' && <AdaptiveRedTeamPage />}
          {activeTab === 'experiment_runner' && (
            <ExperimentRunnerPage onViewResults={handleViewResults} />
          )}
          {activeTab === 'results' && (
            <ResultsAnalyticsPage selectedExperimentId={selectedExperimentId} />
          )}
          {activeTab === 'settings' && (
            <SettingsPage onSettingsUpdated={fetchSettings} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;


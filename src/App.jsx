import React, { useState } from 'react';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import CoreEngine from './components/CoreEngine';
import AnalysisTabs from './components/AnalysisTabs';
import HistoryDashboard from './components/HistoryDashboard';
import Billing from './components/Billing';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('workspace'); // workspace, history, billing
  const [workspaceState, setWorkspaceState] = useState('engine'); // engine, analysis
  const [analysisData, setAnalysisData] = useState(null);

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'history':
        return <HistoryDashboard />;
      case 'billing':
        return <Billing />;
      case 'workspace':
      default:
        return workspaceState === 'engine' ? (
          <CoreEngine onAnalyze={(data) => { setAnalysisData(data); setWorkspaceState('analysis'); }} />
        ) : (
          <AnalysisTabs onBack={() => setWorkspaceState('engine')} analysisData={analysisData} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-surface selection:bg-champagne selection:text-obsidian relative">
      <Navbar
        currentView={currentView}
        setCurrentView={(v) => {
          setCurrentView(v);
          if (v === 'workspace') setWorkspaceState('engine');
        }}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* Main Content Area */}
      <main className="pt-32 pb-24 relative z-10">
        {renderView()}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-surface/30 text-xs font-mono uppercase tracking-widest border-t border-surface/5 bg-slate/10">
        <p>&copy; 2026 Career Sync. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

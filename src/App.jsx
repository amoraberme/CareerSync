import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

import Auth from './components/Auth';
import Navbar from './components/Navbar';
import CoreEngine from './components/CoreEngine';
import AnalysisTabs from './components/AnalysisTabs';
import HistoryDashboard from './components/HistoryDashboard';
import Billing from './components/Billing';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('workspace'); // workspace, history, billing
  const [workspaceState, setWorkspaceState] = useState('engine'); // engine, analysis
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-champagne border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'history':
        return <HistoryDashboard session={session} />;
      case 'billing':
        return <Billing />;
      case 'workspace':
      default:
        return workspaceState === 'engine' ? (
          <CoreEngine session={session} onAnalyze={(data) => { setAnalysisData(data); setWorkspaceState('analysis'); }} />
        ) : (
          <AnalysisTabs session={session} onBack={() => setWorkspaceState('engine')} analysisData={analysisData} />
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
        onLogout={() => supabase.auth.signOut()}
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

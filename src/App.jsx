import React, { useState, useEffect, Component } from 'react';
import { supabase } from './supabaseClient';
import useWorkspaceStore from './store/useWorkspaceStore';

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Global React Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-obsidian text-surface flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-[#EA4335]/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-[#EA4335] text-2xl font-bold">!</span>
          </div>
          <h1 className="text-3xl font-sans tracking-tight mb-4">Something went wrong.</h1>
          <p className="text-surface/60 max-w-lg mb-8">
            Your session or browser cache might be corrupted. Please try clearing your browser cookies and local storage for this site, or try logging out and back in.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-surface text-obsidian px-6 py-2 rounded-full font-medium"
            >
              Clear Cache & Reload
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="bg-surface/10 text-surface px-6 py-2 rounded-full font-medium border border-surface/20"
            >
              Force Logout
            </button>
          </div>
          <pre className="mt-12 p-4 bg-slate/50 rounded-xl text-xs text-left max-w-2xl overflow-auto text-[#EA4335]/80 font-mono">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

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

  const analysisData = useWorkspaceStore(state => state.analysisData);
  const isAnalyzing = useWorkspaceStore(state => state.isAnalyzing);
  const resetWorkspace = useWorkspaceStore(state => state.resetWorkspace);

  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error("Session fetch error:", error);
          // If session is totally busted (corrupt localstorage), wipe it
          localStorage.removeItem('supabase.auth.token');
        }
        setSession(session);
        setLoading(false);
      }).catch(err => {
        console.error("Critical session crash:", err);
        setLoading(false);
      });
    } catch (err) {
      setLoading(false);
    }

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
        return <HistoryDashboard session={session} setCurrentView={setCurrentView} />;
      case 'billing':
        return <Billing />;
      case 'workspace':
      default:
        return analysisData ? (
          <AnalysisTabs session={session} />
        ) : (
          <CoreEngine session={session} />
        );
    }
  };

  return (
    <GlobalErrorBoundary>
      <div className="min-h-screen bg-obsidian text-surface selection:bg-champagne selection:text-obsidian relative">
        <Navbar
          currentView={currentView}
          setCurrentView={(v) => {
            setCurrentView(v);
          }}
          onLogout={() => {
            resetWorkspace();
            supabase.auth.signOut();
          }}
        />

        {/* Main Content Area */}
        <main className="pt-32 pb-24 relative z-10">
          {renderView()}
        </main>

        {/* Global Loading Overlay for AI Analysis */}
        {isAnalyzing && (
          <div className="fixed inset-0 z-[100] bg-obsidian/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <div className="bg-slate border border-surface/10 rounded-3xl p-10 flex flex-col items-center shadow-2xl max-w-sm w-full animate-fade-in-up text-center">
              <div className="w-16 h-16 border-4 border-champagne border-t-transparent rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-sans font-bold text-surface mb-2">Analyzing Profile...</h3>
              <p className="text-surface/60 text-sm">Our AI is comparing your resume against the target role and generating your custom strategic report.</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto py-8 text-center text-surface/30 text-xs font-mono uppercase tracking-widest border-t border-surface/5 bg-slate/10">
          <p>&copy; 2026 Career Sync. All rights reserved.</p>
        </footer>
      </div>
    </GlobalErrorBoundary>
  );
}

export default App;

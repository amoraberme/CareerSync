import React, { useState, useEffect, Component } from 'react';
import { supabase } from './supabaseClient';
import useWorkspaceStore from './store/useWorkspaceStore';
import Lenis from 'lenis';

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
        <div className="min-h-screen bg-background text-obsidian flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-[#EA4335]/10 rounded-full flex items-center justify-center mb-6">
            <span className="text-[#EA4335] text-2xl font-bold">!</span>
          </div>
          <h1 className="text-3xl font-sans tracking-tight mb-4 text-obsidian">Something went wrong.</h1>
          <p className="text-surface/60 max-w-lg mb-8">
            Your session or browser cache might be corrupted. Please try clearing your browser cookies and local storage for this site, or try logging out and back in.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-obsidian text-background px-6 py-2 rounded-full font-medium shadow-md transition-transform hover:scale-105"
            >
              Clear Cache & Reload
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="bg-surface text-obsidian px-6 py-2 rounded-full font-medium border border-obsidian/10 shadow-sm transition-transform hover:scale-105 hover:bg-obsidian/5"
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
    // Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error("Session fetch error:", error);
          // If session is totally busted (corrupt localstorage), wipe it
          localStorage.removeItem('supabase.auth.token');
        }
        setSession(session);
        if (session?.user?.id) {
          useWorkspaceStore.getState().fetchCreditBalance(session.user.id);
        }
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
      if (session?.user?.id) {
        useWorkspaceStore.getState().fetchCreditBalance(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-obsidian/20 border-t-obsidian rounded-full animate-spin"></div>
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
        return <Billing session={session} />;
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
      <div className="min-h-screen bg-background text-obsidian selection:bg-obsidian selection:text-white relative font-sans">
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
          <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <div className="bg-surface border border-obsidian/5 rounded-3xl p-10 flex flex-col items-center shadow-2xl max-w-sm w-full animate-fade-in-up text-center">
              <div className="w-16 h-16 border-4 border-obsidian/10 border-t-obsidian rounded-full animate-spin mb-6 shadow-sm"></div>
              <h3 className="text-xl font-sans font-bold text-obsidian mb-2">Analyzing Profile...</h3>
              <p className="text-slate text-sm">Our AI is comparing your resume against the target role and generating your custom strategic report.</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto py-8 text-center text-slate/50 text-xs font-mono uppercase tracking-widest border-t border-obsidian/5 bg-surface/50">
          <p>&copy; 2026 Career Sync. All rights reserved.</p>
        </footer>
      </div>
    </GlobalErrorBoundary>
  );
}

export default App;

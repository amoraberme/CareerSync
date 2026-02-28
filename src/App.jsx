import React, { useState, useEffect, useCallback, Component } from 'react';
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
import Profile from './components/Profile';
import UpdatePassword from './components/UpdatePassword';
import Terms from './components/legal/Terms';
import Privacy from './components/legal/Privacy';
import Landing from './components/Landing';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('workspace');
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Helper to handle client-side navigation with URL sync
  const navigateTo = useCallback((view) => {
    setCurrentView(view);
    const path = view === 'terms' ? '/Terms' : view === 'privacy' ? '/Privacy' : '/';
    if (window.location.pathname !== path) {
      window.history.pushState({ view }, '', path);
    }
    window.scrollTo(0, 0);
  }, []);

  const analysisData = useWorkspaceStore(state => state.analysisData);
  const isAnalyzing = useWorkspaceStore(state => state.isAnalyzing);
  const resetWorkspace = useWorkspaceStore(state => state.resetWorkspace);
  const isDark = useWorkspaceStore(state => state.isDark);

  // ═══ Invoice / Payment History — lifted here so Navbar can trigger it ═══
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');

  // ═══ Payment modal visibility — hides Navbar when QR screen is open ═══
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchInvoiceHistory = useCallback(async () => {
    setShowInvoice(true);
    setInvoiceLoading(true);
    setInvoiceError('');
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const response = await fetch('/api/payment-history', {
        method: 'GET',
        headers: {
          ...(currentSession?.access_token && { 'Authorization': `Bearer ${currentSession.access_token}` })
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load history.');
      setInvoiceHistory(data.history || []);
    } catch (err) {
      setInvoiceError(err.message);
    } finally {
      setInvoiceLoading(false);
    }
  }, []);

  // Theme Enforcement Effect — applies regardless of session so Auth page respects saved preference
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

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

  // ═══ URL Synchronization for Routing ═══
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/terms') {
        setCurrentView('terms');
      } else if (path === '/privacy') {
        setCurrentView('privacy');
      } else {
        // Enforce Authentication Middleware for Protected Routes
        const protectedViews = ['history', 'plans', 'profile'];

        setCurrentView(prev => {
          const viewFromUrl = window.history.state?.view || prev;

          if (!session && protectedViews.includes(viewFromUrl)) {
            return 'auth'; // Force unauthenticated users back to login
          }

          // If not a legal page, default to workspace or previous view
          return (prev === 'terms' || prev === 'privacy') ? 'workspace' : prev;
        });
      }
    };

    // Initialize on mount
    handleLocationChange();

    // Listen for back/forward buttons
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    try {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error("Session fetch error:", error);
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      if (event === 'PASSWORD_RECOVERY') {
        // User clicked the password reset link from their email
        setIsPasswordRecovery(true);
        return;
      }

      if (event === 'SIGNED_OUT' || (!session && event === 'TOKEN_REFRESHED')) {
        setSession(null);
        setCurrentView('workspace');
        setIsPasswordRecovery(false);
        return;
      }

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

  // Show password reset form when user arrives via reset link
  if (isPasswordRecovery && session) {
    return (
      <UpdatePassword
        onComplete={() => {
          setIsPasswordRecovery(false);
          setCurrentView('workspace');
        }}
      />
    );
  }

  // ═══ Public Routes (Landing, Terms & Privacy) ═══
  // These are rendered regardless of session status
  if (currentView === 'terms') {
    return <Terms onBack={() => navigateTo(session ? 'workspace' : 'landing')} />;
  }
  if (currentView === 'privacy') {
    return <Privacy onBack={() => navigateTo(session ? 'workspace' : 'landing')} />;
  }

  if (!session) {
    // ═══ Global Authentication Middleware Gatekeeper ═══
    // Only intercept explicitly protected sub-views. 'workspace' is the default state
    // and should safely fall through to render <Landing /> if the user isn't logged in.
    const protectedViews = ['history', 'plans', 'profile'];
    if (protectedViews.includes(currentView)) {
      return <Auth onNavigate={navigateTo} />;
    }

    if (currentView === 'auth') {
      return <Auth onNavigate={navigateTo} />;
    }
    return <Landing onNavigate={navigateTo} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'history':
        return <HistoryDashboard session={session} setCurrentView={setCurrentView} />;
      case 'plans':
        return <Billing session={session} onPaymentModalChange={setPaymentModalOpen} />;
      case 'profile':
        return <Profile session={session} setCurrentView={setCurrentView} />;
      case 'workspace':
      default:
        return analysisData ? (
          <AnalysisTabs session={session} setCurrentView={setCurrentView} />
        ) : (
          <CoreEngine session={session} setCurrentView={setCurrentView} />
        );
    }
  };

  return (
    <GlobalErrorBoundary>
      <div className="min-h-screen bg-background text-obsidian dark:bg-darkBg dark:text-darkText selection:bg-obsidian selection:text-background dark:selection:bg-champagne dark:selection:text-darkBg relative font-sans">
        {/* Navbar — hidden while QR payment modal is open */}
        {!paymentModalOpen && (
          <Navbar
            currentView={currentView}
            setCurrentView={(v) => { setCurrentView(v); }}
            onLogout={() => { resetWorkspace(); supabase.auth.signOut(); }}
            onOpenInvoice={fetchInvoiceHistory}
            onNavigate={(view) => navigateTo(view)}
          />
        )}

        {/* Main Content Area */}
        <main className="pt-32 pb-24 relative z-10">
          {renderView()}
        </main>

        {/* Global Loading Overlay for AI Analysis */}
        {isAnalyzing && (
          <div className="fixed inset-0 z-[100] bg-white/60 dark:bg-darkBg/60 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <div className="bg-surface dark:bg-darkCard border border-obsidian/5 dark:border-darkText/5 rounded-3xl p-10 flex flex-col items-center shadow-2xl max-w-sm w-full animate-fade-in-up text-center">
              <div className="w-16 h-16 border-4 border-obsidian/10 dark:border-darkText/10 border-t-obsidian dark:border-t-darkText rounded-full animate-spin mb-6 shadow-sm"></div>
              <h3 className="text-xl font-sans font-bold text-obsidian dark:text-darkText mb-2">Analyzing Profile...</h3>
              <p className="text-slate dark:text-darkText/60 text-sm">Our AI is comparing your resume against the target role and generating your custom strategic report.</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto py-8 text-center text-slate/50 dark:text-darkText/30 text-xs font-mono uppercase tracking-widest border-t border-obsidian/5 dark:border-darkText/5 bg-surface/50 dark:bg-darkCard/10">
          <p>&copy; 2026 Career Sync. All rights reserved.</p>
        </footer>

        {/* ════ Global Invoice History Modal ════ */}
        {showInvoice && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/70 dark:bg-darkBg/70 backdrop-blur-md" onClick={() => setShowInvoice(false)} />
            <div className="relative bg-white dark:bg-darkBg border border-obsidian/10 dark:border-darkText/10 rounded-[2rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">

              {/* Header */}
              <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-obsidian/8 dark:border-darkText/8 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-champagne/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-champagne" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" /><line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-obsidian dark:text-darkText">Invoice History</h3>
                    <p className="text-xs text-slate dark:text-darkText/50">All your past credit purchases</p>
                  </div>
                </div>
                <button onClick={() => setShowInvoice(false)} className="text-slate/50 hover:text-obsidian dark:hover:text-darkText transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 px-8 py-6">
                {invoiceLoading && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-7 h-7 border-2 border-champagne/30 border-t-champagne rounded-full animate-spin mb-3" />
                    <p className="text-sm text-slate dark:text-darkText/50">Loading your history...</p>
                  </div>
                )}
                {invoiceError && !invoiceLoading && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-sm text-[#EA4335]">{invoiceError}</p>
                  </div>
                )}
                {!invoiceLoading && !invoiceError && invoiceHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-sm font-semibold text-obsidian dark:text-darkText mb-1">No payments yet</p>
                    <p className="text-xs text-slate dark:text-darkText/50">Your payment history will appear here after your first purchase.</p>
                  </div>
                )}
                {!invoiceLoading && !invoiceError && invoiceHistory.length > 0 && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-obsidian/8 dark:border-darkText/8">
                        <th className="text-left text-xs font-semibold text-slate dark:text-darkText/50 uppercase tracking-wider pb-3">Description</th>
                        <th className="text-right text-xs font-semibold text-slate dark:text-darkText/50 uppercase tracking-wider pb-3">Amount</th>
                        <th className="text-right text-xs font-semibold text-slate dark:text-darkText/50 uppercase tracking-wider pb-3">Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceHistory.map((row) => {
                        const date = new Date(row.date);

                        // User-friendly text mapping
                        let displayDesc = row.description;
                        let displayBadge = row.type;
                        let badgeColor = 'bg-slate/10 text-slate dark:text-darkText/50';

                        if (row.type === 'TIER_PURCHASE') {
                          displayBadge = 'TIER PURCHASE';
                          displayDesc = row.description; // Webhook saves "Purchased [Tier] - Initial Credits"
                          badgeColor = 'bg-champagne/15 text-champagne';
                        } else if (row.type === 'DAILY_REFILL') {
                          displayBadge = 'DAILY REFILL';
                          displayDesc = 'Earned from Daily Refill';
                          badgeColor = 'bg-[#34A853]/15 text-[#34A853]';
                        } else if (row.type === 'BASIC_TOKEN_BUY') {
                          displayBadge = 'BASIC TOKEN BUY';
                          displayDesc = 'Purchased Basic Tokens';
                          badgeColor = 'bg-champagne/15 text-champagne';
                        } else if (row.type === 'Bought' || row.type === 'Receive') {
                          badgeColor = 'bg-champagne/15 text-champagne';
                        }

                        return (
                          <tr key={row.id} className="border-b border-obsidian/5 dark:border-darkText/5 hover:bg-obsidian/2 dark:hover:bg-darkText/2 transition-colors">
                            <td className="py-4">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                                    {displayBadge}
                                  </span>
                                  <span className="font-medium text-obsidian dark:text-darkText">
                                    {displayDesc}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate dark:text-darkText/40 leading-none">
                                  {date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })} · {date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-right font-mono font-bold text-obsidian dark:text-darkText">
                              {row.amount_display || '—'}
                            </td>
                            <td className="py-4 text-right">
                              <span className={`font-bold ${row.credits_gained > 0 ? 'text-champagne' : 'text-[#EA4335]'}`}>
                                {row.credits_gained > 0 ? '+' : ''}{row.credits_gained.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate dark:text-darkText/40 ml-1 uppercase">cr</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer */}
              {!invoiceLoading && invoiceHistory.length > 0 && (
                <div className="px-8 py-5 border-t border-obsidian/8 dark:border-darkText/8 flex items-center justify-between shrink-0">
                  <p className="text-xs text-slate dark:text-darkText/40">
                    {invoiceHistory.length} transaction{invoiceHistory.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs font-semibold text-champagne">
                    {invoiceHistory.reduce((sum, r) => sum + r.credits_gained, 0).toLocaleString()} total credits purchased
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </GlobalErrorBoundary>
  );
}

export default App;

import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const useWorkspaceStore = create((set, get) => ({
    // Form Inputs
    jobTitle: '',
    industry: '',
    experienceLevel: '',
    requiredSkills: [],
    description: '',
    pastedText: '',

    // Resume Context
    resumeUploaded: false,
    resumeData: null,
    resumeFileName: '',
    resumeFileSize: '',

    // Analysis Results
    analysisData: null,
    isAnalyzing: false,

    // Theme state — W-1 FIX: wrap localStorage access in try/catch to prevent SSR crash
    isDark: (() => {
        try {
            return JSON.parse(localStorage.getItem('theme_isDark')) || false;
        } catch {
            return false;
        }
    })(),

    // Billing & Credits — N-2 FIX: initial value is 0, not 1
    creditBalance: 0,

    // Subscription tier
    userTier: 'base',

    // Actions
    updateField: (field, value) => set({ [field]: value }),

    setAnalysisData: (data) => set({ analysisData: data }),

    toggleTheme: () => set((state) => {
        const newIsDark = !state.isDark;
        try {
            localStorage.setItem('theme_isDark', JSON.stringify(newIsDark));
        } catch { /* ignore */ }
        if (newIsDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return { isDark: newIsDark };
    }),

    fetchCreditBalance: async (userId) => {
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('current_credit_balance, tier')
                .eq('id', userId)
                .single();

            if (error) throw error;
            if (data) {
                set({
                    creditBalance: data.current_credit_balance,
                    userTier: data.tier || 'base'
                });
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    },

    runAnalysis: async (session, navigateToBilling) => {
        set({ isAnalyzing: true, analysisData: null });
        const { jobTitle, industry, description, resumeData, creditBalance, userTier } = get();

        // ─── C-3 / TASK-03 FIX: Credit system reworked ───
        // Base tier: governed by balance — gate here.
        // Standard/Premium: governed by daily cap in analyze.js — skip balance gate.
        const isBaseUser = userTier === 'base';

        if (isBaseUser && creditBalance < 1) {
            import('../components/ui/Toast').then(({ toast }) => {
                toast.error(
                    <div className="flex flex-col">
                        <strong className="font-bold text-lg mb-1">Insufficient Credits</strong>
                        <span className="opacity-90">Please top up your account or upgrade your tier to continue analyzing.</span>
                    </div>,
                    {
                        action: "Upgrade Plan",
                        onAction: () => { if (navigateToBilling) navigateToBilling(); }
                    }
                );
            });
            set({ isAnalyzing: false });
            return;
        }

        try {
            // C-3 FIX: Fire the AI call FIRST — credits only deducted on success.
            const accessToken = session?.access_token;
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
                },
                body: JSON.stringify({ jobTitle, industry, description, resumeData })
            });

            const data = await response.json();

            // C-3 FIX: Check HTTP status BEFORE deducting credits or saving history.
            if (!response.ok) {
                const msg = data?.error || 'Analysis failed. Please try again.';
                import('../components/ui/Toast').then(({ toast }) => toast.error(msg));
                set({ isAnalyzing: false });
                return; // Credits untouched, history not written
            }

            // C-2 / TASK-03 FIX: Only deduct base credit AFTER confirmed success.
            // Standard/Premium are gated by daily cap in analyze.js — no balance deduction.
            if (isBaseUser) {
                const { data: rpcSuccess, error: rpcError } = await supabase.rpc('decrement_credits', { deduct_amount: 1 });

                if (rpcError || !rpcSuccess) {
                    // Log but don't block — analysis already succeeded. Balance will re-sync on next fetch.
                    console.error("Credit deduction RPC error (analysis already completed):", rpcError?.message);
                } else {
                    set({ creditBalance: creditBalance - 1 });
                }
            }

            // Build enriched result
            const enrichedData = {
                ...data,
                jobTitle,
                company: industry,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };

            // W-7 FIX: Only save to history on successful analysis (guaranteed by !response.ok guard above)
            if (session?.user) {
                const { error: dbError } = await supabase
                    .from('candidates_history')
                    .insert([{
                        user_id: session.user.id,
                        job_title: jobTitle,
                        company: industry,
                        match_score: data.matchScore || 0,
                        report_data: enrichedData
                    }]);
                if (dbError) console.error("Error saving history to Supabase:", dbError);
            }

            set({ analysisData: enrichedData });
        } catch (error) {
            console.error("Failed to run analysis:", error);
            import('../components/ui/Toast').then(({ toast }) => {
                toast.error('Network error. Please check your connection and try again.');
            });
        } finally {
            set({ isAnalyzing: false });
        }
    },

    resetWorkspace: () => set({
        jobTitle: '',
        industry: '',
        experienceLevel: '',
        requiredSkills: [],
        description: '',
        pastedText: '',
        resumeUploaded: false,
        resumeData: null,
        resumeFileName: '',
        resumeFileSize: '',
        analysisData: null,
        isAnalyzing: false
    })
}));

export default useWorkspaceStore;

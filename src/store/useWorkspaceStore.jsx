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
    isParsing: false,

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
    planLockedUntil: null,

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
                .select('current_credit_balance, plan_tier, tier, plan_locked_until')
                .eq('id', userId)
                .single();

            if (error) throw error;
            if (data) {
                set({
                    creditBalance: data.current_credit_balance,
                    userTier: data.plan_tier || data.tier || 'base',
                    planLockedUntil: data.plan_locked_until || null
                });
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    },

    runAnalysis: async (session, navigateToBilling) => {
        set({ isAnalyzing: true, analysisData: null });
        const { jobTitle, industry, description, resumeData, creditBalance, userTier } = get();

        const ANALYSIS_COST = 3;

        if (isBaseUser && creditBalance < ANALYSIS_COST) {
            import('../components/ui/Toast').then(({ toast }) => {
                toast.error(
                    <div className="flex flex-col">
                        <strong className="font-bold text-lg mb-1">Insufficient Credits</strong>
                        <span className="opacity-90">Please top up your account or upgrade your tier to continue analyzing (Costs {ANALYSIS_COST} credits).</span>
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
            // Deduct credits BEFORE the AI call for immediate feedback
            if (isBaseUser) {
                const { data: rpcSuccess, error: rpcError } = await supabase.rpc('decrement_credits', { deduct_amount: ANALYSIS_COST });
                if (rpcError || !rpcSuccess) {
                    import('../components/ui/Toast').then(({ toast }) => toast.error('Credit deduction failed. Please try again.'));
                    set({ isAnalyzing: false });
                    return;
                }
                // Sync balance immediately for visible feedback
                await get().fetchCreditBalance(session?.user?.id);
            }

            const accessToken = session?.access_token;
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
                },
                body: JSON.stringify({ jobTitle, industry, description, resumeData })
            });

            // Credits already deducted pre-fetch
            const data = await response.json();

            // Check HTTP status. Note: credits are NOT refunded if the external AI service fails
            // as the platform has already initiated the request processing.
            if (!response.ok) {
                const msg = data?.error || 'Analysis failed. Please try again.';
                import('../components/ui/Toast').then(({ toast }) => toast.error(msg));
                set({ isAnalyzing: false });
                return;
            }

            // Sync balance from server state after every successful AI call (redundant but safe)
            await get().fetchCreditBalance(session?.user?.id);

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

    runParse: async (session) => {
        set({ isParsing: true });
        const { pastedText, creditBalance, userTier } = get();
        if (!pastedText.trim()) return;

        const PARSE_COST = 1;
        const isBaseUser = userTier === 'base';
        if (isBaseUser && creditBalance < PARSE_COST) {
            import('../components/ui/Toast').then(({ toast }) => toast.error(`Insufficient credits for parsing (Costs ${PARSE_COST} credit).`));
            set({ isParsing: false });
            return;
        }

        try {
            // Deduct credits BEFORE the AI call for immediate feedback
            if (isBaseUser) {
                const { data: rpcSuccess, error: rpcError } = await supabase.rpc('decrement_credits', { deduct_amount: PARSE_COST });
                if (rpcError || !rpcSuccess) {
                    import('../components/ui/Toast').then(({ toast }) => toast.error('Credit deduction failed.'));
                    set({ isParsing: false });
                    return;
                }
                // Sync profile immediately
                await get().fetchCreditBalance(session?.user?.id);
            }

            const accessToken = session?.access_token;
            const response = await fetch('/api/parse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
                },
                body: JSON.stringify({ text: pastedText })
            });

            const data = await response.json();

            if (!response.ok) {
                import('../components/ui/Toast').then(({ toast }) => toast.error(data.error || 'Failed to parse text.'));
                return;
            }

            // Sync profile (redundant but safe)
            await get().fetchCreditBalance(session?.user?.id);

            set({
                jobTitle: data.jobTitle || '',
                industry: data.industry || '',
                experienceLevel: data.experienceLevel || '',
                requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : [],
                description: data.cleanDescription || pastedText,
                pastedText: ''
            });

            return true; // Success
        } catch (error) {
            console.error("Parse failed:", error);
            import('../components/ui/Toast').then(({ toast }) => toast.error('Parse failed. Check connection.'));
        } finally {
            set({ isParsing: false });
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

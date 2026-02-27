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

        // ─── C-3 / TASK-03 FIX: Credit system reworked ───
        // Base tier: governed by balance — gate here.
        // Standard/Premium: governed by daily cap in analyze.js — skip balance gate.
        const isBaseUser = userTier === 'base';
        const cost = 3; // "Deep Analysis" = Cost: 3 Credits

        if (isBaseUser) {
            if (creditBalance < cost) {
                import('../components/ui/Toast').then(({ toast }) => {
                    toast.error(
                        <div className="flex flex-col">
                            <strong className="font-bold text-lg mb-1">Insufficient Credits</strong>
                            <span className="opacity-90">Please top up your account or upgrade your tier to continue analyzing. (Cost: {cost} cr)</span>
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

            // Deduct credits BEFORE executing the task
            const { data: rpcSuccess, error: rpcError } = await supabase.rpc('decrement_credits', {
                deduct_amount: cost,
                p_description: `Deep Analysis: ${jobTitle}`,
                p_type: 'Analyze'
            });

            if (rpcError || !rpcSuccess) {
                import('../components/ui/Toast').then(({ toast }) => toast.error('Credit deduction failed. Please try again.'));
                set({ isAnalyzing: false });
                return;
            }

            // Update local balance immediately for visual feedback
            await get().fetchCreditBalance(session?.user?.id);
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

            // Sync balance again to be sure
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

        const isBaseUser = userTier === 'base';
        const cost = 1; // "Parse & Extract" = Cost: 1 Credit

        if (isBaseUser) {
            if (creditBalance < cost) {
                import('../components/ui/Toast').then(({ toast }) => toast.error('Insufficient credits for parsing.'));
                set({ isParsing: false });
                return;
            }

            // Deduct credits BEFORE executing the task
            const { data: rpcSuccess, error: rpcError } = await supabase.rpc('decrement_credits', {
                deduct_amount: cost,
                p_description: 'Parse & Extract Job Description',
                p_type: 'Parse'
            });

            if (rpcError || !rpcSuccess) {
                import('../components/ui/Toast').then(({ toast }) => toast.error('Credit deduction failed.'));
                set({ isParsing: false });
                return;
            }

            // Update local balance immediately
            await get().fetchCreditBalance(session?.user?.id);
        }

        try {
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

            // Sync profile
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

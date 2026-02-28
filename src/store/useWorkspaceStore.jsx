import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const useWorkspaceStore = create((set, get) => ({
    // Form Inputs
    jobTitle: '',
    industry: '',
    experienceLevel: '',
    requiredSkills: [],
    experienceText: '',
    qualifications: '',
    roleDo: '',
    fullJobDescription: '',
    pastedText: '',

    // Tone Selector
    coverLetterTone: 'Professional',

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
        const { jobTitle, industry, experienceText, qualifications, roleDo, fullJobDescription, resumeData, creditBalance, userTier, coverLetterTone } = get();

        // ─── C-3 / TASK-03 FIX: Credit system reworked ───
        // All tiers cost 3 credits. Real deduction happens safely on backend.
        const cost = 3;

        if (creditBalance < cost) {
            import('../components/ui/Toast').then(({ toast }) => {
                toast.error(
                    <div className="flex flex-col">
                        <strong className="font-bold text-lg mb-1">[ERROR: INSUFFICIENT FUNDS]</strong>
                        <span className="opacity-90">Please top up your account to continue analyzing. (Cost: {cost} Credits)</span>
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
            const accessToken = session?.access_token;

            // Optimistic UI update before actual backend deduction
            set({ creditBalance: creditBalance - cost });

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
                },
                body: JSON.stringify({ jobTitle, industry, experienceText, qualifications, roleDo, fullJobDescription, resumeData, coverLetterTone })
            });

            const data = await response.json();

            // C-3 FIX: Check HTTP status
            if (!response.ok) {
                const msg = data?.error || 'Analysis failed. Please try again.';
                import('../components/ui/Toast').then(({ toast }) => toast.error(msg));
                // Note: In a production system, we might want to refund here since we deducted before.
                // But as per the "Strict System" requirement: "Deduct before", we keep it simple.
                set({ isAnalyzing: false });
                return;
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

    runParse: async (session) => {
        set({ isParsing: true });
        const { pastedText, creditBalance, userTier } = get();
        if (!pastedText.trim()) return;

        // All tiers cost 1 credit for Parsing. Real deduction happens safely on backend.
        const cost = 1;

        if (creditBalance < cost) {
            import('../components/ui/Toast').then(({ toast }) => {
                toast.error(
                    <div className="flex flex-col">
                        <strong className="font-bold text-lg mb-1">[ERROR: INSUFFICIENT FUNDS]</strong>
                        <span className="opacity-90">Please top up. Parse & Extract costs {cost} Credit.</span>
                    </div>
                );
            });
            set({ isParsing: false });
            return false;
        }

        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            const accessToken = currentSession?.access_token || session?.access_token;

            // Optimistic UI update before backend deduction
            set({ creditBalance: creditBalance - cost });

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
                const errorMsg = data.error || 'Failed to parse text.';
                import('../components/ui/Toast').then(({ toast }) => toast.error(errorMsg));
                return false;
            }

            set({
                jobTitle: data.jobTitle || '',
                industry: data.industry || '',
                experienceLevel: data.experienceLevel || '',
                requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : [],
                experienceText: data.experience || '',
                qualifications: data.qualifications || '',
                roleDo: data.roleDo || '',
                pastedText: ''
            });

            return true;
        } catch (error) {
            console.error("Parse failed:", error);
            import('../components/ui/Toast').then(({ toast }) => toast.error('Check your connection or API status.'));
            return false;
        } finally {
            set({ isParsing: false });
        }
    },

    resetWorkspace: () => set({
        jobTitle: '',
        industry: '',
        experienceLevel: '',
        requiredSkills: [],
        experienceText: '',
        qualifications: '',
        roleDo: '',
        fullJobDescription: '',
        pastedText: '',
        coverLetterTone: 'Professional',
        resumeUploaded: false,
        resumeData: null,
        resumeFileName: '',
        resumeFileSize: '',
        analysisData: null,
        isAnalyzing: false
    })
}));

export default useWorkspaceStore;

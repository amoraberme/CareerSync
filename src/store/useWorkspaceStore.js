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

    // Billing & Credits
    creditBalance: 0,

    // Actions
    updateField: (field, value) => set({ [field]: value }),

    setAnalysisData: (data) => set({ analysisData: data }),

    fetchCreditBalance: async (userId) => {
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('current_credit_balance')
                .eq('id', userId)
                .single();

            if (error) throw error;
            if (data) {
                set({ creditBalance: data.current_credit_balance });
            }
        } catch (error) {
            console.error("Error fetching credit balance:", error);
        }
    },

    runAnalysis: async (session) => {
        set({ isAnalyzing: true, analysisData: null });
        const { jobTitle, industry, description, resumeData } = get();

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitle, industry, description, resumeData })
            });
            const data = await response.json();

            const enrichedData = {
                ...data,
                jobTitle,
                company: industry,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };

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
            console.error("Failed to run analysis", error);
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
        isAnalyzing: false,
        creditBalance: 0
    })
}));

export default useWorkspaceStore;

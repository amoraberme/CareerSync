import React, { useRef, useEffect, useState } from 'react';
import { Trash2, Calendar, Search, Filter } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../supabaseClient';
import useWorkspaceStore from '../store/useWorkspaceStore';

export default function HistoryDashboard({ session, setCurrentView }) {
    const containerRef = useRef(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters State
    const [dateFilter, setDateFilter] = useState('all'); // 'all', '7', '30'
    const [scoreFilter, setScoreFilter] = useState('all'); // 'all', 'high', 'medium', 'low'

    const { setAnalysisData } = useWorkspaceStore();

    const hasAnimated = useRef(false);

    useEffect(() => {
        async function fetchHistory() {
            if (!session?.user) return;
            const { data, error } = await supabase
                .from('candidates_history')
                .select('*')
                .order('analysis_date', { ascending: false });

            if (!error && data) {
                setApplications(data.map(item => ({
                    id: item.id,
                    analysis_date: item.analysis_date,
                    date: new Date(item.analysis_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    role: item.job_title,
                    company: item.company || 'Unknown',
                    score: item.match_score,
                    status: 'Analyzed',
                    report_data: item.report_data
                })));
            }
            setLoading(false);
        }

        fetchHistory();
    }, [session]);

    // GSAP entrance animation — runs once after first data load
    useEffect(() => {
        if (loading || applications.length === 0 || hasAnimated.current) return;
        hasAnimated.current = true;

        let ctx = gsap.context(() => {
            gsap.from('.history-row', {
                y: 20,
                opacity: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: 'power3.out'
            });
        }, containerRef);
        return () => ctx.revert();
    }, [loading, applications.length]);

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent row click
        if (window.confirm('Are you sure you want to delete this analysis?')) {
            const { error } = await supabase.from('candidates_history').delete().eq('id', id);
            if (!error) {
                setApplications(prev => prev.filter(app => app.id !== id));
            } else {
                console.error("Failed to delete", error);
            }
        }
    };

    const handleRowClick = (app) => {
        setAnalysisData({
            ...app.report_data,
            jobTitle: app.role,
            company: app.company,
            date: app.date
        });
        setCurrentView('workspace');
    };

    const filteredApplications = applications.filter(app => {
        // Date Filter
        if (dateFilter !== 'all') {
            const appDate = new Date(app.analysis_date);
            const now = new Date();
            const diffDays = (now - appDate) / (1000 * 60 * 60 * 24);
            if (dateFilter === '7' && diffDays > 7) return false;
            if (dateFilter === '30' && diffDays > 30) return false;
        }

        // Score Filter
        if (scoreFilter !== 'all') {
            if (scoreFilter === 'high' && app.score < 71) return false;
            if (scoreFilter === 'medium' && (app.score < 61 || app.score > 70)) return false;
            if (scoreFilter === 'low' && app.score >= 61) return false;
        }

        return true;
    });

    return (
        <div ref={containerRef} className="max-w-6xl mx-auto py-12 px-6">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-4xl font-sans tracking-tight text-obsidian dark:text-darkText mb-2 font-semibold">
                        Application <span className="font-drama italic text-champagne font-normal">History</span>
                    </h2>
                    <p className="text-slate dark:text-darkText/70 text-lg">Your candidate management dashboard.</p>
                </div>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-white dark:bg-darkCard/40 shadow-sm border border-obsidian/10 dark:border-darkText/10 rounded-full px-4 py-2 text-obsidian dark:text-darkText text-sm focus:outline-none focus:border-champagne/50 outline-none appearance-none cursor-pointer">
                        <option value="all">All Dates</option>
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                    </select>

                    <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)} className="bg-white dark:bg-darkCard/40 shadow-sm border border-obsidian/10 dark:border-darkText/10 rounded-full px-4 py-2 text-obsidian dark:text-darkText text-sm focus:outline-none focus:border-champagne/50 outline-none appearance-none cursor-pointer">
                        <option value="all">All Scores</option>
                        <option value="high">High (71-100%)</option>
                        <option value="medium">Medium (61-70%)</option>
                        <option value="low">Low (&lt; 60%)</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-[2rem] overflow-hidden">
                <div className="grid grid-cols-6 gap-4 p-6 border-b border-obsidian/5 dark:border-darkText/5 text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/70">
                    <div className="col-span-2">Target Role & Company</div>
                    <div>Date</div>
                    <div>Match Score</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                </div>

                <div className="divide-y divide-obsidian/5 dark:divide-darkText/5">
                    {loading ? (
                        <div className="p-12 text-center text-slate dark:text-darkText/70 font-mono text-sm">Loading history...</div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="p-12 text-center text-slate dark:text-darkText/70 font-mono text-sm">No analysis history found matching these filters.</div>
                    ) : (
                        filteredApplications.map((app) => (
                            <div key={app.id} onClick={() => handleRowClick(app)} className="history-row grid grid-cols-6 gap-4 p-6 items-center hover:bg-background dark:hover:bg-darkCard/60 transition-colors group cursor-pointer relative">
                                <div className="col-span-2">
                                    <h4 className="font-medium text-obsidian dark:text-darkText mb-1 group-hover:text-champagne transition-colors">{app.role}</h4>
                                    <p className="text-sm text-slate dark:text-darkText/70">{app.company}</p>
                                </div>
                                <div className="text-obsidian/70 dark:text-darkText/70 flex items-center text-sm">
                                    <Calendar className="w-4 h-4 mr-2 opacity-50" />
                                    {app.date}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm ${app.score >= 71 ? 'border-[#34A853]/30 text-[#34A853] bg-[#34A853]/10' : app.score >= 61 ? 'border-champagne/30 text-champagne bg-champagne/10' : 'border-[#EA4335]/30 text-[#EA4335] bg-[#EA4335]/10'}`}>
                                            {app.score}
                                        </div>
                                        <span className="text-xs text-slate dark:text-darkText/70">/100</span>
                                    </div>
                                </div>
                                <div>
                                    <span className={`px-3 py-1 text-xs rounded-full border ${app.status === 'Interviewing' ? 'bg-[#34A853]/10 border-[#34A853]/30 text-[#34A853]' :
                                        app.status === 'Applied' ? 'bg-[#0B66C2]/10 border-[#0B66C2]/30 text-[#0B66C2]' :
                                            'bg-obsidian/5 dark:bg-darkText/5 border-obsidian/10 dark:border-darkText/10 text-obsidian/70 dark:text-darkText/70'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>
                                <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => handleDelete(e, app.id)} className="p-2 text-slate dark:text-darkText/50 hover:text-[#EA4335] hover:bg-[#EA4335]/10 rounded-full transition-colors" title="Delete Analysis">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

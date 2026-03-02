import React, { useRef, useEffect, useState } from 'react';
import { Trash2, Calendar, Search, Filter, Lock, FileText, ChevronRight } from 'lucide-react';
import Tooltip from './ui/Tooltip';
import gsap from 'gsap';
import { supabase } from '../supabaseClient';
import useWorkspaceStore from '../store/useWorkspaceStore';
import { getHistoryLimit } from '../lib/tierPermissions';

export default function HistoryDashboard({ session, setCurrentView }) {
    const containerRef = useRef(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters State
    const [dateFilter, setDateFilter] = useState('all'); // 'all', '7', '30'
    const [scoreFilter, setScoreFilter] = useState('all'); // 'all', 'high', 'medium', 'low'

    const { setAnalysisData } = useWorkspaceStore();
    const userTier = useWorkspaceStore(state => state.userTier);

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
                    score: item.report_data?.projectedScore || item.match_score,
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

    // Apply tier-based history limit
    const historyLimit = getHistoryLimit(userTier);
    const displayedApplications = filteredApplications.slice(0, historyLimit);
    const isLimited = filteredApplications.length > historyLimit;

    return (
        <div ref={containerRef} className="max-w-6xl mx-auto py-12 px-6">
            <div className="flex flex-wrap gap-4 justify-between items-end mb-8">
                <div>
                    <h2 className="text-4xl font-sans tracking-tight text-obsidian dark:text-darkText mb-2 font-semibold flex items-center gap-2">
                        Application <span className="font-drama italic text-champagne font-normal">History</span>
                        <span className="relative top-[-2px]">
                            <Tooltip
                                align="left"
                                text="Your analysis history is stored securely using row-level security, meaning only you can access these records. You can delete any entry at any time."
                            />
                        </span>
                    </h2>
                    <p className="text-slate dark:text-darkText/70 text-lg">
                        {historyLimit === Infinity ? 'Unlimited history access.' : `Showing ${Math.min(historyLimit, filteredApplications.length)} most recent analyses.`}
                    </p>
                </div>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-white dark:bg-darkCard/40 shadow-sm border border-obsidian/10 dark:border-darkText/10 rounded-full px-4 py-3 text-obsidian dark:text-darkText text-sm focus:outline-none focus:border-champagne/50 outline-none appearance-none cursor-pointer">
                        <option value="all">All Dates</option>
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                    </select>

                    <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)} className="bg-white dark:bg-darkCard/40 shadow-sm border border-obsidian/10 dark:border-darkText/10 rounded-full px-4 py-3 text-obsidian dark:text-darkText text-sm focus:outline-none focus:border-champagne/50 outline-none appearance-none cursor-pointer">
                        <option value="all">All Scores</option>
                        <option value="high">High (71-100%)</option>
                        <option value="medium">Medium (61-70%)</option>
                        <option value="low">Low (&lt; 60%)</option>
                    </select>
                </div>
            </div>

            {/* 2-Column KPI Structure */}
            {!loading && applications.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 engine-element">
                    <div className="bg-white/70 dark:bg-darkCard/40 backdrop-blur-xl border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-[2rem] p-6 flex flex-col justify-center">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-slate dark:text-darkText/70 mb-2">Total Analyses</h3>
                        <div className="text-4xl font-sans font-bold text-obsidian dark:text-darkText">{applications.length}</div>
                    </div>
                    <div className="bg-white/70 dark:bg-darkCard/40 backdrop-blur-xl border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-[2rem] p-6 flex flex-col justify-center">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-slate dark:text-darkText/70 mb-2">Average Match Score</h3>
                        <div className="text-4xl font-sans font-bold text-champagne">
                            {Math.round(applications.reduce((acc, curr) => acc + curr.score, 0) / applications.length)}<span className="text-2xl text-slate dark:text-darkText/50">%</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-[2rem] overflow-hidden">
                <div className="hidden lg:grid grid-cols-6 gap-4 p-6 border-b border-obsidian/5 dark:border-darkText/5 text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/70">
                    <div className="col-span-2">Target Role & Company</div>
                    <div>Date</div>
                    <div>Projected Score</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                </div>

                <div className="divide-y divide-obsidian/5 dark:divide-darkText/5">
                    {loading ? (
                        <div className="p-12 text-center text-slate dark:text-darkText/70 font-mono text-sm">Loading history...</div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center animate-fade-in">
                            <div className="w-20 h-20 bg-champagne/10 rounded-full flex items-center justify-center mb-6">
                                <FileText className="w-10 h-10 text-champagne" />
                            </div>
                            <h3 className="text-xl font-bold text-obsidian dark:text-darkText mb-2">
                                You haven't analyzed any resumes yet.
                            </h3>
                            <p className="text-slate dark:text-darkText/60 max-w-sm mb-10 leading-relaxed">
                                Head over to the Workspace to begin.
                            </p>
                            <button
                                onClick={() => setCurrentView('workspace')}
                                className="bg-obsidian dark:bg-darkText text-background dark:text-darkBg px-8 py-3.5 rounded-full font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2 group btn-tactile"
                            >
                                <span className="group-hover:translate-x-1 transition-transform duration-300 ease-physical">Open Workspace</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 ease-physical" />
                            </button>
                        </div>
                    ) : (
                        displayedApplications.map((app) => (
                            <div key={app.id} onClick={() => handleRowClick(app)} className="history-row flex flex-col gap-3 p-6 lg:grid lg:grid-cols-6 lg:gap-4 lg:items-center hover:bg-background dark:hover:bg-darkCard/60 transition-colors group cursor-pointer relative">
                                <div className="lg:col-span-2">
                                    <h4 className="font-medium text-obsidian dark:text-darkText mb-1 group-hover:text-champagne transition-colors">{app.role}</h4>
                                    <p className="text-sm text-slate dark:text-darkText/70">{app.company}</p>
                                </div>
                                <div className="text-obsidian/70 dark:text-darkText/70 flex items-center text-sm">
                                    <Calendar className="w-4 h-4 mr-2 opacity-50" />
                                    {app.date}
                                </div>
                                <div className="flex flex-col space-y-1 w-full max-w-[140px]">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className={`font-bold ${app.score >= 71 ? 'text-[#34A853]' : app.score >= 61 ? 'text-champagne' : 'text-[#EA4335]'}`}>
                                            {app.score}%
                                        </span>
                                        <span className="text-slate dark:text-darkText/50 font-mono text-[10px] uppercase">Match</span>
                                    </div>
                                    <div className="w-full bg-obsidian/10 dark:bg-darkText/10 h-1.5 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-physical delay-300 ${app.score >= 71 ? 'bg-[#34A853]' : app.score >= 61 ? 'bg-champagne' : 'bg-[#EA4335]'}`}
                                            style={{ width: `${app.score}%` }}
                                        ></div>
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
                                <div className="flex justify-end space-x-3 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => handleDelete(e, app.id)} className="p-2 text-slate dark:text-darkText/50 hover:text-[#EA4335] hover:bg-[#EA4335]/10 rounded-full transition-colors" title="Delete Analysis">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Upgrade banner for base tier users */}
            {isLimited && (
                <div className="mt-4 p-5 bg-champagne/5 border border-champagne/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <Lock className="w-5 h-5 text-champagne shrink-0" />
                        <p className="text-sm text-obsidian dark:text-darkText">
                            <strong>{filteredApplications.length - historyLimit} more</strong> analyses hidden. Upgrade for unlimited history.
                        </p>
                    </div>
                    <button
                        onClick={() => setCurrentView('billing')}
                        className="bg-champagne text-obsidian px-5 py-2.5 rounded-full text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md whitespace-nowrap group"
                    >
                        <span className="inline-block group-hover:translate-x-0.5 transition-transform duration-300 ease-physical">Upgrade Plan</span>
                    </button>
                </div>
            )}
        </div>
    );
}

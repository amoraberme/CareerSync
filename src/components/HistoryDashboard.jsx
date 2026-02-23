import React, { useRef, useEffect, useState } from 'react';
import { Download, ExternalLink, Calendar, Search, Filter } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../supabaseClient';

export default function HistoryDashboard({ session }) {
    const containerRef = useRef(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    date: new Date(item.analysis_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    role: item.job_title,
                    company: item.company || 'Unknown',
                    score: item.match_score,
                    status: 'Analyzed'
                })));
            }
            setLoading(false);
        }

        fetchHistory();

        let ctx = gsap.context(() => {
            if (!loading && applications.length > 0) {
                gsap.from('.history-row', {
                    y: 20,
                    opacity: 0,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: 'power3.out'
                });
            }
        }, containerRef);
        return () => ctx.revert();
    }, [session, loading, applications.length]);

    return (
        <div ref={containerRef} className="max-w-6xl mx-auto py-12 px-6">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-4xl font-sans tracking-tight text-surface mb-2 font-semibold">
                        Application <span className="font-drama italic text-champagne font-normal">History</span>
                    </h2>
                    <p className="text-surface/60 text-lg">Your candidate management dashboard.</p>
                </div>
                <div className="flex space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-surface/40" />
                        <input type="text" placeholder="Search roles..." className="bg-slate/40 border border-surface/10 rounded-full pl-10 pr-4 py-2 text-surface text-sm focus:outline-none focus:border-champagne/50 w-64 transition-colors" />
                    </div>
                    <button className="bg-slate/40 border border-surface/10 p-2.5 rounded-full text-surface/60 hover:text-surface hover:bg-slate/60 transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="bg-slate/20 border border-surface/10 rounded-[2rem] overflow-hidden">
                <div className="grid grid-cols-6 gap-4 p-6 border-b border-surface/10 text-xs font-mono uppercase tracking-widest text-surface/50">
                    <div className="col-span-2">Target Role & Company</div>
                    <div>Date</div>
                    <div>Match Score</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                </div>

                <div className="divide-y divide-surface/5">
                    {loading ? (
                        <div className="p-12 text-center text-surface/50 font-mono text-sm">Loading history...</div>
                    ) : applications.length === 0 ? (
                        <div className="p-12 text-center text-surface/50 font-mono text-sm">No analysis history found. Start by running an analysis in the Core Engine!</div>
                    ) : (
                        applications.map((app) => (
                            <div key={app.id} className="history-row grid grid-cols-6 gap-4 p-6 items-center hover:bg-surface/5 transition-colors group">
                                <div className="col-span-2">
                                    <h4 className="font-medium text-surface mb-1 group-hover:text-champagne transition-colors">{app.role}</h4>
                                    <p className="text-sm text-surface/50">{app.company}</p>
                                </div>
                                <div className="text-surface/70 flex items-center text-sm">
                                    <Calendar className="w-4 h-4 mr-2 opacity-50" />
                                    {app.date}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-full border border-champagne/30 flex items-center justify-center text-champagne font-bold text-sm bg-champagne/10">
                                            {app.score}
                                        </div>
                                        <span className="text-xs text-surface/40">/100</span>
                                    </div>
                                </div>
                                <div>
                                    <span className={`px-3 py-1 text-xs rounded-full border ${app.status === 'Interviewing' ? 'bg-[#34A853]/10 border-[#34A853]/30 text-[#34A853]' :
                                        app.status === 'Applied' ? 'bg-[#0B66C2]/10 border-[#0B66C2]/30 text-[#0B66C2]' :
                                            'bg-surface/10 border-surface/20 text-surface/70'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>
                                <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-surface/50 hover:text-surface hover:bg-surface/10 rounded-full transition-colors" title="Download Report">
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-surface/50 hover:text-champagne hover:bg-champagne/10 rounded-full transition-colors" title="View Report">
                                        <ExternalLink className="w-4 h-4" />
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

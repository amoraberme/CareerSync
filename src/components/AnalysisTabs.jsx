import React, { useState, useEffect, useRef } from 'react';
import { Target, PenTool, LayoutTemplate, Activity, ChevronRight, Download, CheckCircle, ArrowRight, Lock } from 'lucide-react';
import gsap from 'gsap';
import useWorkspaceStore from '../store/useWorkspaceStore';
import { exportElementToPDF } from '../utils/exportPdf';
import { canAccess } from '../lib/tierPermissions';
import GatedFeature from './ui/GatedFeature';

export default function AnalysisTabs({ session, setCurrentView }) {
    const [activeTab, setActiveTab] = useState('analysis');
    const [isExporting, setIsExporting] = useState(false);
    const { analysisData, resetWorkspace } = useWorkspaceStore();
    const userTier = useWorkspaceStore(state => state.userTier);

    const containerRef = useRef(null);
    const exportRef = useRef(null);
    const scoreOffset = Math.max(0, 283 - (283 * (analysisData?.matchScore || 0) / 100));
    const projectedOffset = Math.max(0, 283 - (283 * (analysisData?.projectedScore || 0) / 100));

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from('.score-ring', {
                strokeDashoffset: 283,
                duration: 2,
                ease: 'power3.out',
                delay: 0.2
            });
            gsap.from('.score-text', {
                opacity: 0,
                scale: 0.8,
                duration: 1,
                ease: 'back.out(1.7)',
                delay: 0.5
            });
            gsap.from('.content-panel', {
                y: 20,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
                delay: 0.3
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleExport = async () => {
        if (!exportRef.current) return;
        setIsExporting(true);

        const safeTitle = (analysisData?.jobTitle || 'Role').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
        const safeCompany = (analysisData?.company || 'Company').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
        const safeDate = (analysisData?.date || 'Date').replace(/[, ]+/g, '_');
        const fileName = `${safeTitle}_-_${safeCompany}_-_${safeDate}.pdf`;

        // We now pass the raw JSON object instead of the DOM reference
        await exportElementToPDF(analysisData, fileName, userTier);
        setIsExporting(false);
    };

    return (
        <div ref={containerRef} className="max-w-6xl mx-auto py-8 md:py-12 px-4 md:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-8">
                <button onClick={resetWorkspace} className="text-slate hover:text-obsidian dark:text-darkText/70 dark:hover:text-darkText font-mono text-xs uppercase tracking-widest flex items-center transition-colors py-2">
                    <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Back to Workspace
                </button>
                <button
                    onClick={handleExport}
                    disabled={isExporting || !canAccess(userTier, 'pdf_export')}
                    aria-label={!canAccess(userTier, 'pdf_export') ? 'Upgrade to Standard or Premium to export' : 'Export Report as PDF'}
                    title={!canAccess(userTier, 'pdf_export') ? 'Upgrade to Standard or Premium to export' : ''}
                    className={`flex items-center justify-center space-x-2 text-xs font-mono uppercase tracking-widest transition-colors border border-obsidian/10 dark:border-darkText/10 shadow-sm px-4 py-3 md:py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${canAccess(userTier, 'pdf_export')
                        ? 'text-obsidian dark:text-darkText hover:bg-obsidian dark:hover:bg-darkText hover:text-white dark:hover:text-darkBg bg-white dark:bg-darkCard'
                        : 'text-obsidian/40 dark:text-darkText/40 bg-obsidian/5 dark:bg-darkCard/20'
                        }`}
                >
                    {!canAccess(userTier, 'pdf_export') ? (
                        <Lock className="w-4 h-4" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    <span>{isExporting ? 'Exporting...' : !canAccess(userTier, 'pdf_export') ? 'Upgrade to Export' : 'Export Report'}</span>
                </button>
            </div>

            <div ref={exportRef} className="export-container bg-background dark:bg-darkBg text-obsidian dark:text-darkText p-2 rounded-3xl">
                {/* Hero Overview */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
                    {/* Score Card: Baseline */}
                    <div className="bg-white/70 dark:bg-darkCard/40 backdrop-blur-xl border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-[2rem] p-6 flex flex-col items-center justify-center text-center">
                        <div className="relative w-24 h-24 md:w-28 md:h-28 mb-4">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(17,17,17,0.05)" strokeWidth="8" />
                                <circle
                                    cx="50" cy="50" r="45" fill="none" stroke="#EA4335" strokeWidth="8"
                                    strokeLinecap="round"
                                    className="score-ring"
                                    style={{ strokeDasharray: 283, strokeDashoffset: scoreOffset }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center score-text">
                                <span className="text-3xl font-sans font-bold text-obsidian dark:text-darkText">{analysisData?.matchScore || 0}<span className="text-lg text-slate dark:text-darkText/70">%</span></span>
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold text-obsidian dark:text-darkText">Baseline ATS Score</h3>
                        <p className="text-[10px] font-mono text-slate dark:text-darkText/50 mt-1 uppercase tracking-wide">Current Match</p>
                    </div>

                    {/* Score Card: Projected */}
                    <div className="bg-white/70 dark:bg-darkCard/40 backdrop-blur-xl border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-[2rem] p-6 flex flex-col items-center justify-center text-center">
                        <div className="relative w-24 h-24 md:w-28 md:h-28 mb-4">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(17,17,17,0.05)" strokeWidth="8" />
                                <circle
                                    cx="50" cy="50" r="45" fill="none" stroke="#34A853" strokeWidth="8"
                                    strokeLinecap="round"
                                    className="score-ring"
                                    style={{ strokeDasharray: 283, strokeDashoffset: projectedOffset }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center score-text">
                                <span className="text-3xl font-sans font-bold text-obsidian dark:text-darkText">{analysisData?.projectedScore || analysisData?.matchScore || 0}<span className="text-lg text-slate dark:text-darkText/70">%</span></span>
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold text-obsidian dark:text-darkText">Projected Potential</h3>
                        <p className="text-[10px] font-mono text-champagne mt-1 uppercase tracking-wide">Post-Optimization</p>
                    </div>

                    {/* Summary Card */}
                    <div className="md:col-span-3 bg-white/70 dark:bg-darkCard/40 backdrop-blur-xl border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-[2rem] p-8 flex flex-col justify-center">
                        <h2 className="text-2xl font-sans font-bold text-obsidian dark:text-darkText mb-4">Strategic Synthesis</h2>
                        <p className="text-slate dark:text-darkText/70 text-lg leading-relaxed font-sans">
                            {analysisData?.summary || 'Analyzing candidate profile against listing requirements...'}
                        </p>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex space-x-2 mb-8 border-b border-obsidian/10 dark:border-darkText/10 pb-4 overflow-x-auto hide-scrollbar">
                    {[
                        { id: 'analysis', label: 'Match Analysis', icon: Activity },
                        { id: 'cover', label: 'Cover Letter', icon: PenTool },
                        { id: 'optimize', label: 'Optimization', icon: LayoutTemplate }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-obsidian dark:bg-darkText text-white dark:text-darkBg shadow-md'
                                : 'text-slate dark:text-darkText/70 hover:text-obsidian dark:hover:text-darkText hover:bg-obsidian/5 dark:hover:bg-darkText/5 border border-transparent'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tabs Content */}
                <div className="content-panel bg-surface dark:bg-darkCard border border-obsidian/5 dark:border-darkText/5 shadow-inner rounded-[2rem] p-8 min-h-[400px]">
                    {activeTab === 'analysis' && (
                        <div className="animate-fade-in">
                            <h3 className="text-xl font-sans font-semibold text-obsidian dark:text-darkText mb-6">Candidate Architecture (Bento Profile)</h3>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-min">

                                {/* Target Role Context (Spans 1 Column, taller) */}
                                <div className="bg-white/50 dark:bg-darkCard/30 border border-obsidian/5 dark:border-darkText/5 shadow-sm rounded-3xl p-8 flex flex-col justify-between lg:row-span-2">
                                    <div>
                                        <div className="inline-block px-3 py-1 bg-champagne/20 text-champagne text-[10px] font-black uppercase tracking-widest rounded-full mb-4">Target Role Focus</div>
                                        <h4 className="text-2xl font-bold text-obsidian dark:text-darkText leading-tight mb-2">
                                            {analysisData?.jobTitle || 'Analyzed Role'}
                                        </h4>
                                        <p className="text-sm font-mono text-slate dark:text-darkText/60 mb-6">{analysisData?.company || 'Company'}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-obsidian/5 dark:bg-darkText/5 rounded-2xl">
                                            <p className="text-[10px] font-mono uppercase tracking-widest text-slate dark:text-darkText/50 mb-1">Match Quality</p>
                                            <p className="text-lg font-bold text-obsidian dark:text-darkText">{analysisData?.matchScore || 0}% Baseline Synergy</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Verified Strengths (Spans 2 Columns) */}
                                <div className="bg-white dark:bg-darkCard border border-[#34A853]/10 shadow-sm rounded-3xl p-8 lg:col-span-2 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#34A853]/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                                    <h4 className="text-sm font-mono uppercase tracking-widest text-[#34A853] mb-6 flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-[#34A853] mr-2 shadow-[0_0_8px_rgba(52,168,83,0.5)]"></span>
                                        Core Competencies
                                    </h4>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {(analysisData?.matchedProfile || []).slice(0, 4).map((match, idx) => (
                                            <div key={idx} className="bg-surface dark:bg-darkBg rounded-2xl p-4 flex flex-col justify-center">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-obsidian dark:text-darkText font-bold text-sm tracking-tight">{match.skill}</span>
                                                    <CheckCircle className="w-4 h-4 text-[#34A853] shrink-0" />
                                                </div>
                                                <span className="text-slate dark:text-darkText/70 text-xs line-clamp-2">{match.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Identified Gaps (Spans 1 Column) */}
                                <div className="bg-white dark:bg-darkCard border border-[#EA4335]/10 shadow-sm rounded-3xl p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#EA4335]/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                                    <h4 className="text-sm font-mono uppercase tracking-widest text-[#EA4335] mb-6 flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-[#EA4335] mr-2 shadow-[0_0_8px_rgba(234,67,53,0.5)]"></span>
                                        Vulnerabilities
                                    </h4>
                                    <div className="space-y-3">
                                        {(analysisData?.gapAnalysis || []).slice(0, 2).map((gap, idx) => (
                                            <div key={idx} className="flex gap-3 items-start border-l-2 border-[#EA4335]/30 pl-3">
                                                <Target className="w-4 h-4 text-[#EA4335] shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="text-obsidian dark:text-darkText font-bold text-sm block mb-0.5">{gap.missingSkill}</span>
                                                    <span className="text-slate dark:text-darkText/70 text-xs line-clamp-2 leading-relaxed">{gap.description}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Deep Transferable Skills Mapping (Spans 1 Column) */}
                                <div className="bg-obsidian dark:bg-darkText text-white dark:text-darkBg border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-3xl p-8 relative overflow-hidden">
                                    <Activity className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 pointer-events-none" />
                                    <h4 className="text-sm font-mono uppercase tracking-widest text-champagne mb-6 flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-champagne mr-2 shadow-[0_0_8px_rgba(235,210,166,0.5)]"></span>
                                        Transferable Bridge
                                    </h4>
                                    <div className="space-y-4 relative z-10">
                                        {(analysisData?.transferableSkills || []).slice(0, 1).map((ts, idx) => (
                                            <div key={idx} className="flex flex-col gap-2">
                                                <div className="inline-block self-start px-2 py-1 bg-white/10 dark:bg-darkBg/10 text-[10px] font-mono uppercase tracking-widest rounded text-champagne">
                                                    Bridge: {ts.missingSkill}
                                                </div>
                                                <p className="text-white/80 dark:text-darkBg/80 text-xs leading-relaxed">
                                                    {ts.bridgeAmmunition}
                                                </p>
                                            </div>
                                        ))}
                                        {(!analysisData?.transferableSkills || analysisData.transferableSkills.length === 0) && (
                                            <p className="text-white/50 dark:text-darkBg/50 text-xs italic">No deep transferable bridges identified.</p>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {activeTab === 'cover' && (
                        <div className="animate-fade-in max-w-3xl mx-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-sans font-semibold text-obsidian dark:text-darkText">Contextual Narrative</h3>
                            </div>
                            <div className="bg-white dark:bg-darkCard border border-obsidian/10 dark:border-darkText/10 shadow-sm text-obsidian dark:text-darkText rounded-2xl p-8 font-drama text-lg leading-relaxed">
                                {analysisData?.coverLetter ? (
                                    analysisData.coverLetter.split('\n\n').map((paragraph, idx) => (
                                        <p key={idx} className="mb-4 text-obsidian/90 dark:text-darkText/90">{paragraph}</p>
                                    ))
                                ) : (
                                    <p className="text-slate dark:text-darkText/70 font-sans italic text-sm">Generating customized narrative...</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'optimize' && (
                        <GatedFeature tier={userTier} feature="resume_optimization" onUpgrade={() => setCurrentView('plans')} fallbackMessage="Resume Optimization">
                            <div className="animate-fade-in space-y-8">
                                <h3 className="text-xl font-sans font-semibold text-obsidian dark:text-darkText mb-6">Resume Surgery</h3>

                                <div className="bg-white dark:bg-darkCard border border-obsidian/5 dark:border-darkText/5 border-l-4 border-l-champagne shadow-sm rounded-r-xl p-6">
                                    <h4 className="text-champagne font-mono text-sm uppercase tracking-widest mb-2">Strategic Advice</h4>
                                    <ul className="text-slate dark:text-darkText/70 space-y-2 list-disc list-inside">
                                        {(analysisData?.optimization?.strategicAdvice || ['Review alignment based on analysis results.']).map((advice, idx) => (
                                            <li key={idx}>{advice}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-sm font-mono uppercase tracking-widest text-slate dark:text-darkText/70 mb-4">ATS Injection Keywords</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(analysisData?.optimization?.atsKeywords || []).map((kw, idx) => (
                                            <span key={idx} className="bg-white dark:bg-darkCard border border-obsidian/10 dark:border-darkText/10 text-obsidian dark:text-darkText shadow-sm px-4 py-2 rounded-lg text-sm font-medium">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-mono uppercase tracking-widest text-slate dark:text-darkText/70 mb-4">Structural Edits</h4>
                                    <div className="space-y-4">
                                        {(analysisData?.optimization?.structuralEdits || []).map((edit, idx) => (
                                            <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-xl bg-white dark:bg-darkCard">
                                                <div className="text-[#EA4335] line-through opacity-80 w-full md:w-1/2">"{edit.before}"</div>
                                                <div className="text-[#34A853] font-medium w-full md:w-1/2 flex items-start mt-2 md:mt-0">
                                                    <ArrowRight className="w-4 h-4 text-obsidian/30 dark:text-darkText/30 shrink-0 mr-2 mt-1" />
                                                    <span>"{edit.after}"</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </GatedFeature>
                    )}
                </div>
                {/* End Export Container */}
            </div>
        </div>
    );
}

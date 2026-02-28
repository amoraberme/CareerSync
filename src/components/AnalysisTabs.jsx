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
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="text-xl font-sans font-semibold text-obsidian dark:text-darkText mb-6">Skill Alignment Matrix</h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-sm font-mono uppercase tracking-widest text-[#34A853] mb-4 flex items-center"><span className="w-2 h-2 rounded-full bg-[#34A853] mr-2"></span> Verified Strengths</h4>
                                    <div className="space-y-3">
                                        {(analysisData?.matchedProfile || []).map((match, idx) => (
                                            <div key={idx} className="bg-white dark:bg-darkCard border border-[#34A853]/30 shadow-sm rounded-xl p-4 flex flex-col items-start gap-1 justify-center">
                                                <div className="flex justify-between items-center w-full">
                                                    <span className="text-obsidian dark:text-darkText font-semibold">{match.skill}</span>
                                                    <CheckCircle className="w-4 h-4 text-[#34A853]" />
                                                </div>
                                                <span className="text-slate dark:text-darkText/70 text-sm">{match.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-mono uppercase tracking-widest text-[#EA4335] mb-4 flex items-center"><span className="w-2 h-2 rounded-full bg-[#EA4335] mr-2"></span> Identified Gaps</h4>
                                    <div className="space-y-3">
                                        {(analysisData?.gapAnalysis || []).map((gap, idx) => (
                                            <div key={idx} className="bg-white dark:bg-darkCard border border-[#EA4335]/30 shadow-sm rounded-xl p-4 flex flex-col items-start gap-1 justify-center">
                                                <div className="flex justify-between items-center w-full">
                                                    <span className="text-obsidian dark:text-darkText font-semibold">{gap.missingSkill}</span>
                                                    <Target className="w-4 h-4 text-[#EA4335]" />
                                                </div>
                                                <span className="text-slate dark:text-darkText/70 text-sm">{gap.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Deep Transferable Skills Mapping */}
                            {analysisData?.transferableSkills && analysisData.transferableSkills.length > 0 && (
                                <div className="mt-12 pt-8 border-t border-obsidian/5 dark:border-darkText/5">
                                    <h3 className="text-xl font-sans font-semibold text-obsidian dark:text-darkText mb-6 flex items-center">
                                        <Activity className="w-5 h-5 mr-3 text-champagne" />
                                        Transferable Skill Bridges
                                    </h3>
                                    <p className="text-slate dark:text-darkText/70 text-sm mb-6">Deep alignments identified by the AI to rhetorically overcome missing technical requirements.</p>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {analysisData.transferableSkills.map((ts, idx) => (
                                            <div key={idx} className="bg-white/40 dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 rounded-2xl p-6 shadow-sm">
                                                <div className="inline-block px-3 py-1 bg-obsidian/5 dark:bg-darkText/5 border border-obsidian/10 dark:border-darkText/10 text-xs font-mono uppercase tracking-widest rounded-full mb-4">
                                                    Bridging Gap: <span className="font-bold text-obsidian dark:text-darkText">{ts.missingSkill}</span>
                                                </div>
                                                <p className="text-obsidian/80 dark:text-darkText/80 leading-relaxed text-sm">
                                                    {ts.bridgeAmmunition}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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

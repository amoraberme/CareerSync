import React, { useState, useEffect, useRef } from 'react';
import { Target, PenTool, LayoutTemplate, Activity, ChevronRight, Download, CheckCircle, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import useWorkspaceStore from '../store/useWorkspaceStore';
import { exportElementToPDF } from '../utils/exportPdf';

export default function AnalysisTabs() {
    const [activeTab, setActiveTab] = useState('analysis');
    const [isExporting, setIsExporting] = useState(false);
    const { analysisData, resetWorkspace } = useWorkspaceStore();

    const containerRef = useRef(null);
    const exportRef = useRef(null);
    const scoreOffset = Math.max(0, 283 - (283 * (analysisData?.matchScore || 0) / 100));

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
        await exportElementToPDF(analysisData, fileName);
        setIsExporting(false);
    };

    return (
        <div ref={containerRef} className="max-w-6xl mx-auto py-12 px-6">
            <div className="flex justify-between items-center mb-8">
                <button onClick={resetWorkspace} className="text-surface/50 hover:text-surface font-mono text-xs uppercase tracking-widest flex items-center transition-colors">
                    <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Back to Workspace
                </button>
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-champagne hover:text-champagne/80 transition-colors bg-champagne/10 px-4 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="w-4 h-4" />
                    <span>{isExporting ? 'Exporting...' : 'Export Report'}</span>
                </button>
            </div>

            <div ref={exportRef} className="export-container bg-obsidian text-surface p-2 rounded-3xl">
                {/* Hero Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Score Card */}
                    <div className="bg-slate/40 backdrop-blur-xl border border-surface/10 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
                        <div className="relative w-32 h-32 mb-4">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <circle
                                    cx="50" cy="50" r="45" fill="none" stroke="#C9A84C" strokeWidth="8"
                                    strokeLinecap="round"
                                    className="score-ring"
                                    style={{ strokeDasharray: 283, strokeDashoffset: scoreOffset }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center score-text">
                                <span className="text-4xl font-sans font-bold text-surface">{analysisData?.matchScore || 0}<span className="text-xl text-surface/50">%</span></span>
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-surface">Match Processed</h3>
                        <p className="text-xs font-mono text-champagne mt-2 uppercase tracking-wide">AI Evaluation</p>
                    </div>

                    {/* Summary Card */}
                    <div className="md:col-span-3 bg-slate/40 backdrop-blur-xl border border-surface/10 rounded-[2rem] p-8 flex flex-col justify-center">
                        <h2 className="text-2xl font-sans font-bold text-surface mb-4">Strategic Synthesis</h2>
                        <p className="text-surface/80 text-lg leading-relaxed font-sans">
                            {analysisData?.summary || 'Analyzing candidate profile against listing requirements...'}
                        </p>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex space-x-2 mb-8 border-b border-surface/10 pb-4 overflow-x-auto hide-scrollbar">
                    {[
                        { id: 'analysis', label: 'Match Analysis', icon: Activity },
                        { id: 'cover', label: 'Cover Letter', icon: PenTool },
                        { id: 'optimize', label: 'Optimization', icon: LayoutTemplate }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-surface text-obsidian shadow-lg'
                                : 'text-surface/60 hover:text-surface hover:bg-surface/5'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tabs Content */}
                <div className="content-panel bg-slate/20 border border-surface/10 rounded-[2rem] p-8 min-h-[400px]">
                    {activeTab === 'analysis' && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="text-xl font-sans font-semibold text-surface mb-6">Skill Alignment Matrix</h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-sm font-mono uppercase tracking-widest text-[#34A853] mb-4 flex items-center"><span className="w-2 h-2 rounded-full bg-[#34A853] mr-2"></span> Verified Strengths</h4>
                                    <div className="space-y-3">
                                        {(analysisData?.matchedProfile || []).map((match, idx) => (
                                            <div key={idx} className="bg-surface/5 border border-[#34A853]/20 rounded-xl p-4 flex flex-col items-start gap-1 justify-center">
                                                <div className="flex justify-between items-center w-full">
                                                    <span className="text-surface font-semibold">{match.skill}</span>
                                                    <CheckCircle className="w-4 h-4 text-[#34A853]" />
                                                </div>
                                                <span className="text-surface/60 text-sm">{match.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-mono uppercase tracking-widest text-[#EA4335] mb-4 flex items-center"><span className="w-2 h-2 rounded-full bg-[#EA4335] mr-2"></span> Identified Gaps</h4>
                                    <div className="space-y-3">
                                        {(analysisData?.gapAnalysis || []).map((gap, idx) => (
                                            <div key={idx} className="bg-surface/5 border border-[#EA4335]/20 rounded-xl p-4 flex flex-col items-start gap-1 justify-center">
                                                <div className="flex justify-between items-center w-full">
                                                    <span className="text-surface font-semibold">{gap.missingSkill}</span>
                                                    <Target className="w-4 h-4 text-[#EA4335]" />
                                                </div>
                                                <span className="text-surface/60 text-sm">{gap.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cover' && (
                        <div className="animate-fade-in max-w-3xl mx-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-sans font-semibold text-surface">Contextual Narrative</h3>
                            </div>
                            <div className="bg-surface text-obsidian rounded-2xl p-8 font-drama text-lg leading-relaxed shadow-inner">
                                {analysisData?.coverLetter ? (
                                    analysisData.coverLetter.split('\n\n').map((paragraph, idx) => (
                                        <p key={idx} className="mb-4">{paragraph}</p>
                                    ))
                                ) : (
                                    <p>Generating customized narrative...</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'optimize' && (
                        <div className="animate-fade-in space-y-8">
                            <h3 className="text-xl font-sans font-semibold text-surface mb-6">Resume Surgery</h3>

                            <div className="bg-surface/5 border-l-4 border-champagne rounded-r-xl p-6">
                                <h4 className="text-champagne font-mono text-sm uppercase tracking-widest mb-2">Strategic Advice</h4>
                                <ul className="text-surface/80 space-y-2 list-disc list-inside">
                                    {(analysisData?.optimization?.strategicAdvice || ['Review alignment based on analysis results.']).map((advice, idx) => (
                                        <li key={idx}>{advice}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-sm font-mono uppercase tracking-widest text-surface/50 mb-4">ATS Injection Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(analysisData?.optimization?.atsKeywords || []).map((kw, idx) => (
                                        <span key={idx} className="bg-surface/10 border border-surface/20 text-surface px-4 py-2 rounded-lg text-sm font-medium">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-mono uppercase tracking-widest text-surface/50 mb-4">Structural Edits</h4>
                                <div className="space-y-4">
                                    {(analysisData?.optimization?.structuralEdits || []).map((edit, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 border border-surface/10 rounded-xl bg-obsidian/30">
                                            <div className="text-[#EA4335] line-through opacity-60 w-full md:w-1/2">"{edit.before}"</div>
                                            <div className="text-[#34A853] w-full md:w-1/2 flex items-start mt-2 md:mt-0">
                                                <ArrowRight className="w-4 h-4 text-surface/30 shrink-0 mr-2 mt-1" />
                                                <span>"{edit.after}"</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* End Export Container */}
            </div>
        </div>
    );
}

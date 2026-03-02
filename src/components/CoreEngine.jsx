import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, Wand2, ArrowRight, HelpCircle } from 'lucide-react';
import Tooltip from './ui/Tooltip';
import gsap from 'gsap';
import { supabase } from '../supabaseClient';
import useWorkspaceStore from '../store/useWorkspaceStore';

export default function CoreEngine({ session, setCurrentView }) {
    const [showPasteModal, setShowPasteModal] = useState(false);
    const {
        jobTitle, industry, experienceLevel, requiredSkills, experienceText, qualifications, roleDo, fullJobDescription, pastedText,
        resumeUploaded, resumeData, resumeFileName, resumeFileSize, coverLetterTone,
        isAnalyzing, isParsing, updateField, runAnalysis, runParse, userTier
    } = useWorkspaceStore();

    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from('.engine-element', {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleAutoFill = async (e) => {
        e.preventDefault();
        const success = await runParse(session);
        if (success) {
            setShowPasteModal(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // W-3 FIX: Cap file size at 5MB — Vercel serverless body limit is ~4.5MB
        const MAX_SIZE_MB = 5;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`File too large. Maximum resume size is ${MAX_SIZE_MB}MB. Please compress or copy-paste your resume text instead.`);
            e.target.value = '';
            return;
        }

        updateField('resumeFileName', file.name);
        updateField('resumeFileSize', (file.size / 1024 / 1024).toFixed(2) + 'MB');
        updateField('resumeUploaded', true);

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target.result.split(',')[1];
            updateField('resumeData', {
                data: base64String,
                mimeType: file.type || 'text/plain',
                name: file.name
            });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div ref={containerRef} className="max-w-5xl mx-auto py-12 px-6">
            <div className="engine-element mb-12">
                <h2 className="text-4xl font-sans tracking-tight text-obsidian dark:text-darkText mb-4 font-semibold">
                    Define the <span className="font-drama italic text-champagne font-normal">Target</span>
                </h2>
                <p className="text-slate dark:text-darkText/60 max-w-2xl text-lg">
                    Provide the role details manually, or use our parser to extract requirements instantly from a raw listing.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Job Details */}
                <div className="engine-element bg-white/70 dark:bg-darkCard/40 backdrop-blur-xl border border-obsidian/10 dark:border-darkText/10 rounded-[2rem] p-8 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-sans font-medium text-obsidian dark:text-darkText">Job Specifications</h3>
                        <div className="relative group/pastebtn">
                            {userTier === 'base' && (
                                <Tooltip align="right" text="Available only in Premium/Standard Plans" />
                            )}
                            <button
                                onClick={() => userTier !== 'base' && setShowPasteModal(true)}
                                disabled={userTier === 'base'}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${userTier === 'base'
                                    ? 'bg-slate/10 text-slate/50 cursor-not-allowed border border-obsidian/5 dark:border-darkText/5'
                                    : 'bg-champagne/10 text-champagne hover:bg-champagne/20 group-hover/pastebtn:rotate-2 group-hover/pastebtn:scale-105'
                                    }`}
                            >
                                <Wand2 className="w-4 h-4" />
                                <span>Paste Listing</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-5 flex-grow">
                        <div>
                            <label className="text-xs font-mono text-slate uppercase tracking-wider ml-1 mb-1 block">Job Title</label>
                            <input value={jobTitle} onChange={(e) => updateField('jobTitle', e.target.value)} type="text" placeholder="e.g. Lead Designer" className="w-full bg-white dark:bg-darkText/5 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-2xl px-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs font-mono text-slate uppercase tracking-wider ml-1 mb-1 block">Industry</label>
                            <input value={industry} onChange={(e) => updateField('industry', e.target.value)} type="text" placeholder="e.g. FinTech" className="w-full bg-white dark:bg-darkText/5 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-2xl px-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-mono text-slate uppercase tracking-wider ml-1 mb-1 block">Level</label>
                                <input value={experienceLevel} onChange={(e) => updateField('experienceLevel', e.target.value)} type="text" placeholder="e.g. Senior" className="w-full bg-white dark:bg-darkText/5 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-2xl px-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs font-mono text-slate uppercase tracking-wider ml-1 mb-1 block">Key Skills</label>
                                <input value={requiredSkills.join(', ')} onChange={(e) => updateField('requiredSkills', e.target.value.split(', '))} type="text" placeholder="React, Node..." title="Comma separated" className="w-full bg-white dark:bg-darkText/5 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-2xl px-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors" />
                            </div>
                        </div>
                        <div className="flex-grow flex flex-col gap-4 mt-2">
                            <button
                                type="button"
                                onClick={() => updateField('showAdvancedOptions', !useWorkspaceStore.getState().showAdvancedOptions)}
                                className="flex items-center text-xs font-mono text-slate dark:text-darkText/50 uppercase tracking-wider hover:text-obsidian dark:hover:text-darkText transition-colors outline-none"
                            >
                                <span className="mr-2">{useWorkspaceStore.getState().showAdvancedOptions ? '▼' : '▶'}</span>
                                Advanced Options
                            </button>

                            {useWorkspaceStore.getState().showAdvancedOptions && (
                                <div className="space-y-4 animate-fade-in-up border-t border-obsidian/5 dark:border-darkText/5 pt-4">
                                    <div>
                                        <label className="text-xs font-mono text-slate uppercase tracking-wider ml-1 mb-1 block">Experience</label>
                                        <textarea value={experienceText} onChange={(e) => updateField('experienceText', e.target.value)} placeholder="Required prior experience..." className="w-full min-h-[80px] bg-white dark:bg-darkText/5 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-2xl px-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors resize-none"></textarea>
                                    </div>
                                    <div>
                                        <label className="text-xs font-mono text-slate uppercase tracking-wider ml-1 mb-1 block">Qualifications</label>
                                        <textarea value={qualifications} onChange={(e) => updateField('qualifications', e.target.value)} placeholder="Educational or technical degrees/certifications..." className="w-full min-h-[80px] bg-white dark:bg-darkText/5 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-2xl px-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors resize-none"></textarea>
                                    </div>
                                    <div>
                                        <label className="text-xs font-mono text-slate uppercase tracking-wider ml-1 mb-1 block">What You'll Do in the Role</label>
                                        <textarea value={roleDo} onChange={(e) => updateField('roleDo', e.target.value)} placeholder="Day-to-day responsibilities..." className="w-full min-h-[80px] bg-white dark:bg-darkText/5 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-2xl px-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors resize-none"></textarea>
                                    </div>

                                    {/* Tone Selector */}
                                    <div className="mt-2 text-left">
                                        <label className="text-xs font-mono text-slate uppercase tracking-wider ml-1 mb-2 block">Cover Letter Mood</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Professional', 'Confident', 'Enthusiastic', 'Creative', 'Direct'].map((tone) => (
                                                <button
                                                    key={tone}
                                                    onClick={() => updateField('coverLetterTone', tone)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${coverLetterTone === tone
                                                        ? 'bg-champagne text-white shadow-md'
                                                        : 'bg-white dark:bg-darkText/5 text-slate dark:text-darkText/70 border border-obsidian/10 dark:border-darkText/10 hover:border-champagne/50'
                                                        }`}
                                                >
                                                    {tone}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Resume Upload */}
                <div className="engine-element flex flex-col gap-6 h-full">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.txt,.doc,.docx"
                    />
                    <div
                        className={`border-2 border-dashed ${resumeUploaded ? 'border-champagne/50 bg-champagne/5' : 'border-obsidian/10 dark:border-darkText/20 hover:border-obsidian/30 dark:hover:border-darkText/40 bg-white dark:bg-darkCard/20 hover:bg-surface dark:hover:bg-darkCard/30'} rounded-[2rem] transition-all duration-300 flex flex-col items-center justify-center p-10 xl:p-12 cursor-pointer relative overflow-hidden group shadow-sm`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {resumeUploaded ? (
                            <div className="text-center z-10">
                                <CheckCircle className="w-16 h-16 text-champagne mx-auto mb-4 bg-white rounded-full p-2 border border-obsidian/5 shadow-sm" />
                                <h3 className="text-xl font-medium text-obsidian dark:text-darkText mb-2">Resume Secured</h3>
                                <p className="text-slate dark:text-darkText/70 font-mono text-sm">{resumeFileName} ({resumeFileSize})</p>
                                <div className="mt-6 inline-flex items-center text-xs text-slate hover:text-obsidian uppercase tracking-widest font-mono transition-colors">
                                    Replace File
                                </div>
                            </div>
                        ) : (
                            <div className="text-center z-10">
                                <div className="w-20 h-20 bg-background dark:bg-darkBg border border-obsidian/5 dark:border-darkText/5 shadow-sm rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-surface dark:group-hover:bg-darkText/5 transition-all duration-300">
                                    <UploadCloud className="w-8 h-8 text-slate" />
                                </div>
                                <h3 className="text-xl font-medium text-obsidian dark:text-darkText mb-2 flex items-center justify-center">
                                    Upload Resume
                                    <Tooltip
                                        align="center"
                                        text="Your resume is securely encrypted and processed solely to generate your optimization report. We transmit this text to our AI provider (Google Gemini) for analysis, but your data is strictly legally prohibited from being used to train their foundational models."
                                    />
                                </h3>
                                <p className="text-slate dark:text-darkText/60 max-w-xs mx-auto mb-6 text-sm">
                                    Drag and drop your latest CV here. We support PDF, DOCX, and TXT up to 5MB.
                                </p>
                                <button className="bg-background dark:bg-darkBg border border-obsidian/10 dark:border-darkText/10 shadow-sm text-obsidian dark:text-darkText px-6 py-2 rounded-full text-sm font-medium hover:bg-surface dark:hover:bg-darkCard/40 transition-colors">
                                    Browse Files
                                </button>
                            </div>
                        )}

                        {/* Background decorative blob */}
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-surface/5 rounded-full blur-3xl opacity-50 group-hover:bg-champagne/10 transition-colors duration-500 pointer-events-none"></div>
                    </div>

                    <div className="w-full flex-grow flex flex-col">
                        <label className="text-xs font-mono text-slate uppercase tracking-wider ml-1 mb-1 block">Full Job Description</label>
                        <textarea value={fullJobDescription} onChange={(e) => updateField('fullJobDescription', e.target.value)} placeholder="Paste full job description here..." className="w-full flex-grow bg-white dark:bg-darkText/5 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-2xl px-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors resize-none"></textarea>
                    </div>

                    <div className="relative group/btn w-full mt-2">
                        <Tooltip align="center" text="Cost: 3 Credits. Deep analysis strictly checks AI matches and provides detailed career guidance." />
                        <button
                            onClick={() => runAnalysis(session, () => setCurrentView('billing'))}
                            disabled={!jobTitle || !resumeUploaded || isAnalyzing}
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg group ${jobTitle && resumeUploaded && !isAnalyzing
                                ? 'bg-obsidian dark:bg-darkText text-background dark:text-darkBg hover:bg-obsidian/90 dark:hover:bg-darkText/90 hover:scale-[1.02] active:scale-[0.98] btn-magnetic cursor-pointer'
                                : 'bg-obsidian/5 dark:bg-darkText/5 text-obsidian/30 dark:text-darkText/30 cursor-not-allowed border border-obsidian/5 dark:border-darkText/5'
                                }`}
                        >
                            <span className="transition-transform group-hover:translate-x-1">{isAnalyzing ? 'Running AI Parsing Model...' : 'Run Deep Analysis'}</span>
                            {!isAnalyzing && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Paste Modal */}
            {showPasteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-white/60 dark:bg-darkBg/60 backdrop-blur-md" onClick={() => setShowPasteModal(false)}></div>
                    <div className="relative bg-white dark:bg-darkBg border border-obsidian/10 dark:border-darkText/10 rounded-[2rem] w-full max-w-lg p-8 shadow-xl animate-fade-in-up">
                        <h3 className="text-2xl font-sans font-semibold text-obsidian dark:text-darkText mb-2">Auto-Fill Listing</h3>
                        <p className="text-slate dark:text-darkText/60 mb-6 text-sm">Paste the full text of the job listing below. Our engine will extract the core requirements instantly.</p>

                        <form onSubmit={handleAutoFill}>
                            <div className="mb-6 relative">
                                <FileText className="absolute left-4 top-4 text-slate w-5 h-5" />
                                <textarea
                                    autoFocus
                                    value={pastedText}
                                    onChange={(e) => updateField('pastedText', e.target.value)}
                                    placeholder="Paste job listing text here..."
                                    className="w-full bg-surface dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 shadow-inner rounded-2xl pl-12 pr-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/40 dark:placeholder:text-darkText/40 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors min-h-[120px] resize-none"
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setShowPasteModal(false)} className="px-6 py-2 rounded-full text-sm font-medium text-slate hover:text-obsidian transition-colors" disabled={isParsing}>
                                    Cancel
                                </button>
                                <div className="relative group/parse">
                                    <Tooltip align="right" text="Cost: 1 Credit. Auto-fills your setup using the job description." />
                                    <button type="submit" className="bg-obsidian text-white px-6 py-2 rounded-full text-sm font-bold shadow-md hover:bg-obsidian/90 transition-transform hover:scale-105 active:scale-95 flex items-center" disabled={isParsing}>
                                        {isParsing ? 'Extracting...' : 'Parse & Extract'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

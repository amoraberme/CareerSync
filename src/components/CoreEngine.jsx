import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Link as LinkIcon, FileText, CheckCircle, Wand2, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../supabaseClient';

export default function CoreEngine({ onAnalyze, session }) {
    const [showPasteModal, setShowPasteModal] = useState(false);
    const [jobTitle, setJobTitle] = useState('');
    const [industry, setIndustry] = useState('');
    const [description, setDescription] = useState('');
    const [pastedText, setPastedText] = useState('');
    const [resumeUploaded, setResumeUploaded] = useState(false);
    const [resumeData, setResumeData] = useState(null);
    const [resumeFileName, setResumeFileName] = useState('');
    const [resumeFileSize, setResumeFileSize] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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

    const handleAutoFill = (e) => {
        e.preventDefault();

        if (!pastedText.trim()) return;

        // Basic heuristic parsing locally. The backend AI does the heavy lifting later.
        // We assume the first line might be the title, or we just dump it all in description
        const lines = pastedText.split('\n').map(l => l.trim()).filter(l => l);

        if (lines.length > 0) {
            // Very naive extraction for UX feel: Title is usually short and at the top
            if (lines[0].length < 60) {
                setJobTitle(lines[0]);
                // If there's a second short line, guess it's the company/industry
                if (lines.length > 1 && lines[1].length < 40) {
                    setIndustry(lines[1]);
                    setDescription(lines.slice(2).join('\n'));
                } else {
                    setDescription(lines.slice(1).join('\n'));
                }
            } else {
                // If it's just a wall of text, put it all in description
                setDescription(pastedText);
            }
        }

        setShowPasteModal(false);
        setPastedText(''); // Clear for next time
    };

    const runAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitle, industry, description, resumeData })
            });
            const data = await response.json();

            if (session?.user) {
                const { error: dbError } = await supabase
                    .from('candidates_history')
                    .insert([{
                        user_id: session.user.id,
                        job_title: jobTitle,
                        company: industry,
                        match_score: data.score,
                        report_data: data
                    }]);
                if (dbError) console.error("Error saving history to Supabase:", dbError);
            }

            onAnalyze(data);
        } catch (error) {
            console.error("Failed to run analysis", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setResumeFileName(file.name);
        setResumeFileSize((file.size / 1024 / 1024).toFixed(2) + 'MB');
        setResumeUploaded(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target.result.split(',')[1];
            setResumeData({
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
                <h2 className="text-4xl font-sans tracking-tight text-surface mb-4 font-semibold">
                    Define the <span className="font-drama italic text-champagne font-normal">Target</span>
                </h2>
                <p className="text-surface/60 max-w-2xl text-lg">
                    Provide the role details manually, or use our parser to extract requirements instantly from a raw listing.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Job Details */}
                <div className="engine-element bg-slate/40 backdrop-blur-xl border border-surface/10 rounded-[2rem] p-8 shadow-xl flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-sans font-medium text-surface">Job Specifications</h3>
                        <button
                            onClick={() => setShowPasteModal(true)}
                            className="group flex items-center space-x-2 bg-champagne/10 text-champagne px-4 py-2 rounded-full text-sm font-medium hover:bg-champagne/20 transition-colors"
                        >
                            <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            <span>Paste Listing</span>
                        </button>
                    </div>

                    <div className="space-y-5 flex-grow">
                        <div>
                            <label className="text-xs font-mono text-surface/60 uppercase tracking-wider ml-1 mb-1 block">Job Title</label>
                            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} type="text" placeholder="e.g. Lead Designer" className="w-full bg-obsidian/50 border border-surface/10 rounded-2xl px-4 py-3 text-surface placeholder:text-surface/30 focus:outline-none focus:border-champagne/50 transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs font-mono text-surface/60 uppercase tracking-wider ml-1 mb-1 block">Industry</label>
                            <input value={industry} onChange={(e) => setIndustry(e.target.value)} type="text" placeholder="e.g. FinTech" className="w-full bg-obsidian/50 border border-surface/10 rounded-2xl px-4 py-3 text-surface placeholder:text-surface/30 focus:outline-none focus:border-champagne/50 transition-colors" />
                        </div>
                        <div className="flex-grow flex flex-col">
                            <label className="text-xs font-mono text-surface/60 uppercase tracking-wider ml-1 mb-1 block">Full Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Paste full job description here..." className="w-full flex-grow min-h-[160px] bg-obsidian/50 border border-surface/10 rounded-2xl px-4 py-3 text-surface placeholder:text-surface/30 focus:outline-none focus:border-champagne/50 transition-colors resize-none"></textarea>
                        </div>
                    </div>
                </div>

                {/* Right Column: Resume Upload */}
                <div className="engine-element flex flex-col gap-6">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.txt,.doc,.docx"
                    />
                    <div
                        className={`flex-grow border-2 border-dashed ${resumeUploaded ? 'border-champagne/50 bg-champagne/5' : 'border-surface/20 hover:border-surface/40 bg-slate/20 hover:bg-slate/30'} rounded-[2rem] transition-all duration-300 flex flex-col items-center justify-center p-12 cursor-pointer relative overflow-hidden group`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {resumeUploaded ? (
                            <div className="text-center z-10">
                                <CheckCircle className="w-16 h-16 text-champagne mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-surface mb-2">Resume Secured</h3>
                                <p className="text-surface/60 font-mono text-sm">{resumeFileName} ({resumeFileSize})</p>
                                <div className="mt-6 inline-flex items-center text-xs text-surface/40 hover:text-surface uppercase tracking-widest font-mono transition-colors">
                                    Replace File
                                </div>
                            </div>
                        ) : (
                            <div className="text-center z-10">
                                <div className="w-20 h-20 bg-surface/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-surface/10 transition-all duration-300">
                                    <UploadCloud className="w-8 h-8 text-surface/80" />
                                </div>
                                <h3 className="text-xl font-medium text-surface mb-2">Upload Resume</h3>
                                <p className="text-surface/60 max-w-xs mx-auto mb-6">
                                    Drag and drop your latest CV here. We support PDF, DOCX, and TXT up to 5MB.
                                </p>
                                <button className="bg-surface/10 text-surface px-6 py-2 rounded-full text-sm font-medium hover:bg-surface hover:text-obsidian transition-colors">
                                    Browse Files
                                </button>
                            </div>
                        )}

                        {/* Background decorative blob */}
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-surface/5 rounded-full blur-3xl opacity-50 group-hover:bg-champagne/10 transition-colors duration-500 pointer-events-none"></div>
                    </div>

                    <button
                        onClick={runAnalysis}
                        disabled={!jobTitle || !resumeUploaded || isAnalyzing}
                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all duration-300 shadow-xl ${jobTitle && resumeUploaded && !isAnalyzing
                            ? 'bg-surface text-obsidian hover:bg-surface/90 hover:scale-[1.02] active:scale-[0.98] btn-magnetic cursor-pointer'
                            : 'bg-surface/20 text-surface/40 cursor-not-allowed'
                            }`}
                    >
                        <span>{isAnalyzing ? 'Running AI Parsing Model...' : 'Run Deep Analysis'}</span>
                        {!isAnalyzing && <ArrowRight className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Paste Modal */}
            {showPasteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" onClick={() => setShowPasteModal(false)}></div>
                    <div className="relative bg-slate border border-surface/10 rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-fade-in-up">
                        <h3 className="text-2xl font-sans font-semibold text-surface mb-2">Auto-Fill Listing</h3>
                        <p className="text-surface/60 mb-6 text-sm">Paste the raw URL or text of the job listing. Our engine will extract the core requirements instantly.</p>

                        <form onSubmit={handleAutoFill}>
                            <div className="mb-6 relative">
                                <LinkIcon className="absolute left-4 top-4 text-surface/40 w-5 h-5" />
                                <textarea
                                    autoFocus
                                    value={pastedText}
                                    onChange={(e) => setPastedText(e.target.value)}
                                    placeholder="Paste URL or listing text here..."
                                    className="w-full bg-obsidian border border-surface/10 rounded-2xl pl-12 pr-4 py-3 text-surface placeholder:text-surface/30 focus:outline-none focus:border-champagne/50 transition-colors min-h-[120px] resize-none"
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setShowPasteModal(false)} className="px-6 py-2 rounded-full text-sm font-medium text-surface/60 hover:text-surface transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-champagne text-obsidian px-6 py-2 rounded-full text-sm font-bold hover:bg-champagne/90 transition-transform hover:scale-105 active:scale-95">
                                    Parse & Extract
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useEffect, useRef, useState } from 'react';
import { MousePointer2, FileText, CheckCircle, UploadCloud, ChevronRight, Wand2, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

// --- Timing Configuration (Adjust these to speed up/slow down the simulation) ---
const DELAY_START = 1;
const CURSOR_MOVE_DURATION = 1.2;
const TYPING_SPEED = 30; // ms per character (used if calculating exact time, but GSAP uses duration)
const GSAP_TYPING_DURATION = 2; // Fixed duration for typing simulation
const PAUSE_BETWEEN_STEPS = 0.5;
const PROCESSING_DURATION = 2.5;

export default function Simulation() {
    const containerRef = useRef(null);
    const cursorRef = useRef(null);
    const tlRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // UI States managed by the timeline
    const [jobText, setJobText] = useState("");
    const [resumeText, setResumeText] = useState("");
    const [activeTone, setActiveTone] = useState("Professional");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [progress, setProgress] = useState(0);

    const fullJobText = "Senior Frontend Engineer\nRequires 5+ years experience, React expertise, and strong UI/UX sensibilities...";
    const fullResumeText = "Software Developer with 6 years of experience building scalable web applications using React and Node.js...";

    const resetSimulation = () => {
        if (tlRef.current) {
            tlRef.current.kill();
        }
        setIsPlaying(false);
        setJobText("");
        setResumeText("");
        setActiveTone("Professional");
        setIsAnalyzing(false);
        setShowResults(false);
        setProgress(0);

        // Reset cursor position to start
        gsap.set(cursorRef.current, { x: 50, y: window.innerHeight - 200, opacity: 0 });
    };

    const playSimulation = () => {
        if (isPlaying) return;
        resetSimulation();
        setIsPlaying(true);

        const tl = gsap.timeline();
        tlRef.current = tl;

        // 1. Cursor enters
        tl.to(cursorRef.current, {
            opacity: 1,
            duration: 0.3
        })

            // 2. Move to Job Input
            .to(cursorRef.current, {
                x: () => { const el = document.getElementById('sim-job-input'); return el ? el.getBoundingClientRect().left + 40 : 200; },
                y: () => { const el = document.getElementById('sim-job-input'); return el ? el.getBoundingClientRect().top + 20 : 200; },
                duration: CURSOR_MOVE_DURATION,
                ease: "power2.inOut"
            }, `+=${DELAY_START}`)

            // Click effect
            .to(cursorRef.current, { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 })

            // Type Job Text
            .to({ length: 0 }, {
                length: fullJobText.length,
                duration: GSAP_TYPING_DURATION,
                ease: "none",
                onUpdate: function () {
                    setJobText(fullJobText.substring(0, Math.floor(this.targets()[0].length)));
                }
            })

            // 3. Move to Resume Input
            .to(cursorRef.current, {
                x: () => { const el = document.getElementById('sim-resume-input'); return el ? el.getBoundingClientRect().left + 40 : 200; },
                y: () => { const el = document.getElementById('sim-resume-input'); return el ? el.getBoundingClientRect().top + 20 : 300; },
                duration: CURSOR_MOVE_DURATION,
                ease: "power2.inOut"
            }, `+=${PAUSE_BETWEEN_STEPS}`)

            // Click effect
            .to(cursorRef.current, { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 })

            // Paste Resume Text (Instant)
            .add(() => setResumeText(fullResumeText))
            .to({}, { duration: 0.5 }) // Brief pause after paste

            // 4. Move to Tone Selector
            .to(cursorRef.current, {
                x: () => { const el = document.getElementById('sim-tone-professional'); return el ? el.getBoundingClientRect().left + 20 : 300; },
                y: () => { const el = document.getElementById('sim-tone-professional'); return el ? el.getBoundingClientRect().top + 10 : 400; },
                duration: CURSOR_MOVE_DURATION,
                ease: "power2.inOut"
            })

            // Click effect
            .to(cursorRef.current, { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 })

            // 5. Move to Analyze Button
            .to(cursorRef.current, {
                x: () => { const el = document.getElementById('sim-analyze-btn'); return el ? el.getBoundingClientRect().left + window.innerWidth * 0.1 : 400; },
                y: () => { const el = document.getElementById('sim-analyze-btn'); return el ? el.getBoundingClientRect().top + 20 : 500; },
                duration: CURSOR_MOVE_DURATION,
                ease: "power2.inOut"
            }, `+=${PAUSE_BETWEEN_STEPS}`)

            // Click Analyze
            .to(cursorRef.current, { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 })
            .add(() => setIsAnalyzing(true))

            // 6. Processing State (Simulate loading bar)
            .to({ p: 0 }, {
                p: 100,
                duration: PROCESSING_DURATION,
                ease: "power1.inOut",
                onUpdate: function () {
                    setProgress(Math.floor(this.targets()[0].p));
                }
            })

            // 7. Show Results
            .add(() => {
                setIsAnalyzing(false);
                setShowResults(true);
            })

            // Move cursor out of the way
            .to(cursorRef.current, {
                x: window.innerWidth - 100,
                y: window.innerHeight - 100,
                duration: CURSOR_MOVE_DURATION,
                ease: "power2.inOut",
                opacity: 0
            });
    };

    // Initial setup
    useEffect(() => {
        gsap.set(cursorRef.current, { opacity: 0 });
    }, []);

    return (
        <div ref={containerRef} className="relative w-full max-w-5xl mx-auto my-24 perspective-1000">
            {/* The Cursor */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 z-[200] pointer-events-none text-obsidian drop-shadow-lg"
                style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.3))" }}
            >
                <MousePointer2 className="w-8 h-8 fill-obsidian stroke-white stroke-2" />
            </div>

            {/* Main Application Container */}
            <div className={`relative bg-background dark:bg-darkBg border border-obsidian/10 dark:border-darkText/10 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-1000 transform ${showResults ? 'scale-100' : 'scale-[0.98]'}`}>

                {/* Overlay to intercept clicks and show Play button initially */}
                {!isPlaying && !showResults && (
                    <div className="absolute inset-0 z-50 bg-background/60 dark:bg-darkBg/60 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-opacity hover:bg-background/50" onClick={playSimulation}>
                        <div className="bg-obsidian dark:bg-darkText text-white dark:text-darkBg px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-champagne opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-champagne"></span>
                            </span>
                            Play Sandbox Simulation
                        </div>
                    </div>
                )}

                {/* Top Toolbar Simulation */}
                <div className="h-12 border-b border-obsidian/5 dark:border-darkText/5 flex items-center px-4 gap-2 bg-surface dark:bg-darkCard/40">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="mx-auto flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="w-4 h-4 opacity-70" />
                        <span className="text-xs font-mono font-medium text-slate dark:text-darkText/60">CareerSync Engine</span>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 relative min-h-[500px]">

                    {/* Input Phase (Left Side generally, but spans full if results not shown) */}
                    <div className={`flex flex-col gap-6 transition-all duration-700 ${showResults ? 'opacity-30 blur-sm scale-95 pointer-events-none' : 'opacity-100'}`}>
                        {/* Job Description Block */}
                        <div id="sim-job-input" className="bg-white/50 dark:bg-darkCard/30 border border-obsidian/10 dark:border-darkText/10 rounded-2xl p-5 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-mono text-slate uppercase tracking-wider block">Target Job Description</label>
                                <div className="text-[10px] bg-champagne/10 text-champagne px-2 py-0.5 rounded-full flex gap-1 items-center"><Wand2 className="w-3 h-3" /> Paste Listing</div>
                            </div>
                            <div className="w-full min-h-[100px] bg-white dark:bg-darkText/5 border border-obsidian/5 dark:border-darkText/5 rounded-xl p-3 text-sm text-obsidian dark:text-darkText font-mono whitespace-pre-wrap">
                                {jobText || <span className="opacity-30">Waiting for input...</span>}
                                {isPlaying && jobText.length < fullJobText.length && jobText.length > 0 && <span className="animate-pulse">|</span>}
                            </div>
                        </div>

                        {/* Resume Block */}
                        <div id="sim-resume-input" className="bg-white/50 dark:bg-darkCard/30 border border-obsidian/10 dark:border-darkText/10 rounded-2xl p-5 shadow-sm">
                            <label className="text-xs font-mono text-slate uppercase tracking-wider mb-3 block">Your Resume</label>
                            <div className="w-full min-h-[80px] bg-white dark:bg-darkText/5 border border-obsidian/5 dark:border-darkText/5 rounded-xl p-3 text-sm text-obsidian dark:text-darkText font-mono whitespace-pre-wrap">
                                {resumeText || <span className="opacity-30">Upload or paste resume...</span>}
                            </div>
                        </div>

                        {/* Tone Selector */}
                        <div className="bg-white/50 dark:bg-darkCard/30 border border-obsidian/10 dark:border-darkText/10 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                            <label className="text-xs font-mono text-slate uppercase tracking-wider block">Cover Letter Tone</label>
                            <div id="sim-tone-professional" className={`px-3 py-1.5 rounded-full text-xs font-semibold ${activeTone === 'Professional' ? 'bg-champagne text-white' : 'bg-white text-slate'}`}>
                                Professional
                            </div>
                        </div>

                        {/* Analyze Button */}
                        <div id="sim-analyze-btn" className="relative">
                            <div className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all ${isAnalyzing ? 'bg-obsidian/80 dark:bg-darkText/80 text-background' : 'bg-obsidian dark:bg-darkText text-background dark:text-darkBg shadow-lg'}`}>
                                <span>{isAnalyzing ? `Extracting Data... ${progress}%` : 'Run Deep Analysis'}</span>
                                {!isAnalyzing && <ArrowRight className="w-5 h-5" />}
                            </div>
                            {/* Loading Bar Overlay */}
                            {isAnalyzing && (
                                <div className="absolute bottom-0 left-0 h-1 bg-champagne rounded-b-2xl transition-all" style={{ width: `${progress}%` }}></div>
                            )}
                        </div>
                    </div>

                    {/* Results Overlay (Expands out) */}
                    <div className={`absolute top-0 right-0 w-full lg:w-1/2 h-full bg-surface dark:bg-darkCard p-8 shadow-2xl border-l border-obsidian/10 dark:border-darkText/10 transform transition-transform duration-1000 ease-out-expo ${showResults ? 'translate-x-0' : 'translate-x-full'}`}>
                        {showResults && (
                            <div className="h-full flex flex-col pt-12 animate-fade-in delay-300">
                                <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-6 flex items-center gap-2">
                                    <CheckCircle className="text-[#34A853] w-6 h-6" />
                                    Analysis Complete
                                </h3>

                                {/* Match Ring Simulation */}
                                <div className="flex items-center gap-6 mb-8 bg-white dark:bg-darkBg border border-obsidian/5 rounded-2xl p-6">
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate/20" />
                                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#34A853] drop-shadow-md" strokeDasharray="251.2" strokeDashoffset="20.096" style={{ transition: 'stroke-dashoffset 2s ease-out' }} />
                                        </svg>
                                        <span className="absolute text-2xl font-bold dark:text-darkText">92<span className="text-sm">%</span></span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono uppercase text-slate dark:text-darkText/50 mb-1">Projected Match</p>
                                        <p className="text-sm text-obsidian dark:text-darkText font-medium">Excellent alignment. Core skills match exactly. Recommended to proceed.</p>
                                    </div>
                                </div>

                                {/* Optimization Preview */}
                                <div className="space-y-4 flex-grow">
                                    <div className="bg-white dark:bg-darkBg border border-obsidian/5 rounded-2xl p-5">
                                        <p className="text-xs font-mono uppercase text-champagne font-bold mb-2">Resume Optimization</p>
                                        <p className="text-sm text-slate line-through mb-1">Developed internal tools for staff.</p>
                                        <p className="text-sm font-medium text-obsidian dark:text-darkText text-[#34A853]">→ Architected scalable internal React dashboards, increasing team efficiency by 40%.</p>
                                    </div>
                                    <div className="bg-white dark:bg-darkBg border border-obsidian/5 rounded-2xl p-5">
                                        <p className="text-xs font-mono uppercase text-obsidian/50 font-bold mb-2">Cover Letter Snippet</p>
                                        <p className="text-sm text-obsidian dark:text-darkText/80 font-serif italic">"With a proven track record of 6 years in scaling React architectures, I am uniquely positioned to tackle exactly the frontend challenges your team faces..."</p>
                                    </div>
                                </div>

                                <button onClick={resetSimulation} className="mt-6 w-full py-3 rounded-full border border-obsidian/20 text-sm font-bold hover:bg-obsidian/5 transition-colors">
                                    Reset Simulation
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

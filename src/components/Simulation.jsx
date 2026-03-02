import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MousePointer2, FileText, CheckCircle, UploadCloud, ChevronRight, Wand2, ArrowRight } from 'lucide-react';

const Card1 = () => (
    <div className="bg-white/50 dark:bg-darkCard/30 border border-obsidian/10 dark:border-darkText/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md w-full max-w-2xl mx-auto flex flex-col gap-4">
        <div className="flex justify-between items-center bg-surface dark:bg-darkCard/40 -mt-6 -mx-6 md:-mt-8 md:-mx-8 p-4 rounded-t-2xl border-b border-obsidian/5 dark:border-darkText/5 mb-2">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="mx-auto flex items-center gap-2">
                <img src="/logo.png" alt="Logo" className="w-4 h-4 opacity-70" />
                <span className="text-xs font-mono font-medium text-slate dark:text-darkText/60">Target Job Description</span>
            </div>
        </div>

        <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-mono text-slate uppercase tracking-wider block">Job Listing Details</label>
            <div className="text-[10px] bg-champagne/10 text-champagne px-2 py-0.5 rounded-full flex gap-1 items-center"><Wand2 className="w-3 h-3" /> Auto-Extract</div>
        </div>
        <div className="w-full min-h-[140px] bg-white dark:bg-darkText/5 border border-obsidian/5 dark:border-darkText/5 rounded-xl p-4 text-sm text-obsidian dark:text-darkText font-mono whitespace-pre-wrap flex flex-col gap-2">
            <span className="font-bold text-base">Senior Frontend Engineer</span>
            <span className="opacity-80">Requires 5+ years experience, React expertise, and strong UI/UX sensibilities. Must be comfortable highly scalable web applications...</span>
        </div>
    </div>
);

const Card2 = () => (
    <div className="bg-white/50 dark:bg-darkCard/30 border border-obsidian/10 dark:border-darkText/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md w-full max-w-2xl mx-auto flex flex-col gap-4">
        <div className="flex justify-between items-center bg-surface dark:bg-darkCard/40 -mt-6 -mx-6 md:-mt-8 md:-mx-8 p-4 rounded-t-2xl border-b border-obsidian/5 dark:border-darkText/5 mb-2">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="mx-auto flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-slate dark:text-darkText/60">Your Resume</span>
            </div>
        </div>

        <label className="text-xs font-mono text-slate uppercase tracking-wider mb-1 block">Context Upload</label>
        <div className="w-full h-[140px] border-2 border-dashed border-champagne/40 bg-champagne/5 rounded-xl flex items-center justify-center flex-col gap-2 text-champagne">
            <UploadCloud className="w-8 h-8 opacity-80" />
            <span className="text-sm font-semibold opacity-80">portfolio_resume.pdf uploaded</span>
        </div>
    </div>
);

const Card3 = () => (
    <div className="bg-white/50 dark:bg-darkCard/30 border border-obsidian/10 dark:border-darkText/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md w-full max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-center bg-surface dark:bg-darkCard/40 -mt-6 -mx-6 md:-mt-8 md:-mx-8 p-4 rounded-t-2xl border-b border-obsidian/5 dark:border-darkText/5 mb-2">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="mx-auto flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-slate dark:text-darkText/60">Analysis Configuration</span>
            </div>
        </div>

        <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-slate uppercase tracking-wider block">Target Tone</label>
            <div className="flex gap-2">
                <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-slate opacity-50">Direct</div>
                <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-champagne text-white shadow-md">Professional</div>
                <div className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-slate opacity-50">Creative</div>
            </div>
        </div>

        <div className="w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 bg-obsidian dark:bg-darkText text-background dark:text-darkBg shadow-lg">
            <span>Run Deep Analysis</span>
            <ArrowRight className="w-5 h-5" />
        </div>
    </div>
);

const Card4 = () => (
    <div className="bg-surface dark:bg-darkCard border border-obsidian/10 dark:border-darkText/10 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md w-full max-w-2xl mx-auto flex flex-col gap-6 z-50">
        <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-2 flex items-center gap-2">
            <CheckCircle className="text-[#34A853] w-6 h-6" />
            Analysis Complete
        </h3>

        {/* Match Ring Simulation */}
        <div className="flex items-center gap-6 bg-white dark:bg-darkBg border border-obsidian/5 rounded-2xl p-6 shadow-sm">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96" overflow="visible">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate/20" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#34A853] drop-shadow-md stroke-dasharray-[251.2] stroke-dashoffset-[20.096]" />
                </svg>
                <span className="absolute text-xl font-bold dark:text-darkText">92<span className="text-xs">%</span></span>
            </div>
            <div>
                <p className="text-xs font-mono uppercase text-slate dark:text-darkText/50 mb-1">Projected Match</p>
                <p className="text-sm text-obsidian dark:text-darkText font-medium">Excellent alignment. Core skills match exactly. Recommended to proceed.</p>
            </div>
        </div>

        {/* Optimization Preview */}
        <div className="space-y-4">
            <div className="bg-white dark:bg-darkBg border border-obsidian/5 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-mono uppercase text-champagne font-bold mb-2">Resume Optimization</p>
                <p className="text-sm text-slate line-through mb-1">Developed internal tools for staff.</p>
                <p className="text-sm font-medium text-obsidian dark:text-darkText text-[#34A853]">→ Architected scalable internal React dashboards, increasing team efficiency by 40%.</p>
            </div>
        </div>
    </div>
);

const StepCard = ({ i, targetScale, progress, children }) => {
    // Each card becomes fully active at a certain progress milestone
    // Card 1 active 0.0 -> 0.25 (scaled down past 0.25)
    // Card 2 active 0.25 -> 0.5 (scaled down past 0.5)
    // Card 3 active 0.5 -> 0.75 (scaled down past 0.75)
    // Card 4 active 0.75 -> 1.0

    // We base the start and end of this card's "active" state on its index
    const startRange = i * 0.25;
    const endRange = (i + 1) * 0.25;

    // The scale drops to targetScale when progress passes endRange
    const scale = useTransform(
        progress,
        [startRange - 0.25, startRange, endRange, endRange + 0.25],
        [1.2, 1, 1, targetScale]
    );

    // The opacity only drops slightly, we want them visible faintly behind
    const opacity = useTransform(
        progress,
        [startRange - 0.25, startRange, endRange, endRange + 0.25],
        [0, 1, 1, 0.4]
    );

    // Y positioning: Slide in from bottom
    const y = useTransform(
        progress,
        [startRange - 0.25, startRange],
        ["100%", "0%"]
    );

    return (
        <motion.div
            style={{
                scale,
                opacity,
                y,
                transformOrigin: "top center",
                zIndex: i,
            }}
            className="absolute top-0 left-0 w-full flex items-center justify-center p-4 xl:p-0"
        >
            {children}
        </motion.div>
    );
};

export default function Simulation() {
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const CARDS = [
        { id: 0, component: <Card1 />, targetScale: 0.85 },
        { id: 1, component: <Card2 />, targetScale: 0.90 },
        { id: 2, component: <Card3 />, targetScale: 0.95 },
        { id: 3, component: <Card4 />, targetScale: 1.0 },
    ];

    return (
        <div ref={containerRef} className="relative w-full h-[400vh]">
            <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center z-10">
                {/* Background Blobs for specific section */}
                <div className="absolute inset-0 -z-10 bg-background dark:bg-darkBg">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] opacity-20 dark:opacity-10 blur-[100px] bg-gradient-to-r from-champagne via-transparent to-slate rounded-full pointer-events-none" />
                </div>

                <div className="text-center mb-12 lg:mb-20 px-4 -mt-32">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tightest text-obsidian dark:text-darkText mb-4">
                        Powered by intelligence.
                    </h2>
                    <p className="text-slate dark:text-darkText/60 max-w-lg mx-auto">
                        Scroll down to witness how our engine breaks down job requirements, aligns your resume, and engineers the perfect candidate profile.
                    </p>
                </div>

                <div className="relative w-full max-w-3xl mx-auto h-[450px]">
                    {CARDS.map((card, i) => (
                        <StepCard
                            key={card.id}
                            i={i}
                            targetScale={card.targetScale}
                            progress={scrollYProgress}
                        >
                            {card.component}
                        </StepCard>
                    ))}
                </div>
            </div>
        </div>
    );
}

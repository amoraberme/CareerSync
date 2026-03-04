import React, { useEffect, useState, useRef } from 'react';
import { Check, ArrowRight, Shield, Zap, Target, FileText, CheckCircle2, X, Upload, Settings, FileDown } from 'lucide-react';
import gsap from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Simulation from './Simulation';
import ContactModal from './ContactModal';
import SlideInButton from './animations/SlideInButton';
import SwipeLettersButton from './animations/SwipeLettersButton';
import SmartTypewriterText from './animations/SmartTypewriterText';
import FAQSection from './animations/FAQSection';
import TransferableBridge from './TransferableBridge';
import PASSection from './PASSection';

gsap.registerPlugin(ScrollToPlugin);

// --- ATS Scanner Component ---
const ATSScanner = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // Mathematical Visual Engine configs
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (0.85 * circumference); // 85% full

    const dummySkills = [
        { word: "Python", match: true },
        { word: "Synergy", match: false },
        { word: "Project Management", match: true },
        { word: "Hardworking", match: false },
        { word: "React", match: true },
        { word: "Team Player", match: false },
        { word: "Vector Mapping", match: true },
        { word: "PostgreSQL", match: true }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 1.5, // Start words after gauge is almost done
                staggerChildren: 0.15
            }
        }
    };

    const wordVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    return (
        <div ref={ref} className="w-full max-w-[480px] bg-surface dark:bg-darkCard rounded-3xl p-6 md:p-8 border border-obsidian/5 dark:border-darkText/5 shadow-2xl relative overflow-hidden flex flex-col gap-8 group">

            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-champagne/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#27C93F]/10 blur-3xl rounded-full" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-obsidian/5 dark:border-darkText/5 pb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-champagne animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-widest text-slate dark:text-darkText/50 font-bold">Live ATS Scan</span>
                </div>
                <span className="font-mono text-[10px] text-obsidian/40 dark:text-darkText/30">ID: a7x-992-bf</span>
            </div>

            {/* Content Split: Left (Gauge) & Right (Word Cloud) */}
            <div className="flex flex-row items-center gap-6 relative z-10">

                {/* 1. The Gauge */}
                <div className="flex-shrink-0 relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background Track */}
                        <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-obsidian/5 dark:text-darkText/5"
                        />
                        {/* Animated Progress */}
                        <motion.circle
                            initial={{ strokeDashoffset: circumference }}
                            animate={isInView ? { strokeDashoffset } : { strokeDashoffset: circumference }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            cx="64"
                            cy="64"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeLinecap="round"
                            className="text-champagne drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                        />
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="text-3xl font-sans font-bold text-obsidian dark:text-darkText leading-none"
                        >
                            85
                        </motion.span>
                        <span className="text-[10px] font-sans text-slate dark:text-darkText/50 font-medium">/100</span>
                    </div>
                </div>

                {/* 2. The Word Cloud (Semantic Matching) */}
                <motion.div
                    className="flex-1 flex flex-wrap gap-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {dummySkills.map((skill, i) => (
                        <div key={i} className="relative">
                            {/* Base State (Dim) */}
                            <span className="font-mono text-xs text-slate dark:text-darkText/30 px-2 py-1 relative block">
                                {skill.word}
                            </span>

                            {/* Match State (Highlighted overlay) */}
                            {skill.match && (
                                <motion.span
                                    variants={wordVariants}
                                    className="font-mono text-xs font-bold text-champagne bg-champagne/10 border border-champagne/30 px-2 py-1 rounded absolute inset-0 whitespace-nowrap drop-shadow-[0_0_4px_rgba(212,175,55,0.3)]"
                                >
                                    {skill.word}
                                </motion.span>
                            )}
                        </div>
                    ))}
                </motion.div>

            </div>

            {/* Footer Console Log */}
            <div className="pt-2">
                <div className="bg-obsidian/5 dark:bg-black/40 rounded border border-obsidian/10 dark:border-white/5 p-2 font-mono text-[9px] text-[#27C93F] opacity-80">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ delay: 2.2 }}
                        className="flex gap-2 items-center"
                    >
                        <span>&gt;</span>
                        <span>overlap_identified: generating_custom_cover_letter...</span>
                        <span className="w-1 h-3 bg-[#27C93F] animate-pulse inline-block ml-1" />
                    </motion.div>
                </div>
            </div>

        </div>
    );
};
// ------------------------------

const Landing = ({ onNavigate }) => {
    const landingRef = useRef(null);
    const scrollTrackRef = useRef(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const { scrollYProgress } = useScroll({
        target: scrollTrackRef,
        offset: ["start start", "end start"]
    });

    // The Physics: Map scrollYProgress to exactly hit 0.60 at 0.175
    const heroOpacity = useTransform(scrollYProgress, [0, 0.175, 0.5], [1, 0.60, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.175, 0.5], [1, 0.96, 0.9]);
    const heroY = useTransform(scrollYProgress, [0, 0.175, 0.5], [0, 15, 50]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero entrance
            gsap.from('.hero-title', { opacity: 0, y: 30, duration: 1, ease: 'power3.out', delay: 0.2 });
            gsap.from('.hero-sub', { opacity: 0, y: 20, duration: 1, ease: 'power3.out', delay: 0.4 });
            gsap.from('.hero-cta', { opacity: 0, scale: 0.9, duration: 0.8, ease: 'back.out(1.7)', delay: 0.6 });

            // Stats entrance
            gsap.from('.stat-item', { opacity: 0, y: 20, duration: 0.8, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: '.stats-grid', start: 'top 80%' } });
        }, landingRef);
        return () => ctx.revert();
    }, []);

    const scrollToPricing = () => {
        gsap.to(window, { duration: 1, scrollTo: "#pricing", ease: "power3.inOut" });
    };

    return (
        <div ref={landingRef} className="bg-background text-obsidian dark:bg-darkBg dark:text-darkText font-sans selection:bg-champagne selection:text-obsidian">

            {/* ═══ NAVBAR ═══ */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/80 dark:bg-darkBg/80 backdrop-blur-xl border-b border-obsidian/5 dark:border-darkText/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
                        <img src="/logo.png" alt="CareerSync Logo" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-bold tracking-tightest">Career<span className="font-drama italic font-normal text-champagne">Sync.</span></span>
                    </div>

                    {/* Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {/* Stripped for minimum friction navigation */}
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => onNavigate('auth')}
                        className="px-6 py-2.5 bg-obsidian dark:bg-darkText text-background dark:text-darkBg rounded-full text-sm font-bold shadow-lg transition-transform flex items-center gap-2 active:scale-[0.98] btn-shine group"
                    >
                        <span className="group-hover:translate-x-1 transition-transform duration-300 ease-physical">Sign In</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 ease-physical" />
                    </button>
                </div>
            </nav>

            {/* ═══ SCROLL TRACK (HERO + SIMULATION) ═══ */}
            <div ref={scrollTrackRef} className="relative w-full">
                {/* ═══ SINKING HERO SECTION (Updated to Two-Column) ═══ */}
                <motion.section
                    className="sticky top-0 h-screen w-full flex flex-col justify-center px-6 overflow-hidden"
                    style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                >
                    {/* Background Blobs */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full -z-10 opacity-30 dark:opacity-20 blur-[120px]">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-champagne rounded-full" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate rounded-full" />
                    </div>

                    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 relative items-center mt-32 md:mt-24">

                        {/* Left Column: Hero Text & CTAs */}
                        <div className="text-left lg:text-left flex flex-col items-start pt-10">
                            <h1 className="hero-title text-5xl md:text-7xl font-bold tracking-tightest leading-[0.9] mb-8 text-obsidian dark:text-darkText max-w-2xl">
                                Turn Your Past Experience <br className="hidden md:block" />
                                <span className="font-drama italic text-champagne font-normal">Into Your Next Offer</span>
                            </h1>

                            <p className="hero-sub text-lg md:text-xl text-slate dark:text-darkText/60 max-w-xl mb-12 leading-relaxed min-h-[6rem] flex items-start text-left">
                                <SmartTypewriterText
                                    text={`Shifting careers is terrifying when your resume doesn't match the title. Our AI maps your hidden "Transferable Bridge," automatically writing a cover letter that proves you belong in the room.`}
                                    typeSpeed={9}
                                />
                            </p>

                            <div className="hero-cta flex flex-col sm:flex-row items-center justify-start gap-4 w-full md:w-auto">
                                <div className="w-full sm:w-64 h-16">
                                    <SlideInButton
                                        onClick={() => onNavigate('auth')}
                                        text="Run Analysis"
                                        className="w-full h-full text-lg"
                                    />
                                </div>
                                <button
                                    onClick={scrollToPricing}
                                    className="w-full sm:w-auto px-8 py-4 bg-surface dark:bg-darkCard text-obsidian dark:text-darkText rounded-2xl text-lg font-bold hover:brightness-105 transition-all border border-obsidian/10 dark:border-darkText/10 active:scale-[0.98] btn-shine"
                                >
                                    View Plans
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Sticky ATS Scanner Card */}
                        <div className="sticky top-24 self-start hidden lg:flex items-center justify-center pt-10">
                            <ATSScanner />
                        </div>

                    </div>
                </motion.section>

                {/* ═══ PRODUCT SIMULATION (Overlaps the sinking hero) ═══ */}
                <section className="relative z-10 w-full mt-[35vh] pb-10">
                    <Simulation />
                </section>
            </div>

            {/* ═══ TECH STACK RIBBON (INFINITE MARQUEE) ═══ */}
            <section className="py-6 border-y border-obsidian/5 dark:border-darkText/5">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate/40 dark:text-darkText/30 mb-12 italic">
                        The ultimate analytical companion for career growth
                    </p>

                    {/* The Constrained Container (Fade Mask) */}
                    <div
                        className="relative w-full md:w-[65%] mx-auto overflow-hidden"
                        style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}
                    >
                        {/* The Infinite Track */}
                        <div className="flex w-max items-center animate-marquee hover:[animation-play-state:paused] transition-all">

                            {/* SET 1 */}
                            <div className="flex items-center gap-16 md:gap-24 px-8 md:px-12">
                                {/* GitHub */}
                                <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform opacity-50 grayscale hover:opacity-100 hover:grayscale-0 duration-300">
                                    <img src="/github-icon.svg" alt="GitHub" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                                </div>

                                {/* Supabase */}
                                <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform opacity-50 grayscale hover:opacity-100 hover:grayscale-0 duration-300">
                                    <img src="/supabase-logo.svg" alt="Supabase" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                                </div>

                                {/* Google Cloud */}
                                <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform opacity-50 grayscale hover:opacity-100 hover:grayscale-0 duration-300">
                                    <img src="/google-cloud-logo.svg" alt="Google Cloud" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                                </div>

                                {/* Vercel */}
                                <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform opacity-50 grayscale hover:opacity-100 hover:grayscale-0 duration-300">
                                    <img src="/vercel-logo.svg" alt="Vercel" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                                </div>

                                {/* Antigravity */}
                                <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform opacity-50 grayscale hover:opacity-100 hover:grayscale-0 duration-300">
                                    <img src="/antigravity-logo.svg" alt="Antigravity" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                                </div>

                                {/* Gemini AI */}
                                <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform opacity-50 grayscale hover:opacity-100 hover:grayscale-0 duration-300">
                                    <img src="/gemini-logo.png" alt="Gemini AI" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                                </div>
                            </div>

                            {/* SET 2 (Identical Duplicate for Seamless Loop) */}
                            <div className="flex items-center gap-16 md:gap-24 px-8 md:px-12">
                                {/* GitHub */}
                                <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform opacity-50 grayscale hover:opacity-100 hover:grayscale-0 duration-300">
                                    <img src="/github-icon.svg" alt="GitHub" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                                </div>

                                {/* Supabase */}
                                <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform opacity-50 grayscale hover:opacity-100 hover:grayscale-0 duration-300">
                                    <img src="/supabase-logo.svg" alt="Supabase" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                                </div>

                                {/* Google Cloud */}
                                <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform opacity-50 grayscale hover:opacity-100 hover:grayscale-0 duration-300">
                                    <img src="/google-cloud-logo.svg" alt="Google Cloud" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                                </div>

                                {/* Vercel */}
                                <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform opacity-50 grayscale hover:opacity-100 hover:grayscale-0 duration-300">
                                    <img src="/vercel-logo.svg" alt="Vercel" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                                </div>

                                {/* Antigravity */}
                                <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform opacity-50 grayscale hover:opacity-100 hover:grayscale-0 duration-300">
                                    <img src="/antigravity-logo.svg" alt="Antigravity" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                                </div>

                                {/* Gemini AI */}
                                <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform opacity-50 grayscale hover:opacity-100 hover:grayscale-0 duration-300">
                                    <img src="/gemini-logo.png" alt="Gemini AI" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ BENTO BOX FEATURES ═══ */}
            <section className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-sans font-bold text-obsidian dark:text-darkText tracking-tight">
                            Engineered for the <span className="font-drama italic text-champagne font-normal">Modern Pivot</span>
                        </h2>
                        <p className="font-sans text-slate text-lg mt-4">
                            A suite of hyper-focused tools designed to decode ATS requirements and translate your unique trajectory.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[300px]">

                        {/* 1. The Deep Analysis (Hero Card - Largest) */}
                        <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-surface dark:bg-darkCard rounded-3xl p-8 border border-obsidian/5 dark:border-darkText/5 overflow-hidden relative group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">

                            {/* Visual Engine: Faint CSS-drawn animated radar/spider chart in background */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10 group-hover:opacity-30 transition-opacity duration-700">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] animate-spin-slow">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-champagne/40"
                                            style={{
                                                width: `${i * 100}px`,
                                                height: `${i * 100}px`,
                                                borderRadius: i % 2 === 0 ? '40% 60% 70% 30% / 40% 50% 60% 40%' : '50%',
                                                borderStyle: i === 4 ? 'dashed' : 'solid'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-br from-champagne/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <span className="font-mono text-xs uppercase tracking-widest text-champagne font-bold bg-champagne/10 px-3 py-1 rounded-full w-fit border border-champagne/20">Apex ATS Engine v2.0</span>
                                        <h3 className="text-3xl md:text-5xl font-bold font-sans text-obsidian dark:text-darkText leading-[0.9] tracking-tight">
                                            Multi-Dimensional <span className="font-drama italic text-champagne font-normal">Trajectory</span> Scoring
                                        </h3>
                                    </div>

                                    {/* Data Injections */}
                                    <div className="space-y-6">
                                        {/* Core Bullets */}
                                        <ul className="grid md:grid-cols-3 gap-4 font-sans text-sm font-bold text-obsidian dark:text-darkText">
                                            <li className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#27C93F]" />
                                                <span>Baseline Keyword Match</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-champagne" />
                                                <span>Transferable Skill Mapping</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                                                <span>Potential Projection</span>
                                            </li>
                                        </ul>

                                        {/* Technical Detailed Specs */}
                                        <div className="grid md:grid-cols-2 gap-x-12 gap-y-2 border-t border-obsidian/5 dark:border-darkText/5 pt-6">
                                            {[
                                                "Multi-format document parsing from PDF, DOCX, and TXT files",
                                                "Tone-calibrated AI cover letter generation",
                                                "ATS resume analysis powered by Google Gemini",
                                                "Secure PostgreSQL database with Row-Level Security (RLS)",
                                                "Raw text extraction using pdf-parse",
                                                "AI analysis report export to PDF via jsPDF 4 and html2canvas"
                                            ].map((spec, idx) => (
                                                <div key={idx} className="flex gap-2 text-[11px] leading-snug text-slate dark:text-darkText/50">
                                                    <span className="text-champagne font-mono opacity-40">0{idx + 1}</span>
                                                    <span>{spec}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <span className="font-mono text-[9px] text-slate/40 dark:text-darkText/30 uppercase tracking-[0.2em]">
                                        Engine: @supabase/supabase-js ^2.97 | RLS Secured
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Premium Access. Zero Abono. */}
                        <div className="md:col-span-2 lg:col-span-2 row-span-1 bg-obsidian dark:bg-[#111] text-white rounded-3xl p-8 border border-champagne/20 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row gap-8 items-center">

                            {/* Visual Engine: Data Flow Background with pulsing nodes */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none">
                                <div className="grid grid-cols-12 grid-rows-6 h-full w-full">
                                    {[...Array(72)].map((_, i) => (
                                        <div key={i} className="border-[0.5px] border-champagne/10 relative">
                                            {(i === 14 || i === 21 || i === 7 || i === 28 || i === 45 || i === 52) && (
                                                <div className="absolute inset-0 bg-champagne/30 shimmer" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative z-10 flex-1">
                                <h3 className="text-2xl font-bold font-sans text-white mb-2 tracking-tight">
                                    Premium Access. <span className="font-drama italic text-champagne font-normal">Zero Abono.</span>
                                </h3>
                                <p className="font-sans text-xs text-slate-300 leading-relaxed max-w-xs">
                                    No massive USD subscription commitments. Pay precisely for the analysis you need using GCash.
                                </p>
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col items-end gap-6 w-full">
                                {/* GCash Only UI */}
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl w-fit group-hover:border-champagne/50 transition-colors self-center md:self-end">
                                    <div className="w-10 h-10 rounded-xl bg-[#0056B3] flex items-center justify-center font-bold text-xs">G</div>
                                    <div className="flex flex-col">
                                        <span className="text-xs uppercase font-bold tracking-tighter text-white">GCash Integrated</span>
                                        <span className="text-[10px] text-white/40">Secure PH Gateway</span>
                                    </div>
                                </div>

                                {/* Terminal Style Injection */}
                                <div className="flex flex-col items-end font-mono text-[9px] text-[#27C93F] opacity-70">
                                    <span>&gt; api/initiate-payment.js</span>
                                    <span>&gt; EMVCo QR generated</span>
                                    <span>&gt; Webhook active</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Tone-Calibrated Drafting */}
                        <div className="md:col-span-2 lg:col-span-2 row-span-1 bg-surface dark:bg-darkCard rounded-3xl p-8 border border-obsidian/5 dark:border-darkText/5 relative overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-8">
                            <div className="absolute inset-0 bg-gradient-to-t from-darkBg/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10 flex-1 flex flex-col justify-center">
                                <h3 className="text-2xl font-bold font-sans text-obsidian dark:text-darkText mb-3 tracking-tight">
                                    Tone-Calibrated <span className="font-drama italic text-champagne font-normal">Drafting</span>
                                </h3>
                                <p className="font-sans text-sm text-slate leading-relaxed max-w-sm">
                                    Ditch generic AI intros. Our system forces a high-impact value proposition tailored to your exact industry dialect.
                                </p>
                            </div>

                            {/* Visual Engine: Native CSS Mock Terminal Window (Mac-style) */}
                            <div className="relative z-10 flex-1 flex flex-col justify-center">
                                <div className="bg-obsidian dark:bg-black rounded-t-lg border-x border-t border-white/10 p-2.5 flex gap-1.5 Items-center">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                                    <span className="font-mono text-[9px] text-white/20 ml-3 uppercase tracking-widest">zsh — 80x24</span>
                                </div>
                                <div className="bg-obsidian/95 dark:bg-black/95 border border-white/10 p-5 h-40 font-mono text-[10px] text-[#27C93F] relative overflow-hidden shadow-2xl">
                                    <div className="space-y-1">
                                        <div className="flex gap-2">
                                            <span className="text-white/40">$</span>
                                            <SmartTypewriterText text="POST /api/analyze" />
                                        </div>
                                        <div className="text-white/60">&gt; initializing @google/generative-ai (Apex-ATS v2.0)</div>
                                        <div className="text-white/60">&gt; ingesting user_resume.pdf</div>
                                        <div className="text-white/60">&gt; extracting target_industry_dialect...</div>
                                        <div>&gt; status: 200 OK</div>
                                        <div className="text-champagne">&gt; sys.out: Cover letter tone successfully calibrated.</div>
                                    </div>

                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]" />
                                </div>
                            </div>
                        </div>



                        {/* 4. Semantic Skill Matching */}
                        <div className="md:col-span-2 lg:col-span-2 row-span-1 bg-obsidian dark:bg-[#111] text-white rounded-3xl p-8 border border-champagne/20 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            {/* Visual Engine: Neural Processing Wireframe */}
                            <div className="absolute inset-0 pointer-events-none opacity-30">
                                <div className="flex justify-between h-full px-12 py-8">
                                    <div className="w-px h-full bg-gradient-to-b from-transparent via-champagne/40 to-transparent relative">
                                        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-champagne animate-pulse" />
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-champagne animate-pulse delay-700" />
                                        <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-champagne animate-pulse delay-1000" />
                                    </div>
                                    <div className="w-px h-full bg-gradient-to-b from-transparent via-champagne/40 to-transparent relative">
                                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-champagne animate-pulse delay-300" />
                                        <div className="absolute top-2/3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-champagne animate-pulse delay-500" />
                                    </div>
                                </div>
                                {/* Connecting Shimmer Line */}
                                <div className="absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-champagne/20 overflow-hidden">
                                    <div className="absolute inset-0 shimmer opacity-50" />
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
                                <div className="flex-1">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#27C93F] mb-3 block font-bold">Vector Comparison</span>
                                    <h3 className="text-2xl font-bold font-sans text-white mb-2 tracking-tight">
                                        Semantic <span className="font-drama italic text-champagne font-normal">Skill Matching</span>
                                    </h3>
                                    <p className="font-sans text-[13px] text-slate-300 leading-relaxed max-w-sm">
                                        Our AI engine cross-references your resume against the target job description to uncover hidden, high-value transferable skills.
                                    </p>
                                </div>

                                {/* Data Injection: Backend Process Log */}
                                <div className="flex-1 w-full bg-black/40 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
                                    <div className="font-mono text-[10px] text-slate-400 space-y-1.5">
                                        <div className="flex gap-2"><span>&gt;</span> <span>parsing_user_resume...</span></div>
                                        <div className="flex gap-2"><span>&gt;</span> <span>extracting_jd_requirements...</span></div>
                                        <div className="flex gap-2"><span>&gt;</span> <span className="animate-pulse">mapping_transferable_skills()</span></div>
                                        <div className="flex gap-2 text-champagne pt-2 border-t border-white/5">
                                            <span>&gt;</span> <span className="font-bold">sys.out: OVERLAP_IDENTIFIED</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Export Ready */}
                        <div className="md:col-span-1 lg:col-span-1 row-span-1 bg-surface dark:bg-darkCard rounded-3xl p-6 border border-obsidian/5 dark:border-darkText/5 flex flex-col h-full justify-between relative group hover:shadow-xl transition-all duration-300">
                            <div className="relative z-10 text-left">
                                <h3 className="text-2xl font-bold font-sans text-obsidian dark:text-darkText leading-tight tracking-tight">
                                    Export <span className="font-drama italic text-champagne font-normal">Ready.</span>
                                </h3>
                            </div>

                            {/* Visual Engine: Centered Document Wireframe */}
                            <div className="relative z-10 flex-grow flex items-center justify-center py-4">
                                <div className="w-20 h-28 bg-white dark:bg-[#1a1a1a] border border-obsidian/10 dark:border-darkText/10 rounded shadow-sm p-3 flex flex-col gap-2 group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                                    {/* Mock Document Header */}
                                    <div className="w-1/2 h-1.5 bg-slate/20 dark:bg-darkText/20 rounded-full mb-1" />

                                    {/* Skeleton Loading Lines with Shimmer */}
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className="w-full h-1 rounded-full bg-slate/5 dark:bg-darkText/5 relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 shimmer opacity-10" style={{ animationDelay: `${i * 0.15}s` }} />
                                        </div>
                                    ))}

                                    {/* Gold Accent Seal */}
                                    <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-champagne/20 border border-champagne" />
                                </div>
                            </div>

                            {/* Data Injection: Raw Terminal Footer */}
                            <div className="relative z-10 pt-4 border-t border-obsidian/5 dark:border-darkText/5">
                                <span className="font-mono text-[9px] text-slate/60 dark:text-darkText/40 uppercase tracking-[0.2em] block text-center">
                                    MODULE: jsPDF 4 + html2canvas | 100% PORTABLE
                                </span>
                            </div>
                        </div>

                        {/* 6. Execution Flow */}
                        <div className="md:col-span-1 lg:col-span-1 row-span-1 bg-surface dark:bg-darkCard rounded-3xl p-8 border border-obsidian/5 dark:border-darkText/5 overflow-hidden relative group hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-champagne mb-6 block font-bold">Execution Flow</span>

                            <motion.ul
                                className="flex flex-col gap-6"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={{
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.2
                                        }
                                    }
                                }}
                            >
                                {[
                                    { icon: <Upload size={18} />, text: "1. Upload Resume & JD" },
                                    { icon: <Settings size={18} className="animate-spin-slow" />, text: "2. Engine Extracts Skills" },
                                    { icon: <FileDown size={18} />, text: "3. Export Analysis PDF" }
                                ].map((step, i) => (
                                    <motion.li
                                        key={i}
                                        variants={{
                                            hidden: { opacity: 0, x: -20 },
                                            visible: { opacity: 1, x: 0 }
                                        }}
                                        className="flex items-center gap-4 group/item"
                                    >
                                        <div className="border border-slate-200 dark:border-slate-800 rounded-full p-3 bg-surface dark:bg-darkCard group-hover/item:border-champagne/50 transition-colors">
                                            {step.icon}
                                        </div>
                                        <span className="font-sans text-sm text-obsidian dark:text-darkText font-medium">
                                            {step.text}
                                        </span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══ ORBITAL TRANSFERABLE BRIDGE ═══ */}
            <TransferableBridge />

            {/* ═══ PRICING SECTION ═══ */}
            <section id="pricing" className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tightest text-obsidian dark:text-darkText mb-6 leading-none">
                            Predictable pricing,<br />
                            <span className="font-drama italic text-champagne font-normal">designed to scale</span>
                        </h2>
                        <p className="text-lg text-slate dark:text-darkText/60 max-w-xl mx-auto">
                            Get started with Base tokens and upgrade as you grow. Flexible plans for every career stage.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">

                        {/* BASE TIER */}
                        <div className="bg-white dark:bg-darkCard border border-obsidian/5 dark:border-darkText/5 rounded-[2.5rem] p-8 flex flex-col hover:shadow-xl transition-shadow relative overflow-hidden">
                            <div className="mb-6">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate/50 dark:text-darkText/50 mb-3">PAY-AS-YOU-GO</p>
                                <h3 className="text-2xl font-bold mb-1 text-obsidian dark:text-darkText">Base Token</h3>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline mb-1">
                                    <span className="text-xl font-bold text-obsidian dark:text-darkText mr-1">₱</span>
                                    <span className="text-7xl font-sans font-black text-obsidian dark:text-darkText tracking-tighter">1</span>
                                    <span className="text-sm text-slate dark:text-darkText/50 ml-2 font-bold">/ top-up</span>
                                </div>
                                <p className="text-xs text-slate/60 dark:text-darkText/40">~₱1.XX unique amount per session</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-sm text-obsidian/80 dark:text-darkText/90">
                                    <Check className="w-4 h-4 text-obsidian/60 dark:text-darkText/60 shrink-0" />
                                    <span><strong>10 credits</strong> — expires daily</span>
                                </li>
                                <li className="flex gap-3 text-sm text-obsidian/80 dark:text-darkText/90">
                                    <Check className="w-4 h-4 text-obsidian/60 dark:text-darkText/60 shrink-0" />
                                    <span>Basic analysis & cover letter</span>
                                </li>
                                <li className="flex gap-3 text-sm text-obsidian/80 dark:text-darkText/90">
                                    <Check className="w-4 h-4 text-obsidian/60 dark:text-darkText/60 shrink-0" />
                                    <span><strong>No lock-in</strong> — buy anytime</span>
                                </li>
                                <li className="flex items-start gap-3 mt-4 opacity-40 grayscale">
                                    <X className="w-4 h-4 text-slate shrink-0" />
                                    <span className="text-slate text-sm">No premium credits</span>
                                </li>
                                <li className="flex items-start gap-3 mt-1 opacity-40 grayscale">
                                    <X className="w-4 h-4 text-slate shrink-0" />
                                    <span className="text-slate text-sm">No Advanced Parsing (Paste Listing)</span>
                                </li>
                                <li className="flex items-start gap-3 mt-1 opacity-40 grayscale">
                                    <X className="w-4 h-4 text-slate shrink-0" />
                                    <span className="text-slate text-sm">No PDF export</span>
                                </li>
                                <li className="flex items-start gap-3 mt-1 opacity-40 grayscale">
                                    <X className="w-4 h-4 text-slate shrink-0" />
                                    <span className="text-slate text-sm">No resume optimization</span>
                                </li>
                            </ul>
                        </div>

                        {/* PREMIUM TIER (Featured) */}
                        <div className="relative bg-[#fffdf9] dark:bg-[#1a1713] border-[3px] border-champagne rounded-[2.5rem] p-10 md:py-16 flex flex-col shadow-2xl shadow-champagne/30 scale-100 lg:scale-110 z-10 -my-4 lg:-my-8 text-center order-first md:order-none">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-champagne/10 to-transparent rounded-[2.5rem] pointer-events-none"></div>

                            <div className="mb-6 mt-2 relative z-10">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-champagne/80 mb-3">BEST VALUE</p>
                                <h3 className="text-3xl font-bold mb-1 text-champagne">Premium</h3>
                            </div>

                            <div className="mb-8 relative z-10">
                                <div className="flex justify-center flex-col items-center mb-1">
                                    <div className="flex items-baseline justify-center">
                                        <span className="text-3xl font-bold text-obsidian dark:text-darkText mr-2">₱</span>
                                        <span className="text-[120px] leading-[0.8] font-sans font-black text-obsidian dark:text-darkText tracking-tighter">3</span>
                                        <span className="text-lg font-bold text-obsidian dark:text-darkText ml-3">/ month</span>
                                    </div>
                                    <span className="text-xs text-slate/80 dark:text-darkText/60 mt-4">~₱3.XX unique amount per session</span>
                                </div>
                            </div>

                            <ul className="space-y-5 mb-8 flex-1 text-left relative z-10 px-0 md:px-4">
                                <li className="flex gap-3 text-sm text-obsidian/90 dark:text-darkText/90">
                                    <CheckCircle2 className="w-5 h-5 text-champagne shrink-0" />
                                    <span><strong>50 Premium Credits</strong> — refills daily</span>
                                </li>
                                <li className="flex gap-3 text-sm text-obsidian/90 dark:text-darkText/90">
                                    <CheckCircle2 className="w-5 h-5 text-champagne shrink-0" />
                                    <span><strong>Advanced Parsing</strong> (Paste Listing)</span>
                                </li>
                                <li className="flex gap-3 text-sm text-obsidian/90 dark:text-darkText/90">
                                    <CheckCircle2 className="w-5 h-5 text-champagne shrink-0" />
                                    <span><strong>Full PDF Export</strong> capabilities</span>
                                </li>
                                <li className="flex gap-3 text-sm text-obsidian/90 dark:text-darkText/90">
                                    <CheckCircle2 className="w-5 h-5 text-champagne shrink-0" />
                                    <span><strong>Resume Optimization</strong> surgery</span>
                                </li>
                                <li className="flex gap-3 text-sm text-obsidian/90 dark:text-darkText/90">
                                    <CheckCircle2 className="w-5 h-5 text-champagne shrink-0" />
                                    <span>Unlimited History View</span>
                                </li>
                                <li className="flex gap-3 text-sm text-obsidian/90 dark:text-darkText/90">
                                    <CheckCircle2 className="w-5 h-5 text-champagne shrink-0" />
                                    <span><strong>30-Day Plan Lock</strong> — stable access period</span>
                                </li>
                            </ul>
                        </div>

                        {/* STANDARD TIER */}
                        <div className="bg-white dark:bg-darkCard border border-obsidian/5 dark:border-darkText/5 rounded-[2.5rem] p-8 flex flex-col hover:shadow-xl transition-shadow relative overflow-hidden">
                            <div className="mb-6">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate/50 dark:text-darkText/50 mb-3">MONTHLY RETAINER</p>
                                <h3 className="text-2xl font-bold mb-1 text-obsidian dark:text-darkText">Standard</h3>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline mb-1">
                                    <span className="text-xl font-bold text-obsidian dark:text-darkText mr-1">₱</span>
                                    <span className="text-7xl font-sans font-black text-obsidian dark:text-darkText tracking-tighter">2</span>
                                    <span className="text-sm text-slate dark:text-darkText/50 ml-2 font-bold">/ month</span>
                                </div>
                                <p className="text-xs text-slate/60 dark:text-darkText/40">~₱2.XX unique amount per session</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-sm text-obsidian/80 dark:text-darkText/90">
                                    <CheckCircle2 className="w-4 h-4 text-[#3b82f6] shrink-0" />
                                    <span><strong>40 Premium Credits</strong> — refills daily</span>
                                </li>
                                <li className="flex gap-3 text-sm text-obsidian/80 dark:text-darkText/90">
                                    <CheckCircle2 className="w-4 h-4 text-[#3b82f6] shrink-0" />
                                    <span><strong>Advanced Parsing</strong> (Paste Listing)</span>
                                </li>
                                <li className="flex gap-3 text-sm text-obsidian/80 dark:text-darkText/90">
                                    <CheckCircle2 className="w-4 h-4 text-[#3b82f6] shrink-0" />
                                    <span><strong>Full PDF Export</strong> capabilities</span>
                                </li>
                                <li className="flex gap-3 text-sm text-obsidian/80 dark:text-darkText/90">
                                    <CheckCircle2 className="w-4 h-4 text-[#3b82f6] shrink-0" />
                                    <span><strong>30-Day Plan Lock</strong> — stable access period</span>
                                </li>
                                <li className="flex items-start gap-3 mt-4 opacity-40 grayscale">
                                    <X className="w-4 h-4 text-slate shrink-0" />
                                    <span className="text-slate text-sm">No resume optimization</span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══ PAS SECTION (CONVERSION FOCUS) ═══ */}
            <PASSection onNavigate={onNavigate} />

            {/* ═══ FAQ SECTION ═══ */}
            <FAQSection onContactClick={() => setIsContactModalOpen(true)} />

            {/* ═══ FOOTER ═══ */}
            <footer className="py-20 px-6 border-t border-obsidian/5 dark:border-darkText/5 bg-surface/20 dark:bg-darkCard/10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="CareerSync Logo" className="w-6 h-6 object-contain" />
                            <span className="text-lg font-bold tracking-tightest">Career<span className="font-drama italic font-normal text-champagne">Sync.</span></span>
                        </div>
                        <p className="text-xs text-slate/60 dark:text-darkText/40">© 2026 CareerSync. All rights reserved.</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <div className="flex items-center gap-6">
                            <SwipeLettersButton
                                label="TERMS OF SERVICE"
                                onClick={() => onNavigate('terms')}
                                showBorder={false}
                                defaultState={{ bgColor: "transparent", borderColor: "transparent", textColor: "var(--tw-colors-slate)" }}
                                hoverState={{ bgColor: "transparent", borderColor: "transparent", textColor: "var(--tw-colors-champagne)" }}
                                paddingX={0}
                                paddingY={0}
                                font={{ fontSize: "12px", variant: "700", letterSpacing: "1.5px", textAlign: "center", textTransform: "uppercase" }}
                            />
                            <SwipeLettersButton
                                label="PRIVACY POLICY"
                                onClick={() => onNavigate('privacy')}
                                showBorder={false}
                                defaultState={{ bgColor: "transparent", borderColor: "transparent", textColor: "var(--tw-colors-slate)" }}
                                hoverState={{ bgColor: "transparent", borderColor: "transparent", textColor: "var(--tw-colors-champagne)" }}
                                paddingX={0}
                                paddingY={0}
                                font={{ fontSize: "12px", variant: "700", letterSpacing: "1.5px", textAlign: "center", textTransform: "uppercase" }}
                            />
                        </div>
                        <a href="https://www.facebook.com/share/16xojXWFCn/" target="_blank" rel="noopener noreferrer" className="text-slate/60 hover:text-[#1877F2] dark:text-darkText/40 dark:hover:text-[#1877F2] transition-colors" title="Follow us on Facebook">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                            </svg>
                        </a>
                    </div>

                </div>
            </footer>

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </div>
    );
};

export default Landing;

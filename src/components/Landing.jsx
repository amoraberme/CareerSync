import React, { useEffect, useState, useRef } from 'react';
import { Check, ArrowRight, Shield, Zap, Target, FileText, CheckCircle2, X } from 'lucide-react';
import gsap from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import { motion, useScroll, useTransform } from 'framer-motion';
import Simulation from './Simulation';
import ContactModal from './ContactModal';
import SlideInButton from './animations/SlideInButton';
import SwipeLettersButton from './animations/SwipeLettersButton';
import SmartTypewriterText from './animations/SmartTypewriterText';
import FAQSection from './animations/FAQSection';

gsap.registerPlugin(ScrollToPlugin);

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
                {/* ═══ SINKING HERO SECTION ═══ */}
                <motion.section
                    className="sticky top-0 h-screen w-full flex flex-col justify-center px-6 overflow-hidden"
                    style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                >
                    {/* Background Blobs */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full -z-10 opacity-30 dark:opacity-20 blur-[120px]">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-champagne rounded-full" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate rounded-full" />
                    </div>

                    <div className="max-w-5xl mx-auto text-center mt-32 md:mt-24">
                        <h1 className="hero-title text-5xl md:text-7xl font-bold tracking-tightest leading-[0.9] mb-8 text-obsidian dark:text-darkText">
                            Turn Your Past Experience <br />
                            <span className="font-drama italic text-champagne font-normal">Into Your Next Offer</span>
                        </h1>

                        <p className="hero-sub text-xl md:text-2xl text-slate dark:text-darkText/60 max-w-2xl mx-auto mb-12 leading-relaxed flex items-center justify-center min-h-[6rem]">
                            <SmartTypewriterText
                                text={`Shifting careers is terrifying when your resume doesn't match the title. Our AI maps your hidden "Transferable Bridge," automatically writing a cover letter that proves you belong in the room.`}
                            />
                        </p>

                        <div className="hero-cta flex flex-col md:flex-row items-center justify-center gap-4">
                            <div className="w-full md:w-64 h-16">
                                <SlideInButton
                                    onClick={() => onNavigate('auth')}
                                    text="Run Analysis"
                                    className="w-full h-full text-lg"
                                />
                            </div>
                            <button
                                onClick={scrollToPricing}
                                className="w-full md:w-auto px-8 py-4 bg-surface dark:bg-darkCard text-obsidian dark:text-darkText rounded-2xl text-lg font-bold hover:brightness-105 transition-all border border-obsidian/10 dark:border-darkText/10 active:scale-[0.98] btn-shine"
                            >
                                View Plans
                            </button>
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
                        <h2 className="font-drama text-4xl md:text-5xl text-obsidian dark:text-darkText font-bold mb-4 tracking-tight">
                            Engineered for the <span className="text-champagne italic">Modern Pivot</span>
                        </h2>
                        <p className="font-sans text-lg text-slate dark:text-darkText/60 max-w-2xl mx-auto">
                            A suite of hyper-focused tools designed to decode ATS requirements and translate your unique trajectory.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[300px]">

                        {/* 1. The Deep Analysis (Hero Card - Largest) */}
                        <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-surface dark:bg-darkCard rounded-3xl p-8 border border-obsidian/5 dark:border-darkText/5 overflow-hidden relative group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col md:flex-row gap-8">

                            <div className="absolute inset-0 bg-gradient-to-br from-champagne/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            {/* Left Content */}
                            <div className="relative z-10 flex-1 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <span className="font-mono text-xs uppercase tracking-widest text-champagne font-bold bg-champagne/10 px-3 py-1 rounded-full w-fit border border-champagne/20">Apex ATS Engine v2.0</span>
                                    <h3 className="font-drama text-3xl md:text-4xl font-bold text-obsidian dark:text-darkText leading-tight">Multi-Dimensional <br />Trajectory Scoring</h3>

                                    <ul className="mt-8 space-y-3 font-sans text-sm text-slate dark:text-darkText/70">
                                        <li className="flex items-center gap-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#27C93F]" />
                                            <span>Baseline Keyword Match</span>
                                        </li>
                                        <li className="flex items-center gap-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-200">
                                            <div className="w-1.5 h-1.5 rounded-full bg-champagne" />
                                            <span>Transferable Skill Mapping</span>
                                        </li>
                                        <li className="flex items-center gap-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                                            <span>Ultimate Potential Projection</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right Content: Radar Chart Micro-Animation */}
                            <div className="relative z-10 flex-1 flex items-center justify-center min-h-[200px]">
                                <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px] text-obsidian/10 dark:text-darkText/20 overflow-visible">
                                    {/* Outer Webs */}
                                    <polygon points="100,10 186.6,60 186.6,140 100,190 13.4,140 13.4,60" fill="none" stroke="currentColor" strokeWidth="1" />
                                    <polygon points="100,30 169.3,70 169.3,130 100,170 30.7,130 30.7,70" fill="none" stroke="currentColor" strokeWidth="1" />
                                    <polygon points="100,50 151.9,80 151.9,120 100,150 48.1,120 48.1,80" fill="none" stroke="currentColor" strokeWidth="1" />
                                    {/* Web Lines */}
                                    <line x1="100" y1="100" x2="100" y2="10" stroke="currentColor" strokeWidth="1" />
                                    <line x1="100" y1="100" x2="186.6" y2="60" stroke="currentColor" strokeWidth="1" />
                                    <line x1="100" y1="100" x2="186.6" y2="140" stroke="currentColor" strokeWidth="1" />
                                    <line x1="100" y1="100" x2="100" y2="190" stroke="currentColor" strokeWidth="1" />
                                    <line x1="100" y1="100" x2="13.4" y2="140" stroke="currentColor" strokeWidth="1" />
                                    <line x1="100" y1="100" x2="13.4" y2="60" stroke="currentColor" strokeWidth="1" />

                                    {/* Inner Animated Polygon (Breathing Radar) */}
                                    <g className="origin-center animate-pulse-slow">
                                        <polygon points="100,40 160,85 140,140 80,160 30,100 45,55" fill="currentColor" className="text-champagne/20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                        {/* Data Nodes */}
                                        <circle cx="100" cy="40" r="4" fill="currentColor" className="text-champagne drop-shadow-md" />
                                        <circle cx="160" cy="85" r="4" fill="currentColor" className="text-champagne drop-shadow-md" />
                                        <circle cx="140" cy="140" r="4" fill="currentColor" className="text-champagne drop-shadow-md" />
                                        <circle cx="80" cy="160" r="4" fill="currentColor" className="text-champagne drop-shadow-md" />
                                        <circle cx="30" cy="100" r="4" fill="currentColor" className="text-champagne drop-shadow-md" />
                                        <circle cx="45" cy="55" r="4" fill="currentColor" className="text-champagne drop-shadow-md" />
                                    </g>
                                </svg>
                            </div>
                        </div>

                        {/* 2. The Centavo Value (High-Contrast Feature) */}
                        <div className="md:col-span-1 lg:col-span-2 row-span-1 bg-obsidian dark:bg-[#111] text-white rounded-3xl p-8 border border-champagne/20 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col justify-between">
                            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-champagne/10 rounded-full blur-3xl group-hover:bg-champagne/20 transition-all duration-700 pointer-events-none" />

                            <div className="relative z-10">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-[#27C93F] mb-3 font-bold flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#27C93F] animate-ping" /> Micro-Transactions
                                </span>
                                <h3 className="font-drama text-2xl font-bold mb-2">Premium Access. <br />Zero Abono.</h3>
                                <p className="font-sans text-white/60 text-sm max-w-sm">
                                    No massive USD subscription commitments. Pay precisely for the analysis you need using GCash or PayMongo. Top up ₱50 at a time.
                                </p>
                            </div>

                            {/* Payment Badges Micro-Animation (Metallic Shimmer) */}
                            <div className="relative z-10 flex gap-3 mt-6">
                                {/* GCash Badge */}
                                <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 backdrop-blur-sm group-hover:border-white/20 transition-colors">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer-sweep pointer-events-none" />
                                    <div className="w-4 h-4 rounded-full bg-[#007DFE] flex items-center justify-center text-[8px] font-bold">G</div>
                                    <span className="font-mono text-xs font-bold tracking-wider">GCash</span>
                                </div>

                                {/* PayMongo Badge */}
                                <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 backdrop-blur-sm group-hover:border-white/20 transition-colors">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer-sweep pointer-events-none" style={{ animationDelay: '0.5s' }} />
                                    <div className="w-4 h-4 rounded-full bg-[#1BC673] flex items-center justify-center text-[8px] font-bold">P</div>
                                    <span className="font-mono text-xs font-bold tracking-wider">PayMongo</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Smart Optimization (Medium Card) */}
                        <div className="md:col-span-1 lg:col-span-1 row-span-1 bg-surface dark:bg-darkCard rounded-3xl p-8 border border-obsidian/5 dark:border-darkText/5 relative overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                            <div className="absolute inset-0 bg-gradient-to-t from-darkBg/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10 block mb-6">
                                <h3 className="font-drama text-xl font-bold text-obsidian dark:text-darkText mb-2">Tone-Calibrated Drafting</h3>
                                <p className="font-sans text-sm text-slate dark:text-darkText/60 leading-relaxed">
                                    Ditch generic AI intros. Our system forces a high-impact value proposition tailored to your exact industry dialect.
                                </p>
                            </div>

                            {/* Typewriter Micro-Animation */}
                            <div className="relative z-10 w-full h-32 flex items-end justify-center overflow-hidden">
                                <svg viewBox="0 0 100 100" className="w-24 h-24 text-obsidian/60 dark:text-darkText/60 overflow-visible">
                                    {/* Animated Paper Slidng Up */}
                                    <g className="group-hover:animate-typewriter-up">
                                        <rect x="30" y="20" width="40" height="30" fill="none" stroke="currentColor" strokeWidth="2" rx="1" />
                                        <line x1="35" y1="28" x2="65" y2="28" stroke="currentColor" strokeWidth="1.5" />
                                        <line x1="35" y1="36" x2="60" y2="36" stroke="currentColor" strokeWidth="1.5" />
                                        <line x1="35" y1="44" x2="65" y2="44" stroke="currentColor" strokeWidth="1.5" />
                                    </g>

                                    {/* Typewriter Base */}
                                    <path d="M 20 60 L 80 60 L 90 85 L 10 85 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                    <rect x="25" y="55" width="50" height="5" fill="none" stroke="currentColor" strokeWidth="2" />

                                    {/* Jittery Keys */}
                                    <g className="group-hover:animate-typewriter-jitter">
                                        <circle cx="30" cy="70" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" className="bg-background dark:bg-darkBg" />
                                        <circle cx="40" cy="70" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" className="bg-background dark:bg-darkBg" />
                                        <circle cx="50" cy="70" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" className="bg-background dark:bg-darkBg" />
                                        <circle cx="60" cy="70" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" className="bg-background dark:bg-darkBg" />
                                        <circle cx="70" cy="70" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" className="bg-background dark:bg-darkBg" />

                                        <circle cx="35" cy="78" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
                                        <circle cx="45" cy="78" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
                                        <circle cx="55" cy="78" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
                                        <circle cx="65" cy="78" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
                                    </g>
                                </svg>
                            </div>
                        </div>

                        {/* 4. How It Works (Process Card) */}
                        <div className="md:col-span-2 lg:col-span-1 row-span-1 bg-surface dark:bg-darkCard rounded-3xl p-8 border border-obsidian/5 dark:border-darkText/5 flex flex-col justify-between relative group">
                            <h3 className="font-mono text-xs font-bold tracking-widest text-champagne uppercase mb-6 text-center">Execution Flow</h3>

                            <div className="space-y-6 flex-1 flex flex-col justify-center">
                                {/* Step 1: Upload (Bouncing Arrow) */}
                                <div className="flex items-center gap-4 group/step cursor-default">
                                    <div className="w-10 h-10 rounded-full bg-background dark:bg-darkBg flex items-center justify-center border border-obsidian/10 dark:border-darkText/10 overflow-hidden text-obsidian dark:text-darkText">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/step:animate-icon-bounce">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-sans text-slate dark:text-darkText/80 font-medium">1. Upload Resume & JD</span>
                                </div>

                                {/* Step 2: Processing (Spinning Gear) */}
                                <div className="flex items-center gap-4 group/step cursor-default">
                                    <div className="w-10 h-10 rounded-full bg-background dark:bg-darkBg flex items-center justify-center border border-obsidian/10 dark:border-darkText/10 overflow-hidden text-obsidian dark:text-darkText">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/step:animate-spin-slow">
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-sans text-slate dark:text-darkText/80 font-medium">2. Engine Extracts Skills</span>
                                </div>

                                {/* Step 3: Export (Sliding Paper) */}
                                <div className="flex items-center gap-4 group/step cursor-default">
                                    <div className="w-10 h-10 rounded-full bg-background dark:bg-darkBg flex items-center justify-center border border-obsidian/10 dark:border-darkText/10 overflow-hidden text-obsidian dark:text-darkText relative">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 flex-shrink-0 bg-background dark:bg-darkBg">
                                            <polyline points="6 9 6 2 18 2 18 9" />
                                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                        </svg>
                                        <svg width="12" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute top-[40%] text-obsidian dark:text-darkText group-hover/step:-translate-y-4 transition-transform duration-500 z-0">
                                            <rect x="6" y="14" width="12" height="8" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Transferable Bridge (Bottom Middle-Left) */}
                        <div className="md:col-span-1 lg:col-span-1 row-span-1 bg-surface dark:bg-darkCard rounded-3xl p-8 border border-obsidian/5 dark:border-darkText/5 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-500">
                            <div className="absolute inset-0 bg-gradient-to-t from-champagne/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <h3 className="font-drama text-xl font-bold text-obsidian dark:text-darkText max-w-[150px] relative z-10">
                                Connect The <span className="italic text-champagne">Unseen</span> Dots
                            </h3>

                            {/* Isometric Bridge Micro-Animation */}
                            <div className="relative z-10 w-full h-32 mt-6 flex items-end justify-center">
                                <svg viewBox="0 0 160 100" className="w-full h-full text-obsidian/40 dark:text-darkText/40 overflow-visible">
                                    {/* Pillar A (Floating) */}
                                    <g className="animate-pillar-float" style={{ animationDelay: '0s' }}>
                                        <path d="M 20 60 L 40 50 L 60 60 L 40 70 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                                        <path d="M 20 60 L 20 90 L 40 100 L 40 70 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                                        <path d="M 60 60 L 60 90 L 40 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                                        <text x="40" y="85" fontSize="12" fontFamily="monospace" fill="currentColor" textAnchor="middle" className="text-obsidian dark:text-darkText font-bold">Past</text>
                                    </g>

                                    {/* Pillar B (Floating) */}
                                    <g className="animate-pillar-float" style={{ animationDelay: '2s' }}>
                                        <path d="M 100 60 L 120 50 L 140 60 L 120 70 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                                        <path d="M 100 60 L 100 90 L 120 100 L 120 70 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                                        <path d="M 140 60 L 140 90 L 120 100" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                                        <text x="120" y="85" fontSize="12" fontFamily="monospace" fill="currentColor" textAnchor="middle" className="text-champagne font-bold">Target</text>
                                    </g>

                                    {/* The Bridge Arc */}
                                    <path id="bridge-path" d="M 40 50 Q 80 10 120 50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="opacity-50" />

                                    {/* Animated Data Transfer Dots */}
                                    <g className="group-hover:opacity-100 opacity-50 transition-opacity">
                                        <circle r="3" className="fill-champagne animate-bridge-dot" style={{ offsetPath: "path('M 40 50 Q 80 10 120 50')", animationDelay: '0s' }} />
                                        <circle r="3" className="fill-champagne animate-bridge-dot" style={{ offsetPath: "path('M 40 50 Q 80 10 120 50')", animationDelay: '1s' }} />
                                        <circle r="3" className="fill-champagne animate-bridge-dot" style={{ offsetPath: "path('M 40 50 Q 80 10 120 50')", animationDelay: '2s' }} />
                                    </g>
                                </svg>
                            </div>
                        </div>

                        {/* 6. Skills Matrix (Bottom Middle-Right) */}
                        <div className="md:col-span-2 lg:col-span-2 row-span-1 bg-obsidian dark:bg-[#111] text-white rounded-3xl p-8 border border-champagne/20 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-champagne/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
                                <div className="flex-1">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#27C93F] mb-3 block font-bold">Deep Mapping</span>
                                    <h3 className="font-drama text-2xl font-bold mb-2">3D Skills Matrix</h3>
                                    <p className="font-sans text-white/60 text-sm max-w-sm">
                                        Visualize exactly where your skills overlap across distinct industries before you apply.
                                    </p>
                                </div>

                                {/* 3D Plane Micro-Animation (Grid Draw on Hover) */}
                                <div className="flex-1 w-full flex justify-center mt-4 md:mt-0">
                                    <svg viewBox="0 0 150 100" className="w-full max-w-[200px] h-32 text-champagne/40 overflow-visible">
                                        {/* Axes */}
                                        <g stroke="currentColor" strokeWidth="1" opacity="0.5">
                                            <line x1="75" y1="80" x2="30" y2="50" />
                                            <line x1="75" y1="80" x2="120" y2="50" />
                                            <line x1="75" y1="80" x2="75" y2="10" />
                                        </g>

                                        {/* Grid Lines (Draws outward on hover) */}
                                        <g className="group-hover:animate-grid-draw" stroke="currentColor" strokeWidth="0.5" fill="none">
                                            {/* Plane Lines - Left to Right */}
                                            <path d="M 30 50 L 52.5 65 L 97.5 35 L 75 20 Z" />
                                            <path d="M 52.5 65 L 75 80 L 120 50 L 97.5 35 Z" />
                                            <path d="M 41 57.5 L 86 27.5 M 64 72.5 L 109 42.5 M 41 42.5 L 86 72.5 M 64 27.5 L 109 57.5" strokeDasharray="2 2" />
                                        </g>

                                        {/* Intersection Node */}
                                        <circle cx="75" cy="50" r="3" className="fill-champagne animate-pulse-slow origin-center" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* 7. Calibrated PDF Export (Bottom Right) */}
                        <div className="md:col-span-1 lg:col-span-1 row-span-1 bg-surface dark:bg-darkCard rounded-3xl p-8 border border-obsidian/5 dark:border-darkText/5 flex flex-col justify-between relative group hover:shadow-xl transition-all duration-300">
                            <div className="relative z-10 w-full flex justify-center mb-6">
                                {/* Interactive Resume Document SVG */}
                                <div className="w-24 h-32 bg-white dark:bg-[#1a1a1a] border border-obsidian/10 dark:border-darkText/10 rounded shadow-md p-3 flex flex-col gap-2 group-hover:rotate-3 transition-transform duration-300 relative overflow-hidden">
                                    {/* Mock Document Header */}
                                    <div className="w-1/2 h-2 bg-slate/20 dark:bg-darkText/20 rounded-full mb-1" />

                                    {/* Skeleton Loading Lines */}
                                    <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-slate/10 via-champagne/30 to-slate/10 dark:from-darkText/10 dark:via-champagne/40 dark:to-darkText/10 animate-skeleton-line" />
                                    <div className="w-5/6 h-1.5 rounded-full bg-gradient-to-r from-slate/10 via-champagne/30 to-slate/10 dark:from-darkText/10 dark:via-champagne/40 dark:to-darkText/10 animate-skeleton-line" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-4/6 h-1.5 rounded-full bg-gradient-to-r from-slate/10 via-champagne/30 to-slate/10 dark:from-darkText/10 dark:via-champagne/40 dark:to-darkText/10 animate-skeleton-line" style={{ animationDelay: '0.4s' }} />

                                    <div className="w-full h-1.5 rounded-full bg-slate/10 dark:bg-darkText/10 mt-2" />
                                    <div className="w-full h-1.5 rounded-full bg-slate/10 dark:bg-darkText/10" />

                                    {/* Gold Accent Seal */}
                                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-champagne/30 border border-champagne" />
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="font-drama text-xl font-bold text-obsidian dark:text-darkText leading-tight">Export <br />Ready.</h3>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

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

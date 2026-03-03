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

                            {/* Visual Engine: Faint CSS-drawn animated radar/spider chart in background */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10 group-hover:opacity-30 transition-opacity duration-700">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] animate-spin-slow">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-champagne/40 rounded-full"
                                            style={{
                                                width: `${i * 120}px`,
                                                height: `${i * 120}px`,
                                                borderStyle: i === 3 ? 'dashed' : 'solid'
                                            }}
                                        />
                                    ))}
                                    {[0, 60, 120, 180, 240, 300].map((deg) => (
                                        <div
                                            key={deg}
                                            className="absolute top-1/2 left-1/2 w-full h-[1px] bg-champagne/20 origin-left"
                                            style={{ transform: `rotate(${deg}deg) translateX(0)` }}
                                        />
                                    ))}
                                </div>
                            </div>

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

                                {/* Data Injection: Technical Footer */}
                                <div className="mt-auto pt-8">
                                    <span className="font-mono text-[10px] text-slate/40 dark:text-darkText/30 uppercase tracking-tighter">
                                        Engine: @supabase/supabase-js ^2.97 | RLS Secured
                                    </span>
                                </div>
                            </div>

                            {/* Right Content: Animated Radar (Simplified DOM version) */}
                            <div className="relative z-10 flex-1 flex items-center justify-center min-h-[200px]">
                                <div className="relative w-48 h-48 flex items-center justify-center">
                                    {/* Breathing Outer Ring */}
                                    <div className="absolute inset-0 border border-champagne/30 rounded-full animate-pulse-slow" />
                                    {/* Rotating Scanner Line */}
                                    <div className="absolute inset-0 animate-spin-slow">
                                        <div className="w-1/2 h-full bg-gradient-to-r from-transparent to-champagne/20 origin-right rounded-l-full" />
                                    </div>
                                    {/* Core Node */}
                                    <div className="w-3 h-3 bg-champagne rounded-full shadow-[0_0_15px_rgba(180,140,80,0.5)] z-20" />
                                    {/* Technical Label */}
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[#27C93F] animate-pulse">
                                        LIVE_SCAN_ACTIVE
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. The Centavo Value (High-Contrast Feature) */}
                        <div className="md:col-span-1 lg:col-span-2 row-span-1 bg-obsidian dark:bg-[#111] text-white rounded-3xl p-8 border border-champagne/20 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col justify-between">

                            {/* Visual Engine: Abstract Data Flow Background */}
                            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                <div className="grid grid-cols-8 grid-rows-4 h-full w-full">
                                    {[...Array(32)].map((_, i) => (
                                        <div key={i} className="border-[0.5px] border-champagne/20 relative">
                                            {i % 7 === 0 && (
                                                <div className="absolute inset-0 bg-champagne/40 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

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

                            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                {/* Payment Badges */}
                                <div className="flex gap-3">
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

                                {/* Data Injection: Terminal-style List */}
                                <div className="font-mono text-[9px] text-[#27C93F]/60 space-y-1 bg-black/40 p-3 rounded-lg border border-white/5">
                                    <div className="flex gap-2"><span>&gt;</span> <span className="animate-pulse">api/initiate-payment.js</span></div>
                                    <div className="flex gap-2"><span>&gt;</span> <span>EMVCo QR generated</span></div>
                                    <div className="flex gap-2"><span>&gt;</span> <span>Webhook active</span></div>
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

                            {/* Visual Engine: Native CSS Mock Terminal Window */}
                            <div className="relative z-10 w-full mt-auto">
                                <div className="bg-obsidian dark:bg-black rounded-t-lg border-x border-t border-white/10 p-2 flex gap-1.5 Items-center">
                                    <div className="w-2 h-2 rounded-full bg-destructive/50" />
                                    <div className="w-2 h-2 rounded-full bg-champagne/50" />
                                    <div className="w-2 h-2 rounded-full bg-[#27C93F]/50" />
                                    <span className="font-mono text-[8px] text-white/20 ml-2 uppercase tracking-widest">bash — 80x24</span>
                                </div>
                                <div className="bg-obsidian/95 dark:bg-black/95 border border-white/10 p-4 h-24 font-mono text-[10px] text-[#27C93F] relative overflow-hidden">
                                    <div className="flex gap-2">
                                        <span className="text-white/40 opacity-50">$</span>
                                        <SmartTypewriterText
                                            text="POST /api/analyze -> @google/generative-ai (Apex-ATS v2.0)"
                                        />
                                    </div>
                                    <div className="mt-2 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                                        &gt; [SYSTEM] Tone calibration: EXECUTIVE_PRESENCE<br />
                                        &gt; [SYSTEM] Payload analysis complete.
                                    </div>
                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]" />
                                </div>
                            </div>
                        </div>



                        {/* 4. Connect The Unseen Dots (3D Skills Matrix) */}
                        <div className="md:col-span-2 lg:col-span-2 row-span-1 bg-obsidian dark:bg-[#111] text-white rounded-3xl p-8 border border-champagne/20 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            {/* Visual Engine: Subtle Isometric Grid Background */}
                            <div className="absolute inset-0 pointer-events-none opacity-20">
                                <div
                                    className="absolute inset-[-100%] border-[0.5px] border-dashed border-champagne/20"
                                    style={{ transform: 'rotateX(60deg) rotateZ(-45deg)', backgroundSize: '30px 30px', backgroundImage: 'linear-gradient(to right, rgba(180,140,80,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(180,140,80,0.1) 1px, transparent 1px)' }}
                                />
                            </div>

                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-champagne/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
                                <div className="flex-1">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#27C93F] mb-3 block font-bold">Deep Mapping</span>
                                    <h3 className="font-drama text-2xl font-bold mb-2">Connect The <span className="italic text-champagne">Unseen</span> Dots</h3>
                                    <p className="font-sans text-white/60 text-sm max-w-sm">
                                        Visualize exactly where your skills overlap across distinct industries before you apply.
                                    </p>
                                </div>

                                {/* 3D Plane Micro-Animation with Data Injections */}
                                <div className="flex-1 w-full flex justify-center mt-4 md:mt-0 relative">
                                    <svg viewBox="0 0 150 100" className="w-full max-w-[200px] h-32 text-champagne/40 overflow-visible">
                                        {/* Axes */}
                                        <g stroke="currentColor" strokeWidth="1" opacity="0.5">
                                            <line x1="75" y1="80" x2="30" y2="50" />
                                            <line x1="75" y1="80" x2="120" y2="50" />
                                            <line x1="75" y1="80" x2="75" y2="10" />
                                        </g>

                                        {/* Grid Lines */}
                                        <g className="group-hover:animate-grid-draw" stroke="currentColor" strokeWidth="0.5" fill="none">
                                            <path d="M 30 50 L 52.5 65 L 97.5 35 L 75 20 Z" />
                                            <path d="M 52.5 65 L 75 80 L 120 50 L 97.5 35 Z" />
                                            <path d="M 41 57.5 L 86 27.5 M 64 72.5 L 109 42.5 M 41 42.5 L 86 72.5 M 64 27.5 L 109 57.5" strokeDasharray="2 2" />
                                        </g>

                                        {/* Intersection Node & Labels */}
                                        <g>
                                            <circle cx="75" cy="50" r="3" className="fill-champagne animate-pulse-slow origin-center" />
                                            <text x="75" y="44" className="text-[10px] uppercase font-sans fill-slate/60 font-bold" textAnchor="middle">Vector Mapping</text>
                                        </g>

                                        <g>
                                            <circle cx="30" cy="50" r="2" className="fill-[#27C93F]" />
                                            <text x="25" y="45" className="text-[8px] uppercase font-sans fill-slate/40" textAnchor="end">Data Ingestion</text>
                                        </g>

                                        <g>
                                            <circle cx="120" cy="50" r="2" className="fill-champagne" />
                                            <text x="125" y="45" className="text-[8px] uppercase font-sans fill-slate/40" textAnchor="start">Overlap Output</text>
                                        </g>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* 5. Export Ready (Bottom Right) */}
                        <div className="md:col-span-1 lg:col-span-1 row-span-1 bg-surface dark:bg-darkCard rounded-3xl p-8 border border-obsidian/5 dark:border-darkText/5 flex flex-col justify-between relative group hover:shadow-xl transition-all duration-300">
                            <div className="relative z-10 w-full flex flex-col items-center mb-6">
                                {/* Visual Engine: Document Wireframe with skeleton-loading */}
                                <div className="w-24 h-32 bg-white dark:bg-[#1a1a1a] border border-obsidian/10 dark:border-darkText/10 rounded shadow-md p-3 flex flex-col gap-2 group-hover:rotate-3 transition-transform duration-300 relative overflow-hidden">
                                    {/* Mock Document Header */}
                                    <div className="w-1/2 h-2 bg-slate/20 dark:bg-darkText/20 rounded-full mb-1" />

                                    {/* Skeleton Loading Lines with Shimmer */}
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="w-full h-1.5 rounded-full bg-slate/5 dark:bg-darkText/5 relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 shimmer opacity-20" style={{ animationDelay: `${i * 0.2}s` }} />
                                        </div>
                                    ))}

                                    <div className="w-full h-1.5 rounded-full bg-slate/10 dark:bg-darkText/10 mt-2" />
                                    <div className="w-full h-1.5 rounded-full bg-slate/10 dark:bg-darkText/10" />

                                    {/* Gold Accent Seal */}
                                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-champagne/30 border border-champagne" />
                                </div>

                                {/* Data Injection: Status Badge */}
                                <div className="mt-4 px-2 py-1 bg-champagne/10 border border-champagne/20 rounded-md">
                                    <span className="font-mono text-[9px] text-champagne font-bold uppercase tracking-tighter">
                                        Module: jsPDF 4 + html2canvas | 100% Portable
                                    </span>
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

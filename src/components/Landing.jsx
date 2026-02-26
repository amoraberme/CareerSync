import React, { useEffect, useRef } from 'react';
import { Check, ArrowRight, Github, ExternalLink, Shield, Zap, Target, FileText } from 'lucide-react';
import gsap from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

const Landing = ({ onNavigate }) => {
    const landingRef = useRef(null);

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
                        <div className="w-8 h-8 bg-obsidian dark:bg-darkText rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-background dark:text-darkBg" />
                        </div>
                        <span className="text-xl font-bold tracking-tightest">CareerSync</span>
                    </div>

                    {/* Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <button onClick={scrollToPricing} className="text-sm font-medium hover:text-champagne transition-colors">Plans</button>
                        <button onClick={() => onNavigate('terms')} className="text-sm font-medium hover:text-champagne transition-colors">Terms</button>
                        <button onClick={() => onNavigate('privacy')} className="text-sm font-medium hover:text-champagne transition-colors">Privacy</button>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => { window.location.href = 'https://career-sync-blush.vercel.app/'; }}
                        className="px-6 py-2.5 bg-obsidian dark:bg-darkText text-background dark:text-darkBg rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </nav>

            {/* ═══ HERO SECTION ═══ */}
            <section className="pt-40 pb-24 px-6 overflow-hidden relative">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full -z-10 opacity-30 dark:opacity-20 blur-[120px]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-champagne rounded-full" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate rounded-full" />
                </div>

                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/10 border border-champagne/20 text-champagne text-[11px] font-bold uppercase tracking-widest mb-8">
                        <Zap className="w-3 h-3 fill-current" />
                        Powered by Google Gemini 2.0 Flash
                    </div>

                    <h1 className="hero-title text-6xl md:text-8xl font-bold tracking-tightest leading-[0.9] mb-8 text-obsidian dark:text-darkText">
                        Build your career <br />
                        <span className="font-drama italic text-champagne font-normal">Scale to the future</span>
                    </h1>

                    <p className="hero-sub text-xl md:text-2xl text-slate dark:text-darkText/60 max-w-2xl mx-auto mb-12 leading-relaxed">
                        The AI-powered career intelligence platform designed for the Philippine market.
                        Instantly score, optimize, and generate materials tailored to your target role.
                    </p>

                    <div className="hero-cta flex flex-col md:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => onNavigate('auth')}
                            className="w-full md:w-auto px-8 py-4 bg-obsidian dark:bg-darkText text-background dark:text-darkBg rounded-2xl text-lg font-bold shadow-2xl hover:brightness-110 transition-all flex items-center justify-center gap-3"
                        >
                            Start your journey
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={scrollToPricing}
                            className="w-full md:w-auto px-8 py-4 bg-surface dark:bg-darkCard text-obsidian dark:text-darkText rounded-2xl text-lg font-bold hover:brightness-105 transition-all border border-obsidian/10 dark:border-darkText/10"
                        >
                            View Plans
                        </button>
                    </div>
                </div>

                {/* Dashboard Preview / Mockup placeholder */}
                <div className="mt-24 max-w-6xl mx-auto rounded-[3rem] border border-obsidian/5 dark:border-darkText/5 p-4 bg-surface/30 dark:bg-darkCard/20 backdrop-blur-md shadow-2xl">
                    <div className="aspect-video bg-white dark:bg-darkBg rounded-[2rem] overflow-hidden flex items-center justify-center relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-champagne/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <FileText className="w-24 h-24 text-obsidian/5 dark:text-darkText/5" />
                        <div className="absolute bottom-12 left-12 p-6 bg-background dark:bg-darkCard rounded-2xl shadow-xl border border-obsidian/5 dark:border-darkText/5 max-w-xs scale-90 md:scale-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-champagne/20 flex items-center justify-center text-champagne font-bold">89</div>
                                <div className="text-sm font-bold">Match Score</div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 w-full bg-obsidian/5 dark:bg-darkText/5 rounded-full" />
                                <div className="h-2 w-[80%] bg-obsidian/5 dark:bg-darkText/5 rounded-full" />
                                <div className="h-2 w-[60%] bg-obsidian/5 dark:bg-darkText/5 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ TRUSTED BY ═══ */}
            <section className="py-20 border-y border-obsidian/5 dark:border-darkText/5">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate/40 dark:text-darkText/30 mb-12 italic">
                        The ultimate analytical companion for career growth
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                        <div className="text-2xl font-black font-drama italic">betashares</div>
                        <div className="text-2xl font-black font-mono">submagic</div>
                        <div className="text-2xl font-black">GitHub</div>
                        <div className="text-2xl font-black font-serif">moz://a</div>
                        <div className="text-2xl font-black opacity-80 italic">1Password</div>
                    </div>
                </div>
            </section>

            {/* ═══ PRICING SECTION ═══ */}
            <section id="pricing" className="py-32 px-6">
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
                        <div className="bg-surface/50 dark:bg-darkCard/20 border border-obsidian/5 dark:border-darkText/5 rounded-[2.5rem] p-8 flex flex-col hover:border-obsidian/10 dark:hover:border-darkText/10 transition-colors">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-1">Base Token</h3>
                                <p className="text-sm text-slate dark:text-darkText/50">Perfect for single job applications.</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-5xl font-bold">₱1</span>
                                <span className="text-slate/60 text-sm ml-2">/ top-up</span>
                            </div>

                            <button onClick={() => onNavigate('auth')} className="w-full py-4 rounded-2xl bg-obsidian dark:bg-darkText text-background dark:text-darkBg font-bold mb-8 transition-transform active:scale-95">
                                Try for FREE
                            </button>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-sm text-slate dark:text-darkText/70">
                                    <Check className="w-4 h-4 text-champagne shrink-0" />
                                    <span><strong>10 credits</strong> — daily expiry</span>
                                </li>
                                <li className="flex gap-3 text-sm text-slate dark:text-darkText/70">
                                    <Check className="w-4 h-4 text-champagne shrink-0" />
                                    <span>AI Match Score & Summary</span>
                                </li>
                                <li className="flex gap-3 text-sm text-slate dark:text-darkText/70">
                                    <Check className="w-4 h-4 text-champagne shrink-0" />
                                    <span>Basic Cover Letter generation</span>
                                </li>
                            </ul>

                            <p className="text-[10px] text-slate/40 text-center uppercase tracking-widest font-bold">Base Analytics Only</p>
                        </div>

                        {/* PREMIUM TIER (Featured) */}
                        <div className="relative bg-white dark:bg-darkCard border-4 border-champagne rounded-[2.5rem] p-8 flex flex-col shadow-2xl shadow-champagne/20 scale-105 z-10">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-champagne text-obsidian px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                Most Popular
                            </div>

                            <div className="mb-8 mt-2">
                                <h3 className="text-xl font-bold mb-1 text-champagne">Premium</h3>
                                <p className="text-sm text-slate dark:text-darkText/50">For serious career growth & surgery.</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-5xl font-bold">₱3</span>
                                <span className="text-slate/60 text-sm ml-2">/ month</span>
                            </div>

                            <button onClick={() => onNavigate('auth')} className="w-full py-4 rounded-2xl bg-champagne text-obsidian font-black mb-8 transition-transform active:scale-95 shadow-xl shadow-champagne/30">
                                Get Started
                            </button>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-sm">
                                    <Check className="w-4 h-4 text-champagne shrink-0" />
                                    <span><strong>Unlimited</strong> Base Tokens</span>
                                </li>
                                <li className="flex gap-3 text-sm">
                                    <Check className="w-4 h-4 text-champagne shrink-0" />
                                    <span><strong>50 Premium Credits</strong> daily refilled</span>
                                </li>
                                <li className="flex gap-3 text-sm">
                                    <Check className="w-4 h-4 text-champagne shrink-0" />
                                    <span><strong>Full PDF Export</strong> capabilities</span>
                                </li>
                                <li className="flex gap-3 text-sm">
                                    <Check className="w-4 h-4 text-champagne shrink-0" />
                                    <span><strong>Resume Optimization</strong> Surgery</span>
                                </li>
                                <li className="flex gap-3 text-sm">
                                    <Check className="w-4 h-4 text-champagne shrink-0" />
                                    <span>Unlimited History View</span>
                                </li>
                            </ul>

                            <p className="text-[10px] text-champagne/60 text-center uppercase tracking-widest font-bold">The Full Career Intelligence Kit</p>
                        </div>

                        {/* STANDARD TIER */}
                        <div className="bg-surface/50 dark:bg-darkCard/20 border border-obsidian/5 dark:border-darkText/5 rounded-[2.5rem] p-8 flex flex-col hover:border-obsidian/10 dark:hover:border-darkText/10 transition-colors">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-1">Standard</h3>
                                <p className="text-sm text-slate dark:text-darkText/50">Steady applications and tracking.</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-5xl font-bold">₱2</span>
                                <span className="text-slate/60 text-sm ml-2">/ month</span>
                            </div>

                            <button onClick={() => onNavigate('auth')} className="w-full py-4 rounded-2xl bg-obsidian dark:bg-darkText text-background dark:text-darkBg font-bold mb-8 transition-transform active:scale-95">
                                Select Plan
                            </button>

                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex gap-3 text-sm text-slate dark:text-darkText/70">
                                    <Check className="w-4 h-4 text-champagne shrink-0" />
                                    <span><strong>Unlimited</strong> Base Tokens</span>
                                </li>
                                <li className="flex gap-3 text-sm text-slate dark:text-darkText/70">
                                    <Check className="w-4 h-4 text-champagne shrink-0" />
                                    <span><strong>40 Premium Credits</strong> daily refilled</span>
                                </li>
                                <li className="flex gap-3 text-sm text-slate dark:text-darkText/70">
                                    <Check className="w-4 h-4 text-champagne shrink-0" />
                                    <span><strong>Full PDF Export</strong> reports</span>
                                </li>
                                <li className="flex gap-3 text-sm text-slate dark:text-darkText/70">
                                    <Shield className="w-4 h-4 text-champagne shrink-0" />
                                    <span>30-Day Plan Lock stability</span>
                                </li>
                            </ul>

                            <p className="text-[10px] text-slate/40 text-center uppercase tracking-widest font-bold">Enhanced Reporting</p>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="py-20 px-6 border-t border-obsidian/5 dark:border-darkText/5 bg-surface/20 dark:bg-darkCard/10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-obsidian dark:bg-darkText rounded flex items-center justify-center">
                                <Target className="w-3.5 h-3.5 text-background dark:text-darkBg" />
                            </div>
                            <span className="text-lg font-bold tracking-tightest">CareerSync</span>
                        </div>
                        <p className="text-xs text-slate/60 dark:text-darkText/40">© 2026 CareerSync. All rights reserved.</p>
                    </div>

                    <div className="flex items-center gap-8">
                        <button onClick={() => onNavigate('terms')} className="text-xs font-bold uppercase tracking-widest hover:text-champagne transition-colors">Terms of Service</button>
                        <button onClick={() => onNavigate('privacy')} className="text-xs font-bold uppercase tracking-widest hover:text-champagne transition-colors">Privacy Policy</button>
                    </div>

                    <div className="flex items-center gap-6">
                        <Github className="w-5 h-5 text-slate/40 hover:text-obsidian dark:hover:text-darkText cursor-pointer transition-colors" />
                        <ExternalLink className="w-5 h-5 text-slate/40 hover:text-obsidian dark:hover:text-darkText cursor-pointer transition-colors" />
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;

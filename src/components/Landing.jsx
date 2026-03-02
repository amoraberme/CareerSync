import React, { useEffect, useState, useRef } from 'react';
import { Check, ArrowRight, Shield, Zap, Target, FileText } from 'lucide-react';
import gsap from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import Simulation from './Simulation';
import ContactModal from './ContactModal';

gsap.registerPlugin(ScrollToPlugin);

const Landing = ({ onNavigate }) => {
    const landingRef = useRef(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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
                        <span className="text-xl font-bold tracking-tightest">CareerSync</span>
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

            {/* ═══ HERO SECTION ═══ */}
            <section className="pt-40 pb-24 px-6 overflow-hidden relative">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full -z-10 opacity-30 dark:opacity-20 blur-[120px]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-champagne rounded-full" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate rounded-full" />
                </div>

                <div className="max-w-5xl mx-auto text-center">


                    <h1 className="hero-title text-6xl md:text-8xl font-bold tracking-tightest leading-[0.9] mb-8 text-obsidian dark:text-darkText">
                        Build your career <br />
                        <span className="font-drama italic text-champagne font-normal">Scale to the future</span>
                    </h1>

                    <p className="hero-sub text-xl md:text-2xl text-slate dark:text-darkText/60 max-w-2xl mx-auto mb-12 leading-relaxed">
                        The AI-powered career intelligence platform designed for job seekers.
                        Instantly score, optimize, and generate materials tailored to your target role.
                    </p>

                    <div className="hero-cta flex flex-col md:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => onNavigate('auth')}
                            className="w-full md:w-auto px-8 py-4 bg-obsidian dark:bg-darkText text-background dark:text-darkBg rounded-2xl text-lg font-bold shadow-2xl hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-[0.98] btn-shine group"
                        >
                            <span className="group-hover:translate-x-1 transition-transform duration-300 ease-physical">Start your journey</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ease-physical" />
                        </button>
                        <button
                            onClick={scrollToPricing}
                            className="w-full md:w-auto px-8 py-4 bg-surface dark:bg-darkCard text-obsidian dark:text-darkText rounded-2xl text-lg font-bold hover:brightness-105 transition-all border border-obsidian/10 dark:border-darkText/10 active:scale-[0.98] btn-shine"
                        >
                            View Plans
                        </button>
                    </div>
                </div>

            </section>

            {/* ═══ TECH STACK RIBBON ═══ */}
            <section className="py-20 border-y border-obsidian/5 dark:border-darkText/5">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate/40 dark:text-darkText/30 mb-12 italic">
                        The ultimate analytical companion for career growth
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                        {/* GitHub */}
                        <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform">
                            <img src="/github-icon.svg" alt="GitHub" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                            <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-obsidian dark:bg-darkText text-white dark:text-darkBg text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg whitespace-nowrap z-50">GitHub</div>
                        </div>

                        {/* Supabase */}
                        <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform">
                            <img src="/supabase-logo.svg" alt="Supabase" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                            <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-obsidian dark:bg-darkText text-white dark:text-darkBg text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg whitespace-nowrap z-50">Supabase</div>
                        </div>

                        {/* Google Cloud */}
                        <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform">
                            <img src="/google-cloud-logo.svg" alt="Google Cloud" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                            <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-obsidian dark:bg-darkText text-white dark:text-darkBg text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg whitespace-nowrap z-50">Google Cloud</div>
                        </div>

                        {/* Vercel */}
                        <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform">
                            <img src="/vercel-logo.svg" alt="Vercel" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                            <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-obsidian dark:bg-darkText text-white dark:text-darkBg text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg whitespace-nowrap z-50">Vercel</div>
                        </div>

                        {/* Antigravity */}
                        <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform">
                            <img src="/antigravity-logo.svg" alt="Antigravity" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                            <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-obsidian dark:bg-darkText text-white dark:text-darkBg text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg whitespace-nowrap z-50">Antigravity</div>
                        </div>

                        {/* Gemini AI */}
                        <div className="relative flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform">
                            <img src="/gemini-logo.png" alt="Gemini AI" className="w-10 h-10 object-contain drop-shadow-sm transition-all duration-300" />
                            <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-obsidian dark:bg-darkText text-white dark:text-darkBg text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg whitespace-nowrap z-50">Gemini AI</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ PRODUCT SIMULATION ═══ */}
            <section className="relative z-20 mb-20">
                <Simulation />
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
                                <div className="flex items-baseline mb-1">
                                    <span className="text-3xl font-bold text-obsidian dark:text-darkText mr-1">₱</span>
                                    <span className="text-7xl font-sans font-black text-obsidian dark:text-darkText tracking-tighter">1</span>
                                    <span className="text-sm text-slate dark:text-darkText/50 ml-2">/ top-up</span>
                                </div>
                            </div>

                            <button onClick={() => onNavigate('auth')} className="w-full py-4 rounded-2xl bg-obsidian dark:bg-darkText text-background dark:text-darkBg font-bold mb-8 transition-transform active:scale-95">
                                Get Started
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
                                <li className="flex items-start gap-3 mt-1">
                                    <span className="w-5 h-5 rounded-full bg-slate/8 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-slate/40 text-[10px] font-bold leading-none">✕</span>
                                    </span>
                                    <span className="text-slate/40 dark:text-darkText/30 text-xs">No PDF export</span>
                                </li>
                                <li className="flex items-start gap-3 mt-1">
                                    <span className="w-5 h-5 rounded-full bg-slate/8 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-slate/40 text-[10px] font-bold leading-none">✕</span>
                                    </span>
                                    <span className="text-slate/40 dark:text-darkText/25 text-xs">No resume optimization</span>
                                </li>
                            </ul>

                            <p className="text-[10px] text-slate/40 text-center uppercase tracking-widest font-bold">Base Analytics Only</p>
                        </div>

                        {/* PREMIUM TIER (Featured) */}
                        <div className="relative bg-white dark:bg-darkCard border-[3px] border-champagne rounded-[2.5rem] p-10 md:py-16 flex flex-col shadow-2xl shadow-champagne/30 scale-100 lg:scale-110 z-10 -my-4 lg:-my-8 text-center order-first md:order-none">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-champagne text-obsidian px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                Most Popular
                            </div>

                            <div className="mb-8 mt-2">
                                <h3 className="text-xl font-bold mb-1 text-champagne">Premium</h3>
                                <p className="text-sm text-slate dark:text-darkText/50">For serious career growth & surgery.</p>
                            </div>

                            <div className="mb-8">
                                <div className="flex justify-center flex-col items-center mb-1">
                                    <div className="flex items-baseline justify-center">
                                        <span className="text-4xl font-bold text-obsidian dark:text-darkText mr-1">₱</span>
                                        <span className="text-[120px] leading-[0.8] font-sans font-black text-obsidian dark:text-darkText tracking-tighter">3</span>
                                    </div>
                                    <span className="text-lg font-bold text-slate dark:text-darkText/50 mt-1">/ month</span>
                                </div>
                            </div>

                            <button onClick={() => onNavigate('auth')} className="w-full py-4 rounded-2xl bg-champagne text-obsidian font-black mb-8 transition-transform active:scale-95 shadow-xl shadow-champagne/30">
                                Get Started
                            </button>

                            <ul className="space-y-4 mb-8 flex-1">
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
                                <div className="flex items-baseline mb-1">
                                    <span className="text-3xl font-bold text-obsidian dark:text-darkText mr-1">₱</span>
                                    <span className="text-7xl font-sans font-black text-obsidian dark:text-darkText tracking-tighter">2</span>
                                    <span className="text-sm text-slate dark:text-darkText/50 ml-2">/ month</span>
                                </div>
                            </div>

                            <button onClick={() => onNavigate('auth')} className="w-full py-4 rounded-2xl bg-obsidian dark:bg-darkText text-background dark:text-darkBg font-bold mb-8 transition-transform active:scale-95">
                                Get Started
                            </button>

                            <ul className="space-y-4 mb-8 flex-1">
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
                                <li className="flex items-start gap-3 mt-1">
                                    <span className="w-5 h-5 rounded-full bg-slate/8 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-slate/40 text-[10px] font-bold leading-none">✕</span>
                                    </span>
                                    <span className="text-slate/40 dark:text-darkText/25 text-xs">No resume optimization</span>
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
                            <img src="/logo.png" alt="CareerSync Logo" className="w-6 h-6 object-contain" />
                            <span className="text-lg font-bold tracking-tightest">CareerSync</span>
                        </div>
                        <p className="text-xs text-slate/60 dark:text-darkText/40">© 2026 CareerSync. All rights reserved.</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <button onClick={() => setIsContactModalOpen(true)} className="text-xs font-bold uppercase tracking-widest hover:text-champagne transition-colors">Contact Support</button>
                        <button onClick={() => onNavigate('terms')} className="text-xs font-bold uppercase tracking-widest hover:text-champagne transition-colors">Terms of Service</button>
                        <button onClick={() => onNavigate('privacy')} className="text-xs font-bold uppercase tracking-widest hover:text-champagne transition-colors">Privacy Policy</button>
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

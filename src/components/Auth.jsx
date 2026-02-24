import React, { useState, useEffect, useRef } from 'react';
import { Mail, ChevronRight, Github } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../supabaseClient';
import { ReviewCard } from './ui/card-1';
import { AnimatePresence } from 'framer-motion';

const features = [
    {
        name: "Deep AI Parsing",
        handle: "Core Capability",
        review: "Instantly extracts 50+ key requirements from raw job descriptions, including hidden technical prerequisites, soft skills, and strategic imperatives.",
        rating: 5.0,
        imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=60"
    },
    {
        name: "Automated Strategy",
        handle: "Core Capability",
        review: "Generates step-by-step interview blueprints, exact phrasing corrections, and identifies specific experience gaps holding you back.",
        rating: 5.0,
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60"
    },
    {
        name: "1:1 Theme Parity",
        handle: "Design System",
        review: "Impeccable visual harmony across true dark and light modes. Snow White Luxe meets Obsidian. Built for extended focus sessions.",
        rating: 5.0,
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60"
    },
    {
        name: "Secure Ecosystem",
        handle: "Infrastructure",
        review: "Enterprise-grade row level security with strict tier validation, encrypted workflows, and resilient Postgres architecture.",
        rating: 5.0,
        imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60"
    },
    {
        name: "Instant Feedback",
        handle: "Core Capability",
        review: "Real-time match scoring algorithm instantly benchmarks your current resume against the specific market demands of the target role.",
        rating: 5.0,
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60"
    }
];

export default function Auth({ onLogin }) {
    const containerRef = useRef(null);
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from('.auth-card', {
                y: 40,
                opacity: 0,
                duration: 1.2,
                ease: 'power3.out',
                stagger: 0.1
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % features.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [isHovered]);

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: username,
                    password: password,
                });
                if (error) throw error;
            } else {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                const { data, error } = await supabase.auth.signUp({
                    email: username,
                    password: password,
                });
                if (error) throw error;

                if (!data?.session) {
                    setError('Success! Please check your email inbox to confirm your account.');
                }
            }
        } catch (error) {
            if (error.message.includes('rate limit') || error.message.includes('Email rate limit exceeded')) {
                setError('Rate limit exceeded. For development, please disable "Enable Email Confirmations" in your Supabase Auth Providers settings, or wait a few minutes.');
            } else {
                setError(error.message);
            }
        }
    };

    const handleOAuth = async (provider) => {
        setError('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-background dark:bg-darkBg flex w-full relative z-10 overflow-hidden font-sans">

            {/* Left Column: Vertical Ticker (Hidden on smaller screens) */}
            <div className="hidden lg:flex flex-col flex-1 relative bg-surface dark:bg-darkCard/20 overflow-hidden border-r border-obsidian/10 dark:border-darkText/10">
                {/* Decorative gradients */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-surface dark:from-darkBg to-transparent z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-surface dark:from-darkBg to-transparent z-10 pointer-events-none"></div>

                <div
                    className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <AnimatePresence>
                        <ReviewCard
                            key={`feature-${activeIndex}`}
                            {...features[activeIndex]}
                            initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -50, filter: "blur(10px)" }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="absolute"
                        />
                    </AnimatePresence>
                </div>

                <div className="absolute top-10 left-12 z-20">
                    <h1 className="text-obsidian dark:text-darkText font-bold text-3xl tracking-tighter shadow-sm">
                        Career<span className="font-drama italic font-normal text-champagne ml-1">Sync.</span>
                    </h1>
                </div>
            </div>

            {/* Right Column: Auth Form */}
            <div className="w-full lg:w-[480px] xl:w-[550px] shrink-0 bg-background dark:bg-darkBg flex flex-col items-center justify-center p-8 lg:p-12 relative">
                <div className="absolute top-8 left-8 lg:hidden">
                    <h1 className="text-obsidian dark:text-darkText font-bold text-2xl tracking-tighter">Career<span className="font-drama italic font-normal text-champagne ml-1">Sync.</span></h1>
                </div>

                <div className="auth-card w-full max-w-sm">
                    <div className="mb-10 lg:mb-12 text-left">
                        <h2 className="text-3xl lg:text-4xl font-sans tracking-tight text-obsidian dark:text-darkText mb-3 font-semibold">
                            {isLogin ? 'Welcome back' : 'Create Account'}
                        </h2>
                        <p className="text-slate dark:text-darkText/60 text-sm lg:text-base leading-relaxed">
                            {isLogin ? 'Enter your details to access your secure workspace.' : 'Join the precision career toolkit and unlock your potential.'}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => handleOAuth('google')}
                            className="w-full flex items-center justify-center space-x-3 bg-white dark:bg-darkText text-obsidian dark:text-darkBg rounded-2xl py-3.5 font-bold shadow-sm border border-obsidian/10 dark:border-darkText/10 transition-transform hover:scale-[1.02] active:scale-[0.98] btn-magnetic">
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            <span>Continue with Google</span>
                        </button>
                    </div>

                    <div className="my-8 flex items-center">
                        <div className="flex-grow border-t border-obsidian/10 dark:border-darkText/10"></div>
                        <span className="px-4 text-slate dark:text-darkText/40 text-xs font-mono uppercase tracking-widest">or email</span>
                        <div className="flex-grow border-t border-obsidian/10 dark:border-darkText/10"></div>
                    </div>

                    <form className="space-y-4" onSubmit={handleEmailAuth}>
                        <div className="space-y-1">
                            <label className="text-xs font-mono text-slate dark:text-darkText/70 uppercase tracking-wider ml-1">Email</label>
                            <input
                                type="email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-surface dark:bg-darkCard/50 border border-obsidian/10 dark:border-darkText/10 rounded-2xl px-4 py-3.5 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors shadow-inner"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-mono text-slate dark:text-darkText/70 uppercase tracking-wider ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-surface dark:bg-darkCard/50 border border-obsidian/10 dark:border-darkText/10 rounded-2xl px-4 py-3.5 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors shadow-inner"
                            />
                        </div>

                        {!isLogin && (
                            <div className="space-y-1 animate-fade-in-up">
                                <label className="text-xs font-mono text-slate dark:text-darkText/70 uppercase tracking-wider ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-surface dark:bg-darkCard/50 border border-obsidian/10 dark:border-darkText/10 rounded-2xl px-4 py-3.5 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors shadow-inner"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="text-[#EA4335] text-sm text-center font-medium my-4 bg-[#EA4335]/10 border border-[#EA4335]/20 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="w-full bg-obsidian dark:bg-darkText text-background dark:text-darkBg rounded-2xl py-4 font-bold mt-6 flex items-center justify-center hover:bg-obsidian/90 dark:hover:bg-darkText/90 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] group btn-magnetic">
                            {isLogin ? 'Sign In' : 'Start free trial'}
                            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-obsidian/5 dark:border-darkText/5 pt-6">
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-slate dark:text-darkText/60 text-sm hover:text-obsidian dark:hover:text-darkText font-medium transition-colors underline underline-offset-4">
                            {isLogin ? "Don't have an account? Start here." : "Already have an account? Log in."}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

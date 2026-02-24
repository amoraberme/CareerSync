import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mail, ChevronRight, Github, Eye, EyeOff, ArrowLeft, AlertTriangle, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../supabaseClient';
import { ReviewCard } from './ui/card-1';

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
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot'

    const isLogin = authMode === 'login';
    const isForgot = authMode === 'forgot';

    // Detect in-app browsers that block Google OAuth
    const isInAppBrowser = useMemo(() => {
        const ua = navigator.userAgent || '';
        return /FBAV|FBAN|Instagram|Line\/|Twitter|Snapchat|TikTok|BytedanceWebview|MicroMessenger|WeChat/i.test(ua);
    }, []);

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

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!username) {
            setError('Please enter your email address.');
            return;
        }
        setError('');
        setSuccessMsg('');
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(username, {
                redirectTo: `${window.location.origin}`,
            });
            if (error) throw error;
            setSuccessMsg('Password reset link sent! Check your email inbox.');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsLoading(true);

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
                    setSuccessMsg('Success! Please check your email inbox to confirm your account.');
                }
            }
        } catch (error) {
            if (error.message.includes('rate limit') || error.message.includes('Email rate limit exceeded')) {
                setError('Rate limit exceeded. For development, please disable "Enable Email Confirmations" in your Supabase Auth Providers settings, or wait a few minutes.');
            } else {
                setError(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuth = async (provider) => {
        setError('');
        setIsLoading(true);
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
            setIsLoading(false);
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
                >
                    {features.map((feature, idx) => {
                        let diff = idx - (activeIndex % features.length);
                        if (diff < 0) diff += features.length;

                        const isExiting = diff === features.length - 1;

                        let y = 0;
                        let scale = 1;
                        let opacity = 1;
                        let zIndex = 50;
                        let filter = "blur(0px)";

                        if (diff === 0) {
                            y = 0;
                            scale = 1;
                            opacity = 1;
                            zIndex = 50;
                        } else if (diff === 1) {
                            y = 20;
                            scale = 0.95;
                            opacity = 0.8;
                            zIndex = 40;
                        } else if (diff === 2) {
                            y = 40;
                            scale = 0.9;
                            opacity = 0.5;
                            zIndex = 30;
                        } else if (isExiting) {
                            y = -100;
                            scale = 1.05;
                            opacity = 0;
                            filter = "blur(10px)";
                            zIndex = 60; // Exiting card flies over the front card
                        } else {
                            // hidden in back
                            y = 60;
                            scale = 0.85;
                            opacity = 0;
                            filter = "blur(4px)";
                            zIndex = 10;
                        }

                        return (
                            <ReviewCard
                                key={`feature-${idx}`}
                                {...feature}
                                animate={{ y, scale, opacity, filter, zIndex }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                                className="absolute"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            />
                        );
                    })}
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
                            {isForgot ? 'Reset Password' : isLogin ? 'Welcome back' : 'Create Account'}
                        </h2>
                        <p className="text-slate dark:text-darkText/60 text-sm lg:text-base leading-relaxed">
                            {isForgot ? 'Enter your email and we\'ll send you a reset link.' : isLogin ? 'Enter your details to access your secure workspace.' : 'Join the precision career toolkit and unlock your potential.'}
                        </p>
                    </div>

                    {/* In-App Browser Warning */}
                    {isInAppBrowser && (
                        <div className="mb-6 p-4 bg-[#FBBC05]/10 border border-[#FBBC05]/30 rounded-2xl flex items-start space-x-3 animate-fade-in">
                            <AlertTriangle className="w-5 h-5 text-[#FBBC05] shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-obsidian dark:text-darkText mb-1">
                                    In-app browser detected
                                </p>
                                <p className="text-xs text-slate dark:text-darkText/60 leading-relaxed mb-3">
                                    Google Sign-In is blocked in this browser. Please open this page in <strong>Safari</strong>, <strong>Chrome</strong>, or your default browser.
                                </p>
                                <button
                                    onClick={() => {
                                        // Attempt to open in external browser (works on some platforms)
                                        window.open(window.location.href, '_system');
                                    }}
                                    className="flex items-center space-x-1 text-xs font-bold text-champagne hover:text-champagne/80 transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Open in Browser</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* OAuth — hidden during forgot password */}
                    {!isForgot && (
                        <>
                            <div className="space-y-4">
                                <button
                                    onClick={() => handleOAuth('google')}
                                    disabled={isLoading || isInAppBrowser}
                                    title={isInAppBrowser ? 'Open in Safari or Chrome to use Google Sign-In' : ''}
                                    className={`w-full flex items-center justify-center space-x-3 rounded-2xl py-3.5 font-bold shadow-sm border border-obsidian/10 dark:border-darkText/10 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isInAppBrowser ? 'bg-obsidian/5 dark:bg-darkCard/30' : 'bg-white dark:bg-darkText text-obsidian dark:text-darkBg hover:scale-[1.02] active:scale-[0.98] btn-magnetic'}`}>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                    <span>Continue with Google</span>
                                </button>
                            </div>

                            <div className="my-8 flex items-center">
                                <div className="flex-grow border-t border-obsidian/10 dark:border-darkText/10"></div>
                                <span className="px-4 text-slate dark:text-darkText/40 text-xs font-mono uppercase tracking-widest">or email</span>
                                <div className="flex-grow border-t border-obsidian/10 dark:border-darkText/10"></div>
                            </div>
                        </>
                    )}

                    <form className="space-y-4" onSubmit={isForgot ? handleForgotPassword : handleEmailAuth}>
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

                        {/* Password field — hidden during forgot password */}
                        {!isForgot && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between ml-1 mr-1">
                                    <label className="text-xs font-mono text-slate dark:text-darkText/70 uppercase tracking-wider">Password</label>
                                    {isLogin && (
                                        <button
                                            type="button"
                                            onClick={() => { setAuthMode('forgot'); setError(''); setSuccessMsg(''); }}
                                            className="text-xs text-champagne hover:text-champagne/80 font-medium transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-surface dark:bg-darkCard/50 border border-obsidian/10 dark:border-darkText/10 rounded-2xl px-4 py-3.5 pr-12 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate/50 dark:text-darkText/40 hover:text-obsidian dark:hover:text-darkText transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isLogin && !isForgot && (
                            <div className="space-y-1 animate-fade-in-up">
                                <label className="text-xs font-mono text-slate dark:text-darkText/70 uppercase tracking-wider ml-1">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-surface dark:bg-darkCard/50 border border-obsidian/10 dark:border-darkText/10 rounded-2xl px-4 py-3.5 pr-12 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate/50 dark:text-darkText/40 hover:text-obsidian dark:hover:text-darkText transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="text-[#EA4335] text-sm text-center font-medium my-4 bg-[#EA4335]/10 border border-[#EA4335]/20 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        {successMsg && (
                            <div className="text-[#34A853] text-sm text-center font-medium my-4 bg-[#34A853]/10 border border-[#34A853]/20 py-3 rounded-xl">
                                {successMsg}
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className="w-full bg-obsidian dark:bg-darkText text-background dark:text-darkBg rounded-2xl py-4 font-bold mt-6 flex items-center justify-center hover:bg-obsidian/90 dark:hover:bg-darkText/90 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] group btn-magnetic disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-background/30 dark:border-darkBg/30 border-t-background dark:border-t-darkBg rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isForgot ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Start free trial'}
                                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-obsidian/5 dark:border-darkText/5 pt-6">
                        {isForgot ? (
                            <button onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }} className="text-slate dark:text-darkText/60 text-sm hover:text-obsidian dark:hover:text-darkText font-medium transition-colors flex items-center justify-center mx-auto">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sign In
                            </button>
                        ) : (
                            <button onClick={() => { setAuthMode(isLogin ? 'signup' : 'login'); setError(''); setSuccessMsg(''); }} className="text-slate dark:text-darkText/60 text-sm hover:text-obsidian dark:hover:text-darkText font-medium transition-colors underline underline-offset-4">
                                {isLogin ? "Don't have an account? Start here." : "Already have an account? Log in."}
                            </button>
                        )}
                    </div>

                    {/* Legal Footer */}
                    <p className="mt-8 text-[11px] text-slate/60 dark:text-darkText/40 text-center leading-relaxed">
                        By continuing, you agree to CareerSync's{' '}
                        <a href="#" className="underline underline-offset-2 hover:text-obsidian dark:hover:text-darkText transition-colors">Terms of Service</a>{' '}
                        and{' '}
                        <a href="#" className="underline underline-offset-2 hover:text-obsidian dark:hover:text-darkText transition-colors">Privacy Policy</a>,
                        and to receive periodic emails with updates.
                    </p>
                </div>
            </div>
        </div>
    );
}

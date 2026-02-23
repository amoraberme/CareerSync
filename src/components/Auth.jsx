import React, { useState, useEffect, useRef } from 'react';
import { Mail, ChevronRight, Github } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../supabaseClient';

export default function Auth({ onLogin }) {
    const containerRef = useRef(null);
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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
                const { error } = await supabase.auth.signUp({
                    email: username,
                    password: password,
                });
                if (error) throw error;
                setError('Check your email to confirm your account!');
            }
        } catch (error) {
            setError(error.message);
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
        <div ref={containerRef} className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6 relative z-10">
            <div className="absolute top-8 left-8">
                <h1 className="text-surface font-sans font-bold text-2xl tracking-tighter">Career<span className="font-drama italic font-normal text-champagne ml-1">Sync.</span></h1>
            </div>

            <div className="auth-card w-full max-w-md bg-slate/40 backdrop-blur-xl border border-surface/10 rounded-[2rem] p-10 shadow-2xl">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-sans tracking-tight text-surface mb-2 font-semibold">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-surface/60 font-sans text-sm">
                        {isLogin ? 'Enter your details to access your workspace.' : 'Join the precision career toolkit.'}
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => handleOAuth('google')}
                        className="w-full flex items-center justify-center space-x-3 bg-surface text-obsidian rounded-2xl py-3 font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        <span>Continue with Google</span>
                    </button>
                </div>

                <div className="my-8 flex items-center">
                    <div className="flex-grow border-t border-surface/10"></div>
                    <span className="px-4 text-surface/40 text-xs font-mono uppercase tracking-widest">or</span>
                    <div className="flex-grow border-t border-surface/10"></div>
                </div>

                <form className="space-y-4" onSubmit={handleEmailAuth}>
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-surface/60 uppercase tracking-wider ml-1">Email</label>
                        <input
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-obsidian/50 border border-surface/10 rounded-2xl px-4 py-3 text-surface placeholder:text-surface/30 focus:outline-none focus:border-champagne/50 transition-colors"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-surface/60 uppercase tracking-wider ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-obsidian/50 border border-surface/10 rounded-2xl px-4 py-3 text-surface placeholder:text-surface/30 focus:outline-none focus:border-champagne/50 transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="text-[#EA4335] text-sm text-center font-medium my-2">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="w-full bg-surface text-obsidian rounded-2xl py-3 font-semibold mt-4 flex items-center justify-center hover:bg-surface/90 transition-colors group">
                        {isLogin ? 'Sign In' : 'Start free trial'}
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-surface/60 text-sm hover:text-surface transition-colors">
                        {isLogin ? "Don't have an account? Start here." : "Already have an account? Log in."}
                    </button>
                </div>
            </div>
        </div>
    );
}

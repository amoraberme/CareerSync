import React from 'react';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function PendingVerification({ session }) {
    const handleResend = async () => {
        try {
            await supabase.auth.resend({
                type: 'signup',
                email: session?.user?.email,
            });
            import('./ui/Toast').then(({ toast }) => {
                toast.success('Verification email sent! Check your inbox.');
            });
        } catch (error) {
            import('./ui/Toast').then(({ toast }) => {
                toast.error(error.message || 'Failed to resend email.');
            });
        }
    };

    return (
        <div className="max-w-xl mx-auto py-24 px-6 text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-champagne/10 border-2 border-champagne/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-champagne" />
            </div>

            <h2 className="text-4xl font-sans tracking-tight text-obsidian dark:text-darkText font-semibold mb-4">
                Verify your <span className="font-drama italic text-champagne font-normal">Email</span>
            </h2>

            <p className="text-slate dark:text-darkText/60 mb-8 max-w-lg mx-auto text-lg">
                We've sent a confirmation link to <strong className="text-obsidian dark:text-darkText">{session?.user?.email}</strong>.
                Please click the link to activate your account and access CareerSync's core features.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={handleResend}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-obsidian dark:bg-darkText text-background dark:text-darkBg font-bold hover:scale-105 active:scale-95 transition-transform shadow-md w-full sm:w-auto justify-center"
                >
                    <RefreshCw className="w-4 h-4" />
                    Resend Email
                </button>
                <button
                    onClick={() => { window.location.reload(); }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-darkCard border border-obsidian/10 dark:border-darkText/10 text-obsidian dark:text-darkText font-bold hover:bg-obsidian/5 dark:hover:bg-darkText/5 transition-colors shadow-sm w-full sm:w-auto justify-center"
                >
                    <CheckCircle className="w-4 h-4" />
                    I've Verified
                </button>
            </div>

            <p className="text-xs text-slate/50 dark:text-darkText/40 mt-8">
                If you don't see the email, please check your spam or promotions folder. Email verification is strictly enforced to protect our community ecosystem.
            </p>
        </div>
    );
}

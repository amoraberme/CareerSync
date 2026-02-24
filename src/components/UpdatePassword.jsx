/**
 * UpdatePassword.jsx — Secure password reset form
 *
 * Shown when a user clicks the password reset link from their email.
 * Supabase fires a PASSWORD_RECOVERY auth event, and App.jsx routes here.
 *
 * Features:
 * - New Password + Confirm Password fields with visibility toggle
 * - Client-side validation (min 6 chars, matching passwords)
 * - Calls supabase.auth.updateUser() to set the new password
 * - Loading state, success/error messages, expired token handling
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function UpdatePassword({ onComplete }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Client-side validation
        if (!newPassword || newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match. Please try again.');
            return;
        }

        setIsLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                // Handle expired or invalid recovery tokens
                if (updateError.message?.includes('expired') || updateError.message?.includes('invalid')) {
                    setError('Your reset link has expired. Please request a new password reset.');
                } else {
                    setError(updateError.message || 'Failed to update password.');
                }
                return;
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    // Success state — password updated
    if (success) {
        return (
            <div className="min-h-screen bg-background dark:bg-darkBg flex items-center justify-center p-6">
                <div className="w-full max-w-sm text-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-[#34A853]/10 border border-[#34A853]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-10 h-10 text-[#34A853]" />
                    </div>
                    <h2 className="text-3xl font-sans font-bold text-obsidian dark:text-darkText mb-3">
                        Password Updated
                    </h2>
                    <p className="text-slate dark:text-darkText/60 text-sm leading-relaxed mb-8">
                        Your password has been successfully changed. You can now use your new password to sign in.
                    </p>
                    <button
                        onClick={onComplete}
                        className="w-full bg-obsidian dark:bg-darkText text-background dark:text-darkBg rounded-2xl py-4 font-bold flex items-center justify-center hover:bg-obsidian/90 dark:hover:bg-darkText/90 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] group"
                    >
                        Continue to Workspace
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        );
    }

    // Password reset form
    return (
        <div className="min-h-screen bg-background dark:bg-darkBg flex items-center justify-center p-6">
            <div className="w-full max-w-sm animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-center mb-8">
                    <div className="w-16 h-16 bg-champagne/10 border border-champagne/20 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-champagne" />
                    </div>
                </div>

                <h2 className="text-3xl font-sans font-bold text-obsidian dark:text-darkText mb-2 text-center">
                    Set New Password
                </h2>
                <p className="text-slate dark:text-darkText/60 text-sm text-center leading-relaxed mb-10">
                    Choose a strong password to secure your CareerSync account.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* New Password */}
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-slate dark:text-darkText/70 uppercase tracking-wider ml-1">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 6 characters"
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

                    {/* Confirm Password */}
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-slate dark:text-darkText/70 uppercase tracking-wider ml-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
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

                    {/* Error Message */}
                    {error && (
                        <div className="text-[#EA4335] text-sm text-center font-medium bg-[#EA4335]/10 border border-[#EA4335]/20 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || !newPassword || !confirmPassword}
                        className="w-full bg-obsidian dark:bg-darkText text-background dark:text-darkBg rounded-2xl py-4 font-bold mt-2 flex items-center justify-center hover:bg-obsidian/90 dark:hover:bg-darkText/90 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-background/30 dark:border-darkBg/30 border-t-background dark:border-t-darkBg rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Update Password
                                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Password requirements hint */}
                <p className="mt-6 text-[11px] text-slate/50 dark:text-darkText/30 text-center">
                    Password must be at least 6 characters. Use a mix of letters, numbers, and symbols for best security.
                </p>
            </div>
        </div>
    );
}

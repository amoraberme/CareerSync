import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import useWorkspaceStore from '../store/useWorkspaceStore';
import { User, Lock, Mail, Fingerprint, Award, Coins, Key, ShieldCheck, AlertTriangle, Trash2, ArrowUpRight } from 'lucide-react';
import { getTierLabel } from '../lib/tierPermissions';

export default function Profile({ session, setCurrentView }) {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [toast, setToast] = useState(null);

    // Account deletion state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            if (!session?.user?.id) return;

            try {
                const email = session.user.email;
                const uid = session.user.id;

                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('current_credit_balance, tier')
                    .eq('id', uid)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;

                const credits = data?.current_credit_balance ?? 50;
                // Use the dedicated `tier` column added in Phase 31
                const tierKey = data?.tier || 'base';

                setProfileData({ email, uid, tierKey, credits });
            } catch (error) {
                console.error('Error fetching profile:', error);
                setProfileData({ email: session?.user?.email, uid: session?.user?.id, tierKey: 'base', credits: 50 });
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [session]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            setToast({ message: 'Password must be at least 6 characters.', type: 'error' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setToast({ message: 'Passwords do not match.', type: 'error' });
            return;
        }

        setIsUpdatingPassword(true);
        setToast(null);

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setToast({ message: 'Password updated successfully.', type: 'success' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setToast({ message: error.message || 'Failed to update password.', type: 'error' });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'Confirm') return;

        setIsDeleting(true);
        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();

            const response = await fetch('/api/user/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(currentSession?.access_token && { 'Authorization': `Bearer ${currentSession.access_token}` })
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete account.');
            }

            // Success: sign out, clear all state, redirect
            await supabase.auth.signOut();
            useWorkspaceStore.getState().resetWorkspace();
            setShowDeleteModal(false);
            // The onAuthStateChange listener in App.jsx will handle the redirect to Auth

        } catch (error) {
            console.error('Account deletion error:', error);
            setToast({ message: error.message || 'Failed to delete account. Please try again.', type: 'error' });
            setShowDeleteModal(false);
        } finally {
            setIsDeleting(false);
            setDeleteConfirmText('');
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-24 px-6 flex justify-center items-center text-obsidian dark:text-darkText">
                <div className="w-8 h-8 border-4 border-obsidian/20 dark:border-darkText/20 border-t-obsidian dark:border-t-darkText rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 animate-fade-in-up">
            <div className="flex items-center space-x-4 mb-10">
                <div className="w-16 h-16 bg-white dark:bg-darkCard border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-obsidian dark:text-darkText" />
                </div>
                <div>
                    <h2 className="text-4xl font-sans tracking-tight text-obsidian dark:text-darkText font-semibold">
                        Account <span className="font-drama italic text-champagne font-normal">Settings</span>
                    </h2>
                    <p className="text-slate dark:text-darkText/60">Manage your subscription and security preferences.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Account Overview Card */}
                <div className="bg-white dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-[2rem] p-8">
                    <div className="flex items-center space-x-3 mb-8 border-b border-obsidian/5 dark:border-darkText/5 pb-4">
                        <User className="w-5 h-5 text-obsidian/70 dark:text-darkText/70" />
                        <h3 className="text-xl font-bold text-obsidian dark:text-darkText">Account Overview</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col">
                            <span className="text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/50 mb-1 flex items-center">
                                <Mail className="w-3 h-3 mr-2" /> Email Address
                            </span>
                            <span className="text-obsidian dark:text-darkText font-medium bg-background dark:bg-darkCard px-4 py-2 rounded-xl truncate border border-obsidian/5 dark:border-darkText/5">
                                {profileData?.email}
                            </span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/50 mb-1 flex items-center">
                                <Fingerprint className="w-3 h-3 mr-2" /> User ID
                            </span>
                            <span className="text-slate dark:text-darkText/70 font-mono text-sm bg-background dark:bg-darkCard px-4 py-2 rounded-xl truncate border border-obsidian/5 dark:border-darkText/5">
                                {profileData?.uid}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-obsidian/5 dark:border-darkText/5">
                            <div className="bg-background dark:bg-darkCard p-4 rounded-2xl border border-obsidian/5 dark:border-darkText/5 flex flex-col items-center justify-center text-center">
                                <Award className="w-6 h-6 text-champagne mb-2" />
                                <span className="text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/50 mb-2">Current Tier</span>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${profileData?.tierKey === 'premium'
                                        ? 'bg-champagne/15 text-champagne border border-champagne/30'
                                        : profileData?.tierKey === 'standard'
                                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                            : 'bg-obsidian/5 dark:bg-darkText/10 text-slate dark:text-darkText/60 border border-obsidian/10 dark:border-darkText/10'
                                    }`}>
                                    {getTierLabel(profileData?.tierKey || 'base')}
                                </span>
                                {profileData?.tierKey !== 'premium' && (
                                    <button
                                        onClick={() => setCurrentView('billing')}
                                        className="mt-3 flex items-center space-x-1 text-[10px] font-bold text-champagne hover:text-champagne/80 transition-colors"
                                    >
                                        <ArrowUpRight className="w-3 h-3" />
                                        <span>Upgrade</span>
                                    </button>
                                )}
                            </div>

                            <div className="bg-background dark:bg-darkCard p-4 rounded-2xl border border-obsidian/5 dark:border-darkText/5 flex flex-col items-center justify-center text-center">
                                <Coins className="w-6 h-6 text-champagne mb-2" />
                                <span className="text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/50 mb-1">Available Credits</span>
                                <span className="text-lg font-bold text-obsidian dark:text-darkText">{profileData?.credits}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Card */}
                <div className="bg-white dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-[2rem] p-8 flex flex-col">
                    <div className="flex items-center space-x-3 mb-8 border-b border-obsidian/5 dark:border-darkText/5 pb-4">
                        <Lock className="w-5 h-5 text-obsidian/70 dark:text-darkText/70" />
                        <h3 className="text-xl font-bold text-obsidian dark:text-darkText">Security</h3>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="flex flex-col flex-grow">
                        <div className="flex flex-col mb-auto">
                            <label className="text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/50 mb-2 flex items-center">
                                <Key className="w-3 h-3 mr-2" /> New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                className="w-full bg-background dark:bg-darkCard border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-xl px-4 py-3 mb-4 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors"
                            />

                            <label className="text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/50 mb-2 flex items-center">
                                <Key className="w-3 h-3 mr-2 opacity-50" /> Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                className="w-full bg-background dark:bg-darkCard border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-xl px-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors"
                            />
                        </div>

                        {toast && (
                            <div className={`mt-4 p-4 rounded-xl flex items-start text-sm ${toast.type === 'success' ? 'bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20' : 'bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/20'}`}>
                                {toast.type === 'success' ? (
                                    <ShieldCheck className="w-5 h-5 mr-3 shrink-0" />
                                ) : (
                                    <span className="text-lg leading-none mr-3 shrink-0">!</span>
                                )}
                                <span>{toast.message}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                            className="mt-6 w-full py-4 rounded-2xl bg-obsidian dark:bg-darkText text-background dark:text-darkBg font-bold hover:scale-[1.02] transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isUpdatingPassword ? (
                                <div className="w-5 h-5 border-2 border-background/20 dark:border-darkBg/20 border-t-background dark:border-t-darkBg rounded-full animate-spin"></div>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </form>

                    {/* Danger Zone: Delete Account */}
                    <div className="mt-8 pt-6 border-t border-[#EA4335]/20">
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl border-2 border-[#EA4335]/30 text-[#EA4335] font-medium text-sm hover:bg-[#EA4335]/5 hover:border-[#EA4335]/50 transition-all active:scale-[0.98]"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Account</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <button onClick={() => setCurrentView('workspace')} className="text-sm font-medium text-slate hover:text-obsidian dark:text-darkText/60 dark:hover:text-darkText underline underline-offset-4 transition-colors">
                    &larr; Return to Workspace
                </button>
            </div>

            {/* Account Deletion Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-white/60 dark:bg-darkBg/60 backdrop-blur-md" onClick={() => { if (!isDeleting) { setShowDeleteModal(false); setDeleteConfirmText(''); } }}></div>

                    <div className="relative bg-white dark:bg-darkBg border border-[#EA4335]/20 rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-fade-in-up">
                        {/* Warning Icon */}
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-16 h-16 bg-[#EA4335]/10 border border-[#EA4335]/20 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-[#EA4335]" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-sans font-bold text-obsidian dark:text-darkText text-center mb-2">Delete Account</h3>
                        <p className="text-slate dark:text-darkText/60 text-center text-sm mb-6 leading-relaxed">
                            This action is <strong className="text-[#EA4335]">permanent and irreversible</strong>. All your data, analysis history, credits, and account information will be permanently erased.
                        </p>

                        {/* Warning Banner */}
                        <div className="bg-[#EA4335]/5 border border-[#EA4335]/15 rounded-xl p-4 mb-6 flex items-start">
                            <AlertTriangle className="w-5 h-5 text-[#EA4335] mr-3 mt-0.5 shrink-0" />
                            <p className="text-xs text-[#EA4335]/90 leading-relaxed">
                                Your account will be immediately terminated. Remaining credits will not be refunded. This cannot be undone.
                            </p>
                        </div>

                        {/* Confirmation Input */}
                        <div className="mb-6">
                            <label className="text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/50 mb-2 block">
                                Type <strong className="text-[#EA4335]">Confirm</strong> to proceed
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="Type Confirm here..."
                                disabled={isDeleting}
                                className="w-full bg-background dark:bg-darkCard border border-obsidian/10 dark:border-darkText/10 rounded-xl px-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-[#EA4335]/50 focus:ring-1 focus:ring-[#EA4335]/50 transition-colors disabled:opacity-50"
                                autoComplete="off"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'Confirm' || isDeleting}
                                className="w-full py-4 rounded-2xl bg-[#EA4335] text-white font-bold transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#D33426] active:scale-[0.98] flex items-center justify-center"
                            >
                                {isDeleting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    'Permanently Delete Account'
                                )}
                            </button>
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                                disabled={isDeleting}
                                className="w-full py-3 rounded-2xl text-slate dark:text-darkText/70 font-medium hover:text-obsidian dark:hover:text-darkText hover:bg-obsidian/5 dark:hover:bg-darkText/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

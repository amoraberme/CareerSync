import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Lock, Mail, Fingerprint, Award, Coins, Key, ShieldCheck } from 'lucide-react';

export default function Profile({ session, setCurrentView }) {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newPassword, setNewPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        async function fetchProfile() {
            if (!session?.user?.id) return;

            try {
                const email = session.user.email;
                const uid = session.user.id;

                // Query user_profiles and join with plans
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select(`
                        current_credit_balance,
                        plans:current_plan_id (plan_name)
                    `)
                    .eq('id', uid)
                    .single();

                if (error && error.code !== 'PGRST116') throw error; // Ignore 'No rows' error

                const credits = data?.current_credit_balance || 0;
                const tier = data?.plans?.plan_name || 'Basic';

                setProfileData({ email, uid, tier, credits });
            } catch (error) {
                console.error('Error fetching profile:', error);
                setProfileData({ email: session?.user?.email, uid: session?.user?.id, tier: 'Basic', credits: 0 });
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [session]);

    // Handle toast timeouts automatically
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

        setIsUpdatingPassword(true);
        setToast(null);

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setToast({ message: 'Password updated successfully.', type: 'success' });
            setNewPassword('');
        } catch (error) {
            setToast({ message: error.message || 'Failed to update password.', type: 'error' });
        } finally {
            setIsUpdatingPassword(false);
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
                                <span className="text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/50 mb-1">Current Tier</span>
                                <span className="text-lg font-bold text-obsidian dark:text-darkText">{profileData?.tier}</span>
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
                            disabled={isUpdatingPassword || !newPassword}
                            className="mt-6 w-full py-4 rounded-2xl bg-obsidian dark:bg-darkText text-background dark:text-darkBg font-bold hover:scale-[1.02] transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isUpdatingPassword ? (
                                <div className="w-5 h-5 border-2 border-background/20 dark:border-darkBg/20 border-t-background dark:border-t-darkBg rounded-full animate-spin"></div>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-8 text-center">
                <button onClick={() => setCurrentView('workspace')} className="text-sm font-medium text-slate hover:text-obsidian dark:text-darkText/60 dark:hover:text-darkText underline underline-offset-4 transition-colors">
                    &larr; Return to Workspace
                </button>
            </div>
        </div>
    );
}

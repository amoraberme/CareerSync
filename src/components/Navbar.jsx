import React, { useEffect, useState, useRef } from 'react';
import useWorkspaceStore from '../store/useWorkspaceStore';
import { Settings, User, Moon, Sun, LogOut } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, onLogout }) {
    const [scrolled, setScrolled] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const creditBalance = useWorkspaceStore(state => state.creditBalance);
    const isDark = useWorkspaceStore(state => state.isDark);
    const toggleTheme = useWorkspaceStore(state => state.toggleTheme);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
            <nav className={`transition-all duration-300 rounded-full px-6 py-3 flex items-center justify-between pointer-events-auto ${scrolled ? 'bg-white/75 dark:bg-darkBg/75 backdrop-blur-md border border-obsidian/5 dark:border-darkText/5 py-2 shadow-sm w-full max-w-4xl' : 'w-full max-w-6xl'
                }`}>
                {/* Brand */}
                <div className="flex items-center space-x-1 cursor-pointer" onClick={() => setCurrentView('workspace')}>
                    <span className="font-sans font-bold text-xl text-obsidian dark:text-darkText tracking-tighter">Career<span className="font-drama italic font-normal text-champagne">Sync.</span></span>
                </div>

                {/* Links */}
                <div className="hidden md:flex items-center justify-center space-x-1 bg-obsidian/5 dark:bg-darkText/5 p-1 rounded-full border border-obsidian/5 dark:border-darkText/5">
                    {[
                        { id: 'workspace', label: 'Workspace' },
                        { id: 'history', label: 'History' },
                        { id: 'billing', label: 'Billing' }
                    ].map(view => (
                        <button
                            key={view.id}
                            onClick={() => setCurrentView(view.id)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${currentView === view.id
                                ? 'bg-obsidian dark:bg-darkText text-background dark:text-darkBg shadow-md'
                                : 'text-slate dark:text-darkText/70 hover:text-obsidian dark:hover:text-darkText'
                                }`}
                        >
                            {view.label}
                        </button>
                    ))}
                </div>

                {/* CTA */}
                <div className="flex items-center space-x-4">
                    <div className="hidden lg:flex items-center space-x-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-champagne opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-champagne"></span>
                        </span>
                        <span className="text-xs font-mono text-slate uppercase tracking-widest">{creditBalance} Credits</span>
                    </div>

                    {/* Settings Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={`p-2 rounded-full transition-colors flex items-center justify-center transform active:scale-95 border ${isSettingsOpen ? 'bg-obsidian/10 dark:bg-darkText/10 border-obsidian/20 dark:border-darkText/20' : 'bg-obsidian/5 dark:bg-darkText/5 hover:bg-obsidian/10 dark:hover:bg-darkText/10 border-obsidian/10 dark:border-darkText/10'}`}
                            title="Settings"
                        >
                            <Settings className="w-5 h-5 text-obsidian dark:text-darkText" />
                        </button>

                        {isSettingsOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-surface dark:bg-darkCard border border-obsidian/10 dark:border-darkText/10 rounded-2xl shadow-xl py-2 flex flex-col items-start origin-top-right animate-fade-in-up">
                                <div className="px-5 py-3 border-b border-obsidian/5 dark:border-darkText/5 w-full mb-1">
                                    <p className="text-xs font-mono text-slate dark:text-darkText/50 uppercase tracking-widest">Account Settings</p>
                                </div>
                                <button
                                    onClick={() => { setCurrentView('profile'); setIsSettingsOpen(false); }}
                                    className="w-full text-left px-5 py-3 text-sm font-medium text-obsidian dark:text-darkText hover:bg-obsidian/5 dark:hover:bg-darkText/5 flex items-center transition-colors"
                                >
                                    <User className="w-4 h-4 mr-3 opacity-70" /> Profile
                                </button>
                                <button
                                    onClick={() => { toggleTheme(); }}
                                    className="w-full text-left px-5 py-3 text-sm font-medium text-obsidian dark:text-darkText hover:bg-obsidian/5 dark:hover:bg-darkText/5 flex items-center transition-colors"
                                >
                                    {isDark ? <Sun className="w-4 h-4 mr-3 opacity-70" /> : <Moon className="w-4 h-4 mr-3 opacity-70" />}
                                    {isDark ? 'Light Mode' : 'Dark Mode'}
                                </button>
                                <div className="border-t border-obsidian/5 dark:border-darkText/5 my-1 w-full"></div>
                                <button
                                    onClick={() => { onLogout(); setIsSettingsOpen(false); }}
                                    className="w-full text-left px-5 py-3 text-sm font-medium text-[#EA4335] hover:bg-[#EA4335]/10 dark:hover:bg-[#EA4335]/20 flex items-center transition-colors"
                                >
                                    <LogOut className="w-4 h-4 mr-3 opacity-70" /> Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}

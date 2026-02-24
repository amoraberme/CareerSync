import React, { useEffect, useState, useRef } from 'react';
import useWorkspaceStore from '../store/useWorkspaceStore';
import { Settings, User, Moon, Sun, LogOut, Menu, X } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, onLogout }) {
    const [scrolled, setScrolled] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    const handleMobileNav = (viewId) => {
        setCurrentView(viewId);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
                <nav className={`transition-all duration-300 rounded-full px-4 md:px-6 py-3 flex items-center justify-between pointer-events-auto ${scrolled ? 'bg-white/75 dark:bg-darkBg/75 backdrop-blur-md border border-obsidian/5 dark:border-darkText/5 py-2 shadow-sm w-full max-w-4xl' : 'w-full max-w-6xl'
                    }`}>
                    {/* Brand */}
                    <div className="flex items-center space-x-1 cursor-pointer" onClick={() => setCurrentView('workspace')}>
                        <span className="font-sans font-bold text-xl text-obsidian dark:text-darkText tracking-tighter">Career<span className="font-drama italic font-normal text-champagne">Sync.</span></span>
                    </div>

                    {/* Desktop Links — hidden on mobile */}
                    <div className="hidden md:flex items-center justify-center space-x-1 bg-obsidian/5 dark:bg-darkText/5 p-1 rounded-full border border-obsidian/5 dark:border-darkText/5">
                        {[
                            { id: 'workspace', label: 'Workspace' },
                            { id: 'history', label: 'History' },
                            { id: 'billing', label: 'Billing' }
                        ].map(view => (
                            <button
                                key={view.id}
                                onClick={() => setCurrentView(view.id)}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${currentView === view.id
                                    ? 'bg-obsidian dark:bg-darkText text-background dark:text-darkBg shadow-md'
                                    : 'text-slate dark:text-darkText/70 hover:text-obsidian dark:hover:text-darkText'
                                    }`}
                            >
                                {view.label}
                            </button>
                        ))}
                    </div>

                    {/* Right Side: Credits + Settings (desktop) + Hamburger (mobile) */}
                    <div className="flex items-center space-x-3 md:space-x-4">
                        {/* Credits — visible on md+ */}
                        <div className="hidden md:flex items-center space-x-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-champagne opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-champagne"></span>
                            </span>
                            <span className="text-xs font-mono text-slate uppercase tracking-widest">{creditBalance} Credits</span>
                        </div>

                        {/* Settings Dropdown — desktop only */}
                        <div className="hidden md:block relative" ref={dropdownRef} onMouseLeave={() => setIsSettingsOpen(false)}>
                            <button
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className={`p-2.5 rounded-full transition-colors flex items-center justify-center transform active:scale-95 border ${isSettingsOpen ? 'bg-obsidian/10 dark:bg-darkText/10 border-obsidian/20 dark:border-darkText/20' : 'bg-obsidian/5 dark:bg-darkText/5 hover:bg-obsidian/10 dark:hover:bg-darkText/10 border-obsidian/10 dark:border-darkText/10'}`}
                                title="Settings"
                            >
                                <Settings className="w-5 h-5 text-obsidian dark:text-darkText" />
                            </button>

                            {isSettingsOpen && (
                                <div className="absolute right-0 top-full w-56">
                                    <div className="pt-3">
                                        <div className="bg-surface dark:bg-darkCard border border-obsidian/10 dark:border-darkText/10 rounded-2xl shadow-xl py-2 flex flex-col items-start origin-top-right animate-fade-in-up">
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
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Hamburger Toggle — visible on mobile only */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2.5 rounded-full bg-obsidian/5 dark:bg-darkText/5 border border-obsidian/10 dark:border-darkText/10 transition-colors active:scale-95"
                            aria-label="Toggle mobile menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5 text-obsidian dark:text-darkText" />
                            ) : (
                                <Menu className="w-5 h-5 text-obsidian dark:text-darkText" />
                            )}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Full-Screen Overlay Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[45] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-background/95 dark:bg-darkBg/95 backdrop-blur-xl"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Menu Content */}
                    <div className="relative z-10 flex flex-col h-full pt-24 pb-8 px-8 animate-fade-in-up">
                        {/* Credits Badge */}
                        <div className="flex items-center space-x-2 mb-8 px-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-champagne opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-champagne"></span>
                            </span>
                            <span className="text-sm font-mono text-slate dark:text-darkText/70 uppercase tracking-widest">{creditBalance} Credits Available</span>
                        </div>

                        {/* Navigation Links */}
                        <div className="space-y-2 mb-auto">
                            {[
                                { id: 'workspace', label: 'Workspace' },
                                { id: 'history', label: 'History' },
                                { id: 'billing', label: 'Billing' },
                                { id: 'profile', label: 'Profile' }
                            ].map(view => (
                                <button
                                    key={view.id}
                                    onClick={() => handleMobileNav(view.id)}
                                    className={`w-full text-left px-6 py-4 rounded-2xl text-lg font-medium transition-all duration-200 ${currentView === view.id
                                        ? 'bg-obsidian dark:bg-darkText text-background dark:text-darkBg shadow-md'
                                        : 'text-obsidian dark:text-darkText hover:bg-obsidian/5 dark:hover:bg-darkText/5'
                                        }`}
                                >
                                    {view.label}
                                </button>
                            ))}
                        </div>

                        {/* Bottom Actions */}
                        <div className="space-y-3 border-t border-obsidian/10 dark:border-darkText/10 pt-6">
                            <button
                                onClick={() => { toggleTheme(); }}
                                className="w-full flex items-center px-6 py-4 rounded-2xl text-base font-medium text-obsidian dark:text-darkText hover:bg-obsidian/5 dark:hover:bg-darkText/5 transition-colors"
                            >
                                {isDark ? <Sun className="w-5 h-5 mr-4 opacity-70" /> : <Moon className="w-5 h-5 mr-4 opacity-70" />}
                                {isDark ? 'Light Mode' : 'Dark Mode'}
                            </button>
                            <button
                                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                                className="w-full flex items-center px-6 py-4 rounded-2xl text-base font-medium text-[#EA4335] hover:bg-[#EA4335]/10 transition-colors"
                            >
                                <LogOut className="w-5 h-5 mr-4 opacity-70" /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

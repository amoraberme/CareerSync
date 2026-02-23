import React, { useEffect, useState } from 'react';
import useWorkspaceStore from '../store/useWorkspaceStore';

export default function Navbar({ currentView, setCurrentView, onLogout }) {
    const [scrolled, setScrolled] = useState(false);
    const creditBalance = useWorkspaceStore(state => state.creditBalance);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
            <nav className={`transition-all duration-300 rounded-full px-6 py-3 flex items-center justify-between pointer-events-auto ${scrolled ? 'bg-slate/80 backdrop-blur-xl border border-surface/10 py-2 shadow-2xl w-full max-w-4xl' : 'w-full max-w-6xl'
                }`}>
                {/* Brand */}
                <div className="flex items-center space-x-1 cursor-pointer" onClick={() => setCurrentView('workspace')}>
                    <span className="font-sans font-bold text-xl text-surface tracking-tighter">Career<span className="font-drama italic font-normal text-champagne">Sync.</span></span>
                </div>

                {/* Links */}
                <div className="hidden md:flex items-center justify-center space-x-1 bg-surface/5 p-1 rounded-full border border-surface/10">
                    {[
                        { id: 'workspace', label: 'Workspace' },
                        { id: 'history', label: 'History' },
                        { id: 'billing', label: 'Billing' }
                    ].map(view => (
                        <button
                            key={view.id}
                            onClick={() => setCurrentView(view.id)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${currentView === view.id
                                ? 'bg-surface text-obsidian shadow-lg'
                                : 'text-surface/60 hover:text-surface'
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
                        <span className="text-xs font-mono text-surface/50 uppercase tracking-widest">{creditBalance} Credits</span>
                    </div>
                    <button onClick={onLogout} className="bg-surface/10 hover:bg-surface/20 text-surface text-sm font-medium px-4 py-2 rounded-full transition-colors border border-surface/10">
                        Sign Out
                    </button>
                </div>
            </nav>
        </div>
    );
}

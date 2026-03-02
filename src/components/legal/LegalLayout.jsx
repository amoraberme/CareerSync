import React from 'react';

const LegalLayout = ({ children, title, onBack, currentView, onNavigate }) => {
    return (
        <div className="min-h-screen bg-background dark:bg-darkBg transition-colors duration-300">
            {/* Background patterns */}
            <div className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-5 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-champagne rounded-full blur-[100px] will-change-transform"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate rounded-full blur-[100px] will-change-transform"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-24 will-change-transform">

                {/* Top Section */}
                <div className="mb-12">
                    <button
                        onClick={onBack}
                        className="group relative z-20 px-4 py-2 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate/50 hover:text-obsidian dark:hover:text-darkText transition-colors"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12 lg:gap-24">
                    {/* Sidebar Navigation */}
                    <aside className="lg:sticky lg:top-32 lg:h-[calc(100vh-8rem)]">
                        <nav className="flex flex-col gap-2">
                            <button
                                onClick={() => onNavigate('terms')}
                                className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === 'terms' ? 'bg-obsidian/5 dark:bg-darkText/10 text-obsidian dark:text-darkText font-bold' : 'text-slate/60 dark:text-darkText/50 hover:text-obsidian dark:hover:text-darkText hover:bg-obsidian/5 dark:hover:bg-darkText/5'}`}
                            >
                                Terms of Service
                            </button>
                            <button
                                onClick={() => onNavigate('privacy')}
                                className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentView === 'privacy' ? 'bg-obsidian/5 dark:bg-darkText/10 text-obsidian dark:text-darkText font-bold' : 'text-slate/60 dark:text-darkText/50 hover:text-obsidian dark:hover:text-darkText hover:bg-obsidian/5 dark:hover:bg-darkText/5'}`}
                            >
                                Privacy Policy
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <article className="prose prose-slate dark:prose-invert max-w-none 
                        prose-headings:font-sans prose-headings:tracking-tight prose-headings:font-bold 
                        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-obsidian dark:prose-h2:text-darkText
                        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                        prose-p:text-slate/80 dark:prose-p:text-darkText/70 prose-p:leading-relaxed prose-p:mb-6
                        prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
                        prose-li:text-slate/80 dark:prose-li:text-darkText/70 prose-li:mb-2
                        prose-strong:text-obsidian dark:prose-strong:text-darkText prose-strong:font-bold
                        prose-hr:border-obsidian/5 dark:prose-hr:border-darkText/5 prose-hr:my-12
                        bg-white dark:bg-darkCard/40 rounded-[2.5rem] border border-obsidian/5 dark:border-darkText/5 p-8 lg:p-16 shadow-xl shadow-obsidian/5
                        will-change-transform
                    ">
                        <h1 className="text-4xl lg:text-5xl font-sans tracking-tight text-obsidian dark:text-darkText font-bold mb-12">
                            {title}
                        </h1>
                        {children}
                    </article>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center">
                    <p className="text-xs font-mono uppercase tracking-widest text-slate/40 dark:text-darkText/20">
                        &copy; 2026 Career Sync. Proprietary Document.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LegalLayout;

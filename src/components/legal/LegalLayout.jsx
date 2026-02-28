import React from 'react';

const LegalLayout = ({ children, title, onBack }) => {
    return (
        <div className="min-h-screen bg-background dark:bg-darkBg transition-colors duration-300">
            {/* Background patterns - Optimized: removed mix-blend-modes and added will-change */}
            <div className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-5 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-champagne rounded-full blur-[100px] will-change-transform"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate rounded-full blur-[100px] will-change-transform"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 lg:py-24 will-change-transform">
                {/* Header */}
                <div className="mb-12 flex flex-col items-center text-center">
                    <button
                        onClick={onBack}
                        className="group relative z-20 px-4 py-2 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate/50 hover:text-obsidian dark:hover:text-darkText transition-colors mb-8"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    <h1 className="text-4xl lg:text-5xl font-sans tracking-tight text-obsidian dark:text-darkText font-bold mb-4">
                        {title}
                    </h1>
                    <div className="w-24 lg:w-32 h-1 bg-champagne rounded-full"></div>
                </div>

                {/* Content - Optimized: removed backdrop-blur and added GPU hints */}
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
                    {children}
                </article>

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

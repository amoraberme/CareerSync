import React from 'react';
import { motion } from 'framer-motion';
import SlideInButton from './animations/SlideInButton';

const PASSection = ({ onNavigate }) => {
    return (
        <section className="bg-surface dark:bg-darkCard border-y border-slate-200 dark:border-slate-800">
            <div className="max-w-4xl mx-auto px-6 py-24 text-center flex flex-col items-center gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center gap-6 w-full"
                >
                    {/* The Problem (Eyebrow) */}
                    <div className="font-mono text-xs uppercase tracking-widest text-[#FF3B30] bg-[#FF3B30]/10 px-3 py-1 rounded-full mb-4">
                        The System is Broken
                    </div>

                    {/* The Agitate (Headline) */}
                    <h2 className="text-4xl md:text-6xl font-sans font-bold text-obsidian dark:text-darkText tracking-tight">
                        You are being rejected by <span className="font-drama italic text-champagne font-normal">machines.</span>
                    </h2>

                    {/* The Agitate (Body) */}
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        You know you can do the job. But traditional ATS filters instantly discard career pivoters because your past titles don't perfectly match their rigid keyword requirements. Every application sent is a resume thrown into the void.
                    </p>

                    {/* The Solution (Sub-Body) */}
                    <p className="text-base md:text-lg text-slate-800 dark:text-slate-300 font-medium max-w-2xl mx-auto mt-4">
                        Stop guessing what the algorithm wants. CareerSync’s Apex-ATS v2.0 engine extracts your hidden transferable skills and forces the system to see your true value.
                    </p>

                    {/* The Call To Action (CTA) */}
                    <div className="mt-8 w-full sm:w-auto h-16 min-w-[250px]">
                        <SlideInButton
                            text="Bypass the Filter"
                            onClick={() => onNavigate('auth')}
                            className="w-full h-full text-lg shadow-xl"
                        />
                    </div>

                </motion.div>
            </div>
        </section>
    );
};

export default PASSection;

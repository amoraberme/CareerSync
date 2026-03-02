import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQItem({ number, question, answer }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            className="w-full border-b border-obsidian/10 dark:border-darkText/10 py-6"
            initial={false}
            onClick={() => setIsOpen(!isOpen)}
        >
            <button className="flex w-full items-start justify-between text-left group">
                <div className="flex gap-4 md:gap-8 items-start">
                    <span className="text-xl md:text-2xl font-mono text-slate/50 dark:text-darkText/40 group-hover:text-champagne transition-colors">
                        {number}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-obsidian dark:text-darkText group-hover:text-obsidian/80 dark:group-hover:text-darkText/80 transition-colors mt-0.5">
                        {question}
                    </h3>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-shrink-0 ml-4 mt-1 text-obsidian dark:text-darkText p-1 rounded-full bg-slate-100 dark:bg-darkCard group-hover:bg-champagne/10 group-hover:text-champagne transition-colors"
                >
                    <ChevronDown className="w-5 h-5" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto", marginTop: "16px" },
                            collapsed: { opacity: 0, height: 0, marginTop: "0px" }
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden pl-12 md:pl-16 pr-4"
                    >
                        <p className="text-slate dark:text-darkText/80 text-sm md:text-base leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

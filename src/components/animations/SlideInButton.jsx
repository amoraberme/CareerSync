import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function SlideInButton({
    onClick,
    text = "Start your journey",
    className = ""
}) {
    return (
        <motion.button
            onClick={onClick}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            className={`group relative flex items-center justify-between overflow-hidden rounded-full font-bold shadow-lg hover:shadow-xl bg-surface dark:bg-darkCard border border-obsidian/10 dark:border-darkText/10 ${className}`}
        >
            {/* Sliding Background */}
            <motion.div
                className="absolute left-0 top-0 bottom-0 z-0 bg-obsidian dark:bg-darkText"
                variants={{
                    idle: { width: "0%" },
                    hover: { width: "100%" },
                    tap: { width: "100%" }
                }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            />

            {/* Container for text and icon */}
            <div className="relative z-10 flex items-center justify-between w-full h-full px-6 py-4">
                <span className="text-base text-obsidian dark:text-darkText group-hover:text-background dark:group-hover:text-darkBg transition-colors duration-300">
                    {text}
                </span>

                <motion.div
                    variants={{
                        idle: { x: 0 },
                        hover: { x: 4 },
                        tap: { x: 4 }
                    }}
                    transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                    className="ml-4 flex flex-shrink-0 text-obsidian dark:text-darkText group-hover:text-background dark:group-hover:text-darkBg transition-colors duration-300"
                >
                    <ArrowRight className="w-5 h-5" />
                </motion.div>
            </div>
        </motion.button>
    );
}

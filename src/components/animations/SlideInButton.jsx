import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function SlideInButton({
    onClick,
    text = "Get Started",
    className = "",
    defaultBg = "var(--tw-colors-background)",
    hoverBg = "var(--tw-colors-obsidian)",
    defaultText = "var(--tw-colors-obsidian)",
    hoverText = "var(--tw-colors-background)",
    darkDefaultBg = "var(--tw-colors-darkCard)",
    darkHoverBg = "var(--tw-colors-darkText)",
    darkDefaultText = "var(--tw-colors-darkText)",
    darkHoverText = "var(--tw-colors-darkBg)"
}) {
    return (
        <motion.button
            onClick={onClick}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            className={`relative flex items-center justify-between overflow-hidden rounded-full font-bold shadow-lg transition-shadow hover:shadow-xl ${className}`}
            style={{
                padding: "4px",
            }}
        >
            {/* Background fill that slides from the left icon area */}
            <motion.div
                className="absolute left-0 top-0 bottom-0 rounded-full z-0 bg-obsidian dark:bg-darkText"
                variants={{
                    idle: { left: "4px", top: "4px", bottom: "4px", width: "40px", borderRadius: "100px" },
                    hover: { left: "0px", top: "0px", bottom: "0px", width: "100%", borderRadius: "100px" },
                    tap: { left: "0px", top: "0px", bottom: "0px", width: "100%", borderRadius: "100px" }
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />

            {/* Inner Content Container */}
            <motion.div
                className="relative z-10 flex items-center h-full w-full bg-background dark:bg-darkBg rounded-full"
                variants={{
                    idle: { backgroundColor: "var(--tw-colors-background)", paddingLeft: "16px", paddingRight: "60px" },
                    hover: { backgroundColor: "transparent", paddingLeft: "24px", paddingRight: "52px" },
                    tap: { backgroundColor: "transparent", paddingLeft: "24px", paddingRight: "52px" }
                }}
                transition={{ duration: 0.2 }}
            >
                {/* Dark mode background override via class toggles is tricky with framer variants targeting backgroundColor natively. 
                    We'll use standard CSS transitions for the background instead, relying on the parent wrapper for the dark mode class contexts. */}
                <div className="absolute inset-0 rounded-full bg-background dark:bg-darkCard transition-colors" />

                <motion.span
                    className="relative z-10 text-base py-3"
                    variants={{
                        idle: { color: "var(--tw-colors-obsidian)" },
                        hover: { color: "var(--tw-colors-background)" }
                    }}
                >
                    <span className="dark:hidden leading-none">{text}</span>
                    <span className="hidden dark:inline leading-none" style={{ color: "var(--tw-colors-darkBg)" }}>{text}</span>
                </motion.span>
            </motion.div>

            {/* Icon Container (stays on top) */}
            <motion.div
                className="absolute right-2 z-20 flex items-center justify-center w-10 h-10 rounded-full pointer-events-none"
                variants={{
                    idle: { x: 0 },
                    hover: { x: -4 },
                    tap: { x: -2 }
                }}
            >
                <ArrowRight className="w-5 h-5 text-background dark:text-darkBg" />
            </motion.div>
        </motion.button>
    );
}

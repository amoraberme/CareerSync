import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RevealPreloader({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Start exit animation after 1.5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Allow exit animation to complete before signaling parent
            setTimeout(onComplete, 1000);
        }, 1500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    // Parent wrapper that animates out
    const overlayVariants = {
        hidden: { y: "-100%", filter: "blur(10px)", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } },
        visible: { y: 0, filter: "blur(0px)" }
    };

    // Text that animates in
    const textVariants = {
        hidden: { y: 100, opacity: 0, filter: "blur(10px)" },
        visible: {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: { type: "spring", stiffness: 100, damping: 20, delay: 0.2 }
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial="visible"
                    exit="hidden"
                    variants={overlayVariants}
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-white dark:bg-darkBg overflow-hidden h-screen w-screen"
                >
                    {/* The text/logo reveal */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={textVariants}
                        className="flex items-center gap-3"
                    >
                        <img src="/logo.png" alt="Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                        <span className="text-4xl md:text-6xl font-bold font-mono tracking-tighter text-obsidian dark:text-darkText">
                            CareerSync
                        </span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

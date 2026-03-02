import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SmartTypewriterText({
    text = "The AI-powered career intelligence platform designed for job seekers. Instantly score, optimize, and generate materials tailored to your target role.",
    className = "",
    typeSpeed = 30, // ms per char
    startDelay = 500,
    start = true
}) {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (!start) return;

        let timeout;
        let currentIndex = 0;

        const startTyping = () => {
            setIsTyping(true);
            const typeChar = () => {
                if (currentIndex < text.length) {
                    setDisplayedText(text.substring(0, currentIndex + 1));
                    currentIndex++;
                    timeout = setTimeout(typeChar, typeSpeed);
                } else {
                    setIsTyping(false);
                }
            };
            typeChar();
        };

        timeout = setTimeout(startTyping, startDelay);

        return () => clearTimeout(timeout);
    }, [text, typeSpeed, startDelay, start]);

    return (
        <div className={`relative inline-block ${className}`}>
            <span>{displayedText}</span>
            <motion.span
                animate={{ opacity: isTyping ? [1, 0] : 0 }}
                transition={{
                    duration: 0.8,
                    repeat: isTyping ? Infinity : 0,
                    repeatType: "reverse"
                }}
                className="inline-block w-[2px] h-[1em] bg-current ml-1 align-middle"
                style={{ opacity: 0 }}
            />
        </div>
    );
}

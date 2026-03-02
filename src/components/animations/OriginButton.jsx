import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OriginButton({
    label = "START YOUR JOURNEY",
    rectangleColor = "var(--tw-colors-obsidian)",
    textColor = "var(--tw-colors-darkText)",
    circleColor = "var(--tw-colors-champagne)",
    hoverTextColor = "var(--tw-colors-obsidian)",
    onClick,
    className = ""
}) {
    const [isHovered, setIsHovered] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleMouseEnter = (e) => {
        setIsHovered(true);
        handleMouseMove(e);
    };

    const handleMouseLeave = (e) => {
        setIsHovered(false);
    };

    const maxDimension = 1200;

    return (
        <button
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`relative overflow-hidden w-full rounded-2xl cursor-pointer shadow-xl ${className}`}
            style={{
                backgroundColor: rectangleColor,
                minHeight: '64px'
            }}
        >
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ scale: 0, x: "-50%", y: "-50%", left: cursorPos.x, top: cursorPos.y }}
                        animate={{ scale: 1, x: "-50%", y: "-50%", left: cursorPos.x, top: cursorPos.y }}
                        exit={{ scale: 0, transition: { duration: 0.3 } }}
                        transition={{ duration: 0.5, ease: [0.4, 1.2, 0.6, 1] }}
                        style={{
                            position: "absolute",
                            width: maxDimension,
                            height: maxDimension,
                            borderRadius: "50%",
                            backgroundColor: circleColor,
                            pointerEvents: "none",
                            zIndex: 0
                        }}
                    />
                )}
            </AnimatePresence>

            <div className="relative z-10 w-full h-full flex items-center justify-center p-4 transition-transform duration-300">
                <span
                    className="font-bold tracking-wide uppercase transition-colors duration-200"
                    style={{ color: isHovered ? hoverTextColor : textColor }}
                >
                    {label}
                </span>
            </div>
        </button>
    );
}

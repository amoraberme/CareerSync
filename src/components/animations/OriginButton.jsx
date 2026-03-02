import React, { useState, useRef, useTransition } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

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
    const [, startTransition] = useTransition();

    const scale = useMotionValue(0);
    const smoothScale = useSpring(scale, { stiffness: 85, damping: 18, restDelta: 0.001 });
    const easedScale = useTransform(smoothScale, [0, 1], [0, 1], { ease: t => t * t });

    const handleMouseEnter = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        startTransition(() => {
            setCursorPos({ x, y });
            setIsHovered(true);
        });
        scale.set(1);
    };

    const handleMouseLeave = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        startTransition(() => {
            setCursorPos({ x, y });
        });
        scale.set(0);
        startTransition(() => {
            setIsHovered(false);
        });
    };

    // Calculate max dimension to ensure circle covers the entire rect
    // Assume max width 600
    const maxDimension = 1200;

    return (
        <button
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`relative overflow-hidden w-full rounded-2xl cursor-pointer shadow-xl ${className}`}
            style={{
                backgroundColor: rectangleColor,
                minHeight: '64px'
            }}
        >
            {/* The expanding physical circle */}
            <motion.div
                style={{
                    position: "absolute",
                    left: cursorPos.x,
                    top: cursorPos.y,
                    width: maxDimension,
                    height: maxDimension,
                    borderRadius: "50%",
                    backgroundColor: circleColor,
                    scale: easedScale,
                    x: "-50%",
                    y: "-50%",
                    pointerEvents: "none"
                }}
            />

            {/* Standard Button Contents overlying the circle */}
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

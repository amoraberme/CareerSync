import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Inline hover tooltip with a (?) trigger icon.
 * Props:
 *   text  — the tooltip content string
 *   icon  — optional custom icon element (defaults to HelpCircle)
 *   align — 'left' | 'right' | 'center' (default 'left') — where the tooltip box opens relative to the icon
 */
export default function Tooltip({ text, icon, align = 'left' }) {
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef(null);

    const alignClass = {
        left: 'left-0',
        right: 'right-0',
        center: 'left-1/2 -translate-x-1/2',
    }[align] ?? 'left-0';

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            setVisible(true);
        }, 1000);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <span
            className="relative inline-flex items-center cursor-help ml-1.5"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
            tabIndex={0}
            role="tooltip"
            aria-label={text}
        >
            {icon ?? <HelpCircle className="w-3.5 h-3.5 text-slate/50 dark:text-darkText/40 hover:text-slate dark:hover:text-darkText/70 transition-colors shrink-0" />}

            {visible && (
                <span
                    className={`absolute bottom-full mb-2 ${alignClass} z-[300] w-72 bg-obsidian dark:bg-darkCard text-white dark:text-darkText text-xs leading-relaxed rounded-2xl px-4 py-3 shadow-2xl border border-white/10 dark:border-darkText/10 pointer-events-none`}
                    style={{ animation: 'fadeInUp 0.15s ease-out' }}
                >
                    {text}
                    {/* Little arrow */}
                    <span className="absolute top-full left-4 border-4 border-transparent border-t-obsidian dark:border-t-darkCard" />
                </span>
            )}
        </span>
    );
}

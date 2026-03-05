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
    const wrapperRef = useRef(null);

    // Position offset classes — the tooltip floats above the icon
    const alignClass = {
        left: 'left-0',
        right: 'right-0',
        center: 'left-1/2 -translate-x-1/2',
    }[align] ?? 'left-0';

    // Arrow horizontal position mirrors the align prop
    const arrowClass = {
        left: 'left-3',
        right: 'right-3',
        center: 'left-1/2 -translate-x-1/2',
    }[align] ?? 'left-3';

    const show = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setVisible(true), 400);
    };

    const hide = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setVisible(false);
    };

    useEffect(() => {
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, []);

    return (
        <span
            ref={wrapperRef}
            className="relative inline-flex items-center cursor-help ml-1.5 shrink-0"
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
            tabIndex={0}
            role="tooltip"
            aria-label={text}
        >
            {/* Trigger icon */}
            {icon ?? (
                <HelpCircle className="w-3.5 h-3.5 text-slate/40 dark:text-darkText/30 hover:text-slate dark:hover:text-darkText/60 transition-colors duration-200 shrink-0" />
            )}

            {/* Tooltip bubble — CSS transition so it fades smoothly */}
            <span
                className={`
                    pointer-events-none
                    absolute bottom-full mb-2.5 ${alignClass}
                    z-[9999]
                    w-64 max-w-[min(16rem,calc(100vw-2rem))]
                    bg-obsidian dark:bg-[#1a1a1a]
                    text-white dark:text-darkText
                    text-xs leading-relaxed
                    rounded-2xl px-4 py-3
                    shadow-2xl shadow-black/30
                    border border-white/10 dark:border-white/5
                    transition-all duration-200 ease-out
                    ${visible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-1 select-none'
                    }
                `}
            >
                {text}
                {/* Arrow */}
                <span
                    className={`absolute top-full ${arrowClass} border-[5px] border-transparent border-t-obsidian dark:border-t-[#1a1a1a]`}
                />
            </span>
        </span>
    );
}

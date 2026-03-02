import React, { useState, useMemo } from "react";

export default function SwipeLettersButton({
    label = "GET IN TOUCH",
    defaultState = { bgColor: "var(--tw-colors-obsidian)", borderColor: "rgba(15,17,21,0.2)", textColor: "var(--tw-colors-darkText)" }, // Using obsidian and darkText
    hoverState = { bgColor: "var(--tw-colors-surface)", borderColor: "rgba(15,17,21,0.4)", textColor: "var(--tw-colors-obsidian)" },
    radius = 9999,
    paddingX = 24,
    paddingY = 16,
    font = { fontSize: "12px", variant: "800", letterSpacing: "1.5px", textAlign: "center", textTransform: "uppercase" },
    align = "center",
    showBorder = true,
    direction = "alternate",
    duration = 380,
    easing = "cubic-bezier(.25,.75,.25,1)",
    stagger = 18,
    onClick,
    className = ""
}) {
    const [hovered, setHovered] = useState(false);

    // Replace spaces with non-breaking spaces for proper flex gap alignment
    const chars = useMemo(() => Array.from(label || "").map(c => (c === " " ? "\xa0" : c)), [label]);

    const currentBgColor = hovered ? hoverState.bgColor : defaultState.bgColor;
    const currentBorderColor = hovered ? hoverState.borderColor : defaultState.borderColor;
    const currentTextColor = hovered ? hoverState.textColor : defaultState.textColor;

    return (
        <button
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
            className={`relative overflow-hidden cursor-pointer select-none transition-all duration-200 outline-none ${className}`}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: align === "center" ? "center" : align === "start" ? "flex-start" : "flex-end",
                backgroundColor: currentBgColor,
                borderRadius: radius,
                border: showBorder ? `1px solid ${currentBorderColor}` : "none",
            }}
        >
            <div
                style={{
                    padding: `${paddingY}px ${paddingX}px`,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: align === "center" ? "center" : align === "start" ? "flex-start" : "flex-end",
                    gap: `${parseFloat(font.letterSpacing) || 0}px`,
                }}
            >
                {chars.map((ch, i) => {
                    const dir = direction === "alternate" ? (i % 2 === 0 ? "top" : "bottom") : direction;
                    const initY = dir === "top" ? "-50%" : "0%";
                    const hoverY = dir === "top" ? "0%" : "-50%";
                    const delay = `${i * stagger}ms`;

                    return (
                        <span
                            key={`${ch}-${i}`}
                            className="font-mono tracking-widest uppercase font-bold text-xs"
                            style={{
                                position: "relative",
                                display: "inline-block",
                                height: "1em",
                                height: "1.25em",
                                overflow: "hidden",
                                fontSize: font.fontSize,
                                fontWeight: font.variant,
                                textTransform: font.textTransform,
                                lineHeight: 1.25,
                            }}
                        >
                            <span
                                style={{
                                    display: "grid",
                                    gridAutoRows: "1.25em",
                                    transform: `translateY(${hovered ? hoverY : initY})`,
                                    transitionProperty: "transform",
                                    transitionDuration: `${duration}ms`,
                                    transitionTimingFunction: easing,
                                    transitionDelay: delay,
                                    willChange: "transform",
                                }}
                            >
                                <span style={{ color: currentTextColor, transition: "color 0.2s ease" }}>{ch}</span>
                                <span style={{ color: currentTextColor, transition: "color 0.2s ease" }}>{ch}</span>
                            </span>
                        </span>
                    );
                })}
            </div>
        </button>
    );
}

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import useWorkspaceStore from '../../store/useWorkspaceStore';

export default function ThemeToggleButton({
    size = 40,
    switchTrackColor = "var(--tw-colors-obsidian)", // Obsidian for dark track
    switchActiveColor = "#EAD1A6", // Champagne for active track
    SunIconColor = "var(--tw-colors-obsidian)", // #0F1115
    MoonIconColor = "#FFFFFF"
}) {
    const isDark = useWorkspaceStore(state => state.isDark);
    const toggleTheme = useWorkspaceStore(state => state.toggleTheme);

    const switchWidth = size * 1.8;
    const switchHeight = size * 1;
    const knobSize = switchHeight * 0.8;
    const knobIconSize = knobSize * 0.6;
    const borderRadius = switchHeight / 2;

    // Reacting to isDark (inverse of isLightMode from framer)
    const isLightMode = !isDark;

    return (
        <button
            type="button"
            aria-pressed={isDark}
            onClick={toggleTheme}
            style={{
                width: switchWidth,
                height: switchHeight,
                background: isLightMode ? switchActiveColor : switchTrackColor,
                border: "none",
                borderRadius: borderRadius,
                position: "relative",
                cursor: "pointer",
                transition: "background 0.2s ease-in-out",
                boxShadow: isLightMode ? "0 1px 3px rgba(0,0,0,0.06)" : "0 2px 8px rgba(0,0,0,0.10)",
                outline: "none",
                padding: 0
            }}
            className="flex-shrink-0"
        >
            <span
                style={{
                    position: "absolute",
                    top: (switchHeight - knobSize) / 2,
                    // The magic sliding calculation from Framer
                    left: isLightMode
                        ? switchWidth - knobSize - (switchHeight - knobSize) / 2
                        : (switchHeight - knobSize) / 2,
                    width: knobSize,
                    height: knobSize,
                    borderRadius: "50%",
                    background: isLightMode ? "#FFFFFF" : "#222425",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
                    transition: "left 0.2s cubic-bezier(.4,1.2,.6,1), background-color 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10
                }}
            >
                {isLightMode ? (
                    <Sun size={knobIconSize} color={SunIconColor} strokeWidth={2.5} />
                ) : (
                    <Moon size={knobIconSize} color={MoonIconColor} strokeWidth={2.5} />
                )}
            </span>
        </button>
    );
}

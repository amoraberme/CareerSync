import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const nodes = [
    { id: 1, label: "Management", x: "20%", y: "20%" },
    { id: 2, label: "Developers", x: "80%", y: "25%" },
    { id: 3, label: "Teamwork", x: "85%", y: "75%" },
    { id: 4, label: "Projects", x: "15%", y: "80%" },
    { id: 5, label: "Operations", x: "50%", y: "15%" },
    { id: 6, label: "Strategy", x: "50%", y: "85%" },
    { id: 7, label: "Analysis", x: "10%", y: "50%" },
    { id: 8, label: "Communication", x: "90%", y: "50%" }
];

const TransferableBridge = () => {
    const [hoveredNode, setHoveredNode] = useState(null);

    return (
        <section className="py-24 relative w-full overflow-hidden bg-background dark:bg-darkBg border-t border-obsidian/5 dark:border-darkText/5">
            {/* Ambient Base Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full -z-10 opacity-20 dark:opacity-10 blur-[120px] pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-champagne rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#27C93F] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-4xl md:text-5xl font-sans font-bold text-obsidian dark:text-darkText tracking-tight text-center mb-16 z-20 relative">
                    Uncover Your <span className="font-drama italic text-champagne font-normal">Hidden Network</span>
                </h2>

                {/* The Interactive Map Container */}
                <div className="relative w-full h-[600px] md:h-[700px] bg-surface dark:bg-[#0a0a0a] rounded-3xl border border-obsidian/10 dark:border-white/5 overflow-hidden font-mono shadow-2xl">

                    {/* SVG Connections Layer (z-0) */}
                    <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                        {nodes.map(node => {
                            const isHovered = hoveredNode === node.id;
                            const isFaded = hoveredNode !== null && hoveredNode !== node.id;

                            // Determine Coordinates (parsing the % string)
                            // We use SVG's built-in percentage support for x1/y1/x2/y2

                            return (
                                <motion.line
                                    key={`line-${node.id}`}
                                    x1="50%"
                                    y1="50%"
                                    x2={node.x}
                                    y2={node.y}
                                    stroke={isHovered ? "var(--color-champagne)" : "currentColor"}
                                    className={isHovered ? "text-champagne drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" : "text-obsidian/20 dark:text-darkText/10"}
                                    strokeWidth={isHovered ? 2 : 1}
                                    animate={{
                                        opacity: isHovered ? [0.6, 1, 0.6] : (isFaded ? 0.1 : 0.4),
                                    }}
                                    transition={{
                                        opacity: {
                                            repeat: isHovered ? Infinity : 0,
                                            duration: 1.5,
                                            ease: "easeInOut"
                                        }
                                    }}
                                />
                            );
                        })}
                    </svg>

                    {/* Nodes Layer (z-10 absolute divs) */}

                    {/* Center Node (Always fixed at 50/50, always in focus or pulsing glow if something is hovered) */}
                    <motion.div
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-obsidian dark:bg-black text-white px-6 py-3 rounded-full border shadow-xl flex items-center justify-center gap-2 whitespace-nowrap transition-colors duration-500 ${hoveredNode !== null ? 'border-champagne/80 text-champagne' : 'border-white/20'}`}
                        animate={{
                            scale: hoveredNode !== null ? 1.05 : 1,
                            boxShadow: hoveredNode !== null ? "0 0 30px rgba(212,175,55,0.4)" : "0 4px 6px rgba(0,0,0,0.1)"
                        }}
                    >
                        <div className={`w-3 h-3 rounded-full ${hoveredNode !== null ? 'bg-champagne animate-pulse' : 'bg-white/50'}`} />
                        <span className="font-bold text-sm tracking-widest uppercase font-sans">Target Role</span>
                    </motion.div>

                    {/* Orbital Nodes */}
                    {nodes.map(node => {
                        const isHovered = hoveredNode === node.id;
                        const isFaded = hoveredNode !== null && !isHovered;

                        return (
                            <motion.div
                                key={`node-${node.id}`}
                                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                                style={{ top: node.y, left: node.x }}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                animate={{
                                    scale: isHovered ? 1.15 : (isFaded ? 0.85 : 1),
                                    opacity: isHovered ? 1 : (isFaded ? 0.2 : 0.8),
                                    filter: isHovered ? "blur(0px)" : (isFaded ? "blur(4px)" : "blur(1px)"),
                                    zIndex: isHovered ? 30 : 10
                                }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                <div className={`relative px-4 py-2 rounded-full border backdrop-blur-md transition-colors duration-300 text-xs md:text-sm whitespace-nowrap flex items-center gap-2 ${isHovered
                                        ? 'bg-champagne/10 border-champagne text-champagne shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                                        : 'bg-white/50 dark:bg-darkCard/80 border-slate-300 dark:border-white/10 text-obsidian dark:text-darkText'
                                    }`}>
                                    <div className={`w-2 h-2 rounded-full ${isHovered ? 'bg-champagne animate-pulse' : 'bg-slate-400 dark:bg-slate-600'}`} />
                                    <span>{node.label}</span>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Bottom Status Terminal Overlay */}
                    <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none z-30">
                        <AnimatePresence mode="popLayout">
                            {hoveredNode !== null ? (
                                <motion.div
                                    key="active-status"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="bg-black/80 backdrop-blur-md border border-champagne/30 text-[#27C93F] text-[10px] uppercase px-4 py-2 rounded shadow-2xl flex gap-3"
                                >
                                    <span>&gt; CONNECTION_ESTABLISHED</span>
                                    <span className="text-champagne font-bold">SYNERGY DETECTED</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle-status"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-black/50 backdrop-blur-sm border border-white/10 text-slate-400 text-[10px] uppercase px-4 py-2 rounded"
                                >
                                    <span>HOVER NODE TO INITIATE MAPPING ENGINE</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default TransferableBridge;

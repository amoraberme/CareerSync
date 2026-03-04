import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Organic Structural Node Map
const nodes = [
    { id: 0, label: "Skill", x: 50, y: 50 },

    // Inner Ring
    { id: 1, label: "Management", x: 35, y: 65 },
    { id: 2, label: "Analysis", x: 30, y: 40 },
    { id: 3, label: "Projects", x: 60, y: 60 },
    { id: 4, label: "Strategy", x: 52, y: 35 },
    { id: 5, label: "Teamwork", x: 65, y: 45 },
    { id: 6, label: "Developers", x: 55, y: 75 },
    { id: 7, label: "Nover", x: 65, y: 55 },

    // Middle Ring
    { id: 8, label: "Design", x: 25, y: 55 },
    { id: 9, label: "Operations", x: 22, y: 63 },
    { id: 10, label: "Communication", x: 20, y: 35 },
    { id: 11, label: "Leadership", x: 40, y: 25 },
    { id: 12, label: "Vector", x: 75, y: 40 },
    { id: 13, label: "Mapping", x: 72, y: 65 },
    { id: 14, label: "Logic", x: 45, y: 85 },
    { id: 15, label: "Synthesis", x: 80, y: 55 },

    // Outer Ring (Messy)
    { id: 16, label: "Optimization", x: 15, y: 45 },
    { id: 17, label: "Agile", x: 30, y: 15 },
    { id: 18, label: "Data", x: 10, y: 60 },
    { id: 19, label: "Workflow", x: 85, y: 35 },
    { id: 20, label: "Cloud", x: 88, y: 60 },
    { id: 21, label: "Automation", x: 35, y: 85 },
    { id: 22, label: "Scaling", x: 65, y: 88 },
    { id: 23, label: "Metrics", x: 65, y: 20 },
    { id: 24, label: "Architecture", x: 15, y: 25 },
    { id: 25, label: "Delivery", x: 90, y: 48 },
];

const edges = [
    // Center to Inner Ring
    { source: 0, target: 1 }, { source: 0, target: 2 }, { source: 0, target: 3 },
    { source: 0, target: 4 }, { source: 0, target: 5 }, { source: 0, target: 6 },
    { source: 0, target: 7 },

    // Inner Ring interconnections
    { source: 1, target: 2 }, { source: 1, target: 6 }, { source: 2, target: 4 },
    { source: 3, target: 5 }, { source: 3, target: 6 }, { source: 4, target: 5 },
    { source: 5, target: 7 }, { source: 3, target: 7 },

    // Inner to Middle
    { source: 2, target: 8 }, { source: 1, target: 9 }, { source: 2, target: 10 },
    { source: 4, target: 11 }, { source: 5, target: 12 }, { source: 3, target: 13 },
    { source: 6, target: 14 }, { source: 7, target: 15 }, { source: 5, target: 15 },

    // Middle interconnections
    { source: 8, target: 9 }, { source: 10, target: 8 }, { source: 11, target: 2 },
    { source: 12, target: 15 }, { source: 13, target: 15 }, { source: 14, target: 6 },
    { source: 9, target: 14 },

    // Middle to Outer
    { source: 10, target: 16 }, { source: 8, target: 18 }, { source: 11, target: 17 },
    { source: 12, target: 19 }, { source: 15, target: 20 }, { source: 14, target: 21 },
    { source: 13, target: 22 }, { source: 11, target: 23 }, { source: 10, target: 24 },
    { source: 15, target: 25 },

    // Outer interconnections (creating the messy web)
    { source: 16, target: 24 }, { source: 17, target: 23 }, { source: 19, target: 25 },
    { source: 20, target: 25 }, { source: 21, target: 22 }, { source: 18, target: 9 },
    { source: 16, target: 18 }
];

const TransferableBridge = () => {
    const [hoveredNode, setHoveredNode] = useState(null);

    // Helper function to check if an edge is connected to the hovered node
    const isEdgeConnected = (edge, hoveredId) => {
        if (hoveredId === null) return false;
        return edge.source === hoveredId || edge.target === hoveredId;
    };

    // Helper function to check if a node is connected to the hovered node
    const isNodeConnected = (nodeId, hoveredId) => {
        if (hoveredId === null) return false;
        if (nodeId === hoveredId) return true;
        // Check edges for any connection between nodeId and hoveredId
        return edges.some(edge =>
            (edge.source === nodeId && edge.target === hoveredId) ||
            (edge.target === nodeId && edge.source === hoveredId)
        );
    };

    return (
        <section className="py-24 relative w-full overflow-hidden bg-background dark:bg-darkBg border-t border-obsidian/5 dark:border-darkText/5">
            {/* Ambient Base Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full z-0 opacity-20 dark:opacity-10 blur-[120px] pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-champagne rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#27C93F] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                <h2 className="text-4xl md:text-5xl font-sans font-bold text-obsidian dark:text-darkText tracking-tight text-center mb-16 relative z-20">
                    Uncover Your <span className="font-drama italic text-champagne font-normal">Hidden Network</span>
                </h2>

                {/* The Interactive Floating Web Container (Box destroyed) */}
                <div className="relative w-full min-h-[600px] md:min-h-[700px] flex items-center justify-center bg-transparent overflow-visible">

                    {/* SVG Connections Layer (z-0) */}
                    <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-visible">
                        {edges.map((edge, index) => {
                            const sourceNode = nodes.find(n => n.id === edge.source);
                            const targetNode = nodes.find(n => n.id === edge.target);

                            if (!sourceNode || !targetNode) return null;

                            const connectedToHover = isEdgeConnected(edge, hoveredNode);
                            const isFaded = hoveredNode !== null && !connectedToHover;

                            return (
                                <motion.line
                                    key={`edge-${index}`}
                                    x1={`${sourceNode.x}%`}
                                    y1={`${sourceNode.y}%`}
                                    x2={`${targetNode.x}%`}
                                    y2={`${targetNode.y}%`}
                                    stroke={connectedToHover ? "var(--color-champagne)" : "currentColor"}
                                    className={connectedToHover ? "text-champagne drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] z-10" : "text-slate-400 dark:text-slate-600"}
                                    strokeWidth={connectedToHover ? 2 : 1}
                                    animate={{
                                        opacity: connectedToHover ? [0.5, 1, 0.5] : (isFaded ? 0.1 : 0.4),
                                    }}
                                    transition={{
                                        opacity: {
                                            repeat: connectedToHover ? Infinity : 0,
                                            duration: 1.5,
                                            ease: "easeInOut"
                                        }
                                    }}
                                />
                            );
                        })}
                    </svg>

                    {/* Nodes Layer (z-10 absolute divs) */}
                    {nodes.map(node => {
                        const isHovered = hoveredNode === node.id;
                        const isConnected = isNodeConnected(node.id, hoveredNode);
                        const isFaded = hoveredNode !== null && !isConnected;

                        return (
                            <motion.div
                                key={`node-${node.id}`}
                                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                                style={{ top: `${node.y}%`, left: `${node.x}%` }}
                                onMouseEnter={() => setHoveredNode(node.id)}
                                onMouseLeave={() => setHoveredNode(null)}
                                animate={{
                                    scale: isHovered ? 1.15 : (isFaded ? 0.85 : 1),
                                    opacity: isHovered ? 1 : (isFaded ? 0.2 : (node.id === 0 ? 1 : 0.8)),
                                    filter: isHovered ? "blur(0px)" : (isFaded ? "blur(4px)" : "blur(1px)"),
                                    zIndex: isHovered ? 30 : (isConnected ? 20 : 10)
                                }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                <div className={`relative px-3 py-1.5 md:px-4 md:py-2 rounded-full border backdrop-blur-md transition-colors duration-300 text-[10px] md:text-sm whitespace-nowrap flex items-center justify-center font-mono ${isHovered
                                        ? 'bg-champagne/10 border-champagne text-champagne shadow-[0_0_20px_rgba(212,175,55,0.3)] font-bold'
                                        : 'bg-background/70 dark:bg-darkBg/70 border-slate-300 dark:border-slate-700 text-obsidian dark:text-darkText'
                                    }`}>
                                    {/* Optional dot for visual anchor */}
                                    {isHovered && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-champagne animate-pulse shadow-[0_0_8px_rgba(212,175,55,1)]" />}
                                    <span>{node.label}</span>
                                </div>
                            </motion.div>
                        );
                    })}

                </div>
            </div>
        </section>
    );
};

export default TransferableBridge;

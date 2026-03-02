import React from 'react';
import { motion } from 'framer-motion';

export default function NeumorphismButton({
    onClick,
    text = "Get in touch",
    className = ""
}) {
    return (
        <motion.button
            onClick={onClick}
            initial="idle"
            whileHover="hover"
            whileTap="hover"
            className={`px-6 py-3 rounded-[98px] font-semibold text-[18px] text-[#474747] flex items-center justify-center ${className}`}
            style={{
                backgroundColor: 'rgb(216, 216, 216)'
            }}
            variants={{
                idle: {
                    boxShadow: "7px 6px 10px 0px rgba(0, 0, 0, 0.34), -0.4px -0.4px 2.8px -0.875px rgba(255, 255, 255, 0.68), -1.2px -1.2px 8.5px -1.75px rgba(255, 255, 255, 0.65), -3.2px -3.2px 22.5px -2.625px rgba(255, 255, 255, 0.57), -10px -10px 70.7px -3.5px rgba(255, 255, 255, 0.3)"
                },
                hover: {
                    boxShadow: "inset 2px 1px 3px 1px rgba(115, 115, 115, 0.34), inset -1px -1px 4px 0px rgba(255, 255, 255, 0.84)"
                }
            }}
            transition={{
                duration: 0.3,
                ease: "easeOut"
            }}
        >
            {text}
        </motion.button>
    );
}

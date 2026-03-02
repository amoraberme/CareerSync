import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Undo2, CheckCircle2 } from 'lucide-react';

export default function DeleteAccountButton({ onDelete, className = "" }) {
    // states: "idle", "confirming", "deleted"
    const [state, setState] = useState("idle");
    const [timeLeft, setTimeLeft] = useState(10);

    useEffect(() => {
        let timer;
        if (state === "confirming") {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setState("deleted");
                        if (onDelete) onDelete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setTimeLeft(10);
        }

        return () => clearInterval(timer);
    }, [state, onDelete]);

    return (
        <div className={`relative h-12 flex justify-center w-full ${className}`}>
            <AnimatePresence mode="wait">
                {state === "idle" && (
                    <motion.button
                        key="idle"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        onClick={() => setState("confirming")}
                        className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl border-2 border-[#EA4335]/30 text-[#EA4335] font-medium text-sm hover:bg-[#EA4335]/5 hover:border-[#EA4335]/50 transition-colors active:scale-[0.98]"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Account</span>
                    </motion.button>
                )}

                {state === "confirming" && (
                    <motion.div
                        key="confirming"
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="flex items-center p-1 rounded-full bg-slate-100 dark:bg-darkText/10 w-fit h-full shadow-inner"
                    >
                        <button
                            onClick={() => setState("idle")}
                            className="h-full px-4 rounded-full bg-[#EA4335] text-white flex items-center justify-center hover:bg-[#EA4335]/90 transition-colors mr-2"
                        >
                            <Undo2 className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">Cancel deletion</span>
                        </button>
                        <div className="h-full px-4 rounded-full bg-white dark:bg-darkCard text-[#EA4335] border border-obsidian/5 dark:border-darkText/5 flex items-center justify-center min-w-[3rem] font-bold">
                            {timeLeft}
                        </div>
                    </motion.div>
                )}

                {state === "deleted" && (
                    <motion.div
                        key="deleted"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="h-full px-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg"
                    >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        <span className="text-sm font-bold">Deleted</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

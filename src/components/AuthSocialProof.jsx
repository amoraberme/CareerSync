import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const reviews = [
    {
        quote: "The deep parsing engine identified experience gaps I had no idea were holding me back. I implemented the strategy and landed three interviews in a week.",
        handle: "@alex_design",
        name: "Alex M.",
        role: "Senior UX Designer"
    },
    {
        quote: "Unlike generic resume tools, this actually aligned my achievements with the hidden requirements of the target roles. It feels like having an insider at the company.",
        handle: "@sarah_pm",
        name: "Sarah T.",
        role: "Product Manager"
    },
    {
        quote: "The 1:1 theme parity and dark mode design made my late-night focus sessions incredibly smooth. Truly a masterclass in UX.",
        handle: "@davidcodes",
        name: "David K.",
        role: "Frontend Engineer"
    },
    {
        quote: "I was struggling with ATS systems for months. After using CareerSync's targeted phrasing corrections, my application went straight to the hiring manager.",
        handle: "@emily_mktg",
        name: "Emily R.",
        role: "Marketing Director"
    },
    {
        quote: "The instant feedback loop on my resume match score gave me the confidence to apply for roles I thought were out of reach.",
        handle: "@michael_data",
        name: "Michael B.",
        role: "Data Scientist"
    },
    {
        quote: "A game-changer for career pivoting. It broke down complex job descriptions into actionable steps, guiding my entire interview prep.",
        handle: "@jess_ops",
        name: "Jessica L.",
        role: "Operations Lead"
    },
    {
        quote: "Enterprise-grade security meets consumer-grade aesthetics. I trust this platform with my data as much as I rely on its career insights.",
        handle: "@james_sec",
        name: "James N.",
        role: "Security Analyst"
    },
    {
        quote: "It's not just a resume scanner; it's a strategic blueprint. The AI doesn't just tell you what's wrong, it shows you exactly how to fix it.",
        handle: "@elena_arch",
        name: "Elena G.",
        role: "Software Architect"
    },
    {
        quote: "The market demand benchmarking is uncannily accurate. It helped me negotiate a 20% higher base salary by proving my skill alignment.",
        handle: "@ryan_biz",
        name: "Ryan C.",
        role: "Business Analyst"
    },
    {
        quote: "Flawless execution. The automated strategy saved me hours of manual tailoring for each application. Essential for any serious job seeker.",
        handle: "@olivia_growth",
        name: "Olivia W.",
        role: "Growth Strategy"
    }
];

export default function AuthSocialProof() {
    const [review, setReview] = useState(null);

    useEffect(() => {
        // Randomly select one review on mount
        const randomIndex = Math.floor(Math.random() * reviews.length);
        setReview(reviews[randomIndex]);
    }, []);

    if (!review) return null;

    return (
        <div className="h-full w-full flex flex-col justify-center items-center relative overflow-hidden px-12 md:px-20">
            {/* Background elements */}
            <div className="absolute top-10 left-12 z-20">
                <h1 className="text-obsidian dark:text-darkText font-bold text-3xl tracking-tighter shadow-sm">
                    Career<span className="font-drama italic font-normal text-champagne ml-1">Sync.</span>
                </h1>
            </div>

            {/* Giant watermark quote */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.02] pointer-events-none">
                <Quote className="w-[400px] h-[400px] text-obsidian dark:text-white transform -rotate-12" />
            </div>

            {/* Content centered */}
            <AnimatePresence>
                <motion.div
                    key={review.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 w-full max-w-lg"
                >
                    <Quote className="w-10 h-10 text-champagne mb-8 opacity-80" />

                    <p className="text-2xl md:text-3xl font-sans tracking-tight text-obsidian dark:text-darkText leading-relaxed mb-10 font-medium">
                        "{review.quote}"
                    </p>

                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-champagne/80 to-champagne/40 flex items-center justify-center text-obsidian font-bold text-lg shadow-sm border border-obsidian/5 dark:border-darkText/10">
                            {review.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-obsidian dark:text-darkText text-base">
                                {review.name}
                            </p>
                            <p className="text-sm font-mono text-slate dark:text-darkText/50 tracking-tight">
                                {review.role} <span className="opacity-50 mx-1">•</span> {review.handle}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

import React from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const ReviewCard = React.forwardRef(
    ({ name, handle, review, rating, imageUrl, className, variants, initial, animate, exit, transition, custom, onMouseEnter, onMouseLeave }, ref) => {
        return (
            <motion.div
                ref={ref}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className={cn(
                    "bg-white dark:bg-darkCard text-obsidian dark:text-darkText border border-obsidian/10 dark:border-darkText/10 rounded-2xl p-6 shadow-sm w-full max-w-sm mx-auto",
                    className
                )}
                variants={variants}
                initial={initial}
                animate={animate}
                exit={exit}
                transition={transition}
                custom={custom}
                role="article"
                aria-labelledby={`review-author-${name.replace(/\s+/g, '-')}`}
                aria-describedby={`review-content-${name.replace(/\s+/g, '-')}`}
            >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <img
                            src={imageUrl}
                            alt={`Avatar of ${name}`}
                            className="w-12 h-12 rounded-full object-cover border border-obsidian/10 dark:border-darkText/10"
                        />
                        <div>
                            <h3 id={`review-author-${name.replace(/\s+/g, '-')}`} className="text-lg font-bold font-sans">
                                {name}
                            </h3>
                            <p className="text-sm font-mono text-slate dark:text-darkText/60 absolute-hover">{handle}</p>
                        </div>
                    </div>
                    {/* Rating Section */}
                    <div className="flex items-center gap-1 text-lg font-bold text-obsidian dark:text-darkText">
                        <Star className="w-5 h-5 text-champagne fill-champagne" />
                        <span>{rating.toFixed(1)}</span>
                    </div>
                </div>

                {/* Card Body */}
                <p id={`review-content-${name.replace(/\s+/g, '-')}`} className="mt-4 text-sm text-slate dark:text-darkText/80 leading-relaxed">
                    "{review}"
                </p>
            </motion.div>
        );
    }
);

ReviewCard.displayName = "ReviewCard";

export { ReviewCard };

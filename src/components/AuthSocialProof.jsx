import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const reviews = [
    { handle: "@shifty_shifter", text: "finally a tool na di sabaw. shifting careers is hard af pero the resume optimization helped me highlight my transferable skills. got an offer!" },
    { handle: "@korpo_slave", text: "omg tbh umiyak ako ng slight bc the ai generated a better summary than what i wrote in 3 days. seryoso use this if pagod na kayo mag isip" },
    { handle: "@it_gurl01", text: "the ats checker is insane?? parang nalaman ko bakit puro auto-reject ako dati lol. tweaked my cv here & got 2 hr calls today." },
    { handle: "@juan_dela_cruz", text: "tbh akala ko scam na naman tong mga ai ai na to but it actually works. it matched my exp with the job desc perfectly. galing" },
    { handle: "@mktg_baddie", text: "saved me so much time w the cover letter generation. just edited a few lines para mas tunog ako but the structure is 10/10. applying rn!!" },
    { handle: "@jobless_nomore", text: "super helpful nito promise. nakaka drain mag apply everyday pero this platform made tweaking resumes per company so much easier" },
    { handle: "@z_gen_ceee", text: "this site is my roman empire rn. why did nobody tell me about this sooner?? my cv looks so professional na i would hire myself tbh" },
    { handle: "@paolo_hustles", text: "solid tool. medyo nahirapan lang ako sa ui nung una pero the scoring feature is top tier. dami kong natutunan sa keywords lang" },
    { handle: "@cpa_dreams", text: "literally the ultimate cheat code for job hunting. ung ats score ko went from 45% to 89% in mins. sana makapasa na dis" },
    { handle: "@burntout_peon", text: "as someone na laging ghosted ng hr, the ats optimization here is pretty accurate. saves u from being filtered out. go try it out guys!!" }
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
                    key={review.handle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 w-full max-w-lg"
                >
                    <Quote className="w-10 h-10 text-champagne mb-8 opacity-80" />

                    <p className="text-2xl md:text-3xl font-sans tracking-tight text-obsidian dark:text-darkText leading-relaxed mb-10 font-medium">
                        "{review.text}"
                    </p>

                    <div className="flex items-center space-x-4">
                        <div>
                            <p className="text-sm font-mono text-slate dark:text-darkText/50 tracking-tight font-bold">
                                {review.handle}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

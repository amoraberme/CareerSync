import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Testimonials() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReviews() {
            try {
                const { data, error } = await supabase
                    .from('user_reviews')
                    .select(`
                        id, 
                        rating, 
                        review_text,
                        user_profiles(full_name)
                    `)
                    .eq('is_approved', true)
                    .order('created_at', { ascending: false })
                    .limit(6);

                if (error) throw error;
                setReviews(data || []);
            } catch (error) {
                console.error('Error fetching testimonials:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, []);

    if (loading || reviews.length === 0) return null; // Hide section if no reviews

    return (
        <section className="py-24 px-6 relative border-t border-obsidian/5 dark:border-darkText/5 overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-full -z-10 opacity-20 dark:opacity-10 blur-[100px] pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-champagne via-transparent to-champagne rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-champagne mb-4 block font-bold">Verified Trajectories</span>
                    <h2 className="text-4xl md:text-5xl font-sans font-bold text-obsidian dark:text-darkText tracking-tight">
                        Backed by <span className="font-drama italic text-champagne font-normal">Success</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((review, i) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="bg-surface dark:bg-darkCard rounded-3xl p-8 border border-obsidian/5 dark:border-darkText/5 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
                        >
                            <Quote className="absolute top-6 right-6 w-12 h-12 text-obsidian/5 dark:text-darkText/5 transform rotate-180 pointer-events-none" />

                            <div className="flex items-center space-x-1 mb-4">
                                {[...Array(5)].map((_, index) => (
                                    <Star
                                        key={index}
                                        className={`w-4 h-4 ${index < review.rating ? 'fill-champagne text-champagne' : 'text-obsidian/10 dark:text-darkText/10'}`}
                                    />
                                ))}
                            </div>

                            <p className="font-sans text-sm text-obsidian dark:text-darkText/90 leading-relaxed mb-6 italic relative z-10">
                                "{review.review_text}"
                            </p>

                            <div className="flex items-center space-x-3 mt-auto relative z-10 border-t border-obsidian/5 dark:border-darkText/5 pt-4">
                                <div className="w-8 h-8 rounded-full bg-obsidian dark:bg-darkText flex items-center justify-center">
                                    <span className="text-background dark:text-darkBg font-bold text-xs">
                                        {(review.user_profiles?.full_name || 'A').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-obsidian dark:text-darkText text-sm">
                                        {review.user_profiles?.full_name || 'Anonymous user'}
                                    </span>
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#34A853]">Verified Pivot</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Star, MessageSquareQuote, CheckCircle2, Clock } from 'lucide-react';

export default function SubmitReview({ session }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error' | 'cooldown'
    const [errorMessage, setErrorMessage] = useState('');
    const [nextReviewDate, setNextReviewDate] = useState(null);
    const [loadingCooldown, setLoadingCooldown] = useState(true);

    // On mount, check if the user has submitted a review in the last 30 days
    useEffect(() => {
        async function checkCooldown() {
            if (!session?.user?.id) return;
            try {
                const { data, error } = await supabase
                    .from('user_reviews')
                    .select('created_at')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data && !error) {
                    const lastReview = new Date(data.created_at);
                    const unlockDate = new Date(lastReview.getTime() + 30 * 24 * 60 * 60 * 1000);
                    if (unlockDate > new Date()) {
                        setNextReviewDate(unlockDate);
                        setStatus('cooldown');
                    }
                }
            } catch (_) {
                // PGRST116 = no rows found, which means no prior review — that's fine
            } finally {
                setLoadingCooldown(false);
            }
        }
        checkCooldown();
    }, [session]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setErrorMessage('Please select a rating.');
            setStatus('error');
            return;
        }

        if (!reviewText.trim()) {
            setErrorMessage('Please write a review.');
            setStatus('error');
            return;
        }

        setStatus('submitting');

        try {
            const { error } = await supabase
                .from('user_reviews')
                .insert({
                    user_id: session.user.id,
                    rating: rating,
                    review_text: reviewText.trim()
                });

            if (error) throw error;

            setStatus('success');
            setRating(0);
            setReviewText('');
        } catch (error) {
            console.error('Error submitting review:', error);
            setErrorMessage(error.message || 'Failed to submit review.');
            setStatus('error');
        }
    };

    // Format the unlock date nicely
    const formatDate = (date) => date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    if (loadingCooldown) return null;

    // Cooldown — show locked state
    if (status === 'cooldown') {
        return (
            <div className="bg-surface dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-obsidian/5 dark:bg-darkText/10 text-slate dark:text-darkText/50 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-obsidian dark:text-darkText mb-2">Review Submitted</h4>
                <p className="text-slate dark:text-darkText/60 text-sm leading-relaxed">
                    Thank you for your feedback! You can submit your next review on<br />
                    <strong className="text-champagne">{formatDate(nextReviewDate)}</strong>.
                </p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="bg-surface dark:bg-darkCard/40 border border-[#34A853]/20 shadow-sm rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-12 h-12 bg-[#34A853]/10 text-[#34A853] rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-obsidian dark:text-darkText mb-2">Thank you!</h4>
                <p className="text-slate dark:text-darkText/60 text-sm">
                    Your review has been recorded and is pending moderation. You can submit again in 30 days.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-surface dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
                <MessageSquareQuote className="w-5 h-5 text-champagne" />
                <h3 className="text-lg font-bold text-obsidian dark:text-darkText tracking-tight">Leave a Review</h3>
            </div>

            <p className="text-sm text-slate dark:text-darkText/60 mb-6">
                Share your experience transforming your career with CareerSync. Your feedback helps us improve the engine.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star Rating */}
                <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="p-1 focus:outline-none transition-transform hover:scale-110"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            <Star
                                className={`w-6 h-6 ${star <= (hoverRating || rating)
                                    ? 'fill-champagne text-champagne'
                                    : 'text-obsidian/20 dark:text-darkText/20'
                                    } transition-colors duration-200`}
                            />
                        </button>
                    ))}
                    <span className="ml-3 text-xs font-mono text-slate dark:text-darkText/40 uppercase tracking-widest">
                        {rating > 0 ? `${rating} / 5` : 'Rate'}
                    </span>
                </div>

                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="How did CareerSync impact your job search?"
                    className="w-full h-24 bg-background dark:bg-darkCard border border-obsidian/10 dark:border-darkText/10 rounded-xl px-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors resize-none text-sm"
                />

                {status === 'error' && (
                    <div className="text-xs text-[#EA4335] font-medium px-1">
                        {errorMessage}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full py-3 rounded-xl bg-obsidian dark:bg-darkText text-background dark:text-darkBg font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center btn-magnetic"
                >
                    {status === 'submitting' ? (
                        <div className="w-4 h-4 border-2 border-background/20 dark:border-darkBg/20 border-t-background dark:border-t-darkBg rounded-full animate-spin"></div>
                    ) : (
                        'Submit Review'
                    )}
                </button>
            </form>
        </div>
    );
}

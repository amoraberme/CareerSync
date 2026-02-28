import React, { useState } from 'react';
import { X, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({ name: '', email: '', concern: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to send message');

            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus(null);
                setFormData({ name: '', email: '', concern: '' });
            }, 3000);
        } catch (error) {
            setStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-darkCard border border-obsidian/10 dark:border-darkText/10 rounded-3xl p-6 md:p-8 shadow-2xl animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate hover:text-obsidian dark:text-darkText/50 dark:hover:text-darkText transition-colors rounded-full hover:bg-obsidian/5 dark:hover:bg-darkText/5">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-obsidian dark:text-darkText mb-2">Contact Us</h2>
                <p className="text-slate dark:text-darkText/60 mb-6 text-sm">Fill out the form below and we'll get back to you shortly.</p>

                {status === 'success' && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center text-emerald-500 text-sm">
                        <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
                        Message sent successfully!
                    </div>
                )}

                {status === 'error' && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center text-red-500 text-sm">
                        <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                        Failed to send message. Please try again.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/50 mb-2">Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-background dark:bg-darkBg border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-xl px-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/50 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-background dark:bg-darkBg border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-xl px-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/50 mb-2">Concern</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.concern}
                            onChange={e => setFormData({ ...formData, concern: e.target.value })}
                            className="w-full bg-background dark:bg-darkBg border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-xl px-4 py-3 text-obsidian dark:text-darkText placeholder:text-obsidian/30 dark:placeholder:text-darkText/30 focus:outline-none focus:border-champagne/50 focus:ring-1 focus:ring-champagne/50 transition-colors resize-none"
                            placeholder="How can we help you?"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-4 py-4 rounded-2xl bg-obsidian dark:bg-darkText text-background dark:text-darkBg font-bold hover:scale-[1.02] transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-background/20 dark:border-darkBg/20 border-t-background dark:border-t-darkBg rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" /> Send Message
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

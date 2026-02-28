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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Contact Us</h2>
                <p className="text-zinc-400 mb-6 text-sm">Fill out the form below and we'll get back to you shortly.</p>

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
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Concern</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.concern}
                            onChange={e => setFormData({ ...formData, concern: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors resize-none"
                            placeholder="How can we help you?"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2 py-3.5 px-4 bg-white text-zinc-950 font-semibold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
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

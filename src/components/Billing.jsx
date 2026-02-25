import React, { useRef, useEffect, useState } from 'react';
import { Check, CreditCard, ShieldCheck, AlertCircle, Download, X, QrCode, Smartphone, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../supabaseClient';
import useWorkspaceStore from '../store/useWorkspaceStore';

// Detect mobile/tablet devices for adaptive checkout behavior
const isMobileDevice = () => /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

export default function Billing({ session }) {
    const containerRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(null);

    // QR modal state for desktop checkout
    const [qrModal, setQrModal] = useState(null); // { qr_image, checkout_url, tier }
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    const fetchCreditBalance = useWorkspaceStore(state => state.fetchCreditBalance);

    const handleCheckout = async (tier) => {
        if (!session?.user?.id) {
            import('./ui/Toast').then(({ toast }) => {
                toast.error(
                    <div className="flex flex-col">
                        <strong className="font-bold text-lg mb-1">Authentication Required</strong>
                        <span className="opacity-90">Please log in to proceed with checkout.</span>
                    </div>
                );
            });
            return;
        }

        setIsProcessing(tier);
        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(currentSession?.access_token && { 'Authorization': `Bearer ${currentSession.access_token}` })
                },
                body: JSON.stringify({ tier })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || data.error || 'Failed to generate checkout link');
            }

            if (isMobileDevice()) {
                // Mobile: redirect directly — PayMongo handles GCash/Maya deep-link automatically
                window.location.href = data.checkout_url;
            } else {
                // Desktop: show QR modal so user can scan with their phone
                setQrModal({
                    qr_image: data.qr_image,
                    checkout_url: data.checkout_url,
                    tier
                });
                setPaymentConfirmed(false);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            import('./ui/Toast').then(({ toast }) => {
                toast.error(
                    <div className="flex flex-col">
                        <strong className="font-bold text-lg mb-1">Checkout Failed</strong>
                        <span className="opacity-90">Unable to initialize checkout. Please try again.</span>
                    </div>
                );
            });
        } finally {
            setIsProcessing(null);
        }
    };

    // Called when user confirms payment is done — refreshes their credit balance
    const handlePaymentDone = async () => {
        setPaymentConfirmed(true);
        if (session?.user?.id) {
            await fetchCreditBalance(session.user.id);
        }
        setTimeout(() => {
            setQrModal(null);
            setPaymentConfirmed(false);
        }, 2000);
    };

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from('.pricing-card', {
                scale: 0.9,
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out'
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto py-12 px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-sans tracking-tight text-obsidian dark:text-darkText mb-4 font-semibold">
                    Strategic <span className="font-drama italic text-champagne font-normal">Advantage</span>
                </h2>
                <p className="text-slate dark:text-darkText/70 max-w-2xl mx-auto text-lg leading-relaxed">
                    Choose the intelligence capacity that matches your professional throughput. Lock in your precision toolkit today.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-center">
                {/* Tier 1: Base Token — Pay-As-You-Go */}
                <div className="pricing-card bg-white dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-[2rem] p-6 md:p-8 flex flex-col items-center text-center order-2 lg:order-1 lg:translate-y-4">
                    <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-2">Base Token</h3>
                    <div className="text-slate dark:text-darkText/70 font-mono text-xs uppercase tracking-widest mb-6">Pay-As-You-Go</div>
                    <div className="text-4xl md:text-5xl font-sans font-bold text-obsidian dark:text-darkText mb-8">₱100<span className="text-base md:text-lg text-slate dark:text-darkText/70 font-normal"> / Top-up</span></div>

                    <div className="text-sm text-obsidian/80 dark:text-darkText/80 bg-background dark:bg-darkCard p-4 rounded-xl border border-obsidian/5 dark:border-darkText/5 mb-8 w-full mt-2 lg:min-h-[100px] flex items-center justify-center">
                        Perfect for quick, one-off tasks. Every top-up grants 10 credits.
                    </div>

                    <div className="space-y-4 mb-8 w-full text-left text-sm">
                        <div className="flex items-start text-obsidian/90 dark:text-darkText/90">
                            <Check className="w-4 h-4 text-slate dark:text-darkText/70 mr-3 mt-1 shrink-0" />
                            <span>10 Credits per top-up</span>
                        </div>
                        <div className="flex items-start text-obsidian/90 dark:text-darkText/90">
                            <Check className="w-4 h-4 text-slate dark:text-darkText/70 mr-3 mt-1 shrink-0" />
                            <span>Basic analysis tools</span>
                        </div>
                        <div className="flex items-start text-obsidian/90 dark:text-darkText/90">
                            <Check className="w-4 h-4 text-slate dark:text-darkText/70 mr-3 mt-1 shrink-0" />
                            <span>5-Recent History View</span>
                        </div>
                        <div className="flex items-start text-[#EA4335]/80 mt-4">
                            <span className="w-4 h-4 mr-3 mt-0.5 shrink-0 text-center font-bold">✕</span>
                            <span className="line-through opacity-80 text-xs">Strictly NO download features</span>
                        </div>
                        <div className="flex items-start text-[#EA4335]/80 mt-2">
                            <span className="w-4 h-4 mr-3 mt-0.5 shrink-0 text-center font-bold">✕</span>
                            <span className="line-through opacity-80 text-xs">NO Resume Optimization</span>
                        </div>
                    </div>

                    <button
                        onClick={() => handleCheckout('base')}
                        disabled={isProcessing !== null}
                        className="mt-auto w-full py-4 rounded-2xl border border-obsidian/10 dark:border-darkText/10 text-obsidian/70 dark:text-darkText/70 font-bold hover:bg-background dark:hover:bg-darkCard/60 transition-colors block text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing === 'base' ? 'Generating Secure Link...' : 'Add Credits'}
                    </button>
                </div>

                {/* Tier 3: Premium (center spotlight) */}
                <div className="pricing-card relative bg-white/70 dark:bg-darkCard/60 backdrop-blur-md border-[3px] border-champagne rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center shadow-xl order-1 lg:order-2 z-10">
                    <div className="absolute -top-5 bg-champagne text-obsidian px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
                        Most Popular
                    </div>
                    <h3 className="text-3xl font-bold text-champagne mb-2">Premium</h3>
                    <div className="text-champagne/80 font-mono text-xs uppercase tracking-widest mb-6">The Professional Upgrade</div>
                    <div className="text-5xl md:text-6xl font-sans font-bold text-obsidian dark:text-darkText mb-2">₱295<span className="text-lg md:text-xl text-slate dark:text-darkText/70 font-normal"> / mo</span></div>

                    <div className="text-sm text-obsidian/80 dark:text-darkText/80 bg-champagne/10 dark:bg-champagne/5 p-4 rounded-xl border border-champagne/20 dark:border-champagne/10 mb-8 w-full mt-2 lg:min-h-[100px] flex items-center justify-center">
                        For a mathematically insignificant upgrade over the 245 tier, unlock complete workflow freedom and powerful resume optimization.
                    </div>

                    <div className="space-y-4 mb-8 w-full text-left">
                        <div className="flex items-start text-obsidian dark:text-darkText">
                            <Check className="w-5 h-5 text-champagne mr-3 mt-0.5 shrink-0" />
                            <span><strong className="text-champagne">35 credits</strong> per day</span>
                        </div>
                        <div className="flex items-start text-obsidian dark:text-darkText">
                            <Download className="w-5 h-5 text-champagne mr-3 mt-0.5 shrink-0" />
                            <span><strong className="text-champagne">Full PDF Export</strong> capabilities</span>
                        </div>
                        <div className="flex items-start text-obsidian/80 dark:text-darkText/80">
                            <Check className="w-5 h-5 text-champagne/80 mr-3 mt-0.5 shrink-0" />
                            <span>Detailed resume optimization surgery</span>
                        </div>
                        <div className="flex items-start text-obsidian/80 dark:text-darkText/80">
                            <Check className="w-5 h-5 text-champagne/80 mr-3 mt-0.5 shrink-0" />
                            <span>Unlimited History View</span>
                        </div>
                    </div>

                    <button
                        onClick={() => handleCheckout('premium')}
                        disabled={isProcessing !== null}
                        className="mt-auto w-full py-5 rounded-2xl bg-champagne text-obsidian font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl block text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing === 'premium' ? 'Securing Premium Access...' : 'Secure Premium Access'}
                    </button>
                </div>

                {/* Tier 2: Standard */}
                <div className="pricing-card bg-white dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-[2rem] p-6 md:p-8 flex flex-col items-center text-center order-3 lg:order-3 lg:translate-y-4 relative z-0">
                    <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-2">Standard</h3>
                    <div className="text-slate dark:text-darkText/70 font-mono text-xs uppercase tracking-widest mb-6">Monthly Retainer</div>
                    <div className="text-4xl md:text-5xl font-sans font-bold text-obsidian dark:text-darkText mb-8">₱245<span className="text-base md:text-lg text-slate dark:text-darkText/70 font-normal"> / mo</span></div>

                    <div className="text-sm text-obsidian/80 dark:text-darkText/80 bg-background dark:bg-darkCard p-4 rounded-xl border border-obsidian/5 dark:border-darkText/5 mb-8 w-full mt-2 lg:min-h-[100px] flex items-center justify-center">
                        Consistent daily access with full export rights, but limited to standard outputs.
                    </div>

                    <div className="space-y-4 mb-8 w-full text-left text-sm">
                        <div className="flex items-start text-obsidian/90 dark:text-darkText/90">
                            <Check className="w-4 h-4 text-slate dark:text-darkText/70 mr-3 mt-1 shrink-0" />
                            <span>25 credits per day</span>
                        </div>
                        <div className="flex items-start text-obsidian/90 dark:text-darkText/90">
                            <Check className="w-4 h-4 text-slate dark:text-darkText/70 mr-3 mt-1 shrink-0" />
                            <span>Full PDF Export capabilities</span>
                        </div>
                        <div className="flex items-start text-obsidian/90 dark:text-darkText/90">
                            <Check className="w-4 h-4 text-slate dark:text-darkText/70 mr-3 mt-1 shrink-0" />
                            <span>Standard Cover Letters</span>
                        </div>
                        <div className="flex items-start text-[#EA4335]/80 mt-4">
                            <span className="w-4 h-4 mr-3 mt-0.5 shrink-0 text-center font-bold">✕</span>
                            <span className="line-through opacity-80 text-xs">NO Resume Optimization</span>
                        </div>
                    </div>

                    <button
                        onClick={() => handleCheckout('standard')}
                        disabled={isProcessing !== null}
                        className="mt-auto w-full py-4 rounded-2xl bg-obsidian/5 dark:bg-darkText/5 border border-obsidian/10 dark:border-darkText/10 text-obsidian dark:text-darkText hover:bg-obsidian/10 dark:hover:bg-darkText/10 font-bold transition-colors block text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing === 'standard' ? 'Initializing Checkout...' : 'Subscribe to Standard'}
                    </button>
                </div>
            </div>

            {/* ── Desktop QR Modal ── */}
            {qrModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-white/70 dark:bg-darkBg/70 backdrop-blur-md"
                        onClick={() => !paymentConfirmed && setQrModal(null)}
                    />

                    <div className="relative bg-white dark:bg-darkBg border border-obsidian/10 dark:border-darkText/10 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-fade-in-up text-center">
                        {/* Close */}
                        {!paymentConfirmed && (
                            <button
                                onClick={() => setQrModal(null)}
                                className="absolute top-5 right-5 text-slate/50 hover:text-obsidian dark:hover:text-darkText transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}

                        {paymentConfirmed ? (
                            /* Success state */
                            <div className="animate-fade-in">
                                <div className="w-16 h-16 bg-[#34A853]/10 border border-[#34A853]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck className="w-8 h-8 text-[#34A853]" />
                                </div>
                                <h3 className="text-xl font-bold text-obsidian dark:text-darkText mb-2">Payment Confirmed</h3>
                                <p className="text-sm text-slate dark:text-darkText/60">Your credits are being updated...</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-center space-x-2 mb-6">
                                    <QrCode className="w-5 h-5 text-champagne" />
                                    <h3 className="text-xl font-bold text-obsidian dark:text-darkText">Scan to Pay</h3>
                                </div>

                                {/* QR Code */}
                                {qrModal.qr_image ? (
                                    <img
                                        src={qrModal.qr_image}
                                        alt="PayMongo QR Code"
                                        className="w-52 h-52 mx-auto rounded-2xl border border-obsidian/10 dark:border-darkText/10 shadow-sm mb-4"
                                    />
                                ) : (
                                    <div className="w-52 h-52 mx-auto rounded-2xl border-2 border-dashed border-obsidian/20 dark:border-darkText/20 flex items-center justify-center mb-4">
                                        <QrCode className="w-12 h-12 text-obsidian/30 dark:text-darkText/30" />
                                    </div>
                                )}

                                <p className="text-xs text-slate dark:text-darkText/60 mb-2">
                                    Use <strong>GCash</strong>, <strong>Maya</strong>, or any QR Ph app
                                </p>
                                <p className="text-xs font-semibold text-obsidian dark:text-darkText mb-6">
                                    Amount: <span className="text-champagne">
                                        ₱{qrModal.tier === 'base' ? '50' : qrModal.tier === 'standard' ? '245' : '295'}
                                    </span>
                                </p>

                                {/* Mobile fallback link */}
                                <a
                                    href={qrModal.checkout_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center space-x-1 text-xs text-champagne hover:text-champagne/80 transition-colors mb-6"
                                >
                                    <Smartphone className="w-3.5 h-3.5" />
                                    <span>Open payment page instead</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>

                                <button
                                    onClick={handlePaymentDone}
                                    className="w-full py-4 rounded-2xl bg-obsidian dark:bg-darkText text-background dark:text-darkBg font-bold hover:scale-[1.02] transition-transform shadow-md"
                                >
                                    I've Completed Payment
                                </button>
                                <p className="text-[11px] text-slate/50 dark:text-darkText/30 mt-3">
                                    Credits are granted automatically after payment is confirmed.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

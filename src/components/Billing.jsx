import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Check, CreditCard, ShieldCheck, AlertCircle, Download, X, QrCode, Smartphone, ExternalLink, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../supabaseClient';
import useWorkspaceStore from '../store/useWorkspaceStore';

const isMobileDevice = () => /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

export default function Billing({ session }) {
    const containerRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(null);

    // Static QR modal state (Base Token)
    const [showQrModal, setShowQrModal] = useState(false);
    const [referenceNumber, setReferenceNumber] = useState('');
    const [submitState, setSubmitState] = useState('idle');
    const [submitMessage, setSubmitMessage] = useState('');

    // Dynamic checkout QR modal state (Standard/Premium)
    const [qrModal, setQrModal] = useState(null);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    // ═══ PERSISTENT PAYMENT STATUS (survives modal close & page refresh) ═══
    const [pendingPayment, setPendingPayment] = useState(null);    // { id, reference_number, status, tier, created_at }
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const fetchCreditBalance = useWorkspaceStore(state => state.fetchCreditBalance);

    // ─── Check for pending payments on page load ───
    const checkPendingPayments = useCallback(async () => {
        if (!session?.user?.id) return null;

        try {
            const { data, error } = await supabase
                .from('payment_verifications')
                .select('id, reference_number, status, tier, credits_to_grant, created_at')
                .eq('user_id', session.user.id)
                .in('status', ['pending'])
                .order('created_at', { ascending: false })
                .limit(1);

            if (!error && data && data.length > 0) {
                setPendingPayment(data[0]);
                return data[0];
            } else {
                setPendingPayment(null);
                return null;
            }
        } catch (err) {
            console.error('Error checking pending payments:', err);
            return null;
        }
    }, [session?.user?.id]);

    // Run on mount + when session changes — recovers state after refresh
    useEffect(() => {
        checkPendingPayments();
    }, [checkPendingPayments]);

    // ─── Polling: runs OUTSIDE the modal too, tied to pendingPayment state ───
    const pollingRef = useRef(null);
    const pollingCountRef = useRef(0);

    useEffect(() => {
        // Start polling whenever there's a pending payment
        if (pendingPayment && pendingPayment.status === 'pending') {
            pollingCountRef.current = 0;

            pollingRef.current = setInterval(async () => {
                pollingCountRef.current++;

                // Re-check payment status from DB
                const { data } = await supabase
                    .from('payment_verifications')
                    .select('id, status, credits_to_grant')
                    .eq('id', pendingPayment.id)
                    .single();

                if (data?.status === 'verified') {
                    // Payment confirmed! Update everything
                    clearInterval(pollingRef.current);
                    setPendingPayment(prev => ({ ...prev, status: 'verified' }));
                    setStatusMessage(`✅ Payment verified! ${data.credits_to_grant} credits added.`);

                    // Refresh credit balance
                    if (session?.user?.id) {
                        await fetchCreditBalance(session.user.id);
                    }

                    // Auto-clear the success banner after 8 seconds
                    setTimeout(() => {
                        setPendingPayment(null);
                        setStatusMessage('');
                    }, 8000);
                }

                // Stop polling after 5 minutes (60 attempts × 5s)
                if (pollingCountRef.current >= 60) {
                    clearInterval(pollingRef.current);
                }
            }, 5000);
        }

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [pendingPayment?.id, pendingPayment?.status, session?.user?.id, fetchCreditBalance]);

    // ─── Manual "Check Payment Status" button ───
    const handleCheckStatus = async () => {
        setIsCheckingStatus(true);
        setStatusMessage('');

        try {
            // Check the specific pending payment
            if (pendingPayment) {
                const { data } = await supabase
                    .from('payment_verifications')
                    .select('id, status, credits_to_grant')
                    .eq('id', pendingPayment.id)
                    .single();

                if (data?.status === 'verified') {
                    setPendingPayment(prev => ({ ...prev, status: 'verified' }));
                    setStatusMessage(`✅ Payment verified! ${data.credits_to_grant} credits added.`);
                    if (session?.user?.id) await fetchCreditBalance(session.user.id);
                    setTimeout(() => { setPendingPayment(null); setStatusMessage(''); }, 8000);
                } else {
                    setStatusMessage('⏳ Payment not yet confirmed. It can take a few minutes — we\'ll update automatically.');
                    setTimeout(() => setStatusMessage(''), 5000);
                }
            } else {
                // No pending payment — just refresh credits in case webhook already ran
                if (session?.user?.id) await fetchCreditBalance(session.user.id);
                setStatusMessage('Your credit balance has been refreshed.');
                setTimeout(() => setStatusMessage(''), 3000);
            }
        } catch (err) {
            setStatusMessage('Unable to check status. Please try again.');
            setTimeout(() => setStatusMessage(''), 3000);
        } finally {
            setIsCheckingStatus(false);
        }
    };

    // ─── Base Token: Static QR + Reference Matching ───
    const handleBaseCheckout = () => {
        if (!session?.user?.id) {
            import('./ui/Toast').then(({ toast }) => {
                toast.error(
                    <div className="flex flex-col">
                        <strong className="font-bold text-lg mb-1">Authentication Required</strong>
                        <span className="opacity-90">Please log in to proceed.</span>
                    </div>
                );
            });
            return;
        }
        setShowQrModal(true);
        setReferenceNumber('');
        setSubmitState('idle');
        setSubmitMessage('');
    };

    const handleReferenceSubmit = async (e) => {
        e.preventDefault();
        if (!referenceNumber.trim() || referenceNumber.trim().length < 4) {
            setSubmitState('error');
            setSubmitMessage('Please enter a valid reference number (at least 4 characters).');
            return;
        }

        setSubmitState('submitting');
        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            const response = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(currentSession?.access_token && { 'Authorization': `Bearer ${currentSession.access_token}` })
                },
                body: JSON.stringify({
                    reference_number: referenceNumber.trim(),
                    tier: 'base',
                    amount: 500
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit reference number.');
            }

            setSubmitState('success');
            setSubmitMessage(data.message || 'Reference submitted! Credits will be granted once confirmed.');

            // Set the pending payment state — this triggers persistent polling
            // even if the modal is closed
            await checkPendingPayments();

        } catch (error) {
            console.error('Reference submit error:', error);
            setSubmitState('error');
            setSubmitMessage(error.message || 'Failed to submit. Please try again.');
        }
    };

    // ─── Standard/Premium: Dynamic Checkout Links ───
    const handleDynamicCheckout = async (tier) => {
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
                window.location.href = data.checkout_url;
            } else {
                setQrModal({ qr_image: data.qr_image, checkout_url: data.checkout_url, tier });
                setPaymentConfirmed(false);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            import('./ui/Toast').then(({ toast }) => {
                toast.error(
                    <div className="flex flex-col">
                        <strong className="font-bold text-lg mb-1">Checkout Failed</strong>
                        <span className="opacity-90">{error.message}</span>
                    </div>
                );
            });
        } finally {
            setIsProcessing(null);
        }
    };

    const handlePaymentDone = async () => {
        setPaymentConfirmed(true);
        if (session?.user?.id) await fetchCreditBalance(session.user.id);
        setTimeout(() => { setQrModal(null); setPaymentConfirmed(false); }, 2000);
    };

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.from('.pricing-card', {
                scale: 0.9, y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out'
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto py-12 px-6">

            {/* ═══ PERSISTENT PAYMENT STATUS BANNER ═══
                Shows OUTSIDE the modal — survives modal close and page refresh */}
            {pendingPayment && (
                <div className={`max-w-2xl mx-auto mb-8 rounded-2xl border p-5 transition-all duration-500 ${pendingPayment.status === 'verified'
                        ? 'bg-[#34A853]/5 border-[#34A853]/20'
                        : 'bg-champagne/5 border-champagne/20'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {pendingPayment.status === 'verified' ? (
                                <CheckCircle2 className="w-5 h-5 text-[#34A853] shrink-0" />
                            ) : (
                                <Loader2 className="w-5 h-5 text-champagne animate-spin shrink-0" />
                            )}
                            <div>
                                <p className="text-sm font-semibold text-obsidian dark:text-darkText">
                                    {pendingPayment.status === 'verified'
                                        ? 'Payment Verified!'
                                        : 'Payment Pending Verification'
                                    }
                                </p>
                                <p className="text-xs text-slate dark:text-darkText/60">
                                    {pendingPayment.status === 'verified'
                                        ? `${pendingPayment.credits_to_grant} credits have been added to your account.`
                                        : `Ref: ${pendingPayment.reference_number} · Submitted ${new Date(pendingPayment.created_at).toLocaleTimeString()}`
                                    }
                                </p>
                            </div>
                        </div>
                        {pendingPayment.status === 'pending' && (
                            <button
                                onClick={handleCheckStatus}
                                disabled={isCheckingStatus}
                                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-champagne/10 text-champagne hover:bg-champagne/20 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                                <span>{isCheckingStatus ? 'Checking...' : 'Check Status'}</span>
                            </button>
                        )}
                    </div>
                    {statusMessage && (
                        <p className="text-xs mt-2 text-slate dark:text-darkText/60">{statusMessage}</p>
                    )}
                </div>
            )}

            {/* ═══ "CHECK PAYMENT STATUS" FALLBACK BUTTON ═══
                Shown when there's NO pending payment but user might have closed modal */}
            {!pendingPayment && (
                <div className="max-w-2xl mx-auto mb-8 flex justify-end">
                    <button
                        onClick={handleCheckStatus}
                        disabled={isCheckingStatus}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider text-slate/60 dark:text-darkText/40 hover:text-obsidian dark:hover:text-darkText hover:bg-obsidian/5 dark:hover:bg-darkText/5 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                        <span>{isCheckingStatus ? 'Checking...' : 'Check Payment Status'}</span>
                    </button>
                    {statusMessage && !pendingPayment && (
                        <span className="ml-3 text-xs text-slate dark:text-darkText/60 self-center">{statusMessage}</span>
                    )}
                </div>
            )}

            <div className="text-center mb-16">
                <h2 className="text-4xl font-sans tracking-tight text-obsidian dark:text-darkText mb-4 font-semibold">
                    Strategic <span className="font-drama italic text-champagne font-normal">Advantage</span>
                </h2>
                <p className="text-slate dark:text-darkText/70 max-w-2xl mx-auto text-lg leading-relaxed">
                    Choose the intelligence capacity that matches your professional throughput. Lock in your precision toolkit today.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-center">
                {/* ── Tier 1: Base Token — Static QR (Pay-As-You-Go) ── */}
                <div className="pricing-card bg-white dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-[2rem] p-6 md:p-8 flex flex-col items-center text-center order-2 lg:order-1 lg:translate-y-4">
                    <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-2">Base Token</h3>
                    <div className="text-slate dark:text-darkText/70 font-mono text-xs uppercase tracking-widest mb-6">Pay-As-You-Go</div>
                    <div className="text-4xl md:text-5xl font-sans font-bold text-obsidian dark:text-darkText mb-8">₱5<span className="text-base md:text-lg text-slate dark:text-darkText/70 font-normal"> / Top-up</span></div>

                    <div className="text-sm text-obsidian/80 dark:text-darkText/80 bg-background dark:bg-darkCard p-4 rounded-xl border border-obsidian/5 dark:border-darkText/5 mb-8 w-full mt-2 lg:min-h-[100px] flex items-center justify-center">
                        Perfect for quick, one-off tasks. Every top-up grants 10 credits. Scan QR and pay instantly via GCash or Maya.
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
                        onClick={handleBaseCheckout}
                        className="mt-auto w-full py-4 rounded-2xl border border-obsidian/10 dark:border-darkText/10 text-obsidian/70 dark:text-darkText/70 font-bold hover:bg-background dark:hover:bg-darkCard/60 transition-colors block text-center"
                    >
                        Add Credits
                    </button>
                </div>

                {/* ── Tier 3: Premium (center spotlight) ── */}
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
                        onClick={() => handleDynamicCheckout('premium')}
                        disabled={isProcessing !== null}
                        className="mt-auto w-full py-5 rounded-2xl bg-champagne text-obsidian font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl block text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing === 'premium' ? 'Securing Premium Access...' : 'Secure Premium Access'}
                    </button>
                </div>

                {/* ── Tier 2: Standard ── */}
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
                        onClick={() => handleDynamicCheckout('standard')}
                        disabled={isProcessing !== null}
                        className="mt-auto w-full py-4 rounded-2xl bg-obsidian/5 dark:bg-darkText/5 border border-obsidian/10 dark:border-darkText/10 text-obsidian dark:text-darkText hover:bg-obsidian/10 dark:hover:bg-darkText/10 font-bold transition-colors block text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing === 'standard' ? 'Initializing Checkout...' : 'Subscribe to Standard'}
                    </button>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════
                Static QR Modal — Base Token (₱5 micro-transaction)
               ════════════════════════════════════════════════════ */}
            {showQrModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-white/70 dark:bg-darkBg/70 backdrop-blur-md"
                        onClick={() => submitState !== 'submitting' && setShowQrModal(false)}
                    />

                    <div className="relative bg-white dark:bg-darkBg border border-obsidian/10 dark:border-darkText/10 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center"
                        style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                        {submitState !== 'submitting' && (
                            <button
                                onClick={() => setShowQrModal(false)}
                                className="absolute top-5 right-5 text-slate/50 hover:text-obsidian dark:hover:text-darkText transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}

                        {submitState === 'success' ? (
                            <div>
                                <div className="w-16 h-16 bg-[#34A853]/10 border border-[#34A853]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-[#34A853]" />
                                </div>
                                <h3 className="text-xl font-bold text-obsidian dark:text-darkText mb-2">Reference Submitted!</h3>
                                <p className="text-sm text-slate dark:text-darkText/60 mb-4">{submitMessage}</p>
                                <div className="flex items-center justify-center space-x-2 text-xs text-champagne mb-4">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Checking for payment confirmation...</span>
                                </div>
                                <p className="text-[11px] text-slate/50 dark:text-darkText/30 mb-4">
                                    You can safely close this window. A status banner will appear above the pricing cards once your payment is confirmed.
                                </p>
                                <button
                                    onClick={() => setShowQrModal(false)}
                                    className="w-full py-3 rounded-2xl bg-obsidian/5 dark:bg-darkText/5 text-obsidian dark:text-darkText font-semibold hover:bg-obsidian/10 dark:hover:bg-darkText/10 transition-colors"
                                >
                                    Close — I'll wait for confirmation
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-center space-x-2 mb-5">
                                    <QrCode className="w-5 h-5 text-champagne" />
                                    <h3 className="text-xl font-bold text-obsidian dark:text-darkText">Scan to Pay</h3>
                                </div>

                                <div className="bg-white rounded-2xl border border-obsidian/10 dark:border-darkText/10 p-4 mb-4 inline-block shadow-sm">
                                    <img
                                        src="/static-qr.png"
                                        alt="CareerSync Payment QR Code"
                                        className="w-48 h-48 mx-auto"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className="w-48 h-48 rounded-xl border-2 border-dashed border-obsidian/20 dark:border-darkText/20 items-center justify-center hidden">
                                        <QrCode className="w-12 h-12 text-obsidian/30 dark:text-darkText/30" />
                                    </div>
                                </div>

                                <p className="text-xs text-slate dark:text-darkText/60 mb-1">
                                    Scan with <strong>GCash</strong>, <strong>Maya</strong>, or any QR Ph app
                                </p>
                                <p className="text-sm font-semibold text-obsidian dark:text-darkText mb-5">
                                    Amount: <span className="text-champagne">₱5</span>
                                </p>

                                <form onSubmit={handleReferenceSubmit} className="w-full">
                                    <div className="text-left mb-2">
                                        <label className="text-xs font-mono uppercase tracking-wider text-slate dark:text-darkText/50">
                                            GCash / InstaPay Reference Number
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        value={referenceNumber}
                                        onChange={(e) => {
                                            setReferenceNumber(e.target.value);
                                            if (submitState === 'error') setSubmitState('idle');
                                        }}
                                        placeholder="e.g. 1234 5678 9012"
                                        className="w-full px-4 py-3.5 rounded-xl border border-obsidian/15 dark:border-darkText/15 bg-background dark:bg-darkCard text-obsidian dark:text-darkText text-center font-mono text-lg tracking-widest placeholder:text-sm placeholder:tracking-normal placeholder:font-sans placeholder:text-slate/40 focus:outline-none focus:ring-2 focus:ring-champagne/50 focus:border-champagne transition-all"
                                        disabled={submitState === 'submitting'}
                                        autoFocus
                                    />

                                    {submitState === 'error' && (
                                        <div className="flex items-center space-x-2 mt-2 text-xs text-[#EA4335]">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>{submitMessage}</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitState === 'submitting' || !referenceNumber.trim()}
                                        className="mt-4 w-full py-4 rounded-2xl bg-obsidian dark:bg-darkText text-background dark:text-darkBg font-bold hover:scale-[1.02] transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                                    >
                                        {submitState === 'submitting' ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Verifying...</span>
                                            </>
                                        ) : (
                                            <span>Submit Reference Number</span>
                                        )}
                                    </button>
                                </form>

                                <p className="text-[11px] text-slate/50 dark:text-darkText/30 mt-3">
                                    Credits are granted automatically once your payment is matched.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════
                Dynamic QR Modal — Standard/Premium
               ════════════════════════════════════════════════════ */}
            {qrModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-white/70 dark:bg-darkBg/70 backdrop-blur-md"
                        onClick={() => !paymentConfirmed && setQrModal(null)}
                    />

                    <div className="relative bg-white dark:bg-darkBg border border-obsidian/10 dark:border-darkText/10 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center"
                        style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                        {!paymentConfirmed && (
                            <button
                                onClick={() => setQrModal(null)}
                                className="absolute top-5 right-5 text-slate/50 hover:text-obsidian dark:hover:text-darkText transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}

                        {paymentConfirmed ? (
                            <div>
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

                                {qrModal.qr_image ? (
                                    <img src={qrModal.qr_image} alt="PayMongo QR Code" className="w-52 h-52 mx-auto rounded-2xl border border-obsidian/10 dark:border-darkText/10 shadow-sm mb-4" />
                                ) : (
                                    <div className="w-52 h-52 mx-auto rounded-2xl border-2 border-dashed border-obsidian/20 dark:border-darkText/20 flex items-center justify-center mb-4">
                                        <QrCode className="w-12 h-12 text-obsidian/30 dark:text-darkText/30" />
                                    </div>
                                )}

                                <p className="text-xs text-slate dark:text-darkText/60 mb-2">
                                    Use <strong>GCash</strong>, <strong>Maya</strong>, or any QR Ph app
                                </p>
                                <p className="text-xs font-semibold text-obsidian dark:text-darkText mb-6">
                                    Amount: <span className="text-champagne">₱{qrModal.tier === 'standard' ? '245' : '295'}</span>
                                </p>

                                <a href={qrModal.checkout_url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center space-x-1 text-xs text-champagne hover:text-champagne/80 transition-colors mb-6">
                                    <Smartphone className="w-3.5 h-3.5" />
                                    <span>Open payment page instead</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>

                                <button onClick={handlePaymentDone}
                                    className="w-full py-4 rounded-2xl bg-obsidian dark:bg-darkText text-background dark:text-darkBg font-bold hover:scale-[1.02] transition-transform shadow-md">
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

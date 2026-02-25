import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Check, CreditCard, ShieldCheck, AlertCircle, Download, X, QrCode, Smartphone, ExternalLink, Loader2, CheckCircle2, RefreshCw, Clock } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../supabaseClient';
import useWorkspaceStore from '../store/useWorkspaceStore';

const isMobileDevice = () => /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

export default function Billing({ session }) {
    const containerRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    // ═══ CENTAVO MATCHING — Static QR Modal State ═══
    const [showQrModal, setShowQrModal] = useState(false);
    const [paymentSession, setPaymentSession] = useState(null);  // { session_id, exact_amount_due, display_amount }
    const [sessionStatus, setSessionStatus] = useState('idle');   // 'idle' | 'loading' | 'waiting' | 'paid' | 'expired' | 'error'
    const [errorMessage, setErrorMessage] = useState('');
    const [countdown, setCountdown] = useState(600);              // 10 minutes in seconds

    // Dynamic checkout QR modal state (Standard/Premium)
    const [qrModal, setQrModal] = useState(null);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    const fetchCreditBalance = useWorkspaceStore(state => state.fetchCreditBalance);

    // ─── Cleanup refs ───
    const realtimeChannelRef = useRef(null);
    const countdownRef = useRef(null);
    const pollingRef = useRef(null);
    const paymentHandledRef = useRef(false); // Guard against double-success

    // ─── Initiate Payment: calls /api/initiate-payment to get unique centavo amount ───
    // Used by ALL tiers — base, standard, and premium all use centavo matching
    const handleBaseCheckout = async (tierName = 'base') => {
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
        setSessionStatus('loading');
        setErrorMessage('');
        setPaymentSession(null);

        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            const response = await fetch('/api/initiate-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(currentSession?.access_token && { 'Authorization': `Bearer ${currentSession.access_token}` })
                },
                body: JSON.stringify({ tier: tierName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initiate payment.');
            }

            setPaymentSession(data);
            setSessionStatus('waiting');
            setCountdown(data.ttl_seconds || 600);

            // Start Realtime subscription, fallback polling, and countdown
            startRealtimeListener(data.session_id);
            startPolling(data.session_id);
            startCountdown(data.ttl_seconds || 600);

        } catch (error) {
            console.error('Initiate payment error:', error);
            setSessionStatus('error');
            setErrorMessage(error.message);
        }
    };

    // ─── Supabase Realtime: listen for payment_sessions status changes ───
    const startRealtimeListener = (sessionId) => {
        // Clean up any existing subscription
        if (realtimeChannelRef.current) {
            supabase.removeChannel(realtimeChannelRef.current);
        }
        paymentHandledRef.current = false; // Reset guard on new session

        const channel = supabase
            .channel(`payment_session_${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'payment_sessions',
                    filter: `id=eq.${sessionId}`
                },
                async (payload) => {
                    const newStatus = payload.new?.status;
                    // Read credits directly from the updated DB row, not from stale closure state
                    const creditsGranted = payload.new?.credits_to_grant || 10;
                    console.log(`[Realtime] Session ${sessionId} status → ${newStatus}, credits: ${creditsGranted}`);

                    if (newStatus === 'paid' && !paymentHandledRef.current) {
                        paymentHandledRef.current = true;
                        handlePaymentSuccess(creditsGranted);
                    } else if (newStatus === 'expired') {
                        setSessionStatus('expired');
                        stopCountdown();
                    }
                }
            )
            .subscribe((status) => {
                console.log(`[Realtime] Channel ${sessionId} subscribe status: ${status}`);
            });

        realtimeChannelRef.current = channel;
    };

    // ─── Fallback Polling (in case Realtime drops) ───
    const startPolling = (sessionId) => {
        stopPolling();
        pollingRef.current = setInterval(async () => {
            try {
                const { data, error } = await supabase
                    .from('payment_sessions')
                    .select('status, credits_to_grant')
                    .eq('id', sessionId)
                    .single();

                if (data && data.status === 'paid' && !paymentHandledRef.current) {
                    console.log(`[Polling] Detected paid status for session ${sessionId}`);
                    paymentHandledRef.current = true;
                    handlePaymentSuccess(data.credits_to_grant);
                } else if (data && data.status === 'expired') {
                    setSessionStatus('expired');
                    stopCountdown();
                    stopPolling();
                }
            } catch (err) {
                console.error('[Polling] Error:', err);
            }
        }, 3000); // Poll every 3 seconds
    };

    const stopPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    const handlePaymentSuccess = async (creditsGranted) => {
        setSessionStatus('paid');
        stopCountdown();
        stopPolling();

        if (realtimeChannelRef.current) {
            supabase.removeChannel(realtimeChannelRef.current);
            realtimeChannelRef.current = null;
        }

        // Refresh credit balance
        if (session?.user?.id) {
            await fetchCreditBalance(session.user.id);
        }

        // Success toast
        import('./ui/Toast').then(({ toast }) => {
            toast.success(
                <div className="flex flex-col">
                    <strong className="font-bold text-lg mb-1">Credits Added!</strong>
                    <span className="opacity-90">{creditsGranted || 10} credits have been added.</span>
                </div>
            );
        });

        // Auto-close after 3 seconds
        setTimeout(() => {
            setShowQrModal(false);
            cleanupSession();
        }, 3000);
    };

    // ─── 10-minute countdown timer ───
    const startCountdown = (seconds) => {
        stopCountdown();
        let remaining = seconds;
        setCountdown(remaining);

        countdownRef.current = setInterval(() => {
            remaining--;
            setCountdown(remaining);

            if (remaining <= 0) {
                stopCountdown();
                setSessionStatus('expired');
            }
        }, 1000);
    };

    const stopCountdown = () => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // ─── Cleanup on modal close / unmount ───
    const cleanupSession = () => {
        if (realtimeChannelRef.current) {
            supabase.removeChannel(realtimeChannelRef.current);
            realtimeChannelRef.current = null;
        }
        stopCountdown();
        stopPolling();
        setPaymentSession(null);
        setSessionStatus('idle');
        setErrorMessage('');
    };

    const handleCloseModal = () => {
        setShowQrModal(false);
        // Don't cleanup yet — let Realtime keep listening in background
        // The banner will show outside the modal
    };

    useEffect(() => {
        return () => {
            cleanupSession();
        };
    }, []);

    // ─── Check if there's an active pending session on mount (state recovery) ───
    useEffect(() => {
        const recoverSession = async () => {
            if (!session?.user?.id) return;

            const { data } = await supabase
                .from('payment_sessions')
                .select('id, exact_amount_due, credits_to_grant, tier, status, created_at')
                .eq('user_id', session.user.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                const s = data[0];
                const pesos = Math.floor(s.exact_amount_due / 100);
                const centavos = s.exact_amount_due % 100;

                // Check if session is still within TTL
                const createdAt = new Date(s.created_at);
                const elapsed = Math.floor((Date.now() - createdAt.getTime()) / 1000);
                const remaining = Math.max(0, 600 - elapsed);

                if (remaining > 0) {
                    setPaymentSession({
                        session_id: s.id,
                        exact_amount_due: s.exact_amount_due,
                        display_amount: `₱${pesos}.${centavos.toString().padStart(2, '0')}`,
                        credits: s.credits_to_grant,
                        tier: s.tier
                    });
                    setSessionStatus('waiting');
                    setCountdown(remaining);
                    startRealtimeListener(s.id);
                    startPolling(s.id);
                    startCountdown(remaining);
                }
            }
        };

        recoverSession();
    }, [session?.user?.id]);

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
        setIsMobile(isMobileDevice());
    }, []);

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

            {/* ═══ PERSISTENT PAYMENT BANNER — shows when modal is closed but session is active ═══ */}
            {!showQrModal && paymentSession && sessionStatus === 'waiting' && (
                <div className="max-w-2xl mx-auto mb-8 rounded-2xl border border-champagne/20 bg-champagne/5 p-5 transition-all duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Loader2 className="w-5 h-5 text-champagne animate-spin shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-obsidian dark:text-darkText">
                                    Waiting for Payment
                                </p>
                                <p className="text-xs text-slate dark:text-darkText/60">
                                    Pay exactly <strong className="text-champagne">{paymentSession.display_amount}</strong> · {formatTime(countdown)} remaining
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowQrModal(true)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-champagne/10 text-champagne hover:bg-champagne/20 transition-colors"
                        >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Show QR</span>
                        </button>
                    </div>
                </div>
            )}

            {!showQrModal && sessionStatus === 'paid' && (
                <div className="max-w-2xl mx-auto mb-8 rounded-2xl border border-[#34A853]/20 bg-[#34A853]/5 p-5">
                    <div className="flex items-center space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-[#34A853] shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-obsidian dark:text-darkText">Payment Verified!</p>
                            <p className="text-xs text-slate dark:text-darkText/60">{paymentSession?.credits || 10} credits added to your account.</p>
                        </div>
                    </div>
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
                {/* ── Tier 1: Base Token — Static QR + Centavo Matching ── */}
                <div className="pricing-card bg-white dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-[2rem] p-6 md:p-8 flex flex-col items-center text-center order-2 lg:order-1 lg:translate-y-4">
                    <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-2">Base Token</h3>
                    <div className="text-slate dark:text-darkText/70 font-mono text-xs uppercase tracking-widest mb-6">Pay-As-You-Go</div>
                    <div className="text-4xl md:text-5xl font-sans font-bold text-obsidian dark:text-darkText mb-8">₱1<span className="text-base md:text-lg text-slate dark:text-darkText/70 font-normal"> / Top-up</span></div>

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
                        disabled={sessionStatus === 'loading'}
                        className="mt-auto w-full py-4 rounded-2xl border border-obsidian/10 dark:border-darkText/10 text-obsidian/70 dark:text-darkText/70 font-bold hover:bg-background dark:hover:bg-darkCard/60 transition-colors block text-center disabled:opacity-50"
                    >
                        {sessionStatus === 'loading' ? 'Generating...' : 'Add Credits'}
                    </button>
                </div>

                {/* ── Tier 3: Premium (center spotlight) ── */}
                <div className="pricing-card relative bg-white/70 dark:bg-darkCard/60 backdrop-blur-md border-[3px] border-champagne rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center shadow-xl order-1 lg:order-2 z-10">
                    <div className="absolute -top-5 bg-champagne text-obsidian px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">Most Popular</div>
                    <h3 className="text-3xl font-bold text-champagne mb-2">Premium</h3>
                    <div className="text-champagne/80 font-mono text-xs uppercase tracking-widest mb-6">The Professional Upgrade</div>
                    <div className="text-5xl md:text-6xl font-sans font-bold text-obsidian dark:text-darkText mb-2">₱3<span className="text-lg md:text-xl text-slate dark:text-darkText/70 font-normal"> / mo</span></div>

                    <div className="text-sm text-obsidian/80 dark:text-darkText/80 bg-champagne/10 dark:bg-champagne/5 p-4 rounded-xl border border-champagne/20 dark:border-champagne/10 mb-8 w-full mt-2 lg:min-h-[100px] flex items-center justify-center">
                        For a mathematically insignificant upgrade over the 245 tier, unlock complete workflow freedom and powerful resume optimization.
                    </div>

                    <div className="space-y-4 mb-8 w-full text-left">
                        <div className="flex items-start text-obsidian dark:text-darkText">
                            <Check className="w-5 h-5 text-champagne mr-3 mt-0.5 shrink-0" />
                            <span><strong className="text-champagne">1,050 credits</strong> per day</span>
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
                        onClick={() => handleBaseCheckout('premium')}
                        disabled={sessionStatus === 'loading'}
                        className="mt-auto w-full py-5 rounded-2xl bg-champagne text-obsidian font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl block text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sessionStatus === 'loading' ? 'Generating...' : 'Secure Premium Access'}
                    </button>
                </div>

                {/* ── Tier 2: Standard ── */}
                <div className="pricing-card bg-white dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 shadow-sm rounded-[2rem] p-6 md:p-8 flex flex-col items-center text-center order-3 lg:order-3 lg:translate-y-4 relative z-0">
                    <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-2">Standard</h3>
                    <div className="text-slate dark:text-darkText/70 font-mono text-xs uppercase tracking-widest mb-6">Monthly Retainer</div>
                    <div className="text-4xl md:text-5xl font-sans font-bold text-obsidian dark:text-darkText mb-8">₱2<span className="text-base md:text-lg text-slate dark:text-darkText/70 font-normal"> / mo</span></div>

                    <div className="text-sm text-obsidian/80 dark:text-darkText/80 bg-background dark:bg-darkCard p-4 rounded-xl border border-obsidian/5 dark:border-darkText/5 mb-8 w-full mt-2 lg:min-h-[100px] flex items-center justify-center">
                        Consistent daily access with full export rights, but limited to standard outputs.
                    </div>

                    <div className="space-y-4 mb-8 w-full text-left text-sm">
                        <div className="flex items-start text-obsidian/90 dark:text-darkText/90">
                            <Check className="w-4 h-4 text-slate dark:text-darkText/70 mr-3 mt-1 shrink-0" />
                            <span>750 credits per day</span>
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
                        onClick={() => handleBaseCheckout('standard')}
                        disabled={sessionStatus === 'loading'}
                        className="mt-auto w-full py-4 rounded-2xl bg-obsidian/5 dark:bg-darkText/5 border border-obsidian/10 dark:border-darkText/10 text-obsidian dark:text-darkText hover:bg-obsidian/10 dark:hover:bg-darkText/10 font-bold transition-colors block text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sessionStatus === 'loading' ? 'Generating...' : 'Subscribe to Standard'}
                    </button>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════
                Static QR Modal — Centavo Matching
               ════════════════════════════════════════════════════ */}
            {showQrModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-white/70 dark:bg-darkBg/70 backdrop-blur-md" onClick={handleCloseModal} />

                    <div className="relative bg-white dark:bg-darkBg border border-obsidian/10 dark:border-darkText/10 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center"
                        style={{ animation: 'fadeInUp 0.3s ease-out' }}>

                        <button onClick={handleCloseModal} className="absolute top-5 right-5 text-slate/50 hover:text-obsidian dark:hover:text-darkText transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        {/* ── Loading State ── */}
                        {sessionStatus === 'loading' && (
                            <div className="py-8">
                                <Loader2 className="w-10 h-10 text-champagne animate-spin mx-auto mb-4" />
                                <p className="text-sm text-slate dark:text-darkText/60">Generating your unique payment amount...</p>
                            </div>
                        )}

                        {/* ── Error State ── */}
                        {sessionStatus === 'error' && (
                            <div className="py-4">
                                <div className="w-14 h-14 bg-[#EA4335]/10 border border-[#EA4335]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-7 h-7 text-[#EA4335]" />
                                </div>
                                <h3 className="text-lg font-bold text-obsidian dark:text-darkText mb-2">Unable to Generate Amount</h3>
                                <p className="text-sm text-slate dark:text-darkText/60 mb-4">{errorMessage}</p>
                                <button onClick={handleBaseCheckout}
                                    className="w-full py-3 rounded-2xl bg-obsidian/5 dark:bg-darkText/5 text-obsidian dark:text-darkText font-semibold hover:bg-obsidian/10 dark:hover:bg-darkText/10 transition-colors">
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* ── Paid State ── */}
                        {sessionStatus === 'paid' && (
                            <div className="py-4">
                                <div className="w-16 h-16 bg-[#34A853]/10 border border-[#34A853]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-[#34A853]" />
                                </div>
                                <h3 className="text-xl font-bold text-obsidian dark:text-darkText mb-2">Payment Verified!</h3>
                                <p className="text-sm text-slate dark:text-darkText/60">{paymentSession?.credits || 10} credits added to your account.</p>
                            </div>
                        )}

                        {/* ── Expired State ── */}
                        {sessionStatus === 'expired' && (
                            <div className="py-4">
                                <div className="w-14 h-14 bg-slate/10 border border-slate/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-7 h-7 text-slate" />
                                </div>
                                <h3 className="text-lg font-bold text-obsidian dark:text-darkText mb-2">Session Expired</h3>
                                <p className="text-sm text-slate dark:text-darkText/60 mb-4">Your reserved amount has expired. Click below to get a new one.</p>
                                <button onClick={handleBaseCheckout}
                                    className="w-full py-3 rounded-2xl bg-obsidian dark:bg-darkText text-background dark:text-darkBg font-bold hover:scale-[1.02] transition-transform shadow-md">
                                    Get New Amount
                                </button>
                            </div>
                        )}

                        {/* ── Waiting for Payment State (main UI) ── */}
                        {sessionStatus === 'waiting' && paymentSession && (
                            <>
                                <div className="flex items-center justify-center space-x-2 mb-4">
                                    <QrCode className="w-5 h-5 text-champagne" />
                                    <h3 className="text-xl font-bold text-obsidian dark:text-darkText">Scan & Pay</h3>
                                </div>

                                {/* ── Desktop: QR code for scanning | Mobile: GCash deep link ── */}
                                {isMobile ? (
                                    <div className="mb-4 w-full">
                                        <a
                                            href={`gcash://pay?amount=${(paymentSession.exact_amount_due / 100).toFixed(2)}`}
                                            className="flex flex-col items-center justify-center w-full py-5 rounded-2xl bg-[#0070BA] text-white font-bold text-lg shadow-xl active:scale-95 transition-transform mb-3"
                                        >
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Smartphone className="w-5 h-5" />
                                                <span>Open GCash</span>
                                            </div>
                                            <span className="text-xs font-normal opacity-80">Tap to open the GCash app directly</span>
                                        </a>
                                        <p className="text-[11px] text-slate/50 dark:text-darkText/30">
                                            Enter <strong className="text-champagne">{paymentSession.display_amount}</strong> as the exact amount in GCash — do NOT round.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl border border-obsidian/10 dark:border-darkText/10 p-4 mb-4 inline-block shadow-sm">
                                        <img src="/static-qr.png" alt="CareerSync Payment QR Code" className="w-44 h-44 mx-auto"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                        <div className="w-44 h-44 rounded-xl border-2 border-dashed border-obsidian/20 dark:border-darkText/20 items-center justify-center hidden">
                                            <QrCode className="w-12 h-12 text-obsidian/30 dark:text-darkText/30" />
                                        </div>
                                    </div>
                                )}

                                {/* ═══ THE EXACT AMOUNT — this is the key UX element ═══ */}
                                <div className="bg-champagne/10 border-2 border-champagne/30 rounded-2xl p-4 mb-4">
                                    <p className="text-xs font-mono uppercase tracking-wider text-champagne/80 mb-1">
                                        Enter this EXACT amount in GCash
                                    </p>
                                    <p className="text-4xl font-bold text-champagne tracking-tight">
                                        {paymentSession.display_amount}
                                    </p>
                                    <p className="text-[11px] text-obsidian/50 dark:text-darkText/40 mt-1">
                                        Do NOT round. The centavos are used to identify your payment.
                                    </p>
                                </div>

                                {/* Countdown Timer */}
                                <div className="flex items-center justify-center space-x-2 text-xs mb-3">
                                    <Clock className="w-3.5 h-3.5 text-slate dark:text-darkText/50" />
                                    <span className={`font-mono ${countdown <= 60 ? 'text-[#EA4335] font-bold' : 'text-slate dark:text-darkText/50'}`}>
                                        {formatTime(countdown)} remaining
                                    </span>
                                </div>

                                {/* Realtime indicator */}
                                <div className="flex items-center justify-center space-x-2 text-xs text-champagne/70 mb-4">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-champagne/60 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-champagne"></span>
                                    </span>
                                    <span>Listening for your payment...</span>
                                </div>

                                <p className="text-[11px] text-slate/50 dark:text-darkText/30">
                                    Your account will be credited <strong>automatically</strong> once the payment is detected. You can close this window — we'll notify you.
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
                    <div className="absolute inset-0 bg-white/70 dark:bg-darkBg/70 backdrop-blur-md" onClick={() => !paymentConfirmed && setQrModal(null)} />

                    <div className="relative bg-white dark:bg-darkBg border border-obsidian/10 dark:border-darkText/10 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center"
                        style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                        {!paymentConfirmed && (
                            <button onClick={() => setQrModal(null)} className="absolute top-5 right-5 text-slate/50 hover:text-obsidian dark:hover:text-darkText transition-colors">
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

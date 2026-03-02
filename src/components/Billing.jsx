import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Check, CreditCard, ShieldCheck, AlertCircle, Download, X, QrCode, Smartphone, ExternalLink, Loader2, CheckCircle2, RefreshCw, Clock, Receipt, FileText, ChevronRight, Zap, Star, Lock } from 'lucide-react';
import Tooltip from './ui/Tooltip';
import gsap from 'gsap';
import { supabase } from '../supabaseClient';
import useWorkspaceStore from '../store/useWorkspaceStore';

const isLocked = (lockedUntil) => {
    if (!lockedUntil) return false;
    return new Date(lockedUntil) > new Date();
};

const isMobileDevice = () => /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

export default function Billing({ session, onPaymentModalChange }) {
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


    // Notify parent (App.jsx) when QR modal opens/closes so Navbar can hide
    useEffect(() => {
        onPaymentModalChange?.(showQrModal);
    }, [showQrModal, onPaymentModalChange]);

    const fetchCreditBalance = useWorkspaceStore(state => state.fetchCreditBalance);
    const userTier = useWorkspaceStore(state => state.userTier);
    const planLockedUntil = useWorkspaceStore(state => state.planLockedUntil);

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
                body: JSON.stringify({ tier: tierName, mobile: isMobile })
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

    // W-6 FIX: Cleanup Realtime channel + timers on component unmount (e.g. navigate away)
    useEffect(() => {
        return () => {
            if (realtimeChannelRef.current) {
                supabase.removeChannel(realtimeChannelRef.current);
                realtimeChannelRef.current = null;
            }
            if (countdownRef.current) clearInterval(countdownRef.current);
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    // ─── Fallback Polling (in case Realtime drops) ───
    const startPolling = (sessionId) => {
        stopPolling();
        // N-6 FIX: Add jitter to polling interval to avoid thundering herd when many
        // users are on the payment page simultaneously.
        const jitter = Math.floor(Math.random() * 1500);
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
        }, 3000 + jitter); // Poll every 3-4.5s with jitter
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
                    Choose Your <span className="font-drama italic text-champagne font-normal">Plan</span>
                </h2>
                <p className="text-slate dark:text-darkText/60 max-w-xl mx-auto text-base leading-relaxed">
                    All plans use GCash / QR payment. Credits reset daily. Upgrade or stay flexible.
                </p>
            </div>

            {/* ─── Feature comparison row labels (desktop only) ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 max-w-5xl mx-auto items-stretch">

                {/* ══════════════════ BASE TOKEN ══════════════════ */}
                <div className="pricing-card flex flex-col bg-white dark:bg-darkCard border border-obsidian/5 dark:border-darkText/5 rounded-[2.5rem] p-8 shadow-sm order-2 lg:order-1 hover:shadow-xl transition-shadow relative overflow-hidden">
                    {/* Header */}
                    <div className="mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate/50 dark:text-darkText/50 mb-3">PAY-AS-YOU-GO</p>
                        <h3 className="text-2xl font-bold text-obsidian dark:text-darkText mb-1">Base Token</h3>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                        <div className="flex items-baseline mb-1">
                            <span className="text-xl font-bold text-obsidian dark:text-darkText mr-1">₱</span>
                            <span className="text-7xl font-sans font-black text-obsidian dark:text-darkText tracking-tighter">1</span>
                            <span className="text-sm font-bold text-slate dark:text-darkText/50 ml-2">/ top-up</span>
                        </div>
                        <p className="text-xs text-slate/60 dark:text-darkText/40">~₱1.XX unique amount per session</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex gap-3 text-sm text-obsidian/80 dark:text-darkText/90">
                            <Check className="w-4 h-4 text-obsidian/60 dark:text-darkText/60 shrink-0" />
                            <span><strong>10 credits</strong> — expires daily</span>
                        </li>
                        <li className="flex gap-3 text-sm text-obsidian/80 dark:text-darkText/90">
                            <Check className="w-4 h-4 text-obsidian/60 dark:text-darkText/60 shrink-0" />
                            <span>Basic analysis & cover letter</span>
                        </li>
                        <li className="flex gap-3 text-sm text-obsidian/80 dark:text-darkText/90">
                            <Check className="w-4 h-4 text-obsidian/60 dark:text-darkText/60 shrink-0" />
                            <span><strong>No lock-in</strong> — buy anytime</span>
                        </li>
                        <li className="flex items-start gap-3 mt-4 opacity-40 grayscale">
                            <X className="w-4 h-4 text-slate shrink-0" />
                            <span className="text-slate text-sm">No premium credits</span>
                        </li>
                        <li className="flex items-start gap-3 mt-1 opacity-40 grayscale">
                            <X className="w-4 h-4 text-slate shrink-0" />
                            <span className="text-slate text-sm">No Advanced Parsing (Paste Listing)</span>
                        </li>
                        <li className="flex items-start gap-3 mt-1 opacity-40 grayscale">
                            <X className="w-4 h-4 text-slate shrink-0" />
                            <span className="text-slate text-sm">No PDF export</span>
                        </li>
                        <li className="flex items-start gap-3 mt-1 opacity-40 grayscale">
                            <X className="w-4 h-4 text-slate shrink-0" />
                            <span className="text-slate text-sm">No resume optimization</span>
                        </li>
                    </ul>

                    <button
                        onClick={() => handleBaseCheckout('base')}
                        disabled={sessionStatus === 'loading'}
                        className="w-full py-3.5 rounded-2xl border-2 border-obsidian/15 dark:border-darkText/15 text-obsidian/80 dark:text-darkText/80 font-bold text-sm hover:bg-obsidian/5 dark:hover:bg-darkText/5 hover:border-obsidian/30 transition-all disabled:opacity-50"
                    >
                        {sessionStatus === 'loading' ? 'Generating…' : <span className="flex items-center justify-center gap-2"><Zap className="w-4 h-4" /> Buy Base Token</span>}
                    </button>
                    <p className="text-xs text-center text-slate/60 dark:text-darkText/35 mt-2">
                        Your payment is processed securely. Credits are only added after your AI analysis successfully completes.
                    </p>
                </div>

                {/* ══════════════════ PREMIUM (CENTER SPOTLIGHT) ══════════════════ */}
                <div className="pricing-card relative flex flex-col bg-[#fffdf9] dark:bg-[#1a1713] border-[3px] border-champagne rounded-[2.5rem] p-10 md:py-16 shadow-2xl shadow-champagne/30 order-1 lg:order-2 z-10 scale-100 lg:scale-110 -my-4 lg:-my-8 text-center">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-champagne/10 to-transparent rounded-[2.5rem] pointer-events-none"></div>

                    {/* Badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-champagne text-obsidian px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg whitespace-nowrap">
                        <Star className="w-3 h-3 inline pb-[1px] mr-1" /> Best Value
                    </div>

                    {/* Header */}
                    <div className="mb-6 mt-2 relative z-10 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-champagne/80 mb-3">BEST VALUE</p>
                        <h3 className="text-3xl font-bold mb-1 text-champagne">Premium</h3>
                    </div>

                    {/* Price */}
                    <div className="mb-8 relative z-10">
                        <div className="flex justify-center flex-col items-center mb-1">
                            <div className="flex items-baseline justify-center">
                                <span className="text-3xl font-bold text-obsidian dark:text-darkText mr-2">₱</span>
                                <span className="text-[120px] leading-[0.8] font-sans font-black text-obsidian dark:text-darkText tracking-tighter">3</span>
                                <span className="text-lg font-bold text-obsidian dark:text-darkText ml-3">/ month</span>
                            </div>
                            <span className="text-xs text-slate/80 dark:text-darkText/60 mt-4">~₱3.XX unique amount per session</span>
                        </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-5 mb-8 flex-1 text-left relative z-10 px-0 md:px-4">
                        <li className="flex gap-3 text-sm text-obsidian/90 dark:text-darkText/90">
                            <CheckCircle2 className="w-5 h-5 text-champagne shrink-0" />
                            <span><strong>50 Premium Credits</strong> — refills daily</span>
                        </li>
                        <li className="flex gap-3 text-sm text-obsidian/90 dark:text-darkText/90">
                            <CheckCircle2 className="w-5 h-5 text-champagne shrink-0" />
                            <span><strong>Advanced Parsing</strong> (Paste Listing)</span>
                        </li>
                        <li className="flex gap-3 text-sm text-obsidian/90 dark:text-darkText/90">
                            <CheckCircle2 className="w-5 h-5 text-champagne shrink-0" />
                            <span><strong>Full PDF Export</strong> capabilities</span>
                        </li>
                        <li className="flex gap-3 text-sm text-obsidian/90 dark:text-darkText/90">
                            <CheckCircle2 className="w-5 h-5 text-champagne shrink-0" />
                            <span><strong>Resume Optimization</strong> surgery</span>
                        </li>
                        <li className="flex gap-3 text-sm text-obsidian/90 dark:text-darkText/90">
                            <CheckCircle2 className="w-5 h-5 text-champagne shrink-0" />
                            <span>Unlimited History View</span>
                        </li>
                        <li className="flex gap-3 text-sm text-obsidian/90 dark:text-darkText/90">
                            <CheckCircle2 className="w-5 h-5 text-champagne shrink-0" />
                            <span><strong>30-Day Plan Lock</strong> — stable access period</span>
                        </li>
                    </ul>

                    <button
                        onClick={() => handleBaseCheckout('premium')}
                        disabled={sessionStatus === 'loading' || (userTier === 'premium' && isLocked(planLockedUntil))}
                        className="w-full py-4 rounded-2xl bg-champagne text-obsidian font-bold text-base hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-champagne/30 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center"
                    >
                        <span className="transition-transform group-hover:translate-x-1 flex items-center justify-center gap-2">
                            {sessionStatus === 'loading' ? 'Generating…' : (userTier === 'premium' && isLocked(planLockedUntil)) ? <><Check className="w-4 h-4" /> Plan Active</> : <><Lock className="w-4 h-4" /> Get Premium — ₱3/mo</>}
                        </span>
                    </button>
                    <p className="text-xs text-center text-champagne/50 dark:text-champagne/35 mt-2">
                        Your payment is processed securely. Credits are only added after your AI analysis successfully completes.
                    </p>
                </div>

                {/* ══════════════════ STANDARD ══════════════════ */}
                <div className="pricing-card flex flex-col bg-white dark:bg-darkCard border border-obsidian/5 dark:border-darkText/5 rounded-[2.5rem] p-8 shadow-sm order-3 lg:order-3 hover:shadow-xl transition-shadow relative overflow-hidden">
                    {/* Header */}
                    <div className="mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate/50 dark:text-darkText/50 mb-3">MONTHLY RETAINER</p>
                        <h3 className="text-2xl font-bold mb-1 text-obsidian dark:text-darkText">Standard</h3>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                        <div className="flex items-baseline mb-1">
                            <span className="text-xl font-bold text-obsidian dark:text-darkText mr-1">₱</span>
                            <span className="text-7xl font-sans font-black text-obsidian dark:text-darkText tracking-tighter">2</span>
                            <span className="text-sm font-bold text-slate dark:text-darkText/50 ml-2">/ month</span>
                        </div>
                        <p className="text-xs text-slate/60 dark:text-darkText/40">~₱2.XX unique amount per session</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex gap-3 text-sm text-obsidian/80 dark:text-darkText/90">
                            <CheckCircle2 className="w-4 h-4 text-[#3b82f6] shrink-0" />
                            <span><strong>40 Premium Credits</strong> — refills daily</span>
                        </li>
                        <li className="flex gap-3 text-sm text-obsidian/80 dark:text-darkText/90">
                            <CheckCircle2 className="w-4 h-4 text-[#3b82f6] shrink-0" />
                            <span><strong>Advanced Parsing</strong> (Paste Listing)</span>
                        </li>
                        <li className="flex gap-3 text-sm text-obsidian/80 dark:text-darkText/90">
                            <CheckCircle2 className="w-4 h-4 text-[#3b82f6] shrink-0" />
                            <span><strong>Full PDF Export</strong> capabilities</span>
                        </li>
                        <li className="flex gap-3 text-sm text-obsidian/80 dark:text-darkText/90">
                            <CheckCircle2 className="w-4 h-4 text-[#3b82f6] shrink-0" />
                            <span><strong>30-Day Plan Lock</strong> — stable access period</span>
                        </li>
                        <li className="flex items-start gap-3 mt-4 opacity-40 grayscale">
                            <X className="w-4 h-4 text-slate shrink-0" />
                            <span className="text-slate text-sm">No resume optimization</span>
                        </li>
                    </ul>

                    <button
                        onClick={() => handleBaseCheckout('standard')}
                        disabled={sessionStatus === 'loading' || isLocked(planLockedUntil)}
                        className="w-full py-3.5 rounded-2xl border-2 border-blue-500/40 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-500/5 hover:border-blue-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span className="transition-transform group-hover:translate-x-1 flex items-center justify-center gap-2">
                            {sessionStatus === 'loading' ? 'Generating…' : isLocked(planLockedUntil) ? (userTier === 'premium' ? <><Lock className="w-4 h-4" /> Premium Active</> : <><Check className="w-4 h-4" /> Plan Active</>) : <><Lock className="w-4 h-4" /> Get Standard — ₱2/mo</>}
                        </span>
                    </button>
                    <p className="text-xs text-center text-slate/60 dark:text-darkText/35 mt-2">
                        Your payment is processed securely. Credits are only added after your AI analysis successfully completes.
                    </p>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════
                Static QR Modal — Centavo Matching
               ════════════════════════════════════════════════════ */}
            {showQrModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Solid opaque backdrop — hides the page completely */}
                    <div className="absolute inset-0 bg-background dark:bg-darkBg" />
                    {/* Transparent click-to-close area (above backdrop, below card) */}
                    <div className="absolute inset-0 z-[1] cursor-pointer" onClick={handleCloseModal} />

                    <div className="relative z-[2] bg-white dark:bg-darkCard border border-obsidian/10 dark:border-darkText/15 rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center"
                        style={{ animation: 'fadeInUp 0.3s ease-out' }}>

                        <button onClick={handleCloseModal} aria-label="Close payment modal" className="absolute top-5 right-5 text-slate/50 hover:text-obsidian dark:hover:text-darkText transition-colors">
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

                                {/* ── QR Code (shown on all devices) ── */}
                                <div className="bg-white rounded-2xl border border-obsidian/10 dark:border-darkText/10 p-4 mb-3 inline-block shadow-sm">
                                    <img src="/static-qr.png" alt="CareerSync Payment QR Code" className="w-44 h-44 mx-auto"
                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                    <div className="w-44 h-44 rounded-xl border-2 border-dashed border-obsidian/20 dark:border-darkText/20 items-center justify-center hidden">
                                        <QrCode className="w-12 h-12 text-obsidian/30 dark:text-darkText/30" />
                                    </div>
                                </div>

                                {/* ── Mobile only: small "Open GCash" button below the QR ── */}
                                {isMobile && (() => {
                                    const gatewayUrl = paymentSession.gcash_redirect_url;
                                    const isAndroid = /Android/i.test(navigator.userAgent);
                                    let deepLink;
                                    if (gatewayUrl) {
                                        try {
                                            const parsed = new URL(gatewayUrl);
                                            deepLink = isAndroid
                                                ? `intent://${parsed.host}${parsed.pathname}${parsed.search}#Intent;scheme=${parsed.protocol.replace(':', '')};package=com.globe.gcash.android;end`
                                                : gatewayUrl;
                                        } catch { deepLink = gatewayUrl; }
                                    } else {
                                        const amount = (paymentSession.exact_amount_due / 100).toFixed(2);
                                        deepLink = isAndroid
                                            ? `intent://pay?amount=${amount}#Intent;scheme=gcash;package=com.globe.gcash.android;end`
                                            : `gcash://pay?amount=${amount}`;
                                    }
                                    return (
                                        <div className="mb-1">
                                            <a href={deepLink}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0070BA] text-white text-sm font-semibold shadow-md active:scale-95 transition-transform">
                                                <Smartphone className="w-4 h-4" />
                                                Open GCash
                                            </a>
                                            <p className="text-[10px] text-slate/40 dark:text-darkText/30 mt-1">or scan the code above</p>
                                        </div>
                                    );
                                })()}


                                {/* ═══ THE EXACT AMOUNT — this is the key UX element ═══ */}
                                <div className="bg-champagne/10 border-2 border-champagne/30 rounded-2xl p-4 mb-4">
                                    <p className="text-xs font-mono uppercase tracking-wider text-champagne/80 mb-1 flex items-center justify-center gap-1">
                                        Enter this EXACT amount in GCash
                                        <Tooltip
                                            align="center"
                                            text="Why an exact amount with centavos? We assign a unique centavo value (e.g., ₱1.47) to your session. This allows our system to instantly and securely match your GCash transfer to your account without requiring a credit card or storing your financial details."
                                        />
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

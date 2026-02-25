import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Check, CreditCard, ShieldCheck, AlertCircle, Download, X, QrCode, Smartphone, ExternalLink, Loader2, CheckCircle2, RefreshCw, Clock, Receipt, FileText, ChevronRight } from 'lucide-react';
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

    // ═══ Invoice / Payment History Modal State ═══
    const [showInvoice, setShowInvoice] = useState(false);
    const [invoiceHistory, setInvoiceHistory] = useState([]);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [invoiceError, setInvoiceError] = useState('');

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

    // ─── Fetch invoice history from backend ───
    const fetchInvoiceHistory = async () => {
        setShowInvoice(true);
        setInvoiceLoading(true);
        setInvoiceError('');
        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            const response = await fetch('/api/payment-history', {
                method: 'GET',
                headers: {
                    ...(currentSession?.access_token && { 'Authorization': `Bearer ${currentSession.access_token}` })
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to load history.');
            setInvoiceHistory(data.history || []);
        } catch (err) {
            setInvoiceError(err.message);
        } finally {
            setInvoiceLoading(false);
        }
    };

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
                <div className="pricing-card flex flex-col bg-white dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 rounded-[2rem] p-7 shadow-sm order-2 lg:order-1">
                    {/* Header */}
                    <div className="mb-6">
                        <p className="text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/50 mb-1">Pay-as-you-go</p>
                        <h3 className="text-2xl font-bold text-obsidian dark:text-darkText">Base Token</h3>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                        <span className="text-5xl font-sans font-bold text-obsidian dark:text-darkText">₱1</span>
                        <span className="text-sm text-slate dark:text-darkText/50 ml-1">/ top-up</span>
                        <p className="text-xs text-slate dark:text-darkText/40 mt-1">~₱1.XX unique amount per session</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1 text-sm">
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-obsidian/8 dark:bg-darkText/8 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-obsidian/60 dark:text-darkText/60" />
                            </span>
                            <span className="text-obsidian/80 dark:text-darkText/80">
                                <strong className="font-semibold text-obsidian dark:text-darkText">10 credits</strong> — expires daily
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-obsidian/8 dark:bg-darkText/8 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-obsidian/60 dark:text-darkText/60" />
                            </span>
                            <span className="text-obsidian/80 dark:text-darkText/80">Basic analysis &amp; cover letter</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-obsidian/8 dark:bg-darkText/8 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-obsidian/60 dark:text-darkText/60" />
                            </span>
                            <span className="text-obsidian/80 dark:text-darkText/80"><strong className="font-semibold text-obsidian dark:text-darkText">No lock-in</strong> — buy anytime</span>
                        </li>
                        <li className="flex items-start gap-3 mt-1">
                            <span className="w-5 h-5 rounded-full bg-slate/8 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-slate/50 text-[10px] font-bold leading-none">✕</span>
                            </span>
                            <span className="text-slate/50 dark:text-darkText/30 text-xs">No premium credits</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-slate/8 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-slate/50 text-[10px] font-bold leading-none">✕</span>
                            </span>
                            <span className="text-slate/50 dark:text-darkText/30 text-xs">No PDF export</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-slate/8 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-slate/50 text-[10px] font-bold leading-none">✕</span>
                            </span>
                            <span className="text-slate/50 dark:text-darkText/30 text-xs">No resume optimization</span>
                        </li>
                    </ul>

                    <button
                        onClick={() => handleBaseCheckout('base')}
                        disabled={sessionStatus === 'loading'}
                        className="w-full py-3.5 rounded-2xl border-2 border-obsidian/15 dark:border-darkText/15 text-obsidian/80 dark:text-darkText/80 font-bold text-sm hover:bg-obsidian/5 dark:hover:bg-darkText/5 hover:border-obsidian/30 transition-all disabled:opacity-50"
                    >
                        {sessionStatus === 'loading' ? 'Generating…' : '⚡ Buy Base Token'}
                    </button>
                </div>

                {/* ══════════════════ PREMIUM (CENTER SPOTLIGHT) ══════════════════ */}
                <div className="pricing-card relative flex flex-col bg-gradient-to-b from-[#fffbf0] to-white dark:from-[#2a2416] dark:to-darkCard border-[2.5px] border-champagne rounded-[2rem] p-7 shadow-2xl shadow-champagne/20 order-1 lg:order-2 z-10 ring-1 ring-champagne/30">
                    {/* Badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-champagne text-obsidian px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg whitespace-nowrap">
                        ★ Most Popular
                    </div>

                    {/* Header */}
                    <div className="mb-6 mt-2 text-center">
                        <p className="text-xs font-mono uppercase tracking-widest text-champagne/70 mb-1">Best Value</p>
                        <h3 className="text-3xl font-bold text-champagne">Premium</h3>
                    </div>

                    {/* Price */}
                    <div className="mb-6 text-center">
                        <span className="text-6xl font-sans font-bold text-obsidian dark:text-darkText">₱3</span>
                        <span className="text-base text-slate dark:text-darkText/50 ml-1">/ month</span>
                        <p className="text-xs text-slate dark:text-darkText/40 mt-1">~₱3.XX unique amount per session</p>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-champagne/20 mb-6" />

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1 text-sm">
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-champagne/15 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-champagne" />
                            </span>
                            <span className="text-obsidian dark:text-darkText">
                                <strong className="text-champagne">Unlimited</strong> Base Tokens
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-champagne/15 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-champagne" />
                            </span>
                            <span className="text-obsidian dark:text-darkText">
                                <strong className="text-champagne">50 Premium Credits</strong>
                                <span className="text-xs text-slate dark:text-darkText/50 ml-1">— refills daily</span>
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-champagne/15 flex items-center justify-center shrink-0 mt-0.5">
                                <Download className="w-3 h-3 text-champagne" />
                            </span>
                            <span className="text-obsidian dark:text-darkText"><strong className="font-semibold">Full PDF Export</strong> capabilities</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-champagne/15 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-champagne" />
                            </span>
                            <span className="text-obsidian dark:text-darkText"><strong className="font-semibold">Resume Optimization</strong> surgery</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-champagne/15 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-champagne" />
                            </span>
                            <span className="text-obsidian dark:text-darkText">Unlimited History View</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-champagne/15 flex items-center justify-center shrink-0 mt-0.5">
                                <ShieldCheck className="w-3 h-3 text-champagne" />
                            </span>
                            <span className="text-obsidian/70 dark:text-darkText/70 text-xs">
                                <strong className="text-obsidian dark:text-darkText font-semibold">30-Day Plan Lock</strong> — stable access period
                            </span>
                        </li>
                    </ul>

                    <button
                        onClick={() => handleBaseCheckout('premium')}
                        disabled={sessionStatus === 'loading'}
                        className="w-full py-4 rounded-2xl bg-champagne text-obsidian font-bold text-base hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-champagne/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sessionStatus === 'loading' ? 'Generating…' : '🔒 Get Premium — ₱3/mo'}
                    </button>
                </div>

                {/* ══════════════════ STANDARD ══════════════════ */}
                <div className="pricing-card flex flex-col bg-white dark:bg-darkCard/40 border border-obsidian/10 dark:border-darkText/10 rounded-[2rem] p-7 shadow-sm order-3 lg:order-3">
                    {/* Header */}
                    <div className="mb-6">
                        <p className="text-xs font-mono uppercase tracking-widest text-slate dark:text-darkText/50 mb-1">Monthly Retainer</p>
                        <h3 className="text-2xl font-bold text-obsidian dark:text-darkText">Standard</h3>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                        <span className="text-5xl font-sans font-bold text-obsidian dark:text-darkText">₱2</span>
                        <span className="text-sm text-slate dark:text-darkText/50 ml-1">/ month</span>
                        <p className="text-xs text-slate dark:text-darkText/40 mt-1">~₱2.XX unique amount per session</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1 text-sm">
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-blue-500" />
                            </span>
                            <span className="text-obsidian/90 dark:text-darkText/90">
                                <strong className="font-semibold text-obsidian dark:text-darkText">Unlimited</strong> Base Tokens
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-blue-500" />
                            </span>
                            <span className="text-obsidian/90 dark:text-darkText/90">
                                <strong className="font-semibold text-obsidian dark:text-darkText">40 Premium Credits</strong>
                                <span className="text-xs text-slate dark:text-darkText/50 ml-1">— refills daily</span>
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Download className="w-3 h-3 text-blue-500" />
                            </span>
                            <span className="text-obsidian/90 dark:text-darkText/90">Full PDF Export capabilities</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <ShieldCheck className="w-3 h-3 text-blue-500" />
                            </span>
                            <span className="text-obsidian/80 dark:text-darkText/70 text-xs">
                                <strong className="text-obsidian dark:text-darkText font-semibold">30-Day Plan Lock</strong> — stable access period
                            </span>
                        </li>
                        <li className="flex items-start gap-3 mt-1">
                            <span className="w-5 h-5 rounded-full bg-slate/8 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-slate/40 text-[10px] font-bold leading-none">✕</span>
                            </span>
                            <span className="text-slate/40 dark:text-darkText/25 text-xs">No resume optimization</span>
                        </li>
                    </ul>

                    <button
                        onClick={() => handleBaseCheckout('standard')}
                        disabled={sessionStatus === 'loading'}
                        className="w-full py-3.5 rounded-2xl border-2 border-blue-500/40 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-500/5 hover:border-blue-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sessionStatus === 'loading' ? 'Generating…' : '🔒 Get Standard — ₱2/mo'}
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
            {/* ════════════════════════════════════════════════════
                Invoice / Payment History Modal
               ════════════════════════════════════════════════════ */}
            {showInvoice && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-white/70 dark:bg-darkBg/70 backdrop-blur-md" onClick={() => setShowInvoice(false)} />

                    <div className="relative bg-white dark:bg-darkBg border border-obsidian/10 dark:border-darkText/10 rounded-[2rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">

                        {/* Header */}
                        <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-obsidian/8 dark:border-darkText/8 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-champagne/10 flex items-center justify-center">
                                    <Receipt className="w-5 h-5 text-champagne" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-obsidian dark:text-darkText">Invoice History</h3>
                                    <p className="text-xs text-slate dark:text-darkText/50">All your past credit purchases</p>
                                </div>
                            </div>
                            <button onClick={() => setShowInvoice(false)} className="text-slate/50 hover:text-obsidian dark:hover:text-darkText transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto flex-1 px-8 py-6">
                            {invoiceLoading && (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <Loader2 className="w-8 h-8 text-champagne animate-spin mb-3" />
                                    <p className="text-sm text-slate dark:text-darkText/50">Loading your history...</p>
                                </div>
                            )}
                            {invoiceError && !invoiceLoading && (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <AlertCircle className="w-8 h-8 text-[#EA4335] mb-3" />
                                    <p className="text-sm text-slate dark:text-darkText/50">{invoiceError}</p>
                                </div>
                            )}
                            {!invoiceLoading && !invoiceError && invoiceHistory.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <FileText className="w-10 h-10 text-obsidian/15 dark:text-darkText/15 mb-4" />
                                    <p className="text-sm font-semibold text-obsidian dark:text-darkText mb-1">No payments yet</p>
                                    <p className="text-xs text-slate dark:text-darkText/50">Your payment history will appear here after your first purchase.</p>
                                </div>
                            )}
                            {!invoiceLoading && !invoiceError && invoiceHistory.length > 0 && (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-obsidian/8 dark:border-darkText/8">
                                            <th className="text-left text-xs font-semibold text-slate dark:text-darkText/50 uppercase tracking-wider pb-3">Date & Time</th>
                                            <th className="text-left text-xs font-semibold text-slate dark:text-darkText/50 uppercase tracking-wider pb-3">Tier</th>
                                            <th className="text-right text-xs font-semibold text-slate dark:text-darkText/50 uppercase tracking-wider pb-3">Amount</th>
                                            <th className="text-right text-xs font-semibold text-slate dark:text-darkText/50 uppercase tracking-wider pb-3">Credits</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceHistory.map((row, i) => {
                                            const date = new Date(row.date);
                                            const tierColors = {
                                                base: 'bg-slate/10 text-slate dark:bg-darkText/10 dark:text-darkText/70',
                                                standard: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                                                premium: 'bg-champagne/15 text-champagne',
                                            };
                                            return (
                                                <tr key={row.id} className="border-b border-obsidian/5 dark:border-darkText/5 hover:bg-obsidian/2 dark:hover:bg-darkText/2 transition-colors">
                                                    <td className="py-4">
                                                        <div className="font-medium text-obsidian dark:text-darkText">
                                                            {date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                        <div className="text-xs text-slate dark:text-darkText/40">
                                                            {date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${tierColors[row.tier] || tierColors.base}`}>
                                                            {row.tier}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right font-mono font-semibold text-obsidian dark:text-darkText">
                                                        {row.amount_display}
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <span className="font-bold text-champagne">+{row.credits_gained.toLocaleString()}</span>
                                                        <span className="text-xs text-slate dark:text-darkText/40 ml-1">cr</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Footer summary */}
                        {!invoiceLoading && invoiceHistory.length > 0 && (
                            <div className="px-8 py-5 border-t border-obsidian/8 dark:border-darkText/8 flex items-center justify-between shrink-0">
                                <p className="text-xs text-slate dark:text-darkText/40">
                                    {invoiceHistory.length} transaction{invoiceHistory.length !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs font-semibold text-champagne">
                                    {invoiceHistory.reduce((sum, r) => sum + r.credits_gained, 0).toLocaleString()} total credits purchased
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

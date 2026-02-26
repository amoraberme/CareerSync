import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import useWorkspaceStore from '../../store/useWorkspaceStore';

const isMobileDevice = () => /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

/**
 * Custom hook to decouple Billing UI from its business logic.
 * Part of the Immutable Billing Vault.
 * DO NOT MODIFY without AUTHORIZE_BILLING_OVERRIDE.
 */
export function useBilling(session, onPaymentModalChange) {
    const [isProcessing, setIsProcessing] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    // ═══ CENTAVO MATCHING — Static QR Modal State ═══
    const [showQrModal, setShowQrModal] = useState(false);
    const [paymentSession, setPaymentSession] = useState(null);
    const [sessionStatus, setSessionStatus] = useState('idle'); // 'idle' | 'loading' | 'waiting' | 'paid' | 'expired' | 'error'
    const [errorMessage, setErrorMessage] = useState('');
    const [countdown, setCountdown] = useState(600);

    // Dynamic checkout QR modal state
    const [qrModal, setQrModal] = useState(null);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    // Invoice / Payment History state
    const [showInvoice, setShowInvoice] = useState(false);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [invoiceError, setInvoiceError] = useState('');
    const [invoiceHistory, setInvoiceHistory] = useState([]);

    const fetchCreditBalance = useWorkspaceStore(state => state.fetchCreditBalance);

    const realtimeChannelRef = useRef(null);
    const countdownRef = useRef(null);
    const pollingRef = useRef(null);
    const paymentHandledRef = useRef(false);

    // Notify parent
    useEffect(() => {
        onPaymentModalChange?.(showQrModal);
    }, [showQrModal, onPaymentModalChange]);

    useEffect(() => {
        setIsMobile(isMobileDevice());
    }, []);

    const stopCountdown = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    }, []);

    const startCountdown = useCallback((seconds) => {
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
    }, [stopCountdown]);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    const handlePaymentSuccess = useCallback(async (creditsGranted) => {
        setSessionStatus('paid');
        stopCountdown();
        stopPolling();

        if (realtimeChannelRef.current) {
            supabase.removeChannel(realtimeChannelRef.current);
            realtimeChannelRef.current = null;
        }

        if (session?.user?.id) {
            await fetchCreditBalance(session.user.id);
        }

        import('../../components/ui/Toast').then(({ toast }) => {
            toast.success(
                <div className="flex flex-col">
                    <strong className="font-bold text-lg mb-1">Credits Added!</strong>
                    <span className="opacity-90">{creditsGranted || 10} credits have been added.</span>
                </div>
            );
        });

        setTimeout(() => {
            setShowQrModal(false);
            setPaymentSession(null);
            setSessionStatus('idle');
            setErrorMessage('');
        }, 3000);
    }, [session?.user?.id, fetchCreditBalance, stopCountdown, stopPolling]);

    const startRealtimeListener = useCallback((sessionId) => {
        if (realtimeChannelRef.current) {
            supabase.removeChannel(realtimeChannelRef.current);
        }
        paymentHandledRef.current = false;

        const channel = supabase
            .channel(`payment_session_${sessionId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'payment_sessions',
                filter: `id=eq.${sessionId}`
            }, async (payload) => {
                const newStatus = payload.new?.status;
                const creditsGranted = payload.new?.credits_to_grant || 10;
                if (newStatus === 'paid' && !paymentHandledRef.current) {
                    paymentHandledRef.current = true;
                    handlePaymentSuccess(creditsGranted);
                } else if (newStatus === 'expired') {
                    setSessionStatus('expired');
                    stopCountdown();
                }
            })
            .subscribe();

        realtimeChannelRef.current = channel;
    }, [handlePaymentSuccess, stopCountdown]);

    const startPolling = useCallback((sessionId) => {
        stopPolling();
        const jitter = Math.floor(Math.random() * 1500);
        pollingRef.current = setInterval(async () => {
            try {
                const { data } = await supabase
                    .from('payment_sessions')
                    .select('status, credits_to_grant')
                    .eq('id', sessionId)
                    .single();

                if (data && data.status === 'paid' && !paymentHandledRef.current) {
                    paymentHandledRef.current = true;
                    handlePaymentSuccess(data.credits_to_grant);
                } else if (data && data.status === 'expired') {
                    setSessionStatus('expired');
                    stopCountdown();
                    stopPolling();
                }
            } catch (err) { console.error('[Polling] Error:', err); }
        }, 3000 + jitter);
    }, [handlePaymentSuccess, stopCountdown, stopPolling]);

    const handleBaseCheckout = async (tierName = 'base') => {
        if (!session?.user?.id) {
            import('../../components/ui/Toast').then(({ toast }) => {
                toast.error('Please log in to proceed.');
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
            if (!response.ok) throw new Error(data.error || 'Failed to initiate payment.');

            setPaymentSession(data);
            setSessionStatus('waiting');
            startRealtimeListener(data.session_id);
            startPolling(data.session_id);
            startCountdown(data.ttl_seconds || 600);

        } catch (error) {
            setSessionStatus('error');
            setErrorMessage(error.message);
        }
    };

    const handleDynamicCheckout = async (tier) => {
        if (!session?.user?.id) return;
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
            if (!response.ok) throw new Error(data.error || 'Failed to generate checkout link');

            if (isMobileDevice()) {
                window.location.href = data.checkout_url;
            } else {
                setQrModal({ qr_image: data.qr_image, checkout_url: data.checkout_url, tier });
                setPaymentConfirmed(false);
            }
        } catch (error) {
            console.error('Checkout error:', error);
        } finally {
            setIsProcessing(null);
        }
    };

    const fetchInvoiceHistory = async () => {
        setShowInvoice(true);
        setInvoiceLoading(true);
        setInvoiceError('');
        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            const response = await fetch('/api/payment-history', {
                method: 'GET',
                headers: { ...(currentSession?.access_token && { 'Authorization': `Bearer ${currentSession.access_token}` }) }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to load history.');
            setInvoiceHistory(data.history || []);
        } catch (err) { setInvoiceError(err.message); }
        finally { setInvoiceLoading(false); }
    };

    const cleanupSession = useCallback(() => {
        if (realtimeChannelRef.current) {
            supabase.removeChannel(realtimeChannelRef.current);
            realtimeChannelRef.current = null;
        }
        stopCountdown();
        stopPolling();
        setPaymentSession(null);
        setSessionStatus('idle');
        setErrorMessage('');
    }, [stopCountdown, stopPolling]);

    // Initial session recovery
    useEffect(() => {
        const recoverSession = async () => {
            if (!session?.user?.id) return;
            const { data } = await supabase
                .from('payment_sessions')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                const s = data[0];
                const createdAt = new Date(s.created_at);
                const elapsed = Math.floor((Date.now() - createdAt.getTime()) / 1000);
                const remaining = Math.max(0, 600 - elapsed);

                if (remaining > 0) {
                    const pesos = Math.floor(s.exact_amount_due / 100);
                    const centavos = s.exact_amount_due % 100;
                    setPaymentSession({
                        session_id: s.id,
                        exact_amount_due: s.exact_amount_due,
                        display_amount: `₱${pesos}.${centavos.toString().padStart(2, '0')}`,
                        credits: s.credits_to_grant,
                        tier: s.tier
                    });
                    setSessionStatus('waiting');
                    startRealtimeListener(s.id);
                    startPolling(s.id);
                    startCountdown(remaining);
                }
            }
        };
        recoverSession();
    }, [session?.user?.id, startRealtimeListener, startPolling, startCountdown]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return {
        isProcessing, isMobile, showQrModal, setShowQrModal, paymentSession, sessionStatus,
        errorMessage, countdown, qrModal, setQrModal, paymentConfirmed, setPaymentConfirmed,
        showInvoice, setShowInvoice, invoiceLoading, invoiceError, invoiceHistory,
        handleBaseCheckout, handleDynamicCheckout, fetchInvoiceHistory, cleanupSession,
        formatTime
    };
}

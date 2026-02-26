import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { applyCors } from '../_lib/corsHelper.js';

export default async function handler(req, res) {
    // W-8: CORS
    if (applyCors(req, res)) return;

    // ─── TASK-01: Guard setup — do NOT log or touch DB before signature check ───
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('[Webhook] Missing Supabase service role configuration.');
        return res.status(500).json({ error: 'Server misconfiguration.' });
    }

    if (!webhookSecret) {
        console.error('[Webhook] PAYMONGO_WEBHOOK_SECRET is not configured.');
        return res.status(500).json({ error: 'Webhook secret not configured.' });
    }

    // ─── C-1 FIX: ENFORCE signature verification — reject on mismatch ───
    // W-5 FIX: No DB writes before this check passes.
    const signatureHeader = req.headers['paymongo-signature'];
    if (!signatureHeader) {
        console.error('[Webhook] Missing paymongo-signature header — rejecting.');
        return res.status(401).json({ error: 'Missing signature.' });
    }

    const parts = {};
    signatureHeader.split(',').forEach(part => {
        const eqIdx = part.indexOf('=');
        if (eqIdx > -1) parts[part.slice(0, eqIdx)] = part.slice(eqIdx + 1);
    });
    const { t: timestamp, li: liveSig, te: testSig } = parts;
    const signature = liveSig || testSig;

    if (!timestamp || !signature) {
        console.error('[Webhook] Malformed signature header — rejecting.');
        return res.status(401).json({ error: 'Malformed signature.' });
    }

    const rawBody = JSON.stringify(req.body);
    const expected = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${timestamp}.${rawBody}`)
        .digest('hex');

    if (signature !== expected) {
        // C-1 FIX: Reject — do not proceed. No DB write.
        console.error('[Webhook] Signature mismatch — request rejected.');
        return res.status(401).json({ error: 'Invalid signature.' });
    }

    console.log('[Webhook] Signature verified successfully.');

    // ─── Signature passed — now safe to connect to DB ───
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    try {
        const event = req.body;
        const eventType = event?.data?.attributes?.type;
        const attrs = event?.data?.attributes;

        // C-4 FIX: Only log non-PII metadata — never the full event payload.
        await supabaseAdmin.from('webhook_logs').insert({
            payload: {
                _log: 'verified_event',
                eventType,
                timestamp,
                has_attrs: !!attrs,
            }
        });

        console.log(`[Webhook] Event type: ${eventType}`);

        // ═══ payment.paid — Direct QR Ph / GCash payments ═══
        if (eventType === 'payment.paid') {
            const pathA = attrs?.amount;
            const pathB = attrs?.data?.attributes?.amount;
            const pathC = attrs?.data?.amount;
            const amount = pathA || pathB || pathC || 0;

            // Log amount paths without PII
            await supabaseAdmin.from('webhook_logs').insert({
                payload: {
                    _log: 'payment.paid_amount',
                    amount_used: amount,
                    path_A: pathA,
                    path_B: pathB,
                    path_C: pathC,
                }
            });

            console.log(`[Webhook] payment.paid — amount: ${amount} centavos`);

            if (!amount || amount < 100) {
                return res.status(200).json({ received: true, matched: false, reason: 'invalid_amount', amount });
            }

            return await processAmountMatch(supabaseAdmin, amount, res);
        }

        // ═══ qrph.expired ═══
        if (eventType === 'qrph.expired') {
            console.log('[Webhook] qrph.expired received — no action needed.');
            return res.status(200).json({ received: true, processed: false, reason: 'qr_expired' });
        }

        // ═══ link.payment.paid ═══
        if (eventType === 'link.payment.paid') {
            const linkData = attrs?.data;
            const amount = linkData?.attributes?.amount || 0;

            console.log(`[Webhook] link.payment.paid — amount: ${amount}`);

            if (!amount || amount < 100) {
                return res.status(200).json({ received: true, matched: false, reason: 'invalid_amount' });
            }

            return await processAmountMatch(supabaseAdmin, amount, res);
        }

        console.log(`[Webhook] Unhandled event type: ${eventType} — acknowledged.`);
        return res.status(200).json({ received: true, processed: false, eventType });

    } catch (error) {
        console.error('[Webhook] Processing error:', error);
        try {
            await supabaseAdmin.from('webhook_logs').insert({
                // C-4: Only log error metadata
                payload: { _log: 'processing_error', message: error.message }
            });
        } catch (_) { }
        return res.status(500).json({ error: 'Internal webhook processing error.' });
    }
}

// ═══════════════════════════════════════════════════════
// C-6 FIX: Idempotent credit grant via atomic DB claim
// Uses claim_payment_session() which atomically transitions
// status pending→paid and returns the session only once.
// Duplicate webhook delivery will find no 'pending' session → no-op.
// ═══════════════════════════════════════════════════════
async function processAmountMatch(supabaseAdmin, amount, res) {
    // Expire stale sessions first
    try {
        await supabaseAdmin.rpc('expire_stale_sessions');
    } catch (_) { }

    // C-6 FIX: Atomically claim the session (mark paid in one DB call).
    // The RPC returns the claimed row, or nothing if already paid/no match.
    const { data: claimedRows, error: claimError } = await supabaseAdmin
        .rpc('claim_payment_session', { p_amount: amount });

    if (claimError) {
        console.error('[Webhook] claim_payment_session RPC error:', claimError.message);
        await supabaseAdmin.from('webhook_logs').insert({
            payload: { _log: 'claim_error', amount, error: claimError.message }
        });
        return res.status(500).json({ error: 'Failed to claim payment session.' });
    }

    if (!claimedRows || claimedRows.length === 0) {
        // Already paid (idempotent) or no match
        console.warn(`[Webhook] No claimable pending session for amount ${amount} — already processed or no match.`);
        await supabaseAdmin.from('webhook_logs').insert({
            payload: { _log: 'no_claimable_session', amount }
        });
        return res.status(200).json({ received: true, matched: false, reason: 'no_pending_match_or_already_processed', amount });
    }

    const matchedSession = claimedRows[0];
    const { user_id: matchedUserId, credits_to_grant: matchedCredits, tier: matchedTier } = matchedSession;

    console.log(`[Webhook] ✅ CLAIMED! Amount ${amount} → User ${matchedUserId}, tier: ${matchedTier}, granting ${matchedCredits} credits`);

    // ─── Step 1: Grant credits ───
    const { error: creditError } = await supabaseAdmin.rpc('increment_credits', {
        target_user_id: matchedUserId,
        add_amount: matchedCredits
    });

    if (creditError) {
        console.warn('[Webhook] increment_credits RPC failed, using direct update fallback:', creditError.message);
        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('current_credit_balance')
            .eq('id', matchedUserId)
            .single();

        if (profile) {
            await supabaseAdmin
                .from('user_profiles')
                .update({ current_credit_balance: profile.current_credit_balance + matchedCredits })
                .eq('id', matchedUserId);
        }
    }

    // ─── Step 2: Handle Tier and Credits for Standard/Premium ───
    if (matchedTier === 'standard' || matchedTier === 'premium') {
        const initialCredits = matchedTier === 'premium' ? 50 : 40;
        const { error: tierError } = await supabaseAdmin
            .from('user_profiles')
            .update({
                plan_tier: matchedTier,
                premium_credits: initialCredits,
                plan_locked_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                premium_next_refill: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('id', matchedUserId);

        if (tierError) {
            console.warn(`[Webhook] Tier upgrade to '${matchedTier}' failed:`, tierError.message);
        } else {
            console.log(`[Webhook] ⬆️ Tier upgraded to '${matchedTier}' for user ${matchedUserId}. Credits set to ${initialCredits}.`);
        }
    }

    // ─── Step 3: Handle Base Tokens ───
    if (matchedTier === 'base') {
        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('base_tokens')
            .eq('id', matchedUserId)
            .single();

        const newBalance = (profile?.base_tokens || 0) + matchedCredits;

        await supabaseAdmin
            .from('user_profiles')
            .update({
                base_tokens: newBalance,
                base_token_expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('id', matchedUserId);

        console.log(`[Webhook] 🪙 Base tokens updated: ${newBalance}. Expiry reset to T+24h.`);
    }

    // Note: payment_sessions.status was already set to 'paid' by claim_payment_session() RPC.
    await supabaseAdmin.from('webhook_logs').insert({
        payload: { _log: 'success', matchedUserId, matchedCredits, matchedTier, amount }
    });

    return res.status(200).json({ received: true, matched: true, credits_granted: matchedCredits, tier: matchedTier, amount });
}

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
    // --- EARLY LOGGING: Catch all incoming requests immediately ---
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let supabaseAdmin = null;

    if (supabaseUrl && serviceRoleKey) {
        supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        try {
            await supabaseAdmin.from('webhook_logs').insert({
                payload: {
                    _log: 'raw_intercept',
                    method: req.method,
                    signature: req.headers['paymongo-signature'],
                    body: req.body,
                }
            });
        } catch (e) {
            console.error('[Webhook] Early log failed:', e.message);
        }
    }
    // --- END EARLY LOGGING ---

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!supabaseAdmin) {
        console.error('[Webhook] Missing Supabase service role configuration.');
        return res.status(500).json({ error: 'Server misconfiguration.' });
    }

    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('[Webhook] PAYMONGO_WEBHOOK_SECRET is not configured.');
        return res.status(500).json({ error: 'Webhook secret not configured.' });
    }

    // 1. Signature verification (bypassed for debugging, logged as warning)
    const signatureHeader = req.headers['paymongo-signature'];
    if (signatureHeader) {
        const parts = {};
        signatureHeader.split(',').forEach(part => {
            const eqIdx = part.indexOf('=');
            if (eqIdx > -1) parts[part.slice(0, eqIdx)] = part.slice(eqIdx + 1);
        });
        const { t: timestamp, li: liveSig, te: testSig } = parts;
        const signature = liveSig || testSig;

        if (timestamp && signature) {
            const rawBody = JSON.stringify(req.body);
            const expected = crypto
                .createHmac('sha256', webhookSecret)
                .update(`${timestamp}.${rawBody}`)
                .digest('hex');

            if (signature !== expected) {
                console.warn('[Webhook] Signature mismatch (bypassed for debugging).');
            } else {
                console.log('[Webhook] Signature verified successfully.');
            }
        }
    }

    // 2. Parse the event — req.body is already parsed by Vercel
    const event = req.body;

    try {
        const eventType = event?.data?.attributes?.type;
        const attrs = event?.data?.attributes;

        // Log the parsed event type for debugging
        await supabaseAdmin.from('webhook_logs').insert({
            payload: {
                _log: 'parsed_event',
                eventType,
                attrs_keys: attrs ? Object.keys(attrs) : [],
                attrs_data_keys: attrs?.data ? Object.keys(attrs.data) : [],
                full_attrs: attrs,
            }
        });

        console.log(`[Webhook] Event type: ${eventType}`);

        // ═══════════════════════════════════════════════════════
        // payment.paid — Direct QR Ph / GCash / other direct payments
        // PayMongo may nest the amount at different levels depending on payment method.
        // We try every known path and log them all for debugging.
        // ═══════════════════════════════════════════════════════
        if (eventType === 'payment.paid') {
            // Try all known payload paths for the amount:
            // Path A: data.attributes.amount (top-level payment object)
            const pathA = attrs?.amount;
            // Path B: data.attributes.data.attributes.amount (nested payment)
            const pathB = attrs?.data?.attributes?.amount;
            // Path C: data.attributes.data.amount (some older formats)
            const pathC = attrs?.data?.amount;
            // Path D: full event object top level (unlikely but safe)
            const pathD = event?.data?.amount;
            // Path E: direct body amount (edge case)
            const pathE = event?.amount;

            const amount = pathA || pathB || pathC || pathD || pathE || 0;

            await supabaseAdmin.from('webhook_logs').insert({
                payload: {
                    _log: 'payment.paid_detail',
                    amount_used: amount,
                    path_A_attrs_amount: pathA,
                    path_B_attrs_data_attrs_amount: pathB,
                    path_C_attrs_data_amount: pathC,
                    path_D_data_amount: pathD,
                    path_E_event_amount: pathE,
                    attrs_keys: attrs ? Object.keys(attrs) : [],
                    attrs_data_keys: attrs?.data ? Object.keys(attrs.data) : [],
                    attrs_data_attrs_keys: attrs?.data?.attributes ? Object.keys(attrs.data.attributes) : [],
                    full_event: event,
                }
            });
            console.log(`[Webhook] payment.paid — amount: ${amount} centavos (pathA=${pathA}, pathB=${pathB}, pathC=${pathC})`);

            if (!amount || amount < 100) {
                console.warn('[Webhook] Invalid amount:', amount);
                return res.status(200).json({ received: true, matched: false, reason: 'invalid_amount', amount, pathA, pathB, pathC });
            }

            return await processAmountMatch(supabaseAdmin, amount, res);
        }

        // ═══════════════════════════════════════════════════════
        // qrph.expired — Static QR code expired (no-op)
        // ═══════════════════════════════════════════════════════
        if (eventType === 'qrph.expired') {
            console.log('[Webhook] qrph.expired received — no action needed.');
            return res.status(200).json({ received: true, processed: false, reason: 'qr_expired' });
        }

        // ═══════════════════════════════════════════════════════
        // link.payment.paid — PayMongo Payment Link completed
        // Payload: event.data.attributes.data.attributes.amount
        // ═══════════════════════════════════════════════════════
        if (eventType === 'link.payment.paid') {
            const linkData = attrs?.data;
            const amount = linkData?.attributes?.amount || 0;
            const referenceNumber = linkData?.attributes?.reference_number;

            console.log(`[Webhook] link.payment.paid — amount: ${amount}, reference: ${referenceNumber}`);

            if (!amount || amount < 100) {
                return res.status(200).json({ received: true, matched: false, reason: 'invalid_amount' });
            }

            return await processAmountMatch(supabaseAdmin, amount, res);
        }

        // All other event types — acknowledge but don't process
        console.log(`[Webhook] Unhandled event type: ${eventType} — acknowledged.`);
        return res.status(200).json({ received: true, processed: false, eventType });

    } catch (error) {
        console.error('[Webhook] Processing error:', error);
        try {
            await supabaseAdmin.from('webhook_logs').insert({
                payload: { _log: 'processing_error', message: error.message, stack: error.stack }
            });
        } catch (_) { }
        return res.status(500).json({ error: 'Internal webhook processing error.' });
    }
}

// ═══════════════════════════════════════════════════════
// Core centavo matching logic — shared by all payment types
// ═══════════════════════════════════════════════════════
async function processAmountMatch(supabaseAdmin, amount, res) {
    // Expire stale sessions first (silently — errors here are non-fatal)
    try {
        await supabaseAdmin.rpc('expire_stale_sessions');
    } catch (_) { }

    // Match by exact_amount_due
    const { data: matchedSession, error: matchError } = await supabaseAdmin
        .from('payment_sessions')
        .select('*')
        .eq('exact_amount_due', amount)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (matchError || !matchedSession) {
        console.warn(`[Webhook] No pending session for amount ${amount}.`);
        await supabaseAdmin.from('webhook_logs').insert({
            payload: { _log: 'no_match', amount, matchError: matchError?.message }
        });
        return res.status(200).json({ received: true, matched: false, reason: 'no_pending_match', amount });
    }

    const matchedUserId = matchedSession.user_id;
    const matchedCredits = matchedSession.credits_to_grant;
    const matchedTier = matchedSession.tier; // 'base', 'standard', or 'premium'

    console.log(`[Webhook] ✅ MATCH! Amount ${amount} → User ${matchedUserId}, tier: ${matchedTier}, granting ${matchedCredits} credits`);

    // ─── Step 1: Grant credits ───
    const { error: creditError } = await supabaseAdmin.rpc('increment_credits', {
        target_user_id: matchedUserId,
        add_amount: matchedCredits
    });

    if (creditError) {
        console.warn('[Webhook] increment_credits RPC failed, using direct update:', creditError.message);
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

    // ─── Step 2: Upgrade tier if Standard or Premium ───
    if (matchedTier === 'standard' || matchedTier === 'premium') {
        const tierExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const { error: tierError } = await supabaseAdmin
            .from('user_profiles')
            .update({
                tier: matchedTier,
                tier_expires_at: tierExpiresAt,
                daily_credits_used: 0,
                daily_credits_reset_at: new Date().toISOString()
            })
            .eq('id', matchedUserId);

        if (tierError) {
            console.warn(`[Webhook] Tier upgrade to '${matchedTier}' failed:`, tierError.message);
        } else {
            console.log(`[Webhook] ⬆️ Tier upgraded to '${matchedTier}' for user ${matchedUserId}, expires: ${tierExpiresAt}`);
        }
    }

    // ─── Step 3: Mark session as paid — triggers Supabase Realtime to frontend ───
    await supabaseAdmin
        .from('payment_sessions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', matchedSession.id);

    await supabaseAdmin.from('webhook_logs').insert({
        payload: { _log: 'success', matchedUserId, matchedCredits, matchedTier, amount }
    });

    console.log(`[Webhook] ✅ Done: user ${matchedUserId} granted ${matchedCredits} credits, tier = ${matchedTier}.`);
    return res.status(200).json({ received: true, matched: true, credits_granted: matchedCredits, tier: matchedTier, amount });
}

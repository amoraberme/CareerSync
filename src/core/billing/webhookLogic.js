import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

/**
 * Core logic for processing PayMongo webhooks.
 * This file is part of the Immutable Billing Vault.
 * DO NOT MODIFY without AUTHORIZE_BILLING_OVERRIDE.
 */
export async function processWebhook(req) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    if (!supabaseUrl || !serviceRoleKey || !webhookSecret) {
        throw new Error('Missing core billing configuration');
    }

    // Verify Signature
    const signatureHeader = req.headers['paymongo-signature'];
    if (!signatureHeader) throw new Error('Missing signature');

    const parts = {};
    signatureHeader.split(',').forEach(part => {
        const eqIdx = part.indexOf('=');
        if (eqIdx > -1) parts[part.slice(0, eqIdx)] = part.slice(eqIdx + 1);
    });
    const { t: timestamp, li: liveSig, te: testSig } = parts;
    const signature = liveSig || testSig;

    const rawBody = JSON.stringify(req.body);
    const expected = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${timestamp}.${rawBody}`)
        .digest('hex');

    if (signature !== expected) throw new Error('Invalid signature');

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const event = req.body;
    const eventType = event?.data?.attributes?.type;
    const attrs = event?.data?.attributes;

    // Log verified event
    await supabaseAdmin.from('webhook_logs').insert({
        payload: { _log: 'verified_event', eventType, timestamp, has_attrs: !!attrs }
    });

    if (eventType === 'payment.paid' || eventType === 'link.payment.paid') {
        const amount = attrs?.amount || attrs?.data?.attributes?.amount || attrs?.data?.amount || 0;
        if (amount >= 100) {
            return await handleAmountMatch(supabaseAdmin, amount);
        }
    }

    return { received: true, processed: false, eventType };
}

async function handleAmountMatch(supabaseAdmin, amount) {
    // 1. Expire stale
    try { await supabaseAdmin.rpc('expire_stale_sessions'); } catch (_) { }

    // 2. Claim session
    const { data: claimedRows, error: claimError } = await supabaseAdmin
        .rpc('claim_payment_session', { p_amount: amount });

    if (claimError) throw claimError;
    if (!claimedRows || claimedRows.length === 0) {
        return { received: true, matched: false, reason: 'no_match_or_already_processed', amount };
    }

    const session = claimedRows[0];
    const { user_id, credits_to_grant, tier } = session;

    // 3. Grant Credits
    await supabaseAdmin.rpc('increment_credits', {
        target_user_id: user_id,
        add_amount: credits_to_grant
    });

    // 4. Upgrade Tier
    if (tier === 'standard' || tier === 'premium') {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await supabaseAdmin.from('user_profiles').update({
            tier,
            tier_expires_at: expiresAt,
            daily_credits_used: 0,
            daily_credits_reset_at: new Date().toISOString()
        }).eq('id', user_id);
    }

    return { received: true, matched: true, user_id, tier, amount };
}

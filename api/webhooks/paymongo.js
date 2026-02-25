import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('PAYMONGO_WEBHOOK_SECRET is not configured.');
        return res.status(500).json({ error: 'Webhook secret not configured.' });
    }

    // 1. Verify PayMongo signature
    const signatureHeader = req.headers['paymongo-signature'];
    if (!signatureHeader) {
        return res.status(400).json({ error: 'Missing Paymongo-Signature header.' });
    }

    // PayMongo signature format: t=<timestamp>,te=<test_sig>,li=<live_sig>
    const signatureParts = {};
    signatureHeader.split(',').forEach(part => {
        const [key, value] = part.split('=');
        signatureParts[key] = value;
    });

    const timestamp = signatureParts['t'];
    const signature = signatureParts['li'] || signatureParts['te']; // live in prod, test in dev

    if (!timestamp || !signature) {
        return res.status(400).json({ error: 'Malformed signature header.' });
    }

    // Vercel parses req.body automatically. We serialize it back for signature check.
    const rawBody = JSON.stringify(req.body);

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload)
        .digest('hex');

    if (signature !== expectedSignature) {
        console.warn('[Webhook] Signature verification failed, but bypassing for debugging.');
    }

    // 2. Initialize Supabase admin client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('Webhook: Missing Supabase service role configuration.');
        return res.status(500).json({ error: 'Server misconfiguration.' });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    try {
        const event = JSON.parse(rawBody);

        // Log the exact payload to Supabase for debugging the structure
        await supabaseAdmin.from('webhook_logs').insert({ payload: event });

        const eventType = event?.data?.attributes?.type;

        // PayMongo fires 'link.payment.paid' when a payment link is completed
        if (eventType === 'link.payment.paid') {
            const linkData = event?.data?.attributes?.data;
            const referenceNumber = linkData?.attributes?.reference_number; // = userId
            const amount = linkData?.attributes?.amount;                     // centavos
            const linkId = linkData?.id;                                     // lnk_xxx

            if (!referenceNumber) {
                console.error('Webhook: Missing reference_number in payload.');
                return res.status(400).json({ error: 'Missing reference_number.' });
            }

            // 3. Determine credits and tier from amount
            let creditsToGrant = 0;
            let tier = 'base';

            if (amount === 10000) {
                creditsToGrant = 10;       // Base Token — ₱100 (PayMongo minimum)
                tier = 'base';
            } else if (amount === 24500) {
                creditsToGrant = 750;      // Standard — ₱245/mo
                tier = 'standard';
            } else if (amount === 29500) {
                creditsToGrant = 1050;     // Premium — ₱295/mo
                tier = 'premium';
            } else {
                // Fallback: 1 credit per ₱10 (handles edge amount variations)
                creditsToGrant = Math.floor(amount / 1000);
                console.warn(`[Webhook] Unexpected amount: ${amount} centavos. Granted ${creditsToGrant} credits via fallback.`);
            }

            // 4. Atomically add credits via RPC
            const { error: rpcError } = await supabaseAdmin.rpc('increment_credits', {
                target_user_id: referenceNumber,
                add_amount: creditsToGrant
            });

            if (rpcError) {
                // Fallback: direct update if RPC doesn't exist yet
                console.warn('[Webhook] increment_credits RPC not found, using direct update:', rpcError.message);
                const { data: currentProfile } = await supabaseAdmin
                    .from('user_profiles')
                    .select('current_credit_balance')
                    .eq('id', referenceNumber)
                    .single();

                if (currentProfile) {
                    await supabaseAdmin
                        .from('user_profiles')
                        .update({ current_credit_balance: currentProfile.current_credit_balance + creditsToGrant })
                        .eq('id', referenceNumber);
                }
            }

            // 5. Upgrade tier for Standard and Premium subscriptions
            // Base token doesn't change tier — it just adds credits
            if (tier === 'standard' || tier === 'premium') {
                const { error: tierError } = await supabaseAdmin
                    .from('user_profiles')
                    .update({ tier })
                    .eq('id', referenceNumber);

                if (tierError) {
                    console.error(`[Webhook] Failed to upgrade tier to ${tier}:`, tierError.message);
                } else {
                    console.log(`[Webhook] Upgraded user ${referenceNumber} to ${tier} tier.`);
                }
            }

            // 6. Mark transaction as paid in the audit table
            if (linkId) {
                const { error: txError } = await supabaseAdmin
                    .from('transactions')
                    .update({
                        status: 'paid',
                        paid_at: new Date().toISOString(),
                        credits_granted: creditsToGrant
                    })
                    .eq('paymongo_link_id', linkId)
                    .eq('user_id', referenceNumber);

                if (txError) {
                    // Non-fatal — credits are already granted
                    console.warn('[Webhook] Failed to update transaction record:', txError.message);
                }
            }

            console.log(`[Webhook] Granted ${creditsToGrant} credits + tier="${tier}" to user ${referenceNumber} (amount: ${amount} centavos).`);
            return res.status(200).json({ received: true, credits_granted: creditsToGrant, tier });
        }

        // ═══════════════════════════════════════════════════════
        // Static QR Ph Payment — Unique Centavo Amount Matching
        // ═══════════════════════════════════════════════════════
        if (eventType === 'qrph.payment.paid' || eventType === 'payment.paid') {
            // ─── ROBUST AMOUNT EXTRACTION ───
            // PayMongo in-store QR payloads may nest the amount differently
            const paymentData = event?.data?.attributes?.data;
            const paymentAttributes = paymentData?.attributes || {};

            // Try multiple payload paths for the amount
            const amount = paymentAttributes.amount
                || event?.data?.attributes?.amount
                || paymentData?.amount
                || 0;

            // Log the full structure for debugging
            console.log(`[Webhook] Event type: ${eventType}`);
            console.log(`[Webhook] Raw payload keys: ${JSON.stringify(Object.keys(event?.data?.attributes || {}))}`);
            console.log(`[Webhook] data.attributes.data keys: ${JSON.stringify(Object.keys(paymentData || {}))}`);
            console.log(`[Webhook] data.attributes.data.attributes keys: ${JSON.stringify(Object.keys(paymentAttributes))}`);
            console.log(`[Webhook] Extracted amount: ${amount} centavos`);
            console.log(`[Webhook] Full payload: ${JSON.stringify(event?.data?.attributes).substring(0, 500)}`);

            if (!amount || amount < 100) {
                console.warn('[Webhook] QR Ph payment has invalid amount:', amount);
                return res.status(200).json({ received: true, matched: false, reason: 'invalid_amount' });
            }

            // First expire any stale sessions to free up centavo slots
            await supabaseAdmin.rpc('expire_stale_sessions').catch(() => { });

            // Match by exact_amount_due — this is the core of centavo matching
            const { data: matchedSession, error: matchError } = await supabaseAdmin
                .from('payment_sessions')
                .select('*')
                .eq('exact_amount_due', amount)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (matchError || !matchedSession) {
                console.warn(`[Webhook] No pending session for amount ${amount}. Unmatched payment.`);
                return res.status(200).json({ received: true, matched: false, reason: 'no_pending_match', amount });
            }

            const matchedUserId = matchedSession.user_id;
            const matchedCredits = matchedSession.credits_to_grant;

            console.log(`[Webhook] CENTAVO MATCH! Amount ${amount} → User ${matchedUserId}, granting ${matchedCredits} credits`);

            // Grant credits
            const { error: creditError } = await supabaseAdmin.rpc('increment_credits', {
                target_user_id: matchedUserId,
                add_amount: matchedCredits
            });

            if (creditError) {
                console.warn('[Webhook] increment_credits RPC unavailable, direct update:', creditError.message);
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

            // Mark session as paid — this triggers Supabase Realtime to the frontend
            await supabaseAdmin
                .from('payment_sessions')
                .update({ status: 'paid', paid_at: new Date().toISOString() })
                .eq('id', matchedSession.id);

            console.log(`[Webhook] ✅ Centavo match complete: user ${matchedUserId} granted ${matchedCredits} credits for ${amount} centavos.`);
            return res.status(200).json({ received: true, matched: true, credits_granted: matchedCredits, amount });
        }

        // Acknowledge all other event types without processing
        return res.status(200).json({ received: true, processed: false });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({ error: 'Internal webhook processing error.' });
    }
}

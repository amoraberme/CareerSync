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

    const rawBody = JSON.stringify(req.body);
    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload)
        .digest('hex');

    if (signature !== expectedSignature) {
        console.error('Webhook signature verification failed.');
        return res.status(401).json({ error: 'Invalid webhook signature.' });
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
        const event = req.body;
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
        // Static QR Ph Payment — Reference Number Matching
        // ═══════════════════════════════════════════════════════
        if (eventType === 'qrph.payment.paid' || eventType === 'payment.paid') {
            const paymentData = event?.data?.attributes?.data;
            const paymentAttributes = paymentData?.attributes || {};

            // Extract reference number from webhook
            const webhookRef = paymentAttributes.reference_number
                || paymentAttributes.bank_reference
                || paymentAttributes.statement_descriptor
                || '';

            const amount = paymentAttributes.amount || 0;
            const remarks = paymentAttributes.remarks || '';

            // Clean for matching (alphanumeric only)
            const cleanWebhookRef = webhookRef.replace(/[^a-zA-Z0-9]/g, '');

            console.log(`[Webhook] QR Ph payment — ref: "${webhookRef}", clean: "${cleanWebhookRef}", amount: ${amount}, remarks: "${remarks}"`);

            if (!cleanWebhookRef) {
                console.warn('[Webhook] QR Ph payment has no reference — cannot auto-match.');
                return res.status(200).json({ received: true, matched: false, reason: 'no_reference' });
            }

            // Try exact match first
            let matchedVerification = null;

            const { data: exactMatch } = await supabaseAdmin
                .from('payment_verifications')
                .select('*')
                .eq('reference_number', cleanWebhookRef)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1);

            if (exactMatch && exactMatch.length > 0) {
                matchedVerification = exactMatch[0];
            } else {
                // Partial match fallback
                const { data: allPending } = await supabaseAdmin
                    .from('payment_verifications')
                    .select('*')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (allPending) {
                    matchedVerification = allPending.find(v => {
                        const userRef = v.reference_number;
                        return cleanWebhookRef.includes(userRef)
                            || userRef.includes(cleanWebhookRef)
                            || cleanWebhookRef.endsWith(userRef)
                            || userRef.endsWith(cleanWebhookRef);
                    });
                }
            }

            if (!matchedVerification) {
                console.warn(`[Webhook] No match for QR Ph ref: "${cleanWebhookRef}". Logged for manual review.`);
                return res.status(200).json({ received: true, matched: false, reason: 'no_pending_match' });
            }

            const qrUserId = matchedVerification.user_id;
            const qrCredits = matchedVerification.credits_to_grant;

            console.log(`[Webhook] Matched! User ${qrUserId}, granting ${qrCredits} credits for ref ${cleanWebhookRef}`);

            // Grant credits
            const { error: qrRpcError } = await supabaseAdmin.rpc('increment_credits', {
                target_user_id: qrUserId,
                add_amount: qrCredits
            });

            if (qrRpcError) {
                console.warn('[Webhook] RPC unavailable, direct update:', qrRpcError.message);
                const { data: profile } = await supabaseAdmin
                    .from('user_profiles')
                    .select('current_credit_balance')
                    .eq('id', qrUserId)
                    .single();

                if (profile) {
                    await supabaseAdmin
                        .from('user_profiles')
                        .update({ current_credit_balance: profile.current_credit_balance + qrCredits })
                        .eq('id', qrUserId);
                }
            }

            // Mark verification as verified
            await supabaseAdmin
                .from('payment_verifications')
                .update({ status: 'verified', verified_at: new Date().toISOString() })
                .eq('id', matchedVerification.id);

            console.log(`[Webhook] QR Ph auto-matched: user ${qrUserId} granted ${qrCredits} credits.`);
            return res.status(200).json({ received: true, matched: true, credits_granted: qrCredits });
        }

        // Acknowledge all other event types without processing
        return res.status(200).json({ received: true, processed: false });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({ error: 'Internal webhook processing error.' });
    }
}

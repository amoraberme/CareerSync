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

    // PayMongo signature format: t=<timestamp>,te=<test_signature>,li=<live_signature>
    const signatureParts = {};
    signatureHeader.split(',').forEach(part => {
        const [key, value] = part.split('=');
        signatureParts[key] = value;
    });

    const timestamp = signatureParts['t'];
    // Use live signature in production, test signature in development
    const signature = signatureParts['li'] || signatureParts['te'];

    if (!timestamp || !signature) {
        return res.status(400).json({ error: 'Malformed signature header.' });
    }

    // Reconstruct the signed payload
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

    // 2. Process the event
    try {
        const event = req.body;
        const eventType = event?.data?.attributes?.type;

        // PayMongo fires 'link.payment.paid' when a payment link is completed
        if (eventType === 'link.payment.paid') {
            const linkData = event?.data?.attributes?.data;
            const referenceNumber = linkData?.attributes?.reference_number; // Our userId
            const amount = linkData?.attributes?.amount; // Amount in centavos

            if (!referenceNumber) {
                console.error('Webhook: Missing reference_number in payload.');
                return res.status(400).json({ error: 'Missing reference_number.' });
            }

            // 3. Use service role key to bypass RLS and update credits
            const supabaseUrl = process.env.VITE_SUPABASE_URL;
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !serviceRoleKey) {
                console.error('Webhook: Missing Supabase service role configuration.');
                return res.status(500).json({ error: 'Server misconfiguration.' });
            }

            const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

            // Determine credits to grant based on the amount paid
            let creditsToGrant = 0;
            if (amount === 10000) creditsToGrant = 10;       // Base Token (₱100)
            else if (amount === 24500) creditsToGrant = 750;  // Standard (₱245/mo)
            else if (amount === 29500) creditsToGrant = 1050; // Premium (₱295/mo)
            else creditsToGrant = Math.floor(amount / 1000);  // Fallback: 1 credit per ₱10

            // Update the user's credit balance directly
            const { error: updateError } = await supabaseAdmin
                .from('user_profiles')
                .update({
                    current_credit_balance: supabaseAdmin.rpc ? undefined : undefined // Will use raw SQL below
                })
                .eq('id', referenceNumber);

            // Use RPC for atomic increment instead
            const { error: rpcError } = await supabaseAdmin.rpc('increment_credits', {
                target_user_id: referenceNumber,
                add_amount: creditsToGrant
            });

            if (rpcError) {
                // Fallback: Direct update if RPC doesn't exist yet
                console.warn('increment_credits RPC not found, using direct update:', rpcError.message);
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

            console.log(`[Webhook] Granted ${creditsToGrant} credits to user ${referenceNumber} for payment of ${amount} centavos.`);
            return res.status(200).json({ received: true, credits_granted: creditsToGrant });
        }

        // Acknowledge all other event types without processing
        return res.status(200).json({ received: true, processed: false });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({ error: 'Internal webhook processing error.' });
    }
}

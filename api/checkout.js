import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from './_lib/authMiddleware.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Verify Authentication — userId comes from JWT, not client body
    const user = await verifyAuth(req, res);
    if (!user) return; // 401 already sent by middleware

    try {
        const { tier } = req.body;
        const userId = user.id; // Server-verified, not client-supplied

        if (!tier) {
            return res.status(400).json({ error: 'Missing tier' });
        }

        const secretKey = process.env.PAYMONGO_SECRET_KEY;
        if (!secretKey) {
            return res.status(500).json({ error: 'PAYMONGO_SECRET_KEY is not configured on the server.' });
        }

        // Map tiers to amounts (in centavos) and descriptions
        // ₱50 = 5000 centavos, ₱245 = 24500, ₱295 = 29500
        const tierMapping = {
            base: { amount: 5000, credits: 10, description: 'CareerSync Base Token (10 Credits)' },
            standard: { amount: 24500, credits: 750, description: 'CareerSync Standard (Monthly Retainer)' },
            premium: { amount: 29500, credits: 1050, description: 'CareerSync Premium (The Professional Upgrade)' }
        };

        const config = tierMapping[tier.toLowerCase()];
        if (!config) {
            return res.status(400).json({ error: 'Invalid tier specified' });
        }

        // Base64 encode the secret key for basic auth
        const encodedKey = Buffer.from(secretKey + ':').toString('base64');

        // 2. Create the dynamic PayMongo payment link
        // reference_number permanently ties this payment to the user
        const paymongoResponse = await fetch('https://api.paymongo.com/v1/links', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'authorization': `Basic ${encodedKey}`
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        amount: config.amount,
                        description: config.description,
                        reference_number: userId  // User ID embedded — webhook uses this
                    }
                }
            })
        });

        if (!paymongoResponse.ok) {
            const errorData = await paymongoResponse.text();
            console.error('PayMongo API Error:', errorData);
            return res.status(paymongoResponse.status).json({ error: 'Failed to create checkout link with payment provider.' });
        }

        const data = await paymongoResponse.json();
        const linkAttributes = data.data.attributes;
        const linkId = data.data.id;

        // 3. Record the pending transaction in Supabase for audit trail
        const supabaseAdmin = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { error: dbError } = await supabaseAdmin
            .from('transactions')
            .insert({
                user_id: userId,
                paymongo_link_id: linkId,
                tier: tier.toLowerCase(),
                amount_centavos: config.amount,
                credits_granted: 0,           // updated to actual value when webhook fires
                status: 'pending'
            });

        if (dbError) {
            // Non-fatal: log but don't block the checkout
            console.warn('[Checkout] Failed to record pending transaction:', dbError.message);
        }

        // 4. Return checkout URL + QR image for device-aware frontend handling
        return res.status(200).json({
            checkout_url: linkAttributes.checkout_url,
            qr_image: linkAttributes.qr_image ?? null,   // URL to QR PNG — show on desktop
            link_id: linkId
        });

    } catch (error) {
        console.error("Checkout Request Error:", error);
        return res.status(500).json({ error: 'Internal server error processing checkout' });
    }
}

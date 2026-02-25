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
        // ₱1 = 100 centavos, ₱2 = 200, ₱3 = 300
        const tierMapping = {
            base: { amount: 100, credits: 10, description: 'CareerSync Base Token (10 Credits)' },
            standard: { amount: 200, credits: 750, description: 'CareerSync Standard (Monthly Retainer)' },
            premium: { amount: 300, credits: 1050, description: 'CareerSync Premium (The Professional Upgrade)' }
        };

        const config = tierMapping[tier.toLowerCase()];
        if (!config) {
            return res.status(400).json({ error: 'Invalid tier specified' });
        }

        // Base64 encode the secret key for basic auth
        // PayMongo accepts secretKey without trailing colon
        const encodedKey = Buffer.from(secretKey).toString('base64');

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
                        // PayMongo reference_number max 25 chars — strip hyphens from UUID
                        reference_number: userId.replace(/-/g, '').substring(0, 25)
                    }
                }
            })
        });

        if (!paymongoResponse.ok) {
            const errorData = await paymongoResponse.text();
            console.error('PayMongo API Error:', errorData);
            // Forward PayMongo's actual error message so we can debug from the frontend
            return res.status(paymongoResponse.status).json({
                error: 'PayMongo error',
                detail: errorData
            });
        }

        const data = await paymongoResponse.json();
        const linkAttributes = data.data.attributes;
        const linkId = data.data.id;

        // 3. Record the pending transaction in Supabase for audit trail
        // Fully isolated — any failure here MUST NOT block the checkout response
        try {
            const supabaseUrl = process.env.VITE_SUPABASE_URL;
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (supabaseUrl && serviceRoleKey) {
                const { createClient } = await import('@supabase/supabase-js');
                const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
                await supabaseAdmin.from('transactions').insert({
                    user_id: userId,
                    paymongo_link_id: linkId,
                    tier: tier.toLowerCase(),
                    amount_centavos: config.amount,
                    credits_granted: 0,
                    status: 'pending'
                });
            } else {
                console.warn('[Checkout] Supabase env vars not set — transaction not recorded.');
            }
        } catch (dbErr) {
            console.warn('[Checkout] Non-fatal: failed to record pending transaction:', dbErr.message);
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

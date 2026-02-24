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
        const tierMapping = {
            base: { amount: 10000, description: 'CareerSync Base Token (10 Credits)' },
            standard: { amount: 24500, description: 'CareerSync Standard (Monthly Retainer)' },
            premium: { amount: 29500, description: 'CareerSync Premium (The Professional Upgrade)' }
        };

        const config = tierMapping[tier.toLowerCase()];
        if (!config) {
            return res.status(400).json({ error: 'Invalid tier specified' });
        }

        // Base64 encode the secret key for basic auth
        const encodedKey = Buffer.from(secretKey).toString('base64');

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
                        reference_number: userId
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

        // Return the generated checkout URL to the frontend
        return res.status(200).json({ checkout_url: data.data.attributes.checkout_url });

    } catch (error) {
        console.error("Checkout Request Error:", error);
        return res.status(500).json({ error: 'Internal server error processing checkout' });
    }
}

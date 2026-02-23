export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { tier, userId } = req.body;

        if (!tier || !userId) {
            return res.status(400).json({ error: 'Missing tier or userId' });
        }

        const secretKey = process.env.PAYMONGO_SECRET_KEY;
        if (!secretKey) {
            return res.status(500).json({ error: 'PAYMONGO_SECRET_KEY is not configured on the server.' });
        }

        // Map tiers to amounts (in centavos) and descriptions
        const tierMapping = {
            base: { amount: 5000, description: 'CareerSync Base Token (5 Credits)' },
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

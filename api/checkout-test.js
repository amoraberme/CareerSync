/**
 * DIAGNOSTIC ENDPOINT — /api/checkout-test
 * Tests PayMongo credentials without requiring auth.
 * DELETE THIS FILE after debugging is done.
 */
export default async function handler(req, res) {
    const secretKey = process.env.PAYMONGO_SECRET_KEY;

    if (!secretKey) {
        return res.status(500).json({ error: 'PAYMONGO_SECRET_KEY is not set in Vercel env vars' });
    }

    const encodedKey = Buffer.from(secretKey).toString('base64');

    // Test with the MINIMUM safe amount — 10000 centavos (₱100)
    // If 5000 (₱50) is below PayMongo's minimum, this will succeed while 5000 fails
    const testAmount = parseInt(req.query.amount || '10000');

    try {
        const response = await fetch('https://api.paymongo.com/v1/links', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'authorization': `Basic ${encodedKey}`
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        amount: testAmount,
                        description: 'Test link — delete me',
                        reference_number: 'test123'
                    }
                }
            })
        });

        const data = await response.text();
        return res.status(response.status).json({
            paymongo_status: response.status,
            paymongo_ok: response.ok,
            amount_tested: testAmount,
            secret_key_prefix: secretKey.substring(0, 8) + '...',
            paymongo_response: JSON.parse(data)
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

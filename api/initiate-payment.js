import { applyCors } from '../src/core/billing/corsHelper.js';
import { verifyAuth } from './_lib/authMiddleware.js';
import { initiatePayment } from '../src/core/billing/initiatePaymentLogic.js';

export default async function handler(req, res) {
    if (applyCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const user = await verifyAuth(req, res);
    if (!user) return;

    try {
        const { tier, mobile } = req.body;
        const result = await initiatePayment(user.id, tier, mobile);
        return res.status(200).json(result);
    } catch (error) {
        console.error('[API InitiatePayment] Wrapper Error:', error.message);
        return res.status(500).json({ error: error.message || 'Internal server error.' });
    }
}

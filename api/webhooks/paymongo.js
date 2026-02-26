import { applyCors } from '../../src/core/billing/corsHelper.js';
import { processWebhook } from '../../src/core/billing/webhookLogic.js';

export default async function handler(req, res) {
    if (applyCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const result = await processWebhook(req);
        return res.status(200).json(result);
    } catch (error) {
        console.error('[API Webhook] Wrapper Error:', error.message);
        return res.status(error.message === 'Invalid signature' ? 401 : 500).json({ error: error.message });
    }
}

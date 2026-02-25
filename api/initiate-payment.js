import { verifyAuth } from './_lib/authMiddleware.js';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Verify Authentication
    const user = await verifyAuth(req, res);
    if (!user) return;

    try {
        const { tier } = req.body;
        const userId = user.id;

        // Tier configuration — only 'base' uses static QR + centavo matching
        const tierConfig = {
            base: { base_amount: 100, credits: 10 }   // ₱1.00 base (reduced for testing)
        };

        const config = tierConfig[(tier || 'base').toLowerCase()];
        if (!config) {
            return res.status(400).json({
                error: 'Centavo matching is only available for Base Token tier.'
            });
        }

        // 2. Initialize Supabase admin client
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('[InitiatePayment] Missing Supabase configuration.');
            return res.status(500).json({ error: 'Server configuration error.' });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // 3. Call the PostgreSQL RPC to assign a unique centavo amount
        // This function uses row locking to prevent race conditions
        const { data, error } = await supabaseAdmin.rpc('assign_unique_centavo', {
            p_user_id: userId,
            p_base_amount: config.base_amount,
            p_credits: config.credits,
            p_tier: (tier || 'base').toLowerCase()
        });

        if (error) {
            console.error('[InitiatePayment] RPC error:', error.message);

            // Handle pool exhaustion
            if (error.message && error.message.includes('POOL_EXHAUSTED')) {
                return res.status(503).json({
                    error: 'Our payment gateway is currently busy. Please try again in 1 minute.',
                    pool_exhausted: true
                });
            }

            return res.status(500).json({ error: 'Failed to initiate payment session.' });
        }

        if (!data || data.length === 0) {
            return res.status(500).json({ error: 'Failed to generate payment amount.' });
        }

        const session = data[0];
        const exactAmount = session.exact_amount_due;
        const pesos = Math.floor(exactAmount / 100);
        const centavos = exactAmount % 100;
        const displayAmount = `₱${pesos}.${centavos.toString().padStart(2, '0')}`;

        console.log(`[InitiatePayment] User ${userId} assigned ${displayAmount} (${exactAmount} centavos), session: ${session.session_id}`);

        return res.status(200).json({
            session_id: session.session_id,
            exact_amount_due: exactAmount,
            display_amount: displayAmount,
            credits: config.credits,
            tier: (tier || 'base').toLowerCase(),
            ttl_seconds: 600  // 10 minutes
        });

    } catch (error) {
        console.error('[InitiatePayment] Error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

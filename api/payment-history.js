import { verifyAuth } from './_lib/authMiddleware.js';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Verify authentication
    const user = await verifyAuth(req, res);
    if (!user) return;

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    try {
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // 2. Fetch all paid sessions for this user, newest first
        const { data, error } = await supabaseAdmin
            .from('payment_sessions')
            .select('id, tier, exact_amount_due, credits_to_grant, paid_at, created_at')
            .eq('user_id', user.id)
            .eq('status', 'paid')
            .order('paid_at', { ascending: false });

        if (error) {
            console.error('[PaymentHistory] Query error:', error.message);
            return res.status(500).json({ error: 'Failed to fetch payment history.' });
        }

        // 3. Format the response
        const history = (data || []).map(row => ({
            id: row.id,
            date: row.paid_at || row.created_at,
            tier: row.tier,
            amount_centavos: row.exact_amount_due,
            amount_display: `₱${Math.floor(row.exact_amount_due / 100)}.${(row.exact_amount_due % 100).toString().padStart(2, '0')}`,
            credits_gained: row.credits_to_grant,
        }));

        return res.status(200).json({ history });

    } catch (err) {
        console.error('[PaymentHistory] Fatal error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

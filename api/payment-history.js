import { verifyAuth } from './_lib/authMiddleware.js';
import { createClient } from '@supabase/supabase-js';
import { applyCors } from './_lib/corsHelper.js';

export default async function handler(req, res) {
    if (applyCors(req, res)) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = await verifyAuth(req, res);
    if (!user) return;

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    try {
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // Fetch unified credit history, newest first
        const { data, error } = await supabaseAdmin
            .from('credit_ledger')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[PaymentHistory] Query error:', error.message);
            return res.status(500).json({ error: 'Failed to fetch credit history.' });
        }

        const history = (data || []).map(row => ({
            id: row.id,
            date: row.created_at,
            description: row.description,
            type: row.transaction_type,
            amount_display: row.amount_display || '',
            credits_gained: row.credits_changed,
        }));

        return res.status(200).json({ history });

    } catch (err) {
        console.error('[PaymentHistory] Fatal error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

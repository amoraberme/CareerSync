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
        const { session_id } = req.body;
        const userId = user.id;

        if (!session_id) {
            return res.status(400).json({ error: 'Missing session_id.' });
        }

        // 2. Initialize Supabase admin client
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('[ConfirmPayment] Missing Supabase configuration.');
            return res.status(500).json({ error: 'Server configuration error.' });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // 3. Fetch the pending session — must belong to this user
        const { data: session, error: fetchError } = await supabaseAdmin
            .from('payment_sessions')
            .select('*')
            .eq('id', session_id)
            .eq('user_id', userId)
            .single();

        if (fetchError || !session) {
            return res.status(404).json({ error: 'Payment session not found.' });
        }

        if (session.status === 'paid') {
            return res.status(409).json({ error: 'This payment has already been credited.' });
        }

        if (session.status === 'expired' || session.status === 'cancelled') {
            return res.status(410).json({ error: 'This payment session has expired. Please start a new one.' });
        }

        // 4. Grant credits immediately
        const creditsToGrant = session.credits_to_grant;

        const { error: rpcError } = await supabaseAdmin.rpc('increment_credits', {
            target_user_id: userId,
            add_amount: creditsToGrant
        });

        if (rpcError) {
            // Fallback: direct update if RPC doesn't exist
            console.warn('[ConfirmPayment] RPC unavailable, direct update:', rpcError.message);
            const { data: profile } = await supabaseAdmin
                .from('user_profiles')
                .select('current_credit_balance')
                .eq('id', userId)
                .single();

            if (profile) {
                await supabaseAdmin
                    .from('user_profiles')
                    .update({ current_credit_balance: profile.current_credit_balance + creditsToGrant })
                    .eq('id', userId);
            }
        }

        // 5. Mark session as paid — this also triggers Realtime if subscribed
        await supabaseAdmin
            .from('payment_sessions')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', session_id);

        console.log(`[ConfirmPayment] ✅ User ${userId} confirmed ${session.display_amount || session.exact_amount_due} — granted ${creditsToGrant} credits.`);

        return res.status(200).json({
            success: true,
            credits_granted: creditsToGrant,
            message: `${creditsToGrant} credits added to your account!`
        });

    } catch (error) {
        console.error('[ConfirmPayment] Error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

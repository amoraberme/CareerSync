import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '../_lib/authMiddleware.js';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Verify the user's JWT to get their authenticated UID
    const user = await verifyAuth(req, res);
    if (!user) return; // 401 already sent by middleware

    const uid = user.id;

    try {
        // 2. Initialize Supabase Admin client with service role key (bypasses RLS)
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('Account deletion: Missing Supabase service role configuration.');
            return res.status(500).json({ error: 'Server misconfiguration. Contact support.' });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // 3. Delete user data from application tables first (in case FK cascades aren't set)
        // Delete analysis history
        await supabaseAdmin
            .from('candidates_history')
            .delete()
            .eq('user_id', uid);

        // Delete transactions
        await supabaseAdmin
            .from('transactions')
            .delete()
            .eq('user_id', uid);

        // Delete user profile
        await supabaseAdmin
            .from('user_profiles')
            .delete()
            .eq('id', uid);

        // 4. Delete the user from Supabase Auth (permanent, irreversible)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(uid);

        if (deleteError) {
            console.error('Failed to delete auth user:', deleteError);
            return res.status(500).json({ error: 'Failed to delete authentication record. Please contact support.' });
        }

        console.log(`[Account Deletion] User ${uid} permanently deleted.`);
        return res.status(200).json({ success: true, message: 'Account permanently deleted.' });

    } catch (error) {
        console.error('Account deletion error:', error);
        return res.status(500).json({ error: 'An unexpected error occurred during account deletion.' });
    }
}

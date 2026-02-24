import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '../_lib/authMiddleware.js';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Verify the user's JWT to get their authenticated UID and email
    const user = await verifyAuth(req, res);
    if (!user) return; // 401 already sent by middleware

    const uid = user.id;
    const email = user.email;

    try {
        // 2. Initialize Supabase Admin client with service role key (bypasses RLS)
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('Account deletion: Missing Supabase service role configuration.');
            return res.status(500).json({ error: 'Server misconfiguration. Contact support.' });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // 3. Record the email in previously_registered_emails BEFORE deleting
        //    This ensures re-signups with the same email get 0 credits
        if (email) {
            const { error: upsertError } = await supabaseAdmin
                .from('previously_registered_emails')
                .upsert(
                    { email: email, deleted_at: new Date().toISOString() },
                    { onConflict: 'email' }
                );

            if (upsertError) {
                console.error('Failed to record email in previously_registered_emails:', upsertError);
                // Continue with deletion even if this fails — it's a best-effort record
            }
        }

        // 4. Delete the user from Supabase Auth (permanent, irreversible)
        //    This cascades to delete: user_profiles, candidates_history, transactions
        //    (via ON DELETE CASCADE foreign keys)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(uid);

        if (deleteError) {
            console.error('Failed to delete auth user:', deleteError);
            return res.status(500).json({ error: 'Failed to delete authentication record. Please contact support.' });
        }

        console.log(`[Account Deletion] User ${uid} (${email}) permanently deleted.`);
        return res.status(200).json({ success: true, message: 'Account permanently deleted.' });

    } catch (error) {
        console.error('Account deletion error:', error);
        return res.status(500).json({ error: 'An unexpected error occurred during account deletion.' });
    }
}

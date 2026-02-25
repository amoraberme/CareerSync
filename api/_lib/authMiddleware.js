import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// C-5 FIX: Use service role key — anon key must never be used server-side.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Verifies the Supabase JWT from the Authorization header.
 * Returns the authenticated user object, or sends a 401 and returns null.
 */
export async function verifyAuth(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization header.' });
        return null;
    }

    const token = authHeader.replace('Bearer ', '');

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('[Auth] Missing Supabase service role configuration.');
        res.status(500).json({ error: 'Server misconfiguration.' });
        return null;
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false }
        });

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            res.status(401).json({ error: 'Unauthorized: Invalid or expired session token.' });
            return null;
        }

        return user;
    } catch (err) {
        console.error('[Auth] Token verification failed:', err.message);
        res.status(401).json({ error: 'Unauthorized: Token verification failed.' });
        return null;
    }
}

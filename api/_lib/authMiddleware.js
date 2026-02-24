import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

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

    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            res.status(401).json({ error: 'Unauthorized: Invalid or expired session token.' });
            return null;
        }

        return user;
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(401).json({ error: 'Unauthorized: Token verification failed.' });
        return null;
    }
}

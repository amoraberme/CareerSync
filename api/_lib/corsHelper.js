/**
 * Applies CORS headers and handles preflight OPTIONS requests.
 * Call at the top of every API handler before any other logic.
 * Returns true if the request was a preflight and has been handled.
 */
export function applyCors(req, res) {
    const allowedOrigin =
        process.env.VITE_APP_URL || 'https://career-sync-blush.vercel.app';

    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return true; // Caller should return immediately
    }
    return false;
}

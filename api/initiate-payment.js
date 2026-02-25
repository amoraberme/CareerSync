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
        const { tier, mobile } = req.body;  // `mobile: true` triggers GCash payment intent creation
        const userId = user.id;

        // Tier configuration — all tiers use static QR + centavo matching
        const tierConfig = {
            base: { base_amount: 100, credits: 10, label: 'Base Token' },     // ₱1.00
            standard: { base_amount: 200, credits: 750, label: 'Standard' },        // ₱2.00
            premium: { base_amount: 300, credits: 1050, label: 'Premium' }           // ₱3.00
        };

        const config = tierConfig[(tier || 'base').toLowerCase()];
        if (!config) {
            return res.status(400).json({
                error: `Invalid tier. Must be one of: ${Object.keys(tierConfig).join(', ')}.`
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

        // ─── Mobile: Create a GCash Payment Intent via PayMongo to get the proper redirect URL ───
        // PayMongo generates next_action.redirect.url specifically for opening the GCash app.
        // This is the correct gateway-provided URL that launches GCash to the payment screen.
        let gcashRedirectUrl = null;

        if (mobile && process.env.PAYMONGO_SECRET_KEY) {
            try {
                const encodedKey = Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64');
                const headers = {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'authorization': `Basic ${encodedKey}`
                };

                // Step 1: Create Payment Intent for the exact centavo amount
                const intentResp = await fetch('https://api.paymongo.com/v1/payment_intents', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        data: {
                            attributes: {
                                amount: exactAmount,
                                currency: 'PHP',
                                payment_method_allowed: ['gcash'],
                                capture_type: 'automatic',
                                description: `CareerSync ${config.label} — ${displayAmount}`
                            }
                        }
                    })
                });
                const intentData = await intentResp.json();
                const intentId = intentData?.data?.id;

                if (intentId) {
                    // Step 2: Create a GCash payment method
                    const methodResp = await fetch('https://api.paymongo.com/v1/payment_methods', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            data: { attributes: { type: 'gcash' } }
                        })
                    });
                    const methodData = await methodResp.json();
                    const methodId = methodData?.data?.id;

                    if (methodId) {
                        // Step 3: Attach the GCash method to the intent — this generates next_action.redirect.url
                        const returnUrl = `${process.env.VITE_APP_URL || 'https://career-sync-blush.vercel.app'}/billing`;
                        const attachResp = await fetch(`https://api.paymongo.com/v1/payment_intents/${intentId}/attach`, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({
                                data: {
                                    attributes: {
                                        payment_method: methodId,
                                        return_url: returnUrl
                                    }
                                }
                            })
                        });
                        const attachData = await attachResp.json();
                        gcashRedirectUrl = attachData?.data?.attributes?.next_action?.redirect?.url || null;
                        console.log(`[InitiatePayment] GCash redirect URL: ${gcashRedirectUrl ? 'obtained' : 'unavailable'}`);
                    }
                }
            } catch (pmErr) {
                // Non-fatal: log and continue — user still has desktop QR as fallback
                console.warn('[InitiatePayment] GCash payment intent creation failed:', pmErr.message);
            }
        }

        return res.status(200).json({
            session_id: session.session_id,
            exact_amount_due: exactAmount,
            display_amount: displayAmount,
            credits: config.credits,
            tier: (tier || 'base').toLowerCase(),
            ttl_seconds: 600,
            gcash_redirect_url: gcashRedirectUrl   // gateway-provided mobile URL (or null on desktop)
        });

    } catch (error) {
        console.error('[InitiatePayment] Error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

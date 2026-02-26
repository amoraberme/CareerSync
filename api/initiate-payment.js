import { verifyAuth } from './_lib/authMiddleware.js';
import { createClient } from '@supabase/supabase-js';
import { TIER_CONFIG } from './_lib/tierConfig.js';
import { applyCors } from './_lib/corsHelper.js';

export default async function handler(req, res) {
    // W-8: CORS
    if (applyCors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Verify Authentication
    const user = await verifyAuth(req, res);
    if (!user) return;

    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('[InitiatePayment] CRITICAL: Missing Supabase environment variables.');
            return res.status(500).json({ error: 'Server configuration error.' });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
        const { tier, mobile } = req.body;
        const userId = user.id;

        // 3. ENFORCE TIER LOCKS
        // Rule: If now() < plan_locked_until AND they are buying same or lower tier, BLOCK.
        const { data: profile, error: profileErr } = await supabaseAdmin
            .from('user_profiles')
            .select('plan_tier, plan_locked_until')
            .eq('id', userId)
            .single();

        if (profile && profile.plan_locked_until && new Date(profile.plan_locked_until) > new Date()) {
            const tiers = ['free', 'base', 'standard', 'premium'];
            const currentRank = tiers.indexOf(profile.plan_tier || 'free');
            const targetRank = tiers.indexOf(tier.toLowerCase());

            // If target is same or lower than current active (standard/premium only)
            if (currentRank >= 2 && targetRank <= currentRank) {
                return res.status(400).json({
                    error: `You currently have an active ${profile.plan_tier.toUpperCase()} plan. You cannot downgrade or repurchase this tier until it expires on ${new Date(profile.plan_locked_until).toLocaleDateString()}.`
                });
            }
        }

        // 4. Load tier configuration
        const config = TIER_CONFIG[(tier || 'base').toLowerCase()];
        if (!config) {
            return res.status(400).json({
                error: `Invalid tier. Must be one of: ${Object.keys(TIER_CONFIG).join(', ')}.`
            });
        }

        // 3. Assign a unique centavo amount via atomic row-locking RPC
        const { data, error } = await supabaseAdmin.rpc('assign_unique_centavo', {
            p_user_id: userId,
            p_base_amount: config.base_amount,
            p_credits: config.credits_on_purchase,  // W-4: nominal 1 credit for subscriptions
            p_tier: (tier || 'base').toLowerCase()
        });

        if (error) {
            console.error('[InitiatePayment] RPC error:', error.message);

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

        console.log(`[InitiatePayment] User ${userId} assigned ${displayAmount} (${exactAmount} centavos), tier: ${tier}`);

        // ─── Mobile: Create GCash Payment Intent via PayMongo ───
        let gcashRedirectUrl = null;

        if (mobile && process.env.PAYMONGO_SECRET_KEY) {
            // W-2: Warn if VITE_APP_URL is not set (staging/local will break silently otherwise)
            if (!process.env.VITE_APP_URL) {
                console.warn('[InitiatePayment] VITE_APP_URL is not set — GCash return URL will use fallback production URL.');
            }

            try {
                const encodedKey = Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64');
                const headers = {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'authorization': `Basic ${encodedKey}`
                };

                // Step 1: Create Payment Intent
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
                    // Step 2: Create GCash payment method
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
                        // W-2 FIX: /plans (not the old /billing path)
                        const returnUrl = `${process.env.VITE_APP_URL || 'https://careersync.website'}/plans`;
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
                    }
                }
            } catch (pmErr) {
                console.warn('[InitiatePayment] GCash payment intent creation failed:', pmErr.message);
            }
        }

        return res.status(200).json({
            session_id: session.session_id,
            exact_amount_due: exactAmount,
            display_amount: displayAmount,
            credits: config.credits_on_purchase,
            tier: (tier || 'base').toLowerCase(),
            ttl_seconds: 600,
            gcash_redirect_url: gcashRedirectUrl
        });

    } catch (error) {
        console.error("Payment Gateway Error:", error.response?.data || error.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

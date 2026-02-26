import { createClient } from '@supabase/supabase-js';
import { TIER_CONFIG } from './tierConfig.js';

/**
 * Core logic for initiating a PayMongo payment session.
 * This file is part of the Immutable Billing Vault.
 * DO NOT MODIFY without AUTHORIZE_BILLING_OVERRIDE.
 */
export async function initiatePayment(userId, tier, mobile) {
    try {
        const config = TIER_CONFIG[(tier || 'base').toLowerCase()];
        if (!config) {
            throw new Error(`Invalid tier: ${tier}`);
        }

        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const paymongoSecret = process.env.PAYMONGO_SECRET_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Missing Supabase configuration');
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // Assign unique centavo amount
        const { data, error } = await supabaseAdmin.rpc('assign_unique_centavo', {
            p_user_id: userId,
            p_base_amount: config.base_amount,
            p_credits: config.credits_on_purchase,
            p_tier: (tier || 'base').toLowerCase()
        });

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Failed to generate payment amount');

        const session = data[0];
        const exactAmount = session.exact_amount_due;
        const pesos = Math.floor(exactAmount / 100);
        const centavos = exactAmount % 100;
        const displayAmount = `₱${pesos}.${centavos.toString().padStart(2, '0')}`;

        let gcashRedirectUrl = null;

        if (mobile && paymongoSecret) {
            const encodedKey = Buffer.from(`${paymongoSecret}:`).toString('base64');
            const headers = {
                'accept': 'application/json',
                'content-type': 'application/json',
                'authorization': `Basic ${encodedKey}`
            };

            // 1. Create Intent
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
                // 2. Create Method
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
                    // 3. Attach
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
        }

        return {
            session_id: session.session_id,
            exact_amount_due: exactAmount,
            display_amount: displayAmount,
            credits: config.credits_on_purchase,
            tier: (tier || 'base').toLowerCase(),
            ttl_seconds: 600,
            gcash_redirect_url: gcashRedirectUrl
        };

    } catch (err) {
        console.error('[initiatePaymentLogic] Error:', err.message);
        throw err;
    }
}

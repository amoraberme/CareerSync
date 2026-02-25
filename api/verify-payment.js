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
        const { reference_number, tier, amount } = req.body;
        const userId = user.id;

        // Validate reference number
        if (!reference_number || reference_number.trim().length < 4) {
            return res.status(400).json({
                error: 'Please enter a valid reference number (at least 4 characters).'
            });
        }

        // Sanitize: remove spaces and special characters, keep alphanumeric only
        const cleanRef = reference_number.trim().replace(/[^a-zA-Z0-9]/g, '');

        if (!cleanRef || cleanRef.length < 4) {
            return res.status(400).json({
                error: 'Reference number must contain at least 4 alphanumeric characters.'
            });
        }

        // Determine credits and amount from tier
        const tierConfig = {
            base: { amount_centavos: 5000, credits: 10 }  // ₱50 micro-transaction via static QR
        };

        const config = tierConfig[(tier || 'base').toLowerCase()];
        if (!config) {
            return res.status(400).json({
                error: 'Static QR checkout is only available for Base Token tier.'
            });
        }

        // 2. Initialize Supabase admin client
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('[VerifyPayment] Missing Supabase configuration.');
            return res.status(500).json({ error: 'Server configuration error.' });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // 3. Check for duplicate reference number submission
        const { data: existing } = await supabaseAdmin
            .from('payment_verifications')
            .select('id, status')
            .eq('reference_number', cleanRef)
            .in('status', ['pending', 'verified'])
            .limit(1);

        if (existing && existing.length > 0) {
            const record = existing[0];
            if (record.status === 'verified') {
                return res.status(409).json({
                    error: 'This reference number has already been verified and credits granted.'
                });
            }
            return res.status(409).json({
                error: 'This reference number is already pending verification. Credits will be granted once confirmed.'
            });
        }

        // 4. Insert pending verification record
        const { data: inserted, error: insertError } = await supabaseAdmin
            .from('payment_verifications')
            .insert({
                user_id: userId,
                reference_number: cleanRef,
                tier: (tier || 'base').toLowerCase(),
                amount_centavos: config.amount_centavos,
                credits_to_grant: config.credits,
                status: 'pending'
            })
            .select('id')
            .single();

        if (insertError) {
            console.error('[VerifyPayment] Insert error:', insertError.message);
            return res.status(500).json({ error: 'Failed to submit verification request.' });
        }

        console.log(`[VerifyPayment] Pending verification created: ${inserted.id} for user ${userId}, ref: ${cleanRef}`);

        return res.status(200).json({
            success: true,
            verification_id: inserted.id,
            message: 'Reference number submitted! Credits will be granted once your payment is confirmed.'
        });

    } catch (error) {
        console.error('[VerifyPayment] Error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

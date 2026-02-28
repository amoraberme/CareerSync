-- ==========================================
-- PHASE 39: BILLING & CREDIT MECHANICS UPDATES
-- Run this migration in Supabase SQL Editor
-- ==========================================

-- 1. Update New User Initialization (3 default credits)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_was_previously_registered BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.previously_registered_emails
        WHERE email = NEW.email
    ) INTO v_was_previously_registered;

    -- Allocate 3 credits for new, non-returning users
    INSERT INTO public.user_profiles (
        id, 
        full_name, 
        current_credit_balance, 
        tier, 
        credits_reset_date
    )
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        CASE WHEN v_was_previously_registered THEN 0 ELSE 3 END,
        'base',
        CURRENT_DATE
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Drip & Expiry Logic (Cron Target)
CREATE OR REPLACE FUNCTION public.drip_daily_credits()
RETURNS VOID AS $$
BEGIN
    -- Rule A: Base Token Expiration (Rolling 24h)
    -- Wipes the balances of basic users exactly once their 24h timer expires
    UPDATE public.user_profiles
    SET 
        current_credit_balance = 0,
        base_tokens = 0,
        base_token_expiry = NULL
    WHERE 
        tier = 'base' 
        AND base_token_expiry IS NOT NULL 
        AND now() > base_token_expiry;

    -- Rule B: Subscription Expiry (1 Month Limit)
    -- Locks out people who reached the 1-month window
    UPDATE public.user_profiles
    SET 
        tier = 'base',
        plan_tier = 'base',
        current_credit_balance = 0,
        plan_locked_until = NULL,
        next_daily_refill = NULL
    WHERE 
        tier IN ('standard', 'premium')
        AND plan_locked_until IS NOT NULL 
        AND now() > plan_locked_until;

    -- Rule C: Subscription Daily Drip
    -- Stackable credits (+40 or +50), advances timer by 24h
    UPDATE public.user_profiles
    SET 
        current_credit_balance = current_credit_balance + CASE 
            WHEN tier = 'standard' THEN 40 
            WHEN tier = 'premium' THEN 50 
            ELSE 0 
        END,
        next_daily_refill = next_daily_refill + interval '24 hours'
    WHERE 
        tier IN ('standard', 'premium') 
        AND (next_daily_refill IS NULL OR now() >= next_daily_refill)
        AND (plan_locked_until IS NULL OR now() < plan_locked_until);
        
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Reset 24-hr expiry on newest Basic Token purchase
-- (Idempotent update ensures timer resets entirely on latest purchase)
CREATE OR REPLACE FUNCTION public.increment_base_tokens(target_user_id uuid, add_amount integer, expiry_time timestamptz)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_profiles
    SET 
        base_tokens = base_tokens + add_amount,
        base_token_expiry = expiry_time,
        tier = 'base'
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOTE: Setup pg_cron trigger manually in Supabase SQL editor:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('drip_daily_credits_job', '30 * * * *', $$ SELECT drip_daily_credits(); $$);

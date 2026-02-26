-- Billing Overhaul Schema Upgrade
-- 1. Add missing columns to user_profiles
ALTER TABLE IF EXISTS public.user_profiles 
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'base', 'standard', 'premium')),
ADD COLUMN IF NOT EXISTS premium_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS base_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS plan_locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_daily_refill TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS base_token_expiry TIMESTAMPTZ;

-- 2. Automated Math Logic (Rule 1, 2, 3)

-- Function to handle Daily Refills and Expansions
CREATE OR REPLACE FUNCTION public.apply_billing_rules()
RETURNS VOID AS $$
BEGIN
    -- Rule 1 (Daily Refill): Standard (40) / Premium (50)
    UPDATE public.user_profiles
    SET 
        premium_credits = CASE 
            WHEN plan_tier = 'standard' THEN 40 
            WHEN plan_tier = 'premium' THEN 50 
            ELSE premium_credits 
        END,
        next_daily_refill = now() + interval '24 hours'
    WHERE 
        plan_tier IN ('standard', 'premium') 
        AND (next_daily_refill IS NULL OR now() > next_daily_refill)
        AND (plan_locked_until IS NULL OR now() < plan_locked_until);

    -- Rule 2 (30-Day Reset / Expiry)
    UPDATE public.user_profiles
    SET 
        plan_tier = 'free',
        premium_credits = 0,
        plan_locked_until = NULL
    WHERE 
        plan_locked_until IS NOT NULL 
        AND now() > plan_locked_until;

    -- Rule 3 (Base Wipe)
    UPDATE public.user_profiles
    SET 
        base_tokens = 0,
        base_token_expiry = NULL
    WHERE 
        base_token_expiry IS NOT NULL 
        AND now() > base_token_expiry;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment base tokens with expiry
CREATE OR REPLACE FUNCTION public.increment_base_tokens(target_user_id uuid, add_amount integer, expiry_time timestamptz)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_profiles
    SET 
        base_tokens = base_tokens + add_amount,
        base_token_expiry = expiry_time
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- For this implementation, we will assume a cron job calls it every minute.

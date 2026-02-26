-- Billing Overhaul Schema Upgrade
-- 1. Add missing columns to user_profiles
ALTER TABLE IF EXISTS public.user_profiles 
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'base', 'standard', 'premium')),
ADD COLUMN IF NOT EXISTS premium_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS base_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS plan_locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_daily_refill TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS base_token_expiry TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS daily_credits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_credits_reset_at TIMESTAMPTZ;

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
        daily_credits_used = 0,
        next_daily_refill = now() + interval '24 hours',
        daily_credits_reset_at = now()
    WHERE 
        plan_tier IN ('standard', 'premium') 
        AND (next_daily_refill IS NULL OR now() > next_daily_refill)
        AND (plan_locked_until IS NULL OR now() < plan_locked_until);

    -- Rule 2 (30-Day Reset / Expiry)
    UPDATE public.user_profiles
    SET 
        plan_tier = 'free',
        tier = 'free',
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

-- Function to consume daily credits for Standard/Premium tiers
CREATE OR REPLACE FUNCTION public.consume_daily_credit(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
    v_tier text;
    v_cap integer;
    v_used integer;
    v_reset timestamptz;
BEGIN
    SELECT COALESCE(plan_tier, tier, 'base'), daily_credits_used, daily_credits_reset_at 
    INTO v_tier, v_used, v_reset
    FROM public.user_profiles 
    WHERE id = p_user_id;

    -- If base tier, skip daily cap logic
    IF v_tier = 'base' THEN
        RETURN true;
    END IF;

    v_cap := CASE WHEN v_tier = 'premium' THEN 50 ELSE 40 END;

    -- Reset logic: if more than 24h passed since last reset OR reset info is missing
    IF v_reset IS NULL OR now() > v_reset + interval '24 hours' THEN
        UPDATE public.user_profiles 
        SET daily_credits_used = 1, daily_credits_reset_at = now() 
        WHERE id = p_user_id;
        RETURN true;
    END IF;

    -- Normal increment if under cap
    IF v_used < v_cap THEN
        UPDATE public.user_profiles 
        SET daily_credits_used = daily_credits_used + 1 
        WHERE id = p_user_id;
        RETURN true;
    END IF;

    RETURN false;
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

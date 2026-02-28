-- =============================================================
-- Phase 40 (Revised): Ledger Updates & Rolling 24hr Refill Cron
-- Run this in Supabase SQL Editor
-- =============================================================

-- 1. Update existing credit_ledger CHECK constraint to allow new types
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'credit_ledger'::regclass AND contype = 'c';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE credit_ledger DROP CONSTRAINT "' || constraint_name || '"';
    END IF;
END $$;

ALTER TABLE credit_ledger 
ADD CONSTRAINT credit_ledger_transaction_type_check 
CHECK (transaction_type IN ('Receive', 'Bought', 'Parse', 'Analyze', 'TIER_PURCHASE', 'DAILY_REFILL', 'BASIC_TOKEN_BUY'));


-- 2. Comprehensive Daily Drip & Ledger Logging
CREATE OR REPLACE FUNCTION public.process_rolling_daily_refill()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_refill_amount INTEGER;
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

    -- Rule B: Subscription Expiry (30-Day Limit)
    -- Downgrades users who passed their 30-day lock into base tier
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

    -- Rule C: Subscription Daily Drip (Rolling 24h Window)
    -- Loop through active Standard/Premium users whose 24-hour refill timer has passed
    FOR v_user IN 
        SELECT id, tier, next_daily_refill 
        FROM user_profiles 
        WHERE tier IN ('standard', 'premium') 
          AND (next_daily_refill IS NULL OR now() >= next_daily_refill)
          AND (plan_locked_until IS NULL OR now() < plan_locked_until)
    LOOP
        -- Determine refill amount based on tier
        IF v_user.tier = 'premium' THEN
            v_refill_amount := 50;
        ELSIF v_user.tier = 'standard' THEN
            v_refill_amount := 40;
        END IF;

        -- Update the user's credit balance and advance their refill timer exactly 24 hours
        -- If it was null, start the 24h rolling window from now()
        UPDATE user_profiles
        SET 
            current_credit_balance = current_credit_balance + v_refill_amount,
            next_daily_refill = COALESCE(next_daily_refill, now()) + interval '24 hours'
        WHERE id = v_user.id;

        -- Insert into the credit_ledger
        INSERT INTO credit_ledger (user_id, description, transaction_type, credits_changed, amount_display)
        VALUES (
            v_user.id, 
            'Daily ' || initcap(v_user.tier) || ' Refill', 
            'DAILY_REFILL', 
            v_refill_amount, 
            NULL
        );
    END LOOP;
END;
$$;

-- 3. Schedule the Cron Job to run frequently
-- Unschedule previous obsolete jobs if they exist
DO $$
BEGIN
    PERFORM cron.unschedule('daily-credit-refill');
EXCEPTION WHEN others THEN END;
$$;

DO $$
BEGIN
    PERFORM cron.unschedule('drip_daily_credits_job');
EXCEPTION WHEN others THEN END;
$$;

-- Schedule the new continuous rolling job (Every 15 Minutes)
SELECT cron.schedule(
    'rolling-daily-credit-refill',   -- unique cron job name
    '*/15 * * * *',                  -- every 15 minutes
    $$SELECT process_rolling_daily_refill();$$
);

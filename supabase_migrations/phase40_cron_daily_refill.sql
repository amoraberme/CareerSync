-- =============================================================
-- Phase 40: Ledger Updates & Daily Refill Cron
-- Run this in Supabase SQL Editor
-- =============================================================

-- 1. Update existing credit_ledger CHECK constraint to allow new types
-- First, we need to drop the old constraint. 
-- By default, Supabase creates a system-generated name for CHECK constraints if not named.
-- The safest way is to drop and recreate the constraint.
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


-- 2. Create the Daily Refill Function
CREATE OR REPLACE FUNCTION process_daily_refill()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_refill_amount INTEGER;
BEGIN
    -- Loop through all users who have an active Standard or Premium tier
    FOR v_user IN 
        SELECT id, tier 
        FROM user_profiles 
        WHERE tier IN ('standard', 'premium') 
        -- Optional: Only refill if their tier hasn't expired
        -- AND (tier_expires_at IS NULL OR tier_expires_at > now())
    LOOP
        -- Determine refill amount based on tier
        IF v_user.tier = 'premium' THEN
            v_refill_amount := 50;
        ELSIF v_user.tier = 'standard' THEN
            v_refill_amount := 40;
        END IF;

        -- Update the user's credit balance
        UPDATE user_profiles
        SET current_credit_balance = current_credit_balance + v_refill_amount
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

-- 3. Schedule the Cron Job to run Daily at Midnight UTC
-- NOTE: pg_cron must be enabled in your Supabase Database Extensions
SELECT cron.schedule(
    'daily-credit-refill',   -- unique cron job name
    '0 0 * * *',             -- midnight UTC every day
    $$SELECT process_daily_refill();$$
);

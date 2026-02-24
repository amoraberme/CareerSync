-- ==========================================
-- PHASE 31: TIER-BASED ACCESS CONTROL
-- Run this migration in Supabase SQL Editor
-- ==========================================

-- 1. Add tier column to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'base' NOT NULL;

-- 2. Add check constraint for valid tier values
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS valid_tier;
ALTER TABLE user_profiles
  ADD CONSTRAINT valid_tier CHECK (tier IN ('base', 'standard', 'premium'));

-- 3. Add credits_reset_date for daily credit tracking (Standard/Premium)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS credits_reset_date DATE DEFAULT CURRENT_DATE;

-- 4. Update handle_new_user() to also set the tier on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_was_previously_registered BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.previously_registered_emails
        WHERE email = NEW.email
    ) INTO v_was_previously_registered;

    INSERT INTO public.user_profiles (id, full_name, current_credit_balance, tier, credits_reset_date)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        CASE WHEN v_was_previously_registered THEN 0 ELSE 1 END,
        'base',
        CURRENT_DATE
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- MANUAL TIER MANAGEMENT (Admin SQL Commands)
-- ==========================================
-- Use these in Supabase SQL Editor to manually change a user's tier:

-- Upgrade a user to Standard:
-- UPDATE user_profiles SET tier = 'standard', current_credit_balance = 25, credits_reset_date = CURRENT_DATE WHERE id = '<user-uuid>';

-- Upgrade a user to Premium:
-- UPDATE user_profiles SET tier = 'premium', current_credit_balance = 35, credits_reset_date = CURRENT_DATE WHERE id = '<user-uuid>';

-- Downgrade a user back to Base:
-- UPDATE user_profiles SET tier = 'base' WHERE id = '<user-uuid>';

-- Find a user by email (to get their UUID):
-- SELECT up.id, au.email, up.tier, up.current_credit_balance FROM user_profiles up JOIN auth.users au ON au.id = up.id WHERE au.email = 'user@example.com';

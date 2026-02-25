-- ==========================================
-- PHASE 32: BASE TOKEN UPDATE — 50 CREDITS ON SIGNUP
-- Run this in Supabase SQL Editor
-- ==========================================

-- Update handle_new_user() to grant 50 credits to new users
-- (returning users still receive 0 credits)
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
        CASE WHEN v_was_previously_registered THEN 0 ELSE 50 END,
        'base',
        CURRENT_DATE
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- OPTIONAL: Update existing base-tier users who still have 1 credit
-- to give them the new 50-credit baseline.
-- Only run this if you want to retroactively credit existing users.
-- ==========================================
-- UPDATE user_profiles SET current_credit_balance = 50 WHERE current_credit_balance = 1 AND tier = 'base';

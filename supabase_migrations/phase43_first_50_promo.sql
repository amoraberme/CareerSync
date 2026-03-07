-- ==========================================
-- PHASE 43: FIRST 50 PROMO & REALTIME COUNTER
-- Run this migration in Supabase SQL Editor
-- ==========================================

-- 1. Create site_stats table to hold aggregate metrics safely
CREATE TABLE IF NOT EXISTS public.site_stats (
    id TEXT PRIMARY KEY,
    stat_value INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize 'total_users' tracker
INSERT INTO public.site_stats (id, stat_value) 
VALUES ('total_users', 0) 
ON CONFLICT DO NOTHING;

-- Enable RLS and public read access
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view stats" ON public.site_stats;
    CREATE POLICY "Public can view stats" 
        ON public.site_stats FOR SELECT 
        USING (true);
END
$$;

-- IMPORTANT: Enable Realtime for site_stats table
BEGIN;
    -- Drop from publication if exists to avoid duplicated entries error, then add it
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_stats;
EXCEPTION WHEN OTHERS THEN
    -- Ignore if already added
END;

-- 2. Trigger to keep site_stats updated
CREATE OR REPLACE FUNCTION public.update_user_count_stat()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.site_stats 
    SET stat_value = (SELECT COUNT(*) FROM public.user_profiles), 
        updated_at = NOW() 
    WHERE id = 'total_users';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_profile_added ON public.user_profiles;
CREATE TRIGGER on_user_profile_added
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_user_count_stat();

-- 3. Modify handle_new_user to allocate 10 credits to the first 50 users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_was_previously_registered BOOLEAN;
    v_referrer_id UUID := NULL;
    v_referral_code TEXT;
    v_total_users INTEGER;
    v_credits_to_grant INTEGER;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.previously_registered_emails
        WHERE email = NEW.email
    ) INTO v_was_previously_registered;

    -- Extract referral code from metadata
    v_referral_code := NEW.raw_user_meta_data->>'referral_code';
    IF v_referral_code IS NOT NULL AND length(TRIM(v_referral_code)) >= 8 THEN
        -- Find a user whose UUID starts with this code
        SELECT id INTO v_referrer_id
        FROM auth.users
        WHERE id::text LIKE TRIM(v_referral_code) || '%'
        LIMIT 1;
    END IF;

    -- Determine credits based on total users (for free promos)
    SELECT COUNT(*) INTO v_total_users FROM public.user_profiles;
    IF v_total_users < 50 THEN
        v_credits_to_grant := 10;
    ELSE
        v_credits_to_grant := 3;
    END IF;

    -- Allocate credits for new users
    INSERT INTO public.user_profiles (
        id, 
        full_name, 
        current_credit_balance, 
        tier, 
        credits_reset_date,
        referred_by
    )
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        CASE WHEN v_was_previously_registered THEN 0 ELSE v_credits_to_grant END,
        'base',
        CURRENT_DATE,
        v_referrer_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

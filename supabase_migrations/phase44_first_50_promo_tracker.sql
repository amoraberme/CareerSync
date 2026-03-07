-- ==========================================
-- PHASE 44: FIRST 50 PROMO TRACKER
-- Run this migration in Supabase SQL Editor
-- ==========================================

-- 1. Create the promo_tracker table to manage spots safely
CREATE TABLE IF NOT EXISTS public.promo_tracker (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Enforce single row
    spots_remaining INTEGER NOT NULL DEFAULT 50 CHECK (spots_remaining >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the initial row
INSERT INTO public.promo_tracker (id, spots_remaining) 
VALUES (1, 50) 
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.promo_tracker ENABLE ROW LEVEL SECURITY;

-- Allow public read access (this will allow Realtime to broadcast changes)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view promo tracker" ON public.promo_tracker;
    CREATE POLICY "Public can view promo tracker" 
        ON public.promo_tracker FOR SELECT 
        USING (true);
END
$$;

-- Enable Realtime for the tracker table
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.promo_tracker;
EXCEPTION WHEN OTHERS THEN
    -- Ignore if already added
END
$$;

-- 2. Create RPC function for explicit fetching
CREATE OR REPLACE FUNCTION public.get_promo_spots_left()
RETURNS INTEGER AS $$
DECLARE
    spots INTEGER;
BEGIN
    SELECT spots_remaining INTO spots FROM public.promo_tracker WHERE id = 1;
    RETURN COALESCE(spots, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Modify handle_new_user to use a strict SELECT ... FOR UPDATE lock
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_was_previously_registered BOOLEAN;
    v_referrer_id UUID := NULL;
    v_referral_code TEXT;
    v_promo_spots_left INTEGER;
    v_credits_to_grant INTEGER;
BEGIN
    -- Check if email was previously registered
    SELECT EXISTS (
        SELECT 1 FROM public.previously_registered_emails
        WHERE email = NEW.email
    ) INTO v_was_previously_registered;

    -- Extract referral code from metadata safely
    IF NEW.raw_user_meta_data IS NOT NULL THEN
        v_referral_code := NEW.raw_user_meta_data->>'referral_code';
        IF v_referral_code IS NOT NULL AND length(TRIM(v_referral_code)) >= 8 THEN
            -- Find a user whose UUID starts with this code
            SELECT id INTO v_referrer_id
            FROM auth.users
            WHERE id::text LIKE TRIM(v_referral_code) || '%'
            LIMIT 1;
        END IF;
    END IF;

    -- === PROMO ACQUISITION LOGIC WITH ATOMIC UPDATE ===
    v_credits_to_grant := 3; -- Default

    -- Atomic decrement (will only update if spots > 0)
    UPDATE public.promo_tracker 
    SET spots_remaining = spots_remaining - 1,
        updated_at = NOW()
    WHERE id = 1 AND spots_remaining > 0
    RETURNING spots_remaining INTO v_promo_spots_left;

    -- If the UPDATE succeeded (meaning it returned a row), allocate 10 credits
    IF FOUND THEN
        v_credits_to_grant := 10;
    END IF;

    -- Allocate credits for new users
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
        CASE WHEN v_was_previously_registered THEN 0 ELSE v_credits_to_grant END,
        'base',
        CURRENT_DATE
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- PHASE 41: REFERRAL SYSTEM
-- Run this migration in Supabase SQL Editor
-- ==========================================

-- 1. Add referred_by to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Update New User Initialization to parse referral code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_was_previously_registered BOOLEAN;
    v_referrer_id UUID := NULL;
    v_referral_code TEXT;
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
        CASE WHEN v_was_previously_registered THEN 0 ELSE 3 END,
        'base',
        CURRENT_DATE,
        v_referrer_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger for fulfilling referral bonus on FIRST payment
CREATE OR REPLACE FUNCTION public.process_referral_reward()
RETURNS TRIGGER AS $$
DECLARE
    v_referrer_id UUID;
    v_is_first_payment BOOLEAN;
    v_referred_name TEXT;
BEGIN
    -- Only act on payment inserts (Bought, TIER_PURCHASE, BASIC_TOKEN_BUY)
    IF NEW.transaction_type IN ('Bought', 'TIER_PURCHASE', 'BASIC_TOKEN_BUY') THEN
        
        -- Check if this user was referred by someone
        SELECT referred_by, full_name INTO v_referrer_id, v_referred_name 
        FROM public.user_profiles 
        WHERE id = NEW.user_id;
        
        IF v_referrer_id IS NOT NULL THEN
            -- Check if this is their exact first payment
            SELECT COUNT(*) = 1 INTO v_is_first_payment 
            FROM public.credit_ledger 
            WHERE user_id = NEW.user_id 
              AND transaction_type IN ('Bought', 'TIER_PURCHASE', 'BASIC_TOKEN_BUY');
              
            IF v_is_first_payment THEN
                -- Grant 10 credits to the referrer
                UPDATE public.user_profiles 
                SET current_credit_balance = current_credit_balance + 10 
                WHERE id = v_referrer_id;
                
                -- Log it for the referrer's history as a distinct line item
                INSERT INTO public.credit_ledger (
                    user_id, 
                    description, 
                    transaction_type, 
                    credits_changed, 
                    amount_display
                ) VALUES (
                    v_referrer_id,
                    'Referral Bonus - ' || COALESCE(v_referred_name, 'New User'),
                    'Receive',
                    10,
                    NULL
                );
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_first_payment_referral ON public.credit_ledger;
CREATE TRIGGER on_first_payment_referral
    AFTER INSERT ON public.credit_ledger
    FOR EACH ROW EXECUTE PROCEDURE public.process_referral_reward();

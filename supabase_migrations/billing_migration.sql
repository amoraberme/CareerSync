-- CareerSync Tiered Billing & Subscription Migration
-- Purpose: Implement plan tiers, daily refills, and 30-day locks.

-- 1. Update user_profiles with new tracking columns
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'base', 'standard', 'premium')),
ADD COLUMN IF NOT EXISTS premium_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS base_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS plan_locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS premium_next_refill TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS base_token_expiry TIMESTAMPTZ;

-- 2. Rule 1: The 30-Day Reset (Function & Cron)
CREATE OR REPLACE FUNCTION public.reset_expired_plans()
RETURNS void AS $$
BEGIN
  UPDATE public.user_profiles
  SET 
    plan_tier = 'free',
    premium_credits = 0,
    plan_locked_until = NULL,
    premium_next_refill = NULL
  WHERE plan_locked_until < now()
    AND plan_tier IN ('standard', 'premium');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Rule 2: The 24-Hour Premium Refill (Function & Cron)
CREATE OR REPLACE FUNCTION public.refill_premium_credits()
RETURNS void AS $$
BEGIN
  -- Standard: 40, Premium: 50. Accumulation is allowed up to the 30-day limit.
  UPDATE public.user_profiles
  SET 
    premium_credits = premium_credits + CASE 
      WHEN plan_tier = 'standard' THEN 40 
      WHEN plan_tier = 'premium' THEN 50 
      ELSE 0 
    END,
    premium_next_refill = now() + INTERVAL '24 hours'
  WHERE plan_tier IN ('standard', 'premium')
    AND premium_next_refill < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Rule 3: The Base Token Expiration (Function & Cron)
CREATE OR REPLACE FUNCTION public.expire_base_tokens()
RETURNS void AS $$
BEGIN
  UPDATE public.user_profiles
  SET 
    base_tokens = 0,
    base_token_expiry = NULL
  WHERE base_token_expiry < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Enable pg_cron and schedule jobs
-- NOTE: Requires 'pg_cron' extension to be enabled in Supabase extensions dashboard.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule: Check every hour for resets/refills/expirations
SELECT cron.schedule('reset-expired-plans-job', '0 * * * *', 'SELECT public.reset_expired_plans()');
SELECT cron.schedule('refill-premium-credits-job', '0 * * * *', 'SELECT public.refill_premium_credits()');
SELECT cron.schedule('expire-base-tokens-job', '0 * * * *', 'SELECT public.expire_base_tokens()');

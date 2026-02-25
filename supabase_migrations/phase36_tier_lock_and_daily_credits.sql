-- =============================================================
-- Phase 36: Tier Lock + Daily Credit Columns
-- Run in Supabase SQL Editor
-- =============================================================

-- 1. 30-day tier lock: when Standard/Premium is purchased, set this to now() + 30 days
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS tier_expires_at TIMESTAMPTZ NULL;

-- 2. Daily usage tracking: resets on-the-fly every 24h
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS daily_credits_used  INTEGER NOT NULL DEFAULT 0;

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS daily_credits_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 3. Index for daily credit checks
CREATE INDEX IF NOT EXISTS idx_up_daily_reset
  ON user_profiles (id, daily_credits_reset_at);

-- =============================================================
-- Helper: get_tier_daily_limit(tier text) → integer
-- Returns the daily credit cap for a tier.
-- Base = -1 (unlimited), Standard = 40, Premium = 50
-- =============================================================
CREATE OR REPLACE FUNCTION get_tier_daily_limit(p_tier text)
RETURNS integer
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE p_tier
    WHEN 'premium'  THEN 50
    WHEN 'standard' THEN 40
    ELSE -1   -- -1 = unlimited (base tier)
  END;
$$;

-- =============================================================
-- Helper: reset_daily_credits_if_needed(p_user_id uuid) → void
-- Call this at the start of every analyze request.
-- If 24h have passed since last reset, resets daily_credits_used to 0.
-- =============================================================
CREATE OR REPLACE FUNCTION reset_daily_credits_if_needed(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE user_profiles
  SET
    daily_credits_used     = 0,
    daily_credits_reset_at = NOW()
  WHERE id = p_user_id
    AND NOW() - daily_credits_reset_at > INTERVAL '24 hours';
END;
$$;

-- =============================================================
-- Helper: consume_daily_credit(p_user_id uuid) → boolean
-- Returns TRUE if credit was consumed, FALSE if cap reached or unlimited.
-- Base tier always returns TRUE (unlimited).
-- =============================================================
CREATE OR REPLACE FUNCTION consume_daily_credit(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql AS $$
DECLARE
  v_tier          text;
  v_daily_used    integer;
  v_daily_limit   integer;
BEGIN
  -- Reset if 24h have passed first
  PERFORM reset_daily_credits_if_needed(p_user_id);

  SELECT tier, daily_credits_used
  INTO v_tier, v_daily_used
  FROM user_profiles
  WHERE id = p_user_id;

  v_daily_limit := get_tier_daily_limit(v_tier);

  -- Base tier: unlimited — do not track usage
  IF v_daily_limit = -1 THEN
    RETURN true;
  END IF;

  -- Cap check
  IF v_daily_used >= v_daily_limit THEN
    RETURN false; -- daily limit reached
  END IF;

  -- Consume one credit
  UPDATE user_profiles
  SET daily_credits_used = daily_credits_used + 1
  WHERE id = p_user_id;

  RETURN true;
END;
$$;

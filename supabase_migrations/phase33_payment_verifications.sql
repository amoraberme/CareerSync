-- =============================================================
-- Phase 33: Payment Verifications Table (Static QR Matching)
-- Run this in Supabase SQL Editor
-- =============================================================

DROP TABLE IF EXISTS payment_verifications CASCADE;

CREATE TABLE payment_verifications (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reference_number  text        NOT NULL,
  tier              text        NOT NULL DEFAULT 'base'
                    CHECK (tier IN ('base', 'standard', 'premium')),
  amount_centavos   integer     NOT NULL,
  credits_to_grant  integer     NOT NULL DEFAULT 10,
  status            text        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'verified', 'failed', 'expired')),
  created_at        timestamptz DEFAULT now(),
  verified_at       timestamptz
);

ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own verification records
CREATE POLICY "Users read own verifications"
  ON payment_verifications FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (webhook inserts/updates)
CREATE POLICY "Service role manages verifications"
  ON payment_verifications FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for webhook matching: look up by reference_number + pending status
CREATE INDEX IF NOT EXISTS idx_pv_reference_pending
  ON payment_verifications (reference_number, status)
  WHERE status = 'pending';

-- Index for user history
CREATE INDEX IF NOT EXISTS idx_pv_user_id
  ON payment_verifications (user_id, created_at DESC);

-- Auto-expire old pending verifications (optional cleanup)
-- Run as a scheduled function or cron if desired:
-- UPDATE payment_verifications SET status = 'expired'
-- WHERE status = 'pending' AND created_at < now() - interval '24 hours';

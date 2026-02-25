-- =============================================================
-- Phase 35: Fix missing increment_credits RPC + Realtime config
-- Run this in Supabase SQL Editor
-- =============================================================

-- ─── 1. Create increment_credits RPC ───
-- This was referenced by webhooks but never created
CREATE OR REPLACE FUNCTION increment_credits(
    target_user_id uuid,
    add_amount     integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE user_profiles
    SET current_credit_balance = current_credit_balance + add_amount
    WHERE id = target_user_id;
END;
$$;

-- ─── 2. Ensure Realtime is enabled for payment_sessions ───
-- This is idempotent — safe to run even if already added
DO $$
BEGIN
    -- Check if payment_sessions is already in the publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND tablename = 'payment_sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE payment_sessions;
    END IF;
END;
$$;

-- ─── 3. Enable REPLICA IDENTITY FULL for Realtime to send full row data ───
-- Without this, Realtime UPDATE events only send the changed columns
ALTER TABLE payment_sessions REPLICA IDENTITY FULL;

-- =============================================================
-- Phase 34: Unique Centavo Matching Payment System
-- Run this ENTIRE file in Supabase SQL Editor
-- =============================================================

-- ─── 1. Payment Sessions Table ───
DROP TABLE IF EXISTS payment_sessions CASCADE;

CREATE TABLE payment_sessions (
    id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    base_amount      integer     NOT NULL,                          -- e.g. 500 = ₱5.00
    centavo_suffix   integer     NOT NULL CHECK (centavo_suffix BETWEEN 1 AND 99),
    exact_amount_due integer     NOT NULL,                          -- base + suffix, e.g. 501
    credits_to_grant integer     NOT NULL DEFAULT 10,
    tier             text        NOT NULL DEFAULT 'base',
    status           text        NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'paid', 'expired', 'cancelled')),
    created_at       timestamptz DEFAULT now(),
    paid_at          timestamptz
);

-- ─── 2. Partial Unique Index ───
-- ENFORCED AT THE DATABASE LEVEL: no two pending sessions can share the same exact_amount_due
CREATE UNIQUE INDEX idx_unique_pending_amount
    ON payment_sessions (exact_amount_due)
    WHERE status = 'pending';

-- ─── 3. Row Level Security ───
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read their own sessions
CREATE POLICY "Users read own sessions"
    ON payment_sessions FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can do everything (backend operations)
CREATE POLICY "Service role full access"
    ON payment_sessions FOR ALL
    USING (true)
    WITH CHECK (true);

-- ─── 4. Indexes for performance ───
CREATE INDEX idx_ps_user_pending ON payment_sessions (user_id, status) WHERE status = 'pending';
CREATE INDEX idx_ps_created_pending ON payment_sessions (created_at) WHERE status = 'pending';

-- ─── 5. RPC: assign_unique_centavo ───
-- Transactionally assigns the NEXT AVAILABLE centavo suffix with row locking
-- Returns: session_id (uuid), exact_amount_due (integer)
CREATE OR REPLACE FUNCTION assign_unique_centavo(
    p_user_id     uuid,
    p_base_amount integer,
    p_credits     integer DEFAULT 10,
    p_tier        text    DEFAULT 'base'
)
RETURNS TABLE(session_id uuid, exact_amount_due integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_suffix   integer;
    v_session  uuid;
    v_amount   integer;
BEGIN
    -- Step 1: Expire stale sessions first (release centavos older than 10 min)
    UPDATE payment_sessions
    SET status = 'expired'
    WHERE status = 'pending'
      AND base_amount = p_base_amount
      AND created_at < now() - interval '3 minutes';

    -- Step 2: Cancel any existing pending session for THIS user at THIS base_amount
    -- (prevents a single user from hoarding multiple centavos)
    UPDATE payment_sessions
    SET status = 'cancelled'
    WHERE user_id = p_user_id
      AND base_amount = p_base_amount
      AND status = 'pending';

    -- Step 3: Lock all pending rows for this base_amount to prevent race conditions
    PERFORM id FROM payment_sessions
    WHERE base_amount = p_base_amount
      AND status = 'pending'
    FOR UPDATE;

    -- Step 4: Find the smallest available centavo suffix (1–99)
    SELECT s INTO v_suffix
    FROM generate_series(1, 99) AS s
    WHERE s NOT IN (
        SELECT centavo_suffix FROM payment_sessions
        WHERE base_amount = p_base_amount
          AND status = 'pending'
    )
    ORDER BY s
    LIMIT 1;

    -- Step 5: If no suffix available, raise error (pool exhausted)
    IF v_suffix IS NULL THEN
        RAISE EXCEPTION 'POOL_EXHAUSTED: All 99 centavo slots are currently in use. Please try again in 1 minute.';
    END IF;

    -- Step 6: Calculate exact amount
    v_amount := p_base_amount + v_suffix;

    -- Step 7: Insert the new session
    INSERT INTO payment_sessions (user_id, base_amount, centavo_suffix, exact_amount_due, credits_to_grant, tier, status)
    VALUES (p_user_id, p_base_amount, v_suffix, v_amount, p_credits, p_tier, 'pending')
    RETURNING id INTO v_session;

    -- Return result
    RETURN QUERY SELECT v_session, v_amount;
END;
$$;

-- ─── 6. RPC: expire_stale_sessions ───
-- Call periodically to release centavos from abandoned checkouts
CREATE OR REPLACE FUNCTION expire_stale_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count integer;
BEGIN
    UPDATE payment_sessions
    SET status = 'expired'
    WHERE status = 'pending'
      AND created_at < now() - interval '3 minutes';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- ─── 7. Enable Realtime ───
-- This allows the frontend to subscribe to changes on payment_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE payment_sessions;

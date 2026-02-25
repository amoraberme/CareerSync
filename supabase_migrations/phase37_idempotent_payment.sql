-- ================================================
-- Phase 37: Idempotent Payment Session Claim
-- Fixes: C-6 (race condition / double credit grant)
-- ================================================
-- This function atomically transitions a payment session
-- from 'pending' to 'paid' in a single DB round-trip.
--
-- WHY: The previous approach used two separate calls:
--   1. SELECT ... WHERE status='pending'
--   2. UPDATE ... SET status='paid'
-- A duplicate PayMongo webhook arriving between steps 1 and 2
-- would also SELECT the same row and grant credits twice.
--
-- THIS FUNCTION eliminates the window by doing both in one
-- atomic UPDATE ... RETURNING. If status is already 'paid',
-- the WHERE clause finds no rows → returns empty → no-op.
-- ================================================

CREATE OR REPLACE FUNCTION claim_payment_session(p_amount integer)
RETURNS TABLE (
    session_id      uuid,
    user_id         uuid,
    credits_to_grant integer,
    tier            text
) AS $$
BEGIN
    RETURN QUERY
    UPDATE payment_sessions
    SET
        status  = 'paid',
        paid_at = NOW()
    WHERE
        exact_amount_due = p_amount
        AND status = 'pending'
        -- Extra guard: only claim sessions not older than 15 minutes
        AND created_at > NOW() - INTERVAL '15 minutes'
    RETURNING
        id          AS session_id,
        payment_sessions.user_id,
        payment_sessions.credits_to_grant,
        payment_sessions.tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to the service role only
REVOKE ALL ON FUNCTION claim_payment_session(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION claim_payment_session(integer) TO service_role;

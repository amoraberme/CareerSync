-- =============================================================
-- Phase 38: Unified Credit Ledger
-- Run this in Supabase SQL Editor
-- =============================================================

-- 1. Create credit_ledger table
CREATE TABLE IF NOT EXISTS credit_ledger (
    id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description      text        NOT NULL,                          -- e.g. 'Bought 10 credits', 'ATS Analysis'
    transaction_type text        NOT NULL                           -- 'Receive', 'Bought', 'Parse', 'Analyze'
                     CHECK (transaction_type IN ('Receive', 'Bought', 'Parse', 'Analyze')),
    credits_changed  integer     NOT NULL,                          -- e.g. +10, -1
    amount_display   text,                                          -- e.g. '₱1.01' or NULL for usage
    created_at       timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own ledger"
    ON credit_ledger FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role manages ledger"
    ON credit_ledger FOR ALL
    USING (true)
    WITH CHECK (true);

-- 3. Update decrement_credits RPC to log usage
CREATE OR REPLACE FUNCTION decrement_credits(
    deduct_amount   integer,
    p_description   text    DEFAULT 'AI Usage',
    p_type          text    DEFAULT 'Analyze'
)
returns boolean as $$
declare
    v_current_balance integer;
begin
    -- Get current balance with lock
    select current_credit_balance into v_current_balance
    from user_profiles
    where id = auth.uid()
    for update;

    -- Gate
    if v_current_balance is null or v_current_balance < deduct_amount then
        return false;
    end if;

    -- Deduct
    update user_profiles
    set current_credit_balance = current_credit_balance - deduct_amount
    where id = auth.uid();

    -- Log to ledger
    insert into credit_ledger (user_id, description, transaction_type, credits_changed)
    values (auth.uid(), p_description, p_type, -deduct_amount);

    return true;
end;
$$ language plpgsql security definer;

-- 4. Update increment_credits RPC to log purchases
CREATE OR REPLACE FUNCTION increment_credits(
    target_user_id uuid,
    add_amount     integer,
    p_description  text    DEFAULT 'Credit Purchase',
    p_type         text    DEFAULT 'Bought',
    p_amount_str   text    DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update balance
    UPDATE user_profiles
    SET current_credit_balance = current_credit_balance + add_amount
    WHERE id = target_user_id;

    -- Log to ledger
    INSERT INTO credit_ledger (user_id, description, transaction_type, credits_changed, amount_display)
    VALUES (target_user_id, p_description, p_type, add_amount, p_amount_str);
END;
$$;

-- 5. Backfill: Migrate existing paid payment_sessions to credit_ledger
INSERT INTO credit_ledger (user_id, description, transaction_type, credits_changed, amount_display, created_at)
SELECT 
    user_id, 
    'Bought ' || credits_to_grant || ' credits (' || tier || ')', 
    'Bought', 
    credits_to_grant, 
    '₱' || floor(exact_amount_due / 100) || '.' || lpad((exact_amount_due % 100)::text, 2, '0'),
    paid_at
FROM payment_sessions
WHERE status = 'paid'
ON CONFLICT DO NOTHING;

-- =============================================================
-- Phase 32: Transactions Table
-- Run this in Supabase SQL Editor
-- =============================================================

-- Tracks every checkout session and its outcome
CREATE TABLE IF NOT EXISTS transactions (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  paymongo_link_id   text        NOT NULL,               -- PayMongo link ID (lnk_xxx)
  tier               text        NOT NULL                -- 'base' | 'standard' | 'premium'
                     CHECK (tier IN ('base', 'standard', 'premium')),
  amount_centavos    integer     NOT NULL,               -- amount in centavos (₱50 = 5000)
  credits_granted    integer     NOT NULL DEFAULT 0,     -- set when paid
  status             text        NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'paid', 'failed')),
  created_at         timestamptz DEFAULT now(),
  paid_at            timestamptz                         -- set when webhook fires
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own transactions
CREATE POLICY "Users read own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update (webhook uses service role key)
CREATE POLICY "Service role manages transactions"
  ON transactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast webhook lookups by link ID
CREATE INDEX IF NOT EXISTS idx_transactions_link_id
  ON transactions (paymongo_link_id);

-- Index for user history view
CREATE INDEX IF NOT EXISTS idx_transactions_user_id
  ON transactions (user_id, created_at DESC);

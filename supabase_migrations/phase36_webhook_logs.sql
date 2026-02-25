-- =============================================================
-- Phase 36: Webhook Logging Table
-- Run this in Supabase SQL Editor
-- =============================================================

CREATE TABLE IF NOT EXISTS webhook_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    payload jsonb
);

-- Enable RLS but allow inserts from anon/service roles for logging
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access to webhook_logs"
    ON webhook_logs
    FOR ALL
    USING (true)
    WITH CHECK (true);

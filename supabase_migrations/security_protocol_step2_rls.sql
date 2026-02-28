-- Step 2: RLS Lockdown Security Protocol
-- Run this in your Supabase SQL Editor to enforce strict RLS

-- 1. Enforce RLS on all active tables
ALTER TABLE candidates_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to ensure a clean slate for strict enforcement
DROP POLICY IF EXISTS "Users can view their own history" ON candidates_history;
DROP POLICY IF EXISTS "Users can insert their own history" ON candidates_history;
DROP POLICY IF EXISTS "Users can update their own history" ON candidates_history;
DROP POLICY IF EXISTS "Users can delete their own history" ON candidates_history;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users read own ledger" ON credit_ledger;
DROP POLICY IF EXISTS "Service role manages ledger" ON credit_ledger;

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;

DROP POLICY IF EXISTS "Public can view plans" ON plans;

-- 3. candidates_history: Strict ownership policies
CREATE POLICY "Strict SELECT own history" ON candidates_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Strict INSERT own history" ON candidates_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Strict UPDATE own history" ON candidates_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Strict DELETE own history" ON candidates_history
    FOR DELETE USING (auth.uid() = user_id);

-- 4. user_profiles: Strict ownership policies
CREATE POLICY "Strict SELECT own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Strict UPDATE own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 5. credit_ledger: Read-only for users (managed via Server/RPC)
CREATE POLICY "Strict SELECT own ledger" ON credit_ledger
    FOR SELECT USING (auth.uid() = user_id);

-- 6. transactions: Read/Insert for users initiating checkout
CREATE POLICY "Strict SELECT own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Strict INSERT own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Strict UPDATE own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- 7. plans: Read-only for all authenticated users
CREATE POLICY "Auth users can view plans" ON plans
    FOR SELECT USING (auth.role() = 'authenticated');

-- 8. webhook_logs: Service role only (Server-side API keys bypass RLS automatically, but we explicitly lock it down here for clients)
-- Webhooks are created by the backend API and only selected by the backend. No client policy needed.

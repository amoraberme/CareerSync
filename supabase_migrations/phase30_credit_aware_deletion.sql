-- ==========================================
-- PHASE 30: CREDIT-AWARE ACCOUNT DELETION
-- Run this migration in Supabase SQL Editor
-- ==========================================

-- ============================================
-- STEP 1: Fix Missing ON DELETE CASCADE on FKs
-- ============================================
-- Without these, deleting an auth.users row will FAIL due to FK constraints.

-- candidates_history.user_id -> auth.users
ALTER TABLE candidates_history
  DROP CONSTRAINT IF EXISTS candidates_history_user_id_fkey;
ALTER TABLE candidates_history
  ADD CONSTRAINT candidates_history_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- user_profiles.id -> auth.users
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- transactions.user_id -> user_profiles.id  (cascades when profile is deleted)
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE transactions
  ADD CONSTRAINT transactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- ============================================
-- STEP 2: Create previously_registered_emails
-- ============================================
-- Tracks emails of deleted accounts so re-registrations get 0 free credits.

CREATE TABLE IF NOT EXISTS previously_registered_emails (
    email TEXT PRIMARY KEY,
    deleted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS — only Service Role can access this table
ALTER TABLE previously_registered_emails ENABLE ROW LEVEL SECURITY;
-- No policies = no user access. Service Role bypasses RLS by default.

-- ============================================
-- STEP 3: Update handle_new_user() Trigger
-- ============================================
-- If the email was previously registered, user gets 0 credits.
-- Otherwise, they get the standard 1 free credit.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_was_previously_registered BOOLEAN;
BEGIN
    -- Check if this email was previously deleted
    SELECT EXISTS (
        SELECT 1 FROM public.previously_registered_emails
        WHERE email = NEW.email
    ) INTO v_was_previously_registered;

    -- Insert profile with conditional credits
    INSERT INTO public.user_profiles (id, full_name, current_credit_balance)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        CASE WHEN v_was_previously_registered THEN 0 ELSE 1 END
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

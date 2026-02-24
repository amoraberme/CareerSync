-- Supabase SQL Schema for Career Sync
-- Run this in your Supabase SQL Editor

-- 1. Create candidates_history table
create table candidates_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    job_title text not null,
    company text,
    match_score numeric not null,
    analysis_date timestamptz default now() not null,
    report_data jsonb -- To store the full AI analysis for later retrieval
);

-- 2. Create users profile table (optional, if extending beyond auth metadata)
create table user_profiles (
    id uuid references auth.users primary key,
    full_name text,
    created_at timestamptz default now() not null
);

-- 3. Enable Row Level Security (RLS)
alter table candidates_history enable row level security;
alter table user_profiles enable row level security;

-- 4. Create Policies for candidates_history
create policy "Users can view their own history"
    on candidates_history for select
    using (auth.uid() = user_id);

create policy "Users can insert their own history"
    on candidates_history for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own history"
    on candidates_history for update
    using (auth.uid() = user_id);
    
create policy "Users can delete their own history"
    on candidates_history for delete
    using (auth.uid() = user_id);

-- 5. Create Policies for user_profiles
create policy "Users can view their own profile"
    on user_profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on user_profiles for update
    using (auth.uid() = id);

-- 6. Trigger to automatically create a profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- PHASE 15: CREDIT SYSTEM ARCHITECTURE
-- ==========================================

-- 1. Alter existing user_profiles (acting as 'users' table) to hold credits
alter table user_profiles 
add column current_credit_balance integer default 1 not null;

-- 2. Create the 'plans' table
create table plans (
    id uuid default gen_random_uuid() primary key,
    plan_name text not null,
    price numeric not null,
    credits_granted integer not null,
    created_at timestamptz default now() not null
);

-- 3. Create the 'transactions' table
create table transactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references user_profiles(id) not null,
    plan_id uuid references plans(id) not null,
    reference_number text, -- E.g., for GCash receipt tracking
    status text default 'Pending' not null check (status in ('Pending', 'Paid', 'Failed', 'Cancelled')),
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- 4. Create an automated updated_at timestamp trigger for transactions
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_transactions_modtime
    before update on transactions
    for each row
    execute procedure update_modified_column();

-- 5. THE CORE LOGIC: Automated Credit Fulfillment Trigger
-- This triggers whenever a transaction is updated
create or replace function fulfill_credits_on_payment()
returns trigger as $$
declare
    v_credits_to_grant integer;
begin
    -- Only proceed if the status actually changed from Pending to Paid
    if old.status = 'Pending' and new.status = 'Paid' then
        
        -- Look up exactly how many credits this plan grants
        select credits_granted into v_credits_to_grant 
        from plans 
        where id = new.plan_id;

        -- Add those credits to the user's current balance
        update user_profiles
        set current_credit_balance = current_credit_balance + v_credits_to_grant
        where id = new.user_id;

    end if;

    return new;
end;
$$ language plpgsql security definer;

-- Attach the trigger specifically to UPDATE events on the transactions table
create trigger on_transaction_paid
    after update on transactions
    for each row execute procedure fulfill_credits_on_payment();

-- Enable RLS on new tables
alter table plans enable row level security;
alter table transactions enable row level security;

-- Policies
create policy "Anyone can view plans" on plans for select using (true);

create policy "Users can view their own transactions" 
    on transactions for select using (auth.uid() = user_id);

create policy "Users can insert their own transactions" 
    on transactions for insert with check (auth.uid() = user_id);

-- ==========================================
-- DUMMY DATA FOR TESTING
-- ==========================================
-- Run this block manually after creating the tables to insert your mock plans
/*
insert into plans (plan_name, price, credits_granted) values 
('Basic Plan - 50 PHP Top Up', 50.00, 10),
('Premium Monthly Retainer', 295.00, 3500); -- Example: 100/day for 30 days + 500 bonus
*/

-- ==========================================
-- PHASE 16: CREDIT DEDUCTION SECURITY
-- ==========================================

-- Secure RPC to decrement credits by a specific amount
create or replace function decrement_credits(deduct_amount integer)
returns boolean as $$
declare
    v_current_balance integer;
begin
    -- Get the current balance with row-level lock to prevent race conditions
    select current_credit_balance into v_current_balance
    from user_profiles
    where id = auth.uid()
    for update;

    -- Ensure the user exists and has enough credits
    if v_current_balance is null or v_current_balance < deduct_amount then
        return false;
    end if;

    -- Deduct the credits
    update user_profiles
    set current_credit_balance = current_credit_balance - deduct_amount
    where id = auth.uid();

    return true;
end;
$$ language plpgsql security definer;

-- ==========================================
-- PHASE 30: CREDIT-AWARE ACCOUNT DELETION
-- ==========================================

-- 1. Fix Missing ON DELETE CASCADE on FKs
-- Without these, deleting an auth.users row will FAIL due to FK constraints.

ALTER TABLE candidates_history
  DROP CONSTRAINT IF EXISTS candidates_history_user_id_fkey;
ALTER TABLE candidates_history
  ADD CONSTRAINT candidates_history_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE transactions
  ADD CONSTRAINT transactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- 2. Create previously_registered_emails table
-- Tracks emails of deleted accounts so re-registrations get 0 free credits.
CREATE TABLE IF NOT EXISTS previously_registered_emails (
    email TEXT PRIMARY KEY,
    deleted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE previously_registered_emails ENABLE ROW LEVEL SECURITY;

-- 3. Update handle_new_user() to check for returning users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_was_previously_registered BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.previously_registered_emails
        WHERE email = NEW.email
    ) INTO v_was_previously_registered;

    INSERT INTO public.user_profiles (id, full_name, current_credit_balance)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        CASE WHEN v_was_previously_registered THEN 0 ELSE 1 END
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

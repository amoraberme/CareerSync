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

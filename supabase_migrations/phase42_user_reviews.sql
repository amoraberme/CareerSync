-- ==========================================
-- PHASE 42: USER REVIEWS SYSTEM
-- Run this migration in Supabase SQL Editor
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_reviews_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_update ON public.user_reviews;
CREATE TRIGGER on_review_update
    BEFORE UPDATE ON public.user_reviews
    FOR EACH ROW EXECUTE PROCEDURE update_user_reviews_modtime();

-- Enable RLS
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.user_reviews;
    CREATE POLICY "Users can insert their own reviews"
        ON public.user_reviews FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own reviews" ON public.user_reviews;
    CREATE POLICY "Users can update their own reviews"
        ON public.user_reviews FOR UPDATE
        USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can view their own reviews" ON public.user_reviews;
    CREATE POLICY "Users can view their own reviews"
        ON public.user_reviews FOR SELECT
        USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.user_reviews;
    CREATE POLICY "Anyone can view approved reviews"
        ON public.user_reviews FOR SELECT
        USING (is_approved = true);
END
$$;

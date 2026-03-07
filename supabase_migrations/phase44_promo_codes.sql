-- ==========================================
-- PHASE 44: PROMOTIONAL CODES SYSTEM
-- Run this migration in Supabase SQL Editor
-- ==========================================

CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code_name TEXT UNIQUE NOT NULL,
    discount_amount INTEGER NOT NULL, -- Discount in percentage (e.g., 20 for 20%) or fixed centavos? Let's use percentage, e.g., 20.
    is_percentage BOOLEAN DEFAULT true,
    max_uses INTEGER NOT NULL,
    current_uses INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Protect current_uses from exceeding max_uses via CHECK constraint
ALTER TABLE public.promo_codes 
ADD CONSTRAINT promo_uses_limit CHECK (current_uses <= max_uses);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Public read access so frontend can show live banners
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view active promo codes" ON public.promo_codes;
    CREATE POLICY "Public can view active promo codes" 
        ON public.promo_codes FOR SELECT 
        USING (is_active = true);
END
$$;

-- Enable Realtime for promo_codes to power 'ticking banners'
BEGIN;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.promo_codes;
EXCEPTION WHEN OTHERS THEN
    -- Ignore if already added
END;

-- Atomic RPC for consuming a promo code
CREATE OR REPLACE FUNCTION public.consume_promo_code(p_code_name TEXT)
RETURNS TABLE (
    valid BOOLEAN,
    discount_val INTEGER,
    percentage BOOLEAN
) AS $$
DECLARE
    v_discount INTEGER;
    v_is_percentage BOOLEAN;
BEGIN
    -- Attempt to update exactly one row if valid and under limit
    UPDATE public.promo_codes
    SET current_uses = current_uses + 1
    WHERE code_name = p_code_name
      AND is_active = true
      AND current_uses < max_uses
      AND (expires_at IS NULL OR expires_at > NOW())
    RETURNING discount_amount, is_percentage 
    INTO v_discount, v_is_percentage;

    IF FOUND THEN
        RETURN QUERY SELECT true, v_discount, v_is_percentage;
    ELSE
        RETURN QUERY SELECT false, 0, false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert an initial promo for testing
INSERT INTO public.promo_codes (code_name, discount_amount, is_percentage, max_uses, current_uses, is_active)
VALUES ('LAUNCH20', 20, true, 5, 0, true)
ON CONFLICT (code_name) DO NOTHING;

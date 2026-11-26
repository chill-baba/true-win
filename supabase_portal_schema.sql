-- ==============================================================================
-- Supabase Schema: Portal Users, Device Sessions & Activity Logs
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.portal_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'active',
    can_access_marketing BOOLEAN NOT NULL DEFAULT false,
    active_session_token TEXT,
    active_device_id TEXT,
    active_device_name TEXT,
    bound_device_id TEXT,
    is_online BOOLEAN DEFAULT false,
    last_heartbeat TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    last_ip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.portal_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uid TEXT NOT NULL,
    event_type TEXT NOT NULL,
    device_id TEXT,
    device_name TEXT,
    ip_address TEXT,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_portal_users_uid ON public.portal_users (uid);
CREATE INDEX IF NOT EXISTS idx_portal_activity_logs_created_at ON public.portal_activity_logs (created_at DESC);

-- Disable RLS for easy operation
ALTER TABLE public.portal_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_activity_logs DISABLE ROW LEVEL SECURITY;

-- Seed default admin user if not exists
INSERT INTO public.portal_users (uid, name, password, role, can_access_marketing)
VALUES ('admin', 'System Administrator', 'admin', 'admin', true)
ON CONFLICT (uid) DO NOTHING;

-- Seed demo marketing agent
INSERT INTO public.portal_users (uid, name, password, role, can_access_marketing)
VALUES ('agent01', 'Marketing Agent 1', 'password123', 'user', false)
ON CONFLICT (uid) DO NOTHING;

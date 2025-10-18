-- ============================================
-- PHASE 1: ENABLE RLS ON CRITICAL TABLES
-- Protects subscriber emails, security logs, and rate limit data
-- ============================================

-- 1. Enable RLS on email_subscriptions (protects 18 subscriber emails)
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on security_audit_logs (protects IP addresses and security events)
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Enable RLS on rate_limits (protects rate limit tracking data)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 4. Enable RLS on automation_logs (protects automation event data)
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- EMAIL SUBSCRIPTIONS POLICIES
-- ============================================

-- Allow public to INSERT (newsletter signup must work from frontend)
CREATE POLICY "public_can_subscribe" 
ON public.email_subscriptions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Only service role can SELECT subscriber emails (admin/edge function access only)
CREATE POLICY "service_role_can_read_subscriptions" 
ON public.email_subscriptions 
FOR SELECT 
TO service_role
USING (true);

-- Only service role can UPDATE subscriptions (manage preferences via edge functions)
CREATE POLICY "service_role_can_update_subscriptions" 
ON public.email_subscriptions 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- Only service role can DELETE subscriptions (unsubscribe management)
CREATE POLICY "service_role_can_delete_subscriptions" 
ON public.email_subscriptions 
FOR DELETE 
TO service_role
USING (true);

-- ============================================
-- SECURITY AUDIT LOGS POLICIES
-- ============================================

-- Only service role can INSERT audit logs
CREATE POLICY "service_role_can_insert_audit_logs" 
ON public.security_audit_logs 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Only service role can SELECT audit logs
CREATE POLICY "service_role_can_read_audit_logs" 
ON public.security_audit_logs 
FOR SELECT 
TO service_role
USING (true);

-- ============================================
-- RATE LIMITS POLICIES
-- ============================================

-- Only service role can manage rate limits (all operations)
CREATE POLICY "service_role_can_manage_rate_limits" 
ON public.rate_limits 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- AUTOMATION LOGS POLICIES
-- ============================================

-- Service role can insert automation logs
CREATE POLICY "service_role_can_insert_automation_logs" 
ON public.automation_logs 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Service role can update automation logs
CREATE POLICY "service_role_can_update_automation_logs" 
ON public.automation_logs 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- Service role can delete automation logs
CREATE POLICY "service_role_can_delete_automation_logs" 
ON public.automation_logs 
FOR DELETE 
TO service_role
USING (true);

-- ============================================
-- DATABASE CONSTRAINTS FOR EMAIL VALIDATION
-- ============================================

-- Email format validation (RFC 5322 compliant)
ALTER TABLE public.email_subscriptions 
ADD CONSTRAINT email_format_check 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Email length constraint (RFC 5321: max 254 chars, min 5 chars)
ALTER TABLE public.email_subscriptions 
ADD CONSTRAINT email_length_check 
CHECK (length(email) <= 254 AND length(email) >= 5);

-- Email uniqueness (prevent duplicate subscriptions)
ALTER TABLE public.email_subscriptions 
ADD CONSTRAINT email_unique 
UNIQUE (email);

-- Preferences structure validation (must be valid JSON object or null)
ALTER TABLE public.email_subscriptions 
ADD CONSTRAINT preferences_is_object 
CHECK (jsonb_typeof(preferences) = 'object' OR preferences IS NULL);
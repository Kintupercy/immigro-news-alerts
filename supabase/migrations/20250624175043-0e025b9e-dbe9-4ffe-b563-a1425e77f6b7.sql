
-- Remove RLS policies that depend on the is_admin function
DROP POLICY IF EXISTS "admin_manage_all_news" ON public.immigration_news;
DROP POLICY IF EXISTS "admin_manage_all_articles" ON public.blog_articles;
DROP POLICY IF EXISTS "admin_manage_categories" ON public.immigration_categories;
DROP POLICY IF EXISTS "admin_view_security_logs" ON public.security_audit_logs;
DROP POLICY IF EXISTS "admin_view_rate_limits" ON public.rate_limits;
DROP POLICY IF EXISTS "users_view_own_subscriptions" ON public.email_subscriptions;
DROP POLICY IF EXISTS "admin_manage_all_subscriptions" ON public.email_subscriptions;

-- Now we can safely drop the user role functions
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
DROP FUNCTION IF EXISTS public.user_has_role(uuid, text);
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Since this is a public site, disable RLS on all tables to allow public access
ALTER TABLE public.immigration_news DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.immigration_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs DISABLE ROW LEVEL SECURITY;

-- Fix search_path security issues for existing functions
CREATE OR REPLACE FUNCTION public.cleanup_old_immigration_news()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete articles older than 6 months
    DELETE FROM public.immigration_news 
    WHERE created_at < NOW() - INTERVAL '6 months';
    
    -- Get the count of deleted rows
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup operation
    RAISE NOTICE 'Deleted % old immigration news articles', deleted_count;
    
    RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_orphaned_bookmarks()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete bookmarks that reference non-existent articles
    DELETE FROM public.bookmarks 
    WHERE article_id NOT IN (SELECT id FROM public.immigration_news);
    
    -- Get the count of deleted rows
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup operation
    RAISE NOTICE 'Deleted % orphaned bookmarks', deleted_count;
    
    RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_scheduled_jobs()
RETURNS TABLE(jobname text, schedule text, command text, active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cron.jobname::text,
        cron.schedule::text,
        cron.command::text,
        cron.active::boolean
    FROM cron.job cron
    WHERE cron.jobname IN ('morning-news-fetch', 'afternoon-news-fetch');
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

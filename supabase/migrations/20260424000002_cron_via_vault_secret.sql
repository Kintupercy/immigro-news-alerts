-- Move all pg_cron jobs off hardcoded JWTs onto a Vault-backed secret.
--
-- Before this migration, five cron jobs pasted a `Bearer <JWT>` directly
-- into their SQL. That JWT was the legacy service_role key — the same
-- one leaked into migration 20250612154818 and committed to git. Even
-- with the leaked copy rotated out of git, having multi-year JWTs
-- embedded in cron.job.command is a landmine: pg_cron commands are
-- readable by anyone with SELECT on the cron schema, and every future
-- migration touching a job would have to re-paste the raw key.
--
-- The new pattern: one SECURITY DEFINER helper reads the
-- `service_role_key` secret from Vault at invocation time and builds
-- the Authorization header. Cron jobs call the helper with just the
-- function name and body. Rotating the key becomes an UPDATE on the
-- vault row; no migrations, no cron rewrites.
--
-- Prereq: the vault secret named `service_role_key` must exist before
-- this migration runs. Populate it via the Supabase dashboard
-- (Database → Vault → New Secret) or with:
--   SELECT vault.create_secret('<the key>', 'service_role_key',
--     'Used by pg_cron jobs via public.invoke_edge_function');

-- 1. Helper function. SECURITY DEFINER so callers (pg_cron, runs as
--    postgres) can read vault without needing direct grants on it.
--    search_path locked down per the project's other SECURITY DEFINER
--    functions.
CREATE OR REPLACE FUNCTION public.invoke_edge_function(
  function_name text,
  body jsonb DEFAULT '{}'::jsonb
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  service_key text;
  request_id bigint;
BEGIN
  SELECT decrypted_secret INTO service_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key';

  IF service_key IS NULL OR length(service_key) = 0 THEN
    RAISE EXCEPTION 'service_role_key is not set in vault.secrets';
  END IF;

  SELECT net.http_post(
    url := 'https://xybpgorbkiaitimxiqej.supabase.co/functions/v1/' || function_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := body
  ) INTO request_id;

  RETURN request_id;
END;
$$;

-- Lock the function down: only postgres (which is what cron jobs run as)
-- and service_role should be able to trigger an authenticated
-- cross-service call.
REVOKE EXECUTE ON FUNCTION public.invoke_edge_function(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.invoke_edge_function(text, jsonb) TO postgres, service_role;

COMMENT ON FUNCTION public.invoke_edge_function(text, jsonb) IS
  'Invokes a Supabase edge function with the service_role_key secret from vault. Used by pg_cron jobs so they do not embed the JWT in cron.job.command.';

-- 2. Replace every hardcoded-JWT cron job with a helper call. Unschedule
--    by name (idempotent) then re-schedule with the same name and
--    schedule so no downstream consumer sees a gap.

SELECT cron.unschedule('weekly-newsletter-roundup');
SELECT cron.schedule(
  'weekly-newsletter-roundup',
  '0 14 * * 0',
  $cron$
  SELECT public.invoke_edge_function('send-weekly-newsletter', '{"trigger": "weekly_newsletter"}'::jsonb);
  $cron$
);

SELECT cron.unschedule('morning-news-fetch');
SELECT cron.schedule(
  'morning-news-fetch',
  '0 13 * * *',
  $cron$
  SELECT public.invoke_edge_function('scheduled-news-fetch', '{"scheduled": true, "timeSlot": "morning"}'::jsonb);
  $cron$
);

SELECT cron.unschedule('evening-news-fetch');
SELECT cron.schedule(
  'evening-news-fetch',
  '0 23 * * *',
  $cron$
  SELECT public.invoke_edge_function('scheduled-news-fetch', '{"scheduled": true, "timeSlot": "evening", "priorityOnly": true}'::jsonb);
  $cron$
);

SELECT cron.unschedule('daily-immigration-digest');
SELECT cron.schedule(
  'daily-immigration-digest',
  '0 13 * * *',
  $cron$
  SELECT public.invoke_edge_function('send-daily-digest', '{"scheduled": true}'::jsonb);
  $cron$
);

SELECT cron.unschedule('twice-weekly-digest-scheduler');
SELECT cron.schedule(
  'twice-weekly-digest-scheduler',
  '0 8 * * 2,5',
  $cron$
  SELECT public.invoke_edge_function('send-daily-digest', '{}'::jsonb);
  $cron$
);

-- Tighten system_config RLS: previous policy used `FOR ALL USING (true) WITH CHECK (true)`
-- without a role clause, so it applied to every Postgres role including anon and
-- authenticated. That let any site visitor (the anon key is public) read and modify
-- internal retry state. Restrict to service_role only; edge functions already use
-- the service role client.

DROP POLICY IF EXISTS "Service role full access" ON public.system_config;

CREATE POLICY "service_role_system_config_all"
  ON public.system_config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

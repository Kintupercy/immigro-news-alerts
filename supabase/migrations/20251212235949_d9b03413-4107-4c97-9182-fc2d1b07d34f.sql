-- Create system_config table for storing retry flags and other system settings
CREATE TABLE public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions use service role)
CREATE POLICY "Service role full access" ON public.system_config
  FOR ALL USING (true) WITH CHECK (true);

-- Create index for fast key lookups
CREATE INDEX idx_system_config_key ON public.system_config(key);

-- Insert initial retry flag record
INSERT INTO public.system_config (key, value) 
VALUES ('perplexity_retry_pending', '{"pending": false, "error": null, "last_attempt": null, "retry_count": 0}'::jsonb);
-- Perplexity API Cost Optimization
-- Remove afternoon news fetch to save ~17 calls/day
SELECT cron.unschedule(jobid) 
FROM cron.job 
WHERE jobname = 'afternoon-news-fetch';

-- Remove old evening job and recreate with priority filter
SELECT cron.unschedule(jobid) 
FROM cron.job 
WHERE jobname = 'evening-news-fetch';

-- Recreate evening run to only fetch priority categories (saves ~12 calls)
SELECT cron.schedule(
  'evening-news-fetch',
  '0 18 * * *',
  $$
    SELECT net.http_post(
      url := 'https://xybpgorbkiaitimxiqej.supabase.co/functions/v1/scheduled-news-fetch',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5YnBnb3Jia2lhaXRpbXhpcWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NDkzNTgsImV4cCI6MjA2NDAyNTM1OH0.zLJ37ZRmFDj4hpiohHOZZonAzBiv8ASNDw7TVghF0N0"}'::jsonb,
      body := '{"scheduled": true, "timeSlot": "evening", "priorityOnly": true}'::jsonb
    ) as request_id;
  $$
);
SELECT net.http_post(
  url := 'https://xybpgorbkiaitimxiqej.supabase.co/functions/v1/fetch-breaking-news',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5YnBnb3Jia2lhaXRpbXhpcWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ0OTM1OCwiZXhwIjoyMDY0MDI1MzU4fQ.VC7_jNU2QqBCkc8BcC5VAwjb8cVKDW8ULs9bK_2xGJQ"}'::jsonb,
  body := '{"manual_trigger": true}'::jsonb
) as request_id;
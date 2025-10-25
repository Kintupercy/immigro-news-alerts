-- Fix evening news fetch to run at 6pm Central (11pm UTC during DST)
SELECT cron.alter_job(
  17,
  schedule := '0 23 * * *'
);
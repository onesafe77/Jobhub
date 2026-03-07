-- Enable pg_net extension (required for calling Edge Functions from SQL)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Enable pg_cron extension (required for scheduled jobs)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Schedule a cron job to fetch CPNS news every day at 08:00 AM (UTC+7 = 01:00 UTC)
SELECT cron.schedule(
    'fetch-cpns-news-daily',              -- Job name
    '0 1 * * *',                          -- Cron expression: At 01:00 UTC = 08:00 WIB every day
    $$
    SELECT net.http_post(
        url := 'https://vofsxvyzfhejdogiteyp.supabase.co/functions/v1/fetch-cpns-news',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    ) AS request_id;
    $$
);

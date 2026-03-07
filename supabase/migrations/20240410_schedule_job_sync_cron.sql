-- MENGAKTIFKAN OTOMATISASI SCRAPING HARIAN (DENGAN PG_CRON)
-- Pastikan ekstensi pg_cron dan pg_net sudah diaktifkan di dashboard atau migration sebelumnya.

-- Menjadwalkan job scraping harian setiap jam 1 pagi (WIB = 18:00 UTC)
-- Menggunakan pg_cron untuk memanggil Edge Function 'job-sync-worker' secara otomatis.

SELECT cron.schedule(
    'daily-job-sync-worker',                  -- Nama Job
    '0 18 * * *',                             -- Cron schedule: At 18:00 UTC (01:00 WIB) setiap hari
    $$
    SELECT net.http_post(
        url := 'https://vofsxvyzfhejdogiteyp.supabase.co/functions/v1/job-sync-worker',
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb
    ) AS request_id;
    $$
);

-- Catatan:
-- 1. Pastikan Anda telah menyimpan 'VITE_APIFY_TOKEN' di Supabase Edge Function Secrets.
-- 2. Fungsi ini akan mengambil 20 data terbaru untuk 4 kategori pekerjaan acak setiap hari.
-- 3. Hasil scraping akan otomatis masuk ke tabel 'jobs'.

-- Make the url column unique so that the Edge Function's UPSERT works without duplicates.
-- We handle potential existing duplicates by deleting them first, if there are any.

-- 1. Remove duplicates keeping only the newest one based on timestamp
DELETE FROM public.cpns_bumn_posts
WHERE id NOT IN (
    SELECT id
    FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY url ORDER BY timestamp DESC) as rn
        FROM public.cpns_bumn_posts
    ) t
    WHERE t.rn = 1
);

-- 2. Add the unique constraint
ALTER TABLE public.cpns_bumn_posts
ADD CONSTRAINT cpns_bumn_posts_url_key UNIQUE (url);

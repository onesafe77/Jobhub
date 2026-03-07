-- Run this in your Supabase SQL Editor

-- 1. Create the jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    salary TEXT,
    description TEXT,
    url TEXT UNIQUE NOT NULL, -- Ensure we don't insert duplicate jobs with the same URL
    apply_url TEXT,
    logo_url TEXT,
    source TEXT DEFAULT 'LinkedIn',
    job_type TEXT, -- Full-time, Part-time, Contract, etc.
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Set up Row Level Security (RLS)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read jobs (for the frontend search)
CREATE POLICY "Allow public read access to jobs" 
ON public.jobs 
FOR SELECT 
USING (true);

-- Allow service role (Edge Function) to insert/update jobs
CREATE POLICY "Allow service role to manage jobs" 
ON public.jobs 
USING (true) 
WITH CHECK (true);

-- Note: The service role policy relies on using the Supabase Service Role Key 
-- in the Edge Function, which automatically bypasses RLS.

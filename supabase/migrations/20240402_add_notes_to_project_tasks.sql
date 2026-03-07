-- Add notes column to project_tasks table
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS notes TEXT;

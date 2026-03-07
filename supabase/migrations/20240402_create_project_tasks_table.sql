-- Create the project_tasks table
CREATE TABLE public.project_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    status TEXT NOT NULL,
    task_date DATE,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Policy: Users can view their own tasks
CREATE POLICY "Users can view their own tasks" 
ON public.project_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks" 
ON public.project_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tasks
CREATE POLICY "Users can update their own tasks" 
ON public.project_tasks 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks" 
ON public.project_tasks 
FOR DELETE 
USING (auth.uid() = user_id);

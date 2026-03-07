-- Create favorite_jobs table
create table public.favorite_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  company text not null,
  url text,
  location text,
  salary text,
  type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.favorite_jobs enable row level security;

-- Create policies
create policy "Users can view their own favorite jobs"
  on public.favorite_jobs for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own favorite jobs"
  on public.favorite_jobs for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own favorite jobs"
  on public.favorite_jobs for delete
  using ( auth.uid() = user_id );

-- Create indexes for performance
create index favorite_jobs_user_id_idx on public.favorite_jobs(user_id);

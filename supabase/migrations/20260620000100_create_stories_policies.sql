-- Ensure public.stories table has required columns
alter table public.stories 
add column if not exists image_url text;

alter table public.stories 
add column if not exists expires_at timestamp with time zone;

-- Enable RLS on database stories table
alter table public.stories enable row level security;

-- Drop existing policies if any
drop policy if exists "Allow public select on stories" on public.stories;
drop policy if exists "Allow authenticated insert on stories" on public.stories;

-- Create select policy (allow all users to read stories)
create policy "Allow public select on stories"
  on public.stories for select
  using (true);

-- Create insert policy (allow authenticated users to insert their own stories)
create policy "Allow authenticated insert on stories"
  on public.stories for insert
  with check (auth.uid() = user_id);

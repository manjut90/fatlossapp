insert into storage.buckets (id, name, public)
values 
  ('stories', 'stories', true),
  ('posts', 'posts', true),
  ('reels', 'reels', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Set up RLS policies for storage buckets
-- 1. Stories bucket policies
drop policy if exists "Allow public access to stories" on storage.objects;
create policy "Allow public access to stories"
  on storage.objects for select
  using ( bucket_id = 'stories' );

drop policy if exists "Allow authenticated uploads to stories" on storage.objects;
create policy "Allow authenticated uploads to stories"
  on storage.objects for insert
  with check ( bucket_id = 'stories' and auth.role() = 'authenticated' );

-- 2. Posts bucket policies
drop policy if exists "Allow public access to posts" on storage.objects;
create policy "Allow public access to posts"
  on storage.objects for select
  using ( bucket_id = 'posts' );

drop policy if exists "Allow authenticated uploads to posts" on storage.objects;
create policy "Allow authenticated uploads to posts"
  on storage.objects for insert
  with check ( bucket_id = 'posts' and auth.role() = 'authenticated' );

-- 3. Reels bucket policies
drop policy if exists "Allow public access to reels" on storage.objects;
create policy "Allow public access to reels"
  on storage.objects for select
  using ( bucket_id = 'reels' );

drop policy if exists "Allow authenticated uploads to reels" on storage.objects;
create policy "Allow authenticated uploads to reels"
  on storage.objects for insert
  with check ( bucket_id = 'reels' and auth.role() = 'authenticated' );

-- 4. Avatars bucket policies
drop policy if exists "Allow public access to avatars" on storage.objects;
create policy "Allow public access to avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

drop policy if exists "Allow authenticated uploads to avatars" on storage.objects;
create policy "Allow authenticated uploads to avatars"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

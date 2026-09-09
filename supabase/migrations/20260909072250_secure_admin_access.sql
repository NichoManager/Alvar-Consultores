create table public.admin_users (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "Admins can view their admin record"
on public.admin_users
for select
to authenticated
using (
  user_id = auth.uid()
);

drop policy if exists "Authenticated users can view all properties"
on public.properties;

drop policy if exists "Authenticated users can create properties"
on public.properties;

drop policy if exists "Authenticated users can update properties"
on public.properties;

drop policy if exists "Authenticated users can delete properties"
on public.properties;

create policy "Admins can view all properties"
on public.properties
for select
to authenticated
using (
  public.is_admin()
);

create policy "Admins can create properties"
on public.properties
for insert
to authenticated
with check (
  public.is_admin()
);

create policy "Admins can update properties"
on public.properties
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Admins can delete properties"
on public.properties
for delete
to authenticated
using (
  public.is_admin()
);

drop policy if exists "Authenticated users can view all property images"
on public.property_images;

drop policy if exists "Authenticated users can create property images"
on public.property_images;

drop policy if exists "Authenticated users can update property images"
on public.property_images;

drop policy if exists "Authenticated users can delete property images"
on public.property_images;

create policy "Admins can view all property images"
on public.property_images
for select
to authenticated
using (
  public.is_admin()
);

create policy "Admins can create property images"
on public.property_images
for insert
to authenticated
with check (
  public.is_admin()
);

create policy "Admins can update property images"
on public.property_images
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Admins can delete property images"
on public.property_images
for delete
to authenticated
using (
  public.is_admin()
);

drop policy if exists "Authenticated users can upload property image files"
on storage.objects;

drop policy if exists "Authenticated users can update property image files"
on storage.objects;

drop policy if exists "Authenticated users can delete property image files"
on storage.objects;

create policy "Admins can upload property image files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'property-images'
  and public.is_admin()
);

create policy "Admins can update property image files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'property-images'
  and public.is_admin()
)
with check (
  bucket_id = 'property-images'
  and public.is_admin()
);

create policy "Admins can delete property image files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'property-images'
  and public.is_admin()
);
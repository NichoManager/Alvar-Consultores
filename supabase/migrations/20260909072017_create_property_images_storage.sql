create table public.property_images (
  id uuid primary key default gen_random_uuid(),

  property_id uuid not null
    references public.properties(id)
    on delete cascade,

  storage_path text not null,

  alt_text text,

  position integer not null default 0
    check (position >= 0),

  is_cover boolean not null default false,

  created_at timestamptz not null default now()
);

create index property_images_property_id_idx
  on public.property_images(property_id);

create index property_images_position_idx
  on public.property_images(property_id, position);

create unique index property_images_one_cover_per_property_idx
  on public.property_images(property_id)
  where is_cover = true;

alter table public.property_images enable row level security;

create policy "Public can view images from published properties"
on public.property_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.properties
    where properties.id = property_images.property_id
      and properties.status = 'published'
  )
);

create policy "Authenticated users can view all property images"
on public.property_images
for select
to authenticated
using (true);

create policy "Authenticated users can create property images"
on public.property_images
for insert
to authenticated
with check (true);

create policy "Authenticated users can update property images"
on public.property_images
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete property images"
on public.property_images
for delete
to authenticated
using (true);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'property-images',
  'property-images',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif'
  ]
)
on conflict (id) do nothing;

create policy "Public can view property image files"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'property-images'
);

create policy "Authenticated users can upload property image files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'property-images'
);

create policy "Authenticated users can update property image files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'property-images'
)
with check (
  bucket_id = 'property-images'
);

create policy "Authenticated users can delete property image files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'property-images'
);
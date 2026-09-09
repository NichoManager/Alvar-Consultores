create extension if not exists "pgcrypto";

create table public.properties (
  id uuid primary key default gen_random_uuid(),

  reference text unique,

  title text not null,
  slug text not null unique,

  operation text not null
    check (operation in ('venta', 'alquiler')),

  property_type text not null,

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'published',
        'reserved',
        'sold',
        'rented',
        'archived'
      )
    ),

  price numeric(12, 2) not null
    check (price >= 0),

  currency text not null default 'EUR',

  city text not null,
  area text,
  province text default 'Madrid',
  postal_code text,

  address text,
  show_exact_address boolean not null default false,

  bedrooms integer
    check (bedrooms is null or bedrooms >= 0),

  bathrooms integer
    check (bathrooms is null or bathrooms >= 0),

  built_area numeric(10, 2)
    check (built_area is null or built_area >= 0),

  usable_area numeric(10, 2)
    check (usable_area is null or usable_area >= 0),

  plot_area numeric(10, 2)
    check (plot_area is null or plot_area >= 0),

  floor text,

  elevator boolean not null default false,
  parking boolean not null default false,
  terrace boolean not null default false,
  furnished boolean not null default false,
  exterior boolean not null default false,

  description text,

  features text[] not null default '{}',

  featured boolean not null default false,

  meta_title text,
  meta_description text,

  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_operation_idx
  on public.properties(operation);

create index properties_status_idx
  on public.properties(status);

create index properties_city_idx
  on public.properties(city);

create index properties_featured_idx
  on public.properties(featured);

create index properties_published_at_idx
  on public.properties(published_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger properties_set_updated_at
before update on public.properties
for each row
execute function public.set_updated_at();

alter table public.properties enable row level security;

create policy "Public can view published properties"
on public.properties
for select
to anon, authenticated
using (status = 'published');

create policy "Authenticated users can view all properties"
on public.properties
for select
to authenticated
using (true);

create policy "Authenticated users can create properties"
on public.properties
for insert
to authenticated
with check (true);

create policy "Authenticated users can update properties"
on public.properties
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete properties"
on public.properties
for delete
to authenticated
using (true);
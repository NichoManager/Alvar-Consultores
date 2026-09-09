-- Public property rows are exposed through a constrained read-only RPC.
-- The base table remains available to authenticated admins through the
-- existing is_admin() policies, while anonymous callers cannot query it.

drop policy if exists "Public can view published properties"
on public.properties;

create policy "Public can view published or reserved properties"
on public.properties
for select
to anon
using (
  status in ('published', 'reserved')
);

drop policy if exists "Public can view images from published properties"
on public.property_images;

create policy "Public can view images from published or reserved properties"
on public.property_images
for select
to anon
using (
  exists (
    select 1
    from public.properties
    where properties.id = property_images.property_id
      and properties.status in ('published', 'reserved')
  )
);

create or replace function public.get_public_properties(
  p_slug text default null,
  p_featured boolean default null,
  p_limit integer default null
)
returns table (
  id uuid,
  reference text,
  title text,
  slug text,
  operation text,
  property_type text,
  status text,
  price numeric,
  currency text,
  city text,
  area text,
  province text,
  postal_code text,
  address text,
  show_exact_address boolean,
  bedrooms integer,
  bathrooms integer,
  built_area numeric,
  usable_area numeric,
  plot_area numeric,
  floor text,
  elevator boolean,
  parking boolean,
  terrace boolean,
  furnished boolean,
  exterior boolean,
  description text,
  features text[],
  featured boolean,
  published_at timestamptz,
  created_at timestamptz,
  property_images jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    properties.id,
    properties.reference,
    properties.title,
    properties.slug,
    properties.operation,
    properties.property_type,
    properties.status,
    properties.price,
    properties.currency,
    properties.city,
    properties.area,
    properties.province,
    case
      when properties.show_exact_address then properties.postal_code
      else null
    end as postal_code,
    case
      when properties.show_exact_address then properties.address
      else null
    end as address,
    properties.show_exact_address,
    properties.bedrooms,
    properties.bathrooms,
    properties.built_area,
    properties.usable_area,
    properties.plot_area,
    properties.floor,
    properties.elevator,
    properties.parking,
    properties.terrace,
    properties.furnished,
    properties.exterior,
    properties.description,
    properties.features,
    properties.featured,
    properties.published_at,
    properties.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', property_images.id,
            'storage_path', property_images.storage_path,
            'alt_text', property_images.alt_text,
            'position', property_images.position,
            'is_cover', property_images.is_cover
          )
          order by property_images.position asc
        )
        from public.property_images
        where property_images.property_id = properties.id
      ),
      '[]'::jsonb
    ) as property_images
  from public.properties
  where properties.status in ('published', 'reserved')
    and (p_slug is null or properties.slug = p_slug)
    and (p_featured is null or properties.featured = p_featured)
  order by
    properties.published_at desc nulls last,
    properties.created_at desc
  limit least(greatest(coalesce(p_limit, 1000), 0), 1000);
$$;

comment on function public.get_public_properties(text, boolean, integer) is
  'Read-only public property API. Returns only published/reserved rows and redacts private addresses.';

revoke all on function public.get_public_properties(text, boolean, integer)
from public, anon, authenticated;

grant execute on function public.get_public_properties(text, boolean, integer)
to anon, authenticated;

-- RLS cannot redact individual columns. Anonymous callers must use the RPC,
-- while authenticated admins retain direct table access subject to is_admin().
revoke select on table public.properties from anon;
grant select, insert, update, delete on table public.properties to authenticated;

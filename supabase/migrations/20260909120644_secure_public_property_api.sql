-- Public property rows are exposed through a constrained read-only RPC.
-- Anonymous callers must use the RPC.
-- Admins keep direct table access through existing authenticated + RLS policies.

drop policy if exists "Public can view published properties"
on public.properties;

drop policy if exists "Public can view published or reserved properties"
on public.properties;

drop policy if exists "Public can view images from published properties"
on public.property_images;

drop policy if exists "Public can view images from published or reserved properties"
on public.property_images;

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
    p.id,
    p.reference,
    p.title,
    p.slug,
    p.operation,
    p.property_type,
    p.status,
    p.price,
    p.currency,
    p.city,
    p.area,
    p.province,
    case
      when p.show_exact_address then p.postal_code
      else null
    end as postal_code,
    case
      when p.show_exact_address then p.address
      else null
    end as address,
    p.show_exact_address,
    p.bedrooms,
    p.bathrooms,
    p.built_area,
    p.usable_area,
    p.plot_area,
    p.floor,
    p.elevator,
    p.parking,
    p.terrace,
    p.furnished,
    p.exterior,
    p.description,
    p.features,
    p.featured,
    p.published_at,
    p.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', pi.id,
            'storage_path', pi.storage_path,
            'alt_text', pi.alt_text,
            'position', pi.position,
            'is_cover', pi.is_cover
          )
          order by pi.position asc
        )
        from public.property_images as pi
        where pi.property_id = p.id
      ),
      '[]'::jsonb
    ) as property_images
  from public.properties as p
  where p.status in ('published', 'reserved')
    and (p_slug is null or p.slug = p_slug)
    and (p_featured is null or p.featured = p_featured)
  order by
    p.published_at desc nulls last,
    p.created_at desc
  limit least(greatest(coalesce(p_limit, 1000), 0), 1000);
$$;

comment on function public.get_public_properties(text, boolean, integer) is
  'Read-only public property API. Returns only published/reserved rows and redacts private addresses.';

revoke all on function public.get_public_properties(text, boolean, integer)
from public, anon, authenticated;

grant execute on function public.get_public_properties(text, boolean, integer)
to anon, authenticated;

-- Anonymous users must not read base tables directly.
revoke select on table public.properties from anon;
revoke select on table public.property_images from anon;

-- Keep authenticated access for the CRM.
grant select, insert, update, delete on table public.properties to authenticated;
grant select, insert, update, delete on table public.property_images to authenticated;
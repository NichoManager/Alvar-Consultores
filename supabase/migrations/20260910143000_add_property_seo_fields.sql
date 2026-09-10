-- Add optional SEO metadata to properties.
-- Existing properties remain fully compatible because both fields are nullable.

alter table public.properties
  add column if not exists seo_title text,
  add column if not exists seo_description text;

comment on column public.properties.seo_title is
  'Optional custom SEO title for the public property detail page.';

comment on column public.properties.seo_description is
  'Optional custom SEO description for the public property detail page.';

-- PostgreSQL cannot replace a function when its table return type changes.
-- Recreate the public RPC preserving its privacy rules and permissions.

drop function if exists public.get_public_properties(text, boolean, integer);

create function public.get_public_properties(
  p_slug text default null,
  p_featured boolean default null,
  p_limit integer default null
)
returns table (
  id uuid,
  reference text,
  title text,
  slug text,
  seo_title text,
  seo_description text,
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
  floors_count integer,
  construction_year integer,
  property_condition text,
  orientations text[],
  heating_type text,
  elevator boolean,
  parking boolean,
  parking_type text,
  parking_spaces integer,
  terrace boolean,
  furnished boolean,
  exterior boolean,
  video_url text,
  virtual_tour_url text,
  community_fee_amount numeric,
  community_fee_period text,
  ibi_annual_amount numeric,
  energy_certificate_status text,
  energy_consumption_rating text,
  energy_consumption_value numeric,
  energy_emissions_rating text,
  energy_emissions_value numeric,
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
    p.seo_title,
    p.seo_description,
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
    end,
    case
      when p.show_exact_address then p.address
      else null
    end,
    p.show_exact_address,
    p.bedrooms,
    p.bathrooms,
    p.built_area,
    p.usable_area,
    p.plot_area,
    p.floor,
    p.floors_count,
    p.construction_year,
    p.property_condition,
    p.orientations,
    p.heating_type,
    p.elevator,
    p.parking,
    p.parking_type,
    p.parking_spaces,
    p.terrace,
    p.furnished,
    p.exterior,
    p.video_url,
    p.virtual_tour_url,
    p.community_fee_amount,
    p.community_fee_period,
    p.ibi_annual_amount,
    p.energy_certificate_status,
    p.energy_consumption_rating,
    p.energy_consumption_value,
    p.energy_emissions_rating,
    p.energy_emissions_value,
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
            'is_cover', pi.is_cover,
            'media_type', pi.media_type
          )
          order by
            case
              when pi.media_type = 'photo' then 0
              else 1
            end,
            pi.position asc
        )
        from public.property_images as pi
        where pi.property_id = p.id
      ),
      '[]'::jsonb
    )
  from public.properties as p
  where p.status in ('published', 'reserved')
    and (
      p_slug is null
      or p.slug = p_slug
    )
    and (
      p_featured is null
      or p.featured = p_featured
    )
  order by
    p.published_at desc nulls last,
    p.created_at desc
  limit least(
    greatest(
      coalesce(p_limit, 1000),
      0
    ),
    1000
  );
$$;

comment on function public.get_public_properties(text, boolean, integer) is
  'Read-only public property API. Returns published/reserved rows, optional SEO metadata and media while redacting private addresses.';

revoke all
on function public.get_public_properties(text, boolean, integer)
from public, anon, authenticated;

grant execute
on function public.get_public_properties(text, boolean, integer)
to anon, authenticated;

-- Anonymous users keep no direct access to the base tables.

revoke select
on table public.properties
from anon;

revoke select
on table public.property_images
from anon;
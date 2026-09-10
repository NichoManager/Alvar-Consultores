-- Extend the property model with optional structured data while preserving
-- every existing row and keeping free-form/boolean amenities in features.

alter table public.properties
  add column floors_count integer,
  add column construction_year integer,
  add column property_condition text,
  add column orientations text[] not null default '{}',
  add column heating_type text,
  add column parking_type text,
  add column parking_spaces integer,
  add column energy_consumption_rating text,
  add column energy_emissions_rating text;

alter table public.properties
  add constraint properties_floors_count_check
    check (floors_count is null or floors_count >= 1),
  add constraint properties_construction_year_check
    check (
      construction_year is null
      or construction_year between 1800 and 2200
    ),
  add constraint properties_condition_check
    check (
      property_condition is null
      or property_condition in ('new_build', 'good', 'renovate')
    ),
  add constraint properties_orientations_check
    check (
      orientations <@ array['north', 'south', 'east', 'west']::text[]
    ),
  add constraint properties_heating_type_check
    check (
      heating_type is null
      or heating_type in (
        'individual_gas',
        'central',
        'electric',
        'heat_pump',
        'other'
      )
    ),
  add constraint properties_parking_type_check
    check (
      parking_type is null
      or parking_type in ('included', 'optional')
    ),
  add constraint properties_parking_spaces_check
    check (parking_spaces is null or parking_spaces >= 1),
  add constraint properties_energy_consumption_rating_check
    check (
      energy_consumption_rating is null
      or energy_consumption_rating in ('A', 'B', 'C', 'D', 'E', 'F', 'G')
    ),
  add constraint properties_energy_emissions_rating_check
    check (
      energy_emissions_rating is null
      or energy_emissions_rating in ('A', 'B', 'C', 'D', 'E', 'F', 'G')
    );

comment on column public.properties.floors_count is
  'Optional number of floors in the property, mainly for houses and detached homes.';
comment on column public.properties.construction_year is
  'Optional year in which the property was built.';
comment on column public.properties.property_condition is
  'Property condition: new_build, good or renovate.';
comment on column public.properties.orientations is
  'One or more cardinal orientations: north, south, east and west.';
comment on column public.properties.heating_type is
  'Optional structured heating system.';
comment on column public.properties.parking_type is
  'When parking is available, whether it is included in the price or optional.';
comment on column public.properties.parking_spaces is
  'Optional number of parking spaces.';
comment on column public.properties.energy_consumption_rating is
  'Energy consumption rating from A to G.';
comment on column public.properties.energy_emissions_rating is
  'Energy emissions rating from A to G.';

-- Existing rows automatically remain photographs because of this default.
alter table public.property_images
  add column media_type text not null default 'photo';

alter table public.property_images
  add constraint property_images_media_type_check
    check (media_type in ('photo', 'floorplan')),
  add constraint property_images_floorplan_not_cover_check
    check (media_type = 'photo' or is_cover = false);

create index property_images_property_media_position_idx
  on public.property_images(property_id, media_type, position);

comment on column public.property_images.media_type is
  'Public property media category: photo for gallery images or floorplan for plans.';

-- PostgreSQL cannot replace a function when its table return type changes.
-- Dropping and recreating it inside the migration keeps the public API update
-- transactional and preserves the existing signature and security boundary.
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
  energy_consumption_rating text,
  energy_emissions_rating text,
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
    p.energy_consumption_rating,
    p.energy_emissions_rating,
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
          order by pi.media_type asc, pi.position asc
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
  'Read-only public property API. Returns published/reserved rows and media while redacting private addresses.';

revoke all on function public.get_public_properties(text, boolean, integer)
from public, anon, authenticated;

grant execute on function public.get_public_properties(text, boolean, integer)
to anon, authenticated;

-- Anonymous users still have no direct access to the base tables.
revoke select on table public.properties from anon;
revoke select on table public.property_images from anon;

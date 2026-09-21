-- Expose structured Chalet and Office data through the public property API.
--
-- Keeps all previous public catalogue behaviour:
-- - published / reserved / sold / rented
-- - SEO metadata
-- - featured ordering
-- - property media
-- - public postal code
--
-- Address privacy:
-- - exact: street + number may be returned
-- - street_only: only the street / road name is returned
-- - hidden: street address remains private
--
-- Sensitive/admin-only location data such as cadastral reference,
-- block and door are intentionally not exposed publicly.

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
  address_visibility text,

  chalet_type text,

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

  office_space_type text,
  gross_leasable_area numeric,
  workstation_area numeric,
  building_use text,
  available_from date,
  building_certifications text[],
  building_floors_count integer,
  office_floors_count integer,
  elevators_count integer,

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
  featured_position integer,
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

    -- Postal code remains public for useful location context and maps.
    p.postal_code,

    -- Public street address follows the new three-level privacy model.
    case
      when p.address_visibility = 'exact' then
        nullif(
          trim(
            concat_ws(
              ' ',
              nullif(trim(p.address), ''),
              nullif(trim(p.street_number), '')
            )
          ),
          ''
        )

      when p.address_visibility = 'street_only' then
        nullif(
          trim(p.address),
          ''
        )

      -- Backwards compatibility for properties created before
      -- address_visibility existed.
      when p.address_visibility is null
        and p.show_exact_address then
        p.address

      else null
    end as address,

    p.show_exact_address,

    coalesce(
      p.address_visibility,
      case
        when p.show_exact_address then 'exact'
        else 'hidden'
      end
    ) as address_visibility,

    p.chalet_type,

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

    p.office_space_type,
    p.gross_leasable_area,
    p.workstation_area,
    p.building_use,
    p.available_from,
    p.building_certifications,
    p.building_floors_count,
    p.office_floors_count,
    p.elevators_count,

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
    p.featured_position,
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
    ) as property_images

  from public.properties as p

  where p.status in (
    'published',
    'reserved',
    'sold',
    'rented'
  )

    and (
      p_slug is null
      or p.slug = p_slug
    )

    and (
      p_featured is null
      or p.featured = p_featured
    )

  order by
    case
      when p_featured is true then p.featured_position
      else null
    end asc nulls last,

    p.published_at desc nulls last,
    p.created_at desc,

    case
      when p_featured is true then p.id
      else null
    end asc

  limit least(
    greatest(
      coalesce(p_limit, 1000),
      0
    ),
    1000
  );
$$;

comment on function public.get_public_properties(text, boolean, integer) is
  'Read-only public property API. Returns published, reserved, sold and rented properties with SEO, media, Chalet and Office structured data. Address exposure follows exact, street_only or hidden privacy settings. Sensitive administrative address data remains private.';

revoke all
on function public.get_public_properties(text, boolean, integer)
from public, anon, authenticated;

grant execute
on function public.get_public_properties(text, boolean, integer)
to anon, authenticated;

-- Anonymous visitors still receive property data only through
-- the controlled public RPC.

revoke select
on table public.properties
from anon;

revoke select
on table public.property_images
from anon;

notify pgrst, 'reload schema';
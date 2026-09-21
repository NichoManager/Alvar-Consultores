-- Add optional structured fields for office properties.
--
-- All office-specific fields remain nullable so existing residential,
-- commercial and previously created properties remain fully compatible.
--
-- The current show_exact_address boolean is preserved for backwards
-- compatibility. address_visibility will allow the CRM to evolve towards
-- three public visibility levels: exact address, street only or hidden.

alter table public.properties
  add column if not exists office_space_type text,
  add column if not exists cadastral_reference text,
  add column if not exists address_visibility text,
  add column if not exists street_number text,
  add column if not exists block text,
  add column if not exists door text,
  add column if not exists urbanization_name text,
  add column if not exists gross_leasable_area numeric,
  add column if not exists workstation_area numeric,
  add column if not exists building_use text,
  add column if not exists available_from date,
  add column if not exists building_certifications text[] not null default '{}',
  add column if not exists building_floors_count integer,
  add column if not exists office_floors_count integer,
  add column if not exists elevators_count integer;

-- Preserve the current public-address behaviour for all existing rows.
--
-- Properties that previously exposed their exact address remain exact.
-- Properties that previously hid their exact address remain hidden.
--
-- The new street_only option will be available for future CRM edits.

update public.properties
set address_visibility =
  case
    when show_exact_address then 'exact'
    else 'hidden'
  end
where address_visibility is null;

alter table public.properties
  alter column address_visibility set default 'hidden',
  alter column address_visibility set not null;

alter table public.properties
  add constraint properties_office_space_type_check
    check (
      office_space_type is null
      or office_space_type in (
        'private_office',
        'coworking',
        'workstation'
      )
    ),

  add constraint properties_address_visibility_check
    check (
      address_visibility in (
        'exact',
        'street_only',
        'hidden'
      )
    ),

  add constraint properties_gross_leasable_area_check
    check (
      gross_leasable_area is null
      or gross_leasable_area > 0
    ),

  add constraint properties_workstation_area_check
    check (
      workstation_area is null
      or workstation_area > 0
    ),

  add constraint properties_building_use_check
    check (
      building_use is null
      or building_use in (
        'offices_only',
        'mixed'
      )
    ),

  add constraint properties_building_certifications_check
    check (
      building_certifications
      <@ array[
        'LEED',
        'BREEAM',
        'WELL'
      ]::text[]
    ),

  add constraint properties_building_floors_count_check
    check (
      building_floors_count is null
      or building_floors_count >= 1
    ),

  add constraint properties_office_floors_count_check
    check (
      office_floors_count is null
      or office_floors_count >= 1
    ),

  add constraint properties_elevators_count_check
    check (
      elevators_count is null
      or elevators_count >= 0
    );

comment on column public.properties.office_space_type is
  'Office space type: private_office, coworking or workstation.';

comment on column public.properties.cadastral_reference is
  'Optional cadastral reference of the property.';

comment on column public.properties.address_visibility is
  'Public address visibility: exact, street_only or hidden.';

comment on column public.properties.street_number is
  'Optional street or building number, stored separately to support street-only public visibility.';

comment on column public.properties.block is
  'Optional building block or staircase identifier.';

comment on column public.properties.door is
  'Optional property door or unit identifier.';

comment on column public.properties.urbanization_name is
  'Optional residential or commercial complex name.';

comment on column public.properties.gross_leasable_area is
  'Optional gross leasable area in square metres, mainly for commercial and office properties.';

comment on column public.properties.workstation_area is
  'Optional workstation area in square metres when the office is offered as an individual workstation.';

comment on column public.properties.building_use is
  'Building use for office properties: offices_only or mixed.';

comment on column public.properties.available_from is
  'Optional future availability date. Null means the property can be available immediately.';

comment on column public.properties.building_certifications is
  'Optional building sustainability certifications such as LEED, BREEAM or WELL.';

comment on column public.properties.building_floors_count is
  'Optional total number of floors in the building.';

comment on column public.properties.office_floors_count is
  'Optional number of floors occupied by the office itself.';

comment on column public.properties.elevators_count is
  'Optional number of elevators available in the building.';
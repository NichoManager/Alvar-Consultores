alter table public.properties
  add column if not exists garage_capacity text;

alter table public.properties
  add constraint properties_garage_capacity_check
    check (
      garage_capacity is null
      or garage_capacity in (
        'motorcycle',
        'small_car',
        'large_car',
        'car_and_motorcycle',
        'two_cars_or_more'
      )
    );

comment on column public.properties.garage_capacity is
  'Garage capacity: motorcycle, small_car, large_car, car_and_motorcycle or two_cars_or_more.';
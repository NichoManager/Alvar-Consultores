alter table public.properties
  add column if not exists chalet_type text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'properties_chalet_type_check'
  ) then
    alter table public.properties
      add constraint properties_chalet_type_check
      check (
        chalet_type is null
        or chalet_type in (
          'terraced',
          'semi_detached',
          'independent'
        )
      );
  end if;
end
$$;

comment on column public.properties.chalet_type is
  'Chalet typology: terraced, semi_detached or independent.';

notify pgrst, 'reload schema';
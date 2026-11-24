-- Allocate a distinct public URL for newly created properties, including older CRM clients.
-- Existing property URLs and RLS remain unchanged.
create or replace function public.assign_unique_property_slug()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  base_slug text;
  candidate text;
  suffix integer := 2;
begin
  if new.slug is null or new.slug = '' then
    return new;
  end if;
  -- Serialize URL allocation across property inserts to avoid overlapping suffixes.
  perform pg_catalog.pg_advisory_xact_lock(784219, 1);
  if not exists (select 1 from public.properties p where p.slug = new.slug) then
    return new;
  end if;
  base_slug := new.slug;
  loop
    candidate := pg_catalog.rtrim(pg_catalog.left(base_slug, 119 - pg_catalog.length(suffix::text)), '-') || '-' || suffix::text;
    exit when not exists (select 1 from public.properties p where p.slug = candidate);
    suffix := suffix + 1;
  end loop;
  new.slug := candidate;
  return new;
end;
$$;
revoke execute on function public.assign_unique_property_slug() from public, anon, authenticated;
create trigger properties_assign_unique_slug
before insert on public.properties
for each row execute function public.assign_unique_property_slug();

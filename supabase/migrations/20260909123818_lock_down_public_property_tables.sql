-- Public property data must be consumed through get_public_properties().
-- Anonymous users must not query the base tables directly.

drop policy if exists "Public can view published or reserved properties"
on public.properties;

drop policy if exists "Public can view images from published or reserved properties"
on public.property_images;

revoke select on table public.properties from anon;
revoke select on table public.property_images from anon;
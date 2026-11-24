alter table public.contacts
  add column if not exists import_source text,
  add column if not exists import_sheet text,
  add column if not exists import_key text,
  add column if not exists import_address text,
  add column if not exists import_municipality text,
  add column if not exists import_data jsonb;
create unique index if not exists contacts_import_key_uidx on public.contacts (import_key);

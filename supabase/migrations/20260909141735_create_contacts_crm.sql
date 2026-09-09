-- Private CRM contacts and their many-to-many property relationships.

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  interest text not null
    check (interest in ('buy', 'rent', 'sell', 'invest', 'owner', 'other')),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'visit', 'negotiation', 'closed', 'discarded')),
  source text not null default 'manual'
    check (source in ('manual', 'website', 'property', 'whatsapp', 'phone', 'email', 'other')),
  notes text,
  last_contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_properties (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null
    references public.contacts(id)
    on delete cascade,
  property_id uuid not null
    references public.properties(id)
    on delete cascade,
  created_at timestamptz not null default now(),
  unique (contact_id, property_id)
);

create index contacts_status_idx
  on public.contacts(status);

create index contacts_interest_idx
  on public.contacts(interest);

create index contacts_created_at_idx
  on public.contacts(created_at desc);

create index contacts_email_idx
  on public.contacts(email);

create index contacts_phone_idx
  on public.contacts(phone);

create index contact_properties_contact_id_idx
  on public.contact_properties(contact_id);

create index contact_properties_property_id_idx
  on public.contact_properties(property_id);

create trigger contacts_set_updated_at
before update on public.contacts
for each row
execute function public.set_updated_at();

alter table public.contacts enable row level security;
alter table public.contact_properties enable row level security;

revoke all on table public.contacts from anon;
revoke all on table public.contact_properties from anon;

grant select, insert, update, delete on table public.contacts to authenticated;
grant select, insert, update, delete on table public.contact_properties to authenticated;

create policy "Admins can view contacts"
on public.contacts
for select
to authenticated
using (public.is_admin());

create policy "Admins can create contacts"
on public.contacts
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update contacts"
on public.contacts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete contacts"
on public.contacts
for delete
to authenticated
using (public.is_admin());

create policy "Admins can view contact properties"
on public.contact_properties
for select
to authenticated
using (public.is_admin());

create policy "Admins can create contact properties"
on public.contact_properties
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update contact properties"
on public.contact_properties
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete contact properties"
on public.contact_properties
for delete
to authenticated
using (public.is_admin());

comment on table public.contacts is
  'Private commercial contacts managed manually from the CRM.';

comment on table public.contact_properties is
  'Many-to-many relationships between CRM contacts and properties.';

-- Keep the visitor's original message separate from internal CRM notes and
-- replace the generic legacy website source with explicit commercial origins.

alter table public.contacts
  add column if not exists message text;

-- Leads previously created by public-lead stored their public text in notes.
-- The consent timestamp identifies those web submissions without touching
-- notes belonging to manually created CRM contacts.
update public.contacts
set
  message = coalesce(message, notes),
  notes = null
where privacy_accepted_at is not null
  and source in ('website', 'property')
  and message is null;

alter table public.contacts
  drop constraint if exists contacts_source_check;

update public.contacts
set source = 'contact'
where source = 'website';

alter table public.contacts
  add constraint contacts_source_check
  check (
    source in (
      'contact',
      'valuation',
      'property',
      'service',
      'manual',
      'whatsapp',
      'phone',
      'email',
      'other'
    )
  );

comment on column public.contacts.message is
  'Original message or description submitted by the contact. CRM notes remain internal.';

comment on column public.contacts.notes is
  'Internal CRM notes written by administrators after lead creation.';

comment on column public.contacts.source is
  'Commercial origin: contact, valuation, property, service, manual, whatsapp, phone, email or other.';

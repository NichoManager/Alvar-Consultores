-- Record the minimum consent evidence for contacts created by public forms.
-- Manual CRM contacts intentionally keep this value nullable.

alter table public.contacts
  add column if not exists privacy_accepted_at timestamptz;

comment on column public.contacts.privacy_accepted_at is
  'Timestamp of privacy-policy acceptance recorded by a public lead form. Null for manual contacts without web consent evidence.';

comment on table public.contacts is
  'Private commercial contacts managed through the CRM and controlled public lead ingestion.';

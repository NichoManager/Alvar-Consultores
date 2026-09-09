import { supabase } from './supabase';

export type ContactInterest =
  | 'buy'
  | 'rent'
  | 'sell'
  | 'invest'
  | 'owner'
  | 'other';

export type ContactStatus =
  | 'new'
  | 'contacted'
  | 'visit'
  | 'negotiation'
  | 'closed'
  | 'discarded';

export type ContactSource =
  | 'manual'
  | 'website'
  | 'property'
  | 'whatsapp'
  | 'phone'
  | 'email'
  | 'other';

export type ContactPropertySummary = {
  id: string;
  reference: string | null;
  title: string;
  city: string;
  operation: 'venta' | 'alquiler';
  status: 'draft' | 'published' | 'reserved' | 'sold' | 'rented' | 'archived';
};

export type Contact = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  interest: ContactInterest;
  status: ContactStatus;
  source: ContactSource;
  notes: string | null;
  lastContactAt: string | null;
  privacyAcceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  properties: ContactPropertySummary[];
};

export type ContactInput = {
  name: string;
  phone: string | null;
  email: string | null;
  interest: ContactInterest;
  status: ContactStatus;
  source: ContactSource;
  notes: string | null;
  lastContactAt: string | null;
};

type ContactPropertyLinkRow = {
  property_id: string;
  properties: ContactPropertySummary[] | ContactPropertySummary | null;
};

type ContactRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  interest: ContactInterest;
  status: ContactStatus;
  source: ContactSource;
  notes: string | null;
  last_contact_at: string | null;
  privacy_accepted_at: string | null;
  created_at: string;
  updated_at: string;
  contact_properties: ContactPropertyLinkRow[] | null;
};

const CONTACT_SELECT = `
  id,
  name,
  phone,
  email,
  interest,
  status,
  source,
  notes,
  last_contact_at,
  privacy_accepted_at,
  created_at,
  updated_at,
  contact_properties (
    property_id,
    properties (
      id,
      reference,
      title,
      city,
      operation,
      status
    )
  )
`;

export const contactInterestLabels: Record<ContactInterest, string> = {
  buy: 'Comprar',
  rent: 'Alquilar',
  sell: 'Vender',
  invest: 'Invertir',
  owner: 'Propietario',
  other: 'Otro',
};

export const contactStatusLabels: Record<ContactStatus, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  visit: 'Visita',
  negotiation: 'Negociación',
  closed: 'Cerrado',
  discarded: 'Descartado',
};

export const contactSourceLabels: Record<ContactSource, string> = {
  manual: 'Manual',
  website: 'Web',
  property: 'Inmueble',
  whatsapp: 'WhatsApp',
  phone: 'Teléfono',
  email: 'Email',
  other: 'Otro',
};

function mapContact(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    interest: row.interest,
    status: row.status,
    source: row.source,
    notes: row.notes,
    lastContactAt: row.last_contact_at,
    privacyAcceptedAt: row.privacy_accepted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    properties: (row.contact_properties ?? [])
      .map((link) =>
        Array.isArray(link.properties)
          ? link.properties[0]
          : link.properties,
      )
      .filter(
        (property): property is ContactPropertySummary => Boolean(property),
      ),
  };
}

function toDatabaseInput(input: ContactInput) {
  return {
    name: input.name,
    phone: input.phone,
    email: input.email,
    interest: input.interest,
    status: input.status,
    source: input.source,
    notes: input.notes,
    last_contact_at: input.lastContactAt,
  };
}

export async function getContacts() {
  const { data, error } = await supabase
    .from('contacts')
    .select(CONTACT_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as ContactRow[]).map(mapContact);
}

export async function getContactById(id: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select(CONTACT_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  return data ? mapContact(data as ContactRow) : null;
}

export async function getContactPropertyOptions() {
  const { data, error } = await supabase
    .from('properties')
    .select('id, reference, title, city, operation, status')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []) as ContactPropertySummary[];
}

export async function createContact(input: ContactInput) {
  const { data, error } = await supabase
    .from('contacts')
    .insert(toDatabaseInput(input))
    .select('id')
    .single();

  if (error) throw error;

  return data.id as string;
}

export async function updateContact(id: string, input: ContactInput) {
  const { error } = await supabase
    .from('contacts')
    .update(toDatabaseInput(input))
    .eq('id', id);

  if (error) throw error;
}

export async function deleteContact(id: string) {
  const { error } = await supabase.from('contacts').delete().eq('id', id);

  if (error) throw error;
}

export async function linkContactProperty(
  contactId: string,
  propertyId: string,
) {
  const { error } = await supabase.from('contact_properties').insert({
    contact_id: contactId,
    property_id: propertyId,
  });

  if (error) throw error;
}

export async function linkContactProperties(
  contactId: string,
  propertyIds: string[],
) {
  if (propertyIds.length === 0) return;

  const { error } = await supabase.from('contact_properties').insert(
    propertyIds.map((propertyId) => ({
      contact_id: contactId,
      property_id: propertyId,
    })),
  );

  if (error) throw error;
}

export async function unlinkContactProperty(
  contactId: string,
  propertyId: string,
) {
  const { error } = await supabase
    .from('contact_properties')
    .delete()
    .eq('contact_id', contactId)
    .eq('property_id', propertyId);

  if (error) throw error;
}

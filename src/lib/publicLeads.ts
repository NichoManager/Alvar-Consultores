import type { ContactInterest } from './contacts';
import { supabase } from './supabase';

export type PublicLeadSource = 'website' | 'property';

export type PublicLeadInput = {
  name: string;
  phone?: string;
  email?: string;
  interest: ContactInterest;
  source: PublicLeadSource;
  notes?: string;
  propertyId?: string;
  privacyAccepted: boolean;
  website?: string;
};

type PublicLeadResponse = {
  success?: boolean;
};

export async function submitPublicLead(input: PublicLeadInput) {
  const { data, error } = await supabase.functions.invoke<PublicLeadResponse>(
    'public-lead',
    { body: input },
  );

  if (error || data?.success !== true) {
    if (import.meta.env.DEV) {
      console.error('Error submitting public lead:', error);
    }

    throw new Error('PUBLIC_LEAD_SUBMISSION_FAILED');
  }
}

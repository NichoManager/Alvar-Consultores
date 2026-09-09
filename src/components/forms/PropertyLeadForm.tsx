import { useState, type FormEvent } from 'react';
import { submitPublicLead } from '../../lib/publicLeads';
import type { PropertyOperation } from '../../types/content';
import { trackEvent } from '../../utils/analytics';
import { Button } from '../ui/Button';
import { FormField } from './FormField';
import { validateForm, type FormErrors } from './formValidation';
import { HoneypotField } from './HoneypotField';
import { PrivacyField } from './PrivacyField';
import { SuccessMessage } from './SuccessMessage';

type PropertyLeadFormProps = {
  propertyId: string;
  propertyTitle: string;
  operation: PropertyOperation;
};

function getValue(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function PropertyLeadForm({
  propertyId,
  propertyTitle,
  operation,
}: PropertyLeadFormProps) {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateForm(event);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await submitPublicLead({
        name: getValue(data, 'leadName'),
        phone: getValue(data, 'leadPhone'),
        email: getValue(data, 'leadEmail'),
        interest: operation === 'Alquilar' ? 'rent' : 'buy',
        source: 'property',
        propertyId,
        privacyAccepted: data.get('propertyPrivacy') === 'on',
        website: getValue(data, 'website'),
      });

      trackEvent('property_lead_submit', { property: propertyTitle });
      form.reset();
      setSent(true);
    } catch {
      setSubmitError(
        'No hemos podido enviar tu consulta. Inténtalo de nuevo o contacta con nosotros por teléfono.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <SuccessMessage
        title="Consulta recibida"
        text="Gracias. Hemos recibido tu consulta sobre este inmueble."
        onReset={() => setSent(false)}
      />
    );
  }

  return (
<form className="premium-form property-lead-form" onSubmit={submit} noValidate>
  <input type="hidden" name="property" value={propertyTitle} />
  <HoneypotField />

  <FormField
    label="Nombre"
    name="leadName"
    autoComplete="name"
    maxLength={160}
    required
    error={errors.leadName}
  />

  <FormField
    label="Teléfono"
    name="leadPhone"
    type="tel"
    autoComplete="tel"
    maxLength={50}
    required
    error={errors.leadPhone}
  />

  <FormField
    label="Email"
    name="leadEmail"
    type="email"
    autoComplete="email"
    maxLength={254}
    error={errors.leadEmail}
  />

  <PrivacyField
    name="propertyPrivacy"
    error={errors.propertyPrivacy}
  />

  {submitError ? (
    <p className="form-submit-message form-submit-message--error" role="alert">
      {submitError}
    </p>
  ) : null}

  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Enviando...' : 'Solicitar información'}
  </Button>

  <p className="form-note">
    Teléfono y WhatsApp están disponibles para una respuesta directa.
  </p>
</form>
  );
}

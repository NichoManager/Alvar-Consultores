import { useState, type FormEvent } from 'react';
import { trackEvent } from '../../utils/analytics';
import { Button } from '../ui/Button';
import { FormField } from './FormField';
import { validateForm, type FormErrors } from './formValidation';
import { PrivacyField } from './PrivacyField';
import { SuccessMessage } from './SuccessMessage';

export function PropertyLeadForm({ propertyTitle }: { propertyTitle: string }) {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(event);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    trackEvent('property_lead_submit', { property: propertyTitle });
    setSent(true);
  };
  if (sent) return <SuccessMessage title="Consulta preparada" text="Tus datos están completos. El envío online se activará al conectar el canal seguro; mientras tanto, puedes contactar por teléfono o WhatsApp." onReset={() => setSent(false)} />;
  return (
<form className="premium-form property-lead-form" onSubmit={submit} noValidate>
  <input type="hidden" name="property" value={propertyTitle} />

  <FormField
    label="Nombre"
    name="leadName"
    autoComplete="name"
    required
    error={errors.leadName}
  />

  <FormField
    label="Teléfono"
    name="leadPhone"
    type="tel"
    autoComplete="tel"
    required
    error={errors.leadPhone}
  />

  <FormField
    label="Email"
    name="leadEmail"
    type="email"
    autoComplete="email"
    error={errors.leadEmail}
  />

  <PrivacyField
    name="propertyPrivacy"
    error={errors.propertyPrivacy}
  />

  <Button type="submit">
    Solicitar información
  </Button>

  <p className="form-note">
    Canal online en preparación. Teléfono y WhatsApp están disponibles para una respuesta directa.
  </p>
</form>
  );
}

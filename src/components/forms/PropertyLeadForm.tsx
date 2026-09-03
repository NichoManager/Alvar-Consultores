import { useState, type FormEvent } from 'react';
import { trackEvent } from '../../utils/analytics';
import { Button } from '../ui/Button';
import { FormField } from './FormField';
import { PrivacyField } from './PrivacyField';
import { SuccessMessage } from './SuccessMessage';

export function PropertyLeadForm({ propertyTitle }: { propertyTitle: string }) {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackEvent('property_lead_submit', { property: propertyTitle });
    setSent(true);
  };
  if (sent) return <SuccessMessage title="Interés registrado" text="La solicitud se ha registrado localmente. La conexión con el equipo se activará al configurar el backend." onReset={() => setSent(false)} />;
  return (
    <form className="premium-form property-lead-form" onSubmit={submit}>
      <h2>¿Te interesa esta propiedad?</h2>
      <p>Cuéntanos cómo contactar contigo.</p>
      <input type="hidden" name="property" value={propertyTitle} />
      <FormField label="Nombre" name="leadName" autoComplete="name" required />
      <FormField label="Teléfono" name="leadPhone" type="tel" autoComplete="tel" required />
      <FormField label="Email" name="leadEmail" type="email" autoComplete="email" />
      <PrivacyField name="propertyPrivacy" />
      <Button type="submit">Solicitar información</Button>
      <p className="form-note">Modo demostración, sin envío externo.</p>
    </form>
  );
}

import { useState, type FormEvent } from 'react';
import { trackEvent } from '../../utils/analytics';
import { Button } from '../ui/Button';
import { FormField } from './FormField';
import { PrivacyField } from './PrivacyField';
import { SuccessMessage } from './SuccessMessage';

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackEvent('contact_form_submit');
    setSent(true);
  };
  if (sent) return <SuccessMessage title="Consulta preparada" text="Gracias. Hemos registrado tu consulta localmente. La conexión de envío se activará cuando exista un backend confirmado." onReset={() => setSent(false)} />;
  return (
    <form className="premium-form form-grid" onSubmit={submit}>
      <FormField label="Nombre" name="name" autoComplete="name" required />
      <FormField label="Email" name="email" type="email" autoComplete="email" required />
      <FormField label="Teléfono" name="phone" type="tel" autoComplete="tel" required />
      <FormField as="select" label="Tipo de consulta" name="topic" required options={['Quiero comprar', 'Quiero vender', 'Quiero alquilar', 'Quiero invertir', 'Necesito asesoramiento', 'Otro']} />
      <FormField as="textarea" label="Mensaje" name="message" required />
      <PrivacyField name="contactPrivacy" />
      <Button type="submit">Enviar consulta</Button>
      <p className="form-note">Modo demostración: el envío a CRM está pendiente de configuración.</p>
    </form>
  );
}

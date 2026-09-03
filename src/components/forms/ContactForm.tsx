import { useState, type FormEvent } from 'react';
import { trackEvent } from '../../utils/analytics';
import { Button } from '../ui/Button';
import { FormField } from './FormField';
import { validateForm, type FormErrors } from './formValidation';
import { PrivacyField } from './PrivacyField';
import { SuccessMessage } from './SuccessMessage';

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(event);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    trackEvent('contact_form_submit');
    setSent(true);
  };
  if (sent) return <SuccessMessage title="Consulta preparada" text="Tus datos están completos. El envío online se activará al conectar el canal seguro; mientras tanto, puedes contactar por teléfono o WhatsApp." onReset={() => setSent(false)} />;
  return (
    <form className="premium-form form-grid" onSubmit={submit} noValidate>
      <FormField label="Nombre" name="name" autoComplete="name" required error={errors.name} />
      <FormField label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
      <FormField label="Teléfono" name="phone" type="tel" autoComplete="tel" required error={errors.phone} />
      <FormField as="select" label="Tipo de consulta" name="topic" required error={errors.topic} options={['Quiero comprar', 'Quiero vender', 'Quiero alquilar', 'Quiero invertir', 'Necesito asesoramiento', 'Otro']} />
      <FormField as="textarea" label="Mensaje" name="message" required error={errors.message} />
      <PrivacyField name="contactPrivacy" error={errors.contactPrivacy} />
      <Button type="submit">Enviar consulta</Button>
      <p className="form-note">Canal online en preparación. También puedes hablar directamente con nosotros por teléfono o WhatsApp.</p>
    </form>
  );
}

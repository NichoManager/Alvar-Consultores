import { useState, type FormEvent } from 'react';
import {
  submitPublicLead,
  type PublicLeadInput,
} from '../../lib/publicLeads';
import { trackEvent } from '../../utils/analytics';
import { Button } from '../ui/Button';
import { FormField } from './FormField';
import { validateForm, type FormErrors } from './formValidation';
import { HoneypotField } from './HoneypotField';
import { PrivacyField } from './PrivacyField';
import { SuccessMessage } from './SuccessMessage';

const interestByTopic: Record<string, PublicLeadInput['interest']> = {
  'Quiero comprar': 'buy',
  'Quiero vender': 'sell',
  'Quiero alquilar': 'rent',
  'Quiero invertir': 'invest',
  'Necesito asesoramiento': 'other',
  Otro: 'other',
};

function getValue(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function ContactForm() {
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
    const topic = getValue(data, 'topic');
    const message = getValue(data, 'message');

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await submitPublicLead({
        name: getValue(data, 'name'),
        email: getValue(data, 'email'),
        phone: getValue(data, 'phone'),
        interest: interestByTopic[topic] ?? 'other',
        source: 'contact',
        message,
        privacyAccepted: data.get('contactPrivacy') === 'on',
        website: getValue(data, 'website'),
      });

      trackEvent('contact_form_submit');
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
        text="Gracias. Hemos recibido tu consulta y nos pondremos en contacto contigo lo antes posible."
        onReset={() => setSent(false)}
      />
    );
  }

  return (
    <form className="premium-form form-grid" onSubmit={submit} noValidate>
      <HoneypotField />
      <FormField label="Nombre" name="name" autoComplete="name" maxLength={160} required error={errors.name} />
      <FormField label="Email" name="email" type="email" autoComplete="email" maxLength={254} required error={errors.email} />
      <FormField label="Teléfono" name="phone" type="tel" autoComplete="tel" maxLength={50} required error={errors.phone} />
      <FormField as="select" label="Tipo de consulta" name="topic" required error={errors.topic} options={['Quiero comprar', 'Quiero vender', 'Quiero alquilar', 'Quiero invertir', 'Necesito asesoramiento', 'Otro']} />
      <FormField as="textarea" label="Mensaje" name="message" maxLength={3500} required error={errors.message} />
      <PrivacyField name="contactPrivacy" error={errors.contactPrivacy} />
      {submitError ? (
        <p className="form-submit-message form-submit-message--error" role="alert">
          {submitError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar consulta'}
      </Button>
      <p className="form-note">También puedes hablar directamente con nosotros por teléfono o WhatsApp.</p>
    </form>
  );
}

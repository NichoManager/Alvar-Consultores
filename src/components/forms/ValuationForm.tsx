import { useState, type FormEvent } from 'react';
import { submitPublicLead } from '../../lib/publicLeads';
import { trackEvent } from '../../utils/analytics';
import { Button } from '../ui/Button';
import { FormField } from './FormField';
import { validateForm, type FormErrors } from './formValidation';
import { HoneypotField } from './HoneypotField';
import { PrivacyField } from './PrivacyField';
import { SuccessMessage } from './SuccessMessage';

function getValue(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function ValuationForm() {
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
    const details = [
      ['Tipo de inmueble', getValue(data, 'propertyType')],
      ['Ubicación aproximada', getValue(data, 'location')],
      ['Objetivo', getValue(data, 'goal')],
      ['Comentarios', getValue(data, 'message')],
    ]
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n');

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await submitPublicLead({
        name: getValue(data, 'name'),
        phone: getValue(data, 'phone'),
        email: getValue(data, 'email'),
        interest: 'sell',
        source: 'valuation',
        message: details,
        privacyAccepted: data.get('valuationPrivacy') === 'on',
        website: getValue(data, 'website'),
      });

      trackEvent('valuation_form_submit');
      form.reset();
      setSent(true);
    } catch {
      setSubmitError(
        'No hemos podido enviar tu solicitud. Inténtalo de nuevo o contacta con nosotros por teléfono.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <SuccessMessage
        title="Solicitud recibida"
        text="Gracias. Hemos recibido tu solicitud de valoración y nos pondremos en contacto contigo."
        onReset={() => setSent(false)}
      />
    );
  }

  return (
    <form className="premium-form form-grid" onSubmit={submit} noValidate>
      <HoneypotField />
      <FormField label="Nombre" name="name" autoComplete="name" maxLength={160} required error={errors.name} />
      <FormField label="Teléfono" name="phone" type="tel" autoComplete="tel" maxLength={50} required error={errors.phone} />
      <FormField label="Email" name="email" type="email" autoComplete="email" maxLength={254} error={errors.email} />
      <FormField as="select" label="Tipo de inmueble" name="propertyType" options={['Piso', 'Casa', 'Local', 'Oficina', 'Terreno', 'Otro']} />
      <FormField label="Ubicación o dirección aproximada" name="location" maxLength={300} required error={errors.location} wrapperClassName="wide-field" />
      <FormField as="select" label="Objetivo" name="goal" required error={errors.goal} options={['Quiero vender', 'Quiero alquilar', 'Quiero conocer su valor']} />
      <FormField as="textarea" label="Cuéntanos algo más (opcional)" name="message" maxLength={3500} />
      <PrivacyField name="valuationPrivacy" error={errors.valuationPrivacy} />
      {submitError ? (
        <p className="form-submit-message form-submit-message--error" role="alert">
          {submitError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Solicitar valoración'}
      </Button>
      <p className="form-note">También puedes solicitar tu valoración por teléfono o WhatsApp.</p>
    </form>
  );
}

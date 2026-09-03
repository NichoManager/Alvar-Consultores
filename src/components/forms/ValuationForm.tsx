import { useState, type FormEvent } from 'react';
import { trackEvent } from '../../utils/analytics';
import { Button } from '../ui/Button';
import { FormField } from './FormField';
import { validateForm, type FormErrors } from './formValidation';
import { PrivacyField } from './PrivacyField';
import { SuccessMessage } from './SuccessMessage';

export function ValuationForm() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(event);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    trackEvent('valuation_form_submit');
    setSent(true);
  };
  if (sent) return <SuccessMessage title="Valoración preparada" text="Tus datos están completos. El envío online se activará al conectar el canal seguro; mientras tanto, puedes solicitarla por teléfono o WhatsApp." onReset={() => setSent(false)} />;
  return (
    <form className="premium-form form-grid" onSubmit={submit} noValidate>
      <FormField label="Nombre" name="name" autoComplete="name" required error={errors.name} />
      <FormField label="Teléfono" name="phone" type="tel" autoComplete="tel" required error={errors.phone} />
      <FormField label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
      <FormField as="select" label="Tipo de inmueble" name="propertyType" options={['Piso', 'Casa', 'Local', 'Oficina', 'Terreno', 'Otro']} />
      <FormField label="Ubicación o dirección aproximada" name="location" required error={errors.location} wrapperClassName="wide-field" />
      <FormField as="select" label="Objetivo" name="goal" required error={errors.goal} options={['Quiero vender', 'Quiero alquilar', 'Quiero conocer su valor']} />
      <FormField as="textarea" label="Cuéntanos algo más (opcional)" name="message" />
      <PrivacyField name="valuationPrivacy" error={errors.valuationPrivacy} />
      <Button type="submit">Solicitar valoración</Button>
      <p className="form-note">Canal online en preparación. También puedes solicitar tu valoración por teléfono o WhatsApp.</p>
    </form>
  );
}

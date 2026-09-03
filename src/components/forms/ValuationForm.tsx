import { useState, type FormEvent } from 'react';
import { trackEvent } from '../../utils/analytics';
import { Button } from '../ui/Button';
import { FormField } from './FormField';
import { PrivacyField } from './PrivacyField';
import { SuccessMessage } from './SuccessMessage';

export function ValuationForm() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackEvent('valuation_form_submit');
    setSent(true);
  };
  if (sent) return <SuccessMessage title="Solicitud recibida" text="Gracias. Hemos recibido los datos de tu inmueble. Nuestro equipo se pondrá en contacto contigo para conocer mejor la propiedad." onReset={() => setSent(false)} />;
  return (
    <form className="premium-form form-grid" onSubmit={submit}>
      <FormField label="Nombre" name="name" autoComplete="name" required />
      <FormField label="Teléfono" name="phone" type="tel" autoComplete="tel" required />
      <FormField label="Email" name="email" type="email" autoComplete="email" />
      <FormField as="select" label="Tipo de inmueble" name="propertyType" options={['Piso', 'Casa', 'Local', 'Oficina', 'Terreno', 'Otro']} />
      <FormField label="Ubicación o dirección aproximada" name="location" required className="wide-field" />
      <FormField as="select" label="Objetivo" name="goal" required options={['Quiero vender', 'Quiero alquilar', 'Quiero conocer su valor']} />
      <FormField as="textarea" label="Cuéntanos algo más (opcional)" name="message" />
      <PrivacyField name="valuationPrivacy" />
      <Button type="submit">Solicitar valoración</Button>
      <p className="form-note">Este formulario funciona en modo demostración y no envía datos a un servidor.</p>
    </form>
  );
}

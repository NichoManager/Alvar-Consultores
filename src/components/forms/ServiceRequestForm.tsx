import { useState, type FormEvent } from 'react';
import { trackEvent } from '../../utils/analytics';
import { Button } from '../ui/Button';
import { FormField } from './FormField';
import { validateForm, type FormErrors } from './formValidation';
import { PrivacyField } from './PrivacyField';
import { SuccessMessage } from './SuccessMessage';

export type ServiceType = 'valuation' | 'vpo' | 'inheritance';

type ServiceRequestFormProps = {
  serviceType: ServiceType;
};

const formConfig = {
  valuation: {
    submitLabel: 'Solicitar valoración',
    successTitle: 'Solicitud de valoración preparada',
    intro: 'Facilítanos los datos disponibles. Podremos completar contigo cualquier detalle antes de valorar el inmueble.',
  },
  vpo: {
    submitLabel: 'Enviar consulta sobre VPO',
    successTitle: 'Consulta sobre VPO preparada',
    intro: 'Cuéntanos la situación de la vivienda para identificar la documentación y los siguientes pasos.',
  },
  inheritance: {
    submitLabel: 'Enviar consulta de herencia',
    successTitle: 'Consulta de herencia preparada',
    intro: 'Indica en qué punto se encuentra la herencia para poder orientar la parte inmobiliaria con más contexto.',
  },
} satisfies Record<ServiceType, { submitLabel: string; successTitle: string; intro: string }>;

function ContactFields({ errors }: { errors: FormErrors }) {
  return (
    <>
      <FormField
        label="Nombre y apellidos"
        name="name"
        autoComplete="name"
        required
        error={errors.name}
      />
      <FormField
        label="Teléfono"
        name="phone"
        type="tel"
        autoComplete="tel"
        required
        error={errors.phone}
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={errors.email}
      />
    </>
  );
}

function PropertyAddressFields() {
  return (
    <fieldset className="service-request-form__address">
      <legend>Dirección del inmueble</legend>
      <div className="service-request-form__address-grid">
        <FormField label="Nombre de la vía" name="street" autoComplete="address-line1" />
        <FormField label="Número" name="streetNumber" autoComplete="address-line2" />
        <FormField label="Ciudad" name="city" autoComplete="address-level2" />
        <FormField label="Provincia" name="province" autoComplete="address-level1" />
        <FormField label="Código postal" name="postalCode" autoComplete="postal-code" inputMode="numeric" />
        <FormField label="País" name="country" autoComplete="country-name" />
      </div>
    </fieldset>
  );
}

export function ServiceRequestForm({ serviceType }: ServiceRequestFormProps) {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const config = formConfig[serviceType];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(event);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    trackEvent(serviceType === 'valuation' ? 'valuation_form_submit' : 'contact_form_submit', {
      serviceType,
    });
    setSent(true);
  };

  if (sent) {
    return (
      <SuccessMessage
        title={config.successTitle}
        text="Tus datos están completos. El envío online se activará al conectar el canal seguro; mientras tanto, puedes contactar por teléfono o WhatsApp."
        onReset={() => setSent(false)}
      />
    );
  }

  return (
    <form className="service-request-form form-grid" onSubmit={submit} noValidate>
      <input type="hidden" name="serviceType" value={serviceType} />
      <p className="service-request-form__intro">{config.intro}</p>

      <ContactFields errors={errors} />

      {(serviceType === 'valuation' || serviceType === 'vpo') && <PropertyAddressFields />}

      {serviceType === 'valuation' && (
        <>
          <FormField
            as="select"
            label="Motivo de la valoración"
            name="valuationReason"
            options={['Venta', 'Herencia', 'Financiación', 'Compra', 'Solo orientación']}
          />
          <FormField
            as="select"
            label="¿Cuándo quieres gestionarlo?"
            name="timeframe"
            options={['Lo antes posible', 'En las próximas semanas', 'Solo información']}
          />
        </>
      )}

      {serviceType === 'vpo' && (
        <>
          <FormField
            as="select"
            label="¿Qué necesitas?"
            name="vpoNeed"
            required
            error={errors.vpoNeed}
            options={['Vender mi VPO', 'Comprar mi VPO', 'Información general']}
          />
          <FormField
            as="select"
            label="¿Cuál es tu principal duda sobre la VPO?"
            name="vpoQuestion"
            required
            error={errors.vpoQuestion}
            options={[
              'No sé si puedo vender mi vivienda',
              'Cómo descalificar mi vivienda',
              'Precio de venta',
              'Requisitos legales',
            ]}
          />
          <FormField
            as="select"
            label="¿Cuándo quieres gestionarlo?"
            name="timeframe"
            required
            error={errors.timeframe}
            options={['Lo antes posible', 'En unos meses', 'Solo quiero información']}
          />
        </>
      )}

      {serviceType === 'inheritance' && (
        <>
          <FormField
            as="select"
            label="¿Existe testamento?"
            name="hasWill"
            required
            error={errors.hasWill}
            options={['Sí', 'No', 'No lo sé']}
          />
          <FormField
            as="select"
            label="Estado de la herencia"
            name="inheritanceStatus"
            required
            error={errors.inheritanceStatus}
            options={['Sin iniciar', 'En trámite', 'Herencia aceptada', 'Hay varios herederos', 'No lo sé']}
          />
          <FormField
            as="select"
            label="¿Cuándo quieres gestionar la herencia?"
            name="timeframe"
            required
            error={errors.timeframe}
            options={['Lo antes posible', 'En los próximos meses', 'Solo información']}
          />
          <FormField
            label="Dirección aproximada del inmueble"
            name="approximateAddress"
            autoComplete="street-address"
            wrapperClassName="wide-field"
          />
        </>
      )}

      <FormField as="textarea" label="Comentarios" name="comments" />
      <PrivacyField name={`${serviceType}Privacy`} error={errors[`${serviceType}Privacy`]} />
      <Button type="submit">{config.submitLabel}</Button>
      <p className="form-note">
        Canal online en preparación. También puedes hablar directamente con nosotros por teléfono o WhatsApp.
      </p>
    </form>
  );
}

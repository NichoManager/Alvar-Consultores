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

export type ServiceType = 'valuation' | 'vpo' | 'inheritance';

type ServiceRequestFormProps = {
  serviceType: ServiceType;
};

const formConfig = {
  valuation: {
    submitLabel: 'Solicitar valoración',
    successTitle: 'Solicitud de valoración recibida',
    intro: 'Facilítanos los datos disponibles. Podremos completar contigo cualquier detalle antes de valorar el inmueble.',
  },
  vpo: {
    submitLabel: 'Enviar consulta sobre VPO',
    successTitle: 'Consulta sobre VPO recibida',
    intro: 'Cuéntanos la situación de la vivienda para identificar la documentación y los siguientes pasos.',
  },
  inheritance: {
    submitLabel: 'Enviar consulta de herencia',
    successTitle: 'Consulta de herencia recibida',
    intro: 'Indica en qué punto se encuentra la herencia para poder orientar la parte inmobiliaria con más contexto.',
  },
} satisfies Record<ServiceType, { submitLabel: string; successTitle: string; intro: string }>;

const serviceLabels: Record<ServiceType, string> = {
  valuation: 'Valoración',
  vpo: 'Consulta sobre VPO',
  inheritance: 'Herencia',
};

const detailLabels: Record<string, string> = {
  street: 'Vía',
  streetNumber: 'Número',
  city: 'Ciudad',
  province: 'Provincia',
  postalCode: 'Código postal',
  country: 'País',
  valuationReason: 'Motivo de la valoración',
  timeframe: 'Plazo',
  vpoNeed: 'Necesidad sobre VPO',
  vpoQuestion: 'Duda principal sobre VPO',
  hasWill: 'Existe testamento',
  inheritanceStatus: 'Estado de la herencia',
  approximateAddress: 'Dirección aproximada',
  comments: 'Comentarios',
};

function getValue(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function getInterest(
  serviceType: ServiceType,
  data: FormData,
): PublicLeadInput['interest'] {
  if (serviceType === 'valuation') return 'sell';
  if (serviceType === 'inheritance') return 'owner';

  const vpoNeed = getValue(data, 'vpoNeed');
  if (vpoNeed === 'Vender mi VPO') return 'sell';
  if (vpoNeed === 'Comprar mi VPO') return 'buy';
  return 'other';
}

function getMessage(serviceType: ServiceType, data: FormData) {
  const details = Object.entries(detailLabels)
    .map(([name, label]) => [label, getValue(data, name)] as const)
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);

  return [`Servicio: ${serviceLabels[serviceType]}`, ...details].join('\n');
}

function ContactFields({ errors }: { errors: FormErrors }) {
  return (
    <>
      <FormField
        label="Nombre y apellidos"
        name="name"
        autoComplete="name"
        maxLength={160}
        required
        error={errors.name}
        wrapperClassName="service-request-form__field"
      />
      <FormField
        label="Teléfono"
        name="phone"
        type="tel"
        autoComplete="tel"
        maxLength={50}
        required
        error={errors.phone}
        wrapperClassName="service-request-form__field"
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        maxLength={254}
        required
        error={errors.email}
        wrapperClassName="service-request-form__field"
      />
    </>
  );
}

function PropertyAddressFields() {
  return (
    <fieldset className="service-request-form__address">
      <legend>Dirección del inmueble</legend>
      <div className="service-request-form__address-grid">
        <FormField label="Nombre de la vía" name="street" autoComplete="address-line1" maxLength={240} wrapperClassName="service-request-form__field" />
        <FormField label="Número" name="streetNumber" autoComplete="address-line2" maxLength={30} wrapperClassName="service-request-form__field" />
        <FormField label="Ciudad" name="city" autoComplete="address-level2" maxLength={120} wrapperClassName="service-request-form__field" />
        <FormField label="Provincia" name="province" autoComplete="address-level1" maxLength={120} wrapperClassName="service-request-form__field" />
        <FormField label="Código postal" name="postalCode" autoComplete="postal-code" inputMode="numeric" maxLength={20} wrapperClassName="service-request-form__field" />
        <FormField label="País" name="country" autoComplete="country-name" maxLength={100} wrapperClassName="service-request-form__field" />
      </div>
    </fieldset>
  );
}

export function ServiceRequestForm({ serviceType }: ServiceRequestFormProps) {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const config = formConfig[serviceType];
  const privacyFieldName = `${serviceType}Privacy`;

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
        name: getValue(data, 'name'),
        phone: getValue(data, 'phone'),
        email: getValue(data, 'email'),
        interest: getInterest(serviceType, data),
        source: 'service',
        message: getMessage(serviceType, data),
        privacyAccepted: data.get(privacyFieldName) === 'on',
        website: getValue(data, 'website'),
      });

      trackEvent(
        serviceType === 'valuation'
          ? 'valuation_form_submit'
          : 'contact_form_submit',
        { serviceType },
      );
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
      <div className="service-request-form__success">
        <SuccessMessage
          title={config.successTitle}
          text="Gracias. Hemos recibido tu consulta y nos pondremos en contacto contigo lo antes posible."
          onReset={() => setSent(false)}
        />
      </div>
    );
  }

  return (
    <form className="service-request-form" onSubmit={submit} noValidate>
      <input type="hidden" name="serviceType" value={serviceType} />
      <HoneypotField />
      <p className="service-request-form__intro">{config.intro}</p>

      <div className="service-request-form__grid form-grid">
        <ContactFields errors={errors} />

        {(serviceType === 'valuation' || serviceType === 'vpo') && <PropertyAddressFields />}

        {serviceType === 'valuation' && (
          <>
            <FormField
              as="select"
              label="Motivo de la valoración"
              name="valuationReason"
              options={['Venta', 'Herencia', 'Financiación', 'Compra', 'Solo orientación']}
              wrapperClassName="service-request-form__field"
            />
            <FormField
              as="select"
              label="¿Cuándo quieres gestionarlo?"
              name="timeframe"
              options={['Lo antes posible', 'En las próximas semanas', 'Solo información']}
              wrapperClassName="service-request-form__field"
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
              wrapperClassName="service-request-form__field"
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
              wrapperClassName="service-request-form__field"
            />
            <FormField
              as="select"
              label="¿Cuándo quieres gestionarlo?"
              name="timeframe"
              required
              error={errors.timeframe}
              options={['Lo antes posible', 'En unos meses', 'Solo quiero información']}
              wrapperClassName="service-request-form__field"
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
              wrapperClassName="service-request-form__field"
            />
            <FormField
              as="select"
              label="Estado de la herencia"
              name="inheritanceStatus"
              required
              error={errors.inheritanceStatus}
              options={['Sin iniciar', 'En trámite', 'Herencia aceptada', 'Hay varios herederos', 'No lo sé']}
              wrapperClassName="service-request-form__field"
            />
            <FormField
              as="select"
              label="¿Cuándo quieres gestionar la herencia?"
              name="timeframe"
              required
              error={errors.timeframe}
              options={['Lo antes posible', 'En los próximos meses', 'Solo información']}
              wrapperClassName="service-request-form__field"
            />
            <FormField
              label="Dirección aproximada del inmueble"
              name="approximateAddress"
              autoComplete="street-address"
              maxLength={300}
              wrapperClassName="wide-field service-request-form__field"
            />
          </>
        )}

        <FormField as="textarea" label="Comentarios" name="comments" maxLength={2000} wrapperClassName="service-request-form__field" />
        <PrivacyField name={privacyFieldName} error={errors[privacyFieldName]} />
      </div>

      {submitError ? (
        <p className="form-submit-message form-submit-message--error" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="service-request-form__actions">
        <p className="form-note">
          También puedes hablar directamente con nosotros por teléfono o WhatsApp.
        </p>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : config.submitLabel}
        </Button>
      </div>
    </form>
  );
}

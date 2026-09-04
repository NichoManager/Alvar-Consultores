import { useCallback, useState } from 'react';
import { ServiceRequestForm, type ServiceType } from '../forms/ServiceRequestForm';
import { Container } from '../ui/Container';
import { Modal } from '../ui/Modal';
import { Reveal } from '../ui/Reveal';

const additionalServices: Array<{
  type: ServiceType;
  number: string;
  title: string;
  text: string;
  cta: string;
  modalTitle: string;
}> = [
  {
    type: 'valuation',
    number: '01',
    title: 'Valoraciones',
    text: 'Valoramos tu vivienda con criterios actualizados de mercado para ayudarte a tomar decisiones de venta, herencia, financiación o planificación patrimonial.',
    cta: 'Solicitar valoración',
    modalTitle: 'Solicita tu valoración',
  },
  {
    type: 'vpo',
    number: '02',
    title: 'Viviendas de VPO',
    text: 'Te orientamos en operaciones con vivienda protegida, documentación necesaria, dudas habituales y próximos pasos antes de comprar o vender.',
    cta: 'Consultar VPO',
    modalTitle: 'Consulta tus dudas sobre la VPO',
  },
  {
    type: 'inheritance',
    number: '03',
    title: 'Herencias',
    text: 'Te acompañamos en la gestión inmobiliaria vinculada a herencias, resolviendo dudas sobre situación del inmueble, documentación y alternativas.',
    cta: 'Tramitar herencia',
    modalTitle: 'Resuelve las dudas de tu herencia',
  },
];

export function AdditionalServices() {
  const [activeService, setActiveService] = useState<ServiceType | null>(null);
  const closeModal = useCallback(() => setActiveService(null), []);
  const activeConfig = additionalServices.find((service) => service.type === activeService);

  return (
    <>
      <section className="additional-services section-pad" aria-labelledby="additional-services-title">
        <Container>
          <Reveal className="additional-services__intro">
            <div>
              <p className="eyebrow">SERVICIOS ESPECIALES</p>
              <h2 id="additional-services-title">
                Otros servicios disponibles para operaciones <em>con más contexto.</em>
              </h2>
            </div>
            <p>
              Valoraciones, viviendas de protección oficial y herencias requieren una lectura precisa de la
              documentación, la situación del inmueble y los pasos necesarios.
            </p>
          </Reveal>

          <div className="additional-services__grid">
            {additionalServices.map((service) => (
              <Reveal className="additional-service-card" key={service.type}>
                <span className="additional-service-card__number" aria-hidden="true">{service.number}</span>
                <div className="additional-service-card__content">
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
                <button
                  className="additional-service-card__cta"
                  type="button"
                  onClick={() => setActiveService(service.type)}
                  aria-haspopup="dialog"
                >
                  <span>{service.cta}</span>
                  <span aria-hidden="true">↗</span>
                </button>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <Modal
        open={Boolean(activeConfig)}
        title={activeConfig?.modalTitle ?? ''}
        eyebrow="SERVICIOS ESPECIALES"
        onClose={closeModal}
      >
        {activeConfig && <ServiceRequestForm serviceType={activeConfig.type} />}
      </Modal>
    </>
  );
}

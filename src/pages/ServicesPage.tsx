import { SeoHead } from '../components/seo/SeoHead';
import { CTASection } from '../components/ui/CTASection';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';

const services = [
  {
    number: '01',
    title: 'Compra',
    text: 'Definimos contigo las necesidades reales, filtramos oportunidades y revisamos cada decisión antes de avanzar.',
    items: ['Selección y análisis', 'Negociación', 'Coordinación bancaria', 'Documentación y notaría'],
    cta: 'Consultar una compra',
    to: '/contacto',
  },
  {
    number: '02',
    title: 'Venta',
    text: 'Construimos una estrategia de comercialización coherente con el inmueble y el momento del mercado.',
    items: ['Valoración profesional', 'Estrategia y reportaje', 'Gestión de visitas', 'Negociación y firma'],
    cta: 'Planificar la venta',
    to: '/vender',
  },
  {
    number: '03',
    title: 'Alquiler',
    text: 'Acompañamos el proceso desde la valoración hasta la formalización del contrato.',
    items: ['Posicionamiento', 'Búsqueda de inquilinos', 'Evaluación de solvencia', 'Contrato y formalización'],
    cta: 'Consultar un alquiler',
    to: '/contacto',
  },
  {
    number: '04',
    title: 'Consultoría',
    text: 'Analizamos situaciones que necesitan criterio inmobiliario, documental o de inversión.',
    items: ['Inversiones y herencias', 'Documentación registral', 'Valoración de activos', 'Análisis de rentabilidad'],
    cta: 'Consultar una operación',
    to: '/contacto',
  },
] as const;

export function ServicesPage() {
  return (
    <>
      <SeoHead
        title="Servicios inmobiliarios en Madrid | Alvar Consultores"
        description="Asesoramiento para comprar, vender, alquilar e invertir en Madrid capital y alrededores."
        path="/servicios"
      />

      <InternalHero
        eyebrow="SERVICIOS INMOBILIARIOS"
        title={
          <>
            Compra, venta y alquiler
            <br />
            <em>con una estrategia clara.</em>
          </>
        }
        text="Acompañamos cada operación con valoración, análisis, negociación y coordinación documental."
        image="/images/alvar/heroes/hero-servicios-inmobiliarios.webp"
        aside={<span className="internal-hero__quote">“De la primera valoración a la firma.”</span>}
      />

      <section className="services-page section-pad" aria-labelledby="services-page-title">
        <Container>
          <header className="services-page__intro">
            <div>
              <p className="eyebrow">ÁREAS DE ASESORAMIENTO</p>
              <h2 id="services-page-title">Un servicio claro para cada momento de la operación.</h2>
            </div>
            <p>
              Compra, venta, alquiler y consultoría abordados con el mismo método: análisis, coordinación y
              acompañamiento hasta que cada decisión queda resuelta.
            </p>
          </header>

          <div className="services-page__list">
            {services.map(({ number, title, text, items, cta, to }) => {
              const headingId = `service-${number}-title`;

              return (
                <article key={number} className="service-chapter" aria-labelledby={headingId}>
                  <span className="service-chapter__number" aria-hidden="true">
                    {number}
                  </span>

                  <div className="service-chapter__content">
                    <p className="service-chapter__kicker">Servicio inmobiliario</p>
                    <h3 id={headingId}>{title}</h3>
                    <p>{text}</p>
                    <Button to={to} variant="text">
                      {cta}
                    </Button>
                  </div>

                  <ul className="service-chapter__features">
                    {items.map((item, index) => (
                      <li key={item}>
                        <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <CTASection />
    </>
  );
}

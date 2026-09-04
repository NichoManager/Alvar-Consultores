import { SeoHead } from '../components/seo/SeoHead';
import { CTASection } from '../components/ui/CTASection';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { business } from '../data/business';

const services = [
  {
    number: '01',
    title: 'Compra',
    text: 'Definimos contigo las necesidades reales, filtramos oportunidades y revisamos cada decisión antes de avanzar.',
    items: ['Selección y análisis', 'Negociación', 'Coordinación bancaria', 'Documentación y notaría'],
    cta: 'Ver inmuebles en venta',
    to: '/inmuebles?operation=venta',
    note: 'Para compradores que quieren decidir con datos, no por impulso.',
  },
  {
    number: '02',
    title: 'Venta',
    text: 'Construimos una estrategia de comercialización coherente con el inmueble, su zona y el momento real del mercado.',
    items: ['Valoración profesional', 'Estrategia de precio', 'Gestión de visitas', 'Negociación y firma'],
    cta: 'Planificar la venta',
    to: '/vender',
    note: 'Para propietarios que quieren vender bien, no solo publicar un anuncio.',
  },
  {
    number: '03',
    title: 'Alquiler',
    text: 'Acompañamos el proceso desde la valoración hasta la selección del inquilino y la formalización del contrato.',
    items: ['Posicionamiento', 'Búsqueda de inquilinos', 'Evaluación de solvencia', 'Contrato y formalización'],
    cta: 'Consultar un alquiler',
    to: '/inmuebles?operation=alquiler',
    note: 'Para alquilar con seguridad, documentación clara y seguimiento profesional.',
  },
  {
    number: '04',
    title: 'Consultoría',
    text: 'Analizamos situaciones que necesitan criterio inmobiliario, documental, patrimonial o de inversión.',
    items: ['Inversiones y herencias', 'Documentación registral', 'Valoración de activos', 'Análisis de oportunidad'],
    cta: 'Consultar una operación',
    to: '/contacto',
    note: 'Para operaciones con más contexto, dudas legales o decisiones patrimoniales.',
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
        aside={
          <span className="internal-hero__quote">
            “De la primera valoración a la firma.”
          </span>
        }
      />

      <section className="services-page section-pad" aria-labelledby="services-page-title">
        <Container>
          <header className="services-page__intro">
            <div>
              <p className="eyebrow">Áreas de asesoramiento</p>
              <h2 id="services-page-title">
                Un servicio claro para cada momento de la operación.
              </h2>
            </div>

            <p>
              Compra, venta, alquiler y consultoría abordados con el mismo método:
              análisis, coordinación y acompañamiento hasta que cada decisión queda
              resuelta.
            </p>
          </header>

          <div className="services-page__promise" aria-label="Enfoque de trabajo">
            <div>
              <span>01</span>
              <strong>Análisis previo</strong>
              <p>Entendemos el inmueble, la zona, la situación y el objetivo real.</p>
            </div>

            <div>
              <span>02</span>
              <strong>Estrategia clara</strong>
              <p>Definimos precio, tiempos, posicionamiento y próximos pasos.</p>
            </div>

            <div>
              <span>03</span>
              <strong>Acompañamiento</strong>
              <p>Coordinamos visitas, negociación, documentación y firma.</p>
            </div>
          </div>

          <div className="services-page__list">
            {services.map(({ number, title, text, items, cta, to, note }) => {
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

                    <div className="service-chapter__actions">
                      <Button to={to} variant="text">
                        {cta}
                      </Button>
                    </div>
                  </div>

                  <div className="service-chapter__side">
                    <ul className="service-chapter__features">
                      {items.map((item, index) => (
                        <li key={item}>
                          <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    <p className="service-chapter__note">{note}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="services-page__closing" aria-label="Contacto para servicios inmobiliarios">
            <div>
              <p className="eyebrow">¿No sabes por dónde empezar?</p>
              <h2>Cuéntanos tu caso y ordenamos contigo la operación.</h2>
              <p>
                Compra, venta, alquiler, herencia, valoración o inversión. Revisamos
                tu situación y te indicamos el camino más razonable para avanzar.
              </p>
            </div>

            <div className="services-page__closing-actions">
              <a href={`tel:${business.phoneMobileHref}`} className="services-page__phone">
                {business.phoneMobile}
              </a>

              <Button to="/contacto" variant="light">
                Contactar con Alvar
              </Button>
            </div>
          </aside>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { business } from '../data/business';

const services = [
  {
    number: '01',
    title: 'Compra',
    text: 'Te ayudamos a comprar con una búsqueda filtrada, análisis de mercado y revisión de cada decisión antes de avanzar.',
    items: ['Búsqueda y selección', 'Análisis de zona', 'Negociación', 'Documentación y firma'],
    cta: 'Ver inmuebles en venta',
    to: '/inmuebles?operation=venta',
    note: 'Para compradores que quieren decidir con calma, datos y acompañamiento.',
  },
  {
    number: '02',
    title: 'Venta',
    text: 'Definimos una estrategia de venta adaptada al inmueble, al momento del mercado y al perfil comprador adecuado.',
    items: ['Valoración profesional', 'Estrategia de precio', 'Gestión de visitas', 'Negociación y cierre'],
    cta: 'Planificar la venta',
    to: '/vender',
    note: 'Para propietarios que quieren vender bien, no solo publicar un anuncio.',
  },
  {
    number: '03',
    title: 'Alquiler',
    text: 'Acompañamos la operación desde la valoración hasta la selección del inquilino y la formalización del contrato.',
    items: ['Precio de alquiler', 'Selección de inquilino', 'Solvencia', 'Contrato'],
    cta: 'Consultar alquileres',
    to: '/inmuebles?operation=alquiler',
    note: 'Para alquilar con seguridad, documentación clara y seguimiento profesional.',
  },
  {
    number: '04',
    title: 'Consultoría',
    text: 'Analizamos operaciones que requieren criterio inmobiliario, documental, patrimonial o de inversión.',
    items: ['Herencias', 'VPO', 'Valoraciones', 'Inversión'],
    cta: 'Consultar una operación',
    to: '/contacto',
    note: 'Para situaciones con más contexto, dudas legales o decisiones patrimoniales.',
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
              escuchar, analizar, definir una estrategia y acompañar cada decisión
              hasta que la operación queda resuelta.
            </p>
          </header>

          <div className="services-page__method" aria-label="Método de trabajo">
            <div>
              <span>01</span>
              <strong>Escuchamos</strong>
              <p>Entendemos tu situación, el inmueble, la zona y el objetivo real.</p>
            </div>

            <div>
              <span>02</span>
              <strong>Analizamos</strong>
              <p>Revisamos mercado, precio, demanda, documentación y oportunidades.</p>
            </div>

            <div>
              <span>03</span>
              <strong>Acompañamos</strong>
              <p>Coordinamos visitas, negociación, contrato, notaría y firma.</p>
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

                    <Button to={to} variant="text">
                      {cta}
                    </Button>
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

          <aside className="services-page__final-cta" aria-label="Contacto para servicios inmobiliarios">
            <div>
              <p className="eyebrow">Hablemos de tu operación</p>
              <h2>
                Cuéntanos qué necesitas resolver
                <br />
                <em>y ordenamos los próximos pasos.</em>
              </h2>
              <p>
                Compra, venta, alquiler, valoración, herencia o inversión. Revisamos
                tu situación y te indicamos el camino más razonable para avanzar.
              </p>
            </div>

            <div className="services-page__final-actions">
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
    </>
  );
}
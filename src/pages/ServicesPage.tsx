import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { business } from '../data/business';

const services = [
  {
    number: '01',
    title: 'Compra',
    text: 'Te ayudamos a comprar una vivienda con búsqueda filtrada, análisis de mercado y revisión de cada decisión antes de avanzar.',
    items: [
      'Búsqueda y selección',
      'Análisis de zona',
      'Negociación',
      'Documentación y firma',
    ],
    cta: 'Ver inmuebles en venta',
    to: '/inmuebles?operation=venta',
    note: 'Para compradores que quieren decidir con calma, información y acompañamiento profesional.',
  },
  {
    number: '02',
    title: 'Venta',
    text: 'Definimos una estrategia de venta adaptada al inmueble, su ubicación, el momento del mercado y el perfil comprador adecuado.',
    items: [
      'Valoración profesional',
      'Estrategia de precio',
      'Gestión de visitas',
      'Negociación y cierre',
    ],
    cta: 'Planificar la venta',
    to: '/vender',
    note: 'Para propietarios que quieren conocer el valor de su inmueble y preparar la venta antes de publicarlo.',
  },
  {
    number: '03',
    title: 'Alquiler',
    text: 'Acompañamos la operación desde el análisis del precio de alquiler hasta la selección del inquilino y la formalización del contrato.',
    items: [
      'Precio de alquiler',
      'Selección de inquilino',
      'Solvencia',
      'Contrato',
    ],
    cta: 'Consultar alquileres',
    to: '/inmuebles?operation=alquiler',
    note: 'Para propietarios e inquilinos que buscan una operación clara, documentada y bien coordinada.',
  },
  {
    number: '04',
    title: 'Consultoría',
    text: 'Analizamos operaciones que requieren una lectura inmobiliaria, documental, patrimonial o de inversión antes de tomar una decisión.',
    items: [
      'Herencias',
      'VPO',
      'Valoraciones',
      'Inversión',
    ],
    cta: 'Consultar una operación',
    to: '/contacto',
    note: 'Para situaciones patrimoniales, documentales o de inversión que necesitan un análisis más específico.',
  },
] as const;

export function ServicesPage() {
  return (
    <>
      <SeoHead
        title="Servicios inmobiliarios en Madrid | Alvar Consultores"
        description="Servicios inmobiliarios en Madrid para comprar, vender, alquilar, valorar o invertir. Asesoramiento personal y estudio de operaciones en otras ubicaciones."
        path="/servicios"
        imageAlt="Servicios inmobiliarios en Madrid de Alvar Consultores Inmobiliarios"
      />

      <InternalHero
        eyebrow="SERVICIOS INMOBILIARIOS"
        title={
          <>
            Servicios inmobiliarios en Madrid
            <br />
            <em>con una estrategia clara.</em>
          </>
        }
        text="Compra, venta, alquiler, valoración y consultoría inmobiliaria con análisis, negociación y acompañamiento durante cada fase de la operación."
        image="/images/alvar/heroes/hero-servicios-inmobiliarios.webp"
        aside={
          <span className="internal-hero__quote">
            “De la primera valoración a la firma.”
          </span>
        }
      />

      <section
        className="services-page section-pad"
        aria-labelledby="services-page-title"
      >
        <Container>
          <header className="services-page__intro">
            <div>
              <p className="eyebrow">
                ÁREAS DE ASESORAMIENTO
              </p>

              <h2 id="services-page-title">
                Un servicio claro para cada momento de la operación.
              </h2>
            </div>

            <p>
              Trabajamos principalmente en Madrid y la Comunidad de Madrid,
              combinando conocimiento de mercado con un método basado en
              escuchar, analizar, definir una estrategia y acompañar cada
              decisión. También estudiamos operaciones en otras ubicaciones
              cuando podemos aportar el mismo nivel de servicio.
            </p>
          </header>

          <div
            className="services-page__method"
            aria-label="Método de trabajo"
          >
            <div>
              <span>01</span>

              <strong>
                Escuchamos
              </strong>

              <p>
                Entendemos tu situación, el inmueble, la ubicación y el
                objetivo real de la operación.
              </p>
            </div>

            <div>
              <span>02</span>

              <strong>
                Analizamos
              </strong>

              <p>
                Revisamos mercado, precio, demanda, documentación y
                alternativas antes de plantear los siguientes pasos.
              </p>
            </div>

            <div>
              <span>03</span>

              <strong>
                Acompañamos
              </strong>

              <p>
                Coordinamos visitas, negociación, documentación, contrato
                y firma según las necesidades de cada operación.
              </p>
            </div>
          </div>

          <div className="services-page__list">
            {services.map(
              ({
                number,
                title,
                text,
                items,
                cta,
                to,
                note,
              }) => {
                const headingId =
                  `service-${number}-title`;

                return (
                  <article
                    key={number}
                    className="service-chapter"
                    aria-labelledby={headingId}
                  >
                    <span
                      className="service-chapter__number"
                      aria-hidden="true"
                    >
                      {number}
                    </span>

                    <div className="service-chapter__content">
                      <p className="service-chapter__kicker">
                        Servicio inmobiliario
                      </p>

                      <h3 id={headingId}>
                        {title}
                      </h3>

                      <p>
                        {text}
                      </p>

                      <Button
                        to={to}
                        variant="text"
                      >
                        {cta}
                      </Button>
                    </div>

                    <div className="service-chapter__side">
                      <ul className="service-chapter__features">
                        {items.map(
                          (item, index) => (
                            <li key={item}>
                              <span aria-hidden="true">
                                {String(
                                  index + 1,
                                ).padStart(
                                  2,
                                  '0',
                                )}
                              </span>

                              {item}
                            </li>
                          ),
                        )}
                      </ul>

                      <p className="service-chapter__note">
                        {note}
                      </p>
                    </div>
                  </article>
                );
              },
            )}
          </div>

          <aside
            className="services-page__final-cta"
            aria-label="Contacto para servicios inmobiliarios"
          >
            <div>
              <p className="eyebrow">
                HABLEMOS DE TU OPERACIÓN
              </p>

              <h2>
                Cuéntanos qué necesitas resolver
                <br />

                <em>
                  y ordenamos los próximos pasos.
                </em>
              </h2>

              <p>
                Compra, venta, alquiler, valoración, herencia o inversión.
                Cuéntanos dónde está el inmueble y qué necesitas resolver.
                Revisaremos tu situación para indicarte cómo podemos
                ayudarte.
              </p>
            </div>

            <div className="services-page__final-actions">
              <a
                href={`tel:${business.phoneMobileHref}`}
                className="services-page__phone"
                aria-label={`Llamar a Alvar Consultores en el ${business.phoneMobile}`}
              >
                {business.phoneMobile}
              </a>

              <Button
                to="/contacto"
                variant="light"
              >
                Contactar con Alvar
              </Button>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
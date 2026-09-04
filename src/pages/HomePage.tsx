import { ContactForm } from '../components/forms/ContactForm';
import { ValuationForm } from '../components/forms/ValuationForm';
import { AdditionalServices } from '../components/home/AdditionalServices';
import { Hero } from '../components/home/Hero';
import { QuickSearch } from '../components/home/QuickSearch';
import { ReviewCard } from '../components/home/ReviewCard';
import { TrustBar } from '../components/home/TrustBar';
import { PropertyGrid } from '../components/properties/PropertyGrid';
import { JsonLd } from '../components/seo/JsonLd';
import { SeoHead } from '../components/seo/SeoHead';
import { ArchitecturalVisual } from '../components/ui/ArchitecturalVisual';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { CTASection } from '../components/ui/CTASection';
import { LocationBlock } from '../components/ui/LocationBlock';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ServiceBlock } from '../components/ui/ServiceBlock';
import { business } from '../data/business';
import { properties } from '../data/properties';
import { reviews } from '../data/reviews';

const services = [
  ['01', 'Comprar', 'Búsqueda, análisis de mercado, negociación y acompañamiento hasta la firma.'],
  ['02', 'Vender', 'Valoración profesional, estrategia de comercialización, gestión de visitas y negociación.'],
  ['03', 'Alquilar', 'Selección de inquilinos, formalización del contrato y asesoramiento durante la operación.'],
  ['04', 'Consultoría', 'Trámites, inversión inmobiliaria, herencias, documentación y análisis de oportunidades.'],
];

const featuredProperties = properties.filter((property) => property.featured);

export function HomePage() {
  return (
    <>
      <SeoHead
        title="Alvar Consultores Inmobiliarios | Inmobiliaria en Madrid"
        description="Compra, vende o alquila tu inmueble con Alvar Consultores Inmobiliarios. Más de 18 años de experiencia en Madrid, Pinto, Móstoles y alrededores."
      />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': ['RealEstateAgent', 'LocalBusiness'],
          name: business.name,
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Calle Ríos Rosas 42, Planta 1',
            postalCode: '28003',
            addressLocality: 'Madrid',
            addressCountry: 'ES',
          },
          telephone: business.phoneOfficeHref,
          areaServed: business.areas,
        }}
      />

      <Hero />
      <TrustBar />
      <QuickSearch />

      <section id="inmuebles-destacados" className="featured-properties section-pad">
        <Container>
          <Reveal className="featured-properties__intro">
            <div className="featured-properties__heading">
              <p className="eyebrow">Propiedades seleccionadas</p>
              <h2>
                Inmuebles que merecen
                <br />
                <em>una mirada pausada.</em>
              </h2>
            </div>

            <div className="featured-properties__copy">
              <p>
                Una selección inicial de referencias para mostrar el tipo de operación
                que podemos gestionar en Madrid capital y alrededores: viviendas,
                oportunidades residenciales y activos con criterio comercial.
              </p>

              <div className="featured-properties__actions">
                <Button to="/inmuebles" variant="secondary">
                  Ver inmuebles
                </Button>
                <a href="/contacto" className="featured-properties__link">
                  Busco algo concreto <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal className="featured-properties__bar">
            <span>Madrid capital y alrededores</span>
            <i aria-hidden="true" />
            <span>Compra · venta · alquiler</span>
            <i aria-hidden="true" />
            <span>Selección orientativa hasta incorporar inventario real</span>
          </Reveal>

          <PropertyGrid properties={featuredProperties} editorial />
        </Container>
      </section>

      <section className="seller-section section-pad">
        <Container className="seller-section__grid">
          <Reveal className="seller-section__content">
            <SectionHeading
              inverse
              eyebrow="¿ESTÁS PENSANDO EN VENDER?"
              title={
                <>
                  Vender tu propiedad exige algo más que <em>publicarla.</em>
                </>
              }
              text="Definimos una estrategia de venta con valoración profesional, posicionamiento, gestión de visitas, negociación y acompañamiento documental hasta la firma."
            />

            <ul className="check-list seller-section__check-list">
              <li>Valoración personalizada</li>
              <li>Estrategia de precio</li>
              <li>Gestión de visitas</li>
              <li>Negociación y cierre</li>
              <li>Documentación coordinada</li>
              <li>Acompañamiento hasta la firma</li>
            </ul>

            <div className="seller-section__actions">
              <Button to="/#valoracion" variant="light">
                Solicitar valoración
              </Button>
              <a
                href={`tel:${business.phoneMobileHref}`}
                className="seller-section__phone"
                aria-label={`Hablar con Alvar en el ${business.phoneMobile}`}
              >
                <span>Hablar con Alvar</span>
                <small>{business.phoneMobile}</small>
              </a>
            </div>
          </Reveal>

          <Reveal className="seller-section__visual">
            <div className="seller-section__media-card">
              <ArchitecturalVisual
                variant="courtyard"
                label="Composición arquitectónica editorial para propietarios"
              />

              <div className="seller-section__panel">
                <span>Servicio a propietarios</span>
                <p>Estrategia, negociación y firma.</p>

                <div
                  className="seller-section__stats"
                  aria-label="Experiencia y ámbito del servicio de venta"
                >
                  <div>
                    <strong>18+</strong>
                    <small>años de experiencia</small>
                  </div>
                  <div>
                    <strong>Madrid</strong>
                    <small>capital y alrededores</small>
                  </div>
                  <div>
                    <strong>Valoración</strong>
                    <small>profesional</small>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section id="valoracion" className="valuation-section section-pad">
        <Container className="valuation-section__grid">
          <Reveal className="valuation-section__content">
            <div className="valuation-section__intro">
              <p className="eyebrow">VALORACIÓN PROFESIONAL</p>
              <h2>
                Vender bien empieza por <em>valorar bien.</em>
              </h2>
              <p className="valuation-section__lead">
                Cuéntanos los datos básicos de tu inmueble y prepararemos una primera
                orientación con criterio: ubicación, estado, demanda, operaciones
                comparables y estrategia de salida al mercado.
              </p>
              <p className="valuation-section__note">
                Sin compromiso inicial. Sin valoraciones automáticas infladas. Con
                criterio inmobiliario real.
              </p>
            </div>

            <div
              className="valuation-section__trust"
              aria-label="Criterios incluidos en la valoración profesional"
              role="list"
            >
              {[
                ['01', 'Análisis de zona'],
                ['02', 'Precio de mercado'],
                ['03', 'Estrategia de venta'],
                ['04', 'Próximos pasos claros'],
              ].map(([number, label]) => (
                <div key={number} role="listitem">
                  <span>{number}</span>
                  <strong>{label}</strong>
                </div>
              ))}
            </div>

            <span className="section-index valuation-section__index">04 / VALORACIÓN</span>
          </Reveal>

          <Reveal className="valuation-section__form-panel">
            <div className="valuation-section__form-heading">
              <span>Orientación personalizada</span>
              <h3>Solicita tu valoración</h3>
              <p>
                Te responderemos para concretar los datos necesarios antes de darte una
                orientación.
              </p>
            </div>

            <ValuationForm />
          </Reveal>
        </Container>
      </section>

      <section id="servicios" className="services-home section-pad">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="SERVICIOS"
              title={
                <>
                  Una operación.
                  <br />
                  <em>Cada decisión coordinada.</em>
                </>
              }
            />
          </Reveal>

          <div className="services-list">
            {services.map(([number, title, text]) => (
              <ServiceBlock key={number} number={number} title={title} text={text} />
            ))}
          </div>
        </Container>
      </section>

      <AdditionalServices />

      <section id="proceso" className="process-section section-pad">
        <Container>
          <Reveal className="process-section__intro">
            <div className="process-section__heading">
              <p className="eyebrow">NUESTRO PROCESO</p>
              <h2>
                De la primera conversación <em>a la firma.</em>
              </h2>
            </div>

            <div className="process-section__copy">
              <p>
                Ordenamos cada fase para que sepas qué toca decidir, qué documentación
                preparar y cómo avanzar con seguridad.
              </p>
              <span>Madrid capital y alrededores · Acompañamiento de principio a fin</span>
            </div>
          </Reveal>

          <ol className="process-section__timeline">
            {[
              [
                '01',
                'Escuchamos',
                'Entendemos tu situación, tus objetivos y el tipo de operación que necesitas resolver.',
              ],
              [
                '02',
                'Valoramos',
                'Analizamos el inmueble, la zona, el mercado y las operaciones comparables.',
              ],
              [
                '03',
                'Planificamos',
                'Definimos estrategia, precio, posicionamiento, tiempos y próximos pasos.',
              ],
              [
                '04',
                'Gestionamos',
                'Coordinamos visitas, consultas, negociación, documentación y seguimiento.',
              ],
              [
                '05',
                'Firmamos',
                'Acompañamos el cierre de la operación para que llegues a la firma con todo claro.',
              ],
            ].map(([number, title, text]) => (
              <li key={number} className="process-section__item">
                <Reveal className="process-section__item-inner">
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal className="process-section__footer">
            <p>Cada operación tiene matices. El método ayuda a tomar mejores decisiones.</p>
            <Button to="/contacto" variant="secondary">
              Hablar del proceso
            </Button>
          </Reveal>
        </Container>
      </section>

      <section id="zonas" className="areas-section section-pad">
        <Container className="areas-section__grid">
          <Reveal className="areas-section__content">
            <p className="eyebrow">CONOCIMIENTO LOCAL</p>
            <h2>
              Madrid capital y alrededores, <em>analizados con criterio.</em>
            </h2>
            <p className="areas-section__lead">
              Cada zona tiene una lógica distinta: demanda, precio, tiempos de venta,
              perfil comprador, comunicaciones y potencial de revalorización. Por eso
              no trabajamos con respuestas genéricas.
            </p>

            <div className="areas-section__coverage" aria-label="Ámbito geográfico de trabajo">
              <span>Madrid capital</span>
              <i aria-hidden="true" />
              <span>Área metropolitana</span>
              <i aria-hidden="true" />
              <span>Municipios próximos</span>
            </div>

            <p className="areas-section__map-note">
              Lectura residencial, patrimonial y de inversión para cada ubicación.
            </p>

            <Button to="/contacto" variant="secondary">
              Cuéntanos qué zona buscas
            </Button>

            <span className="areas-section__index">05 / ZONAS</span>
          </Reveal>

          <ol className="area-list" aria-label="Zonas de conocimiento inmobiliario">
            {[
              [
                '01',
                'Madrid capital',
                'Barrios consolidados, demanda activa y operaciones con lectura patrimonial.',
              ],
              [
                '02',
                'Norte de Madrid',
                'Zonas residenciales, familias, comunicación y búsqueda de vivienda principal.',
              ],
              [
                '03',
                'Sur de Madrid',
                'Municipios próximos, vivienda habitual, rotación y oportunidades de precio.',
              ],
              [
                '04',
                'Este y oeste',
                'Áreas metropolitanas con perfiles diversos y potencial según ubicación concreta.',
              ],
              [
                '05',
                'Pinto y Móstoles',
                'Conocimiento cercano de municipios donde cada barrio marca diferencias.',
              ],
            ].map(([number, place, detail]) => (
              <li className="area-list__item" key={number}>
                <Reveal className="area-list__item-inner">
                  <span>{number}</span>
                  <div>
                    <h3>{place}</h3>
                    <p>{detail}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="investment-section section-pad">
        <Container className="investment-section__grid">
          <Reveal className="investment-section__content">
            <p className="eyebrow">INVERSIÓN INMOBILIARIA</p>
            <h2>
              Decisiones inmobiliarias con <em>mirada patrimonial.</em>
            </h2>
            <p className="investment-section__lead">
              Asesoramos a clientes que buscan comprar, vender o invertir con una lectura
              clara del activo, la zona, el precio de mercado y el potencial real de cada
              operación.
            </p>
            <p className="investment-section__microcopy">
              No se trata de comprar rápido. Se trata de comprar bien.
            </p>

            <div className="investment-section__actions">
              <Button to="/contacto" variant="light">
                Consultar una oportunidad
              </Button>
              <span>06 / INVERSIÓN</span>
            </div>
          </Reveal>

          <Reveal className="investment-section__panel">
            <div className="investment-section__highlight">
              <span>Consultoría inmobiliaria</span>
              <h3>Criterio antes de decidir</h3>
              <p>
                Antes de avanzar, revisamos ubicación, estado del inmueble, comparables,
                documentación y objetivo de la operación.
              </p>
            </div>

            <ul
              className="investment-section__factors"
              aria-label="Factores del análisis de inversión inmobiliaria"
            >
              {[
                ['01', 'Análisis de oportunidad'],
                ['02', 'Precio de mercado'],
                ['03', 'Potencial de alquiler'],
                ['04', 'Perfil de demanda'],
                ['05', 'Rentabilidad estimada'],
                ['06', 'Riesgos y próximos pasos'],
              ].map(([number, factor]) => (
                <li key={number}>
                  <span>{number}</span>
                  <strong>{factor}</strong>
                </li>
              ))}
            </ul>

            <div className="investment-section__panel-footer">
              <span>Madrid capital y alrededores</span>
              <small>Estimaciones orientativas sujetas al análisis de cada operación.</small>
            </div>
          </Reveal>
        </Container>
      </section>

      <section id="opiniones" className="reviews-section section-pad">
        <Container>
          <Reveal className="reviews-section__header">
            <div
              className="rating"
              role="img"
              aria-label="Valoración media de 5 sobre 5 en Google, basada en 12 reseñas"
            >
              <span className="rating__label" aria-hidden="true">
                Valoración media
              </span>
              <strong>5,0</strong>
              <span className="rating__stars" aria-hidden="true">
                ★★★★★
              </span>
              <small>Google · 12 reseñas</small>
            </div>

            <div className="reviews-section__intro">
              <p className="eyebrow">OPINIONES</p>
              <h2>
                Confianza en operaciones <em>que importan.</em>
              </h2>
              <p>
                Comprar, vender o alquilar una propiedad implica decisiones relevantes.
                Por eso el trato, la claridad y el acompañamiento pesan tanto como el
                resultado.
              </p>
            </div>
          </Reveal>

          <p className="reviews-disclaimer" role="note">
            Opiniones de clientes · síntesis de experiencias, no citas literales verificadas
          </p>

          <div className="review-grid">
            {reviews.map((review, index) => (
              <ReviewCard key={review.source} review={review} index={index} />
            ))}
          </div>
        </Container>
      </section>

      <CTASection variant="home" />
      <LocationBlock />

      <section className="home-contact-form section-pad" aria-labelledby="home-contact-title">
        <Container className="home-contact-form__grid">
          <Reveal className="home-contact-form__content">
            <p className="eyebrow">CONTACTO</p>
            <h2 id="home-contact-title">Explícanos tu caso y te orientamos.</h2>
            <p className="home-contact-form__lead">
              Cuanto más contexto nos des, mejor podremos ayudarte: tipo de operación, zona, situación del inmueble y
              objetivo.
            </p>

            <div className="home-contact-form__details">
              <div>
                <span>Habla con nosotros</span>
                <a href={`tel:${business.phoneMobileHref}`}>{business.phoneMobile}</a>
                <small>Contacto móvil</small>
              </div>
              <div>
                <span>Área de trabajo</span>
                <strong>Madrid capital y alrededores</strong>
                <small>Compra · Venta · Alquiler · Inversión</small>
              </div>
            </div>

            <p className="home-contact-form__note">
              Trato directo, información clara y próximos pasos adaptados a tu operación.
            </p>
          </Reveal>

          <Reveal className="home-contact-form__panel">
            <div className="home-contact-form__panel-heading">
              <p className="eyebrow">CONTACTO DIRECTO</p>
              <h3>Cuéntanos qué necesitas.</h3>
              <p>Responderemos para ordenar contigo los próximos pasos.</p>
            </div>
            <ContactForm />
          </Reveal>
        </Container>
      </section>
    </>
  );
}

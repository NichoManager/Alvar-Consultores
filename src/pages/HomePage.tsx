import { ContactForm } from '../components/forms/ContactForm';
import { ValuationForm } from '../components/forms/ValuationForm';
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

      <section className="about-home section-pad">
        <Container className="about-home__grid">
          <Reveal className="about-home__visual">
            <div className="about-home__media-card">
              <ArchitecturalVisual
                variant="facade"
                label="Composición editorial inspirada en arquitectura residencial"
              />

              <div className="about-home__seal" aria-hidden="true">
                <strong>18+</strong>
                <span>años</span>
              </div>

              <div className="about-home__caption">
                <span>Madrid capital y alrededores</span>
                <p>Valoración, estrategia, negociación y firma.</p>
              </div>
            </div>

            <div className="about-home__note">
              <span>ALVAR CONSULTORES</span>
              <p>Criterio inmobiliario, trato directo y acompañamiento real.</p>
            </div>
          </Reveal>

          <Reveal className="about-home__content">
            <SectionHeading
              eyebrow="ALVAR CONSULTORES"
              title={
                <>
                  Experiencia inmobiliaria.
                  <br />
                  <em>Trato personal.</em>
                </>
              }
            />

            <p>
              Comprar, vender o alquilar una propiedad no debería sentirse como una
              sucesión de dudas. En Alvar Consultores Inmobiliarios ordenamos el
              proceso desde el primer contacto: valoración, estrategia, visitas,
              negociación, documentación y firma.
            </p>

            <p>
              Más de 18 años de experiencia nos permiten combinar conocimiento del
              mercado con una forma de trabajar cercana, transparente y centrada en
              proteger cada decisión importante.
            </p>

            <div className="about-home__facts" aria-label="Datos destacados de Alvar Consultores">
              <div>
                <strong>18+</strong>
                <span>años de experiencia</span>
              </div>
              <div>
                <strong>5,0</strong>
                <span>valoración en Google</span>
              </div>
              <div>
                <strong>1</strong>
                <span>interlocutor de confianza</span>
              </div>
            </div>

            <div className="about-home__actions">
              <Button to="/nosotros" variant="secondary">
                Conoce nuestro enfoque
              </Button>
              <a href={`tel:${business.phoneMobileHref}`} className="text-link">
                Hablar con Alvar ↗
              </a>
            </div>
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
            >
              {[
                ['01', 'Análisis de zona'],
                ['02', 'Precio de mercado'],
                ['03', 'Estrategia de venta'],
                ['04', 'Próximos pasos claros'],
              ].map(([number, label]) => (
                <div key={number}>
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

      <section id="proceso" className="process-section section-pad">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="NUESTRO PROCESO"
              title={
                <>
                  De la primera conversación
                  <br />
                  <em>a la firma.</em>
                </>
              }
            />
          </Reveal>

          <div className="timeline">
            {[
              ['01', 'Valoramos', 'Analizamos tu situación, el inmueble y el mercado.'],
              ['02', 'Planificamos', 'Definimos precio, estrategia y próximos pasos.'],
              ['03', 'Gestionamos', 'Nos ocupamos de visitas, negociación y documentación.'],
              ['04', 'Firmamos', 'Coordinamos todo hasta cerrar la operación.'],
            ].map(([n, t, p]) => (
              <Reveal key={n} className="timeline__item">
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section id="zonas" className="areas-section section-pad">
        <Container className="areas-section__grid">
          <Reveal>
            <SectionHeading
              eyebrow="CONOCIMIENTO LOCAL"
              title={
                <>
                  Especialistas en Madrid
                  <br />y <em>sus alrededores.</em>
                </>
              }
              text="Trabajamos con especial conocimiento de Madrid capital y municipios próximos, analizando cada zona desde una perspectiva residencial, patrimonial y de inversión."
            />
            <Button to="/contacto" variant="secondary">
              Cuéntanos qué zona buscas
            </Button>
          </Reveal>

          <div className="area-list">
            {[
              ['Madrid', 'Capital'],
              ['Pinto', 'Buenos Aires · Tenería'],
              ['Móstoles', 'Sur · Este'],
              ['Alrededores', 'Zonas próximas'],
            ].map(([place, detail], index) => (
              <Reveal className="area-list__item" key={place}>
                <span>0{index + 1}</span>
                <h3>{place}</h3>
                <p>{detail}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="investment-section section-pad">
        <Container className="investment-section__grid">
          <Reveal>
            <p className="eyebrow">INVERSIÓN INMOBILIARIA</p>
            <h2>
              Decisiones inmobiliarias
              <br />
              <em>con criterio.</em>
            </h2>
          </Reveal>

          <Reveal>
            <p className="investment-section__lead">
              Asesoramos a inversores que buscan activos con potencial de rentabilidad,
              alquiler o revalorización.
            </p>

            <ul className="editorial-list">
              <li>Análisis de oportunidad</li>
              <li>Rentabilidad estimada</li>
              <li>Precio de mercado</li>
              <li>Potencial de alquiler</li>
              <li>Viviendas y locales</li>
              <li>Terrenos y promoción</li>
            </ul>

            <Button to="/contacto" variant="light">
              Consultar una oportunidad
            </Button>
          </Reveal>
        </Container>
      </section>

      <section id="opiniones" className="reviews-section section-pad">
        <Container>
          <Reveal className="reviews-section__header">
            <div className="rating">
              <strong>5,0</strong>
              <span>★★★★★</span>
              <small>Google · 12 reseñas</small>
            </div>

            <SectionHeading
              eyebrow="OPINIONES"
              title={
                <>
                  Clientes que confían en nosotros
                  <br />
                  para <em>decisiones importantes.</em>
                </>
              }
            />
          </Reveal>

          <p className="reviews-disclaimer">
            Opiniones de clientes · síntesis de experiencias, no citas literales verificadas
          </p>

          <div className="review-grid">
            {reviews.map((review, index) => (
              <ReviewCard key={review.source} review={review} index={index} />
            ))}
          </div>
        </Container>
      </section>

      <CTASection />
      <LocationBlock />

      <section className="home-contact-form section-pad">
        <Container className="home-contact-form__grid">
          <SectionHeading
            eyebrow="CONTACTO"
            title={
              <>
                ¿Qué necesitas resolver
                <br />
                <em>con tu inmueble?</em>
              </>
            }
            text="Compra, venta, alquiler o inversión. Explícanos tu situación y ordenaremos contigo las decisiones importantes."
          />
          <ContactForm />
        </Container>
      </section>
    </>
  );
}

import { ContactForm } from '../components/forms/ContactForm';
import { SeoHead } from '../components/seo/SeoHead';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { business } from '../data/business';

const contactReasons = [
  'Comprar una propiedad',
  'Vender un inmueble',
  'Alquilar',
  'Solicitar una valoración',
  'Consultar una inversión',
  'VPO o herencias',
];

export function ContactPage() {
  return (
    <>
      <SeoHead
        title="Contacto | Alvar Consultores Inmobiliarios Madrid"
        description="Habla con Alvar Consultores Inmobiliarios sobre compra, venta, alquiler, valoración o inversión en Madrid capital y alrededores."
        path="/contacto"
      />

      <InternalHero
        eyebrow="CONTACTO"
        title={
          <>
            Cuéntanos qué
            <br />
            <em>necesitas resolver.</em>
          </>
        }
        text="Compra, venta, alquiler, valoración o inversión. Te ayudamos a ordenar la situación y definir los próximos pasos con criterio."
        image="/images/alvar/heroes/hero-contacto-alvar.webp"
        aside={
          <span className="internal-hero__quote">
            Madrid capital · Alrededores
          </span>
        }
      />

      <section
        className="contact-page section-pad"
        aria-labelledby="contact-page-title"
      >
        <Container>
          <header className="contact-page__intro">
            <div>
              <p className="eyebrow">HABLEMOS</p>

              <h2 id="contact-page-title">
                Una conversación puede ser
                <br />
                <em>el mejor punto de partida.</em>
              </h2>
            </div>

            <p>
              Cuéntanos tu situación y te ayudaremos a poner orden en la operación.
              Sin respuestas automáticas ni soluciones genéricas: primero entendemos
              qué necesitas y después vemos cómo avanzar.
            </p>
          </header>

          <div className="contact-page__grid">
            <div className="contact-data">
              <div className="contact-data__heading">
                <p className="eyebrow">DATOS DE CONTACTO</p>
                <h3>{business.name}</h3>

                <address>
                  <p>
                    {business.addressLine1}
                    <br />
                    {business.addressLine2}
                    <br />
                    {business.postalAddress}
                  </p>
                </address>
              </div>

              <div className="contact-data__channels">
                <a
                  href={`tel:${business.phoneMobileHref}`}
                  className="contact-channel contact-channel--primary"
                >
                  <span>Móvil comercial</span>
                  <strong>{business.phoneMobile}</strong>
                  <small>Hablar directamente con Alvar ↗</small>
                </a>

                <a
                  href={`tel:${business.phoneOfficeHref}`}
                  className="contact-channel"
                >
                  <span>Oficina</span>
                  <strong>{business.phoneOffice}</strong>
                  <small>Llamar a la oficina ↗</small>
                </a>
              </div>

              <div className="contact-data__reasons">
                <span className="contact-data__label">
                  Puedes consultarnos sobre
                </span>

                <ul>
                  {contactReasons.map((reason, index) => (
                    <li key={reason}>
                      <span aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="contact-data__social">
                <span className="contact-data__label">Redes sociales</span>

                <div>
                  <a
                    href={business.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {business.instagram} ↗
                  </a>

                  <a
                    href={business.tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {business.tiktok} ↗
                  </a>
                </div>
              </div>

              <div
                className="map-placeholder map-placeholder--contact"
                role="img"
                aria-label="Referencia territorial de la oficina de Alvar Consultores Inmobiliarios en Ríos Rosas, Madrid"
              >
                <span className="map-placeholder__road map-placeholder__road--one" />
                <span className="map-placeholder__road map-placeholder__road--two" />

                <span className="map-placeholder__pin">42</span>

                <div className="map-placeholder__caption">
                  <span>OFICINA</span>
                  <p>Ríos Rosas · Madrid</p>
                </div>
              </div>
            </div>

            <div className="contact-page__form">
              <div className="contact-page__form-heading">
                <span>CONTACTO DIRECTO</span>

                <h3>Explícanos tu caso.</h3>

                <p>
                  Cuanto más contexto nos des sobre la operación, la zona y tu
                  objetivo, mejor podremos orientarte desde el primer contacto.
                </p>
              </div>

              <ContactForm />

              <div className="contact-page__form-note">
                <span aria-hidden="true">01</span>

                <p>
                  Revisamos personalmente cada consulta antes de proponerte los
                  siguientes pasos.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
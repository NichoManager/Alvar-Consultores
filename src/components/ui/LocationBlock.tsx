import { business } from '../../data/business';
import { Container } from './Container';

export function LocationBlock() {
  return (
    <section id="contacto" className="location-block section-pad" aria-labelledby="location-title">
      <Container>
        <div className="location-block__grid">
          <div className="location-block__content">
            <p className="eyebrow">PRESENCIA Y ÁREA DE TRABAJO</p>
            <h2 id="location-title">Madrid como punto de partida. Alrededores como terreno de trabajo.</h2>
            <p className="location-block__lead">
              Trabajamos con clientes en Madrid capital, área metropolitana y municipios próximos, combinando lectura
              local y acompañamiento personalizado.
            </p>
          </div>

          <div className="location-block__meta">
            <address className="location-block__address">
              <span className="location-block__label">Oficina</span>
              <strong>{business.addressLine1}</strong>
              <span>{business.addressLine2}</span>
              <span>{business.postalAddress}</span>
            </address>

            <div className="location-block__contact">
              <span className="location-block__label">Contacto directo</span>
              <a href={`tel:${business.phoneMobileHref}`} aria-label={`Llamar al teléfono ${business.phoneMobile}`}>
                <span>{business.phoneMobile}</span>
                <small>Llamar directamente</small>
              </a>
            </div>
          </div>
        </div>

        <div
          className="location-block__area"
          role="img"
          aria-label="Área de trabajo: Madrid capital, área metropolitana y municipios próximos"
        >
          <div className="location-block__area-copy">
            <span>Área de trabajo</span>
            <strong>Madrid capital</strong>
            <p>Área metropolitana · Municipios próximos</p>
          </div>
          <div className="location-block__area-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <small>Lectura local · Acompañamiento personalizado</small>
        </div>
      </Container>
    </section>
  );
}

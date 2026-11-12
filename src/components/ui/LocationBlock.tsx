import { business } from '../../data/business';
import { Container } from './Container';

export function LocationBlock() {
  return (
    <section id="contacto" className="location-block section-pad" aria-labelledby="location-title">
      <Container>
        <div className="location-block__grid">
          <div className="location-block__content">
            <p className="eyebrow">NUESTRA OFICINA</p>
            <h2 id="location-title">Empieza por una conversación. Te recibimos con cita previa en Madrid.</h2>
            <p className="location-block__lead">
              Puedes llamarnos o escribirnos por WhatsApp para contarnos tu caso. Si después prefieres vernos, te
              esperamos en {business.addressLine1}.
            </p>
          </div>

          <div className="location-block__meta">
            <address className="location-block__address">
              <span className="location-block__label">Oficina</span>
              <strong>{business.addressLine1}</strong>
              <span>{business.addressLine2}</span>
              <span>{business.postalAddress}</span>
              <small>{business.appointmentNote}</small>
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

        <div className="location-block__area">
          <div className="location-block__area-copy">
            <span>Sede</span>
            <strong>Madrid capital</strong>
            <p>Desde aquí atendemos Valdemoro y el sur de Madrid.</p>
          </div>

          <div className="location-block__area-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <small>
            {business.name}
          </small>
        </div>
      </Container>
    </section>
  );
}

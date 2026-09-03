import { business } from '../../data/business';
import { Container } from './Container';

export function LocationBlock() {
  return (
    <section id="contacto" className="location-block section-pad">
      <Container className="location-block__grid">
        <div>
          <p className="eyebrow">MADRID · RÍOS ROSAS</p>
          <h2>Una conversación,<br />sin compromiso.</h2>
        </div>
        <address>
          <p>{business.addressLine1}</p>
          <p>{business.addressLine2}</p>
          <p>{business.postalAddress}</p>
        </address>
        <div className="location-block__contact">
          <a href={`tel:${business.phoneOfficeHref}`}>{business.phoneOffice}</a>
          <a href={`tel:${business.phoneMobileHref}`}>{business.phoneMobile}</a>
          <small>Horario pendiente de confirmación</small>
        </div>
        <div className="map-placeholder" role="img" aria-label="Ubicación aproximada de la oficina en Ríos Rosas, Madrid">
          <span className="map-placeholder__road map-placeholder__road--one" />
          <span className="map-placeholder__road map-placeholder__road--two" />
          <span className="map-placeholder__pin">42</span>
          <p>Integración de mapa pendiente</p>
        </div>
      </Container>
    </section>
  );
}

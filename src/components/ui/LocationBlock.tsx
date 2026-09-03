import { business } from '../../data/business';
import { Container } from './Container';

export function LocationBlock() {
  return (
    <section id="contacto" className="location-block section-pad">
      <Container className="location-block__grid">
        <div>
          <p className="eyebrow">MADRID · RÍOS ROSAS</p>
          <h2>Ríos Rosas, Madrid.<br />Hablemos de tu operación.</h2>
        </div>
        <address>
          <p>{business.addressLine1}</p>
          <p>{business.addressLine2}</p>
          <p>{business.postalAddress}</p>
        </address>
        <div className="location-block__contact">
          <a href={`tel:${business.phoneOfficeHref}`}>{business.phoneOffice}</a>
          <a href={`tel:${business.phoneMobileHref}`}>{business.phoneMobile}</a>
        </div>
        <div className="map-placeholder" role="img" aria-label="Ubicación aproximada de la oficina en Ríos Rosas, Madrid">
          <span className="map-placeholder__road map-placeholder__road--one" />
          <span className="map-placeholder__road map-placeholder__road--two" />
          <span className="map-placeholder__pin">42</span>
          <p>Ríos Rosas · Madrid</p>
        </div>
      </Container>
    </section>
  );
}

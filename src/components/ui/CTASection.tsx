import { business, generalWhatsAppMessage } from '../../data/business';
import { trackEvent } from '../../utils/analytics';
import { whatsappUrl } from '../../utils/contact';
import { Button } from './Button';
import { Container } from './Container';

type CTASectionProps = {
  variant?: 'default' | 'home';
};

export function CTASection({ variant = 'default' }: CTASectionProps) {
  if (variant === 'home') {
    return (
      <section className="cta-section cta-section--home section-pad" aria-labelledby="home-cta-title">
        <Container className="cta-section__inner">
          <span className="cta-section__index" aria-hidden="true">07</span>
          <p className="eyebrow">HABLEMOS DE TU OPERACIÓN</p>
          <h2 id="home-cta-title">Cuéntanos qué necesitas resolver con tu inmueble.</h2>
          <p>
            Compra, venta, alquiler o inversión. Te ayudamos a ordenar la operación, valorar opciones y decidir los
            próximos pasos con criterio.
          </p>
          <div className="button-row">
            <Button to="/contacto">Contactar con Alvar</Button>
            <Button to="/#valoracion" variant="secondary">Solicitar valoración</Button>
          </div>
          <div className="cta-section__services" aria-label="Operaciones inmobiliarias que asesoramos">
            <span>Compra</span>
            <span>Venta</span>
            <span>Alquiler</span>
            <span>Inversión</span>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="cta-section section-pad">
      <Container className="cta-section__inner">
        <p className="eyebrow">HABLEMOS</p>
        <h2>Una operación inmobiliaria exige<br />claridad, método y alguien que responda.</h2>
        <p>Te ayudamos a vender, comprar o invertir con una estrategia clara desde el primer día.</p>
        <div className="button-row">
          <a className="button button--primary" href={whatsappUrl(business.phoneMobileHref, generalWhatsAppMessage)} target="_blank" rel="noreferrer" onClick={() => trackEvent('whatsapp_click')}>
            <span>Hablar con un asesor</span><span className="button__arrow" aria-hidden="true">↗</span>
          </a>
          <a className="button button--text" href={`tel:${business.phoneMobileHref}`} onClick={() => trackEvent('phone_click')}>
            <span>{business.phoneMobile}</span><span className="button__arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </Container>
    </section>
  );
}

import { business, generalWhatsAppMessage } from '../../data/business';
import { trackEvent } from '../../utils/analytics';
import { whatsappUrl } from '../../utils/contact';
import { Container } from './Container';

export function CTASection() {
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

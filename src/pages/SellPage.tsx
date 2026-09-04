import { ValuationForm } from '../components/forms/ValuationForm';
import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { business } from '../data/business';

const sellMethod = [
  ['01', 'Valoración profesional', 'Analizamos ubicación, estado, demanda y operaciones comparables.'],
  ['02', 'Estrategia de precio', 'Definimos un posicionamiento coherente con el mercado y tus objetivos.'],
  ['03', 'Preparación del inmueble', 'Ordenamos la presentación y la información necesaria antes de publicar.'],
  ['04', 'Gestión de visitas', 'Coordinamos consultas y visitas con seguimiento después de cada contacto.'],
  ['05', 'Negociación', 'Valoramos cada propuesta y protegemos las condiciones importantes de la operación.'],
  ['06', 'Firma', 'Coordinamos documentación y cierre para que llegues a la firma con todo claro.'],
] as const;

export function SellPage() {
  return (
    <>
      <SeoHead
        title="Vender inmueble en Madrid | Alvar Consultores Inmobiliarios"
        description="Vende tu propiedad en Madrid capital y alrededores con valoración profesional, estrategia de precio, gestión de visitas, negociación y acompañamiento hasta la firma."
        path="/vender"
      />

      <InternalHero
        eyebrow="VENDE TU INMUEBLE"
        title={<>Vender tu propiedad con estrategia, criterio <em>y acompañamiento.</em></>}
        text="Valoramos tu inmueble, definimos el posicionamiento adecuado, gestionamos visitas, negociación y documentación hasta la firma."
        image="/images/alvar/heroes/hero-vender-inmueble.webp"
        aside={(
          <div className="big-stat">
            <strong>18+</strong>
            <span>años de experiencia inmobiliaria</span>
          </div>
        )}
      />

      <section className="sell-intro section-pad">
        <Container className="sell-intro__grid">
          <div>
            <p className="eyebrow">ESTRATEGIA DE VENTA</p>
            <h2>Vender bien no es solo publicar un anuncio.</h2>
          </div>
          <div className="sell-intro__copy">
            <p>
              Una buena venta empieza por entender el inmueble, el momento del mercado y el perfil de comprador al
              que queremos llegar. La valoración orienta el precio; la estrategia ordena todo lo que viene después.
            </p>
            <p>
              Preparamos contigo la salida al mercado, coordinamos visitas y negociación, y mantenemos la
              documentación bajo control hasta completar la operación.
            </p>
            <div className="sell-intro__actions">
              <Button to="/vender#valoracion">Solicitar valoración</Button>
              <a
                href={`tel:${business.phoneMobileHref}`}
                className="sell-page__phone"
                aria-label={`Hablar con Alvar en el ${business.phoneMobile}`}
              >
                <span>Hablar con Alvar</span>
                <small>{business.phoneMobile}</small>
              </a>
            </div>
          </div>
        </Container>
      </section>

      <section className="sell-method section-pad" aria-labelledby="sell-method-title">
        <Container>
          <div className="sell-method__intro">
            <p className="eyebrow">MÉTODO</p>
            <h2 id="sell-method-title">Cada fase, preparada antes de avanzar.</h2>
            <p>Un proceso ordenado permite tomar decisiones con más información y menos incertidumbre.</p>
          </div>

          <ol className="sell-method__grid">
            {sellMethod.map(([number, title, text]) => (
              <li key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="sell-trust" aria-label="Confianza para vender con Alvar Consultores">
        <Container className="sell-trust__grid">
          <div>
            <strong>18+</strong>
            <span>años de experiencia</span>
          </div>
          <div>
            <strong>Madrid</strong>
            <span>capital y alrededores</span>
          </div>
          <div>
            <strong>Hasta la firma</strong>
            <span>acompañamiento durante la operación</span>
          </div>
        </Container>
      </section>

      <section id="valoracion" className="sell-valuation section-pad" aria-labelledby="sell-valuation-title">
        <Container className="sell-valuation__grid">
          <div className="sell-valuation__content">
            <p className="eyebrow">VALORACIÓN PROFESIONAL</p>
            <h2 id="sell-valuation-title">El primer paso es conocer el punto de partida.</h2>
            <p>
              Cuéntanos los datos básicos del inmueble. Revisaremos la ubicación, las características y el contexto de
              mercado antes de orientarte sobre los siguientes pasos.
            </p>
            <span>Sin compromiso inicial · Con criterio inmobiliario real</span>
          </div>

          <div className="sell-valuation__panel">
            <div className="sell-valuation__heading">
              <span>Solicitud personalizada</span>
              <h3>Solicita tu valoración</h3>
              <p>Contactaremos contigo para completar la información necesaria.</p>
            </div>
            <ValuationForm />
          </div>
        </Container>
      </section>
    </>
  );
}

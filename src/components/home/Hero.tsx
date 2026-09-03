import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { ArchitecturalVisual } from '../ui/ArchitecturalVisual';

export function Hero() {
  return (
    <section className="hero hero--signature">
      <Container className="hero__grid">
        <div className="hero__content">
          <p className="eyebrow hero-animate hero-animate--1">
            CONSULTORES INMOBILIARIOS · MADRID Y ALREDEDORES
          </p>

          <h1 className="hero-animate hero-animate--2">
            <span>Tu propiedad.</span>
            <span>
              <em>En buenas manos.</em>
            </span>
          </h1>

          <p className="hero__lead hero-animate hero-animate--3">
            Una operación inmobiliaria exige claridad, método y alguien que responda.
            En Alvar Consultores acompañamos venta, compra e inversión con visión de mercado,
            trato directo y una estrategia pensada desde el primer día.
          </p>

          <div className="button-row hero__actions hero-animate hero-animate--4">
            <Button to="/#valoracion">Solicitar valoración</Button>
            <Button to="/inmuebles" variant="secondary">
              Ver inmuebles
            </Button>
          </div>

          <div className="hero__proof hero-animate hero-animate--5" aria-label="Datos de confianza">
            <div>
              <strong>18+</strong>
              <small>años de experiencia inmobiliaria</small>
            </div>

            <div>
              <strong>5,0</strong>
              <span aria-hidden="true">★★★★★</span>
              <span className="sr-only">Valoración de cinco estrellas en Google</span>
              <small>en Google · 12 reseñas</small>
            </div>
          </div>

          <p className="hero__micro hero-animate hero-animate--6">
            Madrid capital · Área metropolitana · Pinto · Móstoles
          </p>
        </div>

        <div
          className="hero__visual hero-animate hero-animate--image"
          aria-label="Composición editorial inspirada en arquitectura residencial, valoración inmobiliaria y territorio de Madrid y alrededores"
          role="img"
        >
          {/* Futuro asset real recomendado: /public/images/alvar/hero-inmobiliaria-madrid.webp */}
          <div className="hero__visual-frame">
            <ArchitecturalVisual decorative />

            <div className="hero__blueprint" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>

            <div className="hero__territory" aria-hidden="true">
              <span className="hero__territory-title">Madrid y entorno</span>
              <span className="hero__territory-line hero__territory-line--one" />
              <span className="hero__territory-line hero__territory-line--two" />

              <span className="hero__place hero__place--madrid">
                <i />
                Madrid
              </span>

              <span className="hero__place hero__place--mostoles">
                <i />
                Área oeste
              </span>

              <span className="hero__place hero__place--pinto">
                <i />
                Área sur
              </span>
            </div>

            <div className="hero__asset-card" aria-hidden="true">
              <span>Valoración previa</span>
              <strong>Mercado, inmueble y objetivo</strong>
              <small>Antes de vender, saber dónde estás.</small>
            </div>

            <div className="hero__vertical-label" aria-hidden="true">
              ALVAR / MADRID
            </div>

            <div className="hero__monogram" aria-hidden="true">
              A
            </div>
          </div>

          <p className="hero__caption">
            <span>01 / Consultoría inmobiliaria</span>
            <strong>Madrid · alrededores · inversión</strong>
          </p>
        </div>
      </Container>
    </section>
  );
}
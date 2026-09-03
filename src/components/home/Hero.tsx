import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { ArchitecturalVisual } from '../ui/ArchitecturalVisual';

export function Hero() {
  return (
    <section className="hero">
      <Container className="hero__grid">
        <div className="hero__content">
          <p className="eyebrow hero-animate hero-animate--1">
            INMOBILIARIA PREMIUM · MADRID Y ALREDEDORES
          </p>

          <h1 className="hero-animate hero-animate--2">
            Tu propiedad.
            <br />
            <em>En buenas manos.</em>
          </h1>

          <p className="hero__lead hero-animate hero-animate--3">
            Vender, comprar o invertir en Madrid exige criterio, método y alguien
            que responda. En Alvar Consultores Inmobiliarios te acompañamos con
            una estrategia clara desde la primera valoración hasta la firma.
          </p>

          <div className="button-row hero-animate hero-animate--4">
            <Button to="/#valoracion">Solicitar valoración</Button>
            <Button to="/inmuebles" variant="secondary">
              Ver inmuebles
            </Button>
          </div>

          <div className="hero__proof hero-animate hero-animate--5">
            <div>
              <strong>18+</strong>
              <small>años de experiencia inmobiliaria</small>
            </div>

            <div>
              <strong>5,0</strong>
              <span aria-hidden="true">★★★★★</span>
              <span className="sr-only">Cinco estrellas en Google</span>
              <small>en Google · 12 reseñas</small>
            </div>
          </div>
        </div>

        <div
          className="hero__visual hero-animate hero-animate--image"
          aria-label="Composición editorial inspirada en arquitectura residencial, valoración inmobiliaria y territorio de Madrid"
          role="img"
        >
          {/* La futura fotografía real se integrará desde /public/images/alvar/hero-inmobiliaria-madrid.webp. */}
          <ArchitecturalVisual decorative />

          <div className="hero__blueprint" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>

          <div className="hero__territory" aria-hidden="true">
            <span className="hero__territory-title">Madrid y entorno</span>
            <span className="hero__territory-line" />

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

          <div className="hero__monogram" aria-hidden="true">
            A
          </div>

          <p className="hero__caption">
            <span>01 / 03</span> Consultoría inmobiliaria en Madrid
          </p>
        </div>
      </Container>
    </section>
  );
}
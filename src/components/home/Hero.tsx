import { Button } from '../ui/Button';
import { Container } from '../ui/Container';

export function Hero() {
  return (
    <section className="hero hero--video">
      <video
        className="hero__video"
        src="/video/hero-alvar-consultores.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />

      <div className="hero__overlay" aria-hidden="true" />

      <Container className="hero__video-content">
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
      </Container>
    </section>
  );
}
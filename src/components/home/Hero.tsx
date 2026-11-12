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

      <div
        className="hero__overlay"
        aria-hidden="true"
      />

      <Container className="hero__video-content">
        <div className="hero__content">
          <p className="eyebrow hero-animate hero-animate--1">
            ASESORAMIENTO INMOBILIARIO PERSONAL
          </p>

          <h1 className="hero-animate hero-animate--2">
            Inmobiliaria en Valdemoro{' '}
            <br />
            <em>
              y el sur de Madrid.
            </em>
          </h1>

          <p className="hero__lead hero-animate hero-animate--3">
            Tu próxima decisión, bien acompañada. Te ayudamos a
            vender, comprar y alquilar con una valoración
            realista, una estrategia personalizada y
            acompañamiento hasta la firma. Atención con cita
            previa desde nuestra oficina en Madrid.
          </p>

          <div className="button-row hero-animate hero-animate--4">
            <Button to="/#valoracion">
              Solicitar valoración
            </Button>

            <Button
              to="/inmuebles?operation=venta"
              variant="secondary"
            >
              Ver inmuebles en venta
            </Button>
          </div>

          <div className="hero__proof hero-animate hero-animate--5">
            <div>
              <strong>18+</strong>
              <small>
                años de experiencia inmobiliaria
              </small>
            </div>

            <div>
              <strong>5,0</strong>

              <span aria-hidden="true">
                ★★★★★
              </span>

              <span className="sr-only">
                Cinco estrellas en Google
              </span>

              <small>
                en Google · 12 reseñas
              </small>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
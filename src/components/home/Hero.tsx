import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { ArchitecturalVisual } from '../ui/ArchitecturalVisual';

export function Hero() {
  return (
    <section className="hero">
      <Container className="hero__grid">
        <div className="hero__content">
          <p className="eyebrow hero-animate hero-animate--1">CONSULTORES INMOBILIARIOS · MADRID</p>
          <h1 className="hero-animate hero-animate--2">Tu propiedad.<br /><em>En buenas manos.</em></h1>
          <p className="hero__lead hero-animate hero-animate--3">Más de 18 años acompañando a propietarios, compradores e inversores en operaciones inmobiliarias seguras, transparentes y bien gestionadas.</p>
          <div className="button-row hero-animate hero-animate--4"><Button to="/#valoracion">Solicitar valoración</Button><Button to="/inmuebles" variant="secondary">Ver inmuebles</Button></div>
          <div className="hero__proof hero-animate hero-animate--5">
            <div><strong>5,0</strong><span>★★★★★</span><small>Google · 12 reseñas</small></div>
            <div><strong>18+</strong><small>años de experiencia</small></div>
          </div>
        </div>
        <div className="hero__visual hero-animate hero-animate--image">
          <ArchitecturalVisual label="Composición arquitectónica provisional para el Hero" />
          <p className="hero__caption"><span>01</span> Madrid · Pinto · Móstoles</p>
        </div>
      </Container>
    </section>
  );
}

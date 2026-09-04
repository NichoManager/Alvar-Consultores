import { ReviewCard } from '../components/home/ReviewCard';
import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { reviews } from '../data/reviews';

const trustData = [
  {
    value: '5,0',
    label: 'Valoración en Google',
  },
  {
    value: '12',
    label: 'Reseñas',
  },
  {
    value: '18+',
    label: 'Años de experiencia',
  },
] as const;

export function ReviewsPage() {
  return (
    <>
      <SeoHead
        title="Opiniones | Alvar Consultores Inmobiliarios"
        description="Experiencias de clientes de Alvar Consultores Inmobiliarios sobre compra, venta y asesoramiento inmobiliario en Madrid capital y alrededores."
        path="/opiniones"
      />

      <InternalHero
        eyebrow="OPINIONES"
        title={
          <>
            Confianza en operaciones
            <br />
            <em>que importan.</em>
          </>
        }
        text="La claridad, el seguimiento y el trato personal forman parte de cada operación inmobiliaria."
        image="/images/alvar/heroes/hero-opiniones-clientes.webp"
        aside={
          <div className="big-stat">
            <strong>5,0</strong>
            <span>Google · 12 reseñas</span>
          </div>
        }
      />

      <section
        className="reviews-page section-pad"
        aria-labelledby="reviews-page-title"
      >
        <Container>
          <header className="reviews-page__intro">
            <div>
              <p className="eyebrow">EXPERIENCIAS DE CLIENTES</p>

              <h2 id="reviews-page-title">
                La confianza se construye
                <br />
                <em>durante todo el proceso.</em>
              </h2>
            </div>

            <p>
              Comprar, vender o gestionar una propiedad implica decisiones
              importantes. Por eso valoramos especialmente que nuestros clientes
              destaquen la comunicación, el seguimiento y la tranquilidad durante
              la operación.
            </p>
          </header>

          <div
            className="reviews-page__trust"
            aria-label="Indicadores de confianza"
          >
            {trustData.map(({ value, label }, index) => (
              <div key={label}>
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <strong>{value}</strong>
                <p>{label}</p>
              </div>
            ))}
          </div>

          <div className="reviews-page__notice">
            <div>
              <span>TRANSPARENCIA</span>
              <strong>Experiencias resumidas, no citas literales.</strong>
            </div>

            <p>
              Los textos que aparecen a continuación sintetizan experiencias
              facilitadas y no utilizan nombres, fotografías ni testimonios
              inventados.
            </p>
          </div>

          <div className="review-grid review-grid--page">
            {reviews.map((review, index) => (
              <ReviewCard
                key={review.source}
                review={review}
                index={index}
              />
            ))}
          </div>

          <aside
            className="reviews-page__closing"
            aria-label="Contacto con Alvar Consultores"
          >
            <div>
              <p className="eyebrow">TU OPERACIÓN TAMBIÉN MERECE CLARIDAD</p>

              <h2>
                Hablemos antes de
                <br />
                <em>tomar una decisión.</em>
              </h2>

              <p>
                Si estás pensando en comprar, vender, alquilar o necesitas
                asesoramiento sobre una operación, cuéntanos tu caso y revisamos
                contigo los próximos pasos.
              </p>
            </div>

            <div className="reviews-page__closing-actions">
              <Button to="/contacto" variant="light">
                Hablar con Alvar
              </Button>

              <Button to="/servicios" variant="secondary">
                Ver servicios
              </Button>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
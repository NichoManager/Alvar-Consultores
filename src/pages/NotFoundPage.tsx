import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';

export function NotFoundPage() {
  return (
    <>
      <SeoHead
        title="Página no encontrada | Alvar Consultores"
        description="La página solicitada no está disponible. Vuelve al inicio o consulta los inmuebles disponibles de Alvar Consultores Inmobiliarios."
        path="/404"
        noIndex
      />

      <InternalHero
        eyebrow="ERROR 404"
        title={
          <>
            Esta dirección no conduce
            <br />
            <em>a ninguna propiedad.</em>
          </>
        }
        text="Puede que el enlace haya cambiado, que el contenido ya no esté disponible o que la dirección no sea correcta."
        image="/images/alvar/heroes/hero-legal-alvar.webp"
        compact
        aside={
          <div className="big-stat">
            <strong>404</strong>
            <span>Página no encontrada</span>
          </div>
        }
      />

      <section
        className="not-found section-pad"
        aria-labelledby="not-found-title"
      >
        <Container>
          <p className="eyebrow">SIGAMOS DESDE AQUÍ</p>

          <h2 id="not-found-title">
            Podemos ayudarte a encontrar
            <br />
            <em>el camino correcto.</em>
          </h2>

          <p>
            Vuelve a la página principal o consulta nuestra selección de
            inmuebles disponibles en Madrid capital y alrededores.
          </p>

          <div className="not-found__actions">
            <Button to="/">
              Volver al inicio
            </Button>

            <Button
              to="/inmuebles?operation=venta"
              variant="secondary"
            >
              Ver inmuebles
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
import { Link } from 'react-router-dom';
import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { articles } from '../data/articles';
import { formatDate } from '../utils/contact';

export function BlogPage() {
  const topics = Array.from(
    new Set(articles.map((article) => article.category)),
  );

  return (
    <>
      <SeoHead
        title="Blog inmobiliario en Madrid | Alvar Consultores"
        description="Guías sobre compra, venta, alquiler, valoración e inversión inmobiliaria en Madrid capital y alrededores."
        path="/blog"
        noIndex
      />

      <InternalHero
        eyebrow="BLOG INMOBILIARIO"
        title={
          <>
            Criterio para
            <br />
            <em>decidir mejor.</em>
          </>
        }
        text="Guías y contenidos sobre compraventa, alquiler, valoración, inversión y mercado inmobiliario."
        image="/images/alvar/heroes/hero-blog-inmobiliario.webp"
        aside={
          <span className="internal-hero__quote">
            Comprar · Vender · Invertir
          </span>
        }
      />

      <section
        className="blog-page section-pad"
        aria-labelledby="blog-page-title"
      >
        <Container>
          <header className="blog-page__intro">
            <div>
              <p className="eyebrow">CUADERNO INMOBILIARIO</p>

              <h2 id="blog-page-title">
                Información útil para tomar
                <br />
                <em>mejores decisiones.</em>
              </h2>
            </div>

            <div className="blog-page__intro-copy">
              <p>
                Analizamos cuestiones habituales del mercado inmobiliario para
                ayudarte a entender mejor una compra, una venta, un alquiler o
                una inversión antes de tomar decisiones.
              </p>

              <div className="blog-page__meta">
                <span>
                  <strong>{articles.length}</strong>{' '}
                  {articles.length === 1 ? 'artículo' : 'artículos'}
                </span>

                <i aria-hidden="true" />

                <span>Madrid capital y alrededores</span>
              </div>
            </div>
          </header>

          {topics.length > 0 && (
            <div
              className="blog-page__topics"
              aria-label="Temas del blog inmobiliario"
            >
              <span>TEMAS</span>

              <div>
                {topics.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
            </div>
          )}

          <div className="magazine-grid">
            {articles.map((article, index) => (
              <article
                className={
                  index === 0
                    ? 'article-card article-card--featured'
                    : 'article-card'
                }
                key={article.slug}
              >
                <Link
                  to={`/blog/${article.slug}`}
                  aria-label={`Leer: ${article.title}`}
                >
                  <div className="article-card__visual">
                    <span className="article-card__index">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <small>{article.category}</small>

                    <i aria-hidden="true" />
                  </div>

                  <div className="article-card__body">
                    <p>
                      {article.category} · {formatDate(article.date)}
                    </p>

                    <h2>{article.title}</h2>

                    <span>{article.readingTime} de lectura</span>

                    <strong>
                      Leer artículo
                      <span aria-hidden="true">↗</span>
                    </strong>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          <aside
            className="blog-page__closing"
            aria-labelledby="blog-closing-title"
          >
            <div>
              <span>¿TIENES UNA OPERACIÓN EN MARCHA?</span>

              <h2 id="blog-closing-title">
                La información ayuda.
                <br />
                <em>El contexto decide.</em>
              </h2>

              <p>
                Si tienes una situación concreta, podemos ayudarte a analizarla
                y ordenar los próximos pasos con una visión profesional del
                mercado.
              </p>
            </div>

            <div className="blog-page__closing-actions">
              <Button to="/contacto" variant="light">
                Cuéntanos tu caso
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
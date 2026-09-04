import { Link, Navigate, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/seo/Breadcrumbs';
import { JsonLd } from '../components/seo/JsonLd';
import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { getArticleBySlug } from '../data/articles';
import { formatDate } from '../utils/contact';

export function BlogPostPage() {
  const { slug = '' } = useParams();
  const article = getArticleBySlug(slug);

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  const articleUrl = `https://www.alvarconsultoresinmobiliarios.es/blog/${article.slug}`;

  const breadcrumbs = [
    { label: 'Inicio', to: '/' },
    { label: 'Blog', to: '/blog' },
    { label: article.title },
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.to
        ? {
            item: `https://www.alvarconsultoresinmobiliarios.es${item.to}`,
          }
        : {}),
    })),
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    datePublished: article.date,
    description: article.excerpt,
    mainEntityOfPage: articleUrl,
    author: {
      '@type': 'Organization',
      name: 'Alvar Consultores Inmobiliarios',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Alvar Consultores Inmobiliarios',
    },
  };

  return (
    <>
  <SeoHead
  title={article.seoTitle ?? `${article.title} | Alvar Consultores`}
  description={article.seoDescription ?? article.excerpt}
  path={`/blog/${article.slug}`}
  type="article"
  noIndex
/>

      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />

      <article className="blog-post">
        <InternalHero
          eyebrow={article.category}
          title={article.title}
          text={article.excerpt}
          image="/images/alvar/heroes/hero-blog-inmobiliario.webp"
          meta={<Breadcrumbs items={breadcrumbs} />}
          aside={
            <div className="post-meta post-meta--hero">
              <div>
                <span>PUBLICADO</span>
                <strong>{formatDate(article.date)}</strong>
              </div>

              <div>
                <span>LECTURA</span>
                <strong>{article.readingTime}</strong>
              </div>
            </div>
          }
        />

        <section className="blog-post__body section-pad">
          <Container className="blog-post__layout">
            <nav
              className="blog-post__toc"
              aria-label="Contenido del artículo"
            >
              <div className="blog-post__toc-heading">
                <span>CONTENIDO</span>
                <strong>En este artículo</strong>
              </div>

              <div className="blog-post__toc-links">
                {article.sections.map((section, index) => (
                  <a
                    key={section.title}
                    href={`#section-${index + 1}`}
                  >
                    <span>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {section.title}
                  </a>
                ))}
              </div>
            </nav>

            <div className="blog-post__content">
              <header className="blog-post__content-intro">
                <p className="eyebrow">ANÁLISIS INMOBILIARIO</p>

                <p className="lead-copy">{article.intro}</p>

                <div className="blog-post__content-meta">
                  <span>{article.category}</span>
                  <i aria-hidden="true" />
                  <span>{formatDate(article.date)}</span>
                  <i aria-hidden="true" />
                  <span>{article.readingTime} de lectura</span>
                </div>
              </header>

              <div className="blog-post__sections">
                {article.sections.map((section, index) => (
                  <section
                    id={`section-${index + 1}`}
                    key={section.title}
                    className="blog-post__section"
                  >
                    <div className="blog-post__section-number">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div>
                      <h2>{section.title}</h2>

                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <aside
                className="article-cta"
                aria-labelledby="article-cta-title"
              >
                <div className="article-cta__content">
                  <span>ASESORAMIENTO PERSONAL</span>

                  <h2 id="article-cta-title">
                    Cada operación tiene
                    <br />
                    <em>sus propios matices.</em>
                  </h2>

                  <p>
                    Si necesitas aplicar estas ideas a una compra, venta,
                    alquiler, valoración o inversión concreta, cuéntanos tu
                    situación y la revisamos contigo.
                  </p>
                </div>

                <div className="article-cta__actions">
                  <Button to="/contacto" variant="light">
                    Hablar con Alvar
                  </Button>

                  <Button to="/servicios" variant="secondary">
                    Ver servicios
                  </Button>
                </div>
              </aside>

              <Link to="/blog" className="back-link">
                <span aria-hidden="true">←</span>
                Volver al cuaderno inmobiliario
              </Link>
            </div>
          </Container>
        </section>
      </article>
    </>
  );
}
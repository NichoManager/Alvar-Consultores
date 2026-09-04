import { Link } from 'react-router-dom';
import { SeoHead } from '../components/seo/SeoHead';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { articles } from '../data/articles';
import { formatDate } from '../utils/contact';

export function BlogPage() {
  return <><SeoHead title="Actualidad y guías inmobiliarias | Alvar Consultores" description="Guías sobre compra, venta, alquiler e inversión inmobiliaria en Madrid, Pinto, Móstoles y zona sur." path="/blog" noIndex /><InternalHero eyebrow="BLOG INMOBILIARIO" title={<>Criterio para<br /><em>decidir mejor.</em></>} text="Guías y contenidos sobre compraventa, alquiler, valoración, inversión y mercado inmobiliario." image="/images/alvar/heroes/hero-blog-inmobiliario.webp" aside={<span className="internal-hero__quote">Comprar · Vender · Invertir</span>} /><section className="blog-page section-pad"><Container><div className="magazine-grid">{articles.map((article,index) => <article className={index === 0 ? 'article-card article-card--featured' : 'article-card'} key={article.slug}><Link to={`/blog/${article.slug}`}><div className="article-card__visual"><span>{String(index + 1).padStart(2,'0')}</span><i /></div><div className="article-card__body"><p>{article.category} · {formatDate(article.date)}</p><h2>{article.title}</h2><span>{article.readingTime} de lectura</span><strong>Leer artículo ↗</strong></div></Link></article>)}</div></Container></section></>;
}

import { Navigate, Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/seo/Breadcrumbs';
import { JsonLd } from '../components/seo/JsonLd';
import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { getArticleBySlug } from '../data/articles';
import { formatDate } from '../utils/contact';

export function BlogPostPage() {
  const { slug = '' } = useParams();
  const article = getArticleBySlug(slug);
  if (!article) return <Navigate to="/blog" replace />;
  return <><SeoHead title={`${article.title} | Alvar Consultores`} description={article.excerpt} path={`/blog/${article.slug}`} type="article" noIndex /><JsonLd data={{ '@context':'https://schema.org','@type':'Article',headline:article.title,datePublished:article.date,description:article.excerpt,publisher:{'@type':'Organization',name:'Alvar Consultores Inmobiliarios'} }} /><article className="blog-post"><header><Container><Breadcrumbs items={[{label:'Inicio',to:'/'},{label:'Blog',to:'/blog'},{label:article.title}]} /><p className="eyebrow">{article.category}</p><h1>{article.title}</h1><div className="post-meta"><span>{formatDate(article.date)}</span><span>{article.readingTime} de lectura</span></div></Container></header><Container className="blog-post__layout"><aside><strong>En este artículo</strong>{article.sections.map((section,index) => <a key={section.title} href={`#section-${index + 1}`}>{String(index + 1).padStart(2,'0')} · {section.title}</a>)}</aside><div className="blog-post__content"><p className="lead-copy">{article.intro}</p>{article.sections.map((section,index) => <section id={`section-${index + 1}`} key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<div className="article-cta"><p>¿Necesitas aplicar estas ideas a una operación concreta?</p><Button to="/contacto">Hablar con un asesor</Button></div><Link to="/blog" className="back-link">← Volver al cuaderno inmobiliario</Link></div></Container></article></>;
}

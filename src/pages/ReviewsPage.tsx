import { ReviewCard } from '../components/home/ReviewCard';
import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { CTASection } from '../components/ui/CTASection';
import { InternalHero } from '../components/ui/InternalHero';
import { reviews } from '../data/reviews';

export function ReviewsPage() {
  return <><SeoHead title="Opiniones | Alvar Consultores Inmobiliarios" description="Síntesis de experiencias de clientes de Alvar Consultores Inmobiliarios y acceso al perfil externo de opiniones." path="/opiniones" /><InternalHero eyebrow="OPINIONES" title={<>Confianza en operaciones<br /><em>que importan.</em></>} text="La claridad, el seguimiento y el trato personal son parte esencial de cada operación." image="/images/alvar/heroes/hero-opiniones-clientes.webp" aside={<div className="big-stat"><strong>5,0</strong><span>Google · 12 reseñas</span></div>} /><section className="reviews-page section-pad"><Container><div className="demo-notice"><strong>Síntesis, no citas literales</strong><span>Los textos siguientes resumen experiencias facilitadas y no incluyen nombres inventados.</span></div><div className="review-grid review-grid--page">{reviews.map((review,index) => <ReviewCard key={review.source} review={review} index={index} />)}</div><div className="center-action"><Button to="/contacto" variant="secondary">Cuéntanos tu caso</Button></div></Container></section><CTASection /></>;
}

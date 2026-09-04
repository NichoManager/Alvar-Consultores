import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';

export function NotFoundPage() {
  return <><SeoHead title="Página no encontrada | Alvar Consultores" description="La página solicitada no está disponible." path="/404" noIndex /><InternalHero eyebrow="ERROR 404" title={<>Esta dirección no conduce<br /><em>a ninguna propiedad.</em></>} text="Puede que el enlace haya cambiado o ya no esté disponible." image="/images/alvar/heroes/hero-legal-alvar.webp" compact aside={<div className="big-stat"><strong>404</strong><span>Página no encontrada</span></div>} /><section className="not-found"><Container><p>Vuelve al inicio o explora nuestra selección de inmuebles.</p><Button to="/">Volver al inicio</Button></Container></section></>;
}

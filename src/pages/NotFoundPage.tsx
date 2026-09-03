import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';

export function NotFoundPage() {
  return <><SeoHead title="Página no encontrada | Alvar Consultores" description="La página solicitada no está disponible." path="/404" noIndex /><section className="not-found"><Container><span>404</span><h1>Esta dirección no conduce<br /><em>a ninguna propiedad.</em></h1><p>Puede que el enlace haya cambiado o ya no esté disponible.</p><Button to="/">Volver al inicio</Button></Container></section></>;
}

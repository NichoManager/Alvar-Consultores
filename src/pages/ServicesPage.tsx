import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { CTASection } from '../components/ui/CTASection';
import { InternalHero } from '../components/ui/InternalHero';

const services = [
  ['01','Compra','Definimos contigo las necesidades reales, filtramos oportunidades y revisamos cada decisión antes de avanzar.',['Selección y análisis','Negociación','Coordinación bancaria','Documentación y notaría']],
  ['02','Venta','Construimos una estrategia de comercialización coherente con el inmueble y el momento del mercado.',['Valoración profesional','Estrategia y reportaje','Gestión de visitas','Negociación y firma']],
  ['03','Alquiler','Acompañamos el proceso desde la valoración hasta la formalización del contrato.',['Posicionamiento','Búsqueda de inquilinos','Evaluación de solvencia','Contrato y formalización']],
  ['04','Consultoría','Analizamos situaciones que necesitan criterio inmobiliario, documental o de inversión.',['Inversiones y herencias','Documentación registral','Valoración de activos','Análisis de rentabilidad']],
] as const;

export function ServicesPage() {
  return <><SeoHead title="Servicios inmobiliarios en Madrid | Alvar Consultores" description="Asesoramiento para comprar, vender, alquilar e invertir en Madrid, Pinto, Móstoles y zona sur." path="/servicios" /><InternalHero eyebrow="SERVICIOS INMOBILIARIOS" title={<>Compra, venta y alquiler<br /><em>con una estrategia clara.</em></>} text="Acompañamos cada operación con valoración, análisis, negociación y coordinación documental." image="/images/alvar/heroes/hero-servicios-inmobiliarios.webp" aside={<span className="internal-hero__quote">“De la primera valoración a la firma.”</span>} /><section className="services-page section-pad"><Container>{services.map(([number,title,text,items]) => <article key={number} className="service-chapter"><span>{number}</span><div><h2>{title}</h2><p>{text}</p><Button to="/contacto" variant="text">Consultar este servicio</Button></div><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</Container></section><CTASection /></>;
}

import { ContactForm } from '../components/forms/ContactForm';
import { ValuationForm } from '../components/forms/ValuationForm';
import { Hero } from '../components/home/Hero';
import { QuickSearch } from '../components/home/QuickSearch';
import { ReviewCard } from '../components/home/ReviewCard';
import { TrustBar } from '../components/home/TrustBar';
import { PropertyGrid } from '../components/properties/PropertyGrid';
import { JsonLd } from '../components/seo/JsonLd';
import { SeoHead } from '../components/seo/SeoHead';
import { ArchitecturalVisual } from '../components/ui/ArchitecturalVisual';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { CTASection } from '../components/ui/CTASection';
import { LocationBlock } from '../components/ui/LocationBlock';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ServiceBlock } from '../components/ui/ServiceBlock';
import { business } from '../data/business';
import { properties } from '../data/properties';
import { reviews } from '../data/reviews';

const services = [
  ['01', 'Comprar', 'Búsqueda, análisis de mercado, negociación y acompañamiento hasta la firma.'],
  ['02', 'Vender', 'Valoración profesional, estrategia de comercialización, gestión de visitas y negociación.'],
  ['03', 'Alquilar', 'Selección de inquilinos, formalización del contrato y asesoramiento durante la operación.'],
  ['04', 'Consultoría', 'Trámites, inversión inmobiliaria, herencias, documentación y análisis de oportunidades.'],
];

export function HomePage() {
  return (
    <>
      <SeoHead title="Alvar Consultores Inmobiliarios | Inmobiliaria en Madrid" description="Compra, vende o alquila tu inmueble con Alvar Consultores Inmobiliarios. Más de 18 años de experiencia en Madrid, Pinto, Móstoles y Sur de Madrid." />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': ['RealEstateAgent', 'LocalBusiness'], name: business.name, address: { '@type': 'PostalAddress', streetAddress: 'Calle Ríos Rosas 42, Planta 1', postalCode: '28003', addressLocality: 'Madrid', addressCountry: 'ES' }, telephone: business.phoneOfficeHref, areaServed: business.areas }} />
      <Hero />
      <TrustBar />
      <QuickSearch />

      <section id="inmuebles-destacados" className="section-pad">
        <Container>
          <Reveal className="heading-row"><SectionHeading eyebrow="PROPIEDADES DESTACADAS" title={<>Inmuebles<br /><em>seleccionados</em></>} text="Una muestra demo de viviendas y oportunidades preparada para conectar el inventario real del equipo." /><Button to="/inmuebles" variant="text">Ver todos</Button></Reveal>
          <PropertyGrid properties={properties.filter((property) => property.featured)} />
        </Container>
      </section>

      <section className="about-home section-pad">
        <Container className="about-home__grid">
          <Reveal className="about-home__visual"><ArchitecturalVisual variant="facade" label="Espacio reservado para una fotografía real del responsable o equipo" /><span className="editorial-number">18</span></Reveal>
          <Reveal className="about-home__content"><SectionHeading eyebrow="ALVAR CONSULTORES" title={<>Experiencia inmobiliaria.<br /><em>Trato personal.</em></>} /><p>En Alvar Consultores Inmobiliarios entendemos que comprar o vender una propiedad no es una operación cualquiera. Por eso acompañamos a cada cliente desde la primera valoración hasta la firma final, cuidando la negociación, la documentación y cada decisión del proceso.</p><p>Más de 18 años de experiencia nos permiten combinar conocimiento del mercado con un servicio cercano, transparente y orientado a que cada operación resulte sencilla y segura.</p><div className="experience-signature"><strong>Más de 18 años</strong><span>asesorando operaciones inmobiliarias.</span></div><Button to="/nosotros" variant="secondary">Conoce nuestro enfoque</Button></Reveal>
        </Container>
      </section>

      <section id="servicios" className="services-home section-pad">
        <Container><Reveal><SectionHeading eyebrow="SERVICIOS" title={<>Todo lo que necesitas,<br /><em>en un mismo equipo.</em></>} /></Reveal><div className="services-list">{services.map(([number, title, text]) => <ServiceBlock key={number} number={number} title={title} text={text} />)}</div></Container>
      </section>

      <section className="seller-section section-pad">
        <Container className="seller-section__grid">
          <Reveal><SectionHeading inverse eyebrow="¿ESTÁS PENSANDO EN VENDER?" title={<>Descubre cuánto puede valer hoy <em>tu propiedad.</em></>} text="Realizamos una valoración profesional teniendo en cuenta ubicación, características, estado del inmueble y operaciones comparables de la zona." /><ul className="check-list"><li>Valoración personalizada</li><li>Estrategia de venta</li><li>Acompañamiento integral</li><li>Sin compromiso inicial</li></ul><div className="button-row"><Button to="/#valoracion" variant="light">Solicitar valoración</Button><a href={`tel:${business.phoneMobileHref}`} className="text-link text-link--light">{business.phoneMobile} ↗</a></div></Reveal>
          <Reveal><ArchitecturalVisual variant="courtyard" label="Composición arquitectónica provisional para captación de propietarios" /></Reveal>
        </Container>
      </section>

      <section id="valoracion" className="valuation-section section-pad">
        <Container className="valuation-section__grid"><Reveal><p className="eyebrow">VALORACIÓN PROFESIONAL</p><h2>Vender bien empieza por <em>valorar bien.</em></h2><p>Cuéntanos los datos básicos de tu inmueble. Esta versión demuestra el recorrido del formulario sin enviar información a servicios externos.</p><span className="section-index">02 / PROPIETARIOS</span></Reveal><Reveal><ValuationForm /></Reveal></Container>
      </section>

      <section id="proceso" className="process-section section-pad">
        <Container><Reveal><SectionHeading eyebrow="NUESTRO PROCESO" title={<>De la primera conversación<br /><em>a la firma.</em></>} /></Reveal><div className="timeline">{[['01','Valoramos','Analizamos tu situación, el inmueble y el mercado.'],['02','Planificamos','Definimos precio, estrategia y próximos pasos.'],['03','Gestionamos','Nos ocupamos de visitas, negociación y documentación.'],['04','Firmamos','Coordinamos todo hasta cerrar la operación.']].map(([n,t,p]) => <Reveal key={n} className="timeline__item"><span>{n}</span><h3>{t}</h3><p>{p}</p></Reveal>)}</div></Container>
      </section>

      <section id="zonas" className="areas-section section-pad">
        <Container className="areas-section__grid"><Reveal><SectionHeading eyebrow="CONOCIMIENTO LOCAL" title={<>Especialistas en Madrid<br />y <em>su zona sur.</em></>} text="Trabajamos con especial conocimiento de Madrid y municipios del sur, analizando cada zona desde una perspectiva residencial y de inversión." /><Button to="/contacto" variant="secondary">Cuéntanos qué zona buscas</Button></Reveal><div className="area-list">{[['Madrid','Capital'],['Pinto','Buenos Aires · Tenería'],['Móstoles','Sur · Este'],['Sur de Madrid','Zonas próximas']].map(([place, detail], index) => <Reveal className="area-list__item" key={place}><span>0{index + 1}</span><h3>{place}</h3><p>{detail}</p></Reveal>)}</div></Container>
      </section>

      <section className="investment-section section-pad"><Container className="investment-section__grid"><Reveal><p className="eyebrow">INVERSIÓN INMOBILIARIA</p><h2>Decisiones inmobiliarias<br /><em>con criterio.</em></h2></Reveal><Reveal><p className="investment-section__lead">Asesoramos a inversores que buscan activos con potencial de rentabilidad, alquiler o revalorización.</p><ul className="editorial-list"><li>Análisis de oportunidad</li><li>Rentabilidad estimada</li><li>Precio de mercado</li><li>Potencial de alquiler</li><li>Viviendas y locales</li><li>Terrenos y promoción</li></ul><Button to="/contacto" variant="light">Consultar una oportunidad</Button></Reveal></Container></section>

      <section id="opiniones" className="reviews-section section-pad"><Container><Reveal className="reviews-section__header"><div className="rating"><strong>5,0</strong><span>★★★★★</span><small>Google · 12 reseñas</small></div><SectionHeading eyebrow="OPINIONES" title={<>Clientes que confían en nosotros<br />para <em>decisiones importantes.</em></>} /></Reveal><p className="reviews-disclaimer">Opiniones de clientes · síntesis de experiencias, no citas literales verificadas</p><div className="review-grid">{reviews.map((review, index) => <ReviewCard key={review.source} review={review} index={index} />)}</div></Container></section>
      <CTASection />
      <LocationBlock />
      <section className="home-contact-form section-pad"><Container className="home-contact-form__grid"><SectionHeading eyebrow="CONTACTO" title={<>Cuéntanos tu<br /><em>próximo paso.</em></>} text="Compra, venta, alquiler o inversión. Déjanos tu consulta y prepararemos el canal de contacto adecuado." /><ContactForm /></Container></section>
    </>
  );
}

import { Navigate, useParams } from 'react-router-dom';
import { PropertyLeadForm } from '../components/forms/PropertyLeadForm';
import { PropertyGallery } from '../components/properties/PropertyGallery';
import { Breadcrumbs } from '../components/seo/Breadcrumbs';
import { JsonLd } from '../components/seo/JsonLd';
import { SeoHead } from '../components/seo/SeoHead';
import { Container } from '../components/ui/Container';
import { business } from '../data/business';
import { getPropertyBySlug } from '../data/properties';
import { whatsappUrl } from '../utils/contact';

export function PropertyDetailPage() {
  const { slug = '' } = useParams();
  const property = getPropertyBySlug(slug);
  if (!property) return <Navigate to="/inmuebles" replace />;
  const message = `Hola, estoy interesado/a en el inmueble ${property.title}. ¿Podéis darme más información?`;
  const breadcrumbs = [{ label: 'Inicio', to: '/' }, { label: 'Inmuebles', to: '/inmuebles' }, { label: property.title }];
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.to ? { item: `https://www.alvarconsultoresinmobiliarios.es${item.to}` } : {}),
    })),
  };
  return (
    <>
      <SeoHead title={`${property.title} en ${property.city} | Alvar Consultores`} description={property.description} path={`/inmuebles/${property.slug}`} noIndex={property.isDemo} />
      <JsonLd data={breadcrumbSchema} />
      <section className="property-detail-hero">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
          <div className="property-title-row">
            <div><p className="eyebrow">SELECCIÓN ORIENTATIVA · {property.area} · {property.city}</p><h1>{property.title}</h1></div>
            <div><span>{property.operation}</span><strong>{property.price ? `${property.price.toLocaleString('es-ES')} €` : 'Consultar precio'}</strong></div>
          </div>
          <PropertyGallery property={property} />
        </Container>
      </section>
      <section className="property-content section-pad">
        <Container className="property-content__grid">
          <article>
            <p className="eyebrow">LA PROPIEDAD</p>
            <h2>Una primera aproximación</h2>
            <p className="lead-copy">{property.description}</p>
            <h3>Características principales</h3>
            <ul className="feature-grid">{property.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <div className="map-placeholder map-placeholder--property" role="img" aria-label={`Referencia territorial de ${property.city}`}><span className="map-placeholder__road map-placeholder__road--one" /><span className="map-placeholder__road map-placeholder__road--two" /><span className="map-placeholder__pin">{property.city.charAt(0)}</span><p>{property.area} · {property.city}</p></div>
            <p className="demo-note">Selección orientativa. Disponibilidad y condiciones sujetas a confirmación.</p>
          </article>
          <aside><PropertyLeadForm propertyTitle={property.title} /><a className="aside-phone" href={`tel:${business.phoneMobileHref}`}>Llamar al {business.phoneMobile}</a><a className="aside-whatsapp" href={whatsappUrl(business.phoneMobileHref, message)} target="_blank" rel="noreferrer">Consultar por WhatsApp ↗</a></aside>
        </Container>
      </section>
      <div className="mobile-property-cta"><a href={`tel:${business.phoneMobileHref}`}>Llamar</a><a href={whatsappUrl(business.phoneMobileHref, message)} target="_blank" rel="noreferrer">Solicitar información</a></div>
    </>
  );
}

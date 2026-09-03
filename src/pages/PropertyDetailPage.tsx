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
  return <><SeoHead title={`${property.title} en ${property.city} | Alvar Consultores`} description={`${property.description} Contenido demo pendiente de inventario real.`} path={`/inmuebles/${property.slug}`} /><JsonLd data={{ '@context': 'https://schema.org', '@type': 'Product', name: property.title, description: property.description, category: property.propertyType }} /><section className="property-detail-hero"><Container><Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Inmuebles', to: '/inmuebles' }, { label: property.title }]} /><div className="property-title-row"><div><p className="eyebrow">CONTENIDO DEMO · {property.area} · {property.city}</p><h1>{property.title}</h1></div><div><span>{property.operation}</span><strong>{property.price ? `${property.price.toLocaleString('es-ES')} €` : 'Consultar precio'}</strong></div></div><PropertyGallery property={property} /></Container></section><section className="property-content section-pad"><Container className="property-content__grid"><article><p className="eyebrow">LA PROPIEDAD</p><h2>Información de demostración</h2><p className="lead-copy">{property.description}</p><h3>Características incluidas en la demo</h3><ul className="feature-grid">{property.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><div className="map-placeholder map-placeholder--property"><span className="map-placeholder__road map-placeholder__road--one" /><span className="map-placeholder__road map-placeholder__road--two" /><span className="map-placeholder__pin">{property.city.charAt(0)}</span><p>Ubicación aproximada · mapa pendiente</p></div><p className="demo-note">Esta ficha no afirma disponibilidad, precio, superficie ni características distintas de los datos demo facilitados.</p></article><aside><PropertyLeadForm propertyTitle={property.title} /><a className="aside-phone" href={`tel:${business.phoneMobileHref}`}>Llamar al {business.phoneMobile}</a><a className="aside-whatsapp" href={whatsappUrl(business.phoneMobileHref, message)} target="_blank" rel="noreferrer">Consultar por WhatsApp ↗</a></aside></Container></section><div className="mobile-property-cta"><a href={`tel:${business.phoneMobileHref}`}>Llamar</a><a href={whatsappUrl(business.phoneMobileHref, message)} target="_blank" rel="noreferrer">Solicitar información</a></div></>;
}

import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PropertyLeadForm } from '../components/forms/PropertyLeadForm';
import { PropertyGallery } from '../components/properties/PropertyGallery';
import { PropertyFloorplans } from '../components/properties/PropertyFloorplans';
import { Breadcrumbs } from '../components/seo/Breadcrumbs';
import { JsonLd } from '../components/seo/JsonLd';
import { SeoHead } from '../components/seo/SeoHead';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { business } from '../data/business';
import { getPublishedPropertyBySlug } from '../lib/properties';
import type { Property } from '../types/content';
import { whatsappUrl } from '../utils/contact';
import '../styles/property-details.css';

function isRentalOperation(value: string) {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  return ['alquiler', 'alquilar', 'renta', 'arrendamiento', 'en alquiler'].includes(normalized);
}

function getSeoDescription(description: string) {
  if (description.length <= 160) {
    return description;
  }

  return `${description.slice(0, 157).trimEnd()}...`;
}

export function PropertyDetailPage() {
  const { slug = '' } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProperty = async () => {
      setIsLoading(true);
      setLoadError(false);

      try {
        const publishedProperty = await getPublishedPropertyBySlug(slug);

        if (isMounted) {
          setProperty(publishedProperty);
        }
      } catch (error) {
        console.error('Error loading public property:', error);

        if (isMounted) {
          setProperty(null);
          setLoadError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProperty();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <main className="section-pad">
        <Container>
          <div className="empty-state" role="status">
            <p>Cargando inmueble...</p>
            <span>Estamos preparando todos los detalles de la propiedad.</span>
          </div>
        </Container>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="section-pad">
        <Container>
          <div className="empty-state" role="alert">
            <p>No hemos podido cargar el inmueble.</p>
            <span>
              Inténtalo de nuevo en unos minutos o contacta con nosotros para
              ampliar información.
            </span>
          </div>
        </Container>
      </main>
    );
  }

  if (!property) {
    return <Navigate to="/inmuebles?operation=venta" replace />;
  }

  const isRent = isRentalOperation(property.operation);
  const operationLabel = isRent ? 'Alquilar' : 'Comprar';
  const operationTo = isRent
    ? '/inmuebles?operation=alquiler'
    : '/inmuebles?operation=venta';

  const formattedPrice = property.price
    ? `${property.price.toLocaleString('es-ES')} €`
    : 'Consultar precio';

  const locationLabel = [property.area, property.city]
    .filter(Boolean)
    .join(' · ');

  const isReserved = property.status === 'Reservado';
  const mapLocation =
    property.mapLocation ||
    [property.area, property.city, property.province]
      .filter(Boolean)
    .join(', ');
  const detailCharacteristics = property.characteristics ?? property.features;
  const detailEquipment = property.equipment ?? [];
  const encodedMapLocation = encodeURIComponent(mapLocation);
  const googleMapsEmbedUrl = `https://www.google.com/maps?q=${encodedMapLocation}&output=embed`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedMapLocation}`;

  const message = isReserved
    ? `Hola, he visto el inmueble reservado ${property.title}. ¿Podéis informarme sobre inmuebles similares?`
    : `Hola, estoy interesado/a en el inmueble ${property.title}. ¿Podéis darme más información?`;

  const breadcrumbs = [
    { label: 'Inicio', to: '/' },
    { label: operationLabel, to: operationTo },
    { label: property.title },
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

  return (
    <>
      <SeoHead
        title={`${property.title} en ${property.city} | Alvar Consultores`}
        description={getSeoDescription(property.description)}
        path={`/inmuebles/${property.slug}`}
        image={property.coverImage?.url}
      />

      <JsonLd data={breadcrumbSchema} />

      <InternalHero
        eyebrow={`${property.operation.toUpperCase()} · ${locationLabel}`}
        title={property.title}
        text={property.description}
        image={
          property.coverImage?.url ??
          '/images/alvar/heroes/hero-inmuebles-madrid.webp'
        }
        meta={<Breadcrumbs items={breadcrumbs} />}
        aside={
          <div className="property-hero__summary">
            <span>{property.operation}</span>
            {isReserved ? (
              <span className="property-status-badge">Reservado</span>
            ) : null}
            <strong>{formattedPrice}</strong>
            <small>{locationLabel}</small>
          </div>
        }
      />

      <section
        className="property-detail-gallery"
        aria-label={`Galería de ${property.title}`}
      >
        <Container>
          <div className="property-detail-gallery__heading">
            <div>
              <span>GALERÍA</span>
              <p>Descubre los espacios y detalles de la propiedad.</p>
            </div>

            <small>
              {locationLabel}
            </small>
          </div>

          <PropertyGallery property={property} />
        </Container>
      </section>

      <PropertyFloorplans
        floorplans={property.floorplans ?? []}
        propertyTitle={property.title}
      />

      <section
        className="property-content section-pad"
        aria-labelledby="property-content-title"
      >
        <Container>
          <header className="property-content__intro">
            <div>
              <p className="eyebrow">LA PROPIEDAD</p>

              <h2 id="property-content-title">
                Una propiedad para
                <br />
                <em>valorar con calma.</em>
              </h2>
            </div>

            <div className="property-content__intro-meta">
              <span>{property.operation}</span>
              <strong>{formattedPrice}</strong>
              <p>
                {locationLabel}
              </p>
            </div>
          </header>

          <div className="property-content__grid">
            <article className="property-content__main">
              <div className="property-description">
                <span>01</span>

                <div>
                  <p className="property-description__label">
                    DESCRIPCIÓN
                  </p>

                  <p className="lead-copy">
                    {property.description}
                  </p>
                </div>
              </div>

              {detailCharacteristics.length || detailEquipment.length ? <section
                className="property-features"
                aria-labelledby="property-features-title"
              >
                <div className="property-features__heading">
                  <span>02</span>

                  <div>
                    <p>DETALLES</p>
                    <h3 id="property-features-title">
                      Características principales
                    </h3>
                  </div>
                </div>

                <div className="property-feature-groups">
                  {detailCharacteristics.length ? (
                    <div><h4>Características</h4><ul className="feature-grid">{detailCharacteristics.map((feature, index) => <li key={feature}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{feature}</li>)}</ul></div>
                  ) : null}
                  {detailEquipment.length ? (
                    <div><h4>Equipamiento</h4><ul className="feature-grid">{detailEquipment.map((feature, index) => <li key={feature}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{feature}</li>)}</ul></div>
                  ) : null}
                </div>
              </section> : null}

              <section
                className="property-location"
                aria-labelledby="property-location-title"
              >
                <div className="property-location__heading">
                  <span>03</span>

                  <div>
                    <p>UBICACIÓN</p>
                    <h3 id="property-location-title">
                      {locationLabel}
                    </h3>
                  </div>
                </div>

                <div className="property-map">
                  <iframe
                    src={googleMapsEmbedUrl}
                    title={`Mapa de la zona de ${property.city}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>

                <a
                  className="property-map__link"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver en Google Maps <span aria-hidden="true">↗</span>
                </a>
              </section>
            </article>

            <aside className="property-contact">
              <div className="property-contact__heading">
                <span>INFORMACIÓN Y VISITAS</span>

                <h2>
                  {isReserved
                    ? '¿Buscas un inmueble similar?'
                    : '¿Te interesa esta propiedad?'}
                </h2>

                <p>
                  {isReserved
                    ? 'Este inmueble está reservado. Déjanos tus datos y te ayudaremos a encontrar alternativas similares.'
                    : 'Déjanos tus datos y te contactamos para ampliar información, resolver dudas o coordinar una visita.'}
                </p>
              </div>

              <PropertyLeadForm
                propertyId={property.id}
                propertyTitle={property.title}
                operation={property.operation}
              />

              <div className="property-contact__direct">
                <a
                  className="aside-phone"
                  href={`tel:${business.phoneMobileHref}`}
                  aria-label={`Llamar a Alvar Consultores en el ${business.phoneMobile}`}
                >
                  <span>Contacto directo</span>
                  <strong>{business.phoneMobile}</strong>
                </a>

                <a
                  className="aside-whatsapp"
                  href={whatsappUrl(business.phoneMobileHref, message)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Consultar por WhatsApp</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>

              <small className="property-contact__note">
                {isReserved
                  ? 'Te atenderemos personalmente para conocer qué buscas y proponerte otras oportunidades.'
                  : 'Te atenderemos personalmente para confirmar disponibilidad y condiciones de la propiedad.'}
              </small>
            </aside>
          </div>
        </Container>
      </section>

      <div
        className="mobile-property-cta"
        aria-label="Contacto sobre esta propiedad"
      >
        <a href={`tel:${business.phoneMobileHref}`}>
          Llamar
        </a>

        <a
          href={whatsappUrl(business.phoneMobileHref, message)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {isReserved ? 'Consultar inmuebles similares' : 'Solicitar información'}
        </a>
      </div>
    </>
  );
}

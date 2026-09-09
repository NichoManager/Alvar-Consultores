import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PropertyLeadForm } from '../components/forms/PropertyLeadForm';
import { PropertyGallery } from '../components/properties/PropertyGallery';
import { Breadcrumbs } from '../components/seo/Breadcrumbs';
import { JsonLd } from '../components/seo/JsonLd';
import { SeoHead } from '../components/seo/SeoHead';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { business } from '../data/business';
import { getPublishedPropertyBySlug } from '../lib/properties';
import type { Property } from '../types/content';
import { whatsappUrl } from '../utils/contact';

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

  const message = `Hola, estoy interesado/a en el inmueble ${property.title}. ¿Podéis darme más información?`;

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
            <strong>{formattedPrice}</strong>
            <small>{property.area} · {property.city}</small>
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
              {property.area} · {property.city}
            </small>
          </div>

          <PropertyGallery property={property} />
        </Container>
      </section>

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
                {property.area} · {property.city}
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

              <section
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

                <ul className="feature-grid">
                  {property.features.map((feature, index) => (
                    <li key={feature}>
                      <span aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      {feature}
                    </li>
                  ))}
                </ul>
              </section>

              <section
                className="property-location"
                aria-labelledby="property-location-title"
              >
                <div className="property-location__heading">
                  <span>03</span>

                  <div>
                    <p>UBICACIÓN</p>
                    <h3 id="property-location-title">
                      {property.area} · {property.city}
                    </h3>
                  </div>
                </div>

                <div
                  className="map-placeholder map-placeholder--property"
                  role="img"
                  aria-label={`Referencia territorial de ${property.city}`}
                >
                  <span className="map-placeholder__road map-placeholder__road--one" />
                  <span className="map-placeholder__road map-placeholder__road--two" />

                  <span className="map-placeholder__pin">
                    {property.city.charAt(0)}
                  </span>

                  <div className="map-placeholder__property-caption">
                    <span>ZONA</span>
                    <p>
                      {property.area} · {property.city}
                    </p>
                  </div>
                </div>

                <p className="demo-note">
                  La ubicación mostrada es una referencia territorial.
                  Disponibilidad y condiciones sujetas a confirmación.
                </p>
              </section>
            </article>

            <aside className="property-contact">
              <div className="property-contact__heading">
                <span>INFORMACIÓN Y VISITAS</span>

                <h2>¿Te interesa esta propiedad?</h2>

                <p>
                  Déjanos tus datos y te contactamos para ampliar información,
                  resolver dudas o coordinar una visita.
                </p>
              </div>

              <PropertyLeadForm propertyTitle={property.title} />

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
                Te atenderemos personalmente para confirmar disponibilidad y
                condiciones de la propiedad.
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
          Solicitar información
        </a>
      </div>
    </>
  );
}

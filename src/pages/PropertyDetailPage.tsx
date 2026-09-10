import {
  useEffect,
  useState,
} from 'react';
import {
  Navigate,
  useParams,
} from 'react-router-dom';
import { PropertyLeadForm } from '../components/forms/PropertyLeadForm';
import { PropertyFloorplans } from '../components/properties/PropertyFloorplans';
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
import '../styles/property-details.css';

const SITE_URL = (
  import.meta.env.VITE_SITE_URL ??
  'https://www.alvarconsultoresinmobiliarios.es'
).replace(/\/$/, '');

function isRentalOperation(
  value: string,
) {
  const normalized = value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .trim()
    .toLowerCase();

  return [
    'alquiler',
    'alquilar',
    'renta',
    'arrendamiento',
    'en alquiler',
  ].includes(normalized);
}

function normalizeText(
  value: string,
) {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .trim()
    .toLowerCase();
}

function getUniqueLocationParts(
  values: Array<
    string | null | undefined
  >,
) {
  const seen = new Set<string>();

  return values.filter(
    (
      value,
    ): value is string => {
      if (!value?.trim()) {
        return false;
      }

      const normalized =
        normalizeText(value);

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);

      return true;
    },
  );
}

function getAutomaticSeoTitle(
  title: string,
  city?: string | null,
  province?: string | null,
) {
  const locationParts =
    getUniqueLocationParts([
      city,
      province,
    ]);

  const titleNormalized =
    normalizeText(title);

  const alreadyContainsLocation =
    locationParts.some((location) =>
      titleNormalized.includes(
        normalizeText(location),
      ),
    );

  const location =
    locationParts.join(', ');

  const baseTitle =
    location &&
    !alreadyContainsLocation
      ? `${title} en ${location}`
      : title;

  return `${baseTitle} | Alvar Consultores`;
}

function limitMetaDescription(
  value: string,
) {
  const cleanValue = value
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanValue.length <= 160) {
    return cleanValue;
  }

  return `${cleanValue
    .slice(0, 157)
    .trimEnd()}...`;
}

function getAutomaticSeoDescription(
  title: string,
  description: string,
  location: string,
) {
  const normalizedDescription =
    normalizeText(description);

  const normalizedLocation =
    normalizeText(location);

  const alreadyContainsLocation =
    Boolean(
      normalizedLocation &&
        normalizedDescription.includes(
          normalizedLocation,
        ),
    );

  const intro =
    location &&
    !alreadyContainsLocation
      ? `${title} en ${location}. `
      : `${title}. `;

  return limitMetaDescription(
    `${intro}${description}`,
  );
}

function toAbsoluteUrl(
  url: string,
) {
  if (
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  return `${SITE_URL}${
    url.startsWith('/')
      ? url
      : `/${url}`
  }`;
}

function formatMoney(
  value: number,
) {
  return `${value.toLocaleString(
    'es-ES',
    {
      maximumFractionDigits: 2,
    },
  )} €`;
}

const communityPeriodLabels = {
  monthly: 'mes',
  quarterly: 'trimestre',
  annual: 'año',
} as const;

export function PropertyDetailPage() {
  const { slug = '' } =
    useParams();

  const [
    property,
    setProperty,
  ] = useState<Property | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProperty =
      async () => {
        setIsLoading(true);
        setLoadError(false);

        try {
          const publishedProperty =
            await getPublishedPropertyBySlug(
              slug,
            );

          if (isMounted) {
            setProperty(
              publishedProperty,
            );
          }
        } catch (error) {
          console.error(
            'Error loading public property:',
            error,
          );

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
          <div
            className="empty-state"
            role="status"
          >
            <p>
              Cargando inmueble...
            </p>

            <span>
              Estamos preparando todos
              los detalles de la
              propiedad.
            </span>
          </div>
        </Container>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="section-pad">
        <Container>
          <div
            className="empty-state"
            role="alert"
          >
            <p>
              No hemos podido cargar el
              inmueble.
            </p>

            <span>
              Inténtalo de nuevo en unos
              minutos o contacta con
              nosotros para ampliar
              información.
            </span>
          </div>
        </Container>
      </main>
    );
  }

  if (!property) {
    return (
      <Navigate
        to="/inmuebles"
        replace
      />
    );
  }

  const isRent =
    isRentalOperation(
      property.operation,
    );

  const operationLabel =
    isRent
      ? 'Alquilar'
      : 'Comprar';

  const operationTo =
    isRent
      ? '/inmuebles?operation=alquiler'
      : '/inmuebles?operation=venta';

  const formattedPrice =
    property.price
      ? `${property.price.toLocaleString(
          'es-ES',
        )} €`
      : 'Consultar precio';

  const locationParts =
    getUniqueLocationParts([
      property.area,
      property.city,
      property.province,
    ]);

  const locationLabel =
    locationParts.join(' · ');

  const seoLocationParts =
    getUniqueLocationParts([
      property.city,
      property.province,
    ]);

  const seoLocationLabel =
    seoLocationParts.join(', ');

  const automaticSeoTitle =
    getAutomaticSeoTitle(
      property.title,
      property.city,
      property.province,
    );

  const automaticSeoDescription =
    getAutomaticSeoDescription(
      property.title,
      property.description,
      seoLocationLabel,
    );

  const seoTitle =
    property.seoTitle?.trim() ||
    automaticSeoTitle;

  const seoDescription =
    property.seoDescription?.trim()
      ? limitMetaDescription(
          property.seoDescription,
        )
      : automaticSeoDescription;

  const propertyUrl =
    `${SITE_URL}/inmuebles/${property.slug}`;

  const coverImageUrl =
    property.coverImage?.url
      ? toAbsoluteUrl(
          property.coverImage.url,
        )
      : undefined;

  const automaticImageAlt =
    seoLocationLabel
      ? `${property.title} en ${seoLocationLabel}`
      : property.title;

  const imageAlt =
    property.coverImage?.alt?.trim() ||
    automaticImageAlt;

  const isReserved =
    property.status === 'Reservado';

  const mapLocation =
    property.mapLocation ||
    getUniqueLocationParts([
      property.area,
      property.city,
      property.province,
    ]).join(', ');

  const detailCharacteristics =
    property.characteristics ??
    property.features;

  const detailEquipment =
    property.equipment ?? [];

  const hasCosts =
    property.communityFeeAmount !==
      undefined ||
    property.ibiAnnualAmount !==
      undefined;

  const hasEnergyData =
    Boolean(
      property.energyCertificateStatus ||
        property.energyConsumptionRating ||
        property.energyConsumptionValue !==
          undefined ||
        property.energyEmissionsRating ||
        property.energyEmissionsValue !==
          undefined,
    );

  const encodedMapLocation =
    encodeURIComponent(
      mapLocation,
    );

  const googleMapsEmbedUrl =
    `https://www.google.com/maps?q=${encodedMapLocation}&output=embed`;

  const googleMapsUrl =
    `https://www.google.com/maps/search/?api=1&query=${encodedMapLocation}`;

  const message = isReserved
    ? `Hola, he visto el inmueble reservado ${property.title}. ¿Podéis informarme sobre inmuebles similares?`
    : `Hola, estoy interesado/a en el inmueble ${property.title}. ¿Podéis darme más información?`;

  const breadcrumbs = [
    {
      label: 'Inicio',
      to: '/',
    },
    {
      label: operationLabel,
      to: operationTo,
    },
    {
      label: property.title,
    },
  ];

  const breadcrumbSchema = {
    '@context':
      'https://schema.org',
    '@type':
      'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Inmuebles',
        item: `${SITE_URL}/inmuebles`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: property.title,
        item: propertyUrl,
      },
    ],
  };

  const listingSchema = {
    '@context':
      'https://schema.org',
    '@type':
      'RealEstateListing',
    name: property.title,
    description:
      seoDescription,
    url: propertyUrl,
    inLanguage: 'es-ES',
    publisher: {
      '@type':
        'RealEstateAgent',
      name: business.name,
      telephone:
        business.phoneMobileHref,
      url: SITE_URL,
    },
    contentLocation: {
      '@type': 'Place',
      name:
        locationLabel ||
        seoLocationLabel ||
        property.city,
      address: {
        '@type':
          'PostalAddress',
        addressLocality:
          property.city,
        addressRegion:
          property.province,
        addressCountry: 'ES',
      },
    },
    ...(coverImageUrl
      ? {
          primaryImageOfPage: {
            '@type':
              'ImageObject',
            url: coverImageUrl,
          },
        }
      : {}),
    ...(property.price
      ? {
          offers: {
            '@type': 'Offer',
            price:
              property.price,
            priceCurrency:
              property.currency ||
              'EUR',
            url: propertyUrl,
            businessFunction:
              isRent
                ? 'http://purl.org/goodrelations/v1#LeaseOut'
                : 'http://purl.org/goodrelations/v1#Sell',
            offeredBy: {
              '@type':
                'RealEstateAgent',
              name:
                business.name,
              telephone:
                business.phoneMobileHref,
            },
          },
        }
      : {}),
  };

  return (
    <>
      <SeoHead
        title={seoTitle}
        description={
          seoDescription
        }
        path={`/inmuebles/${property.slug}`}
        image={
          property.coverImage
            ?.url
        }
        imageAlt={imageAlt}
      />

      <JsonLd
        data={
          breadcrumbSchema
        }
      />

      <JsonLd
        data={
          listingSchema
        }
      />

      <InternalHero
        eyebrow={`${property.operation.toUpperCase()} · ${locationLabel}`}
        title={property.title}
        text={
          property.description
        }
        image={
          property.coverImage
            ?.url ??
          '/images/alvar/heroes/hero-inmuebles-madrid.webp'
        }
        meta={
          <Breadcrumbs
            items={
              breadcrumbs
            }
          />
        }
        aside={
          <div className="property-hero__summary">
            <span>
              {property.operation}
            </span>

            {isReserved ? (
              <span className="property-status-badge">
                Reservado
              </span>
            ) : null}

            <strong>
              {formattedPrice}
            </strong>

            <small>
              {locationLabel}
            </small>
          </div>
        }
      />

      <section
        id="property-photos"
        className="property-detail-gallery"
        aria-label={`Galería de ${property.title}`}
      >
        <Container>
          <div className="property-detail-gallery__heading">
            <div>
              <span>
                GALERÍA
              </span>

              <p>
                Descubre los espacios y
                detalles de la
                propiedad.
              </p>
            </div>

            <small>
              {locationLabel}
            </small>
          </div>

          <nav
            className="property-media-nav"
            aria-label="Contenido multimedia del inmueble"
          >
            <a href="#property-photos">
              Fotos
            </a>

            {property.videoUrl ? (
              <a
                href={
                  property.videoUrl
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Vídeo{' '}

                <span aria-hidden="true">
                  ↗
                </span>
              </a>
            ) : null}

            {property.virtualTourUrl ? (
              <a
                href={
                  property.virtualTourUrl
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Visita virtual{' '}

                <span aria-hidden="true">
                  ↗
                </span>
              </a>
            ) : null}

            {(property.floorplans ?? [])
              .length ? (
              <a href="#property-floorplans">
                Planos
              </a>
            ) : null}

            <a href="#property-location">
              Mapa
            </a>
          </nav>

          <PropertyGallery
            property={property}
          />
        </Container>
      </section>

      <PropertyFloorplans
        floorplans={
          property.floorplans ??
          []
        }
        propertyTitle={
          property.title
        }
      />

      <section
        className="property-content section-pad"
        aria-labelledby="property-content-title"
      >
        <Container>
          <header className="property-content__intro">
            <div>
              <p className="eyebrow">
                LA PROPIEDAD
              </p>

              <h2 id="property-content-title">
                Una propiedad para
                <br />

                <em>
                  valorar con calma.
                </em>
              </h2>
            </div>

            <div className="property-content__intro-meta">
              <span>
                {property.operation}
              </span>

              <strong>
                {formattedPrice}
              </strong>

              <p>
                {locationLabel}
              </p>
            </div>
          </header>

          <div className="property-content__grid">
            <article className="property-content__main">
              <div className="property-description">
                <span>
                  01
                </span>

                <div>
                  <p className="property-description__label">
                    DESCRIPCIÓN
                  </p>

                  <p className="lead-copy">
                    {
                      property.description
                    }
                  </p>
                </div>
              </div>

              {detailCharacteristics.length ||
              detailEquipment.length ? (
                <section
                  className="property-features"
                  aria-labelledby="property-features-title"
                >
                  <div className="property-features__heading">
                    <span>
                      02
                    </span>

                    <div>
                      <p>
                        DETALLES
                      </p>

                      <h3 id="property-features-title">
                        Características
                        principales
                      </h3>
                    </div>
                  </div>

                  <div className="property-feature-groups">
                    {detailCharacteristics.length ? (
                      <div>
                        <h4>
                          Características
                        </h4>

                        <ul className="feature-grid">
                          {detailCharacteristics.map(
                            (
                              feature,
                              index,
                            ) => (
                              <li
                                key={
                                  feature
                                }
                              >
                                <span
                                  aria-hidden="true"
                                >
                                  {String(
                                    index +
                                      1,
                                  ).padStart(
                                    2,
                                    '0',
                                  )}
                                </span>

                                {
                                  feature
                                }
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    ) : null}

                    {detailEquipment.length ? (
                      <div>
                        <h4>
                          Equipamiento
                        </h4>

                        <ul className="feature-grid">
                          {detailEquipment.map(
                            (
                              feature,
                              index,
                            ) => (
                              <li
                                key={
                                  feature
                                }
                              >
                                <span
                                  aria-hidden="true"
                                >
                                  {String(
                                    index +
                                      1,
                                  ).padStart(
                                    2,
                                    '0',
                                  )}
                                </span>

                                {
                                  feature
                                }
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {hasCosts ||
              hasEnergyData ? (
                <div className="property-additional-details">
                  {hasCosts ? (
                    <section aria-labelledby="property-costs-title">
                      <p>
                        GASTOS DEL
                        INMUEBLE
                      </p>

                      <h3 id="property-costs-title">
                        Gastos recurrentes
                      </h3>

                      <dl>
                        {property.communityFeeAmount !==
                        undefined ? (
                          <div>
                            <dt>
                              Comunidad
                            </dt>

                            <dd>
                              {formatMoney(
                                property.communityFeeAmount,
                              )}

                              {property.communityFeePeriod
                                ? `/${communityPeriodLabels[property.communityFeePeriod]}`
                                : ''}
                            </dd>
                          </div>
                        ) : null}

                        {property.ibiAnnualAmount !==
                        undefined ? (
                          <div>
                            <dt>
                              IBI
                            </dt>

                            <dd>
                              {formatMoney(
                                property.ibiAnnualAmount,
                              )}
                              /año
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </section>
                  ) : null}

                  {hasEnergyData ? (
                    <section aria-labelledby="property-energy-title">
                      <p>
                        EFICIENCIA
                        ENERGÉTICA
                      </p>

                      <h3 id="property-energy-title">
                        Certificado
                        energético
                      </h3>

                      {property.energyCertificateStatus ===
                      'pending' ? (
                        <p className="property-additional-details__notice">
                          Certificado
                          energético
                          pendiente.
                        </p>
                      ) : null}

                      {property.energyCertificateStatus ===
                      'exempt' ? (
                        <p className="property-additional-details__notice">
                          Inmueble exento de
                          certificado
                          energético.
                        </p>
                      ) : null}

                      {property.energyCertificateStatus !==
                        'pending' &&
                      property.energyCertificateStatus !==
                        'exempt' ? (
                        property.energyConsumptionRating ||
                        property.energyConsumptionValue !==
                          undefined ||
                        property.energyEmissionsRating ||
                        property.energyEmissionsValue !==
                          undefined ? (
                          <dl>
                            {property.energyConsumptionRating ||
                            property.energyConsumptionValue !==
                              undefined ? (
                              <div>
                                <dt>
                                  Consumo
                                </dt>

                                <dd>
                                  {[
                                    property.energyConsumptionRating,
                                    property.energyConsumptionValue !==
                                    undefined
                                      ? `${property.energyConsumptionValue.toLocaleString(
                                          'es-ES',
                                        )} kWh/m²/año`
                                      : null,
                                  ]
                                    .filter(
                                      Boolean,
                                    )
                                    .join(
                                      ' · ',
                                    )}
                                </dd>
                              </div>
                            ) : null}

                            {property.energyEmissionsRating ||
                            property.energyEmissionsValue !==
                              undefined ? (
                              <div>
                                <dt>
                                  Emisiones
                                </dt>

                                <dd>
                                  {[
                                    property.energyEmissionsRating,
                                    property.energyEmissionsValue !==
                                    undefined
                                      ? `${property.energyEmissionsValue.toLocaleString(
                                          'es-ES',
                                        )} kg CO₂/m²/año`
                                      : null,
                                  ]
                                    .filter(
                                      Boolean,
                                    )
                                    .join(
                                      ' · ',
                                    )}
                                </dd>
                              </div>
                            ) : null}
                          </dl>
                        ) : (
                          <p className="property-additional-details__notice">
                            Certificado
                            energético
                            disponible.
                          </p>
                        )
                      ) : null}
                    </section>
                  ) : null}
                </div>
              ) : null}

              <section
                id="property-location"
                className="property-location"
                aria-labelledby="property-location-title"
              >
                <div className="property-location__heading">
                  <span>
                    03
                  </span>

                  <div>
                    <p>
                      UBICACIÓN
                    </p>

                    <h3 id="property-location-title">
                      {locationLabel}
                    </h3>
                  </div>
                </div>

                <div className="property-map">
                  <iframe
                    src={
                      googleMapsEmbedUrl
                    }
                    title={`Mapa de la zona de ${property.city}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>

                <a
                  className="property-map__link"
                  href={
                    googleMapsUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver en Google Maps{' '}

                  <span aria-hidden="true">
                    ↗
                  </span>
                </a>
              </section>
            </article>

            <aside className="property-contact">
              <div className="property-contact__heading">
                <span>
                  INFORMACIÓN Y VISITAS
                </span>

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
                propertyId={
                  property.id
                }
                propertyTitle={
                  property.title
                }
                operation={
                  property.operation
                }
              />

              <div className="property-contact__direct">
                <a
                  className="aside-phone"
                  href={`tel:${business.phoneMobileHref}`}
                  aria-label={`Llamar a Alvar Consultores en el ${business.phoneMobile}`}
                >
                  <span>
                    Contacto directo
                  </span>

                  <strong>
                    {
                      business.phoneMobile
                    }
                  </strong>
                </a>

                <a
                  className="aside-whatsapp"
                  href={whatsappUrl(
                    business.phoneMobileHref,
                    message,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    Consultar por
                    WhatsApp
                  </span>

                  <span aria-hidden="true">
                    ↗
                  </span>
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
        <a
          href={`tel:${business.phoneMobileHref}`}
        >
          Llamar
        </a>

        <a
          href={whatsappUrl(
            business.phoneMobileHref,
            message,
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          {isReserved
            ? 'Consultar inmuebles similares'
            : 'Solicitar información'}
        </a>
      </div>
    </>
  );
}
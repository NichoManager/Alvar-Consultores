import { Link } from 'react-router-dom';
import type { Property } from '../../types/content';
import { ArchitecturalVisual } from '../ui/ArchitecturalVisual';

export function PropertyCard({
  property,
  index = 0,
}: {
  property: Property;
  index?: number;
}) {
  const normalizedOperation =
    property.operation
      .trim()
      .toLowerCase();

  const isRental =
    normalizedOperation === 'alquilar' ||
    normalizedOperation === 'alquiler';

  const operation = isRental
    ? 'En alquiler'
    : 'En venta';

  const formattedPrice = property.price
    ? `${property.price.toLocaleString(
      'es-ES',
    )} €${isRental ? '/mes' : ''}`
    : 'Consultar precio';

  const featuredNumber = String(
    index + 1,
  ).padStart(2, '0');

  const visibleFeatures =
    property.features.slice(0, 3);

  const location = [
    property.area,
    property.city,
  ]
    .filter(Boolean)
    .join(' · ');

  const isReserved =
    property.status === 'Reservado';

  const isSold =
    property.status === 'Vendido';

  const isRented =
    property.status === 'Alquilado';

  const hasCommercialStatus =
    isReserved ||
    isSold ||
    isRented;

  const badgeLabel = isReserved
    ? 'Reservado'
    : isSold
      ? 'Vendido'
      : isRented
        ? 'Alquilado'
        : operation;

  const badgeModifier = isReserved
    ? ' property-card__badge--status property-card__badge--reserved'
    : isSold
      ? ' property-card__badge--status property-card__badge--sold'
      : isRented
        ? ' property-card__badge--status property-card__badge--rented'
        : '';

  return (
    <article className="property-card">
      <Link
        to={`/inmuebles/${property.slug}`}
        aria-label={`Ver inmueble: ${property.title} en ${location}`}
      >
        <div className="property-card__media">
          {property.coverImage ? (
            <img
              src={property.coverImage.url}
              alt={property.coverImage.alt}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <ArchitecturalVisual
              variant={property.visual}
              decorative
            />
          )}

          <div
            className="property-card__media-layer"
            aria-hidden="true"
          />

          <span
            className={`property-card__badge${isReserved || isSold || isRented
                ? ' property-card__badge--status'
                : ''
              }${badgeModifier}`}
            aria-label={
              hasCommercialStatus
                ? `Estado del inmueble: ${badgeLabel}`
                : undefined
            }
          >
            {badgeLabel}
          </span>

          <span
            className="property-card__number"
            aria-hidden="true"
          >
            {featuredNumber}
          </span>
        </div>

        <div className="property-card__body">
          <div className="property-card__topline">
            <p className="property-card__location">
              {location}
            </p>

            <span>
              {operation}
            </span>
          </div>

          <h3>
            {property.title}
          </h3>

          <div className="property-card__meta">
            <p className="property-card__price">
              {formattedPrice}
            </p>

            {visibleFeatures.length > 0 && (
              <ul aria-label="Características principales">
                {visibleFeatures.map(
                  (feature) => (
                    <li key={feature}>
                      {feature}
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>

          <span className="property-card__link">
            Ver inmueble{' '}
            <i aria-hidden="true">
              ↗
            </i>
          </span>
        </div>
      </Link>
    </article>
  );
}
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
  const operation = property.operation.toLowerCase().includes('alquiler')
    ? 'En alquiler'
    : 'En venta';

  const formattedPrice = property.price
    ? `${property.price.toLocaleString('es-ES')} €`
    : 'Consultar precio';

  const featuredNumber = String(index + 1).padStart(2, '0');
  const visibleFeatures = property.features.slice(0, 3);

  return (
    <article className="property-card">
      <Link
        to={`/inmuebles/${property.slug}`}
        aria-label={`Ver inmueble: ${property.title} en ${property.area}, ${property.city}`}
      >
        <div className="property-card__media">
          <ArchitecturalVisual variant={property.visual} decorative />

          <div className="property-card__media-layer" aria-hidden="true" />

          <span className="property-card__badge">{operation}</span>

          <span className="property-card__number" aria-hidden="true">
            {featuredNumber}
          </span>
        </div>

        <div className="property-card__body">
          <div className="property-card__topline">
            <p className="property-card__location">
              {property.area} · {property.city}
            </p>
            <span>{operation}</span>
          </div>

          <h3>{property.title}</h3>

          <div className="property-card__meta">
            <p className="property-card__price">{formattedPrice}</p>

            {visibleFeatures.length > 0 && (
              <ul aria-label="Características principales">
                {visibleFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            )}
          </div>

          <span className="property-card__link">
            Ver inmueble <i aria-hidden="true">↗</i>
          </span>
        </div>
      </Link>
    </article>
  );
}
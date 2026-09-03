import { Link } from 'react-router-dom';
import type { Property } from '../../types/content';
import { ArchitecturalVisual } from '../ui/ArchitecturalVisual';

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="property-card">
      <Link to={`/inmuebles/${property.slug}`} aria-label={`Ver ${property.title}`}>
        <div className="property-card__media">
          <ArchitecturalVisual variant={property.visual} label={`Visual provisional para ${property.title}`} />
          <span className="property-card__badge">{property.status}</span>
          <span className="demo-badge">CONTENIDO DEMO</span>
        </div>
        <div className="property-card__body">
          <p className="property-card__location">{property.area} · {property.city}</p>
          <h3>{property.title}</h3>
          <p className="property-card__price">{property.price ? `${property.price.toLocaleString('es-ES')} €` : 'Consultar precio'}</p>
          <ul>{property.features.slice(0, 3).map((feature) => <li key={feature}>{feature}</li>)}</ul>
          <span className="property-card__link">Ver inmueble <i aria-hidden="true">↗</i></span>
        </div>
      </Link>
    </article>
  );
}

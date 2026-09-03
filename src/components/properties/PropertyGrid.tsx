import type { Property } from '../../types/content';
import { PropertyCard } from './PropertyCard';

export function PropertyGrid({ properties }: { properties: Property[] }) {
  if (!properties.length) return <div className="empty-state"><p>No encontramos propiedades con estos filtros.</p><a href="/contacto">Cuéntanos qué estás buscando ↗</a></div>;
  return <div className="property-grid">{properties.map((property) => <PropertyCard key={property.id} property={property} />)}</div>;
}

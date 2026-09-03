import { Link } from 'react-router-dom';
import type { Property } from '../../types/content';
import { PropertyCard } from './PropertyCard';

export function PropertyGrid({
  properties,
  editorial = false,
}: {
  properties: Property[];
  editorial?: boolean;
}) {
  if (!properties.length) {
    return (
      <div className="empty-state" role="status">
        <p>No encontramos propiedades con estos filtros.</p>
        <span>
          Prueba a ampliar el rango o cuéntanos qué estás buscando para prepararte
          una selección personalizada.
        </span>
        <Link to="/contacto">Definir mi búsqueda ↗</Link>
      </div>
    );
  }

  return (
    <div className={`property-grid ${editorial ? 'property-grid--editorial' : ''}`}>
      {properties.map((property, index) => (
        <PropertyCard key={property.id} property={property} index={index} />
      ))}
    </div>
  );
}
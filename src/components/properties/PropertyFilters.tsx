import type { ChangeEvent } from 'react';
import { trackEvent } from '../../utils/analytics';

export interface FilterState {
  operation: string;
  city: string;
  type: string;
  bedrooms: string;
  order: string;
}

export function PropertyFilters({ value, onChange }: { value: FilterState; onChange: (value: FilterState) => void }) {
  const update = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = { ...value, [event.target.name]: event.target.value };
    onChange(next);
    trackEvent('property_filter', { field: event.target.name, value: event.target.value });
  };
  return (
    <div className="property-filters" aria-label="Filtros de inmuebles">
      <label>Operación<select name="operation" value={value.operation} onChange={update}><option value="">Todas</option><option>Comprar</option><option>Alquilar</option></select></label>
      <label>Zona<select name="city" value={value.city} onChange={update}><option value="">Todas</option><option>Madrid</option><option>Pinto</option><option>Móstoles</option></select></label>
      <label>Tipo<select name="type" value={value.type} onChange={update}><option value="">Todos</option><option>Piso</option><option>Casa</option><option>Ático</option><option>Estudio</option><option>Local</option></select></label>
      <label>Dormitorios<select name="bedrooms" value={value.bedrooms} onChange={update}><option value="">Cualquiera</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option></select></label>
      <label>Orden<select name="order" value={value.order} onChange={update}><option value="featured">Destacados</option><option value="recent">Más recientes</option><option value="priceAsc">Precio menor</option><option value="priceDesc">Precio mayor</option></select></label>
    </div>
  );
}

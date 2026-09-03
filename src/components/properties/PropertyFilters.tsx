import type { ChangeEvent } from 'react';
import { trackEvent } from '../../utils/analytics';

export interface FilterState {
  operation: string;
  city: string;
  type: string;
  bedrooms: string;
  minPrice: string;
  maxPrice: string;
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
      <label>Operación<select name="operation" value={value.operation} onChange={update}><option value="">Todas</option><option value="venta">Comprar</option><option value="alquiler">Alquilar</option></select></label>
      <label>Zona<select name="city" value={value.city} onChange={update}><option value="">Todas</option><option>Madrid</option><option>Pinto</option><option>Móstoles</option></select></label>
      <label>Tipo<select name="type" value={value.type} onChange={update}><option value="">Todos</option><option value="piso">Piso</option><option value="casa">Casa</option><option value="atico">Ático</option><option value="estudio">Estudio</option><option value="local">Local</option></select></label>
      <label>Dormitorios<select name="bedrooms" value={value.bedrooms} onChange={update}><option value="">Cualquiera</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option></select></label>
      <label>Precio mínimo<select name="minPrice" value={value.minPrice} onChange={update}><option value="0">Sin mínimo</option><option value="150000">150.000 €</option><option value="250000">250.000 €</option><option value="400000">400.000 €</option></select></label>
      <label>Precio máximo<select name="maxPrice" value={value.maxPrice} onChange={update}><option value="">Sin límite</option><option value="200000">200.000 €</option><option value="300000">300.000 €</option><option value="500000">500.000 €</option></select></label>
      <label>Orden<select name="order" value={value.order} onChange={update}><option value="featured">Destacados</option><option value="recent">Más recientes</option><option value="priceAsc">Precio menor</option><option value="priceDesc">Precio mayor</option></select></label>
    </div>
  );
}

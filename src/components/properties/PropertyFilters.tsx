import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { propertyConditionOptions } from '../../data/propertyOptions';
import {
  applyLocationOption,
  defaultPropertyFilters,
  findSelectedLocation,
  type PropertyFilterState,
  type PropertyLocationOption,
} from '../../lib/propertyFilters';
import { trackEvent } from '../../utils/analytics';
import { PropertyLocationFilter } from './PropertyLocationFilter';
import './PropertyFilters.css';

const featureFilters: Array<{ key: keyof PropertyFilterState; label: string }> = [
  { key: 'terrace', label: 'Terraza' },
  { key: 'pool', label: 'Piscina' },
  { key: 'parking', label: 'Garaje' },
  { key: 'elevator', label: 'Ascensor' },
  { key: 'garden', label: 'Jardín' },
  { key: 'patio', label: 'Patio' },
  { key: 'storage', label: 'Trastero' },
  { key: 'balcony', label: 'Balcón' },
  { key: 'airConditioning', label: 'Aire acondicionado' },
  { key: 'accessible', label: 'Acceso adaptado' },
];

export function PropertyFilters({
  value,
  locationOptions,
  typeOptions,
  onChange,
  onClear,
}: {
  value: PropertyFilterState;
  locationOptions: PropertyLocationOption[];
  typeOptions: string[];
  onChange: (value: PropertyFilterState) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [priceError, setPriceError] = useState('');

  useEffect(() => setDraft(value), [value]);

  const update = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target;
    const next = {
      ...draft,
      [target.name]: target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value,
    };
    setDraft(next);
    setPriceError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (draft.minPrice && draft.maxPrice && Number(draft.minPrice) > Number(draft.maxPrice)) {
      setPriceError('El precio mínimo no puede superar al máximo.');
      return;
    }
    onChange(draft);
    trackEvent('property_filter', { filters: JSON.stringify(draft) });
    setMobileOpen(false);
  };

  const clear = () => {
    setDraft(defaultPropertyFilters);
    setPriceError('');
    onClear();
    setMobileOpen(false);
  };

  const selectedLocation = findSelectedLocation(draft, locationOptions);

  return (
    <>
      <button className="property-filters__mobile-trigger" type="button" onClick={() => setMobileOpen(true)}>
        Filtros
      </button>
      {mobileOpen ? <button className="property-filters__backdrop" type="button" aria-label="Cerrar filtros" onClick={() => setMobileOpen(false)} /> : null}
      <form className={`property-filters${mobileOpen ? ' is-open' : ''}`} onSubmit={submit} aria-label="Filtros de inmuebles">
        <header className="property-filters__mobile-header">
          <strong>Filtrar inmuebles</strong>
          <button type="button" aria-label="Cerrar filtros" onClick={() => setMobileOpen(false)}>×</button>
        </header>

        <div className="property-filters__primary">
          <label>Operación
            <select name="operation" value={draft.operation} onChange={update}>
              <option value="">Comprar y alquilar</option>
              <option value="venta">Comprar</option>
              <option value="alquiler">Alquilar</option>
            </select>
          </label>

          <PropertyLocationFilter
            id="catalogue-location"
            options={locationOptions}
            value={selectedLocation}
            onChange={(option) => setDraft((current) => applyLocationOption(current, option))}
          />

          <label>Tipo de inmueble
            <select name="type" value={draft.type} onChange={update}>
              <option value="">Todos los tipos</option>
              {typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>

          <label>Precio mínimo
            <input name="minPrice" type="number" inputMode="numeric" min="0" step="1000" value={draft.minPrice} onChange={update} placeholder="Sin mínimo" />
          </label>
          <label>Precio máximo
            <input name="maxPrice" type="number" inputMode="numeric" min="0" step="1000" value={draft.maxPrice} onChange={update} placeholder="Sin máximo" />
          </label>
          <label>Habitaciones mínimas
            <input name="bedrooms" type="number" inputMode="numeric" min="0" step="1" value={draft.bedrooms} onChange={update} placeholder="Cualquiera" />
          </label>
          <label>Baños mínimos
            <input name="bathrooms" type="number" inputMode="numeric" min="0" step="1" value={draft.bathrooms} onChange={update} placeholder="Cualquiera" />
          </label>
          <label>Superficie construida mínima
            <input name="minArea" type="number" inputMode="numeric" min="0" step="1" value={draft.minArea} onChange={update} placeholder="m²" />
          </label>
        </div>

        <details className="property-filters__more">
          <summary>Más filtros</summary>
          <div className="property-filters__features">
            {featureFilters.map(({ key, label }) => (
              <label key={key}>
                <input name={key} type="checkbox" checked={Boolean(draft[key])} onChange={update} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <label className="property-filters__condition">Estado del inmueble
            <select name="condition" value={draft.condition} onChange={update}>
              <option value="">Cualquier estado</option>
              {propertyConditionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </details>

        <div className="property-filters__footer">
          <label>Ordenar por
            <select name="order" value={draft.order} onChange={update}>
              <option value="featured">Destacados</option>
              <option value="recent">Más recientes</option>
              <option value="priceAsc">Precio menor</option>
              <option value="priceDesc">Precio mayor</option>
            </select>
          </label>
          {priceError ? <p role="alert">{priceError}</p> : null}
          <button className="property-filters__clear" type="button" onClick={clear}>Limpiar filtros</button>
          <button className="property-filters__apply" type="submit">Aplicar filtros</button>
        </div>
      </form>
    </>
  );
}

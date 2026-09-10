import {
  getActivePropertyFilters,
  type PropertyFilterState,
} from '../../lib/propertyFilters';

export function PropertyActiveFilters({
  filters,
  onRemove,
  onClear,
}: {
  filters: PropertyFilterState;
  onRemove: (key: keyof PropertyFilterState | 'location') => void;
  onClear: () => void;
}) {
  const active = getActivePropertyFilters(filters);
  if (!active.length) return null;

  return (
    <div className="property-active-filters" aria-label="Filtros activos">
      <span>Filtros activos</span>
      <div>
        {active.map((filter) => (
          <button key={filter.key} type="button" onClick={() => onRemove(filter.key)}>
            {filter.label}<span aria-hidden="true">×</span>
            <span className="sr-only">Quitar filtro</span>
          </button>
        ))}
      </div>
      <button className="property-active-filters__clear" type="button" onClick={onClear}>
        Limpiar filtros
      </button>
    </div>
  );
}

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
  onRemove: (
    key:
      | keyof PropertyFilterState
      | 'location',
  ) => void;
  onClear: () => void;
}) {
  const active = getActivePropertyFilters(
    filters,
  ).filter(
    (filter) =>
      filter.key !== 'operation',
  );

  if (!active.length) {
    return null;
  }

  return (
    <div
      className="property-active-filters"
      aria-label="Criterios activos de búsqueda"
    >
      <span>
        Tu búsqueda
      </span>

      <div>
        {active.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() =>
              onRemove(filter.key)
            }
            aria-label={`Quitar filtro ${filter.label}`}
          >
            {filter.label}

            <span aria-hidden="true">
              ×
            </span>
          </button>
        ))}
      </div>

      <button
        className="property-active-filters__clear"
        type="button"
        onClick={onClear}
      >
        Limpiar
      </button>
    </div>
  );
}
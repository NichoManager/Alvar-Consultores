import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import {
  propertyConditionOptions,
  type PropertyType,
} from '../../data/propertyOptions';
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

const featureFilters: Array<{
  key: keyof PropertyFilterState;
  label: string;
}> = [
  { key: 'terrace', label: 'Terraza' },
  { key: 'pool', label: 'Piscina' },
  { key: 'parking', label: 'Garaje' },
  { key: 'elevator', label: 'Ascensor' },
  { key: 'garden', label: 'Jardín' },
  { key: 'patio', label: 'Patio' },
  { key: 'storage', label: 'Trastero' },
  { key: 'balcony', label: 'Balcón' },
  {
    key: 'airConditioning',
    label: 'Aire acondicionado',
  },
  {
    key: 'accessible',
    label: 'Acceso adaptado',
  },
];

const minimumRoomOptions = [
  { value: '', label: 'Cualquiera' },
  { value: '1', label: '1 o más' },
  { value: '2', label: '2 o más' },
  { value: '3', label: '3 o más' },
  { value: '4', label: '4 o más' },
  { value: '5', label: '5 o más' },
] as const;

export function PropertyFilters({
  value,
  locationOptions,
  typeOptions,
  onChange,
  onClear,
}: {
  value: PropertyFilterState;
  locationOptions: PropertyLocationOption[];
  typeOptions: ReadonlyArray<{
    value: PropertyType;
    label: string;
  }>;
  onChange: (value: PropertyFilterState) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] =
    useState<PropertyFilterState>(value);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [advancedOpen, setAdvancedOpen] =
    useState(false);

  const [priceError, setPriceError] =
    useState('');

  const lockedOperation =
    value.operation === 'venta' ||
    value.operation === 'alquiler'
      ? value.operation
      : '';

  const showOperationSelector =
    lockedOperation === '';

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const update = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const target = event.target;

    const next = {
      ...draft,
      [target.name]:
        target instanceof HTMLInputElement &&
        target.type === 'checkbox'
          ? target.checked
          : target.value,
    };

    setDraft(next);
    setPriceError('');
  };

  const updateOperation = (
    operation: PropertyFilterState['operation'],
  ) => {
    setDraft((current) => ({
      ...current,
      operation,
    }));

    setPriceError('');
  };

  const submit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      draft.minPrice &&
      draft.maxPrice &&
      Number(draft.minPrice) >
        Number(draft.maxPrice)
    ) {
      setPriceError(
        'El precio mínimo no puede superar al máximo.',
      );

      return;
    }

    const nextFilters = lockedOperation
      ? {
          ...draft,
          operation: lockedOperation,
        }
      : draft;

    onChange(nextFilters);

    trackEvent('property_filter', {
      filters: JSON.stringify(nextFilters),
    });

    setMobileOpen(false);
  };

  const clear = () => {
    setPriceError('');
    setAdvancedOpen(false);
    setMobileOpen(false);

    if (lockedOperation) {
      const nextFilters: PropertyFilterState = {
        ...defaultPropertyFilters,
        operation: lockedOperation,
      };

      setDraft(nextFilters);
      onChange(nextFilters);

      return;
    }

    setDraft(defaultPropertyFilters);
    onClear();
  };

  const selectedLocation =
    findSelectedLocation(
      draft,
      locationOptions,
    );

  const mobileEyebrow =
    lockedOperation === 'venta'
      ? 'COMPRAR'
      : lockedOperation === 'alquiler'
        ? 'ALQUILAR'
        : 'BUSCAR INMUEBLES';

  const hasActiveDraftFilters =
    (!lockedOperation &&
      draft.operation !== '') ||
    draft.province !== '' ||
    draft.city !== '' ||
    draft.area !== '' ||
    draft.type !== '' ||
    draft.minPrice !== '' ||
    draft.maxPrice !== '' ||
    draft.bedrooms !== '' ||
    draft.bathrooms !== '' ||
    draft.minArea !== '' ||
    draft.terrace ||
    draft.pool ||
    draft.parking ||
    draft.elevator ||
    draft.garden ||
    draft.patio ||
    draft.storage ||
    draft.balcony ||
    draft.airConditioning ||
    draft.accessible ||
    draft.condition !== '';

  const hasAdvancedFilters =
    draft.terrace ||
    draft.pool ||
    draft.parking ||
    draft.elevator ||
    draft.garden ||
    draft.patio ||
    draft.storage ||
    draft.balcony ||
    draft.airConditioning ||
    draft.accessible ||
    draft.condition !== '';

  return (
    <>
      <button
        className="property-filters__mobile-trigger"
        type="button"
        onClick={() =>
          setMobileOpen(true)
        }
      >
        <span>
          Filtrar inmuebles
        </span>

        <span aria-hidden="true">
          ＋
        </span>
      </button>

      {mobileOpen ? (
        <button
          className="property-filters__backdrop"
          type="button"
          aria-label="Cerrar filtros"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      ) : null}

      <form
        className={`property-filters${
          mobileOpen ? ' is-open' : ''
        }`}
        onSubmit={submit}
        aria-label={
          lockedOperation === 'venta'
            ? 'Filtros de inmuebles en venta'
            : lockedOperation === 'alquiler'
              ? 'Filtros de inmuebles en alquiler'
              : 'Filtros de inmuebles'
        }
      >
        <header className="property-filters__mobile-header">
          <div>
            <span>
              {mobileEyebrow}
            </span>

            <strong>
              Afina tu búsqueda
            </strong>
          </div>

          <button
            type="button"
            aria-label="Cerrar filtros"
            onClick={() =>
              setMobileOpen(false)
            }
          >
            ×
          </button>
        </header>

        {showOperationSelector ? (
          <div className="property-filters__operation">
            <span className="property-filters__field-label">
              Operación
            </span>

            <div
              className="property-filters__operation-control"
              role="group"
              aria-label="Tipo de operación"
            >
              <button
                type="button"
                className={
                  draft.operation === ''
                    ? 'is-active'
                    : ''
                }
                aria-pressed={
                  draft.operation === ''
                }
                onClick={() =>
                  updateOperation('')
                }
              >
                Todos
              </button>

              <button
                type="button"
                className={
                  draft.operation === 'venta'
                    ? 'is-active'
                    : ''
                }
                aria-pressed={
                  draft.operation === 'venta'
                }
                onClick={() =>
                  updateOperation('venta')
                }
              >
                Comprar
              </button>

              <button
                type="button"
                className={
                  draft.operation ===
                  'alquiler'
                    ? 'is-active'
                    : ''
                }
                aria-pressed={
                  draft.operation ===
                  'alquiler'
                }
                onClick={() =>
                  updateOperation(
                    'alquiler',
                  )
                }
              >
                Alquilar
              </button>
            </div>
          </div>
        ) : null}

        <div className="property-filters__search-shell">
          <div className="property-filters__main">
            <div className="property-filters__main-field property-filters__main-field--location">
              <PropertyLocationFilter
                id="catalogue-location"
                options={locationOptions}
                value={selectedLocation}
                onChange={(option) =>
                  setDraft((current) =>
                    applyLocationOption(
                      current,
                      option,
                    ),
                  )
                }
              />
            </div>

            <label className="property-filters__main-field">
              <span>
                Tipo de inmueble
              </span>

              <select
                name="type"
                value={draft.type}
                onChange={update}
              >
                <option value="">
                  Todos los tipos
                </option>

                {typeOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <div className="property-filters__main-field property-filters__price">
              <span className="property-filters__field-label">
                Precio
              </span>

              <div className="property-filters__price-controls">
                <label>
                  <span className="property-filters__visually-hidden">
                    Precio mínimo
                  </span>

                  <input
                    name="minPrice"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1000"
                    value={draft.minPrice}
                    onChange={update}
                    placeholder="Desde"
                  />
                </label>

                <span
                  className="property-filters__price-separator"
                  aria-hidden="true"
                />

                <label>
                  <span className="property-filters__visually-hidden">
                    Precio máximo
                  </span>

                  <input
                    name="maxPrice"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1000"
                    value={draft.maxPrice}
                    onChange={update}
                    placeholder="Hasta"
                  />
                </label>
              </div>
            </div>

            <button
              className="property-filters__apply property-filters__apply--desktop"
              type="submit"
            >
              <span>
                Buscar
              </span>

              <span aria-hidden="true">
                →
              </span>
            </button>
          </div>

          {priceError ? (
            <p
              className="property-filters__error"
              role="alert"
            >
              {priceError}
            </p>
          ) : null}

          <div className="property-filters__secondary">
            <label className="property-filters__secondary-field">
              <span>
                Habitaciones
              </span>

              <select
                name="bedrooms"
                value={draft.bedrooms}
                onChange={update}
              >
                {minimumRoomOptions.map(
                  (option) => (
                    <option
                      key={
                        option.value ||
                        'any-bedroom'
                      }
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="property-filters__secondary-field">
              <span>
                Baños
              </span>

              <select
                name="bathrooms"
                value={draft.bathrooms}
                onChange={update}
              >
                {minimumRoomOptions.map(
                  (option) => (
                    <option
                      key={
                        option.value ||
                        'any-bathroom'
                      }
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="property-filters__secondary-field">
              <span>
                Superficie
              </span>

              <div className="property-filters__area-field">
                <input
                  name="minArea"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={draft.minArea}
                  onChange={update}
                  placeholder="Mínima"
                />

                <span>
                  m²
                </span>
              </div>
            </label>

            <button
              className={`property-filters__advanced-trigger${
                advancedOpen
                  ? ' is-open'
                  : ''
              }${
                hasAdvancedFilters
                  ? ' has-active-filters'
                  : ''
              }`}
              type="button"
              aria-expanded={advancedOpen}
              aria-controls="property-advanced-filters"
              onClick={() =>
                setAdvancedOpen(
                  (current) => !current,
                )
              }
            >
              <span>
                Más filtros
              </span>

              {hasAdvancedFilters ? (
                <i aria-hidden="true" />
              ) : null}

              <span
                className="property-filters__advanced-trigger-icon"
                aria-hidden="true"
              >
                +
              </span>
            </button>
          </div>

          {advancedOpen ? (
            <div
              id="property-advanced-filters"
              className="property-filters__advanced"
            >
              <div className="property-filters__advanced-heading">
                <div>
                  <span>
                    CARACTERÍSTICAS
                  </span>

                  <strong>
                    Los detalles que importan.
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setAdvancedOpen(false)
                  }
                >
                  Cerrar
                  <span aria-hidden="true">
                    ↑
                  </span>
                </button>
              </div>

              <div className="property-filters__features">
                {featureFilters.map(
                  ({ key, label }) => (
                    <label key={key}>
                      <input
                        name={key}
                        type="checkbox"
                        checked={Boolean(
                          draft[key],
                        )}
                        onChange={update}
                      />

                      <span>
                        {label}
                      </span>
                    </label>
                  ),
                )}
              </div>

              <label className="property-filters__condition">
                <span>
                  Estado del inmueble
                </span>

                <select
                  name="condition"
                  value={draft.condition}
                  onChange={update}
                >
                  <option value="">
                    Cualquier estado
                  </option>

                  {propertyConditionOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
          ) : null}
        </div>

        <div className="property-filters__mobile-actions">
          {hasActiveDraftFilters ? (
            <button
              className="property-filters__clear"
              type="button"
              onClick={clear}
            >
              Limpiar
            </button>
          ) : null}

          <button
            className="property-filters__apply property-filters__apply--mobile"
            type="submit"
          >
            Aplicar filtros

            <span aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </form>
    </>
  );
}
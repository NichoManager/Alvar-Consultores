import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyActiveFilters } from '../components/properties/PropertyActiveFilters';
import { PropertyFilters } from '../components/properties/PropertyFilters';
import { PropertyGrid } from '../components/properties/PropertyGrid';
import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { business } from '../data/business';
import { propertyTypeOptions } from '../data/propertyOptions';
import {
  buildPropertyLocationOptions,
  filterProperties,
  propertyFiltersFromSearchParams,
  propertyFiltersToSearchParams,
  sortProperties,
  type PropertyFilterState,
} from '../lib/propertyFilters';
import { getPublishedProperties } from '../lib/properties';
import type { Property } from '../types/content';

export function PropertiesPage() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [properties, setProperties] =
    useState<Property[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    getPublishedProperties()
      .then((items) => {
        if (isMounted) {
          setProperties(items);
          setLoadError(false);
        }
      })
      .catch((error) => {
        console.error(
          'Error loading public properties:',
          error,
        );

        if (isMounted) {
          setLoadError(true);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filters = useMemo(
    () =>
      propertyFiltersFromSearchParams(
        searchParams,
      ),
    [searchParams],
  );

  const locationOptions = useMemo(
    () =>
      buildPropertyLocationOptions(
        properties,
      ),
    [properties],
  );

  const filtered = useMemo(
    () =>
      sortProperties(
        filterProperties(
          properties,
          filters,
        ),
        filters.order,
      ),
    [filters, properties],
  );

  const setFilters = (
    next: PropertyFilterState,
  ) => {
    setSearchParams(
      propertyFiltersToSearchParams(next),
    );
  };

  const clearFilters = () => {
    const nextParams =
      new URLSearchParams();

    if (
      filters.operation === 'venta' ||
      filters.operation === 'alquiler'
    ) {
      nextParams.set(
        'operation',
        filters.operation,
      );
    }

    setSearchParams(nextParams);
  };

  const removeFilter = (
    key:
      | keyof PropertyFilterState
      | 'location',
  ) => {
    const next = {
      ...filters,
    };

    if (key === 'location') {
      next.province = '';
      next.city = '';
      next.area = '';
    } else if (
      typeof next[key] === 'boolean'
    ) {
      Object.assign(next, {
        [key]: false,
      });
    } else {
      Object.assign(next, {
        [key]:
          key === 'order'
            ? 'featured'
            : '',
      });
    }

    setFilters(next);
  };

  const handleOrderChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    setFilters({
      ...filters,
      order:
        event.target
          .value as PropertyFilterState['order'],
    });
  };

  const isRental =
    filters.operation === 'alquiler';

  const isSale =
    filters.operation === 'venta';

  const hasSearchParams =
    searchParams.toString().length > 0;

  const hero = isRental
    ? {
        eyebrow: 'ALQUILAR',
        title: (
          <>
            Inmuebles en alquiler
            <br />
            <em>
              seleccionados con criterio.
            </em>
          </>
        ),
        text:
          'Consulta las propiedades disponibles en alquiler y afina la búsqueda por ubicación, tipología, presupuesto y características.',
      }
    : isSale
      ? {
          eyebrow: 'COMPRAR',
          title: (
            <>
              Inmuebles en venta
              <br />
              <em>
                seleccionados con criterio.
              </em>
            </>
          ),
          text:
            'Explora propiedades disponibles para comprar en Madrid y otras ubicaciones, y combina zona, tipología, presupuesto y características.',
        }
      : {
          eyebrow: 'INMUEBLES',
          title: (
            <>
              Propiedades para encontrar
              <br />
              <em>
                tu próximo lugar.
              </em>
            </>
          ),
          text:
            'Consulta nuestro catálogo de inmuebles en Madrid y otras ubicaciones y filtra por operación, zona, tipología y características.',
        };

  const seo = isRental
    ? {
        title:
          'Inmuebles en alquiler | Alvar Consultores Inmobiliarios',
        description:
          'Consulta inmuebles y viviendas disponibles en alquiler con Alvar Consultores Inmobiliarios y filtra por ubicación, tipología y características.',
        imageAlt:
          'Catálogo de inmuebles en alquiler de Alvar Consultores Inmobiliarios',
      }
    : isSale
      ? {
          title:
            'Inmuebles en venta | Alvar Consultores Inmobiliarios',
          description:
            'Consulta viviendas e inmuebles en venta en Madrid y otras ubicaciones con Alvar Consultores Inmobiliarios.',
          imageAlt:
            'Catálogo de inmuebles en venta de Alvar Consultores Inmobiliarios',
        }
      : {
          title:
            'Inmuebles en Madrid y otras ubicaciones | Alvar Consultores',
          description:
            'Consulta inmuebles en venta y alquiler en Madrid y otras ubicaciones. Filtra el catálogo por zona, tipología, precio y características.',
          imageAlt:
            'Catálogo de propiedades de Alvar Consultores Inmobiliarios',
        };

  return (
    <>
      <SeoHead
        title={seo.title}
        description={seo.description}
        path="/inmuebles"
        noIndex={hasSearchParams}
        image={
          isRental
            ? '/images/alvar/heroes/hero-alquilar-inmuebles-madrid.webp'
            : '/images/alvar/heroes/hero-comprar-inmuebles-madrid.webp'
        }
        imageAlt={seo.imageAlt}
      />

      <InternalHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        text={hero.text}
        image={
          isRental
            ? '/images/alvar/heroes/hero-alquilar-inmuebles-madrid.webp'
            : '/images/alvar/heroes/hero-comprar-inmuebles-madrid.webp'
        }
        aside={
          <>
            <strong>
              {filtered.length
                .toString()
                .padStart(2, '0')}
            </strong>

            <span>
              {filtered.length === 1
                ? 'inmueble'
                : 'inmuebles'}
            </span>
          </>
        }
      />

      <section
        className={`catalogue catalogue--${
          filters.operation || 'all'
        } section-pad`}
        aria-labelledby="catalogue-title"
      >
        <Container>
          <header className="catalogue__intro">
            <div>
              <p className="eyebrow">
                CATÁLOGO DE INMUEBLES
              </p>

              <h2 id="catalogue-title">
                Una búsqueda precisa,
                <br />

                <em>
                  sin limitar ubicaciones.
                </em>
              </h2>
            </div>

            <div className="catalogue__intro-copy">
              <p>
                Filtra nuestro inventario
                real por ubicación,
                tipología, superficie,
                presupuesto y
                prestaciones. Las zonas
                disponibles se actualizan
                según las propiedades
                publicadas.
              </p>

              <div className="catalogue__meta">
                <i aria-hidden="true" />

                <span>
                  Inventario público
                  actualizado
                </span>
              </div>
            </div>
          </header>

          <div className="catalogue__filters">
            <PropertyFilters
              value={filters}
              locationOptions={
                locationOptions
              }
              typeOptions={
                propertyTypeOptions
              }
              onChange={setFilters}
              onClear={clearFilters}
            />

            <PropertyActiveFilters
              filters={filters}
              onRemove={removeFilter}
              onClear={clearFilters}
            />
          </div>

          <div className="catalogue__results-toolbar">
            <div className="catalogue__results-summary">
              <span>
                RESULTADOS
              </span>

              <div>
                <strong>
                  {filtered.length
                    .toString()
                    .padStart(2, '0')}
                </strong>

                <p>
                  {filtered.length === 1
                    ? 'inmueble disponible'
                    : 'inmuebles disponibles'}
                </p>
              </div>

              <small>
                Inventario sujeto a
                disponibilidad y
                actualización.
              </small>
            </div>

            <label className="catalogue__results-order">
              <span>
                Ordenar por
              </span>

              <select
                value={filters.order}
                onChange={
                  handleOrderChange
                }
                aria-label="Ordenar inmuebles"
              >
                <option value="featured">
                  Destacados
                </option>

                <option value="recent">
                  Más recientes
                </option>

                <option value="priceAsc">
                  Precio: menor a mayor
                </option>

                <option value="priceDesc">
                  Precio: mayor a menor
                </option>
              </select>
            </label>
          </div>

          {isLoading ? (
            <div
              className="empty-state"
              role="status"
            >
              <p>
                Cargando inmuebles
                disponibles...
              </p>

              <span>
                Estamos preparando el
                catálogo actualizado.
              </span>
            </div>
          ) : loadError ? (
            <div
              className="empty-state"
              role="alert"
            >
              <p>
                No hemos podido cargar los
                inmuebles.
              </p>

              <span>
                Inténtalo de nuevo en unos
                minutos o cuéntanos qué
                estás buscando.
              </span>

              <Button
                to="/contacto"
                variant="secondary"
              >
                Contactar
              </Button>
            </div>
          ) : filtered.length ? (
            <PropertyGrid
              properties={filtered}
            />
          ) : (
            <div className="empty-state">
              <p>
                No hemos encontrado
                inmuebles con estos
                criterios.
              </p>

              <span>
                Prueba a ampliar la
                ubicación, el presupuesto
                o las características
                seleccionadas.
              </span>

              <button
                className="button button--secondary"
                type="button"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {isRental ? (
            <aside
              className="rental-owner-cta"
              aria-labelledby="rental-owner-title"
            >
              <span className="rental-owner-cta__eyebrow">
                GESTIÓN DE ALQUILER
              </span>

              <div className="rental-owner-cta__content">
                <h2 id="rental-owner-title">
                  ¿Quieres alquilar tu piso?
                </h2>

                <p>
                  Te ayudamos a preparar la
                  vivienda, definir el
                  posicionamiento,
                  seleccionar inquilino,
                  revisar documentación y
                  gestionar el alquiler con
                  seguridad.
                </p>
              </div>

              <div className="rental-owner-cta__actions">
                <a
                  className="button button--light"
                  href={`tel:${business.phoneMobileHref}`}
                  aria-label={`Hablar con Alvar en el ${business.phoneMobile}`}
                >
                  <span>
                    Hablar con Alvar
                  </span>

                  <span
                    className="button__arrow"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </a>

                <Button
                  to="/contacto"
                  variant="secondary"
                >
                  Contactar
                </Button>

                <small>
                  {business.phoneMobile}
                </small>
              </div>
            </aside>
          ) : (
            <aside
              className="catalogue-cta"
              aria-labelledby="buyer-search-title"
            >
              <div className="catalogue-cta__content">
                <span>
                  BÚSQUEDA PERSONALIZADA
                </span>

                <h2 id="buyer-search-title">
                  ¿No encuentras lo
                  <br />

                  <em>
                    que estás buscando?
                  </em>
                </h2>

                <p>
                  Cuéntanos qué tipo de
                  propiedad buscas, en qué
                  zona y con qué
                  presupuesto. Podemos
                  ayudarte a enfocar la
                  búsqueda y detectar
                  oportunidades que
                  encajen mejor contigo,
                  también cuando buscas
                  fuera de Madrid.
                </p>
              </div>

              <div className="catalogue-cta__actions">
                <Button
                  to="/contacto"
                  variant="light"
                >
                  Cuéntanos qué buscas
                </Button>

                <a
                  href={`tel:${business.phoneMobileHref}`}
                  className="catalogue-cta__phone"
                  aria-label={`Hablar con Alvar en el ${business.phoneMobile}`}
                >
                  <span>
                    Contacto directo
                  </span>

                  <strong>
                    {business.phoneMobile}
                  </strong>
                </a>
              </div>
            </aside>
          )}
        </Container>
      </section>
    </>
  );
}
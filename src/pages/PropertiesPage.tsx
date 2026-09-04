import { useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { PropertyFilters, type FilterState } from '../components/properties/PropertyFilters';
import { PropertyGrid } from '../components/properties/PropertyGrid';
import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { business } from '../data/business';
import { properties } from '../data/properties';

type NormalizedOperation = 'venta' | 'alquiler' | '';

function normalizeOperation(value: string): NormalizedOperation {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (['venta', 'vender', 'compra', 'comprar', 'en venta'].includes(normalized)) {
    return 'venta';
  }

  if (['alquiler', 'alquilar', 'renta', 'arrendamiento', 'en alquiler'].includes(normalized)) {
    return 'alquiler';
  }

  return '';
}

export function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: FilterState = useMemo(
    () => ({
      operation: searchParams.get('operation') ?? 'venta',
      city: searchParams.get('city') ?? '',
      type: searchParams.get('type') ?? '',
      bedrooms: searchParams.get('bedrooms') ?? '',
      minPrice: searchParams.get('minPrice') ?? '0',
      maxPrice: searchParams.get('maxPrice') ?? '',
      order: searchParams.get('order') ?? 'featured',
    }),
    [searchParams],
  );

  const activeOperation = normalizeOperation(filters.operation);

  const setFilters = (next: FilterState) => {
    const params = new URLSearchParams();

    Object.entries(next).forEach(([key, value]) => {
      if (
        value &&
        !(key === 'minPrice' && value === '0') &&
        !(key === 'order' && value === 'featured')
      ) {
        params.set(key, value);
      }
    });

    setSearchParams(params, { replace: true });
  };

  const filtered = useMemo(() => {
    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const result = properties.filter((item) => {
      const matchesPrice =
        item.price === null
          ? !filters.maxPrice && Number(filters.minPrice || 0) === 0
          : item.price >= Number(filters.minPrice || 0) &&
            (!filters.maxPrice || item.price <= Number(filters.maxPrice));

      return (
        (!activeOperation || normalizeOperation(item.operation) === activeOperation) &&
        (!filters.city || item.city === filters.city) &&
        (!filters.type || normalize(item.propertyType) === filters.type) &&
        (!filters.bedrooms || (item.bedrooms ?? 0) >= Number(filters.bedrooms)) &&
        matchesPrice
      );
    });

    return [...result].sort((a, b) =>
      filters.order === 'recent'
        ? b.createdAt.localeCompare(a.createdAt)
        : filters.order === 'priceAsc'
          ? (a.price ?? Infinity) - (b.price ?? Infinity)
          : filters.order === 'priceDesc'
            ? (b.price ?? 0) - (a.price ?? 0)
            : Number(b.featured) - Number(a.featured),
    );
  }, [activeOperation, filters]);

  const operationParam = searchParams.get('operation');

  if (!operationParam || !activeOperation) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('operation', 'venta');

    return <Navigate to={`/inmuebles?${nextParams.toString()}`} replace />;
  }

  const isRental = activeOperation === 'alquiler';

  const hero = isRental
    ? {
        eyebrow: 'ALQUILAR',
        title: (
          <>
            Inmuebles en alquiler
            <br />
            <em>en Madrid y alrededores.</em>
          </>
        ),
        text: 'Consulta viviendas y activos disponibles en alquiler. También podemos ayudarte si quieres alquilar tu propiedad.',
      }
    : {
        eyebrow: 'COMPRAR',
        title: (
          <>
            Inmuebles en venta
            <br />
            <em>en Madrid y alrededores.</em>
          </>
        ),
        text: 'Explora propiedades disponibles para compra. Si no encuentras lo que buscas, podemos ayudarte a definir una búsqueda más precisa.',
      };

  const catalogueCopy = isRental
    ? {
        eyebrow: 'PROPIEDADES EN ALQUILER',
        title: (
          <>
            Una selección para encontrar
            <br />
            <em>el alquiler adecuado.</em>
          </>
        ),
        text: 'Filtra por zona, tipología, dormitorios y presupuesto para revisar las propiedades que mejor encajan con tu búsqueda.',
      }
    : {
        eyebrow: 'PROPIEDADES EN VENTA',
        title: (
          <>
            Encuentra una propiedad
            <br />
            <em>que tenga sentido para ti.</em>
          </>
        ),
        text: 'Filtra por zona, tipología, dormitorios y presupuesto. Si buscas algo muy concreto, también podemos ayudarte de forma personalizada.',
      };

  const seo = isRental
    ? {
        title: 'Inmuebles en alquiler en Madrid | Alvar Consultores',
        description:
          'Consulta viviendas y propiedades disponibles en alquiler en Madrid capital y alrededores con Alvar Consultores Inmobiliarios.',
        path: '/inmuebles?operation=alquiler',
      }
    : {
        title: 'Inmuebles en venta en Madrid | Alvar Consultores',
        description:
          'Explora viviendas y propiedades disponibles para comprar en Madrid capital y alrededores con Alvar Consultores Inmobiliarios.',
        path: '/inmuebles?operation=venta',
      };

  return (
    <>
      <SeoHead
        title={seo.title}
        description={seo.description}
        path={seo.path}
      />

      <InternalHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        text={hero.text}
        image="/images/alvar/heroes/hero-inmuebles-madrid.webp"
        aside={
          <>
            <strong>{filtered.length.toString().padStart(2, '0')}</strong>
            <span>{filtered.length === 1 ? 'resultado' : 'resultados'}</span>
          </>
        }
      />

      <section
        className={`catalogue catalogue--${activeOperation} section-pad`}
        aria-labelledby="catalogue-title"
      >
        <Container>
          <header className="catalogue__intro">
            <div>
              <p className="eyebrow">{catalogueCopy.eyebrow}</p>

              <h2 id="catalogue-title">{catalogueCopy.title}</h2>
            </div>

            <div className="catalogue__intro-copy">
              <p>{catalogueCopy.text}</p>

              <div className="catalogue__meta">
                <span>
                  <strong>{filtered.length}</strong>
                  {filtered.length === 1 ? ' propiedad' : ' propiedades'}
                </span>

                <i aria-hidden="true" />

                <span>Madrid capital y alrededores</span>
              </div>
            </div>
          </header>

          <div className="catalogue__filters">
            <div className="catalogue__filters-heading">
              <span>FILTRAR BÚSQUEDA</span>
              <p>Afina los resultados según tus necesidades.</p>
            </div>

            <PropertyFilters value={filters} onChange={setFilters} />
          </div>

          <div className="catalogue__status" aria-live="polite">
            <span>
              {filtered.length.toString().padStart(2, '0')}
            </span>

            <p>
              {filtered.length === 1
                ? 'propiedad disponible con los filtros seleccionados'
                : 'propiedades disponibles con los filtros seleccionados'}
            </p>

            <small>
              Inventario sujeto a disponibilidad y actualización.
            </small>
          </div>

          <PropertyGrid properties={filtered} />

          {isRental ? (
            <aside
              className="rental-owner-cta"
              aria-labelledby="rental-owner-title"
            >
              <span className="rental-owner-cta__eyebrow">
                GESTIÓN DE ALQUILER
              </span>

              <div className="rental-owner-cta__content">
                <h2 id="rental-owner-title">¿Quieres alquilar tu piso?</h2>

                <p>
                  Te ayudamos a preparar la vivienda, definir el posicionamiento,
                  seleccionar inquilino, revisar documentación y gestionar el
                  alquiler con seguridad.
                </p>
              </div>

              <div className="rental-owner-cta__actions">
                <a
                  className="button button--light"
                  href={`tel:${business.phoneMobileHref}`}
                  aria-label={`Hablar con Alvar en el ${business.phoneMobile}`}
                >
                  <span>Hablar con Alvar</span>
                  <span className="button__arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>

                <Button to="/contacto" variant="secondary">
                  Contactar
                </Button>

                <small>{business.phoneMobile}</small>
              </div>
            </aside>
          ) : (
            <aside
              className="catalogue-cta"
              aria-labelledby="buyer-search-title"
            >
              <div className="catalogue-cta__content">
                <span>BÚSQUEDA PERSONALIZADA</span>

                <h2 id="buyer-search-title">
                  ¿No encuentras lo
                  <br />
                  <em>que estás buscando?</em>
                </h2>

                <p>
                  Cuéntanos qué tipo de propiedad buscas, en qué zona y con qué
                  presupuesto. Podemos ayudarte a enfocar la búsqueda y detectar
                  oportunidades que encajen mejor contigo.
                </p>
              </div>

              <div className="catalogue-cta__actions">
                <Button to="/contacto" variant="light">
                  Cuéntanos qué buscas
                </Button>

                <a
                  href={`tel:${business.phoneMobileHref}`}
                  className="catalogue-cta__phone"
                  aria-label={`Hablar con Alvar en el ${business.phoneMobile}`}
                >
                  <span>Contacto directo</span>
                  <strong>{business.phoneMobile}</strong>
                </a>
              </div>
            </aside>
          )}
        </Container>
      </section>
    </>
  );
}
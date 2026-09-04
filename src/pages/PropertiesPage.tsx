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

  if (['venta', 'vender', 'compra', 'comprar', 'en venta'].includes(normalized)) return 'venta';
  if (['alquiler', 'alquilar', 'renta', 'arrendamiento', 'en alquiler'].includes(normalized)) return 'alquiler';
  return '';
}

export function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: FilterState = useMemo(() => ({
    operation: searchParams.get('operation') ?? 'venta',
    city: searchParams.get('city') ?? '',
    type: searchParams.get('type') ?? '',
    bedrooms: searchParams.get('bedrooms') ?? '',
    minPrice: searchParams.get('minPrice') ?? '0',
    maxPrice: searchParams.get('maxPrice') ?? '',
    order: searchParams.get('order') ?? 'featured',
  }), [searchParams]);

  const activeOperation = normalizeOperation(filters.operation);

  const setFilters = (next: FilterState) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value && !(key === 'minPrice' && value === '0') && !(key === 'order' && value === 'featured')) {
        params.set(key, value);
      }
    });
    setSearchParams(params, { replace: true });
  };

  const filtered = useMemo(() => {
    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const result = properties.filter((item) => {
      const matchesPrice = item.price === null
        ? !filters.maxPrice && Number(filters.minPrice || 0) === 0
        : item.price >= Number(filters.minPrice || 0) && (!filters.maxPrice || item.price <= Number(filters.maxPrice));

      return (!activeOperation || normalizeOperation(item.operation) === activeOperation)
        && (!filters.city || item.city === filters.city)
        && (!filters.type || normalize(item.propertyType) === filters.type)
        && (!filters.bedrooms || (item.bedrooms ?? 0) >= Number(filters.bedrooms))
        && matchesPrice;
    });

    return [...result].sort((a, b) => filters.order === 'recent'
      ? b.createdAt.localeCompare(a.createdAt)
      : filters.order === 'priceAsc'
        ? (a.price ?? Infinity) - (b.price ?? Infinity)
        : filters.order === 'priceDesc'
          ? (b.price ?? 0) - (a.price ?? 0)
          : Number(b.featured) - Number(a.featured));
  }, [activeOperation, filters]);

  const operationParam = searchParams.get('operation');
  if (!operationParam) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('operation', 'venta');
    return <Navigate to={`/inmuebles?${nextParams.toString()}`} replace />;
  }

  const hero = activeOperation === 'alquiler'
    ? {
        eyebrow: 'ALQUILAR',
        title: <>Inmuebles en alquiler<br /><em>en Madrid y alrededores.</em></>,
        text: 'Consulta viviendas y activos disponibles en alquiler. También podemos ayudarte si quieres alquilar tu propiedad.',
      }
    : {
        eyebrow: 'COMPRAR',
        title: <>Inmuebles en venta<br /><em>en Madrid y alrededores.</em></>,
        text: 'Explora propiedades disponibles para compra. Si no encuentras lo que buscas, podemos ayudarte a definir tu búsqueda.',
      };

  const seo = activeOperation === 'alquiler'
    ? {
        title: 'Inmuebles en alquiler en Madrid | Alvar Consultores',
        description: 'Consulta viviendas y propiedades disponibles en alquiler en Madrid, Pinto y alrededores con Alvar Consultores Inmobiliarios.',
        path: '/inmuebles?operation=alquiler',
      }
    : {
        title: 'Inmuebles en venta en Madrid | Alvar Consultores',
        description: 'Explora propiedades disponibles para comprar en Madrid, Pinto y alrededores con Alvar Consultores Inmobiliarios.',
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
        aside={(
          <>
            <strong>{filtered.length.toString().padStart(2, '0')}</strong>
            <span>{filtered.length === 1 ? 'resultado' : 'resultados'}</span>
          </>
        )}
      />

      <section className="catalogue section-pad">
        <Container>
          <p className="catalogue-note">Selección orientativa. Inventario sujeto a actualización.</p>
          <PropertyFilters value={filters} onChange={setFilters} />
          <PropertyGrid properties={filtered} />

          {activeOperation === 'alquiler' ? (
            <aside className="rental-owner-cta" aria-labelledby="rental-owner-title">
              <span className="rental-owner-cta__eyebrow">GESTIÓN DE ALQUILER</span>
              <div className="rental-owner-cta__content">
                <h2 id="rental-owner-title">¿Quieres alquilar tu piso?</h2>
                <p>
                  Te ayudamos a preparar la vivienda, seleccionar inquilino, revisar documentación y gestionar el
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
                  <span className="button__arrow" aria-hidden="true">↗</span>
                </a>
                <Button to="/contacto" variant="secondary">Contactar</Button>
                <small>{business.phoneMobile}</small>
              </div>
            </aside>
          ) : (
            <div className="catalogue-cta">
              <p>¿No encuentras lo que buscas?</p>
              <Button to="/contacto" variant="secondary">Cuéntanos qué estás buscando</Button>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

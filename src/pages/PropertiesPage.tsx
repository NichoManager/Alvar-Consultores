import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyFilters, type FilterState } from '../components/properties/PropertyFilters';
import { PropertyGrid } from '../components/properties/PropertyGrid';
import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { properties } from '../data/properties';

export function PropertiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters: FilterState = useMemo(() => ({
    operation: searchParams.get('operation') ?? '',
    city: searchParams.get('city') ?? '',
    type: searchParams.get('type') ?? '',
    bedrooms: searchParams.get('bedrooms') ?? '',
    minPrice: searchParams.get('minPrice') ?? '0',
    maxPrice: searchParams.get('maxPrice') ?? '',
    order: searchParams.get('order') ?? 'featured',
  }), [searchParams]);
  const setFilters = (next: FilterState) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value && !(key === 'minPrice' && value === '0') && !(key === 'order' && value === 'featured')) params.set(key, value);
    });
    setSearchParams(params, { replace: true });
  };
  const filtered = useMemo(() => {
    const operation = filters.operation === 'venta' ? 'Comprar' : filters.operation === 'alquiler' ? 'Alquilar' : '';
    const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const result = properties.filter((item) => {
      const matchesPrice = item.price === null
        ? !filters.maxPrice && Number(filters.minPrice || 0) === 0
        : item.price >= Number(filters.minPrice || 0) && (!filters.maxPrice || item.price <= Number(filters.maxPrice));
      return (!operation || item.operation === operation)
        && (!filters.city || item.city === filters.city)
        && (!filters.type || normalize(item.propertyType) === filters.type)
        && (!filters.bedrooms || (item.bedrooms ?? 0) >= Number(filters.bedrooms))
        && matchesPrice;
    });
    return [...result].sort((a, b) => filters.order === 'recent' ? b.createdAt.localeCompare(a.createdAt) : filters.order === 'priceAsc' ? (a.price ?? Infinity) - (b.price ?? Infinity) : filters.order === 'priceDesc' ? (b.price ?? 0) - (a.price ?? 0) : Number(b.featured) - Number(a.featured));
  }, [filters]);
  return <><SeoHead title="Inmuebles en Madrid y zona sur | Alvar Consultores" description="Consulta una selección orientativa de inmuebles y cuéntanos qué vivienda buscas en Madrid, Pinto o Móstoles." path="/inmuebles" /><InternalHero eyebrow="INMUEBLES" title={<>Encuentra tu próxima<br /><em>propiedad.</em></>} text="Una selección orientativa para iniciar una búsqueda ajustada a tus prioridades." aside={<><strong>{filtered.length.toString().padStart(2, '0')}</strong><span>{filtered.length === 1 ? 'resultado' : 'resultados'}</span></>} /><section className="catalogue section-pad"><Container><p className="catalogue-note">Selección orientativa. Inventario sujeto a actualización.</p><PropertyFilters value={filters} onChange={setFilters} /><PropertyGrid properties={filtered} /><div className="catalogue-cta"><p>¿No encuentras lo que buscas?</p><Button to="/contacto" variant="secondary">Cuéntanos qué estás buscando</Button></div></Container></section></>;
}

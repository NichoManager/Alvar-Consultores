import { useMemo, useState } from 'react';
import { PropertyFilters, type FilterState } from '../components/properties/PropertyFilters';
import { PropertyGrid } from '../components/properties/PropertyGrid';
import { SeoHead } from '../components/seo/SeoHead';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { InternalHero } from '../components/ui/InternalHero';
import { properties } from '../data/properties';

export function PropertiesPage() {
  const [filters, setFilters] = useState<FilterState>({ operation: '', city: '', type: '', bedrooms: '', order: 'featured' });
  const filtered = useMemo(() => {
    const result = properties.filter((item) => (!filters.operation || item.operation === filters.operation) && (!filters.city || item.city === filters.city) && (!filters.type || item.propertyType === filters.type) && (!filters.bedrooms || (item.bedrooms ?? 0) >= Number(filters.bedrooms)));
    return [...result].sort((a, b) => filters.order === 'recent' ? b.createdAt.localeCompare(a.createdAt) : filters.order === 'priceAsc' ? (a.price ?? Infinity) - (b.price ?? Infinity) : filters.order === 'priceDesc' ? (b.price ?? 0) - (a.price ?? 0) : Number(b.featured) - Number(a.featured));
  }, [filters]);
  return <><SeoHead title="Inmuebles en Madrid y zona sur | Alvar Consultores" description="Consulta el catálogo demo de Alvar Consultores Inmobiliarios y cuéntanos qué vivienda buscas en Madrid, Pinto o Móstoles." path="/inmuebles" /><InternalHero eyebrow="INMUEBLES" title={<>Encuentra tu próxima<br /><em>propiedad.</em></>} text="Una selección inicial preparada para incorporar el inventario real del equipo." aside={<><strong>{filtered.length.toString().padStart(2, '0')}</strong><span>{filtered.length === 1 ? 'inmueble demo' : 'inmuebles demo'}</span></>} /><section className="catalogue section-pad"><Container><div className="demo-notice"><strong>Catálogo de demostración</strong><span>Los inmuebles y visuales mostrados no representan inventario real confirmado.</span></div><PropertyFilters value={filters} onChange={setFilters} /><PropertyGrid properties={filtered} /><div className="catalogue-cta"><p>¿No encuentras lo que buscas?</p><Button to="/contacto" variant="secondary">Cuéntanos qué estás buscando</Button></div></Container></section></>;
}

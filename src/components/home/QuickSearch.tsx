import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PropertyLocationFilter } from '../properties/PropertyLocationFilter';
import '../properties/PropertyFilters.css';
import {
  buildPropertyLocationOptions,
  type PropertyLocationOption,
} from '../../lib/propertyFilters';
import { propertyTypeOptions } from '../../data/propertyOptions';
import { getPublishedProperties } from '../../lib/properties';
import type { Property } from '../../types/content';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';

export function QuickSearch() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [operation, setOperation] = useState('venta');
  const [location, setLocation] = useState<PropertyLocationOption>();
  const [type, setType] = useState('');

  useEffect(() => {
    let mounted = true;
    getPublishedProperties()
      .then((items) => {
        if (mounted) setProperties(items);
      })
      .catch((error) => console.error('Error loading public property filters:', error))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const locationOptions = useMemo(() => buildPropertyLocationOptions(properties), [properties]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (operation) params.set('operation', operation);
    if (location?.province) params.set('province', location.province);
    if (location?.city) params.set('city', location.city);
    if (location?.area) params.set('area', location.area);
    if (type) params.set('type', type);
    navigate(`/inmuebles?${params.toString()}`);
  };

  return (
    <section className="quick-search-wrap" aria-labelledby="quick-search-title">
      <Container>
        <div className="quick-search-console">
          <div className="quick-search-console__copy">
            <p className="eyebrow">Búsqueda inmobiliaria</p>
            <h2 id="quick-search-title">Encuentra tu próxima propiedad <em>con criterio.</em></h2>
            <p id="quick-search-description">
              Selecciona operación, ubicación y tipo de inmueble. Las ubicaciones disponibles se actualizan con nuestro inventario público.
            </p>
            <Link to="/contacto" className="quick-search-console__advisor">
              Prefiero que me asesoren <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <form className="quick-search-console__form" onSubmit={submit} aria-describedby="quick-search-description">
            <div className="quick-search-console__field quick-search-console__field--wide">
              <label htmlFor="quick-operation">Operación</label>
              <select id="quick-operation" value={operation} onChange={(event) => setOperation(event.target.value)}>
                <option value="venta">Comprar</option>
                <option value="alquiler">Alquilar</option>
              </select>
            </div>

            <div className="quick-search-console__field quick-search-console__field--wide">
              <PropertyLocationFilter
                id="quick-location"
                options={locationOptions}
                value={location}
                onChange={setLocation}
                disabled={loading}
              />
            </div>

            <div className="quick-search-console__field quick-search-console__field--wide">
              <label htmlFor="quick-type">Tipo de inmueble</label>
              <select id="quick-type" value={type} onChange={(event) => setType(event.target.value)} disabled={loading}>
                <option value="">Cualquier tipo</option>
                {propertyTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>

            <div className="quick-search-console__actions">
              <Button type="submit">Buscar inmuebles</Button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}

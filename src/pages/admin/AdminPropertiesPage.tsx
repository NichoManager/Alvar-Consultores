import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Property = {
  id: string;
  reference: string | null;
  title: string;
  operation: 'venta' | 'alquiler';
  status: 'draft' | 'published' | 'reserved' | 'sold' | 'rented' | 'archived';
  price: number;
  city: string;
  area: string | null;
  featured: boolean;
  created_at: string;
};

export function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      setError('');

      const { data, error: propertiesError } = await supabase
        .from('properties')
        .select(
          'id, reference, title, operation, status, price, city, area, featured, created_at',
        )
        .order('created_at', { ascending: false });

      if (propertiesError) {
        console.error('Error loading properties:', propertiesError);
        setError('No se han podido cargar los inmuebles.');
        setIsLoading(false);
        return;
      }

      setProperties((data ?? []) as Property[]);
      setIsLoading(false);
    };

    void loadProperties();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <main className="admin-properties">
      <header className="admin-properties__header">
        <div>
          <span>ALVAR CONSULTORES</span>
          <h1>Inmuebles</h1>
        </div>

        <div>
          <button type="button">
            + Nuevo inmueble
          </button>

          <button
            type="button"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="admin-properties__content">
        <div className="admin-properties__intro">
          <div>
            <p>GESTIÓN INMOBILIARIA</p>
            <h2>Propiedades</h2>
          </div>

          <span>
            {properties.length}{' '}
            {properties.length === 1 ? 'inmueble' : 'inmuebles'}
          </span>
        </div>

        {isLoading ? (
          <p>Cargando inmuebles...</p>
        ) : null}

        {error ? (
          <p role="alert">
            {error}
          </p>
        ) : null}

        {!isLoading && !error && properties.length === 0 ? (
          <div className="admin-properties__empty">
            <span>Sin inmuebles todavía</span>

            <h3>Publica tu primer inmueble.</h3>

            <p>
              Desde aquí podrás añadir viviendas en venta o alquiler,
              incorporar fotografías y decidir cuáles aparecen en la web.
            </p>

            <button type="button">
              Crear primer inmueble
            </button>
          </div>
        ) : null}

        {!isLoading && properties.length > 0 ? (
          <div className="admin-properties__list">
            {properties.map((property) => (
              <article
                key={property.id}
                className="admin-property-card"
              >
                <div>
                  <span>
                    {property.operation === 'venta'
                      ? 'VENTA'
                      : 'ALQUILER'}
                  </span>

                  <h3>{property.title}</h3>

                  <p>
                    {property.area
                      ? `${property.area} · ${property.city}`
                      : property.city}
                  </p>
                </div>

                <div>
                  <strong>
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0,
                    }).format(property.price)}
                  </strong>

                  <span>{property.status}</span>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import '../../styles/admin.css';

type PropertyStatus =
  | 'draft'
  | 'published'
  | 'reserved'
  | 'sold'
  | 'rented'
  | 'archived';

type OperationFilter = 'all' | 'venta' | 'alquiler';
type StatusFilter = 'all' | PropertyStatus;

type PropertyImage = {
  id: string;
  storage_path: string;
  is_cover: boolean;
  position: number;
};

type Property = {
  id: string;
  reference: string | null;
  title: string;
  operation: 'venta' | 'alquiler';
  status: PropertyStatus;
  price: number;
  city: string;
  area: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  built_area: number | null;
  created_at: string;
  property_images: PropertyImage[];
};

const statusLabels: Record<PropertyStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  reserved: 'Reservado',
  sold: 'Vendido',
  rented: 'Alquilado',
  archived: 'Archivado',
};

const summaryStatuses: Array<{
  status: PropertyStatus;
  singular: string;
  plural: string;
}> = [
  {
    status: 'published',
    singular: 'publicado',
    plural: 'publicados',
  },
  {
    status: 'draft',
    singular: 'borrador',
    plural: 'borradores',
  },
  {
    status: 'reserved',
    singular: 'reservado',
    plural: 'reservados',
  },
  {
    status: 'sold',
    singular: 'vendido',
    plural: 'vendidos',
  },
  {
    status: 'rented',
    singular: 'alquilado',
    plural: 'alquilados',
  },
  {
    status: 'archived',
    singular: 'archivado',
    plural: 'archivados',
  },
];

const priceFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const areaFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 2,
});

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getCoverImage(images: PropertyImage[]) {
  return (
    images.find((image) => image.is_cover) ??
    [...images].sort(
      (a, b) => a.position - b.position,
    )[0]
  );
}

function getPublicImageUrl(storagePath: string) {
  return supabase.storage
    .from('property-images')
    .getPublicUrl(storagePath).data.publicUrl;
}

export function AdminPropertiesPage() {
  const navigate = useNavigate();

  const [properties, setProperties] =
    useState<Property[]>([]);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isSuperadmin, setIsSuperadmin] =
    useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [
    operationFilter,
    setOperationFilter,
  ] = useState<OperationFilter>('all');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>('all');

  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      setError('');

      const {
        data,
        error: propertiesError,
      } = await supabase
        .from('properties')
        .select(
          `
            id,
            reference,
            title,
            operation,
            status,
            price,
            city,
            area,
            bedrooms,
            bathrooms,
            built_area,
            created_at,
            property_images (
              id,
              storage_path,
              is_cover,
              position
            )
          `,
        )
        .order('created_at', {
          ascending: false,
        });

      if (propertiesError) {
        console.error(
          'Error loading properties:',
          propertiesError,
        );

        setError(
          'No se han podido cargar los inmuebles.',
        );

        setIsLoading(false);
        return;
      }

      setProperties(
        (data ?? []) as Property[],
      );

      setIsLoading(false);
    };

    void loadProperties();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkSuperadmin = async () => {
      const { data, error: superadminError } =
        await supabase.rpc('is_superadmin');

      if (!superadminError && data === true && isMounted) {
        setIsSuperadmin(true);
      }
    };

    void checkSuperadmin();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProperties = useMemo(() => {
    const normalizedSearch =
      normalizeSearch(search);

    return properties.filter(
      (property) => {
        const matchesSearch =
          !normalizedSearch ||
          [
            property.title,
            property.reference,
            property.city,
            property.area,
          ].some((value) =>
            normalizeSearch(
              value ?? '',
            ).includes(normalizedSearch),
          );

        const matchesOperation =
          operationFilter === 'all' ||
          property.operation ===
            operationFilter;

        const matchesStatus =
          statusFilter === 'all' ||
          property.status === statusFilter;

        return (
          matchesSearch &&
          matchesOperation &&
          matchesStatus
        );
      },
    );
  }, [
    operationFilter,
    properties,
    search,
    statusFilter,
  ]);

  const summary = useMemo(() => {
    const parts = [
      `${properties.length} ${
        properties.length === 1
          ? 'inmueble'
          : 'inmuebles'
      }`,
    ];

    summaryStatuses.forEach(
      ({
        status,
        singular,
        plural,
      }) => {
        const count =
          properties.filter(
            (property) =>
              property.status === status,
          ).length;

        if (count > 0) {
          parts.push(
            `${count} ${
              count === 1
                ? singular
                : plural
            }`,
          );
        }
      },
    );

    return parts.join(' · ');
  }, [properties]);

  const clearFilters = () => {
    setSearch('');
    setOperationFilter('all');
    setStatusFilter('all');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    navigate('/admin/login', {
      replace: true,
    });
  };

  return (
    <main className="admin-properties">
      <header className="admin-properties__header">
        <div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-site-link"
            aria-label="Abrir la web pública de Alvar Consultores en una nueva pestaña"
          >
            ALVAR CONSULTORES{' '}
            <span aria-hidden="true">
              ↗
            </span>
          </a>

          <h1>Inmuebles</h1>
        </div>

        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                '/admin/inmuebles/nuevo',
              )
            }
          >
            + Nuevo inmueble
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/contactos')}
          >
            Contactos
          </button>

          {isSuperadmin ? (
            <button
              type="button"
              onClick={() => navigate('/admin/usuarios')}
            >
              Usuarios
            </button>
          ) : null}

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
            <p>
              GESTIÓN INMOBILIARIA
            </p>

            <h2>Propiedades</h2>

            {!isLoading && !error ? (
              <span className="admin-properties__summary">
                {summary}
              </span>
            ) : null}
          </div>
        </div>

        {!isLoading &&
        !error &&
        properties.length > 0 ? (
          <div className="admin-properties__toolbar">
            <div className="admin-properties__search">
              <label
                htmlFor="admin-property-search"
                className="sr-only"
              >
                Buscar inmuebles
              </label>

              <input
                id="admin-property-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Buscar por título, referencia, ciudad o zona"
              />
            </div>

            <div
              className="admin-properties__operation-filter"
              aria-label="Filtrar por operación"
            >
              {[
                ['all', 'Todos'],
                ['venta', 'Venta'],
                [
                  'alquiler',
                  'Alquiler',
                ],
              ].map(
                ([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    className={
                      operationFilter ===
                      value
                        ? 'is-active'
                        : ''
                    }
                    aria-pressed={
                      operationFilter ===
                      value
                    }
                    onClick={() =>
                      setOperationFilter(
                        value as OperationFilter,
                      )
                    }
                  >
                    {label}
                  </button>
                ),
              )}
            </div>

            <div className="admin-properties__status-filter">
              <label
                htmlFor="admin-property-status"
                className="sr-only"
              >
                Filtrar por estado
              </label>

              <select
                id="admin-property-status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as StatusFilter,
                  )
                }
              >
                <option value="all">
                  Todos los estados
                </option>

                <option value="published">
                  Publicado
                </option>

                <option value="draft">
                  Borrador
                </option>

                <option value="reserved">
                  Reservado
                </option>

                <option value="sold">
                  Vendido
                </option>

                <option value="rented">
                  Alquilado
                </option>

                <option value="archived">
                  Archivado
                </option>
              </select>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <p className="admin-properties__loading">
            Cargando inmuebles...
          </p>
        ) : null}

        {error ? (
          <p
            className="admin-properties__error"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {!isLoading &&
        !error &&
        properties.length === 0 ? (
          <div className="admin-properties__empty">
            <span>
              Sin inmuebles todavía
            </span>

            <h3>
              Publica tu primer inmueble.
            </h3>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/admin/inmuebles/nuevo',
                )
              }
            >
              Crear primer inmueble
            </button>
          </div>
        ) : null}

        {!isLoading &&
        !error &&
        properties.length > 0 &&
        filteredProperties.length ===
          0 ? (
          <div className="admin-properties__empty admin-properties__empty--filtered">
            <h3>
              No encontramos inmuebles
              con estos filtros.
            </h3>

            <button
              type="button"
              onClick={clearFilters}
            >
              Limpiar filtros
            </button>
          </div>
        ) : null}

        {!isLoading &&
        filteredProperties.length >
          0 ? (
          <div className="admin-properties__list">
            {filteredProperties.map(
              (property) => {
                const coverImage =
                  getCoverImage(
                    property.property_images ??
                      [],
                  );

                const features = [
                  property.bedrooms !==
                  null
                    ? `${
                        property.bedrooms
                      } ${
                        property.bedrooms ===
                        1
                          ? 'dormitorio'
                          : 'dormitorios'
                      }`
                    : null,

                  property.bathrooms !==
                  null
                    ? `${
                        property.bathrooms
                      } ${
                        property.bathrooms ===
                        1
                          ? 'baño'
                          : 'baños'
                      }`
                    : null,

                  property.built_area !==
                  null
                    ? `${areaFormatter.format(
                        property.built_area,
                      )} m²`
                    : null,
                ].filter(Boolean);

                return (
                  <article
                    key={property.id}
                    className="admin-property-card"
                  >
                    <div className="admin-property-card__media">
                      {coverImage ? (
                        <img
                          src={getPublicImageUrl(
                            coverImage.storage_path,
                          )}
                          alt={`Fotografía principal de ${property.title}`}
                          loading="lazy"
                        />
                      ) : (
                        <span>
                          Sin fotografías
                        </span>
                      )}
                    </div>

                    <div className="admin-property-card__content">
                      <p className="admin-property-card__eyebrow">
                        <span>
                          {property.operation ===
                          'venta'
                            ? 'VENTA'
                            : 'ALQUILER'}
                        </span>

                        {property.reference
                          ? ` · REF. ${property.reference}`
                          : ''}
                      </p>

                      <h3>
                        {property.title}
                      </h3>

                      <p className="admin-property-card__location">
                        {[
                          property.area,
                          property.city,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>

                      {features.length >
                      0 ? (
                        <p className="admin-property-card__features">
                          {features.join(
                            ' · ',
                          )}
                        </p>
                      ) : null}
                    </div>

                    <div className="admin-property-card__aside">
                      <strong>
                        {priceFormatter.format(
                          property.price,
                        )}
                      </strong>

                      <span
                        className={`admin-status admin-status--${property.status}`}
                      >
                        {
                          statusLabels[
                            property.status
                          ]
                        }
                      </span>

                      <button
                        type="button"
                        className="admin-property-card__edit"
                        onClick={() =>
                          navigate(
                            `/admin/inmuebles/${property.id}/editar`,
                          )
                        }
                      >
                        Editar{' '}
                        <span aria-hidden="true">
                          →
                        </span>
                      </button>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}

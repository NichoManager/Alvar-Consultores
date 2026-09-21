import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminCurrentUser } from '../../components/admin/AdminCurrentUser';
import {
  addressVisibilityOptions,
  buildingCertificationOptions,
  chaletTypeOptions,
  communityFeePeriodOptions,
  energyRatingOptions,
  energyCertificateStatusOptions,
  heatingTypeOptions,
  officeBuildingUseOptions,
  officeSpaceTypeOptions,
  orientationOptions,
  parkingTypeOptions,
  propertyAmenityGroups,
  propertyConditionOptions,
  propertyTypeOptions,
} from '../../data/propertyOptions';
import {
  FLOORPLAN_ACCEPT,
  uploadPropertyFloorplans,
  validateFloorplanFiles,
} from '../../lib/propertyMedia';
import { supabase } from '../../lib/supabase';
import '../../styles/admin.css';
import '../../styles/admin-property-enhancements.css';

type PropertyOperation =
  | 'venta'
  | 'alquiler';

function createSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9\s-]/g,
      '',
    )
    .trim()
    .replace(
      /[\s-]+/g,
      '-',
    );
}

function nullableText(
  value:
    | FormDataEntryValue
    | null,
) {
  const normalized =
    String(value ?? '').trim();

  return normalized || null;
}

function nullableNumber(
  value:
    | FormDataEntryValue
    | null,
) {
  const normalized =
    String(value ?? '').trim();

  if (!normalized) {
    return null;
  }

  const number =
    Number(normalized);

  return Number.isFinite(number)
    ? number
    : null;
}

function parsePrice(
  value:
    | FormDataEntryValue
    | null,
) {
  const normalized =
    String(value ?? '')
      .trim()
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

  if (!normalized) {
    return null;
  }

  const number =
    Number(normalized);

  return Number.isFinite(number)
    ? number
    : null;
}

export function AdminPropertyCreatePage() {
  const navigate =
    useNavigate();

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    operation,
    setOperation,
  ] =
    useState<PropertyOperation>(
      'venta',
    );

  const [
    selectedPropertyType,
    setSelectedPropertyType,
  ] = useState('Piso');

  const [
    seoTitle,
    setSeoTitle,
  ] = useState('');

  const [
    seoDescription,
    setSeoDescription,
  ] = useState('');

  const [
    featured,
    setFeatured,
  ] = useState(false);

  const [
    floorplans,
    setFloorplans,
  ] = useState<
    Array<{
      file: File;
      preview: string;
    }>
  >([]);

  const floorplanPreviewsRef =
    useRef<string[]>([]);

  useEffect(() => {
    floorplanPreviewsRef.current =
      floorplans.map(
        ({ preview }) =>
          preview,
      );
  }, [floorplans]);

  useEffect(
    () => () => {
      floorplanPreviewsRef.current.forEach(
        (preview) =>
          URL.revokeObjectURL(
            preview,
          ),
      );
    },
    [],
  );

  const addFloorplans = (
    files: File[],
  ) => {
    const result =
      validateFloorplanFiles(
        files,
      );

    setError(
      result.errors.join(' '),
    );

    setFloorplans(
      (current) => [
        ...current,
        ...result.validFiles.map(
          (file) => ({
            file,
            preview:
              URL.createObjectURL(
                file,
              ),
          }),
        ),
      ],
    );
  };

  const removeFloorplan = (
    index: number,
  ) => {
    setFloorplans(
      (current) => {
        URL.revokeObjectURL(
          current[index]
            .preview,
        );

        return current.filter(
          (
            _,
            itemIndex,
          ) =>
            itemIndex !==
            index,
        );
      },
    );
  };

  const handleLogout =
    async () => {
      await supabase.auth.signOut();

      navigate(
        '/admin/login',
        {
          replace: true,
        },
      );
    };

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      const formData =
        new FormData(
          event.currentTarget,
        );

      const propertyType =
        String(
          formData.get(
            'property_type',
          ) ?? '',
        );

const isOffice =
  propertyType ===
  'Oficina';

const isChalet =
  propertyType ===
  'Chalet';

const officeAddressVisibility =
        isOffice
          ? String(
            formData.get(
              'address_visibility',
            ) ?? 'hidden',
          )
          : formData.has(
            'show_exact_address',
          )
            ? 'exact'
            : 'hidden';

      const officeElevatorsCount =
        isOffice
          ? nullableNumber(
            formData.get(
              'elevators_count',
            ),
          )
          : null;

      const title =
        String(
          formData.get(
            'title',
          ) ?? '',
        ).trim();

      const city =
        String(
          formData.get(
            'city',
          ) ?? '',
        ).trim();

      const province =
        String(
          formData.get(
            'province',
          ) ?? '',
        ).trim();

      const slug =
        createSlug(title);

      const price =
        parsePrice(
          formData.get(
            'price',
          ),
        );

      const hasParking =
        formData.has(
          'parking',
        );

      const exposure =
        String(
          formData.get(
            'exposure',
          ) ?? '',
        );

      const communityFeeAmount =
        nullableNumber(
          formData.get(
            'community_fee_amount',
          ),
        );

      const featuredPosition =
        featured
          ? nullableNumber(
            formData.get(
              'featured_position',
            ),
          )
          : null;

      if (
        !slug ||
        price === null ||
        price < 0
      ) {
        setError(
          'Revisa el título y el precio antes de guardar el inmueble.',
        );

        return;
      }

      if (!city) {
        setError(
          'Introduce la localidad o municipio del inmueble.',
        );

        return;
      }

   if (!province) {
  setError(
    'Introduce la provincia del inmueble.',
  );

  return;
}

if (
  isChalet &&
  !nullableText(
    formData.get(
      'chalet_type',
    ),
  )
) {
  setError(
    'Selecciona la tipología del chalet.',
  );

  return;
}

if (
  featuredPosition !== null &&
        (
          !Number.isInteger(
            featuredPosition,
          ) ||
          featuredPosition < 1
        )
      ) {
        setError(
          'La posición en destacados debe ser un número entero igual o mayor que 1.',
        );

        return;
      }

      setError('');
      setIsSubmitting(true);

      try {
        const {
          data: createdProperty,
          error: insertError,
        } =
          await supabase
            .from(
              'properties',
            )
            .insert({
              reference:
                nullableText(
                  formData.get(
                    'reference',
                  ),
                ),

              title,

              slug,

              seo_title:
                nullableText(
                  formData.get(
                    'seo_title',
                  ),
                ),

              seo_description:
                nullableText(
                  formData.get(
                    'seo_description',
                  ),
                ),

              operation:
                String(
                  formData.get(
                    'operation',
                  ),
                ),

              property_type:
                propertyType,

              status:
                'draft',

              price,

              currency:
                'EUR',

              city,

              province,

              area:
                nullableText(
                  formData.get(
                    'area',
                  ),
                ),

              postal_code:
                nullableText(
                  formData.get(
                    'postal_code',
                  ),
                ),

              address:
                nullableText(
                  formData.get(
                    'address',
                  ),
                ),

              show_exact_address:
                officeAddressVisibility ===
                'exact',

              address_visibility:
                officeAddressVisibility,

              street_number:
                isOffice
                  ? nullableText(
                    formData.get(
                      'street_number',
                    ),
                  )
                  : null,

              block:
                isOffice
                  ? nullableText(
                    formData.get(
                      'block',
                    ),
                  )
                  : null,

              door:
                isOffice
                  ? nullableText(
                    formData.get(
                      'door',
                    ),
                  )
                  : null,

              urbanization_name:
                isOffice
                  ? nullableText(
                    formData.get(
                      'urbanization_name',
                    ),
                  )
                  : null,

              cadastral_reference:
                isOffice
                  ? nullableText(
                    formData.get(
                      'cadastral_reference',
                    ),
                  )
                  : null,

              bedrooms:
                isOffice
                  ? null
                  : nullableNumber(
                    formData.get(
                      'bedrooms',
                    ),
                  ),

              bathrooms:
                nullableNumber(
                  formData.get(
                    'bathrooms',
                  ),
                ),

              built_area:
                nullableNumber(
                  formData.get(
                    'built_area',
                  ),
                ),

              usable_area:
                nullableNumber(
                  formData.get(
                    'usable_area',
                  ),
                ),

              plot_area:
                isOffice
                  ? null
                  : nullableNumber(
                    formData.get(
                      'plot_area',
                    ),
                  ),

              floor:
                nullableText(
                  formData.get(
                    'floor',
                  ),
                ),

              floors_count:
                isOffice
                  ? null
                  : nullableNumber(
                    formData.get(
                      'floors_count',
                    ),
                  ),

              construction_year:
                nullableNumber(
                  formData.get(
                    'construction_year',
                  ),
                ),

              property_condition:
                nullableText(
                  formData.get(
                    'property_condition',
                  ),
                ),

              orientations:
                formData
                  .getAll(
                    'orientations',
                  )
                  .map(String),

              heating_type:
                nullableText(
                  formData.get(
                    'heating_type',
                  ),
                ),

              elevator:
                officeElevatorsCount !==
                  null
                  ? officeElevatorsCount >
                  0
                  : formData.has(
                    'elevator',
                  ),

              parking:
                hasParking,

              parking_type:
                hasParking
                  ? nullableText(
                    formData.get(
                      'parking_type',
                    ),
                  )
                  : null,

              parking_spaces:
                hasParking
                  ? nullableNumber(
                    formData.get(
                      'parking_spaces',
                    ),
                  )
                  : null,

              terrace:
                formData.has(
                  'terrace',
                ),

              furnished:
                formData.has(
                  'furnished',
                ),

exterior:
  exposure ===
  'exterior',

chalet_type:
  isChalet
    ? nullableText(
        formData.get(
          'chalet_type',
        ),
      )
    : null,

office_space_type:
  isOffice
    ? nullableText(
        formData.get(
          'office_space_type',
        ),
      )
    : null,

              gross_leasable_area:
                isOffice
                  ? nullableNumber(
                    formData.get(
                      'gross_leasable_area',
                    ),
                  )
                  : null,

              workstation_area:
                isOffice
                  ? nullableNumber(
                    formData.get(
                      'workstation_area',
                    ),
                  )
                  : null,

              building_use:
                isOffice
                  ? nullableText(
                    formData.get(
                      'building_use',
                    ),
                  )
                  : null,

              available_from:
                isOffice
                  ? nullableText(
                    formData.get(
                      'available_from',
                    ),
                  )
                  : null,

              building_certifications:
                isOffice
                  ? formData
                    .getAll(
                      'building_certifications',
                    )
                    .map(String)
                  : [],

              building_floors_count:
                isOffice
                  ? nullableNumber(
                    formData.get(
                      'building_floors_count',
                    ),
                  )
                  : null,

              office_floors_count:
                isOffice
                  ? nullableNumber(
                    formData.get(
                      'office_floors_count',
                    ),
                  )
                  : null,

              elevators_count:
                officeElevatorsCount,

              video_url:
                nullableText(
                  formData.get(
                    'video_url',
                  ),
                ),

              virtual_tour_url:
                nullableText(
                  formData.get(
                    'virtual_tour_url',
                  ),
                ),

              community_fee_amount:
                communityFeeAmount,

              community_fee_period:
                communityFeeAmount !==
                  null
                  ? nullableText(
                    formData.get(
                      'community_fee_period',
                    ),
                  )
                  : null,

              ibi_annual_amount:
                nullableNumber(
                  formData.get(
                    'ibi_annual_amount',
                  ),
                ),

              energy_certificate_status:
                nullableText(
                  formData.get(
                    'energy_certificate_status',
                  ),
                ),

              energy_consumption_rating:
                nullableText(
                  formData.get(
                    'energy_consumption_rating',
                  ),
                ),

              energy_consumption_value:
                nullableNumber(
                  formData.get(
                    'energy_consumption_value',
                  ),
                ),

              energy_emissions_rating:
                nullableText(
                  formData.get(
                    'energy_emissions_rating',
                  ),
                ),

              energy_emissions_value:
                nullableNumber(
                  formData.get(
                    'energy_emissions_value',
                  ),
                ),

              features: [
                ...formData
                  .getAll(
                    'features',
                  )
                  .map(String),

                ...(exposure ===
                  'interior'
                  ? [
                    'Interior',
                  ]
                  : []),
              ],

              description:
                String(
                  formData.get(
                    'description',
                  ) ?? '',
                ).trim(),

              featured,

              featured_position:
                featuredPosition,

              published_at:
                null,
            })
            .select('id')
            .single();

        if (insertError) {
          console.error(
            'Error creating property:',
            insertError,
          );

          setError(
            'No se ha podido guardar el inmueble. Revisa los datos o inténtalo de nuevo.',
          );

          return;
        }

        const uploadResult =
          await uploadPropertyFloorplans(
            {
              propertyId:
                createdProperty.id,

              propertyTitle:
                title,

              propertyCity:
                city,

              files:
                floorplans.map(
                  ({ file }) =>
                    file,
                ),

              startPosition:
                0,
            },
          );

        navigate(
          `/admin/inmuebles/${createdProperty.id}/editar`,
          {
            replace: true,

            state:
              uploadResult
                .errors
                .length
                ? {
                  floorplanUploadWarning:
                    uploadResult.errors.join(
                      ' ',
                    ),
                }
                : undefined,
          },
        );
      } catch (
      unexpectedError
      ) {
        console.error(
          'Unexpected property creation error:',
          unexpectedError,
        );

        setError(
          'No se ha podido guardar el inmueble. Inténtalo de nuevo en unos minutos.',
        );
      } finally {
        setIsSubmitting(
          false,
        );
      }
    };

const isOffice =
  selectedPropertyType ===
  'Oficina';

const isChalet =
  selectedPropertyType ===
  'Chalet';

return (
    <main className="admin-property-form-page">
      <header className="admin-property-form__header">
        <div className="admin-property-form__header-inner">
          <div className="admin-property-form__header-top">
            <button
              type="button"
              className="admin-property-form__back"
              onClick={() =>
                navigate(
                  '/admin/inmuebles',
                )
              }
            >
              <span
                aria-hidden="true"
              >
                ←
              </span>{' '}
              Volver a inmuebles
            </button>

            <div className="admin-header-session">
              <AdminCurrentUser />

              <button
                type="button"
                onClick={
                  handleLogout
                }
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-site-link"
            aria-label="Abrir la web pública de Alvar Consultores en una nueva pestaña"
          >
            ALVAR CONSULTORES{' '}
            <span
              aria-hidden="true"
            >
              ↗
            </span>
          </a>

          <h1>
            Nuevo inmueble
          </h1>

          <p>
            Añade la información,
            características y
            planos. Después podrás
            incorporar fotografías
            y revisar el inmueble
            antes de publicarlo.
          </p>
        </div>
      </header>

      <form
        className="admin-property-form"
        onSubmit={
          handleSubmit
        }
      >
        <p className="admin-property-form__required-note">
          Los campos marcados con *
          son obligatorios.
        </p>

        <section className="admin-property-form__section">
          <div>
            <span>01</span>

            <h2>
              Datos principales
            </h2>
          </div>

          <div className="admin-property-form__grid">
            <label className="admin-property-form__field">
              <span>
                Operación *
              </span>

              <select
                name="operation"
                value={
                  operation
                }
                onChange={(
                  event,
                ) =>
                  setOperation(
                    event.target
                      .value as PropertyOperation,
                  )
                }
                required
              >
                <option value="venta">
                  Venta
                </option>

                <option value="alquiler">
                  Alquiler
                </option>
              </select>
            </label>

   <label className="admin-property-form__field">
  <span>
    Tipo de inmueble *
  </span>

  <select
    name="property_type"
    value={
      selectedPropertyType
    }
    onChange={(
      event,
    ) =>
      setSelectedPropertyType(
        event.target.value,
      )
    }
    required
  >
    {propertyTypeOptions.map(
      (option) => (
        <option
          value={
            option.value
          }
          key={
            option.value
          }
        >
          {
            option.label
          }
        </option>
      ),
    )}
  </select>
</label>

{isChalet ? (
  <label className="admin-property-form__field">
    <span>
      Tipología *
    </span>

    <select
      name="chalet_type"
      defaultValue=""
      required
    >
      <option
        value=""
        disabled
      >
        Selecciona una tipología
      </option>

      {chaletTypeOptions.map(
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

    <small className="admin-property-form__helper">
      Indica si se trata de un chalet
      adosado, pareado o independiente.
    </small>
  </label>
) : null}

            <label className="admin-property-form__field">
              <span>
                Título *
              </span>

              <input
                type="text"
                name="title"
                placeholder="Ej. Piso luminoso con terraza en Pinto"
                required
              />
            </label>

            <label className="admin-property-form__field">
              <span>
                Referencia
              </span>

              <input
                type="text"
                name="reference"
                placeholder="Ej. ALV-001"
              />
            </label>

            <label className="admin-property-form__field">
              <span>
                Precio *
              </span>

              <span className="admin-property-form__input-suffix">
                <input
                  type="text"
                  name="price"
                  inputMode="numeric"
                  placeholder={
                    operation ===
                      'alquiler'
                      ? 'Ej. 1.500'
                      : 'Ej. 250.000'
                  }
                  required
                />

                <span
                  aria-hidden="true"
                >
                  {operation ===
                    'alquiler'
                    ? '€/mes'
                    : '€'}
                </span>
              </span>

              <small className="admin-property-form__helper">
                Puedes escribir,
                por ejemplo,{' '}
                {operation ===
                  'alquiler'
                  ? '1500 o 1.500'
                  : '250000 o 250.000'}
                .
              </small>
            </label>

            <div
              className="admin-property-form__status"
              aria-label="Estado: Borrador"
            >
              <span>
                Estado
              </span>

              <strong>
                Borrador
              </strong>

              <small>
                No aparecerá en la
                web hasta que lo
                publiques desde la
                edición del
                inmueble.
              </small>
            </div>
          </div>
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>02</span>

            <h2>
              Ubicación
            </h2>
          </div>

          <div className="admin-property-form__grid">
            <label className="admin-property-form__field">
              <span>
                Localidad / municipio *
              </span>

              <input
                type="text"
                name="city"
                placeholder="Ej. La Guardia"
                autoComplete="address-level2"
                required
              />

              <small className="admin-property-form__helper">
                Introduce el municipio real del inmueble.
              </small>
            </label>

            <label className="admin-property-form__field">
              <span>
                Provincia *
              </span>

              <input
                type="text"
                name="province"
                placeholder="Ej. Toledo"
                autoComplete="address-level1"
                required
              />

              <small className="admin-property-form__helper">
                Ayuda a identificar correctamente la ubicación y el mapa.
              </small>
            </label>

            <label className="admin-property-form__field">
              <span>
                Zona / barrio
              </span>

              <input
                type="text"
                name="area"
                placeholder="Ej. Zona centro"
              />
            </label>

            <label className="admin-property-form__field">
              <span>
                Código postal
              </span>

              <input
                type="text"
                name="postal_code"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="Ej. 45760"
              />
            </label>

            <label className="admin-property-form__field">
              <span>
                Dirección
              </span>

              <input
                type="text"
                name="address"
                autoComplete="street-address"
                placeholder={
                  isOffice
                    ? 'Ej. Calle Serrano'
                    : 'Ej. Calle ...'
                }
              />

              <small className="admin-property-form__helper">
                {isOffice
                  ? 'Introduce la vía sin necesidad de añadir aquí el número, bloque o puerta.'
                  : 'La dirección exacta solo será pública si activas la opción inferior.'}
              </small>
            </label>

            {isOffice ? (
              <>
                <label className="admin-property-form__field">
                  <span>
                    Número
                  </span>

                  <input
                    type="text"
                    name="street_number"
                    placeholder="Ej. 42"
                  />
                </label>

                <label className="admin-property-form__field">
                  <span>
                    Bloque / escalera
                  </span>

                  <input
                    type="text"
                    name="block"
                    placeholder="Ej. Bloque B"
                  />
                </label>

                <label className="admin-property-form__field">
                  <span>
                    Puerta / oficina
                  </span>

                  <input
                    type="text"
                    name="door"
                    placeholder="Ej. Oficina 3A"
                  />
                </label>

                <label className="admin-property-form__field">
                  <span>
                    Edificio / urbanización
                  </span>

                  <input
                    type="text"
                    name="urbanization_name"
                    placeholder="Ej. Edificio Centro"
                  />
                </label>

                <label className="admin-property-form__field">
                  <span>
                    Referencia catastral
                  </span>

                  <input
                    type="text"
                    name="cadastral_reference"
                    placeholder="Ej. 1234567VK4713S0001AB"
                  />
                </label>
              </>
            ) : null}
          </div>

          {isOffice ? (
            <div className="admin-property-subsection">
              <h3>
                Visibilidad de la dirección
              </h3>

              <p className="admin-property-form__check-help">
                Decide cuánto detalle de la ubicación quieres
                mostrar públicamente en la ficha de la oficina.
              </p>

              <div className="admin-property-form__checks">
                {addressVisibilityOptions.map(
                  (option) => (
                    <label
                      className="admin-property-form__check"
                      key={option.value}
                    >
                      <input
                        type="radio"
                        name="address_visibility"
                        value={option.value}
                        defaultChecked={
                          option.value ===
                          'hidden'
                        }
                      />

                      <span>
                        {option.label}
                      </span>
                    </label>
                  ),
                )}
              </div>
            </div>
          ) : (
            <label className="admin-property-form__check admin-property-form__privacy-check">
              <input
                type="checkbox"
                name="show_exact_address"
              />

              <span>
                Mostrar dirección
                exacta en la web

                <small>
                  Actívalo solo si
                  quieres que la
                  ubicación exacta
                  del inmueble sea
                  pública.
                </small>
              </span>
            </label>
          )}
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>03</span>

            <h2>
              Datos del inmueble
            </h2>
          </div>

          <div className="admin-property-form__grid">
            {!isOffice ? (
              <label className="admin-property-form__field">
                <span>
                  Dormitorios
                </span>

                <input
                  type="number"
                  name="bedrooms"
                  min="0"
                  step="1"
                />
              </label>
            ) : null}

            <label className="admin-property-form__field">
              <span>
                Baños
              </span>

              <input
                type="number"
                name="bathrooms"
                min="0"
                step="1"
              />
            </label>

            <label className="admin-property-form__field">
              <span>
                Superficie
                construida (m²)
              </span>

              <input
                type="number"
                name="built_area"
                min="0"
                step="0.01"
              />
            </label>

            <label className="admin-property-form__field">
              <span>
                Superficie útil
                (m²)
              </span>

              <input
                type="number"
                name="usable_area"
                min="0"
                step="0.01"
              />
            </label>

            {!isOffice ? (
              <label className="admin-property-form__field">
                <span>
                  Superficie de
                  parcela (m²)
                </span>

                <input
                  type="number"
                  name="plot_area"
                  min="0"
                  step="0.01"
                />
              </label>
            ) : null}

            <label className="admin-property-form__field">
              <span>
                Planta
              </span>

              <input
                type="text"
                name="floor"
              />
            </label>

            {!isOffice ? (
              <label className="admin-property-form__field">
                <span>
                  Número de plantas
                </span>

                <input
                  type="number"
                  name="floors_count"
                  min="1"
                  step="1"
                />
              </label>
            ) : null}

            <label className="admin-property-form__field">
              <span>
                Año de construcción
              </span>

              <input
                type="number"
                name="construction_year"
                min="1800"
                max="2200"
                step="1"
              />
            </label>

            <label className="admin-property-form__field">
              <span>
                Estado
              </span>

              <select
                name="property_condition"
                defaultValue=""
              >
                <option value="">
                  Sin especificar
                </option>

                {propertyConditionOptions.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="admin-property-form__field">
              <span>
                Exterior / interior
              </span>

              <select
                name="exposure"
                defaultValue=""
              >
                <option value="">
                  Sin especificar
                </option>

                <option value="exterior">
                  Exterior
                </option>

                <option value="interior">
                  Interior
                </option>
              </select>
            </label>

            <label className="admin-property-form__field">
              <span>
                Calefacción
              </span>

              <select
                name="heating_type"
                defaultValue=""
              >
                <option value="">
                  Sin especificar
                </option>

                {heatingTypeOptions.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          {isOffice ? (
            <div className="admin-property-subsection admin-property-subsection--first">
              <h3>
                Datos específicos de oficina
              </h3>

              <p className="admin-property-form__check-help">
                Completa solo los datos que conozcas. Estos campos se
                guardan de forma estructurada para poder mostrar y filtrar
                correctamente oficinas y espacios de trabajo.
              </p>

              <div className="admin-property-form__grid">
                <label className="admin-property-form__field">
                  <span>
                    Tipo de espacio
                  </span>

                  <select
                    name="office_space_type"
                    defaultValue=""
                  >
                    <option value="">
                      Sin especificar
                    </option>

                    {officeSpaceTypeOptions.map(
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

                <label className="admin-property-form__field">
                  <span>
                    Superficie bruta alquilable (m²)
                  </span>

                  <input
                    type="number"
                    name="gross_leasable_area"
                    min="0.01"
                    step="0.01"
                  />
                </label>

                <label className="admin-property-form__field">
                  <span>
                    Superficie del puesto de trabajo (m²)
                  </span>

                  <input
                    type="number"
                    name="workstation_area"
                    min="0.01"
                    step="0.01"
                  />

                  <small className="admin-property-form__helper">
                    Úsalo cuando el anuncio corresponda a un puesto
                    individual o espacio de trabajo.
                  </small>
                </label>

                <label className="admin-property-form__field">
                  <span>
                    Uso del edificio
                  </span>

                  <select
                    name="building_use"
                    defaultValue=""
                  >
                    <option value="">
                      Sin especificar
                    </option>

                    {officeBuildingUseOptions.map(
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

                <label className="admin-property-form__field">
                  <span>
                    Nº de plantas del edificio
                  </span>

                  <input
                    type="number"
                    name="building_floors_count"
                    min="1"
                    step="1"
                  />
                </label>

                <label className="admin-property-form__field">
                  <span>
                    Nº de plantas de la oficina
                  </span>

                  <input
                    type="number"
                    name="office_floors_count"
                    min="1"
                    step="1"
                  />
                </label>

                <label className="admin-property-form__field">
                  <span>
                    Nº de ascensores
                  </span>

                  <input
                    type="number"
                    name="elevators_count"
                    min="0"
                    step="1"
                  />

                  <small className="admin-property-form__helper">
                    Si indicas un número mayor que 0, se guardará
                    también que el edificio dispone de ascensor.
                  </small>
                </label>

                <label className="admin-property-form__field">
                  <span>
                    Disponible desde
                  </span>

                  <input
                    type="date"
                    name="available_from"
                  />

                  <small className="admin-property-form__helper">
                    Déjalo vacío si ya está disponible o no quieres
                    indicar una fecha concreta.
                  </small>
                </label>
              </div>

              <div className="admin-property-subsection">
                <h3>
                  Certificaciones del edificio
                </h3>

                <div className="admin-property-form__checks">
                  {buildingCertificationOptions.map(
                    (certification) => (
                      <label
                        className="admin-property-form__check"
                        key={certification}
                      >
                        <input
                          type="checkbox"
                          name="building_certifications"
                          value={certification}
                        />

                        <span>
                          {certification}
                        </span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <div className="admin-property-subsection">
            <h3>
              Características
            </h3>

            <div className="admin-property-form__checks">
              <label className="admin-property-form__check">
                <input
                  type="checkbox"
                  name="elevator"
                />

                <span>
                  Ascensor
                </span>
              </label>

              <label className="admin-property-form__check">
                <input
                  type="checkbox"
                  name="terrace"
                />

                <span>
                  Terraza
                </span>
              </label>

              <label className="admin-property-form__check">
                <input
                  type="checkbox"
                  name="furnished"
                />

                <span>
                  Amueblado
                </span>
              </label>

              {propertyAmenityGroups
                .flatMap(
                  (group) =>
                    group.options,
                )
                .map(
                  (feature) => (
                    <label
                      className="admin-property-form__check"
                      key={
                        feature
                      }
                    >
                      <input
                        type="checkbox"
                        name="features"
                        value={
                          feature
                        }
                      />

                      <span>
                        {
                          feature
                        }
                      </span>
                    </label>
                  ),
                )}
            </div>

            <div className="admin-featured-controls">
              <label className="admin-property-form__check admin-featured-controls__toggle">
                <input
                  type="checkbox"
                  name="featured"
                  checked={
                    featured
                  }
                  onChange={(
                    event,
                  ) =>
                    setFeatured(
                      event.target
                        .checked,
                    )
                  }
                />

                <span>
                  Destacado en la Home

                  <small>
                    Actívalo para
                    mostrar este
                    inmueble en la
                    selección de
                    propiedades
                    destacadas de la
                    Home.
                  </small>
                </span>
              </label>

              <label className="admin-property-form__field admin-featured-controls__position">
                <span>
                  Posición en destacados
                </span>

                <input
                  type="number"
                  name="featured_position"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  disabled={
                    !featured
                  }
                  placeholder="Sin prioridad manual"
                />

                <small className="admin-property-form__helper">
                  1 = principal /
                  grande. 2, 3, 4…
                  definen el orden de
                  aparición en la
                  Home.
                </small>
              </label>
            </div>
          </div>

          <div className="admin-property-subsection">
            <h3>
              Garaje
            </h3>

            <div className="admin-property-form__checks">
              <label className="admin-property-form__check">
                <input
                  type="checkbox"
                  name="parking"
                />

                <span>
                  Tiene garaje
                </span>
              </label>
            </div>

            <div className="admin-property-form__grid">
              <label className="admin-property-form__field">
                <span>
                  Modalidad
                </span>

                <select
                  name="parking_type"
                  defaultValue=""
                >
                  <option value="">
                    Sin especificar
                  </option>

                  {parkingTypeOptions.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="admin-property-form__field">
                <span>
                  Número de plazas
                </span>

                <input
                  type="number"
                  name="parking_spaces"
                  min="1"
                  step="1"
                />
              </label>
            </div>
          </div>

          <div className="admin-property-subsection">
            <h3>
              Orientación
            </h3>

            <div className="admin-property-form__checks">
              {orientationOptions.map(
                (option) => (
                  <label
                    className="admin-property-form__check"
                    key={
                      option.value
                    }
                  >
                    <input
                      type="checkbox"
                      name="orientations"
                      value={
                        option.value
                      }
                    />

                    <span>
                      {
                        option.label
                      }
                    </span>
                  </label>
                ),
              )}
            </div>
          </div>

          <p className="admin-property-form__check-help">
            {isOffice
              ? 'Los campos específicos de oficina son opcionales. Completa únicamente la información disponible.'
              : 'Los campos específicos de casas, chalets o fincas son opcionales y no impiden guardar otros tipos de inmueble.'}
          </p>
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>04</span>

            <h2>
              Información adicional
            </h2>
          </div>

          <div className="admin-property-subsection admin-property-subsection--first">
            <h3>
              Multimedia adicional
            </h3>

            <div className="admin-property-form__grid">
              <label className="admin-property-form__field">
                <span>
                  Vídeo
                </span>

                <input
                  type="url"
                  name="video_url"
                  placeholder="https://..."
                />

                <small className="admin-property-form__helper">
                  YouTube, Vimeo u
                  otra URL pública
                  compatible.
                </small>
              </label>

              <label className="admin-property-form__field">
                <span>
                  Visita virtual
                </span>

                <input
                  type="url"
                  name="virtual_tour_url"
                  placeholder="https://..."
                />

                <small className="admin-property-form__helper">
                  Matterport, tour
                  virtual u otra URL
                  pública.
                </small>
              </label>
            </div>
          </div>

          <div className="admin-property-subsection">
            <h3>
              Gastos
            </h3>

            <div className="admin-property-form__grid">
              <label className="admin-property-form__field">
                <span>
                  Comunidad (€)
                </span>

                <input
                  type="number"
                  name="community_fee_amount"
                  min="0"
                  step="0.01"
                />
              </label>

              <label className="admin-property-form__field">
                <span>
                  Periodicidad
                </span>

                <select
                  name="community_fee_period"
                  defaultValue=""
                >
                  <option value="">
                    Sin especificar
                  </option>

                  {communityFeePeriodOptions.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="admin-property-form__field">
                <span>
                  IBI anual (€)
                </span>

                <input
                  type="number"
                  name="ibi_annual_amount"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>
          </div>

          <div className="admin-property-subsection">
            <h3>
              Eficiencia energética
            </h3>

            <div className="admin-property-form__grid">
              <label className="admin-property-form__field">
                <span>
                  Estado del certificado
                </span>

                <select
                  name="energy_certificate_status"
                  defaultValue=""
                >
                  <option value="">
                    Sin especificar
                  </option>

                  {energyCertificateStatusOptions.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="admin-property-form__field">
                <span>
                  Letra de consumo
                </span>

                <select
                  name="energy_consumption_rating"
                  defaultValue=""
                >
                  <option value="">
                    Sin especificar
                  </option>

                  {energyRatingOptions.map(
                    (rating) => (
                      <option
                        key={
                          rating
                        }
                        value={
                          rating
                        }
                      >
                        {
                          rating
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="admin-property-form__field">
                <span>
                  Consumo
                  (kWh/m²/año)
                </span>

                <input
                  type="number"
                  name="energy_consumption_value"
                  min="0"
                  step="0.01"
                />
              </label>

              <label className="admin-property-form__field">
                <span>
                  Letra de emisiones
                </span>

                <select
                  name="energy_emissions_rating"
                  defaultValue=""
                >
                  <option value="">
                    Sin especificar
                  </option>

                  {energyRatingOptions.map(
                    (rating) => (
                      <option
                        key={
                          rating
                        }
                        value={
                          rating
                        }
                      >
                        {
                          rating
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="admin-property-form__field">
                <span>
                  Emisiones
                  (kg CO₂/m²/año)
                </span>

                <input
                  type="number"
                  name="energy_emissions_value"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>05</span>

            <h2>
              Planos
            </h2>
          </div>

          <div className="admin-floorplans-editor">
            <label className="admin-floorplans-editor__picker">
              <span>
                Añadir planos
              </span>

              <input
                type="file"
                multiple
                accept={
                  FLOORPLAN_ACCEPT
                }
                onChange={(
                  event,
                ) => {
                  addFloorplans(
                    Array.from(
                      event.target
                        .files ??
                      [],
                    ),
                  );

                  event.target.value =
                    '';
                }}
              />

              <small>
                JPG, PNG o WEBP ·
                Máximo 10 MB por
                archivo
              </small>
            </label>

            {floorplans.length ? (
              <div className="admin-floorplans-editor__grid">
                {floorplans.map(
                  (
                    floorplan,
                    index,
                  ) => (
                    <article
                      key={
                        floorplan.preview
                      }
                    >
                      <img
                        src={
                          floorplan.preview
                        }
                        alt={`Vista previa del plano ${index + 1}`}
                      />

                      <div>
                        <span>
                          Plano{' '}
                          {index +
                            1}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            removeFloorplan(
                              index,
                            )
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <p className="admin-images__empty">
                Puedes añadir los
                planos ahora o desde
                la edición del
                inmueble.
              </p>
            )}
          </div>
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>06</span>

            <h2>
              Descripción
            </h2>
          </div>

          <label className="admin-property-form__field">
            <span>
              Descripción
            </span>

            <small className="admin-property-form__helper">
              Describe los puntos
              fuertes del inmueble,
              distribución, estado,
              ubicación y cualquier
              detalle relevante.
            </small>

            <textarea
              name="description"
              rows={8}
              required
            />
          </label>

          <div className="admin-property-subsection">
            <h3>
              SEO
            </h3>

            <p className="admin-property-form__check-help">
              Opcional. Si lo dejas
              vacío, la web generará
              automáticamente los
              metadatos a partir del
              inmueble y su
              ubicación.
            </p>

            <div className="admin-property-form__grid">
              <label className="admin-property-form__field">
                <span>
                  Título SEO
                </span>

                <input
                  type="text"
                  name="seo_title"
                  value={seoTitle}
                  onChange={(
                    event,
                  ) =>
                    setSeoTitle(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Chalet en venta en Illescas, Toledo | Alvar Consultores"
                />

                <small className="admin-property-form__helper">
                  {
                    seoTitle.length
                  }{' '}
                  caracteres ·
                  Recomendado: hasta
                  60 caracteres
                </small>
              </label>

              <label className="admin-property-form__field">
                <span>
                  Meta descripción
                </span>

                <textarea
                  name="seo_description"
                  rows={4}
                  value={
                    seoDescription
                  }
                  onChange={(
                    event,
                  ) =>
                    setSeoDescription(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Chalet en venta en Illescas, Toledo. Descubre características, precio, ubicación y solicita información a Alvar Consultores."
                />

                <small className="admin-property-form__helper">
                  {
                    seoDescription.length
                  }{' '}
                  caracteres ·
                  Recomendado:
                  140–160 caracteres
                </small>
              </label>
            </div>
          </div>
        </section>

        {error ? (
          <p
            className="admin-property-form__error"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="admin-property-form__actions">
          <button
            type="button"
            onClick={() =>
              navigate(
                '/admin/inmuebles',
              )
            }
            disabled={
              isSubmitting
            }
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={
              isSubmitting
            }
          >
            {isSubmitting
              ? 'Guardando...'
              : 'Guardar y continuar →'}
          </button>
        </div>
      </form>
    </main>
  );
}
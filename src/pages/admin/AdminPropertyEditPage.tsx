import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import '../../styles/admin.css';

const STORAGE_BUCKET = 'property-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

const ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'avif',
]);

const PROPERTY_TYPES = [
  'Piso',
  'Casa',
  'Chalet',
  'Ático',
  'Dúplex',
  'Estudio',
  'Local',
  'Oficina',
  'Terreno',
  'Otro',
];

type PropertyStatus =
  | 'draft'
  | 'published'
  | 'reserved'
  | 'sold'
  | 'rented'
  | 'archived';

type PropertyOperation = 'venta' | 'alquiler';

type AdminProperty = {
  id: string;
  reference: string | null;
  title: string;
  slug: string;
  operation: PropertyOperation;
  property_type: string;
  status: PropertyStatus;
  price: number;
  currency: string;
  city: string;
  area: string | null;
  postal_code: string | null;
  address: string | null;
  show_exact_address: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  built_area: number | null;
  usable_area: number | null;
  floor: string | null;
  elevator: boolean;
  parking: boolean;
  terrace: boolean;
  furnished: boolean;
  exterior: boolean;
  description: string | null;
  featured: boolean;
  published_at: string | null;
};

type PropertyFormState = {
  reference: string;
  title: string;
  operation: PropertyOperation;
  propertyType: string;
  price: string;
  city: string;
  area: string;
  postalCode: string;
  address: string;
  showExactAddress: boolean;
  bedrooms: string;
  bathrooms: string;
  builtArea: string;
  usableArea: string;
  floor: string;
  elevator: boolean;
  parking: boolean;
  terrace: boolean;
  furnished: boolean;
  exterior: boolean;
  description: string;
  featured: boolean;
};

type PropertyImage = {
  id: string;
  property_id: string;
  storage_path: string;
  alt_text: string | null;
  position: number;
  is_cover: boolean;
};

const statusLabels: Record<PropertyStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  reserved: 'Reservado',
  sold: 'Vendido',
  rented: 'Alquilado',
  archived: 'Archivado',
};

const statusDescriptions: Record<PropertyStatus, string> = {
  draft: 'No aparece en el catálogo público.',
  published: 'Visible en el catálogo y en la ficha pública del inmueble.',
  reserved:
    'Visible en la web con la etiqueta Reservado para indicar que la operación está en curso.',
  sold: 'Operación de venta cerrada. El inmueble queda fuera del catálogo.',
  rented: 'Operación de alquiler cerrada. El inmueble queda fuera del catálogo.',
  archived: 'Se conserva en el CRM pero no aparece públicamente.',
};

const statusOptions: Array<{
  value: PropertyStatus;
  label: string;
}> = [
    { value: 'draft', label: 'Borrador' },
    { value: 'published', label: 'Publicado' },
    { value: 'reserved', label: 'Reservado' },
    { value: 'sold', label: 'Vendido · Venta' },
    { value: 'rented', label: 'Alquilado · Alquiler' },
    { value: 'archived', label: 'Archivado' },
  ];

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function cleanFileName(fileName: string) {
  const extension = getFileExtension(fileName).replace(/[^a-z0-9]/g, '');
  const baseName = fileName.slice(0, -(extension.length + 1));

  const cleanBaseName = baseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${cleanBaseName || 'imagen'}.${extension}`;
}

function getPublicImageUrl(storagePath: string) {
  return supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath).data.publicUrl;
}

function nullableText(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue || null;
}

function nullableNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function createFormState(property: AdminProperty): PropertyFormState {
  return {
    reference: property.reference ?? '',
    title: property.title,
    operation: property.operation,
    propertyType: property.property_type,
    price: String(property.price),
    city: property.city,
    area: property.area ?? '',
    postalCode: property.postal_code ?? '',
    address: property.address ?? '',
    showExactAddress: property.show_exact_address,
    bedrooms:
      property.bedrooms !== null
        ? String(property.bedrooms)
        : '',
    bathrooms:
      property.bathrooms !== null
        ? String(property.bathrooms)
        : '',
    builtArea:
      property.built_area !== null
        ? String(property.built_area)
        : '',
    usableArea:
      property.usable_area !== null
        ? String(property.usable_area)
        : '',
    floor: property.floor ?? '',
    elevator: property.elevator,
    parking: property.parking,
    terrace: property.terrace,
    furnished: property.furnished,
    exterior: property.exterior,
    description: property.description ?? '',
    featured: property.featured,
  };
}

export function AdminPropertyEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState<AdminProperty | null>(null);
  const [form, setForm] = useState<PropertyFormState | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [selectedStatus, setSelectedStatus] =
    useState<PropertyStatus>('draft');

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingData, setIsSavingData] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);

  const [pageError, setPageError] = useState('');
  const [dataError, setDataError] = useState('');
  const [dataSuccess, setDataSuccess] = useState('');
  const [imageError, setImageError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const refreshImages = async () => {
    if (!id) {
      return false;
    }

    const { data, error: imagesError } = await supabase
      .from('property_images')
      .select(
        'id, property_id, storage_path, alt_text, position, is_cover',
      )
      .eq('property_id', id)
      .order('position', { ascending: true });

    if (imagesError) {
      console.error(
        'Error loading property images:',
        imagesError,
      );

      setImageError(
        'No se han podido cargar las fotografías del inmueble.',
      );

      return false;
    }

    setImages((data ?? []) as PropertyImage[]);

    return true;
  };

  useEffect(() => {
    let isMounted = true;

    const loadProperty = async () => {
      if (!id) {
        setPageError(
          'No se ha encontrado el inmueble solicitado.',
        );

        setIsLoading(false);

        return;
      }

      setPageError('');
      setImageError('');
      setIsLoading(true);

      const [propertyResult, imagesResult] = await Promise.all([
        supabase
          .from('properties')
          .select(
            `
              id,
              reference,
              title,
              slug,
              operation,
              property_type,
              status,
              price,
              currency,
              city,
              area,
              postal_code,
              address,
              show_exact_address,
              bedrooms,
              bathrooms,
              built_area,
              usable_area,
              floor,
              elevator,
              parking,
              terrace,
              furnished,
              exterior,
              description,
              featured,
              published_at
            `,
          )
          .eq('id', id)
          .single(),

        supabase
          .from('property_images')
          .select(
            'id, property_id, storage_path, alt_text, position, is_cover',
          )
          .eq('property_id', id)
          .order('position', { ascending: true }),
      ]);

      if (!isMounted) {
        return;
      }

      if (propertyResult.error) {
        console.error(
          'Error loading property:',
          propertyResult.error,
        );

        setPageError(
          'No se ha podido cargar el inmueble.',
        );

        setIsLoading(false);

        return;
      }

      const loadedProperty =
        propertyResult.data as AdminProperty;

      setProperty(loadedProperty);
      setForm(createFormState(loadedProperty));
      setSelectedStatus(loadedProperty.status);

      if (imagesResult.error) {
        console.error(
          'Error loading property images:',
          imagesResult.error,
        );

        setImageError(
          'No se han podido cargar las fotografías del inmueble.',
        );
      }

      setImages(
        (imagesResult.data ?? []) as PropertyImage[],
      );

      setIsLoading(false);
    };

    void loadProperty();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const updateForm = <K extends keyof PropertyFormState>(
    key: K,
    value: PropertyFormState[K],
  ) => {
    setForm((currentForm) => {
      if (!currentForm) {
        return currentForm;
      }

      return {
        ...currentForm,
        [key]: value,
      };
    });

    setDataSuccess('');
  };

  const handleDataSave = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!property || !form || isSavingData) {
      return;
    }

    setDataError('');
    setDataSuccess('');

    const title = form.title.trim();
    const city = form.city.trim();
    const price = Number(form.price);

    if (!title) {
      setDataError(
        'Introduce un título para el inmueble.',
      );

      return;
    }

    if (!city) {
      setDataError(
        'Introduce la ciudad del inmueble.',
      );

      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      setDataError(
        'Introduce un precio válido.',
      );

      return;
    }

    setIsSavingData(true);

    const updatePayload = {
      reference: nullableText(form.reference),
      title,
      operation: form.operation,
      property_type: form.propertyType,
      price,
      city,
      area: nullableText(form.area),
      postal_code: nullableText(form.postalCode),
      address: nullableText(form.address),
      show_exact_address: form.showExactAddress,
      bedrooms: nullableNumber(form.bedrooms),
      bathrooms: nullableNumber(form.bathrooms),
      built_area: nullableNumber(form.builtArea),
      usable_area: nullableNumber(form.usableArea),
      floor: nullableText(form.floor),
      elevator: form.elevator,
      parking: form.parking,
      terrace: form.terrace,
      furnished: form.furnished,
      exterior: form.exterior,
      description: nullableText(form.description),
      featured: form.featured,
    };

    try {
      const { error: updateError } = await supabase
        .from('properties')
        .update(updatePayload)
        .eq('id', property.id);

      if (updateError) {
        console.error(
          'Error updating property:',
          updateError,
        );

        setDataError(
          'No se han podido guardar los cambios del inmueble.',
        );

        return;
      }

      setProperty((currentProperty) => {
        if (!currentProperty) {
          return currentProperty;
        }

        return {
          ...currentProperty,
          ...updatePayload,
        };
      });

      setDataSuccess(
        'Cambios guardados correctamente.',
      );
    } catch (unexpectedError) {
      console.error(
        'Unexpected property update error:',
        unexpectedError,
      );

      setDataError(
        'No se han podido guardar los cambios. Inténtalo de nuevo.',
      );
    } finally {
      setIsSavingData(false);
    }
  };

  const handleResetData = () => {
    if (!property) {
      return;
    }

    setForm(createFormState(property));
    setDataError('');
    setDataSuccess('');
  };

  const handleUpload = async (
    selectedFiles: File[],
  ) => {
    if (
      !property ||
      selectedFiles.length === 0 ||
      isUploading ||
      isManaging
    ) {
      return;
    }

    const messages: string[] = [];

    const validFiles = selectedFiles.filter((file) => {
      const extension = getFileExtension(file.name);

      if (
        !ALLOWED_MIME_TYPES.has(file.type) ||
        !ALLOWED_EXTENSIONS.has(extension)
      ) {
        messages.push(
          `${file.name}: formato no permitido.`,
        );

        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        messages.push(
          `${file.name}: supera el máximo de 10 MB.`,
        );

        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      setImageError(messages.join(' '));

      return;
    }

    setImageError('');
    setIsUploading(true);

    let nextPosition =
      images.reduce(
        (highest, image) =>
          Math.max(highest, image.position),
        -1,
      ) + 1;

    let successfulUploads = 0;

    const hasExistingImages = images.length > 0;

    try {
      for (const file of validFiles) {
        const storagePath =
          `${property.id}/${crypto.randomUUID()}-${cleanFileName(file.name)}`;

        const { error: uploadError } =
          await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, file, {
              cacheControl: '3600',
              contentType: file.type,
              upsert: false,
            });

        if (uploadError) {
          console.error(
            `Error uploading ${file.name}:`,
            uploadError,
          );

          messages.push(
            `${file.name}: no se ha podido subir.`,
          );

          continue;
        }

        const { error: insertError } =
          await supabase
            .from('property_images')
            .insert({
              property_id: property.id,
              storage_path: storagePath,
              alt_text:
                `${property.title} en ${property.city}`,
              position: nextPosition,
              is_cover:
                !hasExistingImages &&
                successfulUploads === 0,
            });

        if (insertError) {
          console.error(
            `Error registering ${file.name}:`,
            insertError,
          );

          messages.push(
            `${file.name}: no se ha podido registrar.`,
          );

          const { error: cleanupError } =
            await supabase.storage
              .from(STORAGE_BUCKET)
              .remove([storagePath]);

          if (cleanupError) {
            console.error(
              `Error cleaning up ${file.name}:`,
              cleanupError,
            );
          }

          continue;
        }

        nextPosition += 1;
        successfulUploads += 1;
      }

      const refreshed = await refreshImages();

      if (messages.length > 0) {
        setImageError(messages.join(' '));
      } else if (refreshed) {
        setImageError('');
      }
    } catch (unexpectedError) {
      console.error(
        'Unexpected property image upload error:',
        unexpectedError,
      );

      setImageError(
        'No se han podido completar las subidas. Inténtalo de nuevo.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const updatePositions = async (
    orderedImages: PropertyImage[],
  ) => {
    for (const [position, image] of orderedImages.entries()) {
      if (image.position === position) {
        continue;
      }

      const { error: positionError } =
        await supabase
          .from('property_images')
          .update({ position })
          .eq('id', image.id)
          .eq('property_id', id);

      if (positionError) {
        return positionError;
      }
    }

    return null;
  };

  const handleSetCover = async (
    imageId: string,
  ) => {
    if (isManaging || isUploading) {
      return;
    }

    setImageError('');
    setIsManaging(true);

    try {
      const { error: resetError } =
        await supabase
          .from('property_images')
          .update({ is_cover: false })
          .eq('property_id', id);

      if (resetError) {
        console.error(
          'Error clearing property cover:',
          resetError,
        );

        setImageError(
          'No se ha podido cambiar la fotografía de portada.',
        );

        return;
      }

      const { error: coverError } =
        await supabase
          .from('property_images')
          .update({ is_cover: true })
          .eq('id', imageId)
          .eq('property_id', id);

      if (coverError) {
        console.error(
          'Error setting property cover:',
          coverError,
        );

        setImageError(
          'No se ha podido cambiar la fotografía de portada.',
        );

        return;
      }

      await refreshImages();
    } catch (unexpectedError) {
      console.error(
        'Unexpected cover update error:',
        unexpectedError,
      );

      setImageError(
        'No se ha podido cambiar la fotografía de portada.',
      );
    } finally {
      setIsManaging(false);
    }
  };

  const handleMove = async (
    imageIndex: number,
    direction: -1 | 1,
  ) => {
    const nextIndex = imageIndex + direction;

    if (
      isManaging ||
      isUploading ||
      nextIndex < 0 ||
      nextIndex >= images.length
    ) {
      return;
    }

    const reorderedImages = [...images];

    [
      reorderedImages[imageIndex],
      reorderedImages[nextIndex],
    ] = [
        reorderedImages[nextIndex],
        reorderedImages[imageIndex],
      ];

    setImageError('');
    setIsManaging(true);

    try {
      const positionError =
        await updatePositions(reorderedImages);

      if (positionError) {
        console.error(
          'Error reordering property images:',
          positionError,
        );

        setImageError(
          'No se ha podido cambiar el orden de las fotografías.',
        );

        await refreshImages();

        return;
      }

      setImages(
        reorderedImages.map(
          (image, position) => ({
            ...image,
            position,
          }),
        ),
      );
    } catch (unexpectedError) {
      console.error(
        'Unexpected image reorder error:',
        unexpectedError,
      );

      setImageError(
        'No se ha podido cambiar el orden de las fotografías.',
      );

      await refreshImages();
    } finally {
      setIsManaging(false);
    }
  };

  const handleDelete = async (
    image: PropertyImage,
  ) => {
    if (
      isManaging ||
      isUploading ||
      !window.confirm(
        '¿Seguro que quieres eliminar esta fotografía?',
      )
    ) {
      return;
    }

    setImageError('');
    setIsManaging(true);

    try {
      const { error: storageError } =
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([image.storage_path]);

      if (storageError) {
        console.error(
          'Error deleting property image file:',
          storageError,
        );

        setImageError(
          'No se ha podido eliminar el archivo de la fotografía.',
        );

        return;
      }

      const { error: deleteError } =
        await supabase
          .from('property_images')
          .delete()
          .eq('id', image.id)
          .eq('property_id', id);

      if (deleteError) {
        console.error(
          'Error deleting property image row:',
          deleteError,
        );

        setImageError(
          'No se ha podido eliminar el registro de la fotografía.',
        );

        return;
      }

      const remainingImages = images.filter(
        (item) => item.id !== image.id,
      );

      if (
        image.is_cover &&
        remainingImages.length > 0
      ) {
        const { error: coverError } =
          await supabase
            .from('property_images')
            .update({ is_cover: true })
            .eq('id', remainingImages[0].id)
            .eq('property_id', id);

        if (coverError) {
          console.error(
            'Error assigning replacement cover:',
            coverError,
          );

          setImageError(
            'La fotografía se eliminó, pero no se pudo asignar la nueva portada.',
          );
        }
      }

      const positionError =
        await updatePositions(remainingImages);

      if (positionError) {
        console.error(
          'Error normalizing property image positions:',
          positionError,
        );

        setImageError(
          'La fotografía se eliminó, pero no se pudo actualizar el orden.',
        );
      }

      await refreshImages();
    } catch (unexpectedError) {
      console.error(
        'Unexpected property image deletion error:',
        unexpectedError,
      );

      setImageError(
        'No se ha podido completar la eliminación de la fotografía.',
      );

      await refreshImages();
    } finally {
      setIsManaging(false);
    }
  };

  const handleStatusSave = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!property || isSavingStatus) {
      return;
    }

    setStatusError('');
    setStatusSuccess('');

    if (
      selectedStatus === 'published' &&
      images.length === 0
    ) {
      setStatusError(
        'Añade al menos una fotografía antes de publicar el inmueble.',
      );

      return;
    }

    if (
      selectedStatus === 'sold' &&
      property.operation !== 'venta'
    ) {
      setStatusError(
        'El estado Vendido solo corresponde a inmuebles en venta.',
      );

      return;
    }

    if (
      selectedStatus === 'rented' &&
      property.operation !== 'alquiler'
    ) {
      setStatusError(
        'El estado Alquilado solo corresponde a inmuebles en alquiler.',
      );

      return;
    }

    setIsSavingStatus(true);

    const publishedAt =
      selectedStatus === 'published'
        ? property.published_at ??
        new Date().toISOString()
        : property.published_at;

    try {
      const { error: statusUpdateError } =
        await supabase
          .from('properties')
          .update({
            status: selectedStatus,
            published_at: publishedAt,
          })
          .eq('id', property.id);

      if (statusUpdateError) {
        console.error(
          'Error updating property status:',
          statusUpdateError,
        );

        setStatusError(
          'No se ha podido actualizar el estado del inmueble.',
        );

        return;
      }

      setProperty((currentProperty) => {
        if (!currentProperty) {
          return currentProperty;
        }

        return {
          ...currentProperty,
          status: selectedStatus,
          published_at: publishedAt,
        };
      });

      setStatusSuccess(
        `Estado actualizado a ${statusLabels[selectedStatus]}.`,
      );
    } catch (unexpectedError) {
      console.error(
        'Unexpected property status update error:',
        unexpectedError,
      );

      setStatusError(
        'No se ha podido actualizar el estado. Inténtalo de nuevo.',
      );
    } finally {
      setIsSavingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <main className="admin-property-edit admin-property-edit--loading">
        <p>Cargando inmueble...</p>
      </main>
    );
  }

  if (!property || !form) {
    return (
      <main className="admin-property-edit admin-property-edit--loading">
        <p>
          {pageError ||
            'No se ha encontrado el inmueble solicitado.'}
        </p>

        <Link to="/admin/inmuebles">
          ← Volver a inmuebles
        </Link>
      </main>
    );
  }

  const propertyTypeOptions =
    PROPERTY_TYPES.includes(form.propertyType)
      ? PROPERTY_TYPES
      : [form.propertyType, ...PROPERTY_TYPES];

  return (
    <main className="admin-property-edit">
      <header className="admin-property-edit__header">
        <div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-site-link"
            aria-label="Abrir la web pública de Alvar Consultores en una nueva pestaña"
          >
            ALVAR CONSULTORES <span aria-hidden="true">↗</span>
          </a>

          <h1>Editar inmueble</h1>

          <p>{property.title}</p>
        </div>

        <div className="admin-property-edit__meta">
          <span>
            {statusLabels[property.status]}
          </span>

          <div>
            <Link to="/admin/inmuebles">
              ← Volver a inmuebles
            </Link>

            {property.status === 'published' ? (
              <Link to={`/inmuebles/${property.slug}`}>
                Ver inmueble en web
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <form
        className="admin-property-form"
        onSubmit={handleDataSave}
      >
        <p className="admin-property-form__required-note">
          Los campos marcados con * son obligatorios.
        </p>

        <section className="admin-property-form__section">
          <div>
            <span>01</span>
            <h2>Datos principales</h2>
          </div>

          <div className="admin-property-form__grid">
            <label className="admin-property-form__field">
              <span>Operación *</span>

              <select
                value={form.operation}
                onChange={(event) =>
                  updateForm(
                    'operation',
                    event.target.value as PropertyOperation,
                  )
                }
                required
              >
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </label>

            <label className="admin-property-form__field">
              <span>Tipo de inmueble *</span>

              <select
                value={form.propertyType}
                onChange={(event) =>
                  updateForm(
                    'propertyType',
                    event.target.value,
                  )
                }
                required
              >
                {propertyTypeOptions.map((type) => (
                  <option
                    value={type}
                    key={type}
                  >
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-property-form__field">
              <span>Título *</span>

              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  updateForm(
                    'title',
                    event.target.value,
                  )
                }
                required
              />
            </label>

            <label className="admin-property-form__field">
              <span>Referencia</span>

              <input
                type="text"
                value={form.reference}
                onChange={(event) =>
                  updateForm(
                    'reference',
                    event.target.value,
                  )
                }
                placeholder="Ej. ALV-001"
              />
            </label>

            <label className="admin-property-form__field">
              <span>Precio *</span>

              <span className="admin-property-form__input-suffix">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(event) =>
                    updateForm(
                      'price',
                      event.target.value,
                    )
                  }
                  required
                />

                <span aria-hidden="true">€</span>
              </span>
            </label>
          </div>

        </section>

        <section className="admin-property-form__section">
          <div>
            <span>02</span>
            <h2>Ubicación</h2>
          </div>

          <div className="admin-property-form__grid">
            <label className="admin-property-form__field">
              <span>Ciudad *</span>

              <input
                type="text"
                value={form.city}
                onChange={(event) =>
                  updateForm(
                    'city',
                    event.target.value,
                  )
                }
                required
              />
            </label>

            <label className="admin-property-form__field">
              <span>Zona / barrio</span>

              <input
                type="text"
                value={form.area}
                onChange={(event) =>
                  updateForm(
                    'area',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="admin-property-form__field">
              <span>Dirección</span>

              <input
                type="text"
                value={form.address}
                onChange={(event) =>
                  updateForm(
                    'address',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="admin-property-form__field">
              <span>Código postal</span>

              <input
                type="text"
                value={form.postalCode}
                onChange={(event) =>
                  updateForm(
                    'postalCode',
                    event.target.value,
                  )
                }
              />
            </label>
          </div>

          <label className="admin-property-form__check admin-property-form__privacy-check">
            <input
              type="checkbox"
              checked={form.showExactAddress}
              onChange={(event) =>
                updateForm('showExactAddress', event.target.checked)
              }
            />
            <span>
              Mostrar dirección exacta en la web
              <small>
                Actívalo solo si quieres que la ubicación exacta del inmueble
                sea pública.
              </small>
            </span>
          </label>
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>03</span>
            <h2>Características</h2>
          </div>

          <div className="admin-property-form__grid">
            <label className="admin-property-form__field">
              <span>Dormitorios</span>

              <input
                type="number"
                min="0"
                step="1"
                value={form.bedrooms}
                onChange={(event) =>
                  updateForm(
                    'bedrooms',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="admin-property-form__field">
              <span>Baños</span>

              <input
                type="number"
                min="0"
                step="1"
                value={form.bathrooms}
                onChange={(event) =>
                  updateForm(
                    'bathrooms',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="admin-property-form__field">
              <span>
                Superficie construida (m²)
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.builtArea}
                onChange={(event) =>
                  updateForm(
                    'builtArea',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="admin-property-form__field">
              <span>
                Superficie útil (m²)
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.usableArea}
                onChange={(event) =>
                  updateForm(
                    'usableArea',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="admin-property-form__field">
              <span>Planta</span>

              <input
                type="text"
                value={form.floor}
                onChange={(event) =>
                  updateForm(
                    'floor',
                    event.target.value,
                  )
                }
              />
            </label>
          </div>

          <div className="admin-property-form__checks">
            {[
              ['elevator', 'Ascensor'],
              ['parking', 'Garaje'],
              ['terrace', 'Terraza'],
              ['furnished', 'Amueblado'],
              ['exterior', 'Exterior'],
              ['featured', 'Destacado'],
            ].map(([key, label]) => {
              const field =
                key as keyof Pick<
                  PropertyFormState,
                  | 'elevator'
                  | 'parking'
                  | 'terrace'
                  | 'furnished'
                  | 'exterior'
                  | 'featured'
                >;

              return (
                <label
                  className="admin-property-form__check"
                  key={key}
                >
                  <input
                    type="checkbox"
                    checked={form[field]}
                    onChange={(event) =>
                      updateForm(
                        field,
                        event.target.checked,
                      )
                    }
                  />

                  <span>{label}</span>
                </label>
              );
            })}
          </div>

          <p className="admin-property-form__check-help">
            Los inmuebles destacados pueden aparecer
            en posiciones preferentes de la web.
          </p>
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>04</span>
            <h2>Descripción</h2>
          </div>

          <label className="admin-property-form__field">
            <span>Descripción</span>

            <small className="admin-property-form__helper">
              Describe los puntos fuertes del inmueble,
              distribución, estado, ubicación y cualquier
              detalle relevante.
            </small>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateForm(
                  'description',
                  event.target.value,
                )
              }
            />
          </label>
        </section>

        {dataError ? (
          <p
            className="admin-property-form__error"
            role="alert"
          >
            {dataError}
          </p>
        ) : null}

        {dataSuccess ? (
          <p
            className="admin-images__status"
            aria-live="polite"
          >
            {dataSuccess}
          </p>
        ) : null}

        <div className="admin-property-form__actions">
          <button
            type="button"
            disabled={isSavingData}
            onClick={handleResetData}
          >
            Deshacer cambios
          </button>

          <button
            type="submit"
            disabled={isSavingData}
          >
            {isSavingData
              ? 'Guardando...'
              : 'Guardar cambios'}
          </button>
        </div>
      </form>

      <section
        className="admin-images"
        aria-labelledby="admin-images-title"
      >
        <div className="admin-images__upload">
          <div>
            <span>FOTOGRAFÍAS</span>

            <h2 id="admin-images-title">
              Imágenes del inmueble
            </h2>

            <p>
              Sube las fotografías del inmueble.
              La imagen marcada como portada será la
              principal en el catálogo.
            </p>
          </div>

          <label>
            <span>
              {isUploading
                ? 'Subiendo fotografías...'
                : 'Añadir fotografías'}
            </span>

            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={
                isUploading || isManaging
              }
              onChange={(event) => {
                const files = Array.from(
                  event.target.files ?? [],
                );

                event.target.value = '';

                void handleUpload(files);
              }}
            />

            <small>
              JPG, PNG, WEBP o AVIF · Máximo 10 MB
              por archivo
            </small>
          </label>
        </div>

        {isUploading ? (
          <p
            className="admin-images__status"
            aria-live="polite"
          >
            Subiendo fotografías...
          </p>
        ) : null}

        {imageError ? (
          <p
            className="admin-images__error"
            role="alert"
          >
            {imageError}
          </p>
        ) : null}

        {images.length > 0 ? (
          <div className="admin-images__grid">
            {images.map((image, index) => (
              <article
                className="admin-image-card"
                key={image.id}
              >
                <div className="admin-image-card__media">
                  <img
                    src={getPublicImageUrl(
                      image.storage_path,
                    )}
                    alt={
                      image.alt_text ??
                      property.title
                    }
                    loading="lazy"
                  />

                  {image.is_cover ? (
                    <span className="admin-image-card__cover">
                      PORTADA
                    </span>
                  ) : null}
                </div>

                <div className="admin-image-card__actions">
                  <span>
                    Posición {image.position + 1}
                  </span>

                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        void handleMove(index, -1)
                      }
                      disabled={
                        isManaging ||
                        isUploading ||
                        index === 0
                      }
                      aria-label={`Subir posición de ${image.alt_text ??
                        property.title
                        }`}
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleMove(index, 1)
                      }
                      disabled={
                        isManaging ||
                        isUploading ||
                        index ===
                        images.length - 1
                      }
                      aria-label={`Bajar posición de ${image.alt_text ??
                        property.title
                        }`}
                    >
                      ↓
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void handleSetCover(image.id)
                    }
                    disabled={
                      isManaging ||
                      isUploading ||
                      image.is_cover
                    }
                  >
                    {image.is_cover
                      ? 'Es la portada'
                      : 'Hacer portada'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void handleDelete(image)
                    }
                    disabled={
                      isManaging ||
                      isUploading
                    }
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-images__empty">
            Todavía no hay fotografías para este inmueble.
          </p>
        )}
      </section>

      <form
        className="admin-property-form"
        onSubmit={handleStatusSave}
      >
        <section className="admin-property-form__section">
          <div>
            <span>05</span>
            <h2>Estado y publicación</h2>
          </div>

          <p className="admin-property-form__required-note">
            El estado determina si el inmueble aparece
            públicamente y en qué situación se encuentra
            la operación.
          </p>

          <div className="admin-property-form__checks">
            {statusOptions.map(({ value, label }) => (
              <label
                className="admin-property-form__check"
                key={value}
              >
                <input
                  type="radio"
                  name="property-status"
                  value={value}
                  checked={
                    selectedStatus === value
                  }
                  onChange={() => {
                    setSelectedStatus(value);
                    setStatusError('');
                    setStatusSuccess('');
                  }}
                />

                <span>{label}</span>
              </label>
            ))}
          </div>

          <p className="admin-property-form__check-help">
            {statusDescriptions[selectedStatus]}
          </p>

          {selectedStatus === 'published' &&
            images.length === 0 ? (
            <p className="admin-property-form__error">
              Para publicar el inmueble debes añadir
              al menos una fotografía.
            </p>
          ) : null}
        </section>

        {statusError ? (
          <p
            className="admin-property-form__error"
            role="alert"
          >
            {statusError}
          </p>
        ) : null}

        {statusSuccess ? (
          <p
            className="admin-images__status"
            aria-live="polite"
          >
            {statusSuccess}
          </p>
        ) : null}

        <div className="admin-property-form__actions">
          <button
            type="submit"
            disabled={
              isSavingStatus ||
              isUploading ||
              isManaging
            }
          >
            {isSavingStatus
              ? 'Actualizando...'
              : 'Guardar estado'}
          </button>
        </div>
      </form>
    </main>
  );
}

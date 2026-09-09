import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif']);

type AdminProperty = {
  id: string;
  title: string;
  slug: string;
  city: string;
  status: 'draft' | 'published' | 'reserved' | 'sold' | 'rented' | 'archived';
};

type PropertyImage = {
  id: string;
  property_id: string;
  storage_path: string;
  alt_text: string | null;
  position: number;
  is_cover: boolean;
};

const statusLabels: Record<AdminProperty['status'], string> = {
  draft: 'Borrador',
  published: 'Publicado',
  reserved: 'Reservado',
  sold: 'Vendido',
  rented: 'Alquilado',
  archived: 'Archivado',
};

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

export function AdminPropertyEditPage() {
  const { id = '' } = useParams();
  const [property, setProperty] = useState<AdminProperty | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [error, setError] = useState('');

  const refreshImages = async () => {
    if (!id) {
      return false;
    }

    const { data, error: imagesError } = await supabase
      .from('property_images')
      .select('id, property_id, storage_path, alt_text, position, is_cover')
      .eq('property_id', id)
      .order('position', { ascending: true });

    if (imagesError) {
      console.error('Error loading property images:', imagesError);
      setError('No se han podido cargar las fotografías del inmueble.');
      return false;
    }

    setImages((data ?? []) as PropertyImage[]);
    return true;
  };

  useEffect(() => {
    let isMounted = true;

    const loadProperty = async () => {
      if (!id) {
        setError('No se ha encontrado el inmueble solicitado.');
        setIsLoading(false);
        return;
      }

      setError('');
      setIsLoading(true);

      const [propertyResult, imagesResult] = await Promise.all([
        supabase
          .from('properties')
          .select('id, title, slug, city, status')
          .eq('id', id)
          .single(),
        supabase
          .from('property_images')
          .select('id, property_id, storage_path, alt_text, position, is_cover')
          .eq('property_id', id)
          .order('position', { ascending: true }),
      ]);

      if (!isMounted) {
        return;
      }

      if (propertyResult.error) {
        console.error('Error loading property:', propertyResult.error);
        setError('No se ha podido cargar el inmueble.');
        setIsLoading(false);
        return;
      }

      if (imagesResult.error) {
        console.error('Error loading property images:', imagesResult.error);
        setError('No se han podido cargar las fotografías del inmueble.');
      }

      setProperty(propertyResult.data as AdminProperty);
      setImages((imagesResult.data ?? []) as PropertyImage[]);
      setIsLoading(false);
    };

    void loadProperty();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleUpload = async (selectedFiles: File[]) => {
    if (!property || selectedFiles.length === 0 || isUploading || isManaging) {
      return;
    }

    const messages: string[] = [];
    const validFiles = selectedFiles.filter((file) => {
      const extension = getFileExtension(file.name);

      if (
        !ALLOWED_MIME_TYPES.has(file.type) ||
        !ALLOWED_EXTENSIONS.has(extension)
      ) {
        messages.push(`${file.name}: formato no permitido.`);
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        messages.push(`${file.name}: supera el máximo de 10 MB.`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      setError(messages.join(' '));
      return;
    }

    setError('');
    setIsUploading(true);

    let nextPosition = images.reduce(
      (highest, image) => Math.max(highest, image.position),
      -1,
    ) + 1;
    let successfulUploads = 0;
    const hasExistingImages = images.length > 0;

    try {
      for (const file of validFiles) {
        const storagePath = `${property.id}/${crypto.randomUUID()}-${cleanFileName(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, file, {
            cacheControl: '3600',
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          messages.push(`${file.name}: no se ha podido subir.`);
          continue;
        }

        const { error: insertError } = await supabase
          .from('property_images')
          .insert({
            property_id: property.id,
            storage_path: storagePath,
            alt_text: `${property.title} en ${property.city}`,
            position: nextPosition,
            is_cover: !hasExistingImages && successfulUploads === 0,
          });

        if (insertError) {
          console.error(`Error registering ${file.name}:`, insertError);
          messages.push(`${file.name}: no se ha podido registrar.`);

          const { error: cleanupError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([storagePath]);

          if (cleanupError) {
            console.error(`Error cleaning up ${file.name}:`, cleanupError);
          }

          continue;
        }

        nextPosition += 1;
        successfulUploads += 1;
      }

      const refreshed = await refreshImages();

      if (messages.length > 0) {
        setError(messages.join(' '));
      } else if (refreshed) {
        setError('');
      }
    } catch (unexpectedError) {
      console.error('Unexpected property image upload error:', unexpectedError);
      setError('No se han podido completar las subidas. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const updatePositions = async (orderedImages: PropertyImage[]) => {
    for (const [position, image] of orderedImages.entries()) {
      if (image.position === position) {
        continue;
      }

      const { error: positionError } = await supabase
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

  const handleSetCover = async (imageId: string) => {
    if (isManaging || isUploading) {
      return;
    }

    setError('');
    setIsManaging(true);

    try {
      const { error: resetError } = await supabase
        .from('property_images')
        .update({ is_cover: false })
        .eq('property_id', id);

      if (resetError) {
        console.error('Error clearing property cover:', resetError);
        setError('No se ha podido cambiar la fotografía de portada.');
        return;
      }

      const { error: coverError } = await supabase
        .from('property_images')
        .update({ is_cover: true })
        .eq('id', imageId)
        .eq('property_id', id);

      if (coverError) {
        console.error('Error setting property cover:', coverError);
        setError('No se ha podido cambiar la fotografía de portada.');
        return;
      }

      await refreshImages();
    } catch (unexpectedError) {
      console.error('Unexpected cover update error:', unexpectedError);
      setError('No se ha podido cambiar la fotografía de portada.');
    } finally {
      setIsManaging(false);
    }
  };

  const handleMove = async (imageIndex: number, direction: -1 | 1) => {
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
    [reorderedImages[imageIndex], reorderedImages[nextIndex]] = [
      reorderedImages[nextIndex],
      reorderedImages[imageIndex],
    ];

    setError('');
    setIsManaging(true);

    try {
      const positionError = await updatePositions(reorderedImages);

      if (positionError) {
        console.error('Error reordering property images:', positionError);
        setError('No se ha podido cambiar el orden de las fotografías.');
        await refreshImages();
        return;
      }

      setImages(
        reorderedImages.map((image, position) => ({ ...image, position })),
      );
    } catch (unexpectedError) {
      console.error('Unexpected image reorder error:', unexpectedError);
      setError('No se ha podido cambiar el orden de las fotografías.');
      await refreshImages();
    } finally {
      setIsManaging(false);
    }
  };

  const handleDelete = async (image: PropertyImage) => {
    if (
      isManaging ||
      isUploading ||
      !window.confirm('¿Seguro que quieres eliminar esta fotografía?')
    ) {
      return;
    }

    setError('');
    setIsManaging(true);

    try {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([image.storage_path]);

      if (storageError) {
        console.error('Error deleting property image file:', storageError);
        setError('No se ha podido eliminar el archivo de la fotografía.');
        return;
      }

      const { error: deleteError } = await supabase
        .from('property_images')
        .delete()
        .eq('id', image.id)
        .eq('property_id', id);

      if (deleteError) {
        console.error('Error deleting property image row:', deleteError);
        setError('No se ha podido eliminar el registro de la fotografía.');
        return;
      }

      const remainingImages = images.filter((item) => item.id !== image.id);

      if (image.is_cover && remainingImages.length > 0) {
        const { error: coverError } = await supabase
          .from('property_images')
          .update({ is_cover: true })
          .eq('id', remainingImages[0].id)
          .eq('property_id', id);

        if (coverError) {
          console.error('Error assigning replacement cover:', coverError);
          setError('La fotografía se eliminó, pero no se pudo asignar la nueva portada.');
        }
      }

      const positionError = await updatePositions(remainingImages);

      if (positionError) {
        console.error('Error normalizing property image positions:', positionError);
        setError('La fotografía se eliminó, pero no se pudo actualizar el orden.');
      }

      await refreshImages();
    } catch (unexpectedError) {
      console.error('Unexpected property image deletion error:', unexpectedError);
      setError('No se ha podido completar la eliminación de la fotografía.');
      await refreshImages();
    } finally {
      setIsManaging(false);
    }
  };

  if (isLoading) {
    return (
      <main className="admin-property-edit admin-property-edit--loading">
        <p>Cargando inmueble...</p>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="admin-property-edit admin-property-edit--loading">
        <p>{error || 'No se ha encontrado el inmueble solicitado.'}</p>
        <Link to="/admin/inmuebles">← Volver a inmuebles</Link>
      </main>
    );
  }

  return (
    <main className="admin-property-edit">
      <header className="admin-property-edit__header">
        <div>
          <span>ALVAR CONSULTORES</span>
          <h1>Editar inmueble</h1>
          <p>{property.title}</p>
        </div>

        <div className="admin-property-edit__meta">
          <span>{statusLabels[property.status]}</span>

          <div>
            <Link to="/admin/inmuebles">← Volver a inmuebles</Link>

            {property.status === 'published' ? (
              <Link to={`/inmuebles/${property.slug}`}>Ver inmueble en web</Link>
            ) : null}
          </div>
        </div>
      </header>

      <section className="admin-images" aria-labelledby="admin-images-title">
        <div className="admin-images__upload">
          <div>
            <span>FOTOGRAFÍAS</span>
            <h2 id="admin-images-title">Imágenes del inmueble</h2>
            <p>
              Sube las fotografías del inmueble. La primera imagen puede
              utilizarse como portada en el catálogo.
            </p>
          </div>

          <label>
            <span>{isUploading ? 'Subiendo fotografías...' : 'Añadir fotografías'}</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={isUploading || isManaging}
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = '';
                void handleUpload(files);
              }}
            />
            <small>JPG, PNG, WEBP o AVIF · Máximo 10 MB por archivo</small>
          </label>
        </div>

        {isUploading ? (
          <p className="admin-images__status" aria-live="polite">
            Subiendo fotografías...
          </p>
        ) : null}

        {error ? (
          <p className="admin-images__error" role="alert">
            {error}
          </p>
        ) : null}

        {images.length > 0 ? (
          <div className="admin-images__grid">
            {images.map((image, index) => (
              <article className="admin-image-card" key={image.id}>
                <div className="admin-image-card__media">
                  <img
                    src={getPublicImageUrl(image.storage_path)}
                    alt={image.alt_text ?? property.title}
                    loading="lazy"
                  />

                  {image.is_cover ? (
                    <span className="admin-image-card__cover">PORTADA</span>
                  ) : null}
                </div>

                <div className="admin-image-card__actions">
                  <span>Posición {image.position + 1}</span>

                  <div>
                    <button
                      type="button"
                      onClick={() => void handleMove(index, -1)}
                      disabled={isManaging || isUploading || index === 0}
                      aria-label={`Subir posición de ${image.alt_text ?? property.title}`}
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleMove(index, 1)}
                      disabled={
                        isManaging || isUploading || index === images.length - 1
                      }
                      aria-label={`Bajar posición de ${image.alt_text ?? property.title}`}
                    >
                      ↓
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleSetCover(image.id)}
                    disabled={isManaging || isUploading || image.is_cover}
                  >
                    {image.is_cover ? 'Es la portada' : 'Hacer portada'}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(image)}
                    disabled={isManaging || isUploading}
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
    </main>
  );
}

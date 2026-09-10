import { supabase } from './supabase';

const STORAGE_BUCKET = 'property-images';
export const MAX_PROPERTY_MEDIA_SIZE = 10 * 1024 * 1024;
export const FLOORPLAN_ACCEPT = 'image/jpeg,image/png,image/webp';

const FLOORPLAN_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const FLOORPLAN_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
]);

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

  return `${cleanBaseName || 'plano'}.${extension}`;
}

export function validateFloorplanFiles(files: File[]) {
  const errors: string[] = [];
  const validFiles = files.filter((file) => {
    const extension = getFileExtension(file.name);

    if (
      !FLOORPLAN_MIME_TYPES.has(file.type) ||
      !FLOORPLAN_EXTENSIONS.has(extension)
    ) {
      errors.push(`${file.name}: formato no permitido.`);
      return false;
    }

    if (file.size > MAX_PROPERTY_MEDIA_SIZE) {
      errors.push(`${file.name}: supera el máximo de 10 MB.`);
      return false;
    }

    return true;
  });

  return { validFiles, errors };
}

export async function uploadPropertyFloorplans({
  propertyId,
  propertyTitle,
  propertyCity,
  files,
  startPosition,
}: {
  propertyId: string;
  propertyTitle: string;
  propertyCity: string;
  files: File[];
  startPosition: number;
}) {
  const errors: string[] = [];
  let uploadedCount = 0;

  for (const file of files) {
    const storagePath = `${propertyId}/floorplans/${crypto.randomUUID()}-${cleanFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error(`Error uploading floorplan ${file.name}:`, uploadError);
      errors.push(`${file.name}: no se ha podido subir.`);
      continue;
    }

    const { error: insertError } = await supabase
      .from('property_images')
      .insert({
        property_id: propertyId,
        storage_path: storagePath,
        alt_text: `Plano de ${propertyTitle} en ${propertyCity}`,
        position: startPosition + uploadedCount,
        is_cover: false,
        media_type: 'floorplan',
      });

    if (insertError) {
      console.error(`Error registering floorplan ${file.name}:`, insertError);
      errors.push(`${file.name}: no se ha podido registrar.`);

      const { error: cleanupError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([storagePath]);

      if (cleanupError) {
        console.error(`Error cleaning up floorplan ${file.name}:`, cleanupError);
      }

      continue;
    }

    uploadedCount += 1;
  }

  return { uploadedCount, errors };
}

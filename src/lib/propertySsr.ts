/**
 * Puente de datos entre el render de servidor (api/property.ts) y la hidratación de React.
 *
 * El servidor consulta `get_public_properties` con la clave pública, pinta la ficha y deja en el HTML
 * la fila recibida dentro de un <script type="application/json">. El navegador la lee en el primer render,
 * de modo que el árbol hidratado es idéntico al del servidor y no repite la consulta a Supabase.
 *
 * Aquí solo se transporta lo que devuelve la función pública: nunca se modifica ningún dato del inmueble.
 */
import type { PublicPropertyRow } from './properties';

export const PROPERTY_SSR_ELEMENT_ID = '__ALVAR_PROPERTY__';

/**
 * Lista cerrada de columnas que devuelve `get_public_properties`. Se serializa solo lo que figura aquí:
 * si alguna vez la función pública devolviera una columna nueva o privada, no llegaría al HTML.
 * (scripts/ssr-property.test.mjs la compara con la última migración del RPC para detectar desfases.)
 */
export const PUBLIC_PROPERTY_ROW_KEYS = [
  'id',
  'reference',
  'title',
  'slug',
  'seo_title',
  'seo_description',
  'operation',
  'property_type',
  'status',
  'price',
  'currency',
  'city',
  'area',
  'province',
  'postal_code',
  'address',
  'show_exact_address',
  'address_visibility',
  'chalet_type',
  'bedrooms',
  'bathrooms',
  'built_area',
  'usable_area',
  'plot_area',
  'floor',
  'floors_count',
  'construction_year',
  'property_condition',
  'orientations',
  'heating_type',
  'elevator',
  'parking',
  'parking_type',
  'parking_spaces',
  'terrace',
  'furnished',
  'exterior',
  'garage_capacity',
  'office_space_type',
  'gross_leasable_area',
  'workstation_area',
  'building_use',
  'available_from',
  'building_certifications',
  'building_floors_count',
  'office_floors_count',
  'elevators_count',
  'video_url',
  'virtual_tour_url',
  'community_fee_amount',
  'community_fee_period',
  'ibi_annual_amount',
  'energy_certificate_status',
  'energy_consumption_rating',
  'energy_consumption_value',
  'energy_emissions_rating',
  'energy_emissions_value',
  'description',
  'features',
  'featured',
  'featured_position',
  'published_at',
  'created_at',
  'property_images',
] as const satisfies readonly (keyof PublicPropertyRow)[];

// Si el tipo de la fila gana una columna que no figura en la lista, TypeScript falla aquí.
type MissingRowKeys = Exclude<keyof PublicPropertyRow, (typeof PUBLIC_PROPERTY_ROW_KEYS)[number]>;
const _allRowKeysAreListed: [MissingRowKeys] extends [never] ? true : never = true;
void _allRowKeysAreListed;

const PROPERTY_IMAGE_KEYS = ['id', 'storage_path', 'alt_text', 'position', 'is_cover', 'media_type'] as const;

declare global {
  var __ALVAR_PROPERTY_ROW__: PublicPropertyRow | null | undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Copia únicamente las columnas públicas conocidas. Devuelve null si la fila no es válida. */
export function pickPublicPropertyRow(input: unknown): PublicPropertyRow | null {
  if (!isRecord(input)) return null;
  if (typeof input.id !== 'string' || typeof input.slug !== 'string' || typeof input.title !== 'string') {
    return null;
  }

  const output: Record<string, unknown> = {};

  for (const key of PUBLIC_PROPERTY_ROW_KEYS) {
    if (!(key in input)) continue;

    if (key === 'property_images') {
      const images = input.property_images;
      output.property_images = Array.isArray(images)
        ? images.filter(isRecord).map((image) => {
            const clean: Record<string, unknown> = {};
            for (const imageKey of PROPERTY_IMAGE_KEYS) {
              if (imageKey in image) clean[imageKey] = image[imageKey];
            }
            return clean;
          })
        : images;
      continue;
    }

    output[key] = input[key];
  }

  return output as unknown as PublicPropertyRow;
}

/**
 * JSON seguro para incrustar dentro de un <script>: impide cerrar la etiqueta, abrir comentarios
 * o romper el literal con los separadores de línea Unicode.
 */
export function serializeForHtmlScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .split(String.fromCharCode(0x2028))
    .join('\\u2028')
    .split(String.fromCharCode(0x2029))
    .join('\\u2029');
}

/** Servidor: fija la fila que se va a pintar. El render es síncrono, así que no hay solapamiento entre peticiones. */
export function setServerPropertyRow(row: PublicPropertyRow | null) {
  globalThis.__ALVAR_PROPERTY_ROW__ = row;
}

let embeddedRowConsumed = false;

/** Navegador: tras el primer montaje se descarta la fila embebida para que futuras visitas internas consulten datos frescos. */
export function markEmbeddedPropertyConsumed() {
  embeddedRowConsumed = true;
}

/**
 * Fila entregada por el servidor para este slug, o null si no hay (navegación interna, SPA clásica, error...).
 * Es idempotente: puede llamarse varias veces durante el primer render (React StrictMode) con el mismo resultado.
 */
export function readEmbeddedPropertyRow(slug: string): PublicPropertyRow | null {
  if (typeof window === 'undefined') {
    const row = globalThis.__ALVAR_PROPERTY_ROW__;
    return row && row.slug === slug ? row : null;
  }

  if (embeddedRowConsumed) return null;

  try {
    const text = document.getElementById(PROPERTY_SSR_ELEMENT_ID)?.textContent;
    if (!text) return null;
    const row = pickPublicPropertyRow(JSON.parse(text));
    return row && row.slug === slug ? row : null;
  } catch {
    return null;
  }
}

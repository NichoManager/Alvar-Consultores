import {
  getOptionLabel,
  heatingTypeOptions,
  orientationOptions,
  parkingTypeOptions,
  propertyConditionOptions,
} from '../data/propertyOptions';
import type { Property, PropertyImage } from '../types/content';
import { supabase } from './supabase';

const STORAGE_BUCKET = 'property-images';

export const PUBLIC_PROPERTY_STATUSES = ['published', 'reserved'] as const;

type PublicPropertyStatus = (typeof PUBLIC_PROPERTY_STATUSES)[number];

type PropertyImageRow = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  position: number;
  is_cover: boolean;
  media_type: 'photo' | 'floorplan';
};

type PublicPropertyRow = {
  id: string;
  reference: string | null;
  title: string;
  slug: string;
  operation: 'venta' | 'alquiler';
  property_type: string;
  status: PublicPropertyStatus;
  price: number | string;
  currency: string;
  city: string;
  area: string | null;
  province: string | null;
  postal_code?: string | null;
  address?: string | null;
  show_exact_address: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  built_area: number | string | null;
  usable_area: number | string | null;
  plot_area: number | string | null;
  floor: string | null;
  floors_count: number | null;
  construction_year: number | null;
  property_condition: string | null;
  orientations: string[] | null;
  heating_type: string | null;
  elevator: boolean;
  parking: boolean;
  parking_type: string | null;
  parking_spaces: number | null;
  terrace: boolean;
  furnished: boolean;
  exterior: boolean;
  energy_consumption_rating: string | null;
  energy_emissions_rating: string | null;
  description: string | null;
  features: string[] | null;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  property_images: PropertyImageRow[] | null;
};

function optionalNumber(value: number | string | null) {
  if (value === null) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function normalizeFeature(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function uniqueFeatures(features: Array<string | null | undefined>) {
  const seen = new Set<string>();
  return features.filter((feature): feature is string => {
    if (!feature?.trim()) return false;
    const normalized = normalizeFeature(feature);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function buildFeatureGroups(row: PublicPropertyRow) {
  const amenities = row.features ?? [];
  const equipmentNames = new Set(['Piscina', 'Aire acondicionado', 'Jardín']);
  const equipmentAmenities = amenities.filter((item) => equipmentNames.has(item));
  const detailAmenities = amenities.filter((item) => !equipmentNames.has(item));
  const condition = getOptionLabel(propertyConditionOptions, row.property_condition);
  const heating = getOptionLabel(heatingTypeOptions, row.heating_type);
  const parkingType = getOptionLabel(parkingTypeOptions, row.parking_type);
  const orientations = (row.orientations ?? [])
    .map((value) => getOptionLabel(orientationOptions, value))
    .filter((value): value is string => Boolean(value));

  const characteristics = uniqueFeatures([
    row.built_area !== null ? `${Number(row.built_area).toLocaleString('es-ES')} m² construidos` : null,
    row.usable_area !== null ? `${Number(row.usable_area).toLocaleString('es-ES')} m² útiles` : null,
    row.plot_area !== null ? `${Number(row.plot_area).toLocaleString('es-ES')} m² de parcela` : null,
    row.bedrooms !== null ? `${row.bedrooms} ${row.bedrooms === 1 ? 'habitación' : 'habitaciones'}` : null,
    row.bathrooms !== null ? `${row.bathrooms} ${row.bathrooms === 1 ? 'baño' : 'baños'}` : null,
    row.floor ? `Planta ${row.floor}` : null,
    row.floors_count !== null ? `${row.floors_count} ${row.floors_count === 1 ? 'planta' : 'plantas'}` : null,
    condition,
    row.terrace ? 'Terraza' : null,
    ...detailAmenities,
    orientations.length ? `Orientación ${orientations.join(' y ').toLowerCase()}` : null,
    row.construction_year !== null ? `Construido en ${row.construction_year}` : null,
    row.exterior ? 'Exterior' : null,
  ]);

  const equipment = uniqueFeatures([
    ...equipmentAmenities,
    row.elevator ? 'Ascensor' : null,
    row.furnished ? 'Amueblado' : null,
    heating ? `Calefacción ${heating.toLowerCase()}` : null,
    row.parking
      ? `Garaje${parkingType ? ` ${parkingType.toLowerCase()}` : ''}${row.parking_spaces ? ` · ${row.parking_spaces} ${row.parking_spaces === 1 ? 'plaza' : 'plazas'}` : ''}`
      : null,
  ]);

  return { characteristics, equipment };
}

function buildFeatures(row: PublicPropertyRow) {
  const { characteristics, equipment } = buildFeatureGroups(row);
  return uniqueFeatures([row.property_type, ...characteristics, ...equipment]);
}

function getPublicImageUrl(storagePath: string) {
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

function mapMedia(row: PublicPropertyRow) {
  const mapped = [...(row.property_images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((image) => ({
      mediaType: image.media_type,
      image: {
        id: image.id,
        url: getPublicImageUrl(image.storage_path),
        alt: image.alt_text?.trim() || `${row.title} en ${row.city}`,
        position: image.position,
        isCover: image.is_cover,
      } satisfies PropertyImage,
    }));
  const photos = mapped.filter((item) => item.mediaType !== 'floorplan').map((item) => item.image);
  const floorplans = mapped.filter((item) => item.mediaType === 'floorplan').map((item) => item.image);
  const coverImage = photos.find((image) => image.isCover) ?? photos[0];

  return {
    coverImage,
    floorplans,
    images: coverImage
      ? [coverImage, ...photos.filter((image) => image.id !== coverImage.id)]
      : [],
  };
}

function buildMapLocation(row: PublicPropertyRow) {
  if (row.show_exact_address && row.address?.trim()) {
    const postalCity = [row.postal_code, row.city].filter((value): value is string => Boolean(value?.trim())).join(' ');
    return [row.address, postalCity, row.province].filter((value): value is string => Boolean(value?.trim())).join(', ');
  }
  return [row.area, row.city, row.province].filter((value): value is string => Boolean(value?.trim())).join(', ');
}

function mapPublicProperty(row: PublicPropertyRow): Property {
  const { images, coverImage, floorplans } = mapMedia(row);
  const { characteristics, equipment } = buildFeatureGroups(row);

  return {
    id: row.id,
    reference: row.reference ?? undefined,
    slug: row.slug,
    title: row.title,
    operation: row.operation === 'alquiler' ? 'Alquilar' : 'Comprar',
    status: row.status === 'reserved' ? 'Reservado' : 'Disponible',
    propertyType: row.property_type,
    price: Number(row.price),
    currency: row.currency,
    city: row.city,
    area: row.area?.trim() || '',
    province: row.province ?? undefined,
    postalCode: row.show_exact_address ? row.postal_code ?? undefined : undefined,
    address: row.show_exact_address ? row.address ?? undefined : undefined,
    showExactAddress: row.show_exact_address,
    mapLocation: buildMapLocation(row),
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    builtArea: optionalNumber(row.built_area),
    usableArea: optionalNumber(row.usable_area),
    plotArea: optionalNumber(row.plot_area),
    floor: row.floor ?? undefined,
    floorsCount: row.floors_count ?? undefined,
    constructionYear: row.construction_year ?? undefined,
    propertyCondition: row.property_condition ?? undefined,
    orientations: row.orientations ?? [],
    heatingType: row.heating_type ?? undefined,
    elevator: row.elevator,
    garage: row.parking,
    parkingType: row.parking_type ?? undefined,
    parkingSpaces: row.parking_spaces ?? undefined,
    terrace: row.terrace,
    furnished: row.furnished,
    exterior: row.exterior,
    energyConsumptionRating: row.energy_consumption_rating ?? undefined,
    energyEmissionsRating: row.energy_emissions_rating ?? undefined,
    amenities: row.features ?? [],
    characteristics,
    equipment,
    description: row.description?.trim() || `${row.property_type} en ${row.city}.`,
    features: buildFeatures(row),
    featured: row.featured,
    published: true,
    publishedAt: row.published_at ?? undefined,
    createdAt: row.published_at ?? row.created_at,
    images,
    floorplans,
    coverImage,
    visual: 'arch',
    isDemo: false,
  };
}

async function getPublicProperties(params: { p_slug: string | null; p_featured: boolean | null; p_limit: number | null }) {
  const { data, error } = await supabase.rpc('get_public_properties', params);
  if (error) throw error;
  return ((data ?? []) as PublicPropertyRow[]).map(mapPublicProperty);
}

export function getPublishedProperties() {
  return getPublicProperties({ p_slug: null, p_featured: null, p_limit: null });
}

export async function getPublishedPropertyBySlug(slug: string) {
  const [property] = await getPublicProperties({ p_slug: slug, p_featured: null, p_limit: 1 });
  return property ?? null;
}

export function getFeaturedProperties(limit = 3) {
  return getPublicProperties({ p_slug: null, p_featured: true, p_limit: limit });
}

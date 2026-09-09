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
  elevator: boolean;
  parking: boolean;
  terrace: boolean;
  furnished: boolean;
  exterior: boolean;
  description: string | null;
  features: string[] | null;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  property_images: PropertyImageRow[] | null;
};

function optionalNumber(value: number | string | null) {
  if (value === null) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function normalizeFeature(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function buildFeatures(row: PublicPropertyRow) {
  const features = [
    row.property_type,
    row.bedrooms !== null
      ? `${row.bedrooms} ${row.bedrooms === 1 ? 'dormitorio' : 'dormitorios'}`
      : null,
    row.bathrooms !== null
      ? `${row.bathrooms} ${row.bathrooms === 1 ? 'baño' : 'baños'}`
      : null,
    row.built_area !== null ? `${Number(row.built_area).toLocaleString('es-ES')} m²` : null,
    row.usable_area !== null
      ? `${Number(row.usable_area).toLocaleString('es-ES')} m² útiles`
      : null,
    row.plot_area !== null
      ? `${Number(row.plot_area).toLocaleString('es-ES')} m² de parcela`
      : null,
    row.floor ? `Planta ${row.floor}` : null,
    row.elevator ? 'Ascensor' : null,
    row.parking ? 'Garaje' : null,
    row.terrace ? 'Terraza' : null,
    row.exterior ? 'Exterior' : null,
    row.furnished ? 'Amueblado' : null,
    ...(row.features ?? []),
  ].filter((feature): feature is string => Boolean(feature?.trim()));

  const seen = new Set<string>();

  return features.filter((feature) => {
    const normalized = normalizeFeature(feature);

    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

function getPublicImageUrl(storagePath: string) {
  return supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath).data.publicUrl;
}

function mapImages(row: PublicPropertyRow): {
  images: PropertyImage[];
  coverImage?: PropertyImage;
} {
  const sortedImages = [...(row.property_images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((image) => ({
      id: image.id,
      url: getPublicImageUrl(image.storage_path),
      alt: image.alt_text?.trim() || `${row.title} en ${row.city}`,
      position: image.position,
      isCover: image.is_cover,
    }));

  const coverImage =
    sortedImages.find((image) => image.isCover) ?? sortedImages[0];

  if (!coverImage) {
    return { images: [] };
  }

  return {
    coverImage,
    images: [
      coverImage,
      ...sortedImages.filter((image) => image.id !== coverImage.id),
    ],
  };
}

function buildMapLocation(row: PublicPropertyRow) {
  if (row.show_exact_address && row.address?.trim()) {
    const postalCity = [row.postal_code, row.city]
      .filter((value): value is string => Boolean(value?.trim()))
      .join(' ');

    return [row.address, postalCity, row.province]
      .filter((value): value is string => Boolean(value?.trim()))
      .join(', ');
  }

  return [row.area, row.city, row.province]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(', ');
}

function mapPublicProperty(row: PublicPropertyRow): Property {
  const { images, coverImage } = mapImages(row);

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
    postalCode: row.show_exact_address
      ? row.postal_code ?? undefined
      : undefined,
    address: row.show_exact_address ? row.address ?? undefined : undefined,
    showExactAddress: row.show_exact_address,
    mapLocation: buildMapLocation(row),
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    builtArea: optionalNumber(row.built_area),
    usableArea: optionalNumber(row.usable_area),
    plotArea: optionalNumber(row.plot_area),
    floor: row.floor ?? undefined,
    elevator: row.elevator,
    garage: row.parking,
    terrace: row.terrace,
    furnished: row.furnished,
    exterior: row.exterior,
    description:
      row.description?.trim() ||
      `${row.property_type} en ${row.city}.`,
    features: buildFeatures(row),
    featured: row.featured,
    published: true,
    publishedAt: row.published_at ?? undefined,
    createdAt: row.published_at ?? row.created_at,
    images,
    coverImage,
    visual: 'arch',
    isDemo: false,
  };
}

export async function getPublishedProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select(PUBLIC_PROPERTY_SELECT)
    .in('status', [...PUBLIC_PROPERTY_STATUSES])
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = await attachExactAddresses(
    (data ?? []) as PublicPropertyRow[],
  );

  return rows.map(mapPublicProperty);
}

export async function getPublishedPropertyBySlug(slug: string) {
  const { data, error } = await supabase
    .from('properties')
    .select(PUBLIC_PROPERTY_SELECT)
    .eq('slug', slug)
    .in('status', [...PUBLIC_PROPERTY_STATUSES])
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const [row] = await attachExactAddresses([data as PublicPropertyRow]);

  return mapPublicProperty(row);
}

export async function getFeaturedProperties(limit = 3) {
  const { data, error } = await supabase
    .from('properties')
    .select(PUBLIC_PROPERTY_SELECT)
    .in('status', [...PUBLIC_PROPERTY_STATUSES])
    .eq('featured', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  const rows = await attachExactAddresses(
    (data ?? []) as PublicPropertyRow[],
  );

  return rows.map(mapPublicProperty);
}

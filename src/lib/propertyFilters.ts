import {
  getOptionLabel,
  propertyConditionOptions,
  propertyTypeOptions,
} from '../data/propertyOptions';
import type { Property } from '../types/content';

export type PropertyFilterState = {
  operation: string;
  province: string;
  city: string;
  area: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  minArea: string;
  terrace: boolean;
  pool: boolean;
  parking: boolean;
  elevator: boolean;
  garden: boolean;
  patio: boolean;
  storage: boolean;
  balcony: boolean;
  airConditioning: boolean;
  accessible: boolean;
  condition: string;
  order: string;
};

export type PropertyLocationOption = {
  id: string;
  type: 'province' | 'city' | 'area';
  label: string;
  context: string;
  province?: string;
  city?: string;
  area?: string;
};

export const defaultPropertyFilters: PropertyFilterState = {
  operation: '',
  province: '',
  city: '',
  area: '',
  type: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  bathrooms: '',
  minArea: '',
  terrace: false,
  pool: false,
  parking: false,
  elevator: false,
  garden: false,
  patio: false,
  storage: false,
  balcony: false,
  airConditioning: false,
  accessible: false,
  condition: '',
  order: 'featured',
};

const booleanFilterKeys = [
  'terrace',
  'pool',
  'parking',
  'elevator',
  'garden',
  'patio',
  'storage',
  'balcony',
  'airConditioning',
  'accessible',
] as const;

export function normalizePropertyFilterText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function cleanDisplayValue(value: string | undefined) {
  return value?.trim().replace(/\s+/g, ' ') || '';
}

export function buildPropertyLocationOptions(properties: Property[]) {
  const options = new Map<string, PropertyLocationOption>();

  properties.forEach((property) => {
    const province = cleanDisplayValue(property.province);
    const city = cleanDisplayValue(property.city);
    const area = cleanDisplayValue(property.area);
    const provinceKey = normalizePropertyFilterText(province);
    const cityKey = normalizePropertyFilterText(city);
    const areaKey = normalizePropertyFilterText(area);

    if (province) {
      options.set(`province:${provinceKey}`, {
        id: `province:${provinceKey}`,
        type: 'province',
        label: province,
        context: 'Provincia',
        province,
      });
    }

    if (city) {
      const id = `city:${provinceKey}:${cityKey}`;
      options.set(id, {
        id,
        type: 'city',
        label: city,
        context: province ? `Municipio · ${province}` : 'Municipio',
        province: province || undefined,
        city,
      });
    }

    if (area) {
      const id = `area:${provinceKey}:${cityKey}:${areaKey}`;
      options.set(id, {
        id,
        type: 'area',
        label: area,
        context: ['Zona', city, province].filter(Boolean).join(' · '),
        province: province || undefined,
        city: city || undefined,
        area,
      });
    }
  });

  const rank = { province: 0, city: 1, area: 2 };
  return [...options.values()].sort(
    (a, b) =>
      a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }) ||
      rank[a.type] - rank[b.type] ||
      a.context.localeCompare(b.context, 'es', { sensitivity: 'base' }),
  );
}

export function findSelectedLocation(
  filters: Pick<PropertyFilterState, 'province' | 'city' | 'area'>,
  options: PropertyLocationOption[],
) {
  const province = normalizePropertyFilterText(filters.province);
  const city = normalizePropertyFilterText(filters.city);
  const area = normalizePropertyFilterText(filters.area);

  return options.find((option) => {
    if (area) {
      return option.type === 'area' &&
        normalizePropertyFilterText(option.area ?? '') === area &&
        (!city || normalizePropertyFilterText(option.city ?? '') === city) &&
        (!province || normalizePropertyFilterText(option.province ?? '') === province);
    }
    if (city) {
      return option.type === 'city' &&
        normalizePropertyFilterText(option.city ?? '') === city &&
        (!province || normalizePropertyFilterText(option.province ?? '') === province);
    }
    return Boolean(province) && option.type === 'province' &&
      normalizePropertyFilterText(option.province ?? '') === province;
  });
}

export function applyLocationOption(
  filters: PropertyFilterState,
  option?: PropertyLocationOption,
): PropertyFilterState {
  return {
    ...filters,
    province: option?.province ?? '',
    city: option?.city ?? '',
    area: option?.area ?? '',
  };
}

export function propertyFiltersFromSearchParams(params: URLSearchParams): PropertyFilterState {
  const requestedOperation = normalizePropertyFilterText(params.get('operation') ?? '');
  const operation = ['alquiler', 'alquilar', 'renta'].includes(requestedOperation)
    ? 'alquiler'
    : ['venta', 'vender', 'compra', 'comprar'].includes(requestedOperation)
      ? 'venta'
      : '';
  const result: PropertyFilterState = {
    ...defaultPropertyFilters,
    operation,
    province: params.get('province') ?? '',
    city: params.get('city') ?? '',
    area: params.get('area') ?? '',
    type: params.get('type') ?? '',
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    bedrooms: params.get('bedrooms') ?? '',
    bathrooms: params.get('bathrooms') ?? '',
    minArea: params.get('minArea') ?? '',
    condition: params.get('condition') ?? '',
    order: params.get('order') ?? 'featured',
  };

  booleanFilterKeys.forEach((key) => {
    result[key] = params.get(key) === 'true';
  });

  return result;
}

export function propertyFiltersToSearchParams(filters: PropertyFilterState) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === true) params.set(key, 'true');
    if (typeof value === 'string' && value && !(key === 'order' && value === 'featured')) {
      params.set(key, value.trim());
    }
  });

  return params;
}

function hasFeature(property: Property, label: string) {
  const expected = normalizePropertyFilterText(label);
  return [...(property.amenities ?? []), ...(property.features ?? [])].some(
    (feature) => normalizePropertyFilterText(feature) === expected,
  );
}

export function filterProperties(properties: Property[], filters: PropertyFilterState) {
  const minimumPrice = filters.minPrice ? Number(filters.minPrice) : undefined;
  const maximumPrice = filters.maxPrice ? Number(filters.maxPrice) : undefined;
  const minimumBedrooms = filters.bedrooms ? Number(filters.bedrooms) : undefined;
  const minimumBathrooms = filters.bathrooms ? Number(filters.bathrooms) : undefined;
  const minimumArea = filters.minArea ? Number(filters.minArea) : undefined;

  return properties.filter((property) => {
    const operation = property.operation.toLowerCase().includes('alquil') ? 'alquiler' : 'venta';
    if (filters.operation && operation !== filters.operation) return false;
    if (filters.province && normalizePropertyFilterText(property.province ?? '') !== normalizePropertyFilterText(filters.province)) return false;
    if (filters.city && normalizePropertyFilterText(property.city) !== normalizePropertyFilterText(filters.city)) return false;
    if (filters.area && normalizePropertyFilterText(property.area) !== normalizePropertyFilterText(filters.area)) return false;
    if (filters.type && normalizePropertyFilterText(property.propertyType) !== normalizePropertyFilterText(filters.type)) return false;
    if (minimumPrice !== undefined && (property.price === null || property.price < minimumPrice)) return false;
    if (maximumPrice !== undefined && (property.price === null || property.price > maximumPrice)) return false;
    if (minimumBedrooms !== undefined && (property.bedrooms ?? 0) < minimumBedrooms) return false;
    if (minimumBathrooms !== undefined && (property.bathrooms ?? 0) < minimumBathrooms) return false;
    if (minimumArea !== undefined && (property.builtArea ?? 0) < minimumArea) return false;
    if (filters.terrace && !property.terrace) return false;
    if (filters.parking && !property.garage) return false;
    if (filters.elevator && !property.elevator) return false;
    if (filters.pool && !(property.pool || hasFeature(property, 'Piscina'))) return false;
    if (filters.garden && !hasFeature(property, 'Jardín')) return false;
    if (filters.patio && !hasFeature(property, 'Patio')) return false;
    if (filters.storage && !hasFeature(property, 'Trastero')) return false;
    if (filters.balcony && !hasFeature(property, 'Balcón')) return false;
    if (filters.airConditioning && !hasFeature(property, 'Aire acondicionado')) return false;
    if (filters.accessible && !hasFeature(property, 'Acceso adaptado para movilidad reducida')) return false;
    if (filters.condition && property.propertyCondition !== filters.condition) return false;
    return true;
  });
}

export function sortProperties(properties: Property[], order: string) {
  return [...properties].sort((a, b) =>
    order === 'recent'
      ? b.createdAt.localeCompare(a.createdAt)
      : order === 'priceAsc'
        ? (a.price ?? Infinity) - (b.price ?? Infinity)
        : order === 'priceDesc'
          ? (b.price ?? 0) - (a.price ?? 0)
          : Number(b.featured) - Number(a.featured),
  );
}

export function getActivePropertyFilters(filters: PropertyFilterState) {
  const chips: Array<{ key: keyof PropertyFilterState | 'location'; label: string }> = [];
  if (filters.operation) chips.push({ key: 'operation', label: filters.operation === 'alquiler' ? 'Alquiler' : 'Venta' });
  const location = filters.area || filters.city || filters.province;
  if (location) chips.push({ key: 'location', label: location });
  if (filters.type) chips.push({
    key: 'type',
    label: getOptionLabel(propertyTypeOptions, filters.type) ?? filters.type,
  });
  if (filters.minPrice) chips.push({ key: 'minPrice', label: `Desde ${Number(filters.minPrice).toLocaleString('es-ES')} €` });
  if (filters.maxPrice) chips.push({ key: 'maxPrice', label: `Hasta ${Number(filters.maxPrice).toLocaleString('es-ES')} €` });
  if (filters.bedrooms) chips.push({ key: 'bedrooms', label: `${filters.bedrooms}+ habitaciones` });
  if (filters.bathrooms) chips.push({ key: 'bathrooms', label: `${filters.bathrooms}+ baños` });
  if (filters.minArea) chips.push({ key: 'minArea', label: `${filters.minArea}+ m²` });
  const labels: Partial<Record<keyof PropertyFilterState, string>> = {
    terrace: 'Terraza', pool: 'Piscina', parking: 'Garaje', elevator: 'Ascensor',
    garden: 'Jardín', patio: 'Patio', storage: 'Trastero', balcony: 'Balcón',
    airConditioning: 'Aire acondicionado', accessible: 'Acceso adaptado',
  };
  booleanFilterKeys.forEach((key) => {
    if (filters[key]) chips.push({ key, label: labels[key] ?? key });
  });
  if (filters.condition) chips.push({
    key: 'condition',
    label: getOptionLabel(propertyConditionOptions, filters.condition) ?? filters.condition,
  });
  return chips;
}

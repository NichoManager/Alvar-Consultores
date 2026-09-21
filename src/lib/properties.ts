import {
  chaletTypeOptions,
  garageCapacityOptions,
  getOptionLabel,
  heatingTypeOptions,
  officeBuildingUseOptions,
  officeSpaceTypeOptions,
  orientationOptions,
  parkingTypeOptions,
  propertyConditionOptions,
  type AddressVisibility,
  type BuildingCertification,
  type ChaletType,
  type CommunityFeePeriod,
  type EnergyCertificateStatus,
  type GarageCapacity,
  type OfficeBuildingUse,
  type OfficeSpaceType,
} from '../data/propertyOptions';
import type {
  Property,
  PropertyImage,
} from '../types/content';
import { supabase } from './supabase';

const STORAGE_BUCKET =
  'property-images';

export const PUBLIC_PROPERTY_STATUSES = [
  'published',
  'reserved',
  'sold',
  'rented',
] as const;

type PublicPropertyStatus =
  (typeof PUBLIC_PROPERTY_STATUSES)[number];

type PropertyImageRow = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  position: number;
  is_cover: boolean;
  media_type:
    | 'photo'
    | 'floorplan';
};

type PublicPropertyRow = {
  id: string;
  reference: string | null;
  title: string;
  slug: string;

  seo_title: string | null;
  seo_description: string | null;

  operation:
    | 'venta'
    | 'alquiler';

  property_type: string;
  status: PublicPropertyStatus;

  price:
    | number
    | string;

  currency: string;

  city: string;
  area: string | null;
  province: string | null;

  postal_code?: string | null;
  address?: string | null;

  show_exact_address: boolean;

  address_visibility:
    | AddressVisibility
    | null;

  chalet_type:
    | ChaletType
    | null;

  bedrooms: number | null;
  bathrooms: number | null;

  built_area:
    | number
    | string
    | null;

  usable_area:
    | number
    | string
    | null;

  plot_area:
    | number
    | string
    | null;

  floor: string | null;
  floors_count: number | null;
  construction_year: number | null;

  property_condition:
    | string
    | null;

  orientations:
    | string[]
    | null;

  heating_type:
    | string
    | null;

  elevator: boolean;
  parking: boolean;

  parking_type:
    | string
    | null;

  parking_spaces:
    | number
    | null;

  terrace: boolean;
  furnished: boolean;
  exterior: boolean;

  garage_capacity:
    | GarageCapacity
    | null;

  office_space_type:
    | OfficeSpaceType
    | null;

  gross_leasable_area:
    | number
    | string
    | null;

  workstation_area:
    | number
    | string
    | null;

  building_use:
    | OfficeBuildingUse
    | null;

  available_from:
    | string
    | null;

  building_certifications:
    | BuildingCertification[]
    | null;

  building_floors_count:
    | number
    | null;

  office_floors_count:
    | number
    | null;

  elevators_count:
    | number
    | null;

  video_url:
    | string
    | null;

  virtual_tour_url:
    | string
    | null;

  community_fee_amount:
    | number
    | string
    | null;

  community_fee_period:
    | CommunityFeePeriod
    | null;

  ibi_annual_amount:
    | number
    | string
    | null;

  energy_certificate_status:
    | EnergyCertificateStatus
    | null;

  energy_consumption_rating:
    | string
    | null;

  energy_consumption_value:
    | number
    | string
    | null;

  energy_emissions_rating:
    | string
    | null;

  energy_emissions_value:
    | number
    | string
    | null;

  description:
    | string
    | null;

  features:
    | string[]
    | null;

  featured: boolean;

  featured_position:
    | number
    | null;

  published_at:
    | string
    | null;

  created_at: string;

  property_images:
    | PropertyImageRow[]
    | null;
};

function optionalNumber(
  value:
    | number
    | string
    | null,
) {
  if (value === null) {
    return undefined;
  }

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : undefined;
}

function safePublicUrl(
  value:
    | string
    | null,
) {
  if (!value?.trim()) {
    return undefined;
  }

  try {
    const url =
      new URL(value);

    return url.protocol === 'https:' ||
      url.protocol === 'http:'
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function normalizeFeature(
  value: string,
) {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .trim()
    .toLowerCase();
}

function uniqueFeatures(
  features: Array<
    string | null | undefined
  >,
) {
  const seen =
    new Set<string>();

  return features.filter(
    (
      feature,
    ): feature is string => {
      if (!feature?.trim()) {
        return false;
      }

      const normalized =
        normalizeFeature(
          feature,
        );

      if (
        seen.has(normalized)
      ) {
        return false;
      }

      seen.add(normalized);

      return true;
    },
  );
}

function formatArea(
  value:
    | number
    | string
    | null,
) {
  if (value === null) {
    return null;
  }

  const numericValue =
    Number(value);

  if (
    !Number.isFinite(
      numericValue,
    )
  ) {
    return null;
  }

  return numericValue.toLocaleString(
    'es-ES',
  );
}

function formatAvailabilityDate(
  value:
    | string
    | null,
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      `${value}T12:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    'es-ES',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  ).format(date);
}

function buildFeatureGroups(
  row: PublicPropertyRow,
) {
  const amenities =
    row.features ?? [];

  const equipmentNames =
    new Set([
      'Piscina',
      'Aire acondicionado',
      'Jardín',
      'Personal de seguridad',
      'Plaza cubierta',
      'Sistemas de alarma',
      'Circuito cerrado de seguridad',
      'Puerta automática',
    ]);

  const equipmentAmenities =
    amenities.filter(
      (item) =>
        equipmentNames.has(
          item,
        ),
    );

  const detailAmenities =
    amenities.filter(
      (item) =>
        !equipmentNames.has(
          item,
        ),
    );

  const condition =
    getOptionLabel(
      propertyConditionOptions,
      row.property_condition,
    );

  const heating =
    getOptionLabel(
      heatingTypeOptions,
      row.heating_type,
    );

  const parkingType =
    getOptionLabel(
      parkingTypeOptions,
      row.parking_type,
    );

  const chaletType =
    getOptionLabel(
      chaletTypeOptions,
      row.chalet_type,
    );

  const garageCapacity =
    getOptionLabel(
      garageCapacityOptions,
      row.garage_capacity,
    );

  const officeSpaceType =
    getOptionLabel(
      officeSpaceTypeOptions,
      row.office_space_type,
    );

  const buildingUse =
    getOptionLabel(
      officeBuildingUseOptions,
      row.building_use,
    );

  const orientations =
    (
      row.orientations ?? []
    )
      .map((value) =>
        getOptionLabel(
          orientationOptions,
          value,
        ),
      )
      .filter(
        (
          value,
        ): value is string =>
          Boolean(value),
      );

  const builtArea =
    formatArea(
      row.built_area,
    );

  const usableArea =
    formatArea(
      row.usable_area,
    );

  const plotArea =
    formatArea(
      row.plot_area,
    );

  const grossLeasableArea =
    formatArea(
      row.gross_leasable_area,
    );

  const workstationArea =
    formatArea(
      row.workstation_area,
    );

  const availableFrom =
    formatAvailabilityDate(
      row.available_from,
    );

  const characteristics =
    uniqueFeatures([
      chaletType,

      row.property_type === 'Garaje' &&
      garageCapacity
        ? `Capacidad: ${garageCapacity}`
        : null,

      officeSpaceType,

      builtArea
        ? row.property_type === 'Garaje'
          ? `${builtArea} m² de superficie`
          : `${builtArea} m² construidos`
        : null,

      usableArea
        ? `${usableArea} m² útiles`
        : null,

      plotArea
        ? `${plotArea} m² de parcela`
        : null,

      grossLeasableArea
        ? `${grossLeasableArea} m² de superficie bruta alquilable`
        : null,

      workstationArea
        ? `${workstationArea} m² de puesto de trabajo`
        : null,

      row.bedrooms !== null
        ? `${row.bedrooms} ${
            row.bedrooms === 1
              ? 'habitación'
              : 'habitaciones'
          }`
        : null,

      row.bathrooms !== null
        ? `${row.bathrooms} ${
            row.bathrooms === 1
              ? 'baño'
              : 'baños'
          }`
        : null,

      row.floor
        ? `Planta ${row.floor}`
        : null,

      row.floors_count !== null
        ? `${row.floors_count} ${
            row.floors_count === 1
              ? 'planta'
              : 'plantas'
          }`
        : null,

      row.building_floors_count !==
      null
        ? `${
            row.building_floors_count
          } ${
            row.building_floors_count ===
            1
              ? 'planta en el edificio'
              : 'plantas en el edificio'
          }`
        : null,

      row.office_floors_count !==
      null
        ? `${
            row.office_floors_count
          } ${
            row.office_floors_count ===
            1
              ? 'planta de oficina'
              : 'plantas de oficina'
          }`
        : null,

      buildingUse,

      availableFrom
        ? `Disponible desde ${availableFrom}`
        : null,

      row.building_certifications
        ?.length
        ? `Certificaciones ${row.building_certifications.join(
            ', ',
          )}`
        : null,

      condition,

      row.terrace
        ? 'Terraza'
        : null,

      ...detailAmenities,

      orientations.length
        ? `Orientación ${orientations
            .join(' y ')
            .toLowerCase()}`
        : null,

      row.construction_year !==
      null
        ? `Construido en ${row.construction_year}`
        : null,

      row.exterior
        ? 'Exterior'
        : null,
    ]);

  const equipment =
    uniqueFeatures([
      ...equipmentAmenities,

      row.elevators_count !==
      null
        ? `${
            row.elevators_count
          } ${
            row.elevators_count ===
            1
              ? 'ascensor'
              : 'ascensores'
          }`
        : row.elevator
          ? 'Ascensor'
          : null,

      row.furnished
        ? 'Amueblado'
        : null,

      heating
        ? `Calefacción ${heating.toLowerCase()}`
        : null,

      row.parking
        ? `Garaje${
            parkingType
              ? ` ${parkingType.toLowerCase()}`
              : ''
          }${
            row.parking_spaces
              ? ` · ${row.parking_spaces} ${
                  row.parking_spaces ===
                  1
                    ? 'plaza'
                    : 'plazas'
                }`
              : ''
          }`
        : null,
    ]);

  return {
    characteristics,
    equipment,
  };
}

function buildFeatures(
  row: PublicPropertyRow,
) {
  const {
    characteristics,
    equipment,
  } =
    buildFeatureGroups(row);

  return uniqueFeatures([
    row.property_type,
    ...characteristics,
    ...equipment,
  ]);
}

function getPublicImageUrl(
  storagePath: string,
) {
  return supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath)
    .data.publicUrl;
}

function getImageFallbackAlt(
  row: PublicPropertyRow,
) {
  const location = [
    row.city,
    row.province,
  ]
    .filter(
      (
        value,
      ): value is string =>
        Boolean(
          value?.trim(),
        ),
    )
    .join(', ');

  return location
    ? `${row.title} en ${location}`
    : row.title;
}

function mapMedia(
  row: PublicPropertyRow,
) {
  const fallbackAlt =
    getImageFallbackAlt(row);

  const mapped = [
    ...(row.property_images ??
      []),
  ]
    .sort(
      (a, b) =>
        a.position -
        b.position,
    )
    .map((image) => ({
      mediaType:
        image.media_type,

      image: {
        id: image.id,

        url: getPublicImageUrl(
          image.storage_path,
        ),

        alt:
          image.alt_text?.trim() ||
          fallbackAlt,

        position:
          image.position,

        isCover:
          image.is_cover,
      } satisfies PropertyImage,
    }));

  const photos =
    mapped
      .filter(
        (item) =>
          item.mediaType !==
          'floorplan',
      )
      .map(
        (item) =>
          item.image,
      );

  const floorplans =
    mapped
      .filter(
        (item) =>
          item.mediaType ===
          'floorplan',
      )
      .map(
        (item) =>
          item.image,
      );

  const coverImage =
    photos.find(
      (image) =>
        image.isCover,
    ) ?? photos[0];

  return {
    coverImage,
    floorplans,

    images: coverImage
      ? [
          coverImage,
          ...photos.filter(
            (image) =>
              image.id !==
              coverImage.id,
          ),
        ]
      : [],
  };
}

function buildMapLocation(
  row: PublicPropertyRow,
) {
  const addressVisibility =
    row.address_visibility ??
    (
      row.show_exact_address
        ? 'exact'
        : 'hidden'
    );

  const postalCity = [
    row.postal_code?.trim(),
    row.city?.trim(),
  ]
    .filter(
      (
        value,
      ): value is string =>
        Boolean(
          value?.trim(),
        ),
    )
    .join(' ');

  if (
    (
      addressVisibility ===
        'exact' ||
      addressVisibility ===
        'street_only'
    ) &&
    row.address?.trim()
  ) {
    return [
      row.address.trim(),
      postalCity,
      row.province?.trim(),
      'España',
    ]
      .filter(
        (
          value,
        ): value is string =>
          Boolean(
            value?.trim(),
          ),
      )
      .join(', ');
  }

  return [
    postalCity,
    row.province?.trim(),
    'España',
  ]
    .filter(
      (
        value,
      ): value is string =>
        Boolean(
          value?.trim(),
        ),
    )
    .join(', ');
}

function mapPublicProperty(
  row: PublicPropertyRow,
): Property {
  const {
    images,
    coverImage,
    floorplans,
  } = mapMedia(row);

  const {
    characteristics,
    equipment,
  } =
    buildFeatureGroups(row);

  const addressVisibility =
    row.address_visibility ??
    (
      row.show_exact_address
        ? 'exact'
        : 'hidden'
    );

  return {
    id: row.id,

    reference:
      row.reference ??
      undefined,

    slug: row.slug,

    title: row.title,

    seoTitle:
      row.seo_title?.trim() ||
      undefined,

    seoDescription:
      row.seo_description?.trim() ||
      undefined,

    operation:
      row.operation ===
      'alquiler'
        ? 'Alquilar'
        : 'Comprar',

    status:
      row.status === 'reserved'
        ? 'Reservado'
        : row.status === 'sold'
          ? 'Vendido'
          : row.status === 'rented'
            ? 'Alquilado'
            : 'Disponible',

    propertyType:
      row.property_type,

    price:
      Number(row.price),

    currency:
      row.currency,

    city:
      row.city,

    area:
      row.area?.trim() ||
      '',

    province:
      row.province ??
      undefined,

    postalCode:
      row.postal_code?.trim() ||
      undefined,

    address:
      row.address?.trim() ||
      undefined,

    showExactAddress:
      addressVisibility ===
      'exact',

    addressVisibility,

    mapLocation:
      buildMapLocation(row),

    chaletType:
      row.chalet_type ??
      undefined,

    bedrooms:
      row.bedrooms ??
      undefined,

    bathrooms:
      row.bathrooms ??
      undefined,

    builtArea:
      optionalNumber(
        row.built_area,
      ),

    usableArea:
      optionalNumber(
        row.usable_area,
      ),

    plotArea:
      optionalNumber(
        row.plot_area,
      ),

    floor:
      row.floor ??
      undefined,

    floorsCount:
      row.floors_count ??
      undefined,

    constructionYear:
      row.construction_year ??
      undefined,

    propertyCondition:
      row.property_condition ??
      undefined,

    orientations:
      row.orientations ??
      [],

    heatingType:
      row.heating_type ??
      undefined,

    elevator:
      row.elevator,

    garage:
      row.parking,

    parkingType:
      row.parking_type ??
      undefined,

    parkingSpaces:
      row.parking_spaces ??
      undefined,

    terrace:
      row.terrace,

    furnished:
      row.furnished,

    exterior:
      row.exterior,

    officeSpaceType:
      row.office_space_type ??
      undefined,

    grossLeasableArea:
      optionalNumber(
        row.gross_leasable_area,
      ),

    workstationArea:
      optionalNumber(
        row.workstation_area,
      ),

    buildingUse:
      row.building_use ??
      undefined,

    availableFrom:
      row.available_from ??
      undefined,

    buildingCertifications:
      row.building_certifications ??
      [],

    buildingFloorsCount:
      row.building_floors_count ??
      undefined,

    officeFloorsCount:
      row.office_floors_count ??
      undefined,

    elevatorsCount:
      row.elevators_count ??
      undefined,

    videoUrl:
      safePublicUrl(
        row.video_url,
      ),

    virtualTourUrl:
      safePublicUrl(
        row.virtual_tour_url,
      ),

    communityFeeAmount:
      optionalNumber(
        row.community_fee_amount,
      ),

    communityFeePeriod:
      row.community_fee_period ??
      undefined,

    ibiAnnualAmount:
      optionalNumber(
        row.ibi_annual_amount,
      ),

    energyCertificateStatus:
      row.energy_certificate_status ??
      undefined,

    energyConsumptionRating:
      row.energy_consumption_rating ??
      undefined,

    energyConsumptionValue:
      optionalNumber(
        row.energy_consumption_value,
      ),

    energyEmissionsRating:
      row.energy_emissions_rating ??
      undefined,

    energyEmissionsValue:
      optionalNumber(
        row.energy_emissions_value,
      ),

    amenities:
      row.features ?? [],

    characteristics,
    equipment,

    description:
      row.description?.trim() ||
      `${row.property_type} en ${row.city}.`,

    features:
      buildFeatures(row),

    featured:
      row.featured,

    featuredPosition:
      row.featured_position ??
      undefined,

    published: true,

    publishedAt:
      row.published_at ??
      undefined,

    createdAt:
      row.published_at ??
      row.created_at,

    images,
    floorplans,
    coverImage,

    visual: 'arch',

    isDemo: false,
  };
}

async function getPublicProperties(
  params: {
    p_slug: string | null;
    p_featured:
      | boolean
      | null;
    p_limit:
      | number
      | null;
  },
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    'get_public_properties',
    params,
  );

  if (error) {
    throw error;
  }

  return (
    (data ?? []) as PublicPropertyRow[]
  ).map(
    mapPublicProperty,
  );
}

export function getPublishedProperties() {
  return getPublicProperties({
    p_slug: null,
    p_featured: null,
    p_limit: null,
  });
}

export async function getPublishedPropertyBySlug(
  slug: string,
) {
  const [property] =
    await getPublicProperties({
      p_slug: slug,
      p_featured: null,
      p_limit: 1,
    });

  return property ?? null;
}

function compareByExistingPublicOrder(
  a: Property,
  b: Property,
) {
  if (
    a.publishedAt &&
    b.publishedAt
  ) {
    const publishedOrder =
      b.publishedAt.localeCompare(
        a.publishedAt,
      );

    if (publishedOrder !== 0) {
      return publishedOrder;
    }
  } else if (a.publishedAt) {
    return -1;
  } else if (b.publishedAt) {
    return 1;
  }

  const createdOrder =
    b.createdAt.localeCompare(
      a.createdAt,
    );

  return createdOrder !== 0
    ? createdOrder
    : a.id.localeCompare(b.id);
}

export async function getFeaturedProperties(
  limit: number | null = null,
) {
  const properties =
    await getPublicProperties({
      p_slug: null,
      p_featured: true,
      p_limit: limit,
    });

  const sortedProperties = [
    ...properties,
  ].sort((a, b) => {
    const aPosition =
      a.featuredPosition;

    const bPosition =
      b.featuredPosition;

    const aHasPosition =
      typeof aPosition === 'number';

    const bHasPosition =
      typeof bPosition === 'number';

    if (
      aHasPosition &&
      bHasPosition &&
      aPosition !== bPosition
    ) {
      return aPosition - bPosition;
    }

    if (
      aHasPosition !==
      bHasPosition
    ) {
      return aHasPosition
        ? -1
        : 1;
    }

    return compareByExistingPublicOrder(
      a,
      b,
    );
  });

  return limit === null
    ? sortedProperties
    : sortedProperties.slice(
        0,
        Math.max(
          0,
          Math.trunc(limit),
        ),
      );
}
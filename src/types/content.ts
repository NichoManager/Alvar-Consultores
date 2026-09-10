export type PropertyOperation =
  | 'Comprar'
  | 'Alquilar';

export type PropertyStatus =
  | 'Disponible'
  | 'Reservado'
  | 'Vendido'
  | 'Alquilado';

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  position: number;
  isCover: boolean;
}

export interface Property {
  id: string;
  reference?: string;
  slug: string;
  title: string;

  seoTitle?: string;
  seoDescription?: string;

  operation: PropertyOperation;
  status: PropertyStatus;
  propertyType: string;
  price: number | null;

  city: string;
  area: string;
  province?: string;
  postalCode?: string;
  address?: string;
  showExactAddress?: boolean;
  mapLocation?: string;

  bedrooms?: number;
  bathrooms?: number;

  builtArea?: number;
  usableArea?: number;
  plotArea?: number;

  floor?: string;
  floorsCount?: number;
  constructionYear?: number;
  propertyCondition?: string;
  orientations?: string[];
  heatingType?: string;

  elevator?: boolean;
  garage?: boolean;
  parkingType?: string;
  parkingSpaces?: number;
  terrace?: boolean;
  furnished?: boolean;
  exterior?: boolean;
  pool?: boolean;

  videoUrl?: string;
  virtualTourUrl?: string;

  communityFeeAmount?: number;
  communityFeePeriod?:
    | 'monthly'
    | 'quarterly'
    | 'annual';

  ibiAnnualAmount?: number;

  energyCertificateStatus?:
    | 'available'
    | 'pending'
    | 'exempt';

  description: string;
  features: string[];

  energyRating?: string;
  energyConsumptionRating?: string;
  energyConsumptionValue?: number;
  energyEmissionsRating?: string;
  energyEmissionsValue?: number;

  amenities?: string[];
  characteristics?: string[];
  equipment?: string[];

  featured: boolean;
  published: boolean;
  publishedAt?: string;
  createdAt: string;

  currency?: string;

  images?: PropertyImage[];
  floorplans?: PropertyImage[];
  coverImage?: PropertyImage;

  visual:
    | 'arch'
    | 'courtyard'
    | 'facade';

  isDemo: boolean;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingTime: string;
  intro: string;

  seoTitle?: string;
  seoDescription?: string;

  image?: string;
  imageAlt?: string;

  sections: Array<{
    title: string;
    paragraphs: string[];
  }>;
}

export interface Review {
  text: string;
  source: string;
}
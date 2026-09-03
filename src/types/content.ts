export type PropertyOperation = 'Comprar' | 'Alquilar';
export type PropertyStatus = 'Disponible' | 'Reservado' | 'Vendido' | 'Alquilado';

export interface Property {
  id: string;
  slug: string;
  title: string;
  operation: PropertyOperation;
  status: PropertyStatus;
  propertyType: string;
  price: number | null;
  city: string;
  area: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  builtArea?: number;
  elevator?: boolean;
  garage?: boolean;
  terrace?: boolean;
  pool?: boolean;
  description: string;
  features: string[];
  energyRating?: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  visual: 'arch' | 'courtyard' | 'facade';
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
  sections: Array<{ title: string; paragraphs: string[] }>;
}

export interface Review {
  text: string;
  source: string;
}

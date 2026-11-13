/**
 * Modelo único de metadatos SEO por página. Lo usan:
 *  - SeoHead (navegador): aplica estos valores al <head> tras cargar la aplicación.
 *  - scripts/prerender.mjs (build): los escribe en el HTML inicial para que no dependan de JavaScript.
 * Mantener la lógica en un solo sitio evita que el HTML inicial y el renderizado difieran.
 */
export const SITE_URL = 'https://alvarconsultoresinmobiliarios.es';
export const DEFAULT_SOCIAL_IMAGE = '/images/alvar/og-alvar-consultores.jpg';
export const DEFAULT_IMAGE_ALT = 'Alvar Consultores Inmobiliarios';

export interface SeoProps {
  title: string;
  description: string;
  path?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  image?: string;
  imageAlt?: string;
}

export interface SeoMeta {
  title: string;
  canonical: string;
  /** name="..." */
  names: Record<string, string>;
  /** property="..." */
  properties: Record<string, string>;
}

function getImageType(image: string) {
  const clean = image.split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  if (clean.endsWith('.webp')) return 'image/webp';
  return '';
}

export function buildSeoMeta(
  {
    title,
    description,
    path = '/',
    type = 'website',
    noIndex = false,
    image = DEFAULT_SOCIAL_IMAGE,
    imageAlt = DEFAULT_IMAGE_ALT,
  }: SeoProps,
  indexable: boolean,
): SeoMeta {
  const canonical = `${SITE_URL}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  const imageType = getImageType(image);
  const robots = !indexable ? 'noindex, nofollow' : noIndex ? 'noindex, follow' : 'index, follow';

  const properties: Record<string, string> = {
    'og:title': title,
    'og:description': description,
    'og:type': type,
    'og:url': canonical,
    'og:site_name': 'Alvar Consultores Inmobiliarios',
    'og:locale': 'es_ES',
    'og:image': imageUrl,
    'og:image:alt': imageAlt,
  };
  if (imageType) properties['og:image:type'] = imageType;
  if (image === DEFAULT_SOCIAL_IMAGE) {
    properties['og:image:width'] = '1200';
    properties['og:image:height'] = '630';
  }

  return {
    title,
    canonical,
    names: {
      description,
      robots,
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': imageUrl,
      'twitter:image:alt': imageAlt,
    },
    properties,
  };
}

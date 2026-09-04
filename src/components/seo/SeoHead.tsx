import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  path?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  image?: string;
}

const SITE_URL = (
  import.meta.env.VITE_SITE_URL ??
  'https://www.alvarconsultoresinmobiliarios.es'
).replace(/\/$/, '');

const DEFAULT_SOCIAL_IMAGE =
  '/images/alvar/og-alvar-consultores.png';

const SITE_IS_INDEXABLE =
  import.meta.env.VITE_ALLOW_INDEXING === 'true';

function setMeta(
  property: string,
  content: string,
  attribute = 'name',
) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${property}"]`,
  );

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, property);
    document.head.appendChild(element);
  }

  element.content = content;
}

function removeMeta(
  property: string,
  attribute = 'name',
) {
  const element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${property}"]`,
  );

  element?.remove();
}

function getImageType(image: string) {
  const cleanImage = image.split('?')[0].toLowerCase();

  if (cleanImage.endsWith('.png')) {
    return 'image/png';
  }

  if (
    cleanImage.endsWith('.jpg') ||
    cleanImage.endsWith('.jpeg')
  ) {
    return 'image/jpeg';
  }

  if (cleanImage.endsWith('.webp')) {
    return 'image/webp';
  }

  return '';
}

export function SeoHead({
  title,
  description,
  path = '/',
  type = 'website',
  noIndex = false,
  image = DEFAULT_SOCIAL_IMAGE,
}: SeoHeadProps) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${path}`;

    const imageUrl = image.startsWith('http')
      ? image
      : `${SITE_URL}${image}`;

    const imageType = getImageType(image);

    const robots = noIndex
      ? 'noindex, follow'
      : SITE_IS_INDEXABLE
        ? 'index, follow'
        : 'noindex, nofollow';

    document.title = title;

    setMeta('description', description);
    setMeta('robots', robots);

    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta(
      'og:site_name',
      'Alvar Consultores Inmobiliarios',
      'property',
    );
    setMeta('og:locale', 'es_ES', 'property');
    setMeta('og:image', imageUrl, 'property');
    setMeta(
      'og:image:alt',
      'Alvar Consultores Inmobiliarios · Inmobiliaria en Madrid',
      'property',
    );

    if (imageType) {
      setMeta('og:image:type', imageType, 'property');
    } else {
      removeMeta('og:image:type', 'property');
    }

    if (image === DEFAULT_SOCIAL_IMAGE) {
      setMeta('og:image:width', '1731', 'property');
      setMeta('og:image:height', '909', 'property');
    } else {
      removeMeta('og:image:width', 'property');
      removeMeta('og:image:height', 'property');
    }

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', imageUrl);
    setMeta(
      'twitter:image:alt',
      'Alvar Consultores Inmobiliarios · Inmobiliaria en Madrid',
    );

    let canonical =
      document.head.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
      );

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    canonical.href = canonicalUrl;
  }, [
    description,
    image,
    noIndex,
    path,
    title,
    type,
  ]);

  return null;
}
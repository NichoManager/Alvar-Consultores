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

export function SeoHead({
  title,
  description,
  path = '/',
  type = 'website',
  noIndex = false,
  image = '/og-alvar.svg',
}: SeoHeadProps) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${path}`;
    const imageUrl = image.startsWith('http')
      ? image
      : `${SITE_URL}${image}`;

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
    setMeta('og:image', imageUrl, 'property');
    setMeta(
      'og:image:alt',
      'Alvar Consultores Inmobiliarios',
      'property',
    );

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', imageUrl);

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
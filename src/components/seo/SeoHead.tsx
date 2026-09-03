import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  path?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

const SITE_URL = 'https://www.alvarconsultoresinmobiliarios.es';

function setMeta(property: string, content: string, attribute = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, property);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function SeoHead({ title, description, path = '/', type = 'website', noIndex = false }: SeoHeadProps) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${path}`;
    document.title = title;
    setMeta('description', description);
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [description, noIndex, path, title, type]);
  return null;
}

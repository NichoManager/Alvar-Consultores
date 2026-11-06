import { useEffect } from 'react';
import { isIndexableHost } from './indexing';
import { buildSeoMeta, type SeoProps } from './seoMeta';

/**
 * Durante el prerender (Node, sin `window`) SeoHead no escribe en ningún <head>:
 * deja sus propiedades en una variable global que scripts/prerender.mjs lee para
 * escribir los metadatos en el HTML inicial. En el navegador no tiene ningún efecto.
 */
declare global {
  var __SEO_HEAD__: SeoProps | undefined;
}

function setMeta(property: string, content: string, attribute = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${property}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, property);
    document.head.appendChild(element);
  }

  element.content = content;
}

function removeMeta(property: string, attribute = 'name') {
  document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${property}"]`)?.remove();
}

export function SeoHead(props: SeoProps) {
  if (typeof window === 'undefined') {
    globalThis.__SEO_HEAD__ = props;
  }

  const { title, description, path, type, noIndex, image, imageAlt } = props;

  useEffect(() => {
    const meta = buildSeoMeta(
      { title, description, path, type, noIndex, image, imageAlt },
      isIndexableHost(window.location.hostname),
    );

    document.title = meta.title;

    for (const [name, content] of Object.entries(meta.names)) {
      setMeta(name, content);
    }

    for (const [property, content] of Object.entries(meta.properties)) {
      setMeta(property, content, 'property');
    }

    // Estas dos solo se declaran con la imagen social por defecto; se retiran en otro caso.
    for (const property of ['og:image:type', 'og:image:width', 'og:image:height']) {
      if (!(property in meta.properties)) removeMeta(property, 'property');
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    canonical.href = meta.canonical;
  }, [description, image, imageAlt, noIndex, path, title, type]);

  return null;
}

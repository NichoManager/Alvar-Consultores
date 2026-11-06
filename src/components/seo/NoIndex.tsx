import { useEffect } from 'react';

/**
 * Páginas privadas (panel de administración): siempre fuera de buscadores,
 * en cualquier entorno. Se añade además la cabecera X-Robots-Tag en vercel.json.
 */
export function NoIndex() {
  useEffect(() => {
    let element =
      document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');

    if (!element) {
      element = document.createElement('meta');
      element.name = 'robots';
      document.head.appendChild(element);
    }

    element.content = 'noindex, nofollow';
  }, []);

  return null;
}

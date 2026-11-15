/**
 * Render de servidor de /inmuebles/:slug. Lo empaqueta scripts/build-ssr.mjs en api/_ssr/render-property.mjs
 * y lo usa api/property.ts. Reutiliza exactamente los mismos componentes, el mismo mapeo de datos y la misma
 * función de metadatos (buildSeoMeta) que el navegador, para que servidor e hidratación no puedan divergir.
 *
 * No modifica ningún dato del inmueble: lo que devuelve `get_public_properties` es lo que se pinta.
 */
import { renderToString } from 'react-dom/server';
import {
  StaticRouterProvider,
  createStaticHandler,
  createStaticRouter,
} from 'react-router-dom';
import { SiteLayout } from '../components/layout/SiteLayout';
import { buildSeoMeta, SITE_URL } from '../components/seo/seoMeta';
import { PropertyDetailPage } from '../pages/PropertyDetailPage';
import {
  PROPERTY_SSR_ELEMENT_ID,
  pickPublicPropertyRow,
  serializeForHtmlScript,
  setServerPropertyRow,
} from '../lib/propertySsr';

export interface RenderPropertyOptions {
  /** false en vistas previas/desarrollo (noindex) o si se fuerza el cierre a buscadores. */
  indexable: boolean;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Devuelve el documento HTML completo de la ficha: metadatos en <head>, contenido en #root y la fila pública
 * embebida para la hidratación. `template` es el shell de la SPA generado en el mismo build (assets con hash).
 */
export async function renderPropertyDocument(
  rawRow: unknown,
  template: string,
  options: RenderPropertyOptions,
): Promise<string> {
  const row = pickPublicPropertyRow(rawRow);
  if (!row) throw new Error('INVALID_PROPERTY_ROW');

  if (!/<div id="root"><\/div>/.test(template) || /data-prerendered/.test(template)) {
    throw new Error('UNEXPECTED_TEMPLATE');
  }

  const handler = createStaticHandler([
    {
      element: <SiteLayout />,
      children: [{ path: '/inmuebles/:slug', element: <PropertyDetailPage /> }],
    },
  ]);

  const context = await handler.query(
    new Request(`${SITE_URL}/inmuebles/${encodeURIComponent(row.slug)}`),
  );
  if (context instanceof Response) throw new Error('UNEXPECTED_ROUTER_RESPONSE');

  const router = createStaticRouter(handler.dataRoutes, context);

  // A partir de aquí todo es síncrono: nada puede intercalarse entre fijar el estado global y leerlo,
  // así que dos peticiones simultáneas en la misma instancia no se mezclan.
  setServerPropertyRow(row);
  globalThis.__SEO_HEAD__ = undefined;

  let body: string;
  let seo = globalThis.__SEO_HEAD__;

  try {
    body = renderToString(
      <StaticRouterProvider router={router} context={context} hydrate={false} />,
    );
    seo = globalThis.__SEO_HEAD__;
  } finally {
    setServerPropertyRow(null);
    globalThis.__SEO_HEAD__ = undefined;
  }

  if (!seo) throw new Error('NO_SEO_HEAD');
  if ((body.match(/<h1(?:\s|>)/g) ?? []).length !== 1) throw new Error('H1_COUNT');
  if (/Cargando inmueble/.test(body)) throw new Error('LOADING_STATE_RENDERED');

  const meta = buildSeoMeta(seo, options.indexable);

  const expectedCanonical = `${SITE_URL}/inmuebles/${row.slug}`;
  if (meta.canonical !== expectedCanonical) throw new Error('CANONICAL_MISMATCH');

  const head = [
    `<title>${escapeHtml(meta.title)}</title>`,
    ...Object.entries(meta.names).map(([k, v]) => `<meta name="${escapeHtml(k)}" content="${escapeHtml(v)}" />`),
    ...Object.entries(meta.properties).map(([k, v]) => `<meta property="${escapeHtml(k)}" content="${escapeHtml(v)}" />`),
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`,
  ].join('\n  ');

  const embedded = `<script type="application/json" id="${PROPERTY_SSR_ELEMENT_ID}">${serializeForHtmlScript(row)}</script>`;

  // Se usan funciones como reemplazo para que secuencias como "$&" o "$1" de un texto escrito por el
  // cliente nunca se interpreten como patrones de String.replace.
  const html = template
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, () => '')
    .replace(/<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+)"[\s\S]*?\/>/gi, () => '')
    .replace('</head>', () => `  ${head}\n</head>`)
    .replace('<div id="root"></div>', () => `<div id="root" data-prerendered="true">${body}</div>\n  ${embedded}`);

  if (!html.includes('data-prerendered="true"') || !html.includes(PROPERTY_SSR_ELEMENT_ID)) {
    throw new Error('INJECTION_FAILED');
  }

  return html;
}

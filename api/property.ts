import { createClient } from '@supabase/supabase-js';

declare const process: {
  env: Record<string, string | undefined>;
};

/**
 * SSR dinámico de /inmuebles/:slug (fase 1: la función existe pero NO está conectada a ninguna ruta pública;
 * vercel.json sigue enviando /inmuebles/:slug al shell de la SPA).
 *
 * Reglas:
 *  - Solo usa `get_public_properties` con la clave pública (VITE_SUPABASE_PUBLISHABLE_KEY). Nunca credenciales privadas.
 *  - Reproduce los datos del inmueble tal cual los devuelve la función pública; no modifica ni normaliza nada.
 *  - 200: publicado, reservado, vendido o alquilado. 404 real: slug inexistente, borrador o archivado.
 *  - Fallo de Supabase, de configuración o de render: 503 temporal, sin caché y con noindex. Nunca la Home con 200.
 */

const PUBLIC_STATUSES = new Set(['published', 'reserved', 'sold', 'rented']);

// Los slugs reales son minúsculas, números y guiones. Cualquier otra cosa es 404 sin consultar la base de datos.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 120;

// Caché del CDN. Política conservadora (ver justificación en el informe de la fase 1):
//  - 200: 60 s sin stale-while-revalidate. Una ficha archivada o editada deja de servirse como máximo ~60 s después.
//  - 404: 30 s. Un inmueble recién publicado cuya URL se visitó antes de publicarse aparece en menos de 30 s.
//  - 503: nunca se guarda.
// Los navegadores siempre revalidan (max-age=0).
const CACHE_FOUND = 'public, max-age=0, s-maxage=60';
const CACHE_NOT_FOUND = 'public, max-age=0, s-maxage=30';
const CACHE_NEVER = 'no-store';

const DEFAULT_TIMEOUT_MS = 4000;
const RETRY_AFTER_SECONDS = '60';

type Lookup =
  | { kind: 'found'; row: unknown }
  | { kind: 'not-found' }
  | { kind: 'error' };

const FALLBACK_NOT_FOUND_HTML =
  '<!doctype html><html lang="es-ES"><head><meta charset="utf-8"><title>Página no encontrada | Alvar Consultores</title><meta name="robots" content="noindex, follow"></head><body><h1>Página no encontrada</h1><p><a href="/inmuebles">Ver inmuebles</a></p></body></html>';

const FALLBACK_UNAVAILABLE_HTML =
  '<!doctype html><html lang="es-ES"><head><meta charset="utf-8"><title>Servicio temporalmente no disponible | Alvar Consultores</title><meta name="robots" content="noindex, nofollow"></head><body><h1>Servicio temporalmente no disponible</h1><p>Inténtalo de nuevo en unos minutos.</p></body></html>';

function timeoutMs() {
  const configured = Number(process.env.PROPERTY_SSR_TIMEOUT_MS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_TIMEOUT_MS;
}

function isIndexable() {
  // Misma regla que el prerender: cerrado en vistas previas/desarrollo o si se fuerza noindex.
  const env = process.env.VERCEL_ENV ?? '';
  return !['preview', 'development'].includes(env) && process.env.VITE_FORCE_NOINDEX !== 'true';
}

function reply(
  status: number,
  html: string,
  headers: Record<string, string>,
  headOnly: boolean,
) {
  return new Response(headOnly ? null : html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });
}

async function lookupProperty(slug: string): Promise<Lookup> {
  const url = process.env.VITE_SUPABASE_URL?.trim();
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !key) {
    console.error('SSR property: missing public Supabase configuration.');
    return { kind: 'error' };
  }

  try {
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });

    const { data, error } = await supabase
      .rpc('get_public_properties', { p_slug: slug, p_featured: null, p_limit: 1 })
      .abortSignal(AbortSignal.timeout(timeoutMs()));

    if (error) {
      console.error('SSR property: RPC failed.', { code: error.code ?? null });
      return { kind: 'error' };
    }

    const rows: unknown[] = Array.isArray(data) ? data : [];
    const row = rows.find(
      (candidate): candidate is Record<string, unknown> =>
        typeof candidate === 'object' && candidate !== null && (candidate as { slug?: unknown }).slug === slug,
    );

    // Defensa adicional: aunque la función pública ya filtra, nunca se pinta algo que no sea publicable.
    if (!row || typeof row.status !== 'string' || !PUBLIC_STATUSES.has(row.status)) {
      return { kind: 'not-found' };
    }

    return { kind: 'found', row };
  } catch (error) {
    console.error('SSR property: unexpected error.', error instanceof Error ? error.name : 'unknown');
    return { kind: 'error' };
  }
}

async function loadAssets() {
  try {
    return await import('./_ssr/assets.mjs');
  } catch {
    return null;
  }
}

async function notFound(headOnly: boolean) {
  const assets = await loadAssets();
  return reply(
    404,
    assets?.NOT_FOUND_HTML ?? FALLBACK_NOT_FOUND_HTML,
    { 'Cache-Control': CACHE_NOT_FOUND, 'X-Robots-Tag': 'noindex' },
    headOnly,
  );
}

async function unavailable(headOnly: boolean) {
  const assets = await loadAssets();
  return reply(
    503,
    assets?.UNAVAILABLE_HTML ?? FALLBACK_UNAVAILABLE_HTML,
    { 'Cache-Control': CACHE_NEVER, 'Retry-After': RETRY_AFTER_SECONDS, 'X-Robots-Tag': 'noindex' },
    headOnly,
  );
}

async function handle(request: Request, headOnly: boolean) {
  const slug = new URL(request.url).searchParams.get('slug') ?? '';

  if (!slug || slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) {
    return notFound(headOnly);
  }

  const lookup = await lookupProperty(slug);

  if (lookup.kind === 'not-found') return notFound(headOnly);
  if (lookup.kind === 'error') return unavailable(headOnly);

  try {
    const [{ renderPropertyDocument }, { SHELL_TEMPLATE }] = await Promise.all([
      import('./_ssr/render-property.mjs'),
      import('./_ssr/assets.mjs'),
    ]);

    const document = await renderPropertyDocument(lookup.row, SHELL_TEMPLATE, {
      indexable: isIndexable(),
    });

    // Sin X-Robots-Tag: las fichas públicas deben poder indexarse. El acceso directo a /api/property
    // lleva noindex mediante una regla de cabeceras de vercel.json (solo casa con esa URL, no con /inmuebles/:slug).
    return reply(200, document, { 'Cache-Control': CACHE_FOUND }, headOnly);
  } catch (error) {
    console.error('SSR property: render failed.', error instanceof Error ? error.message : 'unknown');
    return unavailable(headOnly);
  }
}

export async function GET(request: Request) {
  return handle(request, false);
}

export async function HEAD(request: Request) {
  return handle(request, true);
}

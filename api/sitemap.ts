import { createClient } from '@supabase/supabase-js';
import { sitemapBlogArticles } from './_blogArticleMetadata';

declare const process: {
  env: Record<string, string | undefined>;
};

const DEFAULT_SITE_URL = 'https://www.alvarconsultoresinmobiliarios.es';
const STATIC_PATHS = [
  '/',
  '/inmuebles',
  '/vender',
  '/servicios',
  '/nosotros',
  '/opiniones',
  '/contacto',
  '/blog',
] as const;

type SitemapEntry = {
  loc: string;
  lastmod?: string;
};

type PublicPropertySlug = {
  slug?: unknown;
};

function getSiteUrl() {
  const configuredUrl = process.env.VITE_SITE_URL?.trim();

  try {
    const url = new URL(configuredUrl || DEFAULT_SITE_URL);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return DEFAULT_SITE_URL;
    }
    return url.toString().replace(/\/+$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeSlug(value: unknown) {
  if (typeof value !== 'string') return null;
  const slug = value.trim();
  if (!slug || /[/?#]/.test(slug)) return null;
  return encodeURIComponent(slug);
}

function validLastmod(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? undefined
    : value;
}

function buildXml(entries: SitemapEntry[]) {
  const urls = entries.map(({ loc, lastmod }) => [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    '  </url>',
  ].join('\n'));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

export async function GET() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
  const supabasePublishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !supabasePublishableKey) {
    console.error('Sitemap unavailable: missing public Supabase configuration.');
    return new Response('Sitemap temporarily unavailable.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    const { data, error } = await supabase.rpc('get_public_properties', {
      p_slug: null,
      p_featured: null,
      p_limit: 1000,
    });

    if (error) {
      console.error('Sitemap property RPC failed.', {
        code: error.code,
        message: error.message,
      });
      return new Response('Sitemap temporarily unavailable.', {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const siteUrl = getSiteUrl();
    const entries = new Map<string, SitemapEntry>();
    const addEntry = (path: string, lastmod?: string) => {
      const loc = `${siteUrl}${path}`;
      if (!entries.has(loc)) entries.set(loc, { loc, lastmod });
    };

    STATIC_PATHS.forEach((path) => addEntry(path));
    sitemapBlogArticles.forEach((article) => {
      const slug = normalizeSlug(article.slug);
      if (slug) addEntry(`/blog/${slug}`, validLastmod(article.date));
    });
    ((data ?? []) as PublicPropertySlug[]).forEach((property) => {
      const slug = normalizeSlug(property.slug);
      if (slug) addEntry(`/inmuebles/${slug}`);
    });

    return new Response(buildXml([...entries.values()]), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error(
      'Unexpected sitemap generation error.',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return new Response('Sitemap temporarily unavailable.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}

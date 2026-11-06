// Prerender de las páginas públicas de Alvar. Se ejecuta tras `vite build`.
// Escribe HTML SEO completo (título, descripción, canonical, robots, Open Graph, H1, contenido y JSON-LD)
// sin depender de JavaScript. NO toca rutas privadas ni dinámicas: /admin/* y /inmuebles/:slug siguen como SPA
// (se sirven desde _spa.html, el HTML vacío original). Si cualquier comprobación falla, el build falla y no se publica nada.
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom';
import { build } from 'esbuild';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const site = 'https://alvarconsultoresinmobiliarios.es';
const dist = 'dist';
const tmp = '.prerender-build';
// El HTML inicial declara "index" salvo que el build sea una vista previa/desarrollo de Vercel o se fuerce lo contrario.
// (Por defecto indexable: un noindex por error en producción es el fallo más caro. Las vistas previas además
// reciben noindex en el navegador por su dominio, ver src/components/seo/indexing.ts.)
const indexable = !['preview', 'development'].includes(process.env.VERCEL_ENV ?? '') && process.env.PRERENDER_NOINDEX !== 'true';

const staticRoutes = [
  { path: '/', page: 'HomePage' },
  { path: '/inmuebles', page: 'PropertiesPage' },
  { path: '/vender', page: 'SellPage' },
  { path: '/servicios', page: 'ServicesPage' },
  { path: '/nosotros', page: 'AboutPage' },
  { path: '/opiniones', page: 'ReviewsPage' },
  { path: '/contacto', page: 'ContactPage' },
  { path: '/blog', page: 'BlogPage' },
  { path: '/aviso-legal', page: 'LegalPage', props: { kind: 'legal' } },
  { path: '/privacidad', page: 'LegalPage', props: { kind: 'privacy' } },
  { path: '/cookies', page: 'LegalPage', props: { kind: 'cookies' } },
];

const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fail = code => { throw new Error(code); };

async function main() {
  const template = await readFile(join(dist, 'index.html'), 'utf8');
  if (!/<div id="root"><\/div>/.test(template)) fail('UNEXPECTED_VITE_ROOT');
  if (/data-prerendered/.test(template)) fail('TEMPLATE_ALREADY_PRERENDERED');

  const pages = ['HomePage', 'PropertiesPage', 'SellPage', 'ServicesPage', 'AboutPage', 'ReviewsPage', 'ContactPage', 'BlogPage', 'LegalPage', 'BlogPostPage', 'NotFoundPage'];
  await rm(tmp, { recursive: true, force: true });
  await build({
    entryPoints: [...pages.map(p => `src/pages/${p}.tsx`), 'src/components/layout/SiteLayout.tsx', 'src/components/seo/seoMeta.ts', 'src/data/articles.ts'],
    bundle: true, platform: 'node', packages: 'external', format: 'esm', jsx: 'automatic', outdir: tmp, outbase: 'src',
    outExtension: { '.js': '.mjs' }, target: 'node22', loader: { '.css': 'empty' }, logLevel: 'error',
    // Sin credenciales reales: el prerender nunca consulta datos privados ni de inmuebles.
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://prerender.invalid'),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify('prerender-disabled'),
      'import.meta.env.VITE_SITE_URL': JSON.stringify(site),
      'import.meta.env.VITE_FORCE_NOINDEX': JSON.stringify('false'),
    },
  });

  const load = p => import(pathToFileURL(join(process.cwd(), tmp, p)).href);
  const Layout = (await load('components/layout/SiteLayout.mjs')).SiteLayout;
  const { buildSeoMeta } = await load('components/seo/seoMeta.mjs');
  const { articles } = await load('data/articles.mjs');
  if (!Array.isArray(articles) || articles.length < 3 || articles.length > 200) fail('INVALID_ARTICLES');

  const jobs = staticRoutes.map(r => ({ ...r, route: r.path }));
  for (const article of articles) {
    if (!/^[a-z0-9-]+$/.test(article.slug)) fail('INVALID_ARTICLE_SLUG');
    jobs.push({ path: `/blog/${article.slug}`, route: '/blog/:slug', page: 'BlogPostPage' });
  }
  jobs.push({ path: '/404.html', route: '*', page: 'NotFoundPage', entry: '/ruta-que-no-existe', is404: true });

  // El HTML vacío original se conserva para las rutas que siguen siendo SPA.
  await copyFile(join(dist, 'index.html'), join(dist, '_spa.html'));

  const seen = new Set();
  const titles = new Map();
  const report = [];
  for (const job of jobs) {
    if (seen.has(job.path)) fail('DUPLICATE_PATH:' + job.path);
    seen.add(job.path);
    const Page = (await load(`pages/${job.page}.mjs`))[job.page];
    if (typeof Page !== 'function') fail('MISSING_PAGE:' + job.page);
    const handler = createStaticHandler([
      { element: React.createElement(Layout), children: [{ path: job.route, element: React.createElement(Page, job.props ?? {}) }] },
    ]);
    const context = await handler.query(new Request(site + (job.entry ?? job.path)));
    if (context instanceof Response) fail('UNEXPECTED_REDIRECT:' + job.path);
    const router = createStaticRouter(handler.dataRoutes, context);
    globalThis.__SEO_HEAD__ = undefined;
    const rendered = renderToString(React.createElement(StaticRouterProvider, { router, context, hydrate: false }));
    const seo = globalThis.__SEO_HEAD__;
    if (!seo) fail('NO_SEO_HEAD:' + job.path);
    const meta = buildSeoMeta(seo, indexable);

    const expectedCanonical = job.is404 ? `${site}/404` : `${site}${job.path}`;
    if (meta.canonical !== expectedCanonical) fail(`CANONICAL_MISMATCH:${job.path}:${meta.canonical}`);
    const h1 = (rendered.match(/<h1(?:\s|>)/g) || []).length;
    const words = rendered.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
    const ld = (rendered.match(/type="application\/ld\+json"/g) || []).length;
    if (h1 !== 1) fail(`H1_COUNT:${job.path}:${h1}`);
    if (words < 35) fail(`THIN_PRERENDER:${job.path}:${words}`);
    if (job.page === 'BlogPostPage' && ld < 2) fail('ARTICLE_WITHOUT_JSONLD:' + job.path);
    if (job.path === '/' && ld < 1) fail('HOME_WITHOUT_JSONLD');
    if (!job.is404) {
      if (titles.has(meta.title)) fail(`DUPLICATE_TITLE:${job.path}:${titles.get(meta.title)}`);
      titles.set(meta.title, job.path);
    }

    const head = [
      `<title>${esc(meta.title)}</title>`,
      ...Object.entries(meta.names).map(([k, v]) => `<meta name="${esc(k)}" content="${esc(v)}" />`),
      ...Object.entries(meta.properties).map(([k, v]) => `<meta property="${esc(k)}" content="${esc(v)}" />`),
      `<link rel="canonical" href="${esc(meta.canonical)}" />`,
    ].join('\n  ');
    const html = template
      .replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, '')
      .replace(/<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+)"[\s\S]*?\/>/gi, '')
      .replace('</head>', `  ${head}\n</head>`)
      .replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${rendered}</div>`);
    if (!html.includes('data-prerendered="true"') || !html.includes(esc(meta.title))) fail('INJECTION_FAILED:' + job.path);

    const target = job.path === '/' ? join(dist, 'index.html') : join(dist, job.path.endsWith('.html') ? job.path : `${job.path}.html`);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html);
    report.push({ path: job.path, title: meta.title, robots: meta.names.robots, h1, words, jsonld: ld, bytes: Buffer.byteLength(html) });
  }

  await writeFile(join(dist, 'prerender-manifest.json'), JSON.stringify({ schema: 'rayo-prerender/1', indexable, pages: report }, null, 2));
  for (const r of report) console.log('PRERENDER', JSON.stringify(r));
  console.log('PRERENDER_SUMMARY', JSON.stringify({ pages: report.length, indexable, spaShell: '_spa.html', notCovered: ['/inmuebles/:slug', '/admin/*'] }));
}

try { await main(); } finally { await rm(tmp, { recursive: true, force: true }); }

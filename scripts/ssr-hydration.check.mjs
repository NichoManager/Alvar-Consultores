// Comprobación de hidratación en Chromium (datos SIMULADOS; sin red real). No forma parte del build.
// Requisitos: `npm run build` hecho con VITE_SUPABASE_URL=https://example.invalid y Playwright disponible.
// Uso: node scripts/ssr-hydration.check.mjs
//
// Comprueba, sobre el HTML que genera el render de servidor:
//  A) la hidratación adopta el DOM del servidor: mismos nodos, sin parpadeo, sin avisos de React y sin consultas a Supabase;
//  B) la ruta SPA clásica (sin datos embebidos) sigue cargando el inmueble desde el navegador, con una sola consulta;
//  C) la navegación interna consume los datos embebidos una sola vez y después consulta datos frescos.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { publicRows } from './fixtures/property-rows.mjs';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.log('OMITIDO: Playwright no está disponible en este entorno.');
  process.exit(0);
}

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
process.env.VITE_SUPABASE_URL = 'https://example.invalid'; // debe coincidir con el valor incrustado en el bundle del cliente
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'dummy';
process.env.VERCEL_ENV = 'production';

const { renderPropertyDocument } = await import(pathToFileURL(join(ROOT, 'api/_ssr/render-property.mjs')).href);
const { SHELL_TEMPLATE } = await import(pathToFileURL(join(ROOT, 'api/_ssr/assets.mjs')).href);

const bundleName = (await readFile(join(DIST, '_spa.html'), 'utf8')).match(/src="\/assets\/([^"]+\.js)"/)[1];
if (!(await readFile(join(DIST, 'assets', bundleName), 'utf8')).includes('example.invalid')) {
  console.log('AVISO: el bundle del cliente no se construyó con VITE_SUPABASE_URL=https://example.invalid; las URL de imagen podrían no coincidir.');
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.ico': 'image/x-icon' };
const rowBySlug = (slug) => publicRows.find((row) => row.slug === slug);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const send = (status, type, body) => {
    res.writeHead(status, { 'Content-Type': type });
    res.end(body);
  };
  const ficha = url.pathname.match(/^\/inmuebles\/([a-z0-9-]+)$/);
  if (ficha) {
    const row = rowBySlug(ficha[1]);
    if (!row) return send(404, 'text/plain', 'no encontrado');
    // ?spa=1 sirve el shell vacío (comportamiento actual de producción); si no, el HTML del servidor.
    if (url.searchParams.get('spa')) return send(200, 'text/html', SHELL_TEMPLATE);
    const document = await renderPropertyDocument(row, SHELL_TEMPLATE, { indexable: true });
    // Control negativo (CHECK_WITHOUT_EMBEDDED=1): sin los datos embebidos esta comprobación DEBE fallar.
    return send(
      200,
      'text/html',
      process.env.CHECK_WITHOUT_EMBEDDED
        ? document.replace(/<script type="application\/json" id="__ALVAR_PROPERTY__">[\s\S]*?<\/script>/, () => '')
        : document,
    );
  }
  for (const file of [join(DIST, url.pathname), join(DIST, `${url.pathname}.html`), join(DIST, url.pathname, 'index.html')]) {
    try {
      if ((await stat(file)).isFile()) return send(200, TYPES[extname(file)] ?? 'application/octet-stream', await readFile(file));
    } catch {
      /* siguiente candidato */
    }
  }
  send(404, 'text/plain', 'no encontrado');
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'OK    ' : 'FALLO '} ${name}${detail ? ` · ${detail}` : ''}`);
};

const PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

async function newPage(browser, { delayScripts = 0, rpcDelay = 0 } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const log = { console: [], rpc: [], pageErrors: [] };
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && log.console.push(`${m.type()}: ${m.text().slice(0, 200)}`));
  page.on('pageerror', (e) => log.pageErrors.push(e.message));
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await context.route(/example\.invalid/, async (route) => {
    const request = route.request();
    if (request.url().includes('/rest/v1/rpc/get_public_properties')) {
      const body = JSON.parse(request.postData() ?? '{}');
      log.rpc.push(body.p_slug);
      if (rpcDelay) await new Promise((r) => setTimeout(r, rpcDelay));
      const row = rowBySlug(body.p_slug);
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(row ? [row] : []) });
    }
    return route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL });
  });
  if (delayScripts) {
    await context.route('**/assets/*.js', async (route) => {
      await new Promise((r) => setTimeout(r, delayScripts));
      await route.continue();
    });
  }
  return { page, log, context };
}

const hydrated = (page) =>
  page.waitForFunction(() => Object.keys(document.getElementById('root') ?? {}).some((k) => k.startsWith('__reactContainer')), null, { timeout: 15000 });

const browser = await chromium.launch();

// ---------- A) Hidratación del HTML del servidor ----------
for (const slug of ['piso-en-venta-en-madrid', 'chalet-vendido', 'piso-texto-dificil']) {
  const row = rowBySlug(slug);
  const { page, log, context } = await newPage(browser, { delayScripts: 1200 });
  // 'commit' (no 'domcontentloaded'): los scripts de módulo son diferidos y DOMContentLoaded los espera,
  // así que con 'domcontentloaded' ya habría empezado la hidratación.
  await page.goto(`${base}/inmuebles/${slug}`, { waitUntil: 'commit' });
  await page.waitForSelector('main h1', { state: 'attached' });

  // Antes de que cargue ningún JavaScript: el contenido ya está en el HTML.
  const pre = await page.evaluate(() => {
    window.__h1 = document.querySelector('h1');
    window.__mainMuts = 0;
    window.__mainRemoved = 0;
    new MutationObserver((list) => {
      for (const m of list) {
        if (m.target.closest?.('main') || m.target.nodeName === 'MAIN') {
          window.__mainMuts += 1;
          window.__mainRemoved += m.removedNodes.length;
        }
      }
    }).observe(document.getElementById('root'), { childList: true, subtree: true, characterData: true });
    const main = document.querySelector('main');
    return { reactAttached: Object.keys(document.getElementById('root')).some((k) => k.startsWith('__reactContainer')), h1: document.querySelector('h1')?.textContent, html: main.outerHTML, text: main.innerText, loading: /Cargando inmueble/.test(document.body.innerText), title: document.title };
  });
  check(`A · ${slug} · la captura previa es anterior a la hidratación (React aún no ha arrancado)`, pre.reactAttached === false);
  check(`A · ${slug} · el HTML sin JavaScript ya trae H1 y contenido`, pre.h1 === row.title && !pre.loading && pre.html.length > 3000, `H1="${pre.h1?.slice(0, 40)}"`);
  check(`A · ${slug} · título del documento sin JS = seo_title del panel`, pre.title === (row.seo_title?.trim() || pre.title));

  await hydrated(page);
  await page.waitForTimeout(1000);

  const post = await page.evaluate(() => ({
    sameH1Node: window.__h1 === document.querySelector('h1'),
    mutations: window.__mainMuts,
    removed: window.__mainRemoved,
    html: document.querySelector('main').outerHTML,
    loading: /Cargando inmueble/.test(document.body.innerText),
    h1Count: document.querySelectorAll('h1').length,
    title: document.title,
    canonical: document.querySelector('link[rel=canonical]')?.href,
    embeddedStillThere: !!document.getElementById('__ALVAR_PROPERTY__'),
  }));
  check(`A · ${slug} · React adopta el DOM (mismo nodo <h1>, ningún nodo retirado de <main>)`, post.sameH1Node && post.removed === 0, `mutaciones en main: ${post.mutations}, retirados: ${post.removed}`);
  check(`A · ${slug} · <main> idéntico antes y después de hidratar`, post.html === pre.html, post.html === pre.html ? '' : `difiere en el carácter ${[...post.html].findIndex((c, i) => c !== pre.html[i])}`);
  check(`A · ${slug} · un solo <h1> y sin estado «Cargando inmueble»`, post.h1Count === 1 && !post.loading);
  check(`A · ${slug} · título y canonical estables tras hidratar`, post.title === pre.title && post.canonical === `https://alvarconsultoresinmobiliarios.es/inmuebles/${slug}`);
  check(`A · ${slug} · cero consultas a Supabase durante la carga`, log.rpc.length === 0, `consultas: ${log.rpc.length}`);
  const bad = log.console.filter((m) => !/Failed to load resource|ERR_/i.test(m));
  check(`A · ${slug} · sin avisos ni errores de React/consola`, bad.length === 0 && log.pageErrors.length === 0, [...bad, ...log.pageErrors].join(' | ').slice(0, 300));
  await context.close();
}

// ---------- B) Ruta SPA clásica (sin datos embebidos) ----------
{
  const slug = 'piso-en-venta-en-madrid';
  const row = rowBySlug(slug);
  const { page, log, context } = await newPage(browser, { rpcDelay: 400 });
  await page.goto(`${base}/inmuebles/${slug}?spa=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Cargando inmueble', { timeout: 8000 });
  await page.waitForSelector('h1', { timeout: 8000 });
  const h1 = await page.textContent('h1');
  check('B · SPA clásica: primero «Cargando…», después la ficha completa', h1 === row.title);
  check('B · SPA clásica: exactamente una consulta a Supabase', log.rpc.length === 1 && log.rpc[0] === slug, `consultas: ${JSON.stringify(log.rpc)}`);
  await context.close();
}

// ---------- C) Navegación interna: se consume el dato embebido una sola vez ----------
{
  const a = 'piso-en-venta-en-madrid';
  const b = 'atico-reservado';
  const { page, log, context } = await newPage(browser);
  await page.goto(`${base}/inmuebles/${a}`, { waitUntil: 'load' });
  await hydrated(page);
  await page.waitForTimeout(600);
  const go = async (slug) => {
    await page.evaluate((s) => {
      history.pushState({}, '', `/inmuebles/${s}`);
      dispatchEvent(new PopStateEvent('popstate'));
    }, slug);
    await page.waitForFunction((t) => document.querySelector('h1')?.textContent === t, rowBySlug(slug).title, { timeout: 8000 });
    await page.waitForTimeout(300);
  };
  check('C · carga inicial con datos embebidos: 0 consultas', log.rpc.length === 0);
  await go(b);
  check('C · navegar a otra ficha consulta datos frescos (1 consulta)', JSON.stringify(log.rpc) === JSON.stringify([b]), JSON.stringify(log.rpc));
  await go(a);
  check('C · volver a la primera ficha NO reutiliza el dato embebido antiguo (consulta datos frescos)', JSON.stringify(log.rpc) === JSON.stringify([b, a]), JSON.stringify(log.rpc));
  await context.close();
}

await browser.close();
server.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas`);
process.exit(failed.length ? 1 : 0);

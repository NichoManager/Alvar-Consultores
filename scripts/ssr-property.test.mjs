// Pruebas de api/property.ts con datos SIMULADOS. No toca Supabase ni Vercel reales: levanta un servidor local
// que imita `get_public_properties` (mismo filtrado de estados) y comprueba 200, 404, errores temporales,
// metadatos, JSON-LD, serialización segura y privacidad.
//
// Requisito: haber ejecutado `npm run build` (genera api/_ssr/). Uso: `npm run test:ssr`.
import assert from 'node:assert/strict';
import { access, cp, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import http from 'node:http';
import { builtinModules } from 'node:module';
import { join } from 'node:path';
import { after, before, beforeEach, test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { PRIVATE_EXTRAS, PUBLIC_ROW_KEYS, hiddenRows, makeRow, publicRows } from './fixtures/property-rows.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const TEST_KEY = 'sb_publishable_TEST_KEY_ONLY';
const SITE = 'https://alvarconsultoresinmobiliarios.es';
const PUBLIC_STATUSES = new Set(['published', 'reserved', 'sold', 'rented']);

const state = { mode: 'ok', calls: [], badAuth: [], extras: null, held: [] };
let server;
let fn;

// ---------- Supabase simulado ----------
function startMock() {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      let raw = '';
      req.on('data', (chunk) => (raw += chunk));
      req.on('end', () => {
        if (!(req.method === 'POST' && req.url.startsWith('/rest/v1/rpc/get_public_properties'))) {
          res.writeHead(404).end();
          return;
        }
        const body = raw ? JSON.parse(raw) : {};
        if (req.headers.apikey !== TEST_KEY || req.headers.authorization !== `Bearer ${TEST_KEY}`) {
          state.badAuth.push({ apikey: req.headers.apikey, authorization: req.headers.authorization });
        }
        state.calls.push({ url: req.url, body });

        if (state.mode === 'error500') {
          res.writeHead(500, { 'content-type': 'application/json' }).end(JSON.stringify({ message: 'boom' }));
        } else if (state.mode === 'rpc-missing') {
          res.writeHead(404, { 'content-type': 'application/json' }).end(JSON.stringify({ code: 'PGRST202', message: 'no function' }));
        } else if (state.mode === 'timeout') {
          state.held.push(res); // no responde nunca
        } else if (state.mode === 'reset') {
          req.socket.destroy();
        } else if (state.mode === 'bad-json') {
          res.writeHead(200, { 'content-type': 'application/json' }).end('{no es json');
        } else {
          const slug = body.p_slug;
          let rows = [...publicRows, ...hiddenRows].filter(
            (row) => row.slug === slug && PUBLIC_STATUSES.has(row.status), // igual que el RPC real
          );
          // Defectos simulados del RPC para probar las defensas del servidor.
          if (slug === 'fuga-borrador') rows = [makeRow({ slug, status: 'draft' })];
          if (slug === 'fuga-otro-slug') rows = [makeRow({ slug: 'otra-cosa' })];
          if (slug === 'fila-rota') rows = [makeRow({ slug, title: null })];
          if (state.extras) rows = rows.map((row) => ({ ...row, ...state.extras }));
          res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(rows));
        }
      });
    });
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

// ---------- Utilidades de análisis del HTML ----------
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const title = (html) => decode(html.match(/<title>([\s\S]*?)<\/title>/)[1]);
const meta = (html, name) => {
  const m = html.match(new RegExp(`<meta (?:name|property)="${name.replace(/[:.]/g, '\\$&')}" content="([^"]*)"`));
  return m ? decode(m[1]) : null;
};
const canonical = (html) => html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? null;
const jsonLd = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const embedded = (html) => {
  const m = html.match(/<script type="application\/json" id="__ALVAR_PROPERTY__">([\s\S]*?)<\/script>/);
  return m ? { text: m[1], value: JSON.parse(m[1]) } : null;
};
const h1s = (html) => [...html.matchAll(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/g)].map((m) => decode(m[1]));
const scriptCount = (html) => (html.match(/<script\b/g) ?? []).length;

const request = (slug, method = 'GET') => {
  const url = `${SITE}/api/property${slug === undefined ? '' : `?slug=${encodeURIComponent(slug)}`}`;
  return fn[method](new Request(url, { method }));
};

// ---------- Preparación ----------
before(async () => {
  for (const file of ['render-property.mjs', 'assets.mjs']) {
    await access(join(ROOT, 'api/_ssr', file)).catch(() => {
      throw new Error(`Falta api/_ssr/${file}. Ejecuta primero "npm run build".`);
    });
  }

  const port = await startMock();
  process.env.VITE_SUPABASE_URL = `http://127.0.0.1:${port}`;
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = TEST_KEY;
  process.env.PROPERTY_SSR_TIMEOUT_MS = '400';
  process.env.VERCEL_ENV = 'production';
  delete process.env.VITE_FORCE_NOINDEX;

  // Se compila la función tal como la compilaría Vercel (TS -> ESM) y se coloca junto a la salida generada.
  const out = join(ROOT, '.ssr-test');
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await build({
    // SSR_FUNCTION_FILE permite ejecutar esta misma batería contra otra versión de la función (control negativo en revisión).
    entryPoints: [process.env.SSR_FUNCTION_FILE ?? join(ROOT, 'api/property.ts')],
    outfile: join(out, 'property.mjs'),
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    packages: 'external',
    external: ['./_ssr/*'],
    logLevel: 'error',
  });
  await cp(join(ROOT, 'api/_ssr'), join(out, '_ssr'), { recursive: true });
  fn = await import(pathToFileURL(join(out, 'property.mjs')).href);
});

beforeEach(() => {
  state.mode = 'ok';
  state.calls = [];
  state.extras = null;
});

after(async () => {
  for (const res of state.held) res.destroy();
  server?.close();
  await rm(join(ROOT, '.ssr-test'), { recursive: true, force: true });
});

// ---------- 200: publicado, reservado, vendido, alquilado ----------
for (const slug of ['piso-en-venta-en-madrid', 'atico-reservado', 'chalet-vendido', 'local-alquilado', 'piso-calle-visible']) {
  test(`200 · ${slug}: metadatos, H1, canonical y JSON-LD`, async () => {
    const row = publicRows.find((r) => r.slug === slug);
    const res = await request(slug);
    const html = await res.text();

    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /^text\/html/);
    assert.equal(res.headers.get('cache-control'), 'public, max-age=0, s-maxage=60');
    assert.equal(res.headers.get('x-robots-tag'), null, 'una ficha pública no puede llevar X-Robots-Tag');

    // Título y descripción escritos en el panel: idénticos, sin normalizar.
    if (row.seo_title?.trim()) assert.equal(title(html), row.seo_title);
    if (row.seo_description) assert.equal(meta(html, 'description'), row.seo_description);
    assert.equal(meta(html, 'og:title'), title(html));
    assert.equal(meta(html, 'twitter:title'), title(html));
    assert.equal(meta(html, 'robots'), 'index, follow');
    assert.equal(canonical(html), `${SITE}/inmuebles/${slug}`);
    assert.equal(meta(html, 'og:url'), `${SITE}/inmuebles/${slug}`);

    const headings = h1s(html);
    assert.equal(headings.length, 1);
    assert.equal(headings[0], row.title);

    assert.match(html, /<div id="root" data-prerendered="true">/);
    assert.doesNotMatch(html, /Cargando inmueble/);
    assert.doesNotMatch(html, /Inmobiliaria en Madrid \| Alvar Consultores Inmobiliarios/, 'no debe heredar los metadatos de la Home');

    const ld = jsonLd(html);
    const types = ld.map((item) => item['@type']).sort();
    assert.deepEqual(types, ['BreadcrumbList', 'RealEstateListing']);
    const listing = ld.find((item) => item['@type'] === 'RealEstateListing');
    assert.equal(listing.url, `${SITE}/inmuebles/${slug}`);
    assert.equal(listing.name, row.title);
    assert.equal(listing.offers.price, row.price);

    // Una sola consulta, con la función pública y los parámetros esperados.
    assert.equal(state.calls.length, 1);
    assert.deepEqual(state.calls[0].body, { p_slug: slug, p_featured: null, p_limit: 1 });
  });
}

test('200 · sin título/descripción SEO manuales usa el automático del código, no inventa texto', async () => {
  const html = await (await request('piso-sin-seo-manual')).text();
  assert.equal(title(html), 'Piso luminoso en Pinto | Alvar Consultores');
  assert.match(meta(html, 'description'), /^Piso luminoso en Pinto/);
});

test('200 · reserved/sold/rented conservan estado visible y no llevan noindex', async () => {
  for (const [slug, label] of [['atico-reservado', 'Reservado'], ['chalet-vendido', 'Vendido'], ['local-alquilado', 'Alquilado']]) {
    const res = await request(slug);
    const html = await res.text();
    assert.equal(res.status, 200);
    assert.equal(meta(html, 'robots'), 'index, follow');
    assert.match(html, new RegExp(label), `${slug} debe mostrar el estado ${label}`);
  }
});

test('200 · HEAD devuelve las mismas cabeceras sin cuerpo', async () => {
  const get = await request('piso-en-venta-en-madrid', 'GET');
  const head = await request('piso-en-venta-en-madrid', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('cache-control'), get.headers.get('cache-control'));
  assert.equal(await head.text(), '');
});

test('200 · vista previa de Vercel: noindex en el HTML inicial', async () => {
  process.env.VERCEL_ENV = 'preview';
  try {
    const html = await (await request('piso-en-venta-en-madrid')).text();
    assert.equal(meta(html, 'robots'), 'noindex, nofollow');
  } finally {
    process.env.VERCEL_ENV = 'production';
  }
});

test('200 · peticiones simultáneas no se mezclan entre inmuebles', async () => {
  const slugs = ['piso-en-venta-en-madrid', 'atico-reservado', 'chalet-vendido', 'local-alquilado', 'piso-calle-visible'];
  const batch = Array.from({ length: 30 }, (_, i) => slugs[i % slugs.length]);
  const responses = await Promise.all(batch.map(async (slug) => ({ slug, html: await (await request(slug)).text() })));
  for (const { slug, html } of responses) {
    assert.equal(canonical(html), `${SITE}/inmuebles/${slug}`);
    assert.equal(h1s(html)[0], publicRows.find((r) => r.slug === slug).title);
    assert.equal(embedded(html).value.slug, slug);
  }
});

// ---------- Texto difícil escrito en el panel ----------
test('texto difícil: se reproduce tal cual y no rompe el HTML ni el JSON embebido', async () => {
  const row = publicRows.find((r) => r.slug === 'piso-texto-dificil');
  const normal = await (await request('piso-en-venta-en-madrid')).text();
  const html = await (await request('piso-texto-dificil')).text();

  assert.equal(title(html), row.seo_title, 'el título SEO escrito por el cliente debe conservarse idéntico (incluido "$&")');
  assert.equal(meta(html, 'description'), row.seo_description);
  assert.equal(h1s(html)[0], row.title);

  // Mismo número de <script> que una ficha normal: nada del texto del cliente ha abierto etiquetas nuevas.
  assert.equal(scriptCount(html), scriptCount(normal));
  assert.doesNotMatch(html, /<script>alert/i);
  assert.doesNotMatch(html, /<img src=x/i);
  assert.doesNotMatch(html, /<b>único<\/b>/);

  // El JSON embebido se cierra donde debe y devuelve exactamente lo que escribió el cliente.
  const data = embedded(html);
  assert.ok(data, 'debe existir el JSON embebido');
  assert.doesNotMatch(data.text, /<|>|&/, 'el JSON embebido no puede contener <, > ni & en bruto');
  assert.ok(!data.text.includes(String.fromCharCode(0x2028)) && !data.text.includes(String.fromCharCode(0x2029)), 'sin separadores Unicode en bruto');
  assert.equal(data.value.title, row.title);
  assert.equal(data.value.seo_title, row.seo_title);
  assert.equal(data.value.seo_description, row.seo_description);
  assert.equal(data.value.description, row.description);
  assert.deepEqual(data.value.features, row.features);

  // El JSON-LD tampoco puede romperse.
  for (const item of jsonLd(html)) assert.ok(item['@type']);
});

// ---------- 404 real ----------
for (const slug of ['no-existe', 'inmueble-borrador', 'inmueble-archivado']) {
  test(`404 · ${slug}: inexistente, borrador y archivado`, async () => {
    const res = await request(slug);
    const html = await res.text();
    assert.equal(res.status, 404);
    assert.equal(res.headers.get('cache-control'), 'public, max-age=0, s-maxage=30');
    assert.equal(res.headers.get('x-robots-tag'), 'noindex');
    assert.match(meta(html, 'robots'), /^noindex/);
    assert.equal(canonical(html), `${SITE}/404`);
    assert.doesNotMatch(html, /SECRETO/, 'ni borradores ni archivados pueden filtrar contenido');
    assert.doesNotMatch(html, /data-prerendered="true">.*__ALVAR_PROPERTY__/s);
  });
}

test('404 · slugs con formato inválido no consultan la base de datos', async () => {
  const invalid = ['', 'MAYUSCULAS', 'con espacios', '../../etc/passwd', 'a/b', 'x?y=1', '-empieza', 'termina-', 'doble--guion', 'ñandú', '<script>', 'a'.repeat(121)];
  for (const slug of invalid) {
    const res = await request(slug);
    assert.equal(res.status, 404, `slug "${slug}"`);
  }
  assert.equal((await request(undefined)).status, 404);
  assert.equal(state.calls.length, 0, 'no debe haber ninguna consulta a Supabase');
});

test('404 · defensa: si el RPC devolviera un borrador, una fila de otro slug o una fila rota, no se publica', async () => {
  assert.equal((await request('fuga-borrador')).status, 404);
  assert.equal((await request('fuga-otro-slug')).status, 404);
  const broken = await request('fila-rota'); // fila sin título: error de render, no se cachea
  assert.equal(broken.status, 503);
  assert.equal(broken.headers.get('cache-control'), 'no-store');
});

// ---------- Errores temporales ----------
for (const mode of ['error500', 'rpc-missing', 'timeout', 'reset', 'bad-json']) {
  test(`503 · fallo de Supabase (${mode}): error temporal, nunca la Home con 200`, async () => {
    state.mode = mode;
    const started = Date.now();
    const res = await request('piso-en-venta-en-madrid');
    const html = await res.text();

    assert.equal(res.status, 503);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(res.headers.get('retry-after'), '60');
    assert.equal(res.headers.get('x-robots-tag'), 'noindex');
    assert.match(meta(html, 'robots'), /^noindex/);
    assert.match(title(html), /^Servicio temporalmente no disponible/);
    assert.equal(canonical(html), null, 'la respuesta de error no puede declarar canonical');
    assert.doesNotMatch(html, /Inmobiliaria en Madrid/);
    assert.equal(meta(html, 'og:url'), null);
    assert.equal(meta(html, 'description'), null);
    // La SPA sigue pudiendo arrancar para un visitante humano.
    assert.match(html, /<div id="root"><\/div>/);
    assert.match(html, /<script type="module"[^>]*src="\/assets\//);
    assert.ok(Date.now() - started < 3000, 'el timeout debe cortar la espera');
  });
}

test('503 · sin configuración pública de Supabase', async () => {
  const saved = process.env.VITE_SUPABASE_URL;
  delete process.env.VITE_SUPABASE_URL;
  try {
    const res = await request('piso-en-venta-en-madrid');
    assert.equal(res.status, 503);
    assert.equal(res.headers.get('cache-control'), 'no-store');
  } finally {
    process.env.VITE_SUPABASE_URL = saved;
  }
});

// ---------- Privacidad y seguridad de la serialización ----------
test('privacidad · solo se serializan columnas públicas aunque el RPC devolviera campos privados', async () => {
  state.extras = PRIVATE_EXTRAS;
  const html = await (await request('piso-en-venta-en-madrid')).text();
  const embeddedJson = embedded(html);
  for (const [key, value] of Object.entries(PRIVATE_EXTRAS)) {
    // Los valores son marcadores únicos: no pueden aparecer en ningún punto del documento.
    assert.ok(!html.includes(value), `el valor privado de ${key} no puede aparecer en el HTML`);
    // Las claves son palabras comunes (p. ej. "block" en clases CSS): se comprueban en el JSON embebido.
    assert.ok(!embeddedJson.text.includes(`"${key}"`), `la clave privada ${key} no puede estar en el JSON embebido`);
  }
  const data = embeddedJson.value;
  for (const key of Object.keys(data)) assert.ok(PUBLIC_ROW_KEYS.includes(key), `columna no permitida: ${key}`);
});

test('privacidad · dirección oculta: no aparece ni en el HTML ni en el JSON embebido', async () => {
  const html = await (await request('piso-en-venta-en-madrid')).text();
  const data = embedded(html).value;
  assert.equal(data.address, null);
  assert.equal(data.address_visibility, 'hidden');
  // La dirección pública de la oficina (pie de página) es ajena al inmueble: se excluye el <footer> de la comprobación.
  const withoutOfficeFooter = html.replace(/<footer[\s\S]*?<\/footer>/, '');
  assert.doesNotMatch(withoutOfficeFooter, /Calle /);
  const listing = jsonLd(html).find((item) => item['@type'] === 'RealEstateListing');
  assert.equal(listing.contentLocation.address.streetAddress, undefined, 'el JSON-LD no puede declarar calle');
});

test('privacidad · dirección de calle: solo lo que entrega el RPC, sin número', async () => {
  const html = await (await request('piso-calle-visible')).text();
  assert.equal(embedded(html).value.address, 'Calle Ríos Rosas');
  assert.doesNotMatch(html, /street_number|99-NUMERO/);
});

test('privacidad · la lista permitida coincide con las columnas del último RPC', async () => {
  const dir = join(ROOT, 'supabase/migrations');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  let sql = '';
  for (const f of files) {
    const text = await readFile(join(dir, f), 'utf8');
    if (/create function public\.get_public_properties\(/.test(text)) sql = text;
  }
  const block = sql.match(/returns table \(([\s\S]*?)\)\s*language sql/)[1];
  const rpcColumns = block
    .split('\n')
    .map((line) => line.match(/^\s*(\w+)\s+[a-z]/)?.[1])
    .filter(Boolean);

  const source = await readFile(join(ROOT, 'src/lib/propertySsr.ts'), 'utf8');
  const list = source.match(/PUBLIC_PROPERTY_ROW_KEYS = \[([\s\S]*?)\] as const/)[1];
  const allowed = [...list.matchAll(/'(\w+)'/g)].map((m) => m[1]);

  assert.deepEqual([...allowed].sort(), [...rpcColumns].sort(), 'la lista permitida y el RPC han divergido');
  assert.deepEqual([...PUBLIC_ROW_KEYS].sort(), [...rpcColumns].sort(), 'los fixtures han divergido del RPC');
});

test('privacidad · ninguna credencial privada ni variable no pública en el código SSR', async () => {
  const files = ['api/property.ts', 'src/ssr/renderProperty.tsx', 'src/lib/propertySsr.ts', 'scripts/build-ssr.mjs'];
  const allowedEnv = new Set(['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_FORCE_NOINDEX', 'VERCEL_ENV', 'PROPERTY_SSR_TIMEOUT_MS']);
  for (const file of files) {
    const text = await readFile(join(ROOT, file), 'utf8');
    assert.doesNotMatch(text, /service_role|SERVICE_ROLE|SUPABASE_SECRET|SUPABASE_JWT|POSTGRES_/i, `${file} no puede usar credenciales privadas`);
    // NODE_ENV solo es válida como clave de `define` al empaquetar (scripts/build-ssr.mjs), nunca en la función.
    const allowedHere = file === 'scripts/build-ssr.mjs' ? new Set([...allowedEnv, 'NODE_ENV']) : allowedEnv;
    for (const [, name] of text.matchAll(/process\.env\.(\w+)/g)) {
      assert.ok(allowedHere.has(name), `${file} usa la variable no prevista ${name}`);
    }
  }
  assert.deepEqual(state.badAuth, [], 'toda consulta debe ir solo con la clave pública');
});

// ---------- Empaquetado para Vercel ----------
test('empaquetado · el render generado no importa paquetes externos (react, react-router, supabase...)', async () => {
  // SSR_RENDER_FILE permite apuntar la misma comprobación a otro archivo (control negativo en revisión).
  const file = process.env.SSR_RENDER_FILE ?? join(ROOT, 'api/_ssr/render-property.mjs');
  const source = await readFile(file, 'utf8');

  // Especificadores de importación: sentencias `import` a principio de línea y llamadas a require()/import().
  const specifiers = new Set();
  for (const re of [
    /^import\s+(?:[^'"]*?\sfrom\s*)?["']([^"']+)["']/gm,
    /(?<![\w.$])(?:require|import)\(\s*["']([^"']+)["']\s*\)/g,
  ]) {
    for (const match of source.matchAll(re)) specifiers.add(match[1]);
  }

  const isBuiltin = (name) => name.startsWith('node:') || builtinModules.includes(name);
  const isRelative = (name) => name.startsWith('.') || name.startsWith('/');
  const external = [...specifiers].filter((name) => !isBuiltin(name) && !isRelative(name));

  // Regresión real (producción, 15-11-2026): con react-router externo, Vercel no empaquetó la variante CJS de
  // react-router/dom y la función devolvía 503. Debe ser autosuficiente: solo módulos integrados de Node.
  assert.deepEqual(external, [], `el render depende de paquetes de node_modules: ${external.join(', ')}`);
  assert.ok(
    ![...specifiers].some((name) => /^(react|react-dom|react-router|react-router-dom|@supabase)(\/|$)/.test(name)),
    'react, react-dom, react-router y supabase deben ir empaquetados',
  );

  // Los require() de módulos integrados de dependencias CommonJS necesitan createRequire en un módulo ESM.
  assert.match(source, /createRequire/, 'falta el banner de createRequire');
  // NODE_ENV=production se fija con `define` en el empaquetado, no en tiempo de ejecución.
  assert.doesNotMatch(source, /process\.env\.NODE_ENV/, 'process.env.NODE_ENV debe resolverse al empaquetar');
  for (const code of ['api/property.ts', 'src/ssr/renderProperty.tsx', 'scripts/build-ssr.mjs']) {
    const text = await readFile(join(ROOT, code), 'utf8');
    assert.doesNotMatch(text, /process\.env\.NODE_ENV\s*=[^=]/, `${code} no puede modificar process.env.NODE_ENV`);
  }
  assert.ok(source.length < 8 * 1024 * 1024, 'el render empaquetado es sospechosamente grande');
});

// ---------- Resolución del slug: parámetros duplicados, manipulados y codificados ----------
// En producción la ruta pública /inmuebles/<slug> llega a la función por el rewrite de vercel.json.
// Regla: nunca puede mostrarse un inmueble distinto del solicitado.
const getPath = (path, method = 'GET') => fn[method](new Request(`${SITE}${path}`, { method }));
const pisoRow = publicRows.find((r) => r.slug === 'piso-en-venta-en-madrid');
const PISO = 'piso-en-venta-en-madrid';

test('slug · ruta pública con query manipulada: siempre el inmueble del path, nunca otro', async () => {
  const manipulated = [
    '?slug=atico-reservado',
    '?slug=atico-reservado&slug=chalet-vendido',
    '?slug=chalet-vendido&slug=atico-reservado',
    '?%73lug=atico-reservado',
    '?slug=',
    '?slug[]=atico-reservado',
    '?Slug=atico-reservado',
    '?slug=atico-reservado%26slug=chalet-vendido',
    '?slug=%2e%2e%2f',
    '?utm_source=x&slug=local-alquilado',
    '?a=1&a=2',
  ];
  for (const query of manipulated) {
    state.calls = [];
    const res = await getPath(`/inmuebles/${PISO}${query}`);
    const html = await res.text();
    assert.equal(res.status, 200, query);
    assert.equal(res.headers.get('x-robots-tag'), null, `la ruta pública no puede llevar noindex (${query})`);
    assert.equal(canonical(html), `${SITE}/inmuebles/${PISO}`, query);
    assert.equal(h1s(html)[0], pisoRow.title, query);
    assert.equal(embedded(html).value.slug, PISO, query);
    assert.deepEqual(state.calls.map((c) => c.body.p_slug), [PISO], `solo se consulta el inmueble del path (${query})`);
  }
});

test('slug · cualquier pareja (path A, query slug=B) devuelve A y solo consulta A', async () => {
  const slugs = publicRows.map((r) => r.slug);
  let checked = 0;
  for (const a of slugs) {
    for (const b of slugs) {
      if (a === b) continue;
      state.calls = [];
      const res = await getPath(`/inmuebles/${a}?slug=${b}`);
      const html = await res.text();
      assert.equal(res.status, 200, `${a}?slug=${b}`);
      assert.equal(canonical(html), `${SITE}/inmuebles/${a}`, `${a}?slug=${b}`);
      assert.deepEqual(state.calls.map((c) => c.body.p_slug), [a]);
      checked += 1;
    }
  }
  assert.equal(checked, slugs.length * (slugs.length - 1));
});

test('slug · ruta pública con codificaciones o caracteres no permitidos: 404 sin consultar la base de datos', async () => {
  const bad = [
    `/inmuebles/${PISO.replace(/-/g, '%2D')}`,
    `/inmuebles/%70iso-en-venta-en-madrid`,
    `/inmuebles/${PISO}%00`,
    `/inmuebles/${PISO}%0A`,
    `/inmuebles/${PISO}%20`,
    `/inmuebles/${PISO}%2Fatico-reservado`,
    `/inmuebles/${PISO}%2F..%2Fatico-reservado`,
    `/inmuebles/${PISO}%252Fatico-reservado`,
    `/inmuebles/${PISO}%E2%80%8B`,
    '/inmuebles/Piso-En-Venta-En-Madrid',
    '/inmuebles/piso--en-venta',
    '/inmuebles/-piso',
    '/inmuebles/%C3%B1and%C3%BA',
    `/inmuebles/${'a'.repeat(121)}`,
    `/inmuebles/${PISO}/`,
    '/inmuebles/',
  ];
  for (const path of bad) {
    state.calls = [];
    const res = await getPath(path);
    assert.equal(res.status, 404, path);
    assert.equal(res.headers.get('x-robots-tag'), 'noindex', path);
    assert.equal(state.calls.length, 0, `no debe consultar Supabase (${path})`);
  }
});

test('slug · acceso directo /api/property: exactamente un parámetro slug', async () => {
  for (const query of [`?slug=${PISO}`, `?slug=${PISO}&utm_source=x`, `?slug=${PISO.replace(/-/g, '%2D')}`]) {
    state.calls = [];
    const res = await getPath(`/api/property${query}`);
    const html = await res.text();
    assert.equal(res.status, 200, query);
    assert.equal(canonical(html), `${SITE}/inmuebles/${PISO}`, query);
    assert.deepEqual(state.calls.map((c) => c.body.p_slug), [PISO]);
  }

  const ambiguous = [
    '',
    '?slug=',
    '?slug=atico-reservado&slug=chalet-vendido',
    `?slug=${PISO}&slug=${PISO}`,
    `?slug=${PISO}&slug=atico-reservado`,
    `?slug=atico-reservado&slug=${PISO}`,
    `?x=1&slug=${PISO}&%73lug=atico-reservado`,
    `?slug[]=${PISO}`,
    `?Slug=${PISO}`,
    `?slug=${PISO}%26slug=atico-reservado`,
    `?slug=${PISO};slug=atico-reservado`,
    `?slug=${PISO}%00`,
    `?slug=${PISO}%20`,
    '?slug=../atico-reservado',
  ];
  for (const query of ambiguous) {
    state.calls = [];
    const res = await getPath(`/api/property${query}`);
    assert.equal(res.status, 404, query);
    assert.equal(state.calls.length, 0, `petición ambigua o manipulada: no debe consultar Supabase (${query})`);
  }
});

test('slug · HEAD en ruta pública manipulada: mismas cabeceras, sin cuerpo y del inmueble correcto', async () => {
  state.calls = [];
  const res = await getPath(`/inmuebles/${PISO}?slug=atico-reservado`, 'HEAD');
  assert.equal(res.status, 200);
  assert.equal(await res.text(), '');
  assert.deepEqual(state.calls.map((c) => c.body.p_slug), [PISO]);
});

test('slug · estados y errores se conservan con la ruta pública (200, 404 y 503)', async () => {
  for (const [slug, status] of [['atico-reservado', 200], ['chalet-vendido', 200], ['local-alquilado', 200], ['inmueble-borrador', 404], ['inmueble-archivado', 404], ['no-existe', 404]]) {
    const res = await getPath(`/inmuebles/${slug}`);
    assert.equal(res.status, status, slug);
    assert.equal(res.headers.get('cache-control'), status === 200 ? 'public, max-age=0, s-maxage=60' : 'public, max-age=0, s-maxage=30', slug);
  }
  state.mode = 'error500';
  const down = await getPath(`/inmuebles/${PISO}`);
  assert.equal(down.status, 503);
  assert.equal(down.headers.get('cache-control'), 'no-store');
  assert.equal(down.headers.get('retry-after'), '60');
});

// ---------- Configuración de rutas (activación) ----------
test('rutas · vercel.json: rewrite de fichas activo, administración y sitemap intactos, sin cambios de región', async () => {
  const config = JSON.parse(await readFile(join(ROOT, 'vercel.json'), 'utf8'));

  assert.deepEqual(config.rewrites, [
    { source: '/sitemap.xml', destination: '/api/sitemap' },
    { source: '/inmuebles/:slug', destination: '/api/property?slug=:slug' },
    { source: '/admin', destination: '/_spa' },
    { source: '/admin/:path*', destination: '/_spa' },
  ]);

  const noindex = (source) => ({ source, headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] });
  assert.deepEqual(config.headers, [noindex('/admin'), noindex('/admin/(.*)'), noindex('/_spa'), noindex('/api/property')]);
  assert.ok(!config.headers.some((h) => h.source.startsWith('/inmuebles')), 'las fichas públicas no deben llevar cabeceras noindex');

  assert.equal(config.cleanUrls, true);
  // Primera activación: la región de Vercel no cambia (dub1 queda pendiente para una publicación posterior).
  assert.equal(config.regions, undefined, 'la región por defecto del proyecto no cambia');
  assert.equal(config.functions, undefined, 'no debe haber configuración de funciones ni de regiones en esta activación');
  assert.deepEqual(Object.keys(config).sort(), ['cleanUrls', 'headers', 'rewrites']);

  // La función no reconoce rutas de administración como inmuebles.
  for (const path of ['/admin', '/admin/inmuebles', '/admin/login', '/api/sitemap']) {
    assert.equal((await getPath(path)).status, 404, path);
  }
});

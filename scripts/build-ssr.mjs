// Genera lo que necesita la función api/property.ts (SSR dinámico de /inmuebles/:slug). Se ejecuta tras
// `vite build` y `scripts/prerender.mjs`, porque usa dist/_spa.html y dist/404.html del mismo build.
//
// Salida (generada, fuera de git):
//   api/_ssr/render-property.mjs  render de servidor: mismos componentes y mismo mapeo que el navegador
//   api/_ssr/assets.mjs           plantillas HTML de ese build: ficha (shell), 404 y 503
//
// La plantilla y los assets con hash salen del mismo build que el render, así que no pueden desincronizarse.
// Si cualquier comprobación falla, el build falla y no se publica nada.
import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = 'dist';
const outDir = 'api/_ssr';
const site = 'https://alvarconsultoresinmobiliarios.es';
const fail = (code) => {
  throw new Error(code);
};

const stripSeoHead = (html) =>
  html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, () => '')
    .replace(/<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+)"[\s\S]*?\/>/gi, () => '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, () => '');

async function main() {
  const [shell, notFound] = await Promise.all([
    readFile(join(dist, '_spa.html'), 'utf8'),
    readFile(join(dist, '404.html'), 'utf8'),
  ]);

  // Shell de la SPA: HTML vacío con el bundle del build actual.
  if (!/<div id="root"><\/div>/.test(shell)) fail('SPA_SHELL_UNEXPECTED_ROOT');
  if (/data-prerendered/.test(shell)) fail('SPA_SHELL_ALREADY_PRERENDERED');
  if (!/<script type="module"[^>]*src="\/assets\/[^"]+\.js"/.test(shell)) fail('SPA_SHELL_WITHOUT_BUNDLE');
  if (!/<\/head>/.test(shell)) fail('SPA_SHELL_WITHOUT_HEAD');

  // Página 404 real prerenderizada (noindex).
  if (!/data-prerendered="true"/.test(notFound)) fail('NOT_FOUND_NOT_PRERENDERED');
  if (!/<meta name="robots" content="noindex/.test(notFound)) fail('NOT_FOUND_WITHOUT_NOINDEX');

  // 503: el shell de la SPA con metadatos neutros y noindex. Un visitante humano puede seguir viendo la ficha
  // (la SPA la carga desde el navegador), pero el estado 503 y noindex impiden que un buscador guarde esta respuesta
  // ni la confunda con la de la Home.
  const unavailable = stripSeoHead(shell)
    .replace(
      '</head>',
      () =>
        `  <title>Servicio temporalmente no disponible | Alvar Consultores</title>\n  <meta name="robots" content="noindex, nofollow" />\n</head>`,
    )
    .replace(
      '<div id="root"></div>',
      () =>
        `<div id="root"></div>\n  <noscript>El servicio no está disponible temporalmente. Inténtalo de nuevo en unos minutos.</noscript>`,
    );
  if (/Inmobiliaria en Madrid/.test(unavailable) || /rel="canonical"/.test(unavailable)) fail('UNAVAILABLE_HAS_HOME_SEO');

  await mkdir(outDir, { recursive: true });

  await build({
    entryPoints: ['src/ssr/renderProperty.tsx'],
    outfile: join(outDir, 'render-property.mjs'),
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    // Todas las dependencias (react, react-dom, react-router-dom, supabase-js...) se empaquetan DENTRO del módulo.
    // Dejarlas externas dependía del rastreo de archivos de Vercel y falló en producción: react-router-dom es un
    // paquete dual (ESM/CJS) y el rastreo solo incluyó una de las dos variantes de `react-router/dom`
    // ("Cannot find module .../react-router/dist/development/dom-export.js"). Así la función no necesita
    // react ni react-router en node_modules. Solo quedan externos los módulos integrados de Node.
    jsx: 'automatic',
    loader: { '.css': 'empty' },
    logLevel: 'error',
    // Algunas dependencias empaquetadas son CommonJS y llaman a require() de módulos integrados de Node
    // (util, stream...). En un módulo ESM, require no existe: se crea con createRequire.
    banner: {
      js: "import { createRequire as __alvarCreateRequire } from 'node:module'; const require = __alvarCreateRequire(import.meta.url);",
    },
    define: {
      // Se fija NODE_ENV=production en el empaquetado (React elige su build de producción) sin tocar
      // process.env.NODE_ENV en tiempo de ejecución.
      'process.env.NODE_ENV': JSON.stringify('production'),
      // Variables públicas (no secretas) del propio proyecto: se leen en tiempo de ejecución de la función.
      'import.meta.env.VITE_SUPABASE_URL': 'process.env.VITE_SUPABASE_URL',
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': 'process.env.VITE_SUPABASE_PUBLISHABLE_KEY',
      'import.meta.env.VITE_FORCE_NOINDEX': 'process.env.VITE_FORCE_NOINDEX',
      'import.meta.env.VITE_SITE_URL': JSON.stringify(site),
      'import.meta.env.DEV': 'false',
      'import.meta.env.PROD': 'true',
      'import.meta.env.MODE': JSON.stringify('production'),
    },
  });

  const assets = [
    '// Archivo generado por scripts/build-ssr.mjs. No editar.',
    `export const SHELL_TEMPLATE = ${JSON.stringify(shell)};`,
    `export const NOT_FOUND_HTML = ${JSON.stringify(notFound)};`,
    `export const UNAVAILABLE_HTML = ${JSON.stringify(unavailable)};`,
    '',
  ].join('\n');
  await writeFile(join(outDir, 'assets.mjs'), assets);

  console.log(
    'SSR_BUILD',
    JSON.stringify({
      render: join(outDir, 'render-property.mjs'),
      assets: join(outDir, 'assets.mjs'),
      shellBytes: Buffer.byteLength(shell),
      notFoundBytes: Buffer.byteLength(notFound),
      unavailableBytes: Buffer.byteLength(unavailable),
    }),
  );
}

await main();

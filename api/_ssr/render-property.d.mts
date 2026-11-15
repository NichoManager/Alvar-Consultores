// Tipos del módulo generado por scripts/build-ssr.mjs (el .mjs no se versiona; este archivo sí,
// para que `tsc -b` compile api/property.ts antes de que exista la salida del build).
export interface RenderPropertyOptions {
  /** false en vistas previas/desarrollo (noindex) o si se fuerza el cierre a buscadores. */
  indexable: boolean;
}

export function renderPropertyDocument(
  rawRow: unknown,
  template: string,
  options: RenderPropertyOptions,
): Promise<string>;

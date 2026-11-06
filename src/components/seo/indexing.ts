/**
 * Decide si un entorno puede indexarse en buscadores.
 * Solo el dominio de producción es indexable; vista previa, pruebas y localhost no.
 * Un interruptor explícito (`VITE_FORCE_NOINDEX=true`) permite cerrar también producción.
 * La decisión depende del dominio real y no de una variable que pueda olvidarse.
 */
export const PRODUCTION_HOSTS = [
  'alvarconsultoresinmobiliarios.es',
  'www.alvarconsultoresinmobiliarios.es',
] as const;

export function isIndexableHost(
  hostname: string | undefined,
  forceNoIndex: string | undefined = import.meta.env.VITE_FORCE_NOINDEX,
): boolean {
  if (forceNoIndex === 'true') {
    return false;
  }

  return Boolean(
    hostname &&
      (PRODUCTION_HOSTS as readonly string[]).includes(hostname.toLowerCase()),
  );
}

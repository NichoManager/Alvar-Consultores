import type { Article } from '../types/content';

const commonSections = [
  {
    title: 'Empieza por una valoración realista',
    paragraphs: ['Una buena decisión inmobiliaria necesita contexto: estado del inmueble, ubicación, demanda y operaciones comparables. El precio de salida debe responder al mercado, no a una cifra aislada.'],
  },
  {
    title: 'Prepara la documentación',
    paragraphs: ['Reunir con tiempo la información registral, energética y económica reduce incidencias y permite que la negociación avance con mayor seguridad. Cada operación puede exigir documentación adicional.'],
  },
  {
    title: 'Coordina la operación completa',
    paragraphs: ['Visitas, negociación, contratos y firma forman parte de un único proceso. Contar con seguimiento profesional ayuda a anticipar decisiones y mantener los plazos bajo control.'],
  },
];

// Contenido editorial demo. Revisar y ampliar antes de su publicación definitiva.
export const articles: Article[] = [
  ['como-vender-vivienda-pinto', 'Cómo vender una vivienda en Pinto: pasos y documentación', 'Vender', 'Una guía clara para preparar la operación, fijar una estrategia y llegar a la firma con seguridad.'],
  ['comprar-piso-mostoles', 'Qué tener en cuenta antes de comprar piso en Móstoles', 'Comprar', 'Zona, presupuesto y documentación: decisiones que conviene ordenar antes de reservar.'],
  ['calcular-precio-venta-vivienda', 'Cómo calcular el precio de venta de una vivienda', 'Mercado inmobiliario', 'Los factores que permiten construir una valoración razonada y defendible.'],
  ['documentos-vender-vivienda', 'Documentos necesarios para vender una vivienda', 'Vender', 'La documentación habitual que ayuda a evitar retrasos en una compraventa.'],
  ['invertir-vivienda-alquiler', '¿Es buen momento para invertir en vivienda para alquiler?', 'Inversión', 'Cómo analizar una oportunidad más allá del precio de compra.'],
  ['mercado-inmobiliario-sur-madrid', 'Mercado inmobiliario en el sur de Madrid', 'Madrid', 'Claves para interpretar un mercado formado por zonas y perfiles residenciales distintos.'],
].map(([slug, title, category, excerpt], index) => ({
  slug,
  title,
  category,
  excerpt,
  date: `2026-0${8 - Math.floor(index / 2)}-${22 - index * 2}`,
  readingTime: `${5 + (index % 3)} min`,
  intro: `${excerpt} Este artículo ofrece una orientación general y debe adaptarse a las circunstancias concretas de cada inmueble y operación.`,
  sections: commonSections,
}));

export const getArticleBySlug = (slug: string) => articles.find((article) => article.slug === slug);

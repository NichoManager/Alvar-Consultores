const defineArticleMetadata = (slug: string, date: string) => ({ slug, date });

export const blogArticleMetadata = {
  sellHomeInPinto: defineArticleMetadata(
    'como-vender-vivienda-pinto',
    '2026-08-22',
  ),
  buyFlatInMostoles: defineArticleMetadata(
    'comprar-piso-mostoles',
    '2026-09-04',
  ),
  calculateSalePrice: defineArticleMetadata(
    'calcular-precio-venta-vivienda',
    '2026-07-18',
  ),
  documentsToSellHome: defineArticleMetadata(
    'documentos-vender-vivienda',
    '2026-07-16',
  ),
  investInRentalHome: defineArticleMetadata(
    'invertir-vivienda-alquiler',
    '2026-06-14',
  ),
  southMadridPropertyMarket: defineArticleMetadata(
    'mercado-inmobiliario-sur-madrid',
    '2026-06-12',
  ),
} as const;

export const sitemapBlogArticles = Object.values(blogArticleMetadata);

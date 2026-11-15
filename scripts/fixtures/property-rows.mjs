// Filas SIMULADAS con la forma exacta de `get_public_properties` (las 64 columnas). No son datos reales de Alvar.
// Se usan solo en scripts/ssr-property.test.mjs y scripts/ssr-hydration.check.mjs.

export const PUBLIC_ROW_KEYS = [
  'id', 'reference', 'title', 'slug', 'seo_title', 'seo_description', 'operation', 'property_type', 'status',
  'price', 'currency', 'city', 'area', 'province', 'postal_code', 'address', 'show_exact_address',
  'address_visibility', 'chalet_type', 'bedrooms', 'bathrooms', 'built_area', 'usable_area', 'plot_area', 'floor',
  'floors_count', 'construction_year', 'property_condition', 'orientations', 'heating_type', 'elevator', 'parking',
  'parking_type', 'parking_spaces', 'terrace', 'furnished', 'exterior', 'garage_capacity', 'office_space_type',
  'gross_leasable_area', 'workstation_area', 'building_use', 'available_from', 'building_certifications',
  'building_floors_count', 'office_floors_count', 'elevators_count', 'video_url', 'virtual_tour_url',
  'community_fee_amount', 'community_fee_period', 'ibi_annual_amount', 'energy_certificate_status',
  'energy_consumption_rating', 'energy_consumption_value', 'energy_emissions_rating', 'energy_emissions_value',
  'description', 'features', 'featured', 'featured_position', 'published_at', 'created_at', 'property_images',
];

const photo = (n, alt = null) => ({
  id: `00000000-0000-4000-8000-00000000010${n}`,
  storage_path: `fixture-property/photo-${n}.jpg`,
  alt_text: alt,
  position: n,
  is_cover: n === 1,
  media_type: 'photo',
});

export function makeRow(overrides = {}) {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    reference: 'SIM-001',
    title: 'Piso en venta en Madrid',
    slug: 'piso-en-venta-en-madrid',
    seo_title: 'Piso en venta en Madrid/ Madrid/ Alvar Consultores Inmobiliarios',
    seo_description: 'Piso en venta en Hortaleza. Madrid. Descubre características, precio, ubicación y solicita información a Alvar Consultores Inmobiliarios',
    operation: 'venta',
    property_type: 'Piso',
    status: 'published',
    price: 199000,
    currency: 'EUR',
    city: 'Madrid',
    area: 'Hortaleza',
    province: 'Madrid',
    postal_code: '28043',
    address: null,
    show_exact_address: false,
    address_visibility: 'hidden',
    chalet_type: null,
    bedrooms: 3,
    bathrooms: 1,
    built_area: 75,
    usable_area: 72,
    plot_area: null,
    floor: '5',
    floors_count: null,
    construction_year: 1965,
    property_condition: 'A reformar',
    orientations: null,
    heating_type: null,
    elevator: true,
    parking: false,
    parking_type: null,
    parking_spaces: null,
    terrace: true,
    furnished: false,
    exterior: true,
    garage_capacity: null,
    office_space_type: null,
    gross_leasable_area: null,
    workstation_area: null,
    building_use: null,
    available_from: null,
    building_certifications: null,
    building_floors_count: null,
    office_floors_count: null,
    elevators_count: null,
    video_url: null,
    virtual_tour_url: null,
    community_fee_amount: 45,
    community_fee_period: 'monthly',
    ibi_annual_amount: null,
    energy_certificate_status: null,
    energy_consumption_rating: 'E',
    energy_consumption_value: 200,
    energy_emissions_rating: 'E',
    energy_emissions_value: 45,
    description: 'Magnífica oportunidad de inversión.\n\nFinca en buen estado y al corriente de pago.',
    features: ['Terraza', 'Armarios empotrados'],
    featured: false,
    featured_position: null,
    published_at: '2026-10-01T09:00:00+00:00',
    created_at: '2026-09-30T09:00:00+00:00',
    property_images: [photo(1, 'Salón luminoso'), photo(2)],
    ...overrides,
  };
}

// Inmuebles que sí devuelve el RPC (publicado, reservado, vendido, alquilado).
export const publicRows = [
  makeRow(),
  makeRow({ id: '22222222-2222-4222-8222-222222222222', slug: 'atico-reservado', title: 'Ático en venta en Pinto', status: 'reserved', seo_title: 'Ático / Pinto / reservado', seo_description: 'Ático reservado en Pinto.' }),
  makeRow({ id: '33333333-3333-4333-8333-333333333333', slug: 'chalet-vendido', title: 'Chalet en venta en Valdemoro', status: 'sold', price: 450000, seo_title: 'Chalet vendido', seo_description: 'Chalet ya vendido.' }),
  makeRow({ id: '44444444-4444-4444-8444-444444444444', slug: 'local-alquilado', title: 'Local en alquiler en Madrid', status: 'rented', operation: 'alquiler', price: 1200, seo_title: 'Local en alquiler', seo_description: 'Local alquilado en Madrid.' }),
  // Sin título/descripción SEO manuales: debe usarse el automático del código, no uno inventado.
  makeRow({ id: '55555555-5555-4555-8555-555555555555', slug: 'piso-sin-seo-manual', title: 'Piso luminoso en Pinto', city: 'Pinto', area: 'Centro', seo_title: '   ', seo_description: null }),
  // Texto hostil/difícil escrito en el panel: se debe reproducir tal cual y sin romper el HTML.
  makeRow({
    id: '66666666-6666-4666-8666-666666666666',
    slug: 'piso-texto-dificil',
    title: 'Piso "especial" & <b>único</b> 😀',
    seo_title: 'Piso & "único" <script>alert(1)</script> $& $1 / ✓',
    seo_description: 'Descripción con </script><script>alert(2)</script> y <!-- comentario --> y $& $` $\' y "comillas" & más',
    description: 'Línea 1\nLínea 2 </script><script>alert(3)</script> ' + String.fromCharCode(0x2028) + ' separador ' + String.fromCharCode(0x2029) + ' fin $&',
    features: ['</script><img src=x onerror=alert(4)>', 'Plaza de garaje'],
  }),
  // Dirección calle visible (decisión del cliente en el panel; el RPC ya la entrega filtrada).
  makeRow({ id: '77777777-7777-4777-8777-777777777777', slug: 'piso-calle-visible', title: 'Piso en Chamberí', address: 'Calle Ríos Rosas', address_visibility: 'street_only' }),
];

// Filas que el RPC NO devuelve. El servidor simulado las excluye igual que get_public_properties.
export const hiddenRows = [
  makeRow({ id: '88888888-8888-4888-8888-888888888888', slug: 'inmueble-borrador', status: 'draft', title: 'BORRADOR-SECRETO' }),
  makeRow({ id: '99999999-9999-4999-8999-999999999999', slug: 'inmueble-archivado', status: 'archived', title: 'ARCHIVADO-SECRETO' }),
];

// Columnas privadas que NO debe emitir nunca el servidor aunque un RPC defectuoso las devolviera.
export const PRIVATE_EXTRAS = {
  cadastral_reference: 'REF-CATASTRAL-PRIVADA-123',
  owner_name: 'PROPIETARIO-PRIVADO',
  owner_phone: '600000000-PRIVADO',
  internal_notes: 'NOTA-INTERNA-PRIVADA',
  street_number: '99-NUMERO-PRIVADO',
  block: 'BLOQUE-PRIVADO',
  door: 'PUERTA-PRIVADA',
  service_role_key: 'SERVICE-ROLE-PRIVADA',
};

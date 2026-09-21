export const propertyAmenityGroups = [
  {
    id: 'exteriors',
    label: 'Exteriores',
    options: [
      'Balcón',
      'Patio',
      'Jardín',
    ],
  },
  {
    id: 'extras',
    label: 'Extras',
    options: [
      'Trastero',
      'Armarios empotrados',
      'Chimenea',
      'Acceso adaptado para movilidad reducida',
    ],
  },
  {
    id: 'equipment',
    label: 'Equipamiento',
    options: [
      'Piscina',
      'Aire acondicionado',
    ],
  },
] as const;

export const propertyTypeOptions = [
  {
    value: 'Piso',
    label: 'Piso',
  },
  {
    value: 'Casa',
    label: 'Casa',
  },
  {
    value: 'Chalet',
    label: 'Chalet',
  },
  {
    value: 'Ático',
    label: 'Ático',
  },
  {
    value: 'Dúplex',
    label: 'Dúplex',
  },
  {
    value: 'Estudio',
    label: 'Estudio',
  },
  {
    value: 'Local',
    label: 'Local',
  },
  {
    value: 'Oficina',
    label: 'Oficina',
  },
  {
    value: 'Garaje',
    label: 'Garaje',
  },
  {
    value: 'Terreno',
    label: 'Terreno',
  },
  {
    value: 'Otro',
    label: 'Otro',
  },
] as const;

export type PropertyType =
  (typeof propertyTypeOptions)[number]['value'];

const amenityFeatures =
  propertyAmenityGroups.flatMap(
    (group) =>
      group.options,
  );

export type ManagedPropertyFeature =
  (typeof amenityFeatures)[number] |
  'Interior';

export const managedPropertyFeatures: readonly ManagedPropertyFeature[] = [
  ...amenityFeatures,
  'Interior',
];

export const propertyConditionOptions = [
  {
    value: 'new_build',
    label: 'Obra nueva',
  },
  {
    value: 'good',
    label: 'Buen estado',
  },
  {
    value: 'renovate',
    label: 'A reformar',
  },
] as const;

export type PropertyCondition =
  (typeof propertyConditionOptions)[number]['value'];

export const orientationOptions = [
  {
    value: 'north',
    label: 'Norte',
  },
  {
    value: 'south',
    label: 'Sur',
  },
  {
    value: 'east',
    label: 'Este',
  },
  {
    value: 'west',
    label: 'Oeste',
  },
] as const;

export type PropertyOrientation =
  (typeof orientationOptions)[number]['value'];

export const heatingTypeOptions = [
  {
    value: 'individual_gas',
    label: 'Individual de gas',
  },
  {
    value: 'central',
    label: 'Central',
  },
  {
    value: 'electric',
    label: 'Eléctrica',
  },
  {
    value: 'heat_pump',
    label: 'Bomba de calor',
  },
  {
    value: 'other',
    label: 'Otro sistema',
  },
] as const;

export type HeatingType =
  (typeof heatingTypeOptions)[number]['value'];

export const parkingTypeOptions = [
  {
    value: 'included',
    label: 'Incluido en el precio',
  },
  {
    value: 'optional',
    label: 'Opcional',
  },
] as const;

export type ParkingType =
  (typeof parkingTypeOptions)[number]['value'];

export const energyRatingOptions = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
] as const;

export type EnergyRating =
  (typeof energyRatingOptions)[number];

export const communityFeePeriodOptions = [
  {
    value: 'monthly',
    label: 'Mensual',
  },
  {
    value: 'quarterly',
    label: 'Trimestral',
  },
  {
    value: 'annual',
    label: 'Anual',
  },
] as const;

export type CommunityFeePeriod =
  (typeof communityFeePeriodOptions)[number]['value'];

export const energyCertificateStatusOptions = [
  {
    value: 'available',
    label: 'Disponible',
  },
  {
    value: 'pending',
    label: 'Pendiente',
  },
  {
    value: 'exempt',
    label: 'Exento',
  },
] as const;

export type EnergyCertificateStatus =
  (typeof energyCertificateStatusOptions)[number]['value'];

export const officeSpaceTypeOptions = [
  {
    value: 'private_office',
    label: 'Oficina privada',
  },
  {
    value: 'coworking',
    label: 'Oficina con espacios compartidos o coworking',
  },
  {
    value: 'workstation',
    label: 'Puesto de trabajo',
  },
] as const;

export type OfficeSpaceType =
  (typeof officeSpaceTypeOptions)[number]['value'];

export const officeBuildingUseOptions = [
  {
    value: 'offices_only',
    label: 'Edificio de uso exclusivo de oficinas',
  },
  {
    value: 'mixed',
    label: 'Edificio de uso mixto',
  },
] as const;

export type OfficeBuildingUse =
  (typeof officeBuildingUseOptions)[number]['value'];

export const addressVisibilityOptions = [
  {
    value: 'exact',
    label: 'Mostrar dirección exacta',
  },
  {
    value: 'street_only',
    label: 'Mostrar solo la calle',
  },
  {
    value: 'hidden',
    label: 'Ocultar dirección',
  },
] as const;

export type AddressVisibility =
  (typeof addressVisibilityOptions)[number]['value'];

export const buildingCertificationOptions = [
  'LEED',
  'BREEAM',
  'WELL',
] as const;

export type BuildingCertification =
  (typeof buildingCertificationOptions)[number];

export const chaletTypeOptions = [
  {
    value: 'terraced',
    label: 'Chalet adosado',
  },
  {
    value: 'semi_detached',
    label: 'Chalet pareado',
  },
  {
    value: 'independent',
    label: 'Chalet independiente',
  },
] as const;

export type ChaletType =
  (typeof chaletTypeOptions)[number]['value'];

export function isManagedPropertyFeature(
  value: string,
): value is ManagedPropertyFeature {
  return managedPropertyFeatures.some(
    (feature) =>
      feature === value,
  );
}

export function getOptionLabel(
  options: ReadonlyArray<{
    value: string;
    label: string;
  }>,
  value:
    | string
    | null
    | undefined,
) {
  return options.find(
    (option) =>
      option.value === value,
  )?.label;
}
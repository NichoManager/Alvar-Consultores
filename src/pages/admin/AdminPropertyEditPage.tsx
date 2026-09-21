import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AdminCurrentUser } from '../../components/admin/AdminCurrentUser';
import {
  SortablePropertyMediaGrid,
  type SortablePropertyMedia,
} from '../../components/admin/SortablePropertyMediaGrid';
import {
  addressVisibilityOptions,
  buildingCertificationOptions,
  communityFeePeriodOptions,
  energyRatingOptions,
  energyCertificateStatusOptions,
  heatingTypeOptions,
  isManagedPropertyFeature,
  officeBuildingUseOptions,
  officeSpaceTypeOptions,
  orientationOptions,
  parkingTypeOptions,
  propertyAmenityGroups,
  propertyConditionOptions,
  propertyTypeOptions,
  type AddressVisibility,
  type BuildingCertification,
  type CommunityFeePeriod,
  type EnergyRating,
  type EnergyCertificateStatus,
  type HeatingType,
  type ManagedPropertyFeature,
  type OfficeBuildingUse,
  type OfficeSpaceType,
  type ParkingType,
  type PropertyCondition,
  type PropertyOrientation,
} from '../../data/propertyOptions';
import {
  FLOORPLAN_ACCEPT,
  uploadPropertyFloorplans,
  validateFloorplanFiles,
} from '../../lib/propertyMedia';
import { supabase } from '../../lib/supabase';
import '../../styles/admin.css';
import '../../styles/admin-property-enhancements.css';

const STORAGE_BUCKET = 'property-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

const ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'avif',
]);

type PropertyStatus =
  | 'draft'
  | 'published'
  | 'reserved'
  | 'sold'
  | 'rented'
  | 'archived';

type PropertyOperation = 'venta' | 'alquiler';

type AdminProperty = {
  id: string;
  reference: string | null;
  title: string;
  slug: string;
  seo_title: string | null;
  seo_description: string | null;
  operation: PropertyOperation;
  property_type: string;
  status: PropertyStatus;
  price: number;
  currency: string;
  city: string;
  province: string | null;
  area: string | null;
  postal_code: string | null;
  address: string | null;
  show_exact_address: boolean;
  address_visibility: AddressVisibility;
  street_number: string | null;
  block: string | null;
  door: string | null;
  urbanization_name: string | null;
  cadastral_reference: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  built_area: number | null;
  usable_area: number | null;
  plot_area: number | null;
  floor: string | null;
  floors_count: number | null;
  construction_year: number | null;
  property_condition: PropertyCondition | null;
  orientations: PropertyOrientation[];
  heating_type: HeatingType | null;
  elevator: boolean;
  parking: boolean;
  parking_type: ParkingType | null;
  parking_spaces: number | null;
  terrace: boolean;
  furnished: boolean;
  exterior: boolean;
  office_space_type: OfficeSpaceType | null;
  gross_leasable_area: number | null;
  workstation_area: number | null;
  building_use: OfficeBuildingUse | null;
  available_from: string | null;
  building_certifications: BuildingCertification[];
  building_floors_count: number | null;
  office_floors_count: number | null;
  elevators_count: number | null;
  video_url: string | null;
  virtual_tour_url: string | null;
  community_fee_amount: number | null;
  community_fee_period: CommunityFeePeriod | null;
  ibi_annual_amount: number | null;
  energy_certificate_status: EnergyCertificateStatus | null;
  energy_consumption_rating: EnergyRating | null;
  energy_consumption_value: number | null;
  energy_emissions_rating: EnergyRating | null;
  energy_emissions_value: number | null;
  features: string[];
  description: string | null;
  featured: boolean;
  featured_position: number | null;
  published_at: string | null;
};

type PropertyFormState = {
  reference: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  operation: PropertyOperation;
  propertyType: string;
  price: string;
  city: string;
  province: string;
  area: string;
  postalCode: string;
  address: string;
  showExactAddress: boolean;
  addressVisibility: AddressVisibility;
  streetNumber: string;
  block: string;
  door: string;
  urbanizationName: string;
  cadastralReference: string;
  bedrooms: string;
  bathrooms: string;
  builtArea: string;
  usableArea: string;
  plotArea: string;
  floor: string;
  floorsCount: string;
  constructionYear: string;
  propertyCondition: PropertyCondition | '';
  orientations: PropertyOrientation[];
  heatingType: HeatingType | '';
  elevator: boolean;
  parking: boolean;
  parkingType: ParkingType | '';
  parkingSpaces: string;
  terrace: boolean;
  furnished: boolean;
  exposure: '' | 'exterior' | 'interior';
  officeSpaceType: OfficeSpaceType | '';
  grossLeasableArea: string;
  workstationArea: string;
  buildingUse: OfficeBuildingUse | '';
  availableFrom: string;
  buildingCertifications: BuildingCertification[];
  buildingFloorsCount: string;
  officeFloorsCount: string;
  elevatorsCount: string;
  videoUrl: string;
  virtualTourUrl: string;
  communityFeeAmount: string;
  communityFeePeriod: CommunityFeePeriod | '';
  ibiAnnualAmount: string;
  energyCertificateStatus: EnergyCertificateStatus | '';
  energyConsumptionRating: EnergyRating | '';
  energyConsumptionValue: string;
  energyEmissionsRating: EnergyRating | '';
  energyEmissionsValue: string;
  managedFeatures: ManagedPropertyFeature[];
  legacyFeatures: string[];
  description: string;
  featured: boolean;
  featuredPosition: string;
};

type PropertyImage = SortablePropertyMedia & {
  property_id: string;
};

const statusLabels: Record<PropertyStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  reserved: 'Reservado',
  sold: 'Vendido',
  rented: 'Alquilado',
  archived: 'Archivado',
};

const statusDescriptions: Record<PropertyStatus, string> = {
  draft: 'No aparece en el catálogo público.',
  published:
    'Visible en el catálogo y en la ficha pública del inmueble.',
  reserved:
    'Visible en la web con la etiqueta Reservado para indicar que la operación está en curso.',
  sold:
    'Operación de venta cerrada. El inmueble permanece visible en la web con la etiqueta Vendido.',
  rented:
    'Operación de alquiler cerrada. El inmueble permanece visible en la web con la etiqueta Alquilado.',
  archived:
    'Se conserva en el CRM pero no aparece públicamente.',
};

const statusOptions: Array<{
  value: PropertyStatus;
  label: string;
}> = [
    { value: 'draft', label: 'Borrador' },
    { value: 'published', label: 'Publicado' },
    { value: 'reserved', label: 'Reservado' },
    { value: 'sold', label: 'Vendido · Venta' },
    { value: 'rented', label: 'Alquilado · Alquiler' },
    { value: 'archived', label: 'Archivado' },
  ];

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function cleanFileName(fileName: string) {
  const extension = getFileExtension(fileName).replace(/[^a-z0-9]/g, '');
  const baseName = fileName.slice(0, -(extension.length + 1));

  const cleanBaseName = baseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${cleanBaseName || 'imagen'}.${extension}`;
}

function getPublicImageUrl(storagePath: string) {
  return supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath).data.publicUrl;
}

function nullableText(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue || null;
}

function nullableNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
}

function parsePrice(value: string) {
  const normalized = value
    .trim()
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  if (!normalized) {
    return null;
  }

  const numericValue = Number(normalized);

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
}

function createFormState(property: AdminProperty): PropertyFormState {
  return {
    reference: property.reference ?? '',
    title: property.title,
    seoTitle: property.seo_title ?? '',
    seoDescription: property.seo_description ?? '',
    operation: property.operation,
    propertyType: property.property_type,
    price: String(property.price),
    city: property.city,
    province: property.province ?? '',
    area: property.area ?? '',
    postalCode: property.postal_code ?? '',
    address: property.address ?? '',
    showExactAddress: property.show_exact_address,
    addressVisibility:
      property.address_visibility ??
      (property.show_exact_address ? 'exact' : 'hidden'),
    streetNumber: property.street_number ?? '',
    block: property.block ?? '',
    door: property.door ?? '',
    urbanizationName: property.urbanization_name ?? '',
    cadastralReference: property.cadastral_reference ?? '',
    bedrooms:
      property.bedrooms !== null
        ? String(property.bedrooms)
        : '',
    bathrooms:
      property.bathrooms !== null
        ? String(property.bathrooms)
        : '',
    builtArea:
      property.built_area !== null
        ? String(property.built_area)
        : '',
    usableArea:
      property.usable_area !== null
        ? String(property.usable_area)
        : '',
    plotArea:
      property.plot_area !== null
        ? String(property.plot_area)
        : '',
    floor: property.floor ?? '',
    floorsCount:
      property.floors_count !== null
        ? String(property.floors_count)
        : '',
    constructionYear:
      property.construction_year !== null
        ? String(property.construction_year)
        : '',
    propertyCondition: property.property_condition ?? '',
    orientations: property.orientations ?? [],
    heatingType: property.heating_type ?? '',
    elevator: property.elevator,
    parking: property.parking,
    parkingType: property.parking_type ?? '',
    parkingSpaces:
      property.parking_spaces !== null
        ? String(property.parking_spaces)
        : '',
    terrace: property.terrace,
    furnished: property.furnished,
    exposure: property.exterior
      ? 'exterior'
      : property.features.includes('Interior')
        ? 'interior'
        : '',
    officeSpaceType: property.office_space_type ?? '',
    grossLeasableArea:
      property.gross_leasable_area !== null
        ? String(property.gross_leasable_area)
        : '',
    workstationArea:
      property.workstation_area !== null
        ? String(property.workstation_area)
        : '',
    buildingUse: property.building_use ?? '',
    availableFrom: property.available_from ?? '',
    buildingCertifications:
      property.building_certifications ?? [],
    buildingFloorsCount:
      property.building_floors_count !== null
        ? String(property.building_floors_count)
        : '',
    officeFloorsCount:
      property.office_floors_count !== null
        ? String(property.office_floors_count)
        : '',
    elevatorsCount:
      property.elevators_count !== null
        ? String(property.elevators_count)
        : '',
    videoUrl: property.video_url ?? '',
    virtualTourUrl: property.virtual_tour_url ?? '',
    communityFeeAmount:
      property.community_fee_amount !== null
        ? String(property.community_fee_amount)
        : '',
    communityFeePeriod: property.community_fee_period ?? '',
    ibiAnnualAmount:
      property.ibi_annual_amount !== null
        ? String(property.ibi_annual_amount)
        : '',
    energyCertificateStatus:
      property.energy_certificate_status ?? '',
    energyConsumptionRating:
      property.energy_consumption_rating ?? '',
    energyConsumptionValue:
      property.energy_consumption_value !== null
        ? String(property.energy_consumption_value)
        : '',
    energyEmissionsRating:
      property.energy_emissions_rating ?? '',
    energyEmissionsValue:
      property.energy_emissions_value !== null
        ? String(property.energy_emissions_value)
        : '',
    managedFeatures: property.features
      .filter(isManagedPropertyFeature)
      .filter((feature) => feature !== 'Interior'),
    legacyFeatures: property.features.filter(
      (feature) => !isManagedPropertyFeature(feature),
    ),
    description: property.description ?? '',
    featured: property.featured,
    featuredPosition:
      property.featured_position !== null
        ? String(property.featured_position)
        : '',
  };
}

export function AdminPropertyEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [property, setProperty] = useState<AdminProperty | null>(null);
  const [form, setForm] = useState<PropertyFormState | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);

  const photos = images.filter(
    (image) => image.media_type === 'photo',
  );

  const floorplans = images.filter(
    (image) => image.media_type === 'floorplan',
  );

  const [selectedStatus, setSelectedStatus] =
    useState<PropertyStatus>('draft');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingFloorplans, setIsUploadingFloorplans] =
    useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [isDeletingProperty, setIsDeletingProperty] =
    useState(false);

  const isSavingRef = useRef(false);
  const isReorderingRef = useRef(false);

  const [pageError, setPageError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [imageError, setImageError] = useState('');

  const [floorplanError, setFloorplanError] = useState(
    (
      location.state as {
        floorplanUploadWarning?: string;
      } | null
    )?.floorplanUploadWarning ?? '',
  );

  const [deleteError, setDeleteError] = useState('');

  const handleLogout = async () => {
    await supabase.auth.signOut();

    navigate('/admin/login', {
      replace: true,
    });
  };

  const refreshImages = async () => {
    if (!id) {
      return false;
    }

    const { data, error: imagesError } = await supabase
      .from('property_images')
      .select(
        'id, property_id, storage_path, alt_text, position, is_cover, media_type',
      )
      .eq('property_id', id)
      .order('position', { ascending: true });

    if (imagesError) {
      console.error(
        'Error loading property images:',
        imagesError,
      );

      setImageError(
        'No se han podido cargar las fotografías del inmueble.',
      );

      return false;
    }

    setImages((data ?? []) as PropertyImage[]);

    return true;
  };

  useEffect(() => {
    let isMounted = true;

    const loadProperty = async () => {
      if (!id) {
        setPageError(
          'No se ha encontrado el inmueble solicitado.',
        );

        setIsLoading(false);

        return;
      }

      setPageError('');
      setImageError('');
      setIsLoading(true);

      const [propertyResult, imagesResult] = await Promise.all([
        supabase
          .from('properties')
          .select(
            `
              id,
              reference,
              title,
              slug,
              seo_title,
              seo_description,
              operation,
              property_type,
              status,
              price,
              currency,
              city,
              province,
              area,
              postal_code,
              address,
              show_exact_address,
              address_visibility,
              street_number,
              block,
              door,
              urbanization_name,
              cadastral_reference,
              bedrooms,
              bathrooms,
              built_area,
              usable_area,
              plot_area,
              floor,
              floors_count,
              construction_year,
              property_condition,
              orientations,
              heating_type,
              elevator,
              parking,
              parking_type,
              parking_spaces,
              terrace,
              furnished,
              exterior,
              office_space_type,
              gross_leasable_area,
              workstation_area,
              building_use,
              available_from,
              building_certifications,
              building_floors_count,
              office_floors_count,
              elevators_count,
              video_url,
              virtual_tour_url,
              community_fee_amount,
              community_fee_period,
              ibi_annual_amount,
              energy_certificate_status,
              energy_consumption_rating,
              energy_consumption_value,
              energy_emissions_rating,
              energy_emissions_value,
              features,
              description,
              featured,
              featured_position,
              published_at
            `,
          )
          .eq('id', id)
          .single(),

        supabase
          .from('property_images')
          .select(
            'id, property_id, storage_path, alt_text, position, is_cover, media_type',
          )
          .eq('property_id', id)
          .order('position', { ascending: true }),
      ]);

      if (!isMounted) {
        return;
      }

      if (propertyResult.error) {
        console.error(
          'Error loading property:',
          propertyResult.error,
        );

        setPageError(
          'No se ha podido cargar el inmueble.',
        );

        setIsLoading(false);

        return;
      }

      const loadedProperty =
        propertyResult.data as AdminProperty;

      setProperty(loadedProperty);
      setForm(createFormState(loadedProperty));
      setSelectedStatus(loadedProperty.status);

      if (imagesResult.error) {
        console.error(
          'Error loading property images:',
          imagesResult.error,
        );

        setImageError(
          'No se han podido cargar las fotografías del inmueble.',
        );
      }

      setImages(
        (imagesResult.data ?? []) as PropertyImage[],
      );

      setIsLoading(false);
    };

    void loadProperty();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const updateForm = <K extends keyof PropertyFormState>(
    key: K,
    value: PropertyFormState[K],
  ) => {
    setForm((currentForm) => {
      if (!currentForm) {
        return currentForm;
      }

      return {
        ...currentForm,
        [key]: value,
      };
    });

    setSaveSuccess('');
  };

  const handleSaveAll = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !property ||
      !form ||
      isSavingRef.current ||
      isUploading ||
      isUploadingFloorplans ||
      isManaging ||
      isDeletingProperty
    ) {
      return;
    }

    setSaveError('');
    setSaveSuccess('');

    const title = form.title.trim();
    const city = form.city.trim();
    const province = form.province.trim();
    const price = parsePrice(form.price);

    if (!title) {
      setSaveError(
        'Introduce un título para el inmueble.',
      );

      return;
    }

    if (!city) {
      setSaveError(
        'Introduce la localidad o municipio del inmueble.',
      );

      return;
    }

    if (!province) {
      setSaveError(
        'Introduce la provincia del inmueble.',
      );

      return;
    }

    if (
      price === null ||
      price < 0
    ) {
      setSaveError(
        'Introduce un precio válido.',
      );

      return;
    }

    const isOffice =
      form.propertyType === 'Oficina';

    const addressVisibility: AddressVisibility =
      isOffice
        ? form.addressVisibility
        : form.showExactAddress
          ? 'exact'
          : 'hidden';

    const officeElevatorsCount =
      isOffice
        ? nullableNumber(form.elevatorsCount)
        : null;

    const featuredPosition =
      form.featured
        ? nullableNumber(
          form.featuredPosition,
        )
        : null;

    if (
      featuredPosition !== null &&
      (
        !Number.isInteger(
          featuredPosition,
        ) ||
        featuredPosition < 1
      )
    ) {
      setSaveError(
        'La posición en destacados debe ser un número entero igual o mayor que 1.',
      );

      return;
    }

    const isPublicStatus =
      selectedStatus === 'published' ||
      selectedStatus === 'reserved' ||
      selectedStatus === 'sold' ||
      selectedStatus === 'rented';

    if (
      isPublicStatus &&
      photos.length === 0
    ) {
      setSaveError(
        'Añade al menos una fotografía antes de mostrar el inmueble en la web.',
      );

      return;
    }

    if (
      selectedStatus === 'sold' &&
      form.operation !== 'venta'
    ) {
      setSaveError(
        'El estado Vendido solo corresponde a inmuebles en venta.',
      );

      return;
    }

    if (
      selectedStatus === 'rented' &&
      form.operation !== 'alquiler'
    ) {
      setSaveError(
        'El estado Alquilado solo corresponde a inmuebles en alquiler.',
      );

      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    const publishedAt =
      isPublicStatus
        ? property.published_at ??
        new Date().toISOString()
        : property.published_at;

    const updatePayload = {
      reference: nullableText(form.reference),
      title,
      seo_title: nullableText(form.seoTitle),
      seo_description: nullableText(form.seoDescription),
      operation: form.operation,
      property_type: form.propertyType,
      price,
      city,
      province,
      area: nullableText(form.area),
      postal_code: nullableText(form.postalCode),
      address: nullableText(form.address),
      show_exact_address:
        addressVisibility === 'exact',
      address_visibility: addressVisibility,
      street_number:
        isOffice
          ? nullableText(form.streetNumber)
          : null,
      block:
        isOffice
          ? nullableText(form.block)
          : null,
      door:
        isOffice
          ? nullableText(form.door)
          : null,
      urbanization_name:
        isOffice
          ? nullableText(form.urbanizationName)
          : null,
      cadastral_reference:
        isOffice
          ? nullableText(form.cadastralReference)
          : null,
      bedrooms:
        isOffice
          ? null
          : nullableNumber(form.bedrooms),
      bathrooms: nullableNumber(form.bathrooms),
      built_area: nullableNumber(form.builtArea),
      usable_area: nullableNumber(form.usableArea),
      plot_area:
        isOffice
          ? null
          : nullableNumber(form.plotArea),
      floor: nullableText(form.floor),
      floors_count:
        isOffice
          ? null
          : nullableNumber(form.floorsCount),
      construction_year: nullableNumber(form.constructionYear),
      property_condition: form.propertyCondition || null,
      orientations: form.orientations,
      heating_type: form.heatingType || null,
      elevator:
        officeElevatorsCount !== null
          ? officeElevatorsCount > 0
          : form.elevator,
      parking: form.parking,
      parking_type:
        form.parking
          ? form.parkingType || null
          : null,
      parking_spaces:
        form.parking
          ? nullableNumber(form.parkingSpaces)
          : null,
      terrace: form.terrace,
      furnished: form.furnished,
      exterior: form.exposure === 'exterior',
      office_space_type:
        isOffice
          ? form.officeSpaceType || null
          : null,
      gross_leasable_area:
        isOffice
          ? nullableNumber(form.grossLeasableArea)
          : null,
      workstation_area:
        isOffice
          ? nullableNumber(form.workstationArea)
          : null,
      building_use:
        isOffice
          ? form.buildingUse || null
          : null,
      available_from:
        isOffice
          ? nullableText(form.availableFrom)
          : null,
      building_certifications:
        isOffice
          ? form.buildingCertifications
          : [],
      building_floors_count:
        isOffice
          ? nullableNumber(form.buildingFloorsCount)
          : null,
      office_floors_count:
        isOffice
          ? nullableNumber(form.officeFloorsCount)
          : null,
      elevators_count: officeElevatorsCount,
      video_url: nullableText(form.videoUrl),
      virtual_tour_url: nullableText(form.virtualTourUrl),
      community_fee_amount:
        nullableNumber(form.communityFeeAmount),
      community_fee_period:
        form.communityFeeAmount.trim()
          ? form.communityFeePeriod || null
          : null,
      ibi_annual_amount:
        nullableNumber(form.ibiAnnualAmount),
      energy_certificate_status:
        form.energyCertificateStatus || null,
      energy_consumption_rating:
        form.energyConsumptionRating || null,
      energy_consumption_value:
        nullableNumber(form.energyConsumptionValue),
      energy_emissions_rating:
        form.energyEmissionsRating || null,
      energy_emissions_value:
        nullableNumber(form.energyEmissionsValue),
      features: [
        ...form.legacyFeatures,
        ...form.managedFeatures,
        ...(form.exposure === 'interior'
          ? ['Interior']
          : []),
      ],
      description: nullableText(form.description),
      featured: form.featured,
      featured_position:
        featuredPosition,
      status: selectedStatus,
      published_at: publishedAt,
    };

    try {
      const { error: updateError } = await supabase
        .from('properties')
        .update(updatePayload)
        .eq('id', property.id);

      if (updateError) {
        console.error(
          'Error updating property:',
          updateError,
        );

        setSaveError(
          'No se han podido guardar los cambios del inmueble. Inténtalo de nuevo.',
        );

        return;
      }

      setProperty({
        ...property,
        ...updatePayload,
      });

      setSaveSuccess(
        'Cambios guardados correctamente.',
      );
    } catch (unexpectedError) {
      console.error(
        'Unexpected property update error:',
        unexpectedError,
      );

      setSaveError(
        'No se han podido guardar los cambios del inmueble. Inténtalo de nuevo.',
      );
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleResetData = () => {
    if (!property || isDeletingProperty) {
      return;
    }

    setForm(createFormState(property));
    setSelectedStatus(property.status);
    setSaveError('');
    setSaveSuccess('');
  };

  const handleUpload = async (
    selectedFiles: File[],
  ) => {
    if (
      !property ||
      selectedFiles.length === 0 ||
      isUploading ||
      isUploadingFloorplans ||
      isManaging ||
      isDeletingProperty
    ) {
      return;
    }

    const messages: string[] = [];

    const validFiles = selectedFiles.filter((file) => {
      const extension = getFileExtension(file.name);

      if (
        !ALLOWED_MIME_TYPES.has(file.type) ||
        !ALLOWED_EXTENSIONS.has(extension)
      ) {
        messages.push(
          `${file.name}: formato no permitido.`,
        );

        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        messages.push(
          `${file.name}: supera el máximo de 10 MB.`,
        );

        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      setImageError(messages.join(' '));

      return;
    }

    setImageError('');
    setIsUploading(true);

    let nextPosition =
      photos.reduce(
        (highest, image) =>
          Math.max(highest, image.position),
        -1,
      ) + 1;

    let successfulUploads = 0;

    const hasExistingImages = photos.length > 0;

    try {
      for (const file of validFiles) {
        const storagePath =
          `${property.id}/${crypto.randomUUID()}-${cleanFileName(file.name)}`;

        const { error: uploadError } =
          await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, file, {
              cacheControl: '3600',
              contentType: file.type,
              upsert: false,
            });

        if (uploadError) {
          console.error(
            `Error uploading ${file.name}:`,
            uploadError,
          );

          messages.push(
            `${file.name}: no se ha podido subir.`,
          );

          continue;
        }

        const { error: insertError } =
          await supabase
            .from('property_images')
            .insert({
              property_id: property.id,
              storage_path: storagePath,
              alt_text:
                `${property.title} en ${property.city}`,
              position: nextPosition,
              is_cover:
                !hasExistingImages &&
                successfulUploads === 0,
              media_type: 'photo',
            });

        if (insertError) {
          console.error(
            `Error registering ${file.name}:`,
            insertError,
          );

          messages.push(
            `${file.name}: no se ha podido registrar.`,
          );

          const { error: cleanupError } =
            await supabase.storage
              .from(STORAGE_BUCKET)
              .remove([storagePath]);

          if (cleanupError) {
            console.error(
              `Error cleaning up ${file.name}:`,
              cleanupError,
            );
          }

          continue;
        }

        nextPosition += 1;
        successfulUploads += 1;
      }

      const refreshed = await refreshImages();

      if (messages.length > 0) {
        setImageError(messages.join(' '));
      } else if (refreshed) {
        setImageError('');
      }
    } catch (unexpectedError) {
      console.error(
        'Unexpected property image upload error:',
        unexpectedError,
      );

      setImageError(
        'No se han podido completar las subidas. Inténtalo de nuevo.',
      );
    } finally {
      setIsUploading(false);
    }
  };
  const updatePositions = async (
    orderedImages: PropertyImage[],
    force = false,
  ) => {
    for (const [position, image] of orderedImages.entries()) {
      if (!force && image.position === position) {
        continue;
      }

      const {
        data: updatedImage,
        error: positionError,
      } = await supabase
        .from('property_images')
        .update({ position })
        .eq('id', image.id)
        .eq('property_id', id)
        .select('id')
        .maybeSingle();

      if (positionError) {
        return positionError;
      }

      if (!updatedImage) {
        return new Error(
          `No property image row was updated for ${image.id}.`,
        );
      }
    }

    return null;
  };

  const replaceMediaItems = (
    currentImages: PropertyImage[],
    orderedImages: PropertyImage[],
  ) => {
    const mediaType = orderedImages[0]?.media_type;
    let nextMediaIndex = 0;

    if (!mediaType) {
      return currentImages;
    }

    return currentImages.map((image) => {
      if (image.media_type !== mediaType) {
        return image;
      }

      const orderedImage = orderedImages[nextMediaIndex];
      nextMediaIndex += 1;

      return orderedImage;
    });
  };

  const handleReorder = async (
    orderedImages: PropertyImage[],
  ) => {
    if (
      isManaging ||
      isReorderingRef.current ||
      isUploading ||
      isUploadingFloorplans ||
      isDeletingProperty ||
      orderedImages.length < 2
    ) {
      return;
    }

    isReorderingRef.current = true;

    const previousImages = [...images];

    const previousMediaItems = previousImages.filter(
      (image) =>
        image.media_type === orderedImages[0].media_type,
    );

    const normalizedImages = orderedImages.map(
      (image, position) => ({
        ...image,
        position,
      }),
    );

    setImageError('');
    setFloorplanError('');

    setImages((currentImages) =>
      replaceMediaItems(
        currentImages,
        normalizedImages,
      ),
    );

    setIsManaging(true);

    try {
      const positionError =
        await updatePositions(orderedImages);

      if (positionError) {
        throw positionError;
      }

      await refreshImages();
    } catch (reorderError) {
      console.error(
        'Error reordering property images:',
        reorderError,
      );

      const rollbackError =
        await updatePositions(
          previousMediaItems,
          true,
        );

      if (rollbackError) {
        console.error(
          'Error restoring property image positions:',
          rollbackError,
        );
      }

      setImages(previousImages);

      if (
        orderedImages[0].media_type ===
        'floorplan'
      ) {
        setFloorplanError(
          'No se ha podido cambiar el orden de los planos.',
        );
      } else {
        setImageError(
          'No se ha podido cambiar el orden de las fotografías.',
        );
      }

      await refreshImages();
    } finally {
      isReorderingRef.current = false;
      setIsManaging(false);
    }
  };

  const handleSetCover = async (
    imageId: string,
  ) => {
    if (
      isManaging ||
      isUploading ||
      isUploadingFloorplans ||
      isDeletingProperty
    ) {
      return;
    }

    setImageError('');
    setIsManaging(true);

    try {
      const { error: resetError } =
        await supabase
          .from('property_images')
          .update({ is_cover: false })
          .eq('property_id', id)
          .eq('media_type', 'photo');

      if (resetError) {
        console.error(
          'Error clearing property cover:',
          resetError,
        );

        setImageError(
          'No se ha podido cambiar la fotografía de portada.',
        );

        return;
      }

      const { error: coverError } =
        await supabase
          .from('property_images')
          .update({ is_cover: true })
          .eq('id', imageId)
          .eq('property_id', id);

      if (coverError) {
        console.error(
          'Error setting property cover:',
          coverError,
        );

        setImageError(
          'No se ha podido cambiar la fotografía de portada.',
        );

        return;
      }

      await refreshImages();
    } catch (unexpectedError) {
      console.error(
        'Unexpected cover update error:',
        unexpectedError,
      );

      setImageError(
        'No se ha podido cambiar la fotografía de portada.',
      );
    } finally {
      setIsManaging(false);
    }
  };

  const handleMove = async (
    imageIndex: number,
    direction: -1 | 1,
    mediaItems: PropertyImage[],
  ) => {
    const nextIndex = imageIndex + direction;

    if (
      isManaging ||
      isUploading ||
      isUploadingFloorplans ||
      isDeletingProperty ||
      nextIndex < 0 ||
      nextIndex >= mediaItems.length
    ) {
      return;
    }

    const reorderedImages = [...mediaItems];

    [
      reorderedImages[imageIndex],
      reorderedImages[nextIndex],
    ] = [
        reorderedImages[nextIndex],
        reorderedImages[imageIndex],
      ];

    await handleReorder(reorderedImages);
  };

  const handleDelete = async (
    image: PropertyImage,
  ) => {
    if (
      isManaging ||
      isUploading ||
      isUploadingFloorplans ||
      isDeletingProperty ||
      !window.confirm(
        '¿Seguro que quieres eliminar esta fotografía?',
      )
    ) {
      return;
    }

    setImageError('');
    setIsManaging(true);

    try {
      const { error: storageError } =
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([image.storage_path]);

      if (storageError) {
        console.error(
          'Error deleting property image file:',
          storageError,
        );

        setImageError(
          'No se ha podido eliminar el archivo de la fotografía.',
        );

        return;
      }

      const { error: deleteError } =
        await supabase
          .from('property_images')
          .delete()
          .eq('id', image.id)
          .eq('property_id', id);

      if (deleteError) {
        console.error(
          'Error deleting property image row:',
          deleteError,
        );

        setImageError(
          'No se ha podido eliminar el registro de la fotografía.',
        );

        return;
      }

      const sameTypeImages = images.filter(
        (item) =>
          item.media_type === image.media_type,
      );

      const remainingImages =
        sameTypeImages.filter(
          (item) =>
            item.id !== image.id,
        );

      if (
        image.is_cover &&
        remainingImages.length > 0
      ) {
        const { error: coverError } =
          await supabase
            .from('property_images')
            .update({ is_cover: true })
            .eq('id', remainingImages[0].id)
            .eq('property_id', id);

        if (coverError) {
          console.error(
            'Error assigning replacement cover:',
            coverError,
          );

          setImageError(
            'La fotografía se eliminó, pero no se pudo asignar la nueva portada.',
          );
        }
      }

      const positionError =
        await updatePositions(remainingImages);

      if (positionError) {
        console.error(
          'Error normalizing property image positions:',
          positionError,
        );

        setImageError(
          'La fotografía se eliminó, pero no se pudo actualizar el orden.',
        );
      }

      await refreshImages();
    } catch (unexpectedError) {
      console.error(
        'Unexpected property image deletion error:',
        unexpectedError,
      );

      setImageError(
        'No se ha podido completar la eliminación de la fotografía.',
      );

      await refreshImages();
    } finally {
      setIsManaging(false);
    }
  };

  const handleFloorplanUpload = async (
    selectedFiles: File[],
  ) => {
    if (
      !property ||
      !selectedFiles.length ||
      isUploading ||
      isUploadingFloorplans ||
      isManaging ||
      isDeletingProperty
    ) {
      return;
    }

    const validation =
      validateFloorplanFiles(selectedFiles);

    if (!validation.validFiles.length) {
      setFloorplanError(
        validation.errors.join(' '),
      );

      return;
    }

    setFloorplanError('');
    setIsUploadingFloorplans(true);

    try {
      const result =
        await uploadPropertyFloorplans({
          propertyId: property.id,
          propertyTitle: property.title,
          propertyCity: property.city,
          files: validation.validFiles,
          startPosition:
            floorplans.reduce(
              (highest, image) =>
                Math.max(
                  highest,
                  image.position,
                ),
              -1,
            ) + 1,
        });

      setFloorplanError(
        [
          ...validation.errors,
          ...result.errors,
        ].join(' '),
      );

      await refreshImages();
    } catch (unexpectedError) {
      console.error(
        'Unexpected floorplan upload error:',
        unexpectedError,
      );

      setFloorplanError(
        'No se han podido completar las subidas de planos. Inténtalo de nuevo.',
      );
    } finally {
      setIsUploadingFloorplans(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (
      !property ||
      isDeletingProperty ||
      isSavingRef.current ||
      isUploading ||
      isUploadingFloorplans ||
      isManaging
    ) {
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar definitivamente "${property.title}"?\n\nSe eliminarán también todas sus fotografías. Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleteError('');
    setIsDeletingProperty(true);

    try {
      const {
        data: propertyImages,
        error: imagesQueryError,
      } = await supabase
        .from('property_images')
        .select('storage_path')
        .eq('property_id', property.id);

      if (imagesQueryError) {
        console.error(
          'Error loading property images before deletion:',
          imagesQueryError,
        );

        setDeleteError(
          'No se han podido preparar las fotografías para eliminar el inmueble.',
        );

        return;
      }

      const storagePaths =
        (propertyImages ?? [])
          .map(
            (image) =>
              image.storage_path,
          )
          .filter(Boolean);

      if (storagePaths.length > 0) {
        const { error: storageDeleteError } =
          await supabase.storage
            .from(STORAGE_BUCKET)
            .remove(storagePaths);

        if (storageDeleteError) {
          console.error(
            'Error deleting property images from storage:',
            storageDeleteError,
          );

          setDeleteError(
            'No se han podido eliminar las fotografías del inmueble. Inténtalo de nuevo.',
          );

          return;
        }
      }

      const { error: propertyDeleteError } =
        await supabase
          .from('properties')
          .delete()
          .eq('id', property.id);

      if (propertyDeleteError) {
        console.error(
          'Error deleting property:',
          propertyDeleteError,
        );

        setDeleteError(
          'Las fotografías se han eliminado, pero no se ha podido eliminar el inmueble. Inténtalo de nuevo.',
        );

        return;
      }

      navigate(
        '/admin/inmuebles',
        {
          replace: true,
        },
      );
    } catch (unexpectedError) {
      console.error(
        'Unexpected property deletion error:',
        unexpectedError,
      );

      setDeleteError(
        'No se ha podido eliminar el inmueble. Inténtalo de nuevo.',
      );
    } finally {
      setIsDeletingProperty(false);
    }
  };

  if (isLoading) {
    return (
      <main className="admin-property-edit admin-property-edit--loading">
        <p>Cargando inmueble...</p>
      </main>
    );
  }

  if (!property || !form) {
    return (
      <main className="admin-property-edit admin-property-edit--loading">
        <p>
          {pageError ||
            'No se ha encontrado el inmueble solicitado.'}
        </p>

        <Link to="/admin/inmuebles">
          ← Volver a inmuebles
        </Link>
      </main>
    );
  }

  const propertyTypeOptionsForForm =
    propertyTypeOptions.some(
      (option) =>
        option.value === form.propertyType,
    )
      ? propertyTypeOptions
      : [
        {
          value: form.propertyType,
          label: form.propertyType,
        },
        ...propertyTypeOptions,
      ];

  const isOffice =
    form.propertyType === 'Oficina';

  const isPropertyPublic =
    property.status === 'published' ||
    property.status === 'reserved' ||
    property.status === 'sold' ||
    property.status === 'rented';

  return (
    <main className="admin-property-edit">
      <header className="admin-property-edit__header">
        <div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-site-link"
            aria-label="Abrir la web pública de Alvar Consultores en una nueva pestaña"
          >
            ALVAR CONSULTORES{' '}

            <span aria-hidden="true">
              ↗
            </span>
          </a>

          <h1>Editar inmueble</h1>

          <p>{property.title}</p>
        </div>

        <div className="admin-property-edit__meta">
          <div className="admin-property-edit__meta-top">
            <AdminCurrentUser />

            <span className="admin-property-edit__status">
              {statusLabels[property.status]}
            </span>

            <button
              type="button"
              className="admin-property-edit__logout"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>

          <nav
            className="admin-property-edit__navigation"
            aria-label="Navegación del inmueble"
          >
            <Link to="/admin/inmuebles">
              ← Volver a inmuebles
            </Link>

            {isPropertyPublic ? (
              <Link
                to={`/inmuebles/${property.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver inmueble en web ↗
              </Link>
            ) : null}
          </nav>
        </div>
      </header>

      <div className="admin-property-edit__top-actions">
        <button
          type="submit"
          form="admin-property-edit-form"
          className="admin-property-edit__save"
          disabled={
            isSaving ||
            isUploading ||
            isUploadingFloorplans ||
            isManaging ||
            isDeletingProperty
          }
        >
          {isSaving
            ? 'Guardando...'
            : 'Guardar cambios'}
        </button>
      </div>

      <form
        id="admin-property-edit-form"
        className="admin-property-form"
        onSubmit={handleSaveAll}
      >
        <p className="admin-property-form__required-note">
          Los campos marcados con * son obligatorios.
        </p>

        <section className="admin-property-form__section">
          <div>
            <span>01</span>
            <h2>Datos principales</h2>
          </div>

          <div className="admin-property-form__grid">
            <label className="admin-property-form__field">
              <span>Operación *</span>

              <select
                value={form.operation}
                onChange={(event) =>
                  updateForm(
                    'operation',
                    event.target
                      .value as PropertyOperation,
                  )
                }
                disabled={isDeletingProperty}
                required
              >
                <option value="venta">
                  Venta
                </option>

                <option value="alquiler">
                  Alquiler
                </option>
              </select>
            </label>

            <label className="admin-property-form__field">
              <span>
                Tipo de inmueble *
              </span>

              <select
                value={form.propertyType}
                onChange={(event) =>
                  updateForm(
                    'propertyType',
                    event.target.value,
                  )
                }
                disabled={isDeletingProperty}
                required
              >
                {propertyTypeOptionsForForm.map(
                  (option) => (
                    <option
                      value={option.value}
                      key={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="admin-property-form__field">
              <span>Título *</span>

              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  updateForm(
                    'title',
                    event.target.value,
                  )
                }
                disabled={isDeletingProperty}
                required
              />
            </label>

            <label className="admin-property-form__field">
              <span>Referencia</span>

              <input
                type="text"
                value={form.reference}
                onChange={(event) =>
                  updateForm(
                    'reference',
                    event.target.value,
                  )
                }
                disabled={isDeletingProperty}
                placeholder="Ej. ALV-001"
              />
            </label>

            <label className="admin-property-form__field">
              <span>Precio *</span>

              <span className="admin-property-form__input-suffix">
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(event) =>
                    updateForm(
                      'price',
                      event.target.value,
                    )
                  }
                  disabled={isDeletingProperty}
                  placeholder={
                    form.operation ===
                      'alquiler'
                      ? 'Ej. 1.500'
                      : 'Ej. 250.000'
                  }
                  required
                />

                <span aria-hidden="true">
                  {form.operation ===
                    'alquiler'
                    ? '€/mes'
                    : '€'}
                </span>
              </span>

              <small className="admin-property-form__helper">
                Puedes escribir, por ejemplo,{' '}
                {form.operation ===
                  'alquiler'
                  ? '1500 o 1.500'
                  : '250000 o 250.000'}
                .
              </small>
            </label>
          </div>
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>02</span>
            <h2>Ubicación</h2>
          </div>

          <div className="admin-property-form__grid">
            <label className="admin-property-form__field">
              <span>
                Localidad / municipio *
              </span>

              <input
                type="text"
                value={form.city}
                onChange={(event) =>
                  updateForm(
                    'city',
                    event.target.value,
                  )
                }
                disabled={isDeletingProperty}
                autoComplete="address-level2"
                placeholder="Ej. La Guardia"
                required
              />

              <small className="admin-property-form__helper">
                Introduce el municipio real del inmueble.
              </small>
            </label>

            <label className="admin-property-form__field">
              <span>Provincia *</span>

              <input
                type="text"
                value={form.province}
                onChange={(event) =>
                  updateForm(
                    'province',
                    event.target.value,
                  )
                }
                disabled={isDeletingProperty}
                autoComplete="address-level1"
                placeholder="Ej. Toledo"
                required
              />

              <small className="admin-property-form__helper">
                Ayuda a identificar correctamente la ubicación y el mapa.
              </small>
            </label>

            <label className="admin-property-form__field">
              <span>Zona / barrio</span>

              <input
                type="text"
                value={form.area}
                onChange={(event) =>
                  updateForm(
                    'area',
                    event.target.value,
                  )
                }
                disabled={isDeletingProperty}
                placeholder="Ej. Zona centro"
              />
            </label>

            <label className="admin-property-form__field">
              <span>Código postal</span>

              <input
                type="text"
                inputMode="numeric"
                value={form.postalCode}
                onChange={(event) =>
                  updateForm(
                    'postalCode',
                    event.target.value,
                  )
                }
                disabled={isDeletingProperty}
                autoComplete="postal-code"
                placeholder="Ej. 45760"
              />
            </label>

            <label className="admin-property-form__field">
              <span>
                {isOffice
                  ? 'Calle / vía'
                  : 'Dirección'}
              </span>

              <input
                type="text"
                value={form.address}
                onChange={(event) =>
                  updateForm(
                    'address',
                    event.target.value,
                  )
                }
                disabled={isDeletingProperty}
                autoComplete="street-address"
                placeholder={
                  isOffice
                    ? 'Ej. Calle Serrano'
                    : 'Ej. Calle ...'
                }
              />

              <small className="admin-property-form__helper">
                {isOffice
                  ? 'Introduce la vía sin necesidad de añadir aquí el número, bloque o puerta.'
                  : 'La dirección exacta solo será pública si activas la opción inferior.'}
              </small>
            </label>

            {isOffice ? (
              <>
                <label className="admin-property-form__field">
                  <span>Número</span>

                  <input
                    type="text"
                    value={form.streetNumber}
                    onChange={(event) =>
                      updateForm(
                        'streetNumber',
                        event.target.value,
                      )
                    }
                    disabled={isDeletingProperty}
                    placeholder="Ej. 42"
                  />
                </label>

                <label className="admin-property-form__field">
                  <span>Bloque / escalera</span>

                  <input
                    type="text"
                    value={form.block}
                    onChange={(event) =>
                      updateForm(
                        'block',
                        event.target.value,
                      )
                    }
                    disabled={isDeletingProperty}
                    placeholder="Ej. Bloque B"
                  />
                </label>

                <label className="admin-property-form__field">
                  <span>Puerta / oficina</span>

                  <input
                    type="text"
                    value={form.door}
                    onChange={(event) =>
                      updateForm(
                        'door',
                        event.target.value,
                      )
                    }
                    disabled={isDeletingProperty}
                    placeholder="Ej. Oficina 3A"
                  />
                </label>

                <label className="admin-property-form__field">
                  <span>Edificio / urbanización</span>

                  <input
                    type="text"
                    value={form.urbanizationName}
                    onChange={(event) =>
                      updateForm(
                        'urbanizationName',
                        event.target.value,
                      )
                    }
                    disabled={isDeletingProperty}
                    placeholder="Ej. Edificio Centro"
                  />
                </label>

                <label className="admin-property-form__field">
                  <span>Referencia catastral</span>

                  <input
                    type="text"
                    value={form.cadastralReference}
                    onChange={(event) =>
                      updateForm(
                        'cadastralReference',
                        event.target.value,
                      )
                    }
                    disabled={isDeletingProperty}
                    placeholder="Ej. 1234567VK4713S0001AB"
                  />
                </label>
              </>
            ) : null}
          </div>

          {isOffice ? (
            <div className="admin-property-subsection">
              <h3>Visibilidad de la dirección</h3>

              <p className="admin-property-form__check-help">
                Decide cuánto detalle de la ubicación quieres
                mostrar públicamente en la ficha de la oficina.
              </p>

              <div className="admin-property-form__checks">
                {addressVisibilityOptions.map(
                  (option) => (
                    <label
                      className="admin-property-form__check"
                      key={option.value}
                    >
                      <input
                        type="radio"
                        name="address-visibility"
                        value={option.value}
                        checked={
                          form.addressVisibility ===
                          option.value
                        }
                        onChange={() => {
                          updateForm(
                            'addressVisibility',
                            option.value,
                          );

                          updateForm(
                            'showExactAddress',
                            option.value === 'exact',
                          );
                        }}
                        disabled={isDeletingProperty}
                      />

                      <span>{option.label}</span>
                    </label>
                  ),
                )}
              </div>
            </div>
          ) : (
            <label className="admin-property-form__check admin-property-form__privacy-check">
              <input
                type="checkbox"
                checked={form.showExactAddress}
                onChange={(event) => {
                  const checked =
                    event.target.checked;

                  updateForm(
                    'showExactAddress',
                    checked,
                  );

                  updateForm(
                    'addressVisibility',
                    checked
                      ? 'exact'
                      : 'hidden',
                  );
                }}
                disabled={isDeletingProperty}
              />

              <span>
                Mostrar dirección exacta en la web

                <small>
                  Actívalo solo si quieres que la
                  ubicación exacta del inmueble sea
                  pública.
                </small>
              </span>
            </label>
          )}
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>03</span>
            <h2>Datos del inmueble</h2>
          </div>

          <div className="admin-property-form__grid">
            {!isOffice ? (
              <label className="admin-property-form__field">
                <span>Dormitorios</span>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.bedrooms}
                  onChange={(event) =>
                    updateForm(
                      'bedrooms',
                      event.target.value,
                    )
                  }
                  disabled={isDeletingProperty}
                />
              </label>
            ) : null}

            <label className="admin-property-form__field">
              <span>Baños</span>

              <input
                type="number"
                min="0"
                step="1"
                value={form.bathrooms}
                onChange={(event) =>
                  updateForm(
                    'bathrooms',
                    event.target.value,
                  )
                }
                disabled={isDeletingProperty}
              />
            </label>

            <label className="admin-property-form__field">
              <span>
                Superficie construida (m²)
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.builtArea}
                onChange={(event) =>
                  updateForm(
                    'builtArea',
                    event.target.value,
                  )
                }
                disabled={isDeletingProperty}
              />
            </label>

            <label className="admin-property-form__field">
              <span>
                Superficie útil (m²)
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.usableArea}
                onChange={(event) =>
                  updateForm(
                    'usableArea',
                    event.target.value,
                  )
                }
                disabled={isDeletingProperty}
              />
            </label>

            <label className="admin-property-form__field">
              <span>Planta</span>

              <input
                type="text"
                value={form.floor}
                onChange={(event) =>
                  updateForm(
                    'floor',
                    event.target.value,
                  )
                }
                disabled={isDeletingProperty}
              />
            </label>

            {!isOffice ? (
              <label className="admin-property-form__field">
                <span>
                  Superficie de parcela (m²)
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.plotArea}
                  onChange={(event) =>
                    updateForm(
                      'plotArea',
                      event.target.value,
                    )
                  }
                  disabled={isDeletingProperty}
                />
              </label>
            ) : null}

            {!isOffice ? (
              <label className="admin-property-form__field">
                <span>Número de plantas</span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.floorsCount}
                  onChange={(event) =>
                    updateForm(
                      'floorsCount',
                      event.target.value,
                    )
                  }
                  disabled={isDeletingProperty}
                />
              </label>
            ) : null}

            <label className="admin-property-form__field">
              <span>
                Año de construcción
              </span>

              <input
                type="number"
                min="1800"
                max="2200"
                step="1"
                value={form.constructionYear}
                onChange={(event) =>
                  updateForm(
                    'constructionYear',
                    event.target.value,
                  )
                }
                disabled={isDeletingProperty}
              />
            </label>

            <label className="admin-property-form__field">
              <span>Estado</span>

              <select
                value={form.propertyCondition}
                onChange={(event) =>
                  updateForm(
                    'propertyCondition',
                    event.target
                      .value as PropertyCondition | '',
                  )
                }
                disabled={isDeletingProperty}
              >
                <option value="">
                  Sin especificar
                </option>

                {propertyConditionOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="admin-property-form__field">
              <span>
                Exterior / interior
              </span>

              <select
                value={form.exposure}
                onChange={(event) =>
                  updateForm(
                    'exposure',
                    event.target
                      .value as PropertyFormState['exposure'],
                  )
                }
                disabled={isDeletingProperty}
              >
                <option value="">
                  Sin especificar
                </option>

                <option value="exterior">
                  Exterior
                </option>

                <option value="interior">
                  Interior
                </option>
              </select>
            </label>

            <label className="admin-property-form__field">
              <span>Calefacción</span>

              <select
                value={form.heatingType}
                onChange={(event) =>
                  updateForm(
                    'heatingType',
                    event.target
                      .value as HeatingType | '',
                  )
                }
                disabled={isDeletingProperty}
              >
                <option value="">
                  Sin especificar
                </option>

                {heatingTypeOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          {isOffice ? (
            <div className="admin-property-subsection admin-property-subsection--first">
              <h3>Datos específicos de oficina</h3>

              <p className="admin-property-form__check-help">
                Completa solo los datos que conozcas. Estos campos se
                guardan de forma estructurada para poder mostrar y filtrar
                correctamente oficinas y espacios de trabajo.
              </p>

              <div className="admin-property-form__grid">
                <label className="admin-property-form__field">
                  <span>Tipo de espacio</span>

                  <select
                    value={form.officeSpaceType}
                    onChange={(event) =>
                      updateForm(
                        'officeSpaceType',
                        event.target
                          .value as OfficeSpaceType | '',
                      )
                    }
                    disabled={isDeletingProperty}
                  >
                    <option value="">
                      Sin especificar
                    </option>

                    {officeSpaceTypeOptions.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="admin-property-form__field">
                  <span>
                    Superficie bruta alquilable (m²)
                  </span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.grossLeasableArea}
                    onChange={(event) =>
                      updateForm(
                        'grossLeasableArea',
                        event.target.value,
                      )
                    }
                    disabled={isDeletingProperty}
                  />
                </label>

                <label className="admin-property-form__field">
                  <span>
                    Superficie del puesto de trabajo (m²)
                  </span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.workstationArea}
                    onChange={(event) =>
                      updateForm(
                        'workstationArea',
                        event.target.value,
                      )
                    }
                    disabled={isDeletingProperty}
                  />

                  <small className="admin-property-form__helper">
                    Úsalo cuando el anuncio corresponda a un puesto
                    individual o espacio de trabajo.
                  </small>
                </label>

                <label className="admin-property-form__field">
                  <span>Uso del edificio</span>

                  <select
                    value={form.buildingUse}
                    onChange={(event) =>
                      updateForm(
                        'buildingUse',
                        event.target
                          .value as OfficeBuildingUse | '',
                      )
                    }
                    disabled={isDeletingProperty}
                  >
                    <option value="">
                      Sin especificar
                    </option>

                    {officeBuildingUseOptions.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="admin-property-form__field">
                  <span>
                    Nº de plantas del edificio
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.buildingFloorsCount}
                    onChange={(event) =>
                      updateForm(
                        'buildingFloorsCount',
                        event.target.value,
                      )
                    }
                    disabled={isDeletingProperty}
                  />
                </label>

                <label className="admin-property-form__field">
                  <span>
                    Nº de plantas de la oficina
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.officeFloorsCount}
                    onChange={(event) =>
                      updateForm(
                        'officeFloorsCount',
                        event.target.value,
                      )
                    }
                    disabled={isDeletingProperty}
                  />
                </label>

                <label className="admin-property-form__field">
                  <span>Nº de ascensores</span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.elevatorsCount}
                    onChange={(event) =>
                      updateForm(
                        'elevatorsCount',
                        event.target.value,
                      )
                    }
                    disabled={isDeletingProperty}
                  />

                  <small className="admin-property-form__helper">
                    Si indicas un número mayor que 0, activa también
                    la característica Ascensor.
                  </small>
                </label>

                <label className="admin-property-form__field">
                  <span>Disponible desde</span>

                  <input
                    type="date"
                    value={form.availableFrom}
                    onChange={(event) =>
                      updateForm(
                        'availableFrom',
                        event.target.value,
                      )
                    }
                    disabled={isDeletingProperty}
                  />

                  <small className="admin-property-form__helper">
                    Déjalo vacío si ya está disponible o no quieres
                    indicar una fecha concreta.
                  </small>
                </label>
              </div>

              <div className="admin-property-subsection">
                <h3>Certificaciones del edificio</h3>

                <div className="admin-property-form__checks">
                  {buildingCertificationOptions.map(
                    (certification) => (
                      <label
                        className="admin-property-form__check"
                        key={certification}
                      >
                        <input
                          type="checkbox"
                          checked={form.buildingCertifications.includes(
                            certification,
                          )}
                          onChange={(event) =>
                            updateForm(
                              'buildingCertifications',
                              event.target.checked
                                ? [
                                  ...form.buildingCertifications,
                                  certification,
                                ]
                                : form.buildingCertifications.filter(
                                  (item) =>
                                    item !== certification,
                                ),
                            )
                          }
                          disabled={isDeletingProperty}
                        />

                        <span>{certification}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <div className="admin-property-subsection">
            <h3>Características</h3>

            <div className="admin-property-form__checks">
              {[
                ['elevator', 'Ascensor'],
                ['terrace', 'Terraza'],
                ['furnished', 'Amueblado'],
              ].map(([key, label]) => {
                const field =
                  key as keyof Pick<
                    PropertyFormState,
                    | 'elevator'
                    | 'terrace'
                    | 'furnished'
                  >;

                return (
                  <label
                    className="admin-property-form__check"
                    key={key}
                  >
                    <input
                      type="checkbox"
                      checked={form[field]}
                      onChange={(event) =>
                        updateForm(
                          field,
                          event.target.checked,
                        )
                      }
                      disabled={isDeletingProperty}
                    />

                    <span>{label}</span>
                  </label>
                );
              })}

              {propertyAmenityGroups
                .flatMap(
                  (group) =>
                    group.options,
                )
                .map((feature) => (
                  <label
                    className="admin-property-form__check"
                    key={feature}
                  >
                    <input
                      type="checkbox"
                      checked={form.managedFeatures.includes(
                        feature,
                      )}
                      onChange={(event) =>
                        updateForm(
                          'managedFeatures',
                          event.target.checked
                            ? [
                              ...form.managedFeatures,
                              feature,
                            ]
                            : form.managedFeatures.filter(
                              (item) =>
                                item !== feature,
                            ),
                        )
                      }
                      disabled={isDeletingProperty}
                    />

                    <span>{feature}</span>
                  </label>
                ))}
            </div>

            <div className="admin-featured-controls">
              <label className="admin-property-form__check admin-featured-controls__toggle">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    updateForm(
                      'featured',
                      event.target.checked,
                    )
                  }
                  disabled={isDeletingProperty}
                />

                <span>
                  Destacado en la Home

                  <small>
                    Actívalo para mostrar este inmueble
                    en la selección de propiedades
                    destacadas de la Home.
                  </small>
                </span>
              </label>

              <label className="admin-property-form__field admin-featured-controls__position">
                <span>
                  Posición en destacados
                </span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={
                    form.featuredPosition
                  }
                  onChange={(event) =>
                    updateForm(
                      'featuredPosition',
                      event.target.value,
                    )
                  }
                  disabled={
                    !form.featured ||
                    isDeletingProperty
                  }
                  placeholder="Sin prioridad manual"
                />

                <small className="admin-property-form__helper">
                  1 = principal / grande. 2, 3, 4…
                  definen el orden de aparición en la
                  Home.
                </small>
              </label>
            </div>
          </div>

          <div className="admin-property-subsection">
            <h3>Garaje</h3>

            <div className="admin-property-form__checks">
              <label className="admin-property-form__check">
                <input
                  type="checkbox"
                  checked={form.parking}
                  onChange={(event) =>
                    updateForm(
                      'parking',
                      event.target.checked,
                    )
                  }
                  disabled={isDeletingProperty}
                />

                <span>Tiene garaje</span>
              </label>
            </div>

            <div className="admin-property-form__grid">
              <label className="admin-property-form__field">
                <span>Modalidad</span>

                <select
                  value={form.parkingType}
                  onChange={(event) =>
                    updateForm(
                      'parkingType',
                      event.target
                        .value as ParkingType | '',
                    )
                  }
                  disabled={
                    !form.parking ||
                    isDeletingProperty
                  }
                >
                  <option value="">
                    Sin especificar
                  </option>

                  {parkingTypeOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="admin-property-form__field">
                <span>
                  Número de plazas
                </span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.parkingSpaces}
                  onChange={(event) =>
                    updateForm(
                      'parkingSpaces',
                      event.target.value,
                    )
                  }
                  disabled={
                    !form.parking ||
                    isDeletingProperty
                  }
                />
              </label>
            </div>
          </div>

          <div className="admin-property-subsection">
            <h3>Orientación</h3>

            <div className="admin-property-form__checks">
              {orientationOptions.map(
                (option) => (
                  <label
                    className="admin-property-form__check"
                    key={option.value}
                  >
                    <input
                      type="checkbox"
                      checked={form.orientations.includes(
                        option.value,
                      )}
                      onChange={(event) =>
                        updateForm(
                          'orientations',
                          event.target.checked
                            ? [
                              ...form.orientations,
                              option.value,
                            ]
                            : form.orientations.filter(
                              (item) =>
                                item !==
                                option.value,
                            ),
                        )
                      }
                      disabled={isDeletingProperty}
                    />

                    <span>
                      {option.label}
                    </span>
                  </label>
                ),
              )}
            </div>
          </div>

          <p className="admin-property-form__check-help">
            {isOffice
              ? 'Los campos específicos de oficina son opcionales y permiten describir correctamente espacios profesionales sin mezclar datos residenciales.'
              : 'Los campos específicos de casas, chalets o fincas son opcionales y no impiden guardar otros tipos de inmueble.'}
          </p>
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>04</span>
            <h2>Información adicional</h2>
          </div>

          <div className="admin-property-subsection admin-property-subsection--first">
            <h3>Multimedia adicional</h3>

            <div className="admin-property-form__grid">
              <label className="admin-property-form__field">
                <span>Vídeo</span>

                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(event) =>
                    updateForm(
                      'videoUrl',
                      event.target.value,
                    )
                  }
                  disabled={isDeletingProperty}
                  placeholder="https://..."
                />

                <small className="admin-property-form__helper">
                  YouTube, Vimeo u otra URL pública
                  compatible.
                </small>
              </label>

              <label className="admin-property-form__field">
                <span>Visita virtual</span>

                <input
                  type="url"
                  value={form.virtualTourUrl}
                  onChange={(event) =>
                    updateForm(
                      'virtualTourUrl',
                      event.target.value,
                    )
                  }
                  disabled={isDeletingProperty}
                  placeholder="https://..."
                />

                <small className="admin-property-form__helper">
                  Matterport, tour virtual u otra URL
                  pública.
                </small>
              </label>
            </div>
          </div>

          <div className="admin-property-subsection">
            <h3>Gastos</h3>

            <div className="admin-property-form__grid">
              <label className="admin-property-form__field">
                <span>Comunidad (€)</span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.communityFeeAmount}
                  onChange={(event) =>
                    updateForm(
                      'communityFeeAmount',
                      event.target.value,
                    )
                  }
                  disabled={isDeletingProperty}
                />
              </label>

              <label className="admin-property-form__field">
                <span>Periodicidad</span>

                <select
                  value={form.communityFeePeriod}
                  onChange={(event) =>
                    updateForm(
                      'communityFeePeriod',
                      event.target
                        .value as CommunityFeePeriod | '',
                    )
                  }
                  disabled={isDeletingProperty}
                >
                  <option value="">
                    Sin especificar
                  </option>

                  {communityFeePeriodOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="admin-property-form__field">
                <span>IBI anual (€)</span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.ibiAnnualAmount}
                  onChange={(event) =>
                    updateForm(
                      'ibiAnnualAmount',
                      event.target.value,
                    )
                  }
                  disabled={isDeletingProperty}
                />
              </label>
            </div>
          </div>

          <div className="admin-property-subsection">
            <h3>Eficiencia energética</h3>

            <div className="admin-property-form__grid">
              <label className="admin-property-form__field">
                <span>
                  Estado del certificado
                </span>

                <select
                  value={form.energyCertificateStatus}
                  onChange={(event) =>
                    updateForm(
                      'energyCertificateStatus',
                      event.target
                        .value as EnergyCertificateStatus | '',
                    )
                  }
                  disabled={isDeletingProperty}
                >
                  <option value="">
                    Sin especificar
                  </option>

                  {energyCertificateStatusOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="admin-property-form__field">
                <span>Letra de consumo</span>

                <select
                  value={form.energyConsumptionRating}
                  onChange={(event) =>
                    updateForm(
                      'energyConsumptionRating',
                      event.target
                        .value as EnergyRating | '',
                    )
                  }
                  disabled={isDeletingProperty}
                >
                  <option value="">
                    Sin especificar
                  </option>

                  {energyRatingOptions.map(
                    (rating) => (
                      <option
                        key={rating}
                        value={rating}
                      >
                        {rating}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="admin-property-form__field">
                <span>
                  Consumo (kWh/m²/año)
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.energyConsumptionValue}
                  onChange={(event) =>
                    updateForm(
                      'energyConsumptionValue',
                      event.target.value,
                    )
                  }
                  disabled={isDeletingProperty}
                />
              </label>

              <label className="admin-property-form__field">
                <span>Letra de emisiones</span>

                <select
                  value={form.energyEmissionsRating}
                  onChange={(event) =>
                    updateForm(
                      'energyEmissionsRating',
                      event.target
                        .value as EnergyRating | '',
                    )
                  }
                  disabled={isDeletingProperty}
                >
                  <option value="">
                    Sin especificar
                  </option>

                  {energyRatingOptions.map(
                    (rating) => (
                      <option
                        key={rating}
                        value={rating}
                      >
                        {rating}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="admin-property-form__field">
                <span>
                  Emisiones (kg CO₂/m²/año)
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.energyEmissionsValue}
                  onChange={(event) =>
                    updateForm(
                      'energyEmissionsValue',
                      event.target.value,
                    )
                  }
                  disabled={isDeletingProperty}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="admin-property-form__section">
          <div>
            <span>05</span>
            <h2>Descripción</h2>
          </div>

          <label className="admin-property-form__field">
            <span>Descripción</span>

            <small className="admin-property-form__helper">
              Describe los puntos fuertes del inmueble,
              distribución, estado, ubicación y cualquier
              detalle relevante.
            </small>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateForm(
                  'description',
                  event.target.value,
                )
              }
              disabled={isDeletingProperty}
            />
          </label>

          <div className="admin-property-subsection">
            <h3>SEO</h3>

            <p className="admin-property-form__check-help">
              Opcional. Si lo dejas vacío, la web generará
              automáticamente los metadatos a partir del
              inmueble y su ubicación.
            </p>

            <div className="admin-property-form__grid">
              <label className="admin-property-form__field">
                <span>Título SEO</span>

                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(event) =>
                    updateForm(
                      'seoTitle',
                      event.target.value,
                    )
                  }
                  disabled={isDeletingProperty}
                  placeholder="Chalet en venta en Illescas, Toledo | Alvar Consultores"
                />

                <small className="admin-property-form__helper">
                  {form.seoTitle.length} caracteres ·
                  Recomendado: hasta 60 caracteres
                </small>
              </label>

              <label className="admin-property-form__field">
                <span>Meta descripción</span>

                <textarea
                  rows={4}
                  value={form.seoDescription}
                  onChange={(event) =>
                    updateForm(
                      'seoDescription',
                      event.target.value,
                    )
                  }
                  disabled={isDeletingProperty}
                  placeholder="Chalet en venta en Illescas, Toledo. Descubre características, precio, ubicación y solicita información a Alvar Consultores."
                />

                <small className="admin-property-form__helper">
                  {form.seoDescription.length} caracteres ·
                  Recomendado: 140–160 caracteres
                </small>
              </label>
            </div>
          </div>
        </section>
      </form>

      <section
        className="admin-images"
        aria-labelledby="admin-images-title"
      >
        <div className="admin-images__upload">
          <div>
            <span>FOTOGRAFÍAS</span>

            <h2 id="admin-images-title">
              Imágenes del inmueble
            </h2>

            <p>
              Sube las fotografías del inmueble y
              arrástralas para cambiar su orden. La
              imagen marcada como portada será la
              principal en el catálogo.
            </p>
          </div>

          <label>
            <span>
              {isUploading
                ? 'Subiendo fotografías...'
                : 'Añadir fotografías'}
            </span>

            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={
                isUploading ||
                isUploadingFloorplans ||
                isManaging ||
                isDeletingProperty
              }
              onChange={(event) => {
                const files = Array.from(
                  event.target.files ?? [],
                );

                event.target.value = '';

                void handleUpload(files);
              }}
            />

            <small>
              JPG, PNG, WEBP o AVIF · Máximo 10 MB
              por archivo
            </small>
          </label>
        </div>

        {isUploading ? (
          <p
            className="admin-images__status"
            aria-live="polite"
          >
            Subiendo fotografías...
          </p>
        ) : null}

        {imageError ? (
          <p
            className="admin-images__error"
            role="alert"
          >
            {imageError}
          </p>
        ) : null}

        {photos.length > 0 ? (
          <SortablePropertyMediaGrid
            items={photos}
            variant="photo"
            propertyTitle={property.title}
            disabled={
              isManaging ||
              isUploading ||
              isUploadingFloorplans ||
              isDeletingProperty
            }
            getImageUrl={getPublicImageUrl}
            onReorder={(orderedImages) =>
              void handleReorder(
                orderedImages as PropertyImage[],
              )
            }
            onMove={(
              index,
              direction,
              mediaItems,
            ) =>
              void handleMove(
                index,
                direction,
                mediaItems as PropertyImage[],
              )
            }
            onSetCover={(imageId) =>
              void handleSetCover(imageId)
            }
            onDelete={(image) =>
              void handleDelete(
                image as PropertyImage,
              )
            }
          />
        ) : (
          <p className="admin-images__empty">
            Todavía no hay fotografías para este
            inmueble.
          </p>
        )}
      </section>

      <section
        className="admin-images"
        aria-labelledby="admin-floorplans-title"
      >
        <div className="admin-images__upload">
          <div>
            <span>PLANOS</span>

            <h2 id="admin-floorplans-title">
              Planos del inmueble
            </h2>

            <p>
              Gestiona los planos por separado de la
              galería de fotografías.
            </p>
          </div>

          <label>
            <span>
              {isUploadingFloorplans
                ? 'Subiendo planos...'
                : 'Añadir planos'}
            </span>

            <input
              type="file"
              multiple
              accept={FLOORPLAN_ACCEPT}
              disabled={
                isUploading ||
                isUploadingFloorplans ||
                isManaging ||
                isDeletingProperty
              }
              onChange={(event) => {
                const files = Array.from(
                  event.target.files ?? [],
                );

                event.target.value = '';

                void handleFloorplanUpload(
                  files,
                );
              }}
            />

            <small>
              JPG, PNG o WEBP · Máximo 10 MB por archivo
            </small>
          </label>
        </div>

        {floorplanError ? (
          <p
            className="admin-images__error"
            role="alert"
          >
            {floorplanError}
          </p>
        ) : null}

        {floorplans.length ? (
          <SortablePropertyMediaGrid
            items={floorplans}
            variant="floorplan"
            propertyTitle={property.title}
            disabled={
              isManaging ||
              isUploading ||
              isUploadingFloorplans ||
              isDeletingProperty
            }
            getImageUrl={getPublicImageUrl}
            onReorder={(orderedImages) =>
              void handleReorder(
                orderedImages as PropertyImage[],
              )
            }
            onMove={(
              index,
              direction,
              mediaItems,
            ) =>
              void handleMove(
                index,
                direction,
                mediaItems as PropertyImage[],
              )
            }
            onSetCover={() => undefined}
            onDelete={(image) =>
              void handleDelete(
                image as PropertyImage,
              )
            }
          />
        ) : (
          <p className="admin-images__empty">
            Todavía no hay planos para este inmueble.
          </p>
        )}
      </section>

      <div className="admin-property-form">
        <section className="admin-property-form__section">
          <div>
            <span>06</span>
            <h2>Estado y publicación</h2>
          </div>

          <p className="admin-property-form__required-note">
            El estado determina si el inmueble aparece
            públicamente y en qué situación se encuentra
            la operación.
          </p>

          <div className="admin-property-form__checks">
            {statusOptions.map(
              ({ value, label }) => (
                <label
                  className="admin-property-form__check"
                  key={value}
                >
                  <input
                    type="radio"
                    form="admin-property-edit-form"
                    name="property-status"
                    value={value}
                    checked={
                      selectedStatus ===
                      value
                    }
                    disabled={isDeletingProperty}
                    onChange={() => {
                      setSelectedStatus(
                        value,
                      );

                      setSaveError('');
                      setSaveSuccess('');
                    }}
                  />

                  <span>{label}</span>
                </label>
              ),
            )}
          </div>

          <p className="admin-property-form__check-help">
            {statusDescriptions[selectedStatus]}
          </p>

          {(selectedStatus === 'published' ||
            selectedStatus === 'reserved' ||
            selectedStatus === 'sold' ||
            selectedStatus === 'rented') &&
          photos.length === 0 ? (
            <p className="admin-property-form__error">
              Para mostrar el inmueble en la web debes
              añadir al menos una fotografía.
            </p>
          ) : null}
        </section>

        {saveError ? (
          <p
            className="admin-property-form__error"
            role="alert"
          >
            {saveError}
          </p>
        ) : null}

        {saveSuccess ? (
          <p
            className="admin-images__status"
            aria-live="polite"
          >
            {saveSuccess}
          </p>
        ) : null}

        <div className="admin-property-form__actions">
          <button
            type="button"
            disabled={
              isSaving ||
              isDeletingProperty
            }
            onClick={handleResetData}
          >
            Deshacer cambios
          </button>

          <button
            type="submit"
            form="admin-property-edit-form"
            disabled={
              isSaving ||
              isUploading ||
              isUploadingFloorplans ||
              isManaging ||
              isDeletingProperty
            }
          >
            {isSaving
              ? 'Guardando...'
              : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <section
        className="admin-property-danger"
        aria-labelledby="admin-property-danger-title"
      >
        <div className="admin-property-danger__content">
          <div>
            <span>ACCIÓN PERMANENTE</span>

            <h2 id="admin-property-danger-title">
              Eliminar inmueble
            </h2>

            <p>
              Elimina definitivamente este inmueble y
              todas sus fotografías. Esta acción no se
              puede deshacer.
            </p>
          </div>

          <button
            type="button"
            className="admin-property-danger__button"
            disabled={
              isDeletingProperty ||
              isSaving ||
              isUploading ||
              isUploadingFloorplans ||
              isManaging
            }
            onClick={() =>
              void handleDeleteProperty()
            }
          >
            {isDeletingProperty
              ? 'Eliminando...'
              : 'Eliminar inmueble'}
          </button>
        </div>

        {deleteError ? (
          <p
            className="admin-property-form__error"
            role="alert"
          >
            {deleteError}
          </p>
        ) : null}
      </section>
    </main>
  );
}
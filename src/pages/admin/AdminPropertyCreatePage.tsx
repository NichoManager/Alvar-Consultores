import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminCurrentUser } from '../../components/admin/AdminCurrentUser';
import {
  communityFeePeriodOptions,
  energyRatingOptions,
  energyCertificateStatusOptions,
  heatingTypeOptions,
  orientationOptions,
  parkingTypeOptions,
  propertyAmenityGroups,
  propertyConditionOptions,
} from '../../data/propertyOptions';
import {
  FLOORPLAN_ACCEPT,
  uploadPropertyFloorplans,
  validateFloorplanFiles,
} from '../../lib/propertyMedia';
import { supabase } from '../../lib/supabase';
import '../../styles/admin.css';
import '../../styles/admin-property-enhancements.css';

function createSlug(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s-]+/g, '-');
}

function nullableText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim();
  return normalized || null;
}

function nullableNumber(value: FormDataEntryValue | null) {
  const normalized = String(value ?? '').trim();
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

const propertyTypes = ['Piso', 'Casa', 'Chalet', 'Ático', 'Dúplex', 'Estudio', 'Local', 'Oficina', 'Terreno', 'Otro'];

export function AdminPropertyCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [floorplans, setFloorplans] = useState<Array<{ file: File; preview: string }>>([]);
  const floorplanPreviewsRef = useRef<string[]>([]);

  useEffect(() => {
    floorplanPreviewsRef.current = floorplans.map(({ preview }) => preview);
  }, [floorplans]);

  useEffect(() => () => {
    floorplanPreviewsRef.current.forEach((preview) => URL.revokeObjectURL(preview));
  }, []);

  const addFloorplans = (files: File[]) => {
    const result = validateFloorplanFiles(files);
    setError(result.errors.join(' '));
    setFloorplans((current) => [...current, ...result.validFiles.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
  };

  const removeFloorplan = (index: number) => {
    setFloorplans((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') ?? '').trim();
    const city = String(formData.get('city') ?? '').trim();
    const slug = createSlug(title);
    const price = nullableNumber(formData.get('price'));
    const hasParking = formData.has('parking');
    const exposure = String(formData.get('exposure') ?? '');
    const communityFeeAmount = nullableNumber(formData.get('community_fee_amount'));

    if (!slug || price === null) {
      setError('Revisa el título y el precio antes de guardar el inmueble.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const { data: createdProperty, error: insertError } = await supabase.from('properties').insert({
        reference: nullableText(formData.get('reference')),
        title,
        slug,
        operation: String(formData.get('operation')),
        property_type: String(formData.get('property_type')),
        status: 'draft',
        price,
        currency: 'EUR',
        city,
        area: nullableText(formData.get('area')),
        postal_code: nullableText(formData.get('postal_code')),
        address: nullableText(formData.get('address')),
        show_exact_address: formData.has('show_exact_address'),
        bedrooms: nullableNumber(formData.get('bedrooms')),
        bathrooms: nullableNumber(formData.get('bathrooms')),
        built_area: nullableNumber(formData.get('built_area')),
        usable_area: nullableNumber(formData.get('usable_area')),
        plot_area: nullableNumber(formData.get('plot_area')),
        floor: nullableText(formData.get('floor')),
        floors_count: nullableNumber(formData.get('floors_count')),
        construction_year: nullableNumber(formData.get('construction_year')),
        property_condition: nullableText(formData.get('property_condition')),
        orientations: formData.getAll('orientations').map(String),
        heating_type: nullableText(formData.get('heating_type')),
        elevator: formData.has('elevator'),
        parking: hasParking,
        parking_type: hasParking ? nullableText(formData.get('parking_type')) : null,
        parking_spaces: hasParking ? nullableNumber(formData.get('parking_spaces')) : null,
        terrace: formData.has('terrace'),
        furnished: formData.has('furnished'),
        exterior: exposure === 'exterior',
        video_url: nullableText(formData.get('video_url')),
        virtual_tour_url: nullableText(formData.get('virtual_tour_url')),
        community_fee_amount: communityFeeAmount,
        community_fee_period: communityFeeAmount !== null ? nullableText(formData.get('community_fee_period')) : null,
        ibi_annual_amount: nullableNumber(formData.get('ibi_annual_amount')),
        energy_certificate_status: nullableText(formData.get('energy_certificate_status')),
        energy_consumption_rating: nullableText(formData.get('energy_consumption_rating')),
        energy_consumption_value: nullableNumber(formData.get('energy_consumption_value')),
        energy_emissions_rating: nullableText(formData.get('energy_emissions_rating')),
        energy_emissions_value: nullableNumber(formData.get('energy_emissions_value')),
        features: [...formData.getAll('features').map(String), ...(exposure === 'interior' ? ['Interior'] : [])],
        description: String(formData.get('description') ?? '').trim(),
        featured: formData.has('featured'),
        published_at: null,
      }).select('id').single();

      if (insertError) {
        console.error('Error creating property:', insertError);
        setError('No se ha podido guardar el inmueble. Revisa los datos o inténtalo de nuevo.');
        return;
      }

      const uploadResult = await uploadPropertyFloorplans({
        propertyId: createdProperty.id,
        propertyTitle: title,
        propertyCity: city,
        files: floorplans.map(({ file }) => file),
        startPosition: 0,
      });

      navigate(`/admin/inmuebles/${createdProperty.id}/editar`, {
        replace: true,
        state: uploadResult.errors.length ? { floorplanUploadWarning: uploadResult.errors.join(' ') } : undefined,
      });
    } catch (unexpectedError) {
      console.error('Unexpected property creation error:', unexpectedError);
      setError('No se ha podido guardar el inmueble. Inténtalo de nuevo en unos minutos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-property-form-page">
      <header className="admin-property-form__header">
        <div className="admin-property-form__header-inner">
          <div className="admin-property-form__header-top">
            <button type="button" className="admin-property-form__back" onClick={() => navigate('/admin/inmuebles')}><span aria-hidden="true">←</span> Volver a inmuebles</button>
            <div className="admin-header-session"><AdminCurrentUser /><button type="button" onClick={handleLogout}>Cerrar sesión</button></div>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-site-link" aria-label="Abrir la web pública de Alvar Consultores en una nueva pestaña">ALVAR CONSULTORES <span aria-hidden="true">↗</span></a>
          <h1>Nuevo inmueble</h1>
          <p>Añade la información, características y planos. Después podrás incorporar fotografías y revisar el inmueble antes de publicarlo.</p>
        </div>
      </header>

      <form className="admin-property-form" onSubmit={handleSubmit}>
        <p className="admin-property-form__required-note">Los campos marcados con * son obligatorios.</p>

        <section className="admin-property-form__section">
          <div><span>01</span><h2>Datos principales</h2></div>
          <div className="admin-property-form__grid">
            <label className="admin-property-form__field"><span>Operación *</span><select name="operation" defaultValue="venta" required><option value="venta">Venta</option><option value="alquiler">Alquiler</option></select></label>
            <label className="admin-property-form__field"><span>Tipo de inmueble *</span><select name="property_type" defaultValue="Piso" required>{propertyTypes.map((type) => <option value={type} key={type}>{type}</option>)}</select></label>
            <label className="admin-property-form__field"><span>Título *</span><input type="text" name="title" placeholder="Ej. Piso luminoso con terraza en Pinto" required /></label>
            <label className="admin-property-form__field"><span>Referencia</span><input type="text" name="reference" placeholder="Ej. ALV-001" /></label>
            <label className="admin-property-form__field"><span>Precio *</span><span className="admin-property-form__input-suffix"><input type="number" name="price" min="0" step="0.01" required /><span aria-hidden="true">€</span></span></label>
            <div className="admin-property-form__status" aria-label="Estado: Borrador"><span>Estado</span><strong>Borrador</strong><small>No aparecerá en la web hasta que lo publiques desde la edición del inmueble.</small></div>
          </div>
        </section>

        <section className="admin-property-form__section">
          <div><span>02</span><h2>Ubicación</h2></div>
          <div className="admin-property-form__grid">
            <label className="admin-property-form__field"><span>Ciudad *</span><input type="text" name="city" placeholder="Madrid" required /></label>
            <label className="admin-property-form__field"><span>Zona / barrio</span><input type="text" name="area" placeholder="Ej. Ríos Rosas" /></label>
            <label className="admin-property-form__field"><span>Dirección</span><input type="text" name="address" placeholder="Ej. Calle ..." /></label>
            <label className="admin-property-form__field"><span>Código postal</span><input type="text" name="postal_code" inputMode="numeric" placeholder="Ej. 28003" /></label>
          </div>
          <label className="admin-property-form__check admin-property-form__privacy-check"><input type="checkbox" name="show_exact_address" /><span>Mostrar dirección exacta en la web<small>Actívalo solo si quieres que la ubicación exacta del inmueble sea pública.</small></span></label>
        </section>

        <section className="admin-property-form__section">
          <div><span>03</span><h2>Datos del inmueble</h2></div>
          <div className="admin-property-form__grid">
            <label className="admin-property-form__field"><span>Dormitorios</span><input type="number" name="bedrooms" min="0" step="1" /></label>
            <label className="admin-property-form__field"><span>Baños</span><input type="number" name="bathrooms" min="0" step="1" /></label>
            <label className="admin-property-form__field"><span>Superficie construida (m²)</span><input type="number" name="built_area" min="0" step="0.01" /></label>
            <label className="admin-property-form__field"><span>Superficie útil (m²)</span><input type="number" name="usable_area" min="0" step="0.01" /></label>
            <label className="admin-property-form__field"><span>Superficie de parcela (m²)</span><input type="number" name="plot_area" min="0" step="0.01" /></label>
            <label className="admin-property-form__field"><span>Planta</span><input type="text" name="floor" /></label>
            <label className="admin-property-form__field"><span>Número de plantas</span><input type="number" name="floors_count" min="1" step="1" /></label>
            <label className="admin-property-form__field"><span>Año de construcción</span><input type="number" name="construction_year" min="1800" max="2200" step="1" /></label>
            <label className="admin-property-form__field"><span>Estado</span><select name="property_condition" defaultValue=""><option value="">Sin especificar</option>{propertyConditionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="admin-property-form__field"><span>Exterior / interior</span><select name="exposure" defaultValue=""><option value="">Sin especificar</option><option value="exterior">Exterior</option><option value="interior">Interior</option></select></label>
            <label className="admin-property-form__field"><span>Calefacción</span><select name="heating_type" defaultValue=""><option value="">Sin especificar</option>{heatingTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          </div>

          <div className="admin-property-subsection"><h3>Características</h3><div className="admin-property-form__checks">
            <label className="admin-property-form__check"><input type="checkbox" name="elevator" /><span>Ascensor</span></label>
            <label className="admin-property-form__check"><input type="checkbox" name="terrace" /><span>Terraza</span></label>
            <label className="admin-property-form__check"><input type="checkbox" name="furnished" /><span>Amueblado</span></label>
            <label className="admin-property-form__check"><input type="checkbox" name="featured" /><span>Destacado</span></label>
            {propertyAmenityGroups.flatMap((group) => group.options).map((feature) => <label className="admin-property-form__check" key={feature}><input type="checkbox" name="features" value={feature} /><span>{feature}</span></label>)}
          </div></div>

          <div className="admin-property-subsection"><h3>Garaje</h3><div className="admin-property-form__checks"><label className="admin-property-form__check"><input type="checkbox" name="parking" /><span>Tiene garaje</span></label></div><div className="admin-property-form__grid">
            <label className="admin-property-form__field"><span>Modalidad</span><select name="parking_type" defaultValue=""><option value="">Sin especificar</option>{parkingTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="admin-property-form__field"><span>Número de plazas</span><input type="number" name="parking_spaces" min="1" step="1" /></label>
          </div></div>

          <div className="admin-property-subsection"><h3>Orientación</h3><div className="admin-property-form__checks">{orientationOptions.map((option) => <label className="admin-property-form__check" key={option.value}><input type="checkbox" name="orientations" value={option.value} /><span>{option.label}</span></label>)}</div></div>

          <p className="admin-property-form__check-help">Los campos específicos de casas, chalets o fincas son opcionales y no impiden guardar otros tipos de inmueble.</p>
        </section>

        <section className="admin-property-form__section">
          <div><span>04</span><h2>Información adicional</h2></div>

          <div className="admin-property-subsection admin-property-subsection--first"><h3>Multimedia adicional</h3><div className="admin-property-form__grid">
            <label className="admin-property-form__field"><span>Vídeo</span><input type="url" name="video_url" placeholder="https://..." /><small className="admin-property-form__helper">YouTube, Vimeo u otra URL pública compatible.</small></label>
            <label className="admin-property-form__field"><span>Visita virtual</span><input type="url" name="virtual_tour_url" placeholder="https://..." /><small className="admin-property-form__helper">Matterport, tour virtual u otra URL pública.</small></label>
          </div></div>

          <div className="admin-property-subsection"><h3>Gastos</h3><div className="admin-property-form__grid">
            <label className="admin-property-form__field"><span>Comunidad (€)</span><input type="number" name="community_fee_amount" min="0" step="0.01" /></label>
            <label className="admin-property-form__field"><span>Periodicidad</span><select name="community_fee_period" defaultValue=""><option value="">Sin especificar</option>{communityFeePeriodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="admin-property-form__field"><span>IBI anual (€)</span><input type="number" name="ibi_annual_amount" min="0" step="0.01" /></label>
          </div></div>

          <div className="admin-property-subsection"><h3>Eficiencia energética</h3><div className="admin-property-form__grid">
            <label className="admin-property-form__field"><span>Estado del certificado</span><select name="energy_certificate_status" defaultValue=""><option value="">Sin especificar</option>{energyCertificateStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="admin-property-form__field"><span>Letra de consumo</span><select name="energy_consumption_rating" defaultValue=""><option value="">Sin especificar</option>{energyRatingOptions.map((rating) => <option key={rating} value={rating}>{rating}</option>)}</select></label>
            <label className="admin-property-form__field"><span>Consumo (kWh/m²/año)</span><input type="number" name="energy_consumption_value" min="0" step="0.01" /></label>
            <label className="admin-property-form__field"><span>Letra de emisiones</span><select name="energy_emissions_rating" defaultValue=""><option value="">Sin especificar</option>{energyRatingOptions.map((rating) => <option key={rating} value={rating}>{rating}</option>)}</select></label>
            <label className="admin-property-form__field"><span>Emisiones (kg CO₂/m²/año)</span><input type="number" name="energy_emissions_value" min="0" step="0.01" /></label>
          </div></div>
        </section>

        <section className="admin-property-form__section">
          <div><span>05</span><h2>Planos</h2></div>
          <div className="admin-floorplans-editor">
            <label className="admin-floorplans-editor__picker"><span>Añadir planos</span><input type="file" multiple accept={FLOORPLAN_ACCEPT} onChange={(event) => { addFloorplans(Array.from(event.target.files ?? [])); event.target.value = ''; }} /><small>JPG, PNG o WEBP · Máximo 10 MB por archivo</small></label>
            {floorplans.length ? <div className="admin-floorplans-editor__grid">{floorplans.map((floorplan, index) => <article key={floorplan.preview}><img src={floorplan.preview} alt={`Vista previa del plano ${index + 1}`} /><div><span>Plano {index + 1}</span><button type="button" onClick={() => removeFloorplan(index)}>Eliminar</button></div></article>)}</div> : <p className="admin-images__empty">Puedes añadir los planos ahora o desde la edición del inmueble.</p>}
          </div>
        </section>

        <section className="admin-property-form__section">
          <div><span>06</span><h2>Descripción</h2></div>
          <label className="admin-property-form__field"><span>Descripción</span><small className="admin-property-form__helper">Describe los puntos fuertes del inmueble, distribución, estado, ubicación y cualquier detalle relevante.</small><textarea name="description" rows={8} required /></label>
        </section>

        {error ? <p className="admin-property-form__error" role="alert">{error}</p> : null}
        <div className="admin-property-form__actions"><button type="button" onClick={() => navigate('/admin/inmuebles')} disabled={isSubmitting}>Cancelar</button><button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar y continuar →'}</button></div>
      </form>
    </main>
  );
}
